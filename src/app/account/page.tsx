import type { Metadata } from "next";
import AccountScreen from "@/components/AccountScreen";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Manage the future Truthlabel account, saved scans, Watch List, and local MVP preferences.",
};

export default function AccountPage() {
  return <AccountScreen />;
}
