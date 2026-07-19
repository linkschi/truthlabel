import assert from "node:assert/strict";
import test from "node:test";

import { matchIngredientIntelligence } from "./ingredientIntelligenceMatcher";

function findDuplicateSafeMatch(
  output: ReturnType<typeof matchIngredientIntelligence>,
  categoryName: string,
) {
  return output.duplicateSafeMatches.find((match) =>
    match.matchedCategories.includes(categoryName),
  );
}

function findCategorySummary(
  output: ReturnType<typeof matchIngredientIntelligence>,
  categoryName: string,
) {
  return output.matchedCategories.find(
    (category) => category.categoryName === categoryName,
  );
}

test("Red No. 3 and E127 collapse to one duplicate-safe canonical ingredient", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["Red No. 3", "E127"],
  });

  assert.equal(output.duplicateSafeMatches.length, 1);
  assert.ok(
    output.duplicateSafeMatches[0].matchedCategories.includes(
      "Artificial Colours",
    ),
  );
  assert.ok(
    output.duplicateSafeMatches[0].matchedCategories.includes(
      "Banned / Restricted Items",
    ),
  );
  assert.ok(
    output.duplicateSafeMatches[0].matchedCategories.includes(
      "Harmful Additives",
    ),
  );
  assert.ok(
    output.duplicateSafeMatches[0].matchedCategories.includes(
      "Cancer-linked Watch",
    ),
  );
});

test("Aspartame and E951 collapse to one duplicate-safe sweetener match", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["Aspartame", "E951"],
  });

  assert.equal(output.duplicateSafeMatches.length, 1);
  assert.ok(
    output.duplicateSafeMatches[0].matchedCategories.includes(
      "Artificial Sweeteners / Sugar Substitutes",
    ),
  );
});

test("Sodium benzoate and E211 collapse to one duplicate-safe preservative match", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["Sodium benzoate", "E211"],
  });

  assert.equal(output.duplicateSafeMatches.length, 1);
  assert.ok(
    output.duplicateSafeMatches[0].matchedCategories.includes(
      "Preservatives & Shelf-Life Systems",
    ),
  );
});

test("allergy profile match upgrades milk allergy risk to red", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["milk powder"],
    userAllergyProfile: ["milk"],
  });
  const milkMatch = findDuplicateSafeMatch(output, "Allergy Risk");

  assert.ok(milkMatch);
  assert.equal(milkMatch.basicSeveritySuggestion, "red");
  assert.equal(milkMatch.evidenceType, "user_profile");
});

test("allergy risk stays informational without a matching user profile", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["milk powder"],
    userAllergyProfile: [],
  });
  const milkMatch = findDuplicateSafeMatch(output, "Allergy Risk");

  assert.ok(milkMatch);
  assert.equal(milkMatch.basicSeveritySuggestion, "green");
});

test("eggplant does not trigger egg allergy", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["eggplant"],
  });

  assert.equal(findCategorySummary(output, "Allergy Risk"), undefined);
});

test("milk thistle does not trigger milk allergy", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["milk thistle"],
  });

  assert.equal(findCategorySummary(output, "Allergy Risk"), undefined);
});

test("nutritional yeast does not trigger nut allergy", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["nutritional yeast"],
  });

  assert.equal(findCategorySummary(output, "Allergy Risk"), undefined);
});

test("natural flavour matches unknown review and flavouring but not natural positive", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["natural flavour"],
  });
  const naturalFlavour = output.duplicateSafeMatches[0];

  assert.ok(
    naturalFlavour.matchedCategories.includes("Unknown / Review Ingredients"),
  );
  assert.ok(
    naturalFlavour.matchedCategories.includes(
      "Flavour Enhancers / Flavourings",
    ),
  );
  assert.ok(
    !naturalFlavour.matchedCategories.includes("Natural / Positive Ingredients"),
  );
});

test("vegetable oil matches warning categories and not natural positive", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["vegetable oil"],
  });
  const vegetableOil = output.duplicateSafeMatches[0];

  assert.ok(
    vegetableOil.matchedCategories.includes("Seed Oils / Processed Oils"),
  );
  assert.ok(
    vegetableOil.matchedCategories.includes("Unknown / Review Ingredients"),
  );
  assert.ok(
    !vegetableOil.matchedCategories.includes("Natural / Positive Ingredients"),
  );
});

test("heavy metals show yellow review markers for baby food rice context, not red contamination", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["rice flour"],
    productCategory: "Baby / Kids Food",
  });
  const heavyMetals = findCategorySummary(output, "Heavy Metals");

  assert.ok(heavyMetals);
  assert.equal(heavyMetals.highestSeveritySuggestion, "yellow");
});

test("microplastics keep bottled water PET packaging informational, not red contamination", () => {
  const output = matchIngredientIntelligence({
    ingredients: [],
    productName: "Bottled Water",
    packagingText: "PET bottle",
  });
  const microplastics = findCategorySummary(output, "Microplastics");

  assert.ok(microplastics);
  assert.equal(microplastics.highestSeveritySuggestion, "green");
});

test("small salt ingredients do not trigger the salt microplastics review marker by themselves", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["Rolled oats", "Sea salt"],
  });

  assert.equal(findCategorySummary(output, "Microplastics"), undefined);
});

test("plain rolled oats do not trigger wheat or gluten allergy risk by themselves", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["Rolled oats"],
  });

  assert.equal(findCategorySummary(output, "Allergy Risk"), undefined);
});

test("soy-free wording does not trigger soy allergy from the free-from phrase alone", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["soy-free snack seasoning"],
  });

  assert.equal(findCategorySummary(output, "Allergy Risk"), undefined);
});

test("gluten-free oats does not trigger gluten allergy from the free-from phrase alone", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["gluten-free oats"],
  });

  assert.equal(findCategorySummary(output, "Allergy Risk"), undefined);
});

test("oil-free wording does not trigger processed-oil categories from the free-from phrase alone", () => {
  const output = matchIngredientIntelligence({
    ingredients: ["oil-free popcorn seasoning"],
  });

  assert.equal(findCategorySummary(output, "Seed Oils / Processed Oils"), undefined);
  assert.equal(findCategorySummary(output, "Fry Oil / Fast Food Oil"), undefined);
});
