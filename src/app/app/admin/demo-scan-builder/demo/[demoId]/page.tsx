import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DemoScanStandalonePage from "@/components/admin/DemoScanStandalonePage";
import { getAuthorizedTruthlabelAdminEmailFromCookies } from "@/lib/auth/supabaseServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Demo Scan Result",
  description: "Private admin-only Truthlabel demo scan result preview.",
};

export default async function DemoScanStandaloneRoute({
  params,
}: {
  params: Promise<{
    demoId: string;
  }>;
}) {
  const adminEmail = await getAuthorizedTruthlabelAdminEmailFromCookies();

  if (!adminEmail) {
    notFound();
  }

  const { demoId } = await params;

  return <DemoScanStandalonePage adminEmail={adminEmail} demoId={demoId} />;
}
