import type { Metadata } from "next";
import { ForgotPasswordScreen } from "@/components/auth/AuthScreens";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a Truthlabel password reset link.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
