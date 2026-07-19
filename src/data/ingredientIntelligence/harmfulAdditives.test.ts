import assert from "node:assert/strict";
import test from "node:test";

import { harmfulAdditivesDataPack } from "./harmfulAdditives";

test("harmfulAdditivesDataPack stores the requested starter dataset", () => {
  assert.equal(harmfulAdditivesDataPack.id, "harmful_additives");
  assert.equal(harmfulAdditivesDataPack.categoryName, "Harmful Additives");
  assert.equal(harmfulAdditivesDataPack.items.length, 30);
});

test("harmfulAdditivesDataPack keeps green yellow and red severity suggestions", () => {
  const severities = new Set(
    harmfulAdditivesDataPack.items.map((item) => item.basicSeveritySuggestion),
  );

  assert.deepEqual([...severities].sort(), ["green", "red", "yellow"]);
});

test("harmfulAdditivesDataPack keeps the harmful_additives tag on every item", () => {
  harmfulAdditivesDataPack.items.forEach((item) => {
    assert.deepEqual(item.categoryTags, ["harmful_additives"]);
    assert.ok(item.canonicalIngredientId.length > 0);
    assert.ok(item.linkedExistingPackIds.length > 0);
    assert.ok(item.matchingNotes.length > 0);
  });
});

test("harmfulAdditivesDataPack keeps source refs on serious regulatory items", () => {
  harmfulAdditivesDataPack.items
    .filter(
      (item) =>
        item.basicSeveritySuggestion === "red" &&
        item.dataStatus === "verified_core",
    )
    .forEach((item) => {
      assert.ok(item.sourceRefs.length > 0);
      assert.equal(item.dataStatus, "verified_core");
    });
});
