import assert from "node:assert/strict";
import test from "node:test";

import { fryOilFastFoodOilDataPack } from "./fryOilFastFoodOil";

test("fryOilFastFoodOilDataPack stores the requested starter dataset", () => {
  assert.equal(fryOilFastFoodOilDataPack.id, "fry_oil_fast_food_oil");
  assert.equal(
    fryOilFastFoodOilDataPack.categoryName,
    "Fry Oil / Fast Food Oil",
  );
  assert.equal(fryOilFastFoodOilDataPack.items.length, 22);
});

test("fryOilFastFoodOilDataPack keeps green yellow and red starter severities", () => {
  const severities = new Set(
    fryOilFastFoodOilDataPack.items.map(
      (item) => item.basicSeveritySuggestion,
    ),
  );

  assert.deepEqual([...severities].sort(), ["green", "red", "yellow"]);
});

test("fryOilFastFoodOilDataPack keeps fry-oil item metadata", () => {
  fryOilFastFoodOilDataPack.items.forEach((item) => {
    assert.deepEqual(item.categoryTags, ["fry_oil_fast_food_oil"]);
    assert.equal(item.dataStatus, "starter");
    assert.equal(item.confidenceLevel, null);
    assert.ok(Array.isArray(item.linkedExistingPackIds));
    assert.ok(item.matchingNotes.length > 0);
  });
});

test("fryOilFastFoodOilDataPack preserves linked red-path markers", () => {
  const hydrogenated = fryOilFastFoodOilDataPack.items.find(
    (item) => item.id === "hydrogenated_frying_oil",
  );
  const pho = fryOilFastFoodOilDataPack.items.find(
    (item) => item.id === "partially_hydrogenated_frying_oil_pho",
  );

  assert.ok(hydrogenated);
  assert.ok(pho);
  assert.equal(hydrogenated.basicSeveritySuggestion, "yellow");
  assert.equal(pho.basicSeveritySuggestion, "red");
  assert.equal(fryOilFastFoodOilDataPack.displayRulesForLater.noMarkers.severity, "green");
  assert.equal(fryOilFastFoodOilDataPack.displayRulesForLater.hasMarkers.severity, "yellow");
});
