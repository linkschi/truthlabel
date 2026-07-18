import assert from "node:assert/strict";
import test from "node:test";

import { applyIngredientCategoryRules } from "./ingredientCategoryRules";
import { calculateExposureRisk } from "./calculateExposureRisk";
import {
  matchIngredientIntelligence,
  type IngredientIntelligenceMatcherInput,
} from "./ingredientIntelligenceMatcher";

type ScoringTestInput = IngredientIntelligenceMatcherInput & {
  ingredientListAvailable?: boolean;
  ingredientCount?: number;
};

function runExposureRisk(input: ScoringTestInput) {
  const matcherOutput = matchIngredientIntelligence(input);
  const ingredientListAvailable =
    input.ingredientListAvailable ?? input.ingredients.length > 0;
  const categoryRules = applyIngredientCategoryRules({
    ...matcherOutput,
    productCategory: input.productCategory,
    ingredientListAvailable,
    userAllergyProfile: input.userAllergyProfile,
    externalSignals: input.externalSignals,
    ingredientCount: input.ingredientCount ?? input.ingredients.length,
  });

  return calculateExposureRisk({
    categorySummaries: categoryRules.categorySummaries,
    matchedIngredients: matcherOutput.matchedIngredients,
    duplicateSafeMatches: matcherOutput.duplicateSafeMatches,
    ingredientGroups: matcherOutput.ingredientGroups,
    ingredientCount: input.ingredientCount ?? input.ingredients.length,
    productCategory: input.productCategory,
    userAllergyProfile: input.userAllergyProfile,
    externalSignals: input.externalSignals,
  });
}

test("clean simple product stays in the low-risk green band", () => {
  const result = runExposureRisk({
    ingredients: ["Water", "Apple", "Banana"],
  });

  assert.ok(result.exposureRisk >= 0 && result.exposureRisk <= 24);
  assert.equal(result.verdictTone, "green");
  assert.equal(result.verdictLabel, "Clean Pass");
});

test("one yellow preservative lands in the yellow review band", () => {
  const result = runExposureRisk({
    ingredients: ["Water", "Sodium benzoate"],
  });

  assert.ok(result.exposureRisk >= 25 && result.exposureRisk <= 49);
  assert.equal(result.verdictTone, "yellow");
});

test("four preservatives force a red score of at least 65", () => {
  const result = runExposureRisk({
    ingredients: [
      "Sodium benzoate",
      "Potassium sorbate",
      "Calcium propionate",
      "Sodium nitrite",
    ],
  });

  assert.ok(result.exposureRisk >= 65);
  assert.equal(result.verdictTone, "red");
});

test("a banned or restricted ingredient forces the score to at least 85", () => {
  const result = runExposureRisk({
    ingredients: ["Red No. 3"],
  });

  assert.ok(result.exposureRisk >= 85);
  assert.equal(result.verdictLabel, "Strong Warning");
});

test("an allergy-profile match forces the score to at least 90", () => {
  const result = runExposureRisk({
    ingredients: ["Milk powder"],
    userAllergyProfile: ["milk"],
  });

  assert.ok(result.exposureRisk >= 90);
  assert.equal(result.verdictLabel, "Strong Warning");
});

test("a partially hydrogenated oil forces the score to at least 80", () => {
  const result = runExposureRisk({
    ingredients: ["Partially hydrogenated soybean oil"],
  });

  assert.ok(result.exposureRisk >= 80);
  assert.equal(result.verdictTone, "red");
});

test("many yellow issues cap at 64 when no category turns red", () => {
  const result = runExposureRisk({
    ingredients: [
      "Tartrazine",
      "Aspartame",
      "Sodium benzoate",
      "Water",
      "Apple",
      "Banana",
      "Olive oil",
    ],
    productCategory: "Baby / Kids Food",
    packagingText: "PET bottle",
  });

  assert.ok(result.exposureRisk >= 25 && result.exposureRisk <= 64);
  assert.equal(result.verdictLabel, "High Review");
  assert.equal(result.verdictTone, "yellow");
  assert.ok(
    result.scoreBreakdown.every((entry) => entry.reasonType !== "count_overload"),
  );
});

