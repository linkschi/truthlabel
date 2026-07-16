import assert from "node:assert/strict";
import test from "node:test";

import { seedOilsProcessedOilsDataPack } from "./seedOilsProcessedOils";
import { seedOilsProcessedOilsItemsById } from "./seedOilsProcessedOilsIndex";

test("seedOilsProcessedOilsDataPack stores the full starter oil dataset", () => {
  const { items } = seedOilsProcessedOilsDataPack;

  assert.equal(items.length, 21);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.equal(Object.keys(seedOilsProcessedOilsItemsById).length, items.length);
  assert.equal(seedOilsProcessedOilsDataPack.id, "seed_oils_processed_oils");
});

test("seedOilsProcessedOilsDataPack uses the green yellow red oil thresholds", () => {
  const { categoryScoringRules, finalVerdictRules } =
    seedOilsProcessedOilsDataPack;

  assert.deepEqual(categoryScoringRules.noSeedOrProcessedOilsFound, {
    severity: "green",
    display: "No",
    scoreImpact: 0,
  });
  assert.deepEqual(categoryScoringRules.oneSeedOrProcessedOil, {
    severity: "yellow",
    display: "yellow_count_badge",
    scoreImpact: 8,
    reason:
      "Product contains a seed oil, processed oil, frying oil, refined oil, shortening, or processed fat marker.",
  });
  assert.deepEqual(categoryScoringRules.twoOrMoreSeedOrProcessedOils, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: 18,
    reason:
      "Product contains multiple seed/processed oil systems. Truthlabel treats this as a high processed-oil load.",
  });
  assert.deepEqual(categoryScoringRules.anyHydrogenatedOrPartiallyHydrogenatedOil, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: "automatic_red",
    examples: ["hydrogenated_oils", "partially_hydrogenated_oils"],
    reason: "Product contains hydrogenated or partially hydrogenated oil/fat.",
  });
  assert.equal(
    finalVerdictRules.redLoad,
    "This product contains multiple seed oils, processed oils, refined oils, or processed fat systems. Truthlabel flags this as a high processed-oil load.",
  );
  assert.equal(
    finalVerdictRules.redHydrogenated,
    "This product contains hydrogenated or partially hydrogenated oil. Truthlabel flags this as a serious processed-oil concern.",
  );
});

test("seedOilsProcessedOilsDataPack preserves hydrogenated oil records as red", () => {
  ["hydrogenated_oils", "partially_hydrogenated_oils"].forEach((id) => {
    const item = seedOilsProcessedOilsItemsById[id];

    assert.equal(item.severity, "red");
    assert.match(item.warningLabel, /HYDROGENATED OIL FOUND/);
  });
});

test("seedOilsProcessedOilsDataPack gives every item usable matching and user-facing copy", () => {
  seedOilsProcessedOilsDataPack.items.forEach((item) => {
    assert.ok(item.mainName.length > 0);
    assert.ok(item.otherNames.length > 0);
    assert.ok(item.warningLabel.length > 0);
    assert.ok(item.userFacingReason.length > 0);
    assert.ok(item.matchingNotes.length > 0);
  });
});
