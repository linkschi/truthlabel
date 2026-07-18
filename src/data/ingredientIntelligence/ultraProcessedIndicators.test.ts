import assert from "node:assert/strict";
import test from "node:test";

import { ultraProcessedIndicatorsDataPack } from "./ultraProcessedIndicators";
import { ultraProcessedIndicatorsItemsById } from "./ultraProcessedIndicatorsIndex";

test("ultraProcessedIndicatorsDataPack stores the full starter dataset", () => {
  const { items } = ultraProcessedIndicatorsDataPack;

  assert.equal(items.length, 22);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.equal(Object.keys(ultraProcessedIndicatorsItemsById).length, items.length);
  assert.equal(ultraProcessedIndicatorsDataPack.id, "ultra_processed_indicators");
});

test("ultraProcessedIndicatorsDataPack uses the requested green yellow red thresholds", () => {
  const { categoryScoringRules, finalVerdictRules } =
    ultraProcessedIndicatorsDataPack;

  assert.deepEqual(categoryScoringRules.noUltraProcessedMarkersFound, {
    severity: "green",
    display: "No",
    scoreImpact: 0,
  });
  assert.deepEqual(categoryScoringRules.oneToFiveUltraProcessedMarkers, {
    severity: "yellow",
    display: "yellow_count_badge",
    scoreImpact: 10,
    reason: "Product contains one or more ultra-processed ingredient markers.",
  });
  assert.deepEqual(categoryScoringRules.sixOrMoreUltraProcessedMarkers, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: 25,
    reason:
      "Product contains multiple ultra-processed markers. Truthlabel treats this as a high ultra-processed load.",
  });
  assert.deepEqual(categoryScoringRules.anyAutomaticRedMarker, {
    severity: "red",
    display: "red_count_badge",
    scoreImpact: "automatic_red",
    reason:
      "Product contains a marker that is red in another category, such as partially hydrogenated oil or a banned/restricted ingredient.",
  });
  assert.equal(
    finalVerdictRules.redLoad,
    "This product contains multiple ultra-processed markers. Truthlabel flags this as a high ultra-processed load.",
  );
});

test("ultraProcessedIndicatorsDataPack gives every item usable matching and user-facing copy", () => {
  ultraProcessedIndicatorsDataPack.items.forEach((item) => {
    assert.ok(item.mainName.length > 0);
    assert.ok(item.otherNames.length > 0);
    assert.ok(item.warningLabel.length > 0);
    assert.ok(item.userFacingReason.length > 0);
    assert.ok(item.matchingNotes.length > 0);
  });
});
