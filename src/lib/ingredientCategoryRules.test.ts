import assert from "node:assert/strict";
import test from "node:test";

import { applyIngredientCategoryRules } from "./ingredientCategoryRules";
import {
  matchIngredientIntelligence,
  type IngredientIntelligenceMatcherInput,
} from "./ingredientIntelligenceMatcher";

type RuleTestInput = IngredientIntelligenceMatcherInput & {
  ingredientListAvailable?: boolean;
};

function runRules(input: RuleTestInput) {
  const { ingredientListAvailable = true, ...matcherInput } = input;
  const matcherOutput = matchIngredientIntelligence(matcherInput);

  return applyIngredientCategoryRules({
    ...matcherOutput,
    productCategory: matcherInput.productCategory,
    ingredientListAvailable,
    userAllergyProfile: matcherInput.userAllergyProfile,
    externalSignals: matcherInput.externalSignals,
  });
}

function findSummary(
  output: ReturnType<typeof runRules>,
  categoryId: string,
) {
  const summary = output.categorySummaries.find(
    (entry) => entry.categoryId === categoryId,
  );

  assert.ok(summary, `Expected category summary for ${categoryId}`);
  return summary;
}

test("artificial colours become red at 3 matches by count overload", () => {
  const output = runRules({
    ingredients: ["Tartrazine", "Sunset Yellow FCF", "Allura Red AC"],
  });
  const summary = findSummary(output, "artificial_colours");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "count_overload");
});

test("preservatives become red at 3 matches by count overload", () => {
  const output = runRules({
    ingredients: ["Sodium benzoate", "Potassium sorbate", "Calcium propionate"],
  });
  const summary = findSummary(output, "preservatives_shelf_life_systems");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "count_overload");
});

test("artificial sweeteners become red at 3 matches by count overload", () => {
  const output = runRules({
    ingredients: ["Aspartame", "Sucralose", "Saccharin"],
  });
  const summary = findSummary(output, "artificial_sweeteners_sugar_substitutes");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "count_overload");
});

test("seed oils become red at 2 processed-oil matches by count overload", () => {
  const output = runRules({
    ingredients: ["Canola oil", "Soybean oil"],
  });
  const summary = findSummary(output, "seed_oils_processed_oils");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "count_overload");
});

test("hydrogenated oils become red from one partially hydrogenated oil match", () => {
  const output = runRules({
    ingredients: ["Partially hydrogenated soybean oil"],
  });
  const summary = findSummary(
    output,
    "hydrogenated_partially_hydrogenated_oils",
  );

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "direct_red_ingredient");
});

test("allergy risk becomes red when milk matches the user's allergy profile", () => {
  const output = runRules({
    ingredients: ["Milk powder"],
    userAllergyProfile: ["milk"],
  });
  const summary = findSummary(output, "allergy_risk");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "allergy_profile_match");
});

test("allergy risk stays yellow when milk is found without a user profile match", () => {
  const output = runRules({
    ingredients: ["Milk powder"],
    userAllergyProfile: [],
  });
  const summary = findSummary(output, "allergy_risk");

  assert.equal(summary.severity, "yellow");
  assert.equal(summary.redReasonType, undefined);
});

test("unknown review ingredients become red at 4 vague terms by count overload", () => {
  const output = runRules({
    ingredients: ["Natural flavour", "Seasoning", "Starch", "Vegetable oil"],
  });
  const summary = findSummary(output, "unknown_review");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "count_overload");
});

test("Cancer-linked Watch stays yellow with one yellow watch item", () => {
  const output = runRules({
    ingredients: ["BHA"],
  });
  const summary = findSummary(output, "cancer_linked_watch");

  assert.equal(summary.severity, "yellow");
});

test("Cancer-linked Watch becomes red with two yellow watch items", () => {
  const output = runRules({
    ingredients: ["BHA", "Sodium nitrite"],
  });
  const summary = findSummary(output, "cancer_linked_watch");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "count_overload");
});

test("natural positive ingredients do not cancel additive warnings", () => {
  const output = runRules({
    ingredients: ["Water", "Oats", "Sucralose"],
  });
  const naturalSummary = findSummary(output, "natural_positive");
  const sweetenerSummary = findSummary(
    output,
    "artificial_sweeteners_sugar_substitutes",
  );

  assert.equal(naturalSummary.severity, "green");
  assert.equal(sweetenerSummary.severity, "yellow");
});

test("ultra-processed indicators use simple green yellow red display labels", () => {
  const greenOutput = runRules({
    ingredients: ["Rolled oats"],
  });
  const redOutput = runRules({
    ingredients: [
      "Maltodextrin",
      "Modified starch",
      "Soy protein isolate",
      "Natural flavour",
    ],
  });
  const greenSummary = findSummary(greenOutput, "ultra_processed_indicators");
  const redSummary = findSummary(redOutput, "ultra_processed_indicators");

  assert.equal(greenSummary.displayLabel, "No major markers");
  assert.equal(greenSummary.severity, "green");
  assert.equal(redSummary.displayLabel, "High");
  assert.equal(redSummary.severity, "red");
});

test("heavy metals stay yellow for rice baby-food review markers", () => {
  const output = runRules({
    ingredients: ["Rice flour"],
    productCategory: "Baby / Kids Food",
  });
  const summary = findSummary(output, "heavy_metals");

  assert.equal(summary.severity, "yellow");
  assert.equal(summary.redReasonType, undefined);
});

test("heavy metals become red for a verified recall signal", () => {
  const output = runRules({
    ingredients: [],
    externalSignals: ["Heavy metal recall due to lead contamination"],
  });
  const summary = findSummary(output, "heavy_metals");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "verified_external_signal");
});

test("brand trust stays yellow for a lawsuit allegation", () => {
  const output = runRules({
    ingredients: [],
    externalSignals: ["Product-specific lawsuit allegation"],
  });
  const summary = findSummary(output, "brand_trust_safety");

  assert.equal(summary.severity, "yellow");
});

test("brand trust becomes red for an active official recall", () => {
  const output = runRules({
    ingredients: [],
    externalSignals: ["Active official recall for affected batch"],
  });
  const summary = findSummary(output, "brand_trust_safety");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "verified_external_signal");
});

test("total ingredients become red at 15 ingredients", () => {
  const output = runRules({
    ingredients: [
      "Water",
      "Salt",
      "Sugar",
      "Oats",
      "Rice flour",
      "Apple",
      "Banana",
      "Cinnamon",
      "Cocoa powder",
      "Sunflower oil",
      "Soy lecithin",
      "Natural flavour",
      "Maltodextrin",
      "Citric acid",
      "Caramel colour",
    ],
  });
  const summary = findSummary(output, "total_ingredients");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "long_ingredient_list");
});

test("natural vs processed becomes red at 60% or more processed share", () => {
  const output = runRules({
    ingredients: [
      "Water",
      "Maltodextrin",
      "Modified starch",
      "Vegetable oil",
      "Soy lecithin",
    ],
  });
  const summary = findSummary(output, "natural_vs_processed");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "high_processed_share");
});
