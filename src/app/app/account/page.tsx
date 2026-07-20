import type { Metadata } from "next";
import AccountScreen from "@/components/AccountScreen";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Manage the Truthlabel account, trial or subscription status, Watch List, and preferences.",
};

export default function AppAccountPage() {
  return <AccountScreen />;
}
