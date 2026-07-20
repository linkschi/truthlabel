import type { Metadata } from "next";
import { SignInScreen } from "@/components/auth/AuthScreens";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Truthlabel account.",
};

export default function SignInPage() {
  return <SignInScreen />;
}
