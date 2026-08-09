import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DemoScanBuilder from "@/components/admin/DemoScanBuilder";
import { getAuthorizedTruthlabelAdminEmailFromCookies } from "@/lib/auth/supabaseServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Demo Scan Builder",
  description: "Private admin-only Truthlabel demo scan result builder.",
};

function firstSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DemoScanBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{
    demo?: string | string[];
  }>;
}) {
  const adminEmail = await getAuthorizedTruthlabelAdminEmailFromCookies();

  if (!adminEmail) {
    notFound();
  }

  const params = await searchParams;

  return (
    <DemoScanBuilder
      adminEmail={adminEmail}
      initialDemoId={firstSearchParamValue(params.demo)}
    />
  );
}
