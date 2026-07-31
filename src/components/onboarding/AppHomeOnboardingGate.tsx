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
import { loadOnboardingState } from "@/lib/onboarding/truthlabelOnboardingState";

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
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);

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

    async function checkOnboarding() {
      const state = await loadOnboardingState(activeUserId);

      if (cancelled) {
        return;
      }

      if (
        isThiislincornOnboardingTestAccount(userEmail) &&
        !hasSeenThiislincornOnboardingReplay(activeUserId)
      ) {
        markThiislincornOnboardingReplaySeen(activeUserId);
        router.replace("/app/onboarding?review=1&restart=1&test=thiislincorn");
        return;
      }

      if (!state.onboardingCompletedAt) {
        router.replace("/app/onboarding");
        return;
      }

      setCheckedUserId(activeUserId);
    }

    void checkOnboarding();

    return () => {
      cancelled = true;
    };
  }, [router, shouldCheckOnboarding, userEmail, userId]);

  if (accessState === "loading" || (shouldCheckOnboarding && checkedUserId !== userId)) {
    return (
      <main className="min-h-screen bg-[#FBFDFB] px-5 py-6 text-[#101613]">
        <section className="mx-auto flex min-h-[70vh] max-w-[440px] items-center justify-center">
          <div className="w-full rounded-[28px] border border-[#D7E7DD] bg-white px-5 py-6 text-center shadow-[0_18px_44px_rgba(15,40,28,0.08)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0E5A3F]">
              Truthlabel
            </p>
            <h1 className="mt-2 text-[22px] font-black">
              Checking setup
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-[#66716B]">
              We&apos;re checking whether onboarding is complete.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return children;
}
