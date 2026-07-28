import type { Metadata } from "next";
import InternalAnalyticsDashboard from "@/components/analytics/InternalAnalyticsDashboard";

export const metadata: Metadata = {
  title: "Internal Analytics",
  description:
    "Private Truthlabel MVP analytics for reliability, funnel, and business health.",
};

export default function InternalAnalyticsPage() {
  return <InternalAnalyticsDashboard />;
}
