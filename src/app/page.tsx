import type { Metadata } from "next";
import { SignInScreen } from "@/components/auth/AuthScreens";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Truthlabel or begin your 7-day free trial.",
};

export default function HomePage() {
  return <SignInScreen />;
}
