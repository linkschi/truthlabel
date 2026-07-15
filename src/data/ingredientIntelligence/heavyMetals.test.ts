import assert from "node:assert/strict";
import test from "node:test";

import { heavyMetalsDataPack } from "./heavyMetals";

test("heavyMetalsDataPack stores the requested starter dataset", () => {
  assert.equal(heavyMetalsDataPack.id, "heavy_metals");
  assert.equal(heavyMetalsDataPack.categoryName, "Heavy Metals");
  assert.equal(heavyMetalsDataPack.items.length, 15);
});

test("heavyMetalsDataPack keeps yellow and red severity paths", () => {
  const severities = new Set(
    heavyMetalsDataPack.items.map((item) => item.basicSeveritySuggestion),
  );

  assert.deepEqual([...severities].sort(), ["red", "yellow"]);
});

test("heavyMetalsDataPack keeps heavy-metal item metadata", () => {
  heavyMetalsDataPack.items.forEach((item) => {
    assert.deepEqual(item.categoryTags, ["heavy_metals"]);
    assert.ok(Array.isArray(item.linkedExistingPackIds));
    assert.ok(item.matchingNotes.length > 0);
    assert.equal(item.confidenceLevel, null);
  });
});

test("heavyMetalsDataPack keeps red only for verified external concern paths", () => {
  const redIds = heavyMetalsDataPack.items
    .filter((item) => item.basicSeveritySuggestion === "red")
    .map((item) => item.id)
    .sort();

  assert.deepEqual(redIds, [
    "cadmium",
    "heavy_metal_recall_marker",
    "inorganic_arsenic",
    "lead",
    "mercury_methylmercury",
  ]);
  assert.equal(
    heavyMetalsDataPack.displayRulesForLater.noMarkers.severity,
    "green",
  );
  assert.equal(
    heavyMetalsDataPack.displayRulesForLater.hasMarkers.severity,
    "yellow",
  );
  assert.equal(
    heavyMetalsDataPack.displayRulesForLater.hasVerifiedSignal.severity,
    "red",
  );
  assert.ok(
    heavyMetalsDataPack.classificationRules.includes(
      "Do not make red from category risk alone.",
    ),
  );
});
