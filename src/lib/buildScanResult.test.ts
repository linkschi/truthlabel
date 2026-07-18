import assert from "node:assert/strict";
import test from "node:test";

import { buildScanResult } from "./buildScanResult";
import { calculateExposureRisk } from "./calculateExposureRisk";
import { applyIngredientCategoryRules } from "./ingredientCategoryRules";
import {
  matchIngredientIntelligence,
  normalizeIngredientIntelligenceText,
  type IngredientIntelligenceMatcherInput,
} from "./ingredientIntelligenceMatcher";

type ScanResultTestInput = IngredientIntelligenceMatcherInput & {
  ingredientListAvailable?: boolean;
  productName?: string;
  brandName?: string;
  barcode?: string;
  scanSource?: "manual_paste" | "barcode" | "ocr" | "demo";
};

function buildResult(input: ScanResultTestInput) {
  const matcherResult = matchIngredientIntelligence(input);
  const ingredientListAvailable =
    input.ingredientListAvailable ?? input.ingredients.length > 0;
  const ingredientCount = new Set(
    input.ingredients.map(normalizeIngredientIntelligenceText).filter(Boolean),
  ).size;
  const categoryRules = applyIngredientCategoryRules({
    ...matcherResult,
    productCategory: input.productCategory,
    ingredientListAvailable,
    userAllergyProfile: input.userAllergyProfile,
    externalSignals: input.externalSignals,
    ingredientCount,
  });
  const exposureRiskResult = calculateExposureRisk({
    categorySummaries: categoryRules.categorySummaries,
    matchedIngredients: matcherResult.matchedIngredients,
    duplicateSafeMatches: matcherResult.duplicateSafeMatches,
    ingredientGroups: matcherResult.ingredientGroups,
    ingredientCount,
    productCategory: input.productCategory,
    userAllergyProfile: input.userAllergyProfile,
    externalSignals: input.externalSignals,
  });

  return buildScanResult({
    productName: input.productName,
    brandName: input.brandName,
    barcode: input.barcode,
    productCategory: input.productCategory,
    ingredients: input.ingredients,
    ingredientListAvailable,
    matcherResult,
    categorySummaries: categoryRules.categorySummaries,
    exposureRiskResult,
    userAllergyProfile: input.userAllergyProfile,
    externalSignals: input.externalSignals,
    scanSource: input.scanSource ?? "demo",
  });
}

function findQuickOverviewRow(result: ReturnType<typeof buildResult>, categoryId: string) {
  return result.quickOverview.find((row) => row.categoryId === categoryId);
}

function findDeepCheck(result: ReturnType<typeof buildResult>, categoryId: string) {
  return result.deepExposureChecks.find((row) => row.categoryId === categoryId);
}

test("clean product builds a green hero and natural ingredient grouping", () => {
  const result = buildResult({
    ingredients: ["Water", "Apple", "Banana"],
    productName: "Simple Fruit Cup",
    brandName: "Example Foods",
  });

  assert.equal(result.productHero.verdictTone, "green");
  assert.equal(result.finalVerdict.headline, "Clean Pass");
  assert.equal(result.ingredientBreakdown.naturalPositive.length, 3);
  assert.equal(result.ingredientBreakdown.processedArtificial.length, 0);
  assert.equal(result.ingredientBreakdown.unknownReview.length, 0);
});

test("Red No. 3 keeps artificial-colour overlap internal and shows visible red warnings", () => {
  const result = buildResult({
    ingredients: ["Red No. 3"],
  });

  const bannedRow = findQuickOverviewRow(result, "banned_restricted_items");
  const artificialColourRow = findQuickOverviewRow(result, "artificial_colours");
  const itemMatches = result.ingredientBreakdown.processedArtificial.filter(
    (item) => item.canonicalIngredientId === "erythrosine",
  );

  assert.equal(bannedRow?.severity, "red");
  assert.equal(artificialColourRow, undefined);
  assert.equal(result.finalVerdict.verdictTone, "red");
  assert.equal(itemMatches.length, 1);
  assert.ok(itemMatches[0]?.matchedCategories.includes("Banned / Restricted Items"));
  assert.ok(itemMatches[0]?.matchedCategories.includes("Artificial Colours"));
});

