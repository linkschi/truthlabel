import type { Metadata } from "next";
import ProductResult from "@/components/ProductResult";

export const metadata: Metadata = {
  title: "Result",
  description:
    "Review the current Truthlabel exposure result, ingredient groups, and safety notes.",
};

export default async function AppResultsPage({
  searchParams,
}: {
  searchParams: Promise<{
    barcode?: string | string[];
    category?: string | string[];
    demo?: string | string[];
    fresh?: string | string[];
    history?: string | string[];
    manual?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const barcodeScanKey = Array.isArray(params.barcode)
    ? params.barcode[0]
    : params.barcode;
  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const demoProductId = Array.isArray(params.demo) ? params.demo[0] : params.demo;
  const freshParam = Array.isArray(params.fresh)
    ? params.fresh[0]
    : params.fresh;
  const historyScanId = Array.isArray(params.history)
    ? params.history[0]
    : params.history;
  const manualScanKey = Array.isArray(params.manual)
    ? params.manual[0]
    : params.manual;
  const freshResult = freshParam === "1" || freshParam === "true";

  return (
    <ProductResult
      barcodeScanKey={barcodeScanKey}
      category={category}
      demoProductId={demoProductId}
      freshResult={freshResult}
      historyScanId={historyScanId}
      manualScanKey={manualScanKey}
    />
  );
}
