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

test("cleanOcrIngredientText separates an inline allergen statement", () => {
  const result = cleanOcrIngredientText(
    "Ingredients: water, sugar, cocoa. Contains: milk, soy.",
  );

  assert.equal(result.ingredientText, "water, sugar, cocoa");
  assert.equal(result.possibleAllergenStatement, "Contains: milk, soy");
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

test("cleanOcrIngredientText drops nutrition panel and contact text after ingredients", () => {
  const result = cleanOcrIngredientText(
    [
      "INGREDIENTS: Water, sugar, citric acid, sodium benzoate.",
      "NUTRITION INFORMATION",
      "Energy 210kJ",
      "Protein 0g",
      "Manufactured by Example Foods",
      "www.example.test",
    ].join("\n"),
  );

  assert.equal(result.ingredientText, "Water, sugar, citric acid, sodium benzoate");
  assert.doesNotMatch(result.ingredientText, /energy|protein|manufactured|www/i);
});

test("cleanOcrIngredientText rejects nutrition-only OCR as no ingredient text", () => {
  const result = cleanOcrIngredientText(
    "Nutrition Information\nEnergy 210kJ\nProtein 1g\nCarbohydrate 12g\nBarcode 6003678052405",
  );

  assert.equal(result.ingredientText, "");
});

test("cleanOcrIngredientText handles common OCR ingredient heading confusion", () => {
  const result = cleanOcrIngredientText("INGREDIENT5: Water, sugar, cocoa");

  assert.equal(result.ingredientText, "Water, sugar, cocoa");
});

test("cleanOcrIngredientText handles numeric and spelling OCR mistakes in ingredient headings", () => {
  const numericResult = cleanOcrIngredientText(
    "INGRED1ENTS: Water, sugar, sodium benzoate",
  );
  const spellingResult = cleanOcrIngredientText(
    "INGREDIANTS: Wheat flour, salt, yeast",
  );

  assert.equal(numericResult.ingredientText, "Water, sugar, sodium benzoate");
  assert.equal(spellingResult.ingredientText, "Wheat flour, salt, yeast");
});