test("detailed ingredient-system categories are hidden from Quick Overview", () => {
  const result = buildResult({
    ingredients: [
      "Tartrazine",
      "Textured vegetable protein",
      "Natural flavour",
      "Sodium benzoate",
    ],
  });
  const quickOverviewIds = result.quickOverview.map((row) => row.categoryId);

  assert.ok(!quickOverviewIds.includes("artificial_colours"));
  assert.ok(!quickOverviewIds.includes("artificial_sweeteners_sugar_substitutes"));
  assert.ok(!quickOverviewIds.includes("artificial_engineered_food_construction"));
  assert.ok(!quickOverviewIds.includes("additives_and_preservatives"));
  assert.ok(!quickOverviewIds.includes("emulsifiers_stabilisers_thickeners_gums"));
  assert.ok(!quickOverviewIds.includes("flavour_enhancers_flavourings"));
  assert.ok(!quickOverviewIds.includes("hydrogenated_partially_hydrogenated_oils"));
  assert.ok(!quickOverviewIds.includes("natural_positive"));
  assert.ok(!quickOverviewIds.includes("preservatives_shelf_life_systems"));
  assert.ok(!quickOverviewIds.includes("unknown_review"));
});

test("Ingredient Count appears in Quick Overview while unique counts stay available internally", () => {
  const result = buildResult({
    ingredients: ["Water", "Water", "Sugar"],
  });
  const totalIngredientsRow = findQuickOverviewRow(result, "total_ingredients");

  assert.equal(totalIngredientsRow?.displayValue, "2");
  assert.equal(totalIngredientsRow?.severity, "green");
  assert.equal(result.quickOverview.at(-1)?.categoryId, "total_ingredients");
  assert.equal(result.productHero.ingredientCount, 2);
  assert.equal(result.ingredientBreakdown.totalIngredients, 2);
});

test("Ultra-Processed overview uses the simplified display labels", () => {
  const cleanResult = buildResult({
    ingredients: ["Rolled oats"],
  });
  const redResult = buildResult({
    ingredients: [
      "Maltodextrin",
      "Modified starch",
      "Soy protein isolate",
      "Natural flavour",
    ],
  });

  assert.equal(
    findQuickOverviewRow(cleanResult, "ultra_processed_indicators")?.displayValue,
    "No major markers",
  );
  assert.equal(
    findQuickOverviewRow(redResult, "ultra_processed_indicators")?.displayValue,
    "High",
  );
});

test("three preservatives make preservatives red by count overload and final verdict red", () => {
  const result = buildResult({
    ingredients: ["Sodium benzoate", "Potassium sorbate", "Calcium propionate"],
  });

  const preservativeOverviewRow = findQuickOverviewRow(
    result,
    "preservatives_shelf_life_systems",
  );

  assert.equal(preservativeOverviewRow, undefined);
  assert.equal(
    findDeepCheck(result, "preservatives_shelf_life_systems")?.severity,
    "red",
  );
  assert.equal(
    findDeepCheck(result, "preservatives_shelf_life_systems")?.redReasonType,
    "count_overload",
  );
  assert.equal(result.finalVerdict.verdictTone, "red");
});

test("texture additive category stays out of Deep Exposure", () => {
  const result = buildResult({
    ingredients: ["Xanthan gum"],
  });

  assert.equal(
    findDeepCheck(result, "emulsifiers_stabilisers_thickeners_gums"),
    undefined,
  );
});

test("explicit meat-specific ingredient matches still appear in unrelated product contexts", () => {
  const result = buildResult({
    productName: "Chocolate cereal",
    productCategory: "Packaged / Processed Foods",
    ingredients: ["Mechanically separated chicken"],
  });

  assert.equal(findQuickOverviewRow(result, "meat_specific_concerns")?.severity, "yellow");
  assert.equal(findDeepCheck(result, "meat_specific_concerns")?.severity, "yellow");
});

