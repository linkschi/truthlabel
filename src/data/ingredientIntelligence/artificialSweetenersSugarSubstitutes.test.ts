import assert from "node:assert/strict";
import test from "node:test";

import { artificialSweetenersDataPack } from "./artificialSweetenersSugarSubstitutes";
import { artificialSweetenersItemsById } from "./artificialSweetenersSugarSubstitutesIndex";

test("artificialSweetenersDataPack stores the full starter sweetener dataset", () => {
  const { items } = artificialSweetenersDataPack;

  assert.equal(items.length, 23);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.equal(Object.keys(artificialSweetenersItemsById).length, items.length);
  assert.equal(
    artificialSweetenersDataPack.id,
    "artificial_sweeteners_sugar_substitutes",
  );
});

test("artificialSweetenersDataPack uses the corrected green yellow red thresholds", () => {
  const { categoryScoringRules, finalVerdictRules } = artificialSweetenersDataPack;

  assert.deepEqual(categoryScoringRules.noSweetenersFound, {
    severity: "green",
    display: "No",
    scoreImpact: 0,
  });
  assert.deepEqual(categoryScoringRules.oneToTwoSweeteners, {
    severity: "yellow",
    display: "yellow_count_badge",
    scoreImpact: 6,
    reason: "Product contains added non-sugar sweetening systems.",
  });
  assert.deepEqual(categoryScoringRules.threeOrMoreSweeteners, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: 20,
    reason:
      "Product contains multiple sweetener systems. InsideIt treats this as a high sweetener-load concern.",
  });
  assert.deepEqual(categoryScoringRules.anyBannedRestrictedSweetener, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: "automatic_red",
    examples: ["cyclamates", "crude_stevia_whole_leaf"],
  });
  assert.equal(
    finalVerdictRules.redLoad,
    "This product contains multiple sweetener systems. InsideIt flags this as a high sweetener-load concern.",
  );
  assert.equal(
    finalVerdictRules.redRestricted,
    "This product contains a banned or restricted sweetener. InsideIt flags this as a serious regulatory concern.",
  );
});

test("artificialSweetenersDataPack preserves restricted sweeteners as automatic red items", () => {
  const cyclamates = artificialSweetenersItemsById.cyclamates;
  const crudeStevia = artificialSweetenersItemsById.crude_stevia_whole_leaf;

  assert.equal(cyclamates.severity, "red");
  assert.equal(cyclamates.scoringImpact, "automatic_red");
  assert.equal(cyclamates.warningLabel, "BANNED / RESTRICTED SWEETENER");

  assert.equal(crudeStevia.severity, "red");
  assert.equal(crudeStevia.scoringImpact, "automatic_red");
  assert.equal(crudeStevia.warningLabel, "NOT-PERMITTED SWEETENER");
});

test("artificialSweetenersDataPack gives every item usable matching and user-facing copy", () => {
  artificialSweetenersDataPack.items.forEach((item) => {
    assert.ok(item.mainName.length > 0);
    assert.ok(item.otherNames.length > 0);
    assert.ok(item.warningLabel.length > 0);
    assert.ok(item.userFacingReason.length > 0);
    assert.ok(item.matchingNotes.length > 0);
  });
});

test("artificialSweetenersDataPack stores extra alias coverage only for known items", () => {
  const itemIds = new Set(artificialSweetenersDataPack.items.map((item) => item.id));

  Object.keys(artificialSweetenersDataPack.aliasCoverage).forEach((id) => {
    assert.ok(itemIds.has(id));
  });
  assert.ok(
    artificialSweetenersDataPack.aliasCoverage.aspartame.brandNames?.includes(
      "AminoSweet",
    ),
  );
  assert.ok(
    artificialSweetenersDataPack.aliasCoverage.acesulfame_potassium.otherNames
      ?.includes("Acesulfame potassium salt"),
  );
});
