import assert from "node:assert/strict";
import test from "node:test";

import { hydrogenatedPartiallyHydrogenatedOilsDataPack } from "./hydrogenatedPartiallyHydrogenatedOils";
import { hydrogenatedPartiallyHydrogenatedOilsItemsById } from "./hydrogenatedPartiallyHydrogenatedOilsIndex";

test("hydrogenatedPartiallyHydrogenatedOilsDataPack stores the full starter dataset", () => {
  const { items } = hydrogenatedPartiallyHydrogenatedOilsDataPack;

  assert.equal(items.length, 11);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.equal(
    Object.keys(hydrogenatedPartiallyHydrogenatedOilsItemsById).length,
    items.length,
  );
  assert.equal(
    hydrogenatedPartiallyHydrogenatedOilsDataPack.id,
    "hydrogenated_partially_hydrogenated_oils",
  );
});

test("hydrogenatedPartiallyHydrogenatedOilsDataPack uses revised green yellow red thresholds", () => {
  const { categoryScoringRules, finalVerdictRules } =
    hydrogenatedPartiallyHydrogenatedOilsDataPack;

  assert.deepEqual(
    categoryScoringRules.noHydrogenatedOrPartiallyHydrogenatedOilFound,
    {
      severity: "green",
      display: "No",
      scoreImpact: 0,
    },
  );
  assert.deepEqual(categoryScoringRules.anyHydrogenatedOilFound, {
    severity: "yellow",
    display: "yellow_count_badge",
    scoreImpact: 12,
    reason:
      "Product contains hydrogenated oil or hydrogenated fat, which Truthlabel treats as a processed-fat review marker.",
  });
  assert.deepEqual(categoryScoringRules.anyPartiallyHydrogenatedOilFound, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: "automatic_red",
    reason:
      "Product contains partially hydrogenated oil, a major artificial trans-fat marker with serious regulatory restrictions in some regions.",
  });
  assert.deepEqual(categoryScoringRules.anyTransFatMarkerFound, {
    severity: "yellow",
    display: "yellow_count_badge",
    scoreImpact: 12,
    reason:
      "Product contains a trans fat marker. Do not trigger this rule from '0g trans fat' or 'trans fat free' claims unless PHO is also present.",
  });
  assert.equal(
    finalVerdictRules.green,
    "No hydrogenated or partially hydrogenated oils were found from the available ingredient list.",
  );
});

test("hydrogenatedPartiallyHydrogenatedOilsDataPack gives every item usable matching and user-facing copy", () => {
  const redIds = hydrogenatedPartiallyHydrogenatedOilsDataPack.items
    .filter((item) => item.severity === "red")
    .map((item) => item.id)
    .sort();

  assert.deepEqual(redIds, [
    "partially_hydrogenated_canola_rapeseed_oil",
    "partially_hydrogenated_corn_sunflower_safflower_oils",
    "partially_hydrogenated_cottonseed_oil",
    "partially_hydrogenated_oil_general",
    "partially_hydrogenated_palm_palm_kernel_oil",
    "partially_hydrogenated_soybean_oil",
  ]);

  hydrogenatedPartiallyHydrogenatedOilsDataPack.items.forEach((item) => {
    assert.ok(item.mainName.length > 0);
    assert.ok(item.otherNames.length > 0);
    assert.ok(item.warningLabel.length > 0);
    assert.ok(item.userFacingReason.length > 0);
    assert.ok(item.matchingNotes.length > 0);
    assert.ok(["red", "yellow"].includes(item.severity));
  });
});