test("meat-specific concerns appear in meat product contexts", () => {
  const result = buildResult({
    productName: "Chicken sausage",
    productCategory: "Meat / Fast Food",
    ingredients: ["Mechanically separated chicken"],
  });

  assert.ok(findDeepCheck(result, "meat_specific_concerns"));
});

test("milk allergy profile match creates a red allergy check and strong warning verdict", () => {
  const result = buildResult({
    ingredients: ["Milk powder"],
    userAllergyProfile: ["milk"],
  });

  const allergyRow = findDeepCheck(result, "allergy_risk");

  assert.equal(allergyRow?.severity, "red");
  assert.ok(result.productHero.exposureRisk >= 90);
  assert.equal(result.finalVerdict.headline, "Strong Warning");
});

test("milk without a matching allergy profile stays yellow but hides from Deep Exposure", () => {
  const result = buildResult({
    ingredients: ["Milk powder"],
  });

  const allergyOverviewRow = findQuickOverviewRow(result, "allergy_risk");
  const allergyDeepRow = findDeepCheck(result, "allergy_risk");

  assert.equal(allergyOverviewRow?.severity, "yellow");
  assert.equal(allergyDeepRow, undefined);
});

test("natural flavour stays out of natural ingredients and lands in unknown review", () => {
  const result = buildResult({
    ingredients: ["Natural flavour"],
  });

  const unknownItem = result.ingredientBreakdown.unknownReview.find(
    (item) => item.originalText === "Natural flavour",
  );

  assert.equal(result.ingredientBreakdown.naturalPositive.length, 0);
  assert.equal(unknownItem?.group, "unknown_review");
  assert.ok(
    unknownItem?.matchedCategories.includes("Unknown / Review Ingredients"),
  );
  assert.ok(
    unknownItem?.matchedCategories.includes("Flavour Enhancers / Flavourings"),
  );
});

test("vegetable oil lands in unknown review and not natural positive", () => {
  const result = buildResult({
    ingredients: ["Vegetable oil"],
  });

  const unknownItem = result.ingredientBreakdown.unknownReview.find(
    (item) => item.originalText === "Vegetable oil",
  );

  assert.equal(result.ingredientBreakdown.naturalPositive.length, 0);
  assert.equal(unknownItem?.group, "unknown_review");
  assert.ok(
    unknownItem?.matchedCategories.includes("Seed Oils / Processed Oils"),
  );
  assert.ok(
    unknownItem?.matchedCategories.includes("Unknown / Review Ingredients"),
  );
});

test("unchecked heavy metals and brand safety stay out of Deep Exposure issues", () => {
  const result = buildResult({
    ingredients: ["Water", "Apple"],
  });

  const heavyMetalsRow = findDeepCheck(result, "heavy_metals");
  const brandTrustRow = findDeepCheck(result, "brand_trust_safety");

  assert.equal(heavyMetalsRow, undefined);
  assert.equal(brandTrustRow, undefined);
  assert.equal(result.brandTrustSafety.status, "not_checked");
  assert.equal(result.brandTrustSafety.severity, null);
});

test("active official recall creates a red brand-trust section and red final verdict", () => {
  const result = buildResult({
    ingredients: [],
    ingredientListAvailable: false,
    externalSignals: ["Active official recall for affected batch"],
  });

  assert.equal(result.brandTrustSafety.status, "red_warning");
  assert.equal(result.brandTrustSafety.severity, "red");
  assert.equal(result.finalVerdict.verdictTone, "red");
});

test("Cancer-linked Watch keeps careful wording and avoids unsafe claims", () => {
  const result = buildResult({
    ingredients: ["BHA"],
  });

  const cancerRow = findDeepCheck(result, "cancer_linked_watch");
  const combinedText = [
    cancerRow?.shortMessage ?? "",
    result.finalVerdict.summary,
    ...result.confidenceNotes,
  ].join(" ");

  assert.ok(cancerRow?.shortMessage.includes("not proof"));
  assert.ok(!/gives you cancer/i.test(combinedText));
  assert.ok(!/poison/i.test(combinedText));
  assert.ok(!/toxic/i.test(combinedText));
});
