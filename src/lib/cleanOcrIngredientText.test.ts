import assert from "node:assert/strict";
import test from "node:test";

import { cleanOcrIngredientText } from "./cleanOcrIngredientText";

test('cleanOcrIngredientText removes "Ingredients:" and separates allergen text', () => {
  const result = cleanOcrIngredientText(
    "INGREDIENTS: WATER\nSUGAR\nRED NO. 3\nContains: milk and soy.",
  );

  assert.equal(result.ingredientText, "Water, sugar, red no. 3");
  assert.equal(result.possibleAllergenStatement, "Contains: milk and soy");
  assert.ok(
    result.confidenceWarnings.includes(
      "OCR may have misread some words. Please review before scanning.",
    ),
  );
  assert.ok(
    result.confidenceWarnings.includes(
      "Allergen statements may need manual checking.",
    ),
  );
});

test("cleanOcrIngredientText preserves uncertain OCR text when it is not clearly wrong", () => {
  const result = cleanOcrIngredientText(
    "Ingredients: sugar, xanthan gurn, natural flavour",
  );

  assert.match(result.ingredientText, /xanthan gurn/i);
  assert.match(result.ingredientText, /natural flavour/i);
});

test("cleanOcrIngredientText adds a low-confidence warning when OCR confidence is weak", () => {
  const result = cleanOcrIngredientText("Ingredients: water", {
    averageConfidence: 58,
  });

  assert.ok(
    result.confidenceWarnings.includes(
      "OCR confidence was low, so some ingredient warnings may be incomplete.",
    ),
  );
});
