import assert from "node:assert/strict";
import test from "node:test";

import { microplasticsDataPack } from "./microplastics";

test("microplasticsDataPack stores the requested starter dataset", () => {
  assert.equal(microplasticsDataPack.id, "microplastics");
  assert.equal(microplasticsDataPack.categoryName, "Microplastics");
  assert.equal(microplasticsDataPack.items.length, 15);
});

test("microplasticsDataPack keeps packaging markers informational and review markers yellow", () => {
  const severities = new Set(
    microplasticsDataPack.items.map((item) => item.basicSeveritySuggestion),
  );

  assert.deepEqual([...severities].sort(), ["green", "yellow"]);
});

test("microplasticsDataPack keeps microplastic item metadata", () => {
  microplasticsDataPack.items.forEach((item) => {
    assert.deepEqual(item.categoryTags, ["microplastics"]);
    assert.ok(Array.isArray(item.linkedExistingPackIds));
    assert.ok(item.matchingNotes.length > 0);
    assert.equal(item.confidenceLevel, null);
  });
});

test("microplasticsDataPack does not make detection wording automatic red", () => {
  const redIds = microplasticsDataPack.items
    .map((item) => item as { id: string; basicSeveritySuggestion: "green" | "yellow" | "red" })
    .filter((item) => item.basicSeveritySuggestion === "red")
    .map((item) => item.id)
    .sort();

  assert.deepEqual(redIds, []);
  assert.equal(
    microplasticsDataPack.displayRulesForLater.noMarkers.severity,
    "green",
  );
  assert.equal(
    microplasticsDataPack.displayRulesForLater.hasMarkers.severity,
    "yellow",
  );
  assert.equal(
    microplasticsDataPack.displayRulesForLater.hasVerifiedSignal.severity,
    "yellow",
  );
  assert.ok(
    microplasticsDataPack.classificationRules.includes(
      "Do not make red from packaging or category risk alone.",
    ),
  );
});
