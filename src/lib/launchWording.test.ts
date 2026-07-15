import assert from "node:assert/strict";
import test from "node:test";

import { lookupMockProduct } from "@/lib/productDatabase/mockProductDatabaseClient";

import { runBarcodeScan } from "./runBarcodeScan";
import { runManualScan } from "./runManualScan";

test("manual scan wording avoids allergen-free and guaranteed-safe claims", () => {
  const result = runManualScan({
    productName: "Plain Oats",
    brandName: "Whole Pantry",
    ingredientText: "Rolled oats",
  });

  const combinedText = [
    result.finalVerdict.summary,
    ...result.confidenceNotes,
    result.brandTrustSafety.message,
  ].join(" ");

  assert.ok(!/allergen-free/i.test(combinedText));
  assert.ok(!/guaranteed safe/i.test(combinedText));
  assert.ok(!/safe for everyone/i.test(combinedText));
});

test("clean recall wording avoids verified-safe and no-recalls-ever claims", async () => {
  const output = await runBarcodeScan(
    { barcode: "1000000000001" },
    {
      lookupProduct: lookupMockProduct,
      lookupExternalSafety: async () => ({
        lookupPerformed: true,
        signals: [],
        cleanCheckedSources: ["openFDA"],
        warnings: [],
        errors: [],
      }),
    },
  );

  const combinedText = [
    output.scanResult?.brandTrustSafety.message ?? "",
    ...(output.scanResult?.confidenceNotes ?? []),
  ].join(" ");

  assert.ok(!/verified safe/i.test(combinedText));
  assert.ok(!/no recalls ever/i.test(combinedText));
  assert.ok(
    /does not guarantee the product is risk-free/i.test(
      output.scanResult?.brandTrustSafety.message ?? "",
    ),
  );
});
