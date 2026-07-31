const thiislincornReplayStoragePrefix =
  "truthlabel.onboarding.thiislincornReplayShown.";

function canUseSessionStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

function getReplayStorageKey(userId: string) {
  return `${thiislincornReplayStoragePrefix}${userId || "anonymous"}`;
}

export function isThiislincornOnboardingTestAccount(
  email?: string | null,
) {
  return Boolean(email?.toLowerCase().includes("thiislincorn"));
}

export function hasSeenThiislincornOnboardingReplay(userId: string) {
  if (!canUseSessionStorage()) {
    return false;
  }

  try {
    return window.sessionStorage.getItem(getReplayStorageKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function markThiislincornOnboardingReplaySeen(userId: string) {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(getReplayStorageKey(userId), "1");
  } catch {
    // Test replay is helpful, not required for the app to run.
  }
}