test("many yellow issues can exceed 65 after category overload rules trigger", () => {
  const result = runExposureRisk({
    ingredients: ["Aspartame", "Sucralose", "Acesulfame potassium"],
  });

  assert.ok(result.exposureRisk >= 65);
  assert.equal(result.verdictTone, "red");
});

test("hidden customer categories do not add independent score entries", () => {
  const result = runExposureRisk({
    ingredients: ["Tartrazine", "Sunset Yellow FCF", "Allura Red AC"],
  });
  const hiddenCategoryIds = new Set([
    "artificial_colours",
    "artificial_engineered_food_construction",
    "additives_and_preservatives",
  ]);

  assert.ok(
    result.scoreBreakdown.every(
      (entry) => !entry.categoryId || !hiddenCategoryIds.has(entry.categoryId),
    ),
  );
  assert.ok(
    result.mainReasons.every(
      (reason) => !hiddenCategoryIds.has(reason.categoryId),
    ),
  );
});

test("Red No. 3 scores once as one canonical direct red signal across categories", () => {
  const result = runExposureRisk({
    ingredients: ["Red No. 3", "E127"],
  });
  const directEntries = result.scoreBreakdown.filter(
    (entry) =>
      entry.reasonType === "direct_red_signal" &&
      entry.ingredientId === "erythrosine",
  );

  assert.equal(directEntries.length, 1);
  assert.equal(directEntries[0]?.points, 35);
  assert.ok(result.mainReasons.some((reason) => reason.categoryId === "banned_restricted_items"));
});

test("an active official recall forces the score to at least 90", () => {
  const result = runExposureRisk({
    ingredients: [],
    ingredientListAvailable: false,
    externalSignals: ["Active official recall for affected batch"],
  });

  assert.ok(result.exposureRisk >= 90);
  assert.equal(result.verdictLabel, "Strong Warning");
});

test("a heavy-metals category marker only stays yellow and not red", () => {
  const result = runExposureRisk({
    ingredients: ["Rice flour"],
    productCategory: "Baby / Kids Food",
  });

  assert.ok(result.exposureRisk >= 25 && result.exposureRisk <= 64);
  assert.equal(result.verdictTone, "yellow");
});

test("a verified heavy-metals warning forces the score to at least 90", () => {
  const result = runExposureRisk({
    ingredients: [],
    ingredientListAvailable: false,
    externalSignals: ["Heavy metal recall due to lead contamination"],
  });

  assert.ok(result.exposureRisk >= 90);
  assert.equal(result.verdictLabel, "Strong Warning");
});

test("a microplastic packaging marker only stays yellow and not red", () => {
  const result = runExposureRisk({
    ingredients: [],
    ingredientListAvailable: false,
    productName: "Bottled Water",
    packagingText: "PET bottle",
  });

  assert.ok(result.exposureRisk >= 25 && result.exposureRisk <= 64);
  assert.equal(result.verdictTone, "yellow");
});

test("microplastic detection wording stays yellow without official red evidence", () => {
  const result = runExposureRisk({
    ingredients: [],
    ingredientListAvailable: false,
    externalSignals: ["Verified microplastics detected in the product sample"],
  });

  assert.ok(result.exposureRisk >= 25 && result.exposureRisk <= 64);
  assert.equal(result.verdictTone, "yellow");
});

test("a long ingredient list at 15+ ingredients raises the score into red", () => {
  const result = runExposureRisk({
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

  assert.ok(result.exposureRisk >= 65);
  assert.ok(
    result.scoreBreakdown.some(
      (entry) => entry.categoryId === "total_ingredients" && entry.points === 15,
    ),
  );
});

test("a 60% or greater processed share raises the score into red", () => {
  const result = runExposureRisk({
    ingredients: [
      "Water",
      "Maltodextrin",
      "Modified starch",
      "Vegetable oil",
      "Soy lecithin",
    ],
  });

  assert.ok(result.exposureRisk >= 65);
  assert.ok(
    result.scoreBreakdown.some(
      (entry) =>
        entry.categoryId === "natural_vs_processed" && entry.points === 22,
    ),
  );
});
