"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { publicAppConfig } from "@/lib/appConfig";
import { hasMvpActivationAccess } from "@/lib/auth/mvpActivationAccess";
import {
  hasSeenThiislincornOnboardingReplay,
  isThiislincornOnboardingTestAccount,
  markThiislincornOnboardingReplaySeen,
} from "@/lib/onboarding/onboardingTestMode";
import {
  hasCompletedOnboarding,
  loadOnboardingState,
} from "@/lib/onboarding/truthlabelOnboardingState";

export default function AppHomeOnboardingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { accessState, user } = useTruthlabelAuth();
  const userId = user?.id;
  const userEmail = user?.email;
  const [hasMvpAccessPass, setHasMvpAccessPass] = useState(
    () => typeof window !== "undefined" && hasMvpActivationAccess(),
  );
  const hasEffectiveAppAccess =
    accessState === "active" ||
    publicAppConfig.flags.enableLocalDevBypass ||
    hasMvpAccessPass;
  const shouldCheckOnboarding = hasEffectiveAppAccess && Boolean(userId);
  const shouldShowOnboardingReplay =
    isThiislincornOnboardingTestAccount(userEmail) &&
    Boolean(userId) &&
    !hasSeenThiislincornOnboardingReplay(userId ?? "");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setHasMvpAccessPass(hasMvpActivationAccess());
    }, 0);

    return () => window.clearTimeout(handle);
  }, [accessState]);

  useEffect(() => {
    if (!shouldCheckOnboarding || !userId) {
      return;
    }

    const activeUserId = userId;
    let cancelled = false;

    if (!shouldShowOnboardingReplay && hasCompletedOnboarding(activeUserId)) {
      return;
    }

    async function checkOnboarding() {
      const state = await loadOnboardingState(activeUserId);

      if (cancelled) {
        return;
      }

      if (
        shouldShowOnboardingReplay
      ) {
        markThiislincornOnboardingReplaySeen(activeUserId);
        router.replace("/app/onboarding?review=1&restart=1&test=thiislincorn");
        return;
      }

      if (!state.onboardingCompletedAt) {
        router.replace("/app/onboarding");
        return;
      }
    }

    void checkOnboarding();

    return () => {
      cancelled = true;
    };
  }, [router, shouldCheckOnboarding, shouldShowOnboardingReplay, userId]);

  return children;
}
