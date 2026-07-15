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

test("hydrogenatedPartiallyHydrogenatedOilsDataPack uses green red only for category thresholds", () => {
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
    severity: "red",
    display: "red_count_badge",
    scoreImpact: 25,
    reason:
      "Product contains hydrogenated oil or hydrogenated fat, which InsideIt treats as a serious processed-fat marker.",
  });
  assert.deepEqual(categoryScoringRules.anyPartiallyHydrogenatedOilFound, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: "automatic_red",
    reason:
      "Product contains partially hydrogenated oil, a major artificial trans-fat marker with serious regulatory restrictions in some regions.",
  });
  assert.deepEqual(categoryScoringRules.anyTransFatMarkerFound, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: "automatic_red",
    reason:
      "Product contains a trans fat marker. Do not trigger this rule from '0g trans fat' or 'trans fat free' claims unless PHO is also present.",
  });
  assert.equal(
    finalVerdictRules.green,
    "No hydrogenated or partially hydrogenated oils were found from the available ingredient list.",
  );
});

test("hydrogenatedPartiallyHydrogenatedOilsDataPack gives every item usable matching and user-facing copy", () => {
  hydrogenatedPartiallyHydrogenatedOilsDataPack.items.forEach((item) => {
    assert.ok(item.mainName.length > 0);
    assert.ok(item.otherNames.length > 0);
    assert.ok(item.warningLabel.length > 0);
    assert.ok(item.userFacingReason.length > 0);
    assert.ok(item.matchingNotes.length > 0);
    assert.equal(item.severity, "red");
  });
});
