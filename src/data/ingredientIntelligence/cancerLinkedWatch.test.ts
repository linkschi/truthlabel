import assert from "node:assert/strict";
import test from "node:test";

import { cancerLinkedWatchDataPack } from "./cancerLinkedWatch";

test("cancerLinkedWatchDataPack stores the requested starter dataset", () => {
  assert.equal(cancerLinkedWatchDataPack.id, "cancer_linked_watch");
  assert.equal(cancerLinkedWatchDataPack.categoryName, "Cancer-linked Watch");
  assert.equal(cancerLinkedWatchDataPack.items.length, 16);
  assert.ok(
    cancerLinkedWatchDataPack.items.some(
      (item) =>
        item.id === "aspartame" && item.basicSeveritySuggestion === "red",
    ),
  );
});

test("cancerLinkedWatchDataPack keeps only yellow and red severity suggestions", () => {
  const severities = new Set(
    cancerLinkedWatchDataPack.items.map((item) => item.basicSeveritySuggestion),
  );

  assert.deepEqual([...severities].sort(), ["red", "yellow"]);
});

test("cancerLinkedWatchDataPack keeps the cancer_linked_watch tag on every item", () => {
  cancerLinkedWatchDataPack.items.forEach((item) => {
    assert.deepEqual(item.categoryTags, ["cancer_linked_watch"]);
    assert.ok(item.canonicalIngredientId.length > 0);
    assert.ok(item.linkedExistingPackIds.length > 0);
    assert.ok(item.cancerWatchReasonType.length > 0);
    assert.ok(item.matchingNotes.length > 0);
  });
});

test("cancerLinkedWatchDataPack preserves no-green category display rules", () => {
  assert.equal(cancerLinkedWatchDataPack.categoryDisplayRules.noMatches.severity, "green");
  assert.equal(cancerLinkedWatchDataPack.categoryDisplayRules.yellowMatches.severity, "yellow");
  assert.equal(cancerLinkedWatchDataPack.categoryDisplayRules.redMatches.severity, "red");
});
