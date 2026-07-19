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

test("preservatives become red at 4 matches by count overload", () => {
  const output = runRules({
    ingredients: [
      "Sodium benzoate",
      "Potassium benzoate",
      "Sodium nitrite",
      "BHT",
    ],
  });
  const summary = findSummary(output, "preservatives_shelf_life_systems");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "count_overload");
});

test("artificial sweeteners become red at 3 matches by count overload", () => {
  const output = runRules({
    ingredients: ["Sucralose", "Saccharin", "Acesulfame potassium"],
  });
  const summary = findSummary(output, "artificial_sweeteners_sugar_substitutes");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "count_overload");
});

test("processed oil system markers become red at 3 matches by count overload", () => {
  const output = runRules({
    ingredients: ["Vegetable oil", "Vegetable shortening", "Frying oil"],
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

test("partially hydrogenated oil variants also become red banned/restricted matches", () => {
  const output = runRules({
    ingredients: ["Partially hydrogenated sunflower oil"],
  });
  const summary = findSummary(output, "banned_restricted_items");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "banned_restricted");
  assert.equal(summary.matchCount, 1);
});

test("generic hydrogenated oil does not make standalone hydrogenated category red after revised flag update", () => {
  const output = runRules({
    ingredients: ["Hydrogenated soybean oil"],
  });
  const summary = findSummary(
    output,
    "hydrogenated_partially_hydrogenated_oils",
  );

  assert.equal(summary.severity, "green");
  assert.equal(summary.redReasonType, undefined);
});

test("meat source claims stay green informational by themselves", () => {
  const output = runRules({
    ingredients: ["Grass-fed beef"],
  });
  const summary = findSummary(output, "meat_specific_concerns");

  assert.equal(summary.severity, "green");
  assert.equal(summary.displayLabel, "Info");
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

test("allergy risk stays green informational when milk is found without a user profile match", () => {
  const output = runRules({
    ingredients: ["Milk powder"],
    userAllergyProfile: [],
  });
  const summary = findSummary(output, "allergy_risk");

  assert.equal(summary.severity, "green");
  assert.equal(summary.displayLabel, "Info");
  assert.equal(summary.redReasonType, undefined);
});

test("unknown review ingredients stay yellow at 4 vague terms for MVP", () => {
  const output = runRules({
    ingredients: ["Natural flavour", "Seasoning", "Starch", "Vegetable oil"],
  });
  const summary = findSummary(output, "unknown_review");

  assert.equal(summary.severity, "yellow");
  assert.equal(summary.redReasonType, undefined);
});

test("Cancer-linked Watch stays yellow with one yellow watch item", () => {
  const output = runRules({
    ingredients: ["Sodium nitrite"],
  });
  const summary = findSummary(output, "cancer_linked_watch");

  assert.equal(summary.severity, "yellow");
});

test("Cancer-linked Watch stays yellow with two yellow watch items for MVP", () => {
  const output = runRules({
    ingredients: ["Sodium nitrite", "Potassium nitrate"],
  });
  const summary = findSummary(output, "cancer_linked_watch");

  assert.equal(summary.severity, "yellow");
  assert.equal(summary.redReasonType, undefined);
});

test("Cancer-linked Watch becomes red from a direct red watch item", () => {
  const output = runRules({
    ingredients: ["Red No. 3"],
  });
  const summary = findSummary(output, "cancer_linked_watch");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "direct_red_ingredient");
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
      "Corn syrup solids",
      "Modified starch",
      "Soy protein isolate",
      "Hydrolyzed vegetable protein",
      "Soy lecithin",
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

test("brand trust keeps lawsuit allegations informational until verified", () => {
  const output = runRules({
    ingredients: [],
    externalSignals: ["Product-specific lawsuit allegation"],
  });
  const summary = findSummary(output, "brand_trust_safety");

  assert.equal(summary.severity, "green");
  assert.equal(summary.displayLabel, "No");
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
