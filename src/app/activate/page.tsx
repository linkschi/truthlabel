import type { Metadata } from "next";
import { ActivateScreen } from "@/components/auth/AuthScreens";

export const metadata: Metadata = {
  title: "Activate access",
  description: "Activate your Truthlabel subscription access.",
};

export default function ActivatePage() {
  return <ActivateScreen />;
}
