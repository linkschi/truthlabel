"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
  getAccessKind,
  getAccessState,
  getTrialDaysRemaining,
  hasPaidAccess,
  type AccessKind,
  type AccessState,
  type TruthlabelSubscription,
  type TruthlabelTrialAccess,
} from "@/lib/auth/access";
import { publicAppConfig } from "@/lib/appConfig";
import { trackTruthlabelEvent } from "@/lib/analytics/analyticsClient";
import { normalizeAnalyticsError } from "@/lib/analytics/analyticsEvents";
import { clearMvpActivationAccess } from "@/lib/auth/mvpActivationAccess";
import { getSupabaseBrowserClient } from "@/lib/auth/supabaseClient";
import {
  safeLocalStorageGetItem,
  safeLocalStorageRemoveItem,
  safeLocalStorageSetItem,
} from "@/lib/browserStorage";
import { getUserSettings } from "@/lib/userSettings/userSettingsStorage";

type AuthContextValue = {
  accessState: AccessState;
  accessKind: AccessKind;
  user: User | null;
  subscription: TruthlabelSubscription | null;
  trialAccess: TruthlabelTrialAccess | null;
  trialDaysRemaining: number;
  isConfigured: boolean;
  errorMessage: string;
  refreshAccess: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const activeAccessCachePrefix = "truthlabel.accountAccess.active.";

type CachedAccountAccess = {
  userId: string;
  subscription: TruthlabelSubscription;
  trialAccess: TruthlabelTrialAccess | null;
  cachedAt: string;
};

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function getActiveAccessCacheKey(userId: string) {
  return `${activeAccessCachePrefix}${userId}`;
}

function isCachedAccountAccess(value: unknown): value is CachedAccountAccess {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Partial<CachedAccountAccess>;

  return Boolean(
    record.userId &&
      record.subscription &&
      typeof record.subscription === "object" &&
      hasPaidAccess(record.subscription),
  );
}

function readCachedAccountAccess(userId: string) {
  const rawValue = safeLocalStorageGetItem(getActiveAccessCacheKey(userId));

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isCachedAccountAccess(parsedValue) || parsedValue.userId !== userId) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

function saveCachedAccountAccess(
  userId: string,
  subscription: TruthlabelSubscription | null,
  trialAccess: TruthlabelTrialAccess | null,
) {
  if (!subscription || !hasPaidAccess(subscription)) {
    safeLocalStorageRemoveItem(getActiveAccessCacheKey(userId));
    return;
  }

  safeLocalStorageSetItem(
    getActiveAccessCacheKey(userId),
    JSON.stringify({
      userId,
      subscription,
      trialAccess,
      cachedAt: new Date().toISOString(),
    } satisfies CachedAccountAccess),
  );
}

async function ensureUserSettingsRow(userId: string) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return;
  }

  const { data: existingSettings, error: readError } = await supabase
    .from("user_settings")
    .select("local_settings_migrated")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existingSettings?.local_settings_migrated) {
    return;
  }

  const localSettings = getUserSettings();
  const selectedAllergens = uniqueStrings([
    ...localSettings.allergyProfile.allergens,
    ...localSettings.allergyProfile.customAllergens,
  ]);

  const payload = {
    user_id: userId,
    selected_allergens: selectedAllergens,
    local_settings_migrated: true,
  };

  const { error: writeError } = existingSettings
    ? await supabase
        .from("user_settings")
        .update(payload)
        .eq("user_id", userId)
    : await supabase.from("user_settings").insert(payload);

  if (writeError) {
    throw writeError;
  }
}

async function loadSubscription(userId: string) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, access_ends_at, last_verified_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as TruthlabelSubscription | null;
}

function isMissingRelationError(error: { code?: string; message?: string }) {
  return (
    error.code === "42P01" ||
    error.message?.toLowerCase().includes("trial_access") === true
  );
}

