import assert from "node:assert/strict";
import test from "node:test";

import { meatSpecificConcernsDataPack } from "./meatSpecificConcerns";

test("meatSpecificConcernsDataPack stores the requested starter dataset", () => {
  assert.equal(meatSpecificConcernsDataPack.id, "meat_specific_concerns");
  assert.equal(
    meatSpecificConcernsDataPack.categoryName,
    "Meat-Specific Concerns",
  );
  assert.equal(meatSpecificConcernsDataPack.items.length, 20);
});

test("meatSpecificConcernsDataPack keeps all starter severities yellow", () => {
  const severities = new Set(
    meatSpecificConcernsDataPack.items.map(
      (item) => item.basicSeveritySuggestion,
    ),
  );

  assert.deepEqual([...severities], ["yellow"]);
});

test("meatSpecificConcernsDataPack keeps meat-specific item metadata", () => {
  meatSpecificConcernsDataPack.items.forEach((item) => {
    assert.deepEqual(item.categoryTags, ["meat_specific_concerns"]);
    assert.equal(item.dataStatus, "starter");
    assert.equal(item.confidenceLevel, null);
    assert.ok(Array.isArray(item.linkedExistingPackIds));
    assert.ok(item.matchingNotes.length > 0);
  });
});

test("meatSpecificConcernsDataPack preserves review-only display rules", () => {
  assert.equal(
    meatSpecificConcernsDataPack.displayRulesForLater.noMarkers.severity,
    "green",
  );
  assert.equal(
    meatSpecificConcernsDataPack.displayRulesForLater.hasMarkers.severity,
    "yellow",
  );
  assert.ok(
    meatSpecificConcernsDataPack.classificationRules.some((rule) =>
      rule.includes("Automatic red should come only from linked categories"),
    ),
  );
});
