import type { Metadata } from "next";
import ScanHistoryScreen from "@/components/scanHistory/ScanHistoryScreen";

export const metadata: Metadata = {
  title: "Scan History",
  description: "Review previous Truthlabel product scans.",
};

export default function AppHistoryPage() {
  return <ScanHistoryScreen />;
}
