import assert from "node:assert/strict";
import test from "node:test";

import {
  getOcrTargetDimensions,
  IngredientOcrTimeoutError,
  scoreOcrTextForIngredientLabel,
} from "./localIngredientOcr";

test("getOcrTargetDimensions upscales a small mobile label crop for OCR", () => {
  const result = getOcrTargetDimensions(500, 700);

  assert.equal(result.width, 1600);
  assert.equal(result.height, 2240);
  assert.ok(result.scale > 2);
});

test("getOcrTargetDimensions limits large phone photos to a mobile-safe pixel budget", () => {
  const result = getOcrTargetDimensions(4032, 3024);

  assert.ok(result.width <= 3200);
  assert.ok(result.width * result.height <= 6_500_000);
  assert.ok(result.scale < 1);
});

test("IngredientOcrTimeoutError has a stable error name for scanner recovery", () => {
  const error = new IngredientOcrTimeoutError();

  assert.equal(error.name, "IngredientOcrTimeoutError");
});

test("scoreOcrTextForIngredientLabel prefers ingredient-like OCR over nutrition noise", () => {
  const ingredientScore = scoreOcrTextForIngredientLabel(
    "Ingredients: water, sugar, cocoa, sodium benzoate",
    72,
  );
  const nutritionScore = scoreOcrTextForIngredientLabel(
    "Nutrition Information Energy 210kJ Protein 1g Barcode 6003678052405",
    72,
  );

  assert.ok(ingredientScore > nutritionScore);
});
