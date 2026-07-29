import type { Metadata } from "next";
import PublicStartPage from "@/components/PublicStartPage";

export const metadata: Metadata = {
  title: "Truthlabel - Scan before you trust it",
  description:
    "Truthlabel helps scan barcodes and ingredient lists for clear food-label warnings.",
};

export default function HomePage() {
  return <PublicStartPage />;
}
