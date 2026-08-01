import type { Metadata } from "next";
import BetterPicksComingSoonScreen from "@/components/betterPicks/BetterPicksComingSoonScreen";
import { betterPicksConfig } from "@/lib/betterPicks/betterPicksConfig";

export const metadata: Metadata = {
  title: "Better Picks",
  description:
    "Preview Truthlabel's upcoming lower-concern product alternatives feature.",
};

export default function BetterPicksPage() {
  return <BetterPicksComingSoonScreen config={betterPicksConfig} />;
}
