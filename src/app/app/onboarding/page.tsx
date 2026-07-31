import type { Metadata } from "next";
import { Suspense } from "react";
import TruthlabelOnboardingScreen from "@/components/onboarding/TruthlabelOnboardingScreen";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Set up your Truthlabel alerts and phone app.",
};

export default function AppOnboardingPage() {
  return (
    <Suspense fallback={null}>
      <TruthlabelOnboardingScreen />
    </Suspense>
  );
}
