import assert from "node:assert/strict";
import test from "node:test";

import {
  extractInlineAllergenStatement,
  parseIngredientInput,
} from "./parseIngredientInput";

test("parseIngredientInput trims label prefixes and inline allergen statements", () => {
  const input = "Ingredients: Water;\nSugar,\nCitric acid. Contains: milk.";

  assert.deepEqual(parseIngredientInput(input), [
    "Water",
    "Sugar",
    "Citric acid",
  ]);
  assert.equal(extractInlineAllergenStatement(input), "Contains: milk");
});

test("parseIngredientInput returns an empty list for blank input", () => {
  assert.deepEqual(parseIngredientInput("   \n  "), []);
  assert.equal(extractInlineAllergenStatement("   "), undefined);
});
