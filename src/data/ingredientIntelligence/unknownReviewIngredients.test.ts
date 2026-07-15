import assert from "node:assert/strict";
import test from "node:test";

import { unknownReviewIngredientsDataPack } from "./unknownReviewIngredients";

test("unknownReviewIngredientsDataPack stores the requested starter dataset", () => {
  assert.equal(unknownReviewIngredientsDataPack.id, "unknown_review");
  assert.equal(
    unknownReviewIngredientsDataPack.categoryName,
    "Unknown / Review Ingredients",
  );
  assert.equal(unknownReviewIngredientsDataPack.items.length, 25);
});

test("unknownReviewIngredientsDataPack keeps all starter severities yellow", () => {
  const severities = new Set(
    unknownReviewIngredientsDataPack.items.map(
      (item) => item.basicSeveritySuggestion,
    ),
  );

  assert.deepEqual([...severities], ["yellow"]);
});

test("unknownReviewIngredientsDataPack keeps unknown_review item metadata", () => {
  unknownReviewIngredientsDataPack.items.forEach((item) => {
    assert.deepEqual(item.categoryTags, ["unknown_review"]);
    assert.equal(item.ingredientGroup, "unknown_review");
    assert.equal(item.dataStatus, "starter");
    assert.equal(item.confidenceLevel, null);
    assert.ok(item.matchingNotes.length > 0);
  });
});

test("unknownReviewIngredientsDataPack preserves transparency-only display rules", () => {
  assert.equal(
    unknownReviewIngredientsDataPack.displayRulesForLater.noUnknownReviewTerms.severity,
    "green",
  );
  assert.equal(
    unknownReviewIngredientsDataPack.displayRulesForLater.hasUnknownReviewTerms.severity,
    "yellow",
  );
  assert.ok(
    unknownReviewIngredientsDataPack.classificationRules.some((rule) =>
      rule.includes("transparency concern"),
    ),
  );
});
