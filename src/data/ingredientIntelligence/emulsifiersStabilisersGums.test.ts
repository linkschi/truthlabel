import assert from "node:assert/strict";
import test from "node:test";

import { emulsifiersStabilisersGumsDataPack } from "./emulsifiersStabilisersGums";
import { emulsifiersStabilisersGumsItemsById } from "./emulsifiersStabilisersGumsIndex";

test("emulsifiersStabilisersGumsDataPack stores the full starter texture-additive dataset", () => {
  const { items } = emulsifiersStabilisersGumsDataPack;

  assert.equal(items.length, 30);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.equal(Object.keys(emulsifiersStabilisersGumsItemsById).length, items.length);
  assert.equal(
    emulsifiersStabilisersGumsDataPack.id,
    "emulsifiers_stabilisers_thickeners_gums",
  );
});

test("emulsifiersStabilisersGumsDataPack uses the corrected green yellow red thresholds", () => {
  const { categoryScoringRules, finalVerdictRules } =
    emulsifiersStabilisersGumsDataPack;

  assert.deepEqual(categoryScoringRules.noEmulsifiersStabilisersFound, {
    severity: "green",
    display: "No",
    scoreImpact: 0,
  });
  assert.deepEqual(categoryScoringRules.oneToTwoTextureAdditives, {
    severity: "yellow",
    display: "yellow_count_badge",
    scoreImpact: 8,
    reason:
      "Product contains emulsifiers, stabilisers, thickeners, gums, or texture-support ingredients.",
  });
  assert.deepEqual(categoryScoringRules.threeOrMoreTextureAdditives, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: 22,
    reason:
      "Product contains multiple texture-engineering systems. Truthlabel treats this as a high emulsifier/stabiliser load.",
  });
  assert.deepEqual(categoryScoringRules.anyBannedRestrictedTextureAdditive, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: "automatic_red",
    reason: "Ingredient also appears in Banned / Restricted Items.",
  });
  assert.equal(
    finalVerdictRules.redLoad,
    "This product contains multiple emulsifiers, stabilisers, thickeners, gums, or texture-support systems. Truthlabel flags this as a high texture-engineering load.",
  );
});

test("emulsifiersStabilisersGumsDataPack gives every item usable matching and user-facing copy", () => {
  emulsifiersStabilisersGumsDataPack.items.forEach((item) => {
    assert.ok(item.mainName.length > 0);
    assert.ok(item.otherNames.length > 0);
    assert.ok(item.warningLabel.length > 0);
    assert.ok(item.userFacingReason.length > 0);
    assert.ok(item.matchingNotes.length > 0);
  });
});
