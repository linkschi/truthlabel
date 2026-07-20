import type { Metadata } from "next";
import { UpdatePasswordScreen } from "@/components/auth/AuthScreens";

export const metadata: Metadata = {
  title: "Update password",
  description: "Update your Truthlabel account password.",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordScreen />;
}
