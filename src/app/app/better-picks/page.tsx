import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BetterPicksComingSoonScreen from "@/components/betterPicks/BetterPicksComingSoonScreen";
import { getAuthorizedTruthlabelAdminEmailFromCookies } from "@/lib/auth/supabaseServer";
import { betterPicksConfig } from "@/lib/betterPicks/betterPicksConfig";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Better Picks",
  description:
    "Preview Truthlabel's upcoming lower-concern product alternatives feature.",
};

export default async function BetterPicksPage() {
  const adminEmail = await getAuthorizedTruthlabelAdminEmailFromCookies();

  if (adminEmail) {
    redirect("/alternatives");
  }

  return <BetterPicksComingSoonScreen config={betterPicksConfig} />;
}