async function loadTrialAccess(userId: string) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("trial_access")
    .select("trial_started_at, trial_ends_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) {
      return null;
    }

    throw error;
  }

  return (data ?? null) as TruthlabelTrialAccess | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] =
    useState<TruthlabelSubscription | null>(null);
  const [trialAccess, setTrialAccess] =
    useState<TruthlabelTrialAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const supabase = getSupabaseBrowserClient();
  const currentUserRef = useRef<User | null>(null);
  const allowSignedInMvpAccess = publicAppConfig.flags.enableSignedInMvpAccess;

  const refreshAccess = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      setErrorMessage("Supabase is not configured for this deployment.");
      trackTruthlabelEvent("access_check_failed", {
        error_type: "configuration_error",
        source: "auth_provider",
        signed_in: Boolean(currentUserRef.current),
      });
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    let currentUser: User | null = currentUserRef.current;

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      currentUser = data.session?.user ?? null;
      currentUserRef.current = currentUser;
      setUser(currentUser);

      if (!currentUser) {
        setSubscription(null);
        setTrialAccess(null);
        return;
      }

      await ensureUserSettingsRow(currentUser.id).catch(() => undefined);
      const [nextSubscription, nextTrialAccess] = await Promise.all([
        loadSubscription(currentUser.id),
        loadTrialAccess(currentUser.id),
      ]);
      setSubscription(nextSubscription);
      setTrialAccess(nextTrialAccess);
      saveCachedAccountAccess(
        currentUser.id,
        nextSubscription,
        nextTrialAccess,
      );
    } catch (error) {
      let cachedFallbackUsed = false;

      if (currentUser) {
        const cachedAccess = readCachedAccountAccess(currentUser.id);

        if (cachedAccess) {
          cachedFallbackUsed = true;
          setUser(currentUser);
          currentUserRef.current = currentUser;
          setSubscription(cachedAccess.subscription);
          setTrialAccess(cachedAccess.trialAccess);
          trackTruthlabelEvent(
            "access_cached_fallback_used",
            {
              source: "refresh_access",
              access_status: cachedAccess.subscription.status,
            },
            { userId: currentUser.id },
          );
        }
      }

      trackTruthlabelEvent(
        "access_check_failed",
        {
          error_type: normalizeAnalyticsError(error),
          source: "refresh_access",
          signed_in: Boolean(currentUser),
          cached_fallback_used: cachedFallbackUsed,
        },
        { userId: currentUser?.id },
      );
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Truthlabel could not check account access.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const refreshHandle = window.setTimeout(() => {
      void refreshAccess();
    }, 0);

    if (!supabase) {
      return () => window.clearTimeout(refreshHandle);
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      currentUserRef.current = nextUser;
      setUser(nextUser);
      setIsLoading(true);

      if (!nextUser) {
        setSubscription(null);
        setTrialAccess(null);
        setIsLoading(false);
        return;
      }

      void ensureUserSettingsRow(nextUser.id)
        .catch(() => undefined)
        .then(() =>
          Promise.all([
            loadSubscription(nextUser.id),
            loadTrialAccess(nextUser.id),
          ]),
        )
        .then(([nextSubscription, nextTrialAccess]) => {
          setSubscription(nextSubscription);
          setTrialAccess(nextTrialAccess);
          saveCachedAccountAccess(
            nextUser.id,
            nextSubscription,
            nextTrialAccess,
          );
          setErrorMessage("");
        })
        .catch((error: unknown) => {
          const cachedAccess = readCachedAccountAccess(nextUser.id);
          let cachedFallbackUsed = false;

          if (cachedAccess) {
            cachedFallbackUsed = true;
            setSubscription(cachedAccess.subscription);
            setTrialAccess(cachedAccess.trialAccess);
            trackTruthlabelEvent(
              "access_cached_fallback_used",
              {
                source: "auth_state_change",
                access_status: cachedAccess.subscription.status,
              },
              { userId: nextUser.id },
            );
          }

          trackTruthlabelEvent(
            "access_check_failed",
            {
              error_type: normalizeAnalyticsError(error),
              source: "auth_state_change",
              signed_in: true,
              cached_fallback_used: cachedFallbackUsed,
            },
            { userId: nextUser.id },
          );
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Truthlabel could not refresh account access.",
          );
        })
        .finally(() => setIsLoading(false));
    });

    return () => {
      window.clearTimeout(refreshHandle);
      data.subscription.unsubscribe();
    };
  }, [refreshAccess, supabase]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const refreshStoredSession = () => {
      void refreshAccess();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshStoredSession();
      }
    };

    window.addEventListener("focus", refreshStoredSession);
    window.addEventListener("online", refreshStoredSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = window.setInterval(refreshStoredSession, 10 * 60 * 1000);

    return () => {
      window.removeEventListener("focus", refreshStoredSession);
      window.removeEventListener("online", refreshStoredSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [refreshAccess, supabase]);

  const accessState = getAccessState({
    authLoading: isLoading,
    userPresent: Boolean(user),
    subscription,
    trialAccess,
    allowSignedInMvpAccess,
  });
  const accessKind = getAccessKind({ subscription, trialAccess });
  const trialDaysRemaining = getTrialDaysRemaining(trialAccess);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessState,
      accessKind,
      user,
      subscription,
      trialAccess,
      trialDaysRemaining,
      isConfigured: Boolean(supabase),
      errorMessage,
      refreshAccess,
      signOut: async () => {
        clearMvpActivationAccess();
        const signedOutUserId = user?.id;

        if (!supabase) {
          if (signedOutUserId) {
            safeLocalStorageRemoveItem(getActiveAccessCacheKey(signedOutUserId));
          }
          return;
        }

        await supabase.auth.signOut();
        if (signedOutUserId) {
          safeLocalStorageRemoveItem(getActiveAccessCacheKey(signedOutUserId));
        }
        currentUserRef.current = null;
        setUser(null);
        setSubscription(null);
        setTrialAccess(null);
      },
    }),
    [
      accessKind,
      accessState,
      errorMessage,
      refreshAccess,
      subscription,
      supabase,
      trialAccess,
      trialDaysRemaining,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useTruthlabelAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useTruthlabelAuth must be used within AuthProvider.");
  }

  return value;
}
