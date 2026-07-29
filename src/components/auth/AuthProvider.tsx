"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
  getAccessKind,
  getAccessState,
  getTrialDaysRemaining,
  type AccessKind,
  type AccessState,
  type TruthlabelSubscription,
  type TruthlabelTrialAccess,
} from "@/lib/auth/access";
import { getSupabaseBrowserClient } from "@/lib/auth/supabaseClient";
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

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
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

  const refreshAccess = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      setErrorMessage("Supabase is not configured for this deployment.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setSubscription(null);
        setTrialAccess(null);
        return;
      }

      await ensureUserSettingsRow(currentUser.id);
      const [nextSubscription, nextTrialAccess] = await Promise.all([
        loadSubscription(currentUser.id),
        loadTrialAccess(currentUser.id),
      ]);
      setSubscription(nextSubscription);
      setTrialAccess(nextTrialAccess);
    } catch (error) {
      setSubscription(null);
      setTrialAccess(null);
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
      setUser(nextUser);
      setIsLoading(true);

      if (!nextUser) {
        setSubscription(null);
        setTrialAccess(null);
        setIsLoading(false);
        return;
      }

      void ensureUserSettingsRow(nextUser.id)
        .then(() =>
          Promise.all([
            loadSubscription(nextUser.id),
            loadTrialAccess(nextUser.id),
          ]),
        )
        .then(([nextSubscription, nextTrialAccess]) => {
          setSubscription(nextSubscription);
          setTrialAccess(nextTrialAccess);
          setErrorMessage("");
        })
        .catch((error: unknown) => {
          setSubscription(null);
          setTrialAccess(null);
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
        if (!supabase) {
          return;
        }

        await supabase.auth.signOut();
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
