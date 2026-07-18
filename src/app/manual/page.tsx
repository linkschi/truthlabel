import type { Metadata } from "next";
import ManualScanScreen from "@/components/ManualScanScreen";

export const metadata: Metadata = {
  title: "Scan",
  description:
    "Paste an ingredient label, scan a barcode, or use OCR and camera tools in Truthlabel.",
};

function firstSearchParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ManualScanPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string | string[];
    scan?: string | string[];
    scannerDebug?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const initialScanMode =
    firstSearchParamValue(params.mode) ?? firstSearchParamValue(params.scan);
  const scannerDebug = firstSearchParamValue(params.scannerDebug) === "1";

  return (
    <ManualScanScreen
      initialScanMode={initialScanMode}
      scannerDebug={scannerDebug}
    />
  );
}
