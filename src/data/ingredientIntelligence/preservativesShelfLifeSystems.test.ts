import assert from "node:assert/strict";
import test from "node:test";

import { preservativesShelfLifeSystemsDataPack } from "./preservativesShelfLifeSystems";
import { preservativesShelfLifeSystemsItemsById } from "./preservativesShelfLifeSystemsIndex";

test("preservativesShelfLifeSystemsDataPack stores the full starter preservative dataset", () => {
  const { items } = preservativesShelfLifeSystemsDataPack;

  assert.equal(items.length, 36);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.equal(
    Object.keys(preservativesShelfLifeSystemsItemsById).length,
    items.length,
  );
  assert.equal(
    preservativesShelfLifeSystemsDataPack.id,
    "preservatives_shelf_life_systems",
  );
});

test("preservativesShelfLifeSystemsDataPack uses the corrected green yellow red category thresholds", () => {
  const { categoryScoringRules, finalVerdictRules } =
    preservativesShelfLifeSystemsDataPack;

  assert.deepEqual(categoryScoringRules.noPreservativesFound, {
    severity: "green",
    display: "No",
    scoreImpact: 0,
  });
  assert.deepEqual(categoryScoringRules.oneToTwoPreservatives, {
    severity: "yellow",
    display: "yellow_count_badge",
    scoreImpact: 6,
  });
  assert.equal(categoryScoringRules.threeOrMorePreservatives.severity, "red");
  assert.equal(categoryScoringRules.threeOrMorePreservatives.display, "red_count_badge");
  assert.equal(
    finalVerdictRules.redFromLoad,
    "This product contains multiple preservative systems. InsideIt flags this as a high shelf-life additive load.",
  );
  assert.equal(
    finalVerdictRules.redFromBannedRestricted,
    "This product contains a banned or restricted preservative. InsideIt flags this as a serious safety concern.",
  );
});

test("preservativesShelfLifeSystemsDataPack preserves propylparaben as the automatic red preservative", () => {
  const propylparaben = preservativesShelfLifeSystemsItemsById.propylparaben;

  assert.equal(propylparaben.severity, "red");
  assert.equal(propylparaben.scoringImpact, "automatic_red");
  assert.equal(propylparaben.warningLabel, "BANNED / RESTRICTED PRESERVATIVE");
  assert.equal(
    preservativesShelfLifeSystemsDataPack.categoryScoringRules
      .anyBannedRestrictedPreservative.examples[0],
    "propylparaben",
  );
});

test("preservativesShelfLifeSystemsDataPack does not keep any strong-yellow display state", () => {
  const displays = Object.values(
    preservativesShelfLifeSystemsDataPack.categoryScoringRules,
  ).map((rule) => rule.display) as string[];
  const impacts = preservativesShelfLifeSystemsDataPack.items.map(
    (item) => item.scoringImpact,
  ) as string[];

  assert.ok(displays.every((display) => display !== "yellow_or_high_yellow_badge"));
  assert.ok(impacts.every((impact) => impact !== "high_yellow_preservative"));
});

test("preservativesShelfLifeSystemsDataPack gives every item usable matching and user-facing copy", () => {
  preservativesShelfLifeSystemsDataPack.items.forEach((item) => {
    assert.ok(item.mainName.length > 0);
    assert.ok(item.otherNames.length > 0);
    assert.ok(item.warningLabel.length > 0);
    assert.ok(item.userFacingReason.length > 0);
    assert.ok(item.matchingNotes.length > 0);
  });
});

test("preservativesShelfLifeSystemsDataPack stores extra alias coverage only for known items", () => {
  const itemIds = new Set(
    preservativesShelfLifeSystemsDataPack.items.map((item) => item.id),
  );

  Object.keys(preservativesShelfLifeSystemsDataPack.aliasCoverage).forEach((id) => {
    assert.ok(itemIds.has(id));
  });
  assert.ok(
    preservativesShelfLifeSystemsDataPack.aliasCoverage.sodium_nitrite.otherNames
      ?.includes("Prague powder No. 1"),
  );
  assert.ok(
    preservativesShelfLifeSystemsDataPack.aliasCoverage.potassium_metabisulfite
      .spellingVariants?.includes("Potassium metabisulphite"),
  );
});
