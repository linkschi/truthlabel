import type { Metadata } from "next";
import ManualScanScreen from "@/components/ManualScanScreen";

export const metadata: Metadata = {
  title: "Scan",
  description:
    "Paste an ingredient label, scan a barcode, or use OCR and camera tools in InsideIt.",
};

export default function ManualScanPage() {
  return <ManualScanScreen />;
}
