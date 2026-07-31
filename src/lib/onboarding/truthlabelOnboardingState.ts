"use client";

import { getSupabaseBrowserClient } from "@/lib/auth/supabaseClient";

export type OnboardingInstallPromptOutcome =
  | "accepted"
  | "dismissed"
  | "deferred"
  | "manual_confirmed"
  | "unsupported"
  | "already_installed";

export type OnboardingAppInstallStatus =
  | "unknown"
  | "not_installed"
  | "installed"
  | "manual_confirmed"
  | "unsupported";

export type TruthlabelOnboardingState = {
  currentOnboardingStep: number;
  onboardingStartedAt: string | null;
  onboardingCompletedAt: string | null;
  allergySetupCompleted: boolean;
  installPromptSeen: boolean;
  installPromptOutcome: OnboardingInstallPromptOutcome | null;
  appInstallStatus: OnboardingAppInstallStatus | null;
};

export type TruthlabelOnboardingPatch = Partial<TruthlabelOnboardingState>;

const onboardingStoragePrefix = "truthlabel.onboarding.";

export const defaultOnboardingState: TruthlabelOnboardingState = {
  currentOnboardingStep: 1,
  onboardingStartedAt: null,
  onboardingCompletedAt: null,
  allergySetupCompleted: false,
  installPromptSeen: false,
  installPromptOutcome: null,
  appInstallStatus: "unknown",
};

function getStorageKey(userId: string) {
  return `${onboardingStoragePrefix}${userId || "anonymous"}`;
}

function clampStep(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : 1;

  if (!Number.isFinite(numericValue)) {
    return 1;
  }

  return Math.min(4, Math.max(1, numericValue));
}

function cleanTimestamp(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isInstallOutcome(
  value: unknown,
): value is OnboardingInstallPromptOutcome {
  return (
    value === "accepted" ||
    value === "dismissed" ||
    value === "deferred" ||
    value === "manual_confirmed" ||
    value === "unsupported" ||
    value === "already_installed"
  );
}

function isInstallStatus(value: unknown): value is OnboardingAppInstallStatus {
  return (
    value === "unknown" ||
    value === "not_installed" ||
    value === "installed" ||
    value === "manual_confirmed" ||
    value === "unsupported"
  );
}

export function normalizeOnboardingState(
  value: unknown,
): TruthlabelOnboardingState {
  const rawValue =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    currentOnboardingStep: clampStep(
      rawValue.currentOnboardingStep ?? rawValue.current_onboarding_step,
    ),
    onboardingStartedAt: cleanTimestamp(
      rawValue.onboardingStartedAt ?? rawValue.onboarding_started_at,
    ),
    onboardingCompletedAt: cleanTimestamp(
      rawValue.onboardingCompletedAt ?? rawValue.onboarding_completed_at,
    ),
    allergySetupCompleted: Boolean(
      rawValue.allergySetupCompleted ?? rawValue.allergy_setup_completed,
    ),
    installPromptSeen: Boolean(
      rawValue.installPromptSeen ?? rawValue.install_prompt_seen,
    ),
    installPromptOutcome: isInstallOutcome(
      rawValue.installPromptOutcome ?? rawValue.install_prompt_outcome,
    )
      ? ((rawValue.installPromptOutcome ??
          rawValue.install_prompt_outcome) as OnboardingInstallPromptOutcome)
      : null,
    appInstallStatus: isInstallStatus(
      rawValue.appInstallStatus ?? rawValue.app_install_status,
    )
      ? ((rawValue.appInstallStatus ??
          rawValue.app_install_status) as OnboardingAppInstallStatus)
      : "unknown",
  };
}

function readLocalOnboardingState(userId: string) {
  if (typeof window === "undefined") {
    return defaultOnboardingState;
  }

  try {
    const storedValue = window.localStorage.getItem(getStorageKey(userId));

    if (!storedValue) {
      return defaultOnboardingState;
    }

    return normalizeOnboardingState(JSON.parse(storedValue));
  } catch {
    return defaultOnboardingState;
  }
}

function writeLocalOnboardingState(
  userId: string,
  state: TruthlabelOnboardingState,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  } catch {
    // Onboarding can continue with in-memory state if storage is blocked.
  }
}

function toSupabasePayload(state: TruthlabelOnboardingState) {
  return {
    current_onboarding_step: state.currentOnboardingStep,
    onboarding_started_at: state.onboardingStartedAt,
    onboarding_completed_at: state.onboardingCompletedAt,
    allergy_setup_completed: state.allergySetupCompleted,
    install_prompt_seen: state.installPromptSeen,
    install_prompt_outcome: state.installPromptOutcome,
    app_install_status: state.appInstallStatus,
    updated_at: new Date().toISOString(),
  };
}

function fromSupabaseRow(value: unknown) {
  return normalizeOnboardingState(value);
}

function mergePatch(
  currentState: TruthlabelOnboardingState,
  patch: TruthlabelOnboardingPatch,
) {
  return normalizeOnboardingState({
    ...currentState,
    ...patch,
  });
}

export function hasCompletedOnboarding(userId: string) {
  return Boolean(readLocalOnboardingState(userId).onboardingCompletedAt);
}

export async function loadOnboardingState(userId: string) {
  const localState = readLocalOnboardingState(userId);
  const supabase = getSupabaseBrowserClient();

  if (!supabase || !userId) {
    return localState;
  }

  try {
    const { data, error } = await supabase
      .from("user_settings")
      .select(
        "current_onboarding_step, onboarding_started_at, onboarding_completed_at, allergy_setup_completed, install_prompt_seen, install_prompt_outcome, app_install_status",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return localState;
    }

    const remoteState = fromSupabaseRow(data);
    const resolvedState = remoteState.onboardingStartedAt
      ? remoteState
      : localState;

    writeLocalOnboardingState(userId, resolvedState);
    return resolvedState;
  } catch {
    return localState;
  }
}

export async function saveOnboardingState(
  userId: string,
  patch: TruthlabelOnboardingPatch,
) {
  const currentState = readLocalOnboardingState(userId);
  const nextState = mergePatch(currentState, patch);
  const supabase = getSupabaseBrowserClient();

  writeLocalOnboardingState(userId, nextState);

  if (!supabase || !userId) {
    return nextState;
  }

  try {
    await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          ...toSupabasePayload(nextState),
        },
        { onConflict: "user_id" },
      );
  } catch {
    // Missing migration or network errors should not block onboarding.
  }

  return nextState;
}

export async function startOnboarding(userId: string) {
  const currentState = readLocalOnboardingState(userId);

  if (currentState.onboardingStartedAt) {
    return currentState;
  }

  return saveOnboardingState(userId, {
    currentOnboardingStep: 1,
    onboardingStartedAt: new Date().toISOString(),
  });
}

export async function completeOnboarding(
  userId: string,
  patch: TruthlabelOnboardingPatch = {},
) {
  return saveOnboardingState(userId, {
    currentOnboardingStep: 4,
    onboardingCompletedAt: new Date().toISOString(),
    ...patch,
  });
}
