import type { Metadata } from "next";
import HomeScreen from "@/components/HomeScreen";
import AppHomeOnboardingGate from "@/components/onboarding/AppHomeOnboardingGate";

export const metadata: Metadata = {
  title: "App",
  description: "Open the protected Truthlabel scanner home.",
};

export default function AppHomePage() {
  return (
    <AppHomeOnboardingGate>
      <HomeScreen />
    </AppHomeOnboardingGate>
  );
}
