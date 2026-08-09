import assert from "node:assert/strict";
import test from "node:test";

import { enrichWithLocalProductResearch, lookupLocalProductResearch } from "./localProductResearch";

test("local product research can resolve a seafood barcode when the public database misses", () => {
  const result = lookupLocalProductResearch({ barcode: "078742126647" });

  assert.ok(result);
  assert.equal(result.provider, "truthlabel_local_research");
  assert.equal(
    result.productName,
    "Great Value Frozen Tilapia Skinless and Boneless Fillets, 4 lb",
  );
});

test("local product research enriches a public seafood result with missing ingredients", () => {
  const result = enrichWithLocalProductResearch({
    found: true,
    provider: "open_food_facts",
    barcode: "0004132222491",
    productName: "SeaPak Popcorn Shrimp with Oven Crispy Breading",
    brandName: "SeaPak",
    dataQualityWarnings: [],
    raw: { source: "test" },
  });

  assert.equal(result.provider, "open_food_facts");
  assert.match(result.ingredientsText ?? "", /sodium bisulfite/i);
  assert.ok(result.allergenStatement?.includes("Shellfish"));
});
