import assert from "node:assert/strict";
import test from "node:test";

import { applyIngredientCategoryRules } from "./ingredientCategoryRules";
import {
  matchIngredientIntelligence,
  normalizeIngredientIntelligenceText,
} from "./ingredientIntelligenceMatcher";
import { calculateIngredientLoad } from "./calculateIngredientLoad";

function calculate(ingredients: string[], userAllergyProfile: string[] = []) {
  const matcherResult = matchIngredientIntelligence({
    ingredients,
    userAllergyProfile,
  });
  const ingredientCount = new Set(
    ingredients.map(normalizeIngredientIntelligenceText).filter(Boolean),
  ).size;
  const categoryRules = applyIngredientCategoryRules({
    ...matcherResult,
    ingredientListAvailable: true,
    ingredientCount,
    userAllergyProfile,
  });

  return calculateIngredientLoad({
    ingredients,
    duplicateSafeMatches: matcherResult.duplicateSafeMatches,
    categorySummaries: categoryRules.categorySummaries,
  });
}

function findIngredient(
  result: ReturnType<typeof calculate>,
  originalIngredient: string,
) {
  return result.scoredIngredients.find((ingredient) =>
    ingredient.originalIngredientTexts.includes(originalIngredient),
  );
}

test("27 ordinary ingredients produce a 55/100 moderate ingredient score", () => {
  const result = calculate(
    Array.from({ length: 27 }, (_, index) => `Simple ingredient ${index + 1}`),
  );

  assert.equal(result.rawLoad, 27);
  assert.equal(result.score, 55);
  assert.equal(result.level, "Moderate Ingredient Score");
});

test("one red ingredient and six ordinary ingredients produce a 48/100 ingredient score", () => {
  const result = calculate([
    "Red No. 3",
    "Water",
    "Sugar",
    "Salt",
    "Apple",
    "Oats",
    "Butter",
  ]);

  assert.equal(result.rawLoad, 31);
  assert.equal(result.score, 48);
  assert.equal(result.level, "Poor Ingredient Score");
  assert.equal(findIngredient(result, "Red No. 3")?.loadClass, "red");
});

test("five yellow concerns and eight ordinary ingredients produce a 45/100 ingredient score", () => {
  const result = calculate([
    "Sucralose",
    "Acesulfame potassium",
    "Sodium benzoate",
    "BHT",
    "TBHQ",
    "Water",
    "Sugar",
    "Salt",
    "Apple",
    "Oats",
    "Butter",
    "Egg",
    "Milk",
  ]);

  assert.equal(result.rawLoad, 33);
  assert.equal(result.score, 45);
  assert.equal(result.level, "Poor Ingredient Score");
  assert.equal(
    result.scoredIngredients.filter((ingredient) => ingredient.loadClass === "yellow")
      .length,
    5,
  );
});

test("100 ordinary ingredients cap the ingredient score at 0", () => {
  const result = calculate(
    Array.from({ length: 100 }, (_, index) => `Ordinary item ${index + 1}`),
  );

  assert.equal(result.rawLoad, 100);
  assert.equal(result.score, 0);
  assert.equal(result.level, "Poor Ingredient Score");
});

test("name and code aliases contribute only once by canonical ingredient id", () => {
  const result = calculate(["Red No. 3", "E127"]);

  assert.equal(result.scoredIngredients.length, 1);
  assert.equal(result.rawLoad, 25);
  assert.deepEqual(
    [...result.scoredIngredients[0]!.originalIngredientTexts].sort(),
    ["E127", "Red No. 3"],
  );
});

test("fortification, processed, unclear, and industrial ingredients use their requested points", () => {
  const result = calculate([
    "Ascorbic acid",
    "Milk powder",
    "Natural flavour",
    "Maltodextrin",
  ]);

  assert.equal(findIngredient(result, "Ascorbic acid")?.loadClass, "fortification");
  assert.equal(findIngredient(result, "Ascorbic acid")?.points, 0.5);
  assert.equal(findIngredient(result, "Milk powder")?.loadClass, "processed");
  assert.equal(findIngredient(result, "Milk powder")?.points, 2);
  assert.equal(findIngredient(result, "Natural flavour")?.loadClass, "unclear");
  assert.equal(findIngredient(result, "Natural flavour")?.points, 2);
  assert.equal(findIngredient(result, "Maltodextrin")?.loadClass, "industrial");
  assert.equal(findIngredient(result, "Maltodextrin")?.points, 3);
  assert.equal(result.rawLoad, 7.5);
});

test("a selected personal allergen stays ingredient-scored separately from its urgent override", () => {
  const result = calculate(["Milk"], ["milk"]);

  assert.equal(result.rawLoad, 1);
  assert.equal(result.score, 98);
  assert.equal(result.scoredIngredients[0]?.loadClass, "simple");
});
