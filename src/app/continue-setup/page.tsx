import type { Metadata } from "next";
import ContinueSetupScreen from "@/components/onboarding/ContinueSetupScreen";

export const metadata: Metadata = {
  title: "Continue setup",
  description: "Continue your TruthLabel setup in this browser.",
};

export default function ContinueSetupPage() {
  return <ContinueSetupScreen />;
}
