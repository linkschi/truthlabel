import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InternalAnalyticsDashboard from "@/components/analytics/InternalAnalyticsDashboard";
import { getAuthorizedTruthlabelAdminEmailFromCookies } from "@/lib/auth/supabaseServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internal Analytics",
  description:
    "Private Truthlabel MVP analytics for reliability, funnel, and business health.",
};

export default async function InternalAnalyticsPage() {
  const adminEmail = await getAuthorizedTruthlabelAdminEmailFromCookies();

  if (!adminEmail) {
    notFound();
  }

  return <InternalAnalyticsDashboard />;
}
