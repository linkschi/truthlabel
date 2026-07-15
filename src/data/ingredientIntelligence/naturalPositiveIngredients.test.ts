import assert from "node:assert/strict";
import test from "node:test";

import { naturalPositiveIngredientsDataPack } from "./naturalPositiveIngredients";

test("naturalPositiveIngredientsDataPack stores the requested starter dataset", () => {
  assert.equal(naturalPositiveIngredientsDataPack.id, "natural_positive");
  assert.equal(
    naturalPositiveIngredientsDataPack.categoryName,
    "Natural / Positive Ingredients",
  );
  assert.equal(naturalPositiveIngredientsDataPack.items.length, 20);
});

test("naturalPositiveIngredientsDataPack keeps all starter severities green", () => {
  const severities = new Set(
    naturalPositiveIngredientsDataPack.items.map(
      (item) => item.basicSeveritySuggestion,
    ),
  );

  assert.deepEqual([...severities], ["green"]);
});

test("naturalPositiveIngredientsDataPack keeps natural_positive item metadata", () => {
  naturalPositiveIngredientsDataPack.items.forEach((item) => {
    assert.deepEqual(item.categoryTags, ["natural_positive"]);
    assert.equal(item.ingredientGroup, "natural_positive");
    assert.equal(item.dataStatus, "starter");
    assert.equal(item.confidenceLevel, null);
    assert.ok(item.matchingNotes.length > 0);
  });
});

test("naturalPositiveIngredientsDataPack preserves non-overriding classification rules", () => {
  assert.ok(
    naturalPositiveIngredientsDataPack.classificationRules.some((rule) =>
      rule.includes("should never override Allergy Risk"),
    ),
  );
  assert.ok(
    naturalPositiveIngredientsDataPack.displayRulesForLater.allowedWording.includes(
      "Recognizable ingredients found",
    ),
  );
});
