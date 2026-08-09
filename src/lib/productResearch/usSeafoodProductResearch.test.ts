import assert from "node:assert/strict";
import test from "node:test";

import type { ExternalProductLookupResult } from "@/lib/productDatabase/productDatabaseTypes";

import {
  enrichWithUsSeafoodProductResearch,
  findUsSeafoodProductResearch,
  getUsSeafoodProductResearchCount,
  lookupUsSeafoodProductResearch,
} from "./usSeafoodProductResearch";

function localResearchRaw(result: ExternalProductLookupResult) {
  const raw = result.raw as
    | {
        markerFacts?: Record<string, string>;
        truthlabelLocalResearch?: {
          markerFacts?: Record<string, string>;
        };
      }
    | undefined;

  return raw?.truthlabelLocalResearch ?? raw;
}

test("US seafood research batch imports all redone records", () => {
  assert.equal(getUsSeafoodProductResearchCount(), 40);
});

test("known tilapia UPC resolves with carbon monoxide color-treatment context", () => {
  const result = lookupUsSeafoodProductResearch({ barcode: "078742126647" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Great Value Frozen Tilapia Skinless and Boneless Fillets, 4 lb",
  );
  assert.ok(result.ingredients?.includes("Tilapia"));
  assert.match(result.ingredientsText ?? "", /carbon monoxide/i);
  assert.equal(localResearchRaw(result)?.markerFacts?.colorAdded, "yes");
  assert.equal(localResearchRaw(result)?.markerFacts?.farmed, "yes");
});

test("known salmon UPC resolves with wild-caught and phosphate markers", () => {
  const result = lookupUsSeafoodProductResearch({ barcode: "826504729991" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Great Value Wild Caught Pink Salmon Skin-on Fillets, 2 lb Bag (Frozen)",
  );
  assert.ok(result.ingredients?.includes("sodium tripolyphosphate (added to retain moisture)"));
  assert.equal(localResearchRaw(result)?.markerFacts?.wildCaught, "yes");
  assert.equal(localResearchRaw(result)?.markerFacts?.phosphates, "yes");
});

test("leading-zero seafood UPC matching works", () => {
  const result = lookupUsSeafoodProductResearch({ barcode: "0048000002457" });

  assert.ok(result);
  assert.equal(result.productName, "Chicken of the Sea Chunk Light Tuna in Water, 5 oz");
  assert.ok(result.allergenStatement?.includes("Fish"));
});

test("breaded shrimp keeps sulfite, seed-oil, and allergen context", () => {
  const result = lookupUsSeafoodProductResearch({ barcode: "0004132222491" });

  assert.ok(result);
  assert.equal(result.productName, "SeaPak Popcorn Shrimp with Oven Crispy Breading, 16 oz");
  assert.equal(localResearchRaw(result)?.markerFacts?.sulfites, "yes");
  assert.equal(localResearchRaw(result)?.markerFacts?.seedOils, "yes");
  assert.ok(result.allergenStatement?.includes("Shellfish"));
  assert.ok(result.allergenStatement?.includes("Wheat"));
});

test("name fallback can find no-barcode seafood research", () => {
  const record = findUsSeafoodProductResearch({
    productName: "Marketside Frozen Wild Caught Sea Scallops 1 lb",
    brandName: "Marketside",
  });

  assert.ok(record);
  assert.equal(record.markerFacts.wildCaught, "yes");
  assert.equal(record.barcodes.length, 0);
});

test("Open Food Facts product with missing ingredients can be enriched from seafood research", () => {
  const result = enrichWithUsSeafoodProductResearch({
    found: true,
    provider: "open_food_facts",
    barcode: "078742133683",
    productName: "Great Value Frozen Cooked Extra Large Peeled & Deveined Tail-on Shrimp",
    brandName: "Great Value",
    productCategory: "Seafood",
    dataQualityWarnings: [],
    raw: { source: "test" },
  });

  assert.equal(result.provider, "open_food_facts");
  assert.ok(result.ingredients?.includes("Shrimp"));
  assert.match(result.ingredientsText ?? "", /sodium tripolyphosphate/i);
  assert.ok(result.allergenStatement?.includes("Shellfish"));
  assert.match(result.dataQualityWarnings.join(" "), /local US seafood research/);
  assert.equal(localResearchRaw(result)?.markerFacts?.phosphates, "yes");
});
