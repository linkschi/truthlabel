import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminFlowLab from "@/components/admin/AdminFlowLab";
import { getAuthorizedTruthlabelAdminEmailFromCookies } from "@/lib/auth/supabaseServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flow Lab",
  description:
    "Private Truthlabel admin preview page for onboarding, install, social handoff, and cancellation flows.",
};

export default async function AdminFlowLabPage() {
  const adminEmail = await getAuthorizedTruthlabelAdminEmailFromCookies();

  if (!adminEmail) {
    notFound();
  }

  return <AdminFlowLab adminEmail={adminEmail} />;
}
