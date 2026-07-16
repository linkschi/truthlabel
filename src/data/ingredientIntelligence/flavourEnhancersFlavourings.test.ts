import assert from "node:assert/strict";
import test from "node:test";

import { flavourEnhancersFlavouringsDataPack } from "./flavourEnhancersFlavourings";
import { flavourEnhancersFlavouringsItemsById } from "./flavourEnhancersFlavouringsIndex";

test("flavourEnhancersFlavouringsDataPack stores the full starter flavour-system dataset", () => {
  const { items } = flavourEnhancersFlavouringsDataPack;

  assert.equal(items.length, 23);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.equal(Object.keys(flavourEnhancersFlavouringsItemsById).length, items.length);
  assert.equal(
    flavourEnhancersFlavouringsDataPack.id,
    "flavour_enhancers_flavourings",
  );
});

test("flavourEnhancersFlavouringsDataPack uses the green yellow red flavour-system thresholds", () => {
  const { categoryScoringRules, finalVerdictRules } =
    flavourEnhancersFlavouringsDataPack;

  assert.deepEqual(categoryScoringRules.noFlavouringsFound, {
    severity: "green",
    display: "No",
    scoreImpact: 0,
  });
  assert.deepEqual(categoryScoringRules.oneToTwoFlavourSystems, {
    severity: "yellow",
    display: "yellow_count_badge",
    scoreImpact: 8,
    reason:
      "Product contains added flavourings, flavour enhancers, or taste-building systems.",
  });
  assert.deepEqual(categoryScoringRules.threeOrMoreFlavourSystems, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: 22,
    reason:
      "Product contains multiple flavouring or flavour-enhancing systems. Truthlabel treats this as a high flavour-system load.",
  });
  assert.deepEqual(categoryScoringRules.anyBannedRestrictedFlavouring, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: "automatic_red",
    examples: [
      "safrole",
      "added_coumarin_tonka",
      "calamus_sweet_flag",
      "cinnamyl_anthranilate",
    ],
    reason: "Ingredient also appears in Banned / Restricted Items.",
  });
  assert.equal(
    finalVerdictRules.redLoad,
    "This product contains multiple flavouring or flavour-enhancing systems. Truthlabel flags this as a high flavour-system load.",
  );
  assert.equal(
    finalVerdictRules.redRestricted,
    "This product contains a banned or restricted flavouring ingredient. Truthlabel flags this as a serious regulatory concern.",
  );
});

test("flavourEnhancersFlavouringsDataPack preserves restricted flavourings as automatic red items", () => {
  [
    "safrole",
    "added_coumarin_tonka",
    "calamus_sweet_flag",
    "cinnamyl_anthranilate",
  ].forEach((id) => {
    const item = flavourEnhancersFlavouringsItemsById[id];

    assert.equal(item.severity, "red");
    assert.equal(item.scoringImpact, "automatic_red");
    assert.equal(item.healthConcernType, "banned_restricted_flavouring");
  });
});

test("flavourEnhancersFlavouringsDataPack gives every item usable matching and user-facing copy", () => {
  flavourEnhancersFlavouringsDataPack.items.forEach((item) => {
    assert.ok(item.mainName.length > 0);
    assert.ok(item.otherNames.length > 0);
    assert.ok(item.warningLabel.length > 0);
    assert.ok(item.userFacingReason.length > 0);
    assert.ok(item.matchingNotes.length > 0);
  });
});
