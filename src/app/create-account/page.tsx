import type { Metadata } from "next";
import { CreateAccountScreen } from "@/components/auth/AuthScreens";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Truthlabel account.",
};

export default function CreateAccountPage() {
  return <CreateAccountScreen />;
}
