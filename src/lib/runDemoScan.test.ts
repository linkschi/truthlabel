import assert from "node:assert/strict";
import test from "node:test";

import { getDemoProductById, type DemoProduct } from "@/data/demoProducts";

import { runDemoScan } from "./runDemoScan";

function runProduct(
  productId: string,
  options?: Parameters<typeof runDemoScan>[1],
) {
  return runDemoScan(getDemoProductById(productId), options);
}

function findCategorySummary(
  output: ReturnType<typeof runProduct>,
  categoryId: string,
) {
  const summary = output.categorySummaries.find(
    (entry) => entry.categoryId === categoryId,
  );

  assert.ok(summary, `Expected category summary for ${categoryId}`);
  return summary;
}

test("Clean Simple Oats stays a low-concern demo result", () => {
  const output = runProduct("simple-rolled-oats");

  assert.equal(output.scanResult.productHero.productName, "Simple Rolled Oats");
  assert.equal(output.scanResult.productHero.verdictTone, "green");
  assert.equal(output.scanResult.finalVerdict.headline, "Clean Pass");
  assert.ok(output.scanResult.ingredientBreakdown.naturalPositive.length >= 1);
});

test("Red No. 3 and E127 stay one canonical match inside the demo scan runner", () => {
  const baseProduct = getDemoProductById("red-berry-soda");
  const aliasProduct: DemoProduct = {
    ...baseProduct,
    id: "red-berry-soda-with-e127",
    ingredients: [...baseProduct.ingredients, "E127"],
  };
  const output = runDemoScan(aliasProduct);
  const erythrosineMatch = output.matcherResult.duplicateSafeMatches.find(
    (match) => match.canonicalIngredientId === "erythrosine",
  );

  assert.ok(erythrosineMatch);
  assert.deepEqual(
    [...erythrosineMatch.originalIngredientTexts].sort(),
    ["E127", "Red No. 3"],
  );
  assert.equal(
    output.matcherResult.duplicateSafeMatches.filter(
      (match) => match.canonicalIngredientId === "erythrosine",
    ).length,
    1,
  );
});

test("Zero Sugar Citrus Drink triggers red sweetener overload", () => {
  const output = runProduct("zero-sugar-citrus-drink");
  const summary = findCategorySummary(
    output,
    "artificial_sweeteners_sugar_substitutes",
  );

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "count_overload");
  assert.equal(summary.matchCount, 3);
});

test("Shelf Stable Sauce keeps three preservatives at yellow review", () => {
  const output = runProduct("shelf-stable-sauce");
  const summary = findCategorySummary(output, "preservatives_shelf_life_systems");

  assert.equal(summary.severity, "yellow");
  assert.equal(summary.redReasonType, undefined);
  assert.equal(summary.matchCount, 3);
});

test("Chocolate Milk Drink becomes red for Allergy Risk with a milk profile match", () => {
  const output = runProduct("chocolate-milk-drink", {
    userAllergyProfile: ["milk"],
  });
  const allergySummary = findCategorySummary(output, "allergy_risk");

  assert.equal(allergySummary.severity, "red");
  assert.equal(allergySummary.redReasonType, "allergy_profile_match");
  assert.ok(output.scanResult.productHero.exposureRisk >= 90);
  assert.equal(output.scanResult.finalVerdict.headline, "Strong Warning");
});

test("Baby Rice Puffs keep Heavy Metals at yellow review, not red", () => {
  const output = runProduct("baby-rice-puffs");
  const summary = findCategorySummary(output, "heavy_metals");

  assert.equal(summary.severity, "yellow");
  assert.equal(summary.redReasonType, undefined);
});

test("Spring Water keeps Microplastics at yellow review, not red", () => {
  const output = runProduct("spring-water");
  const summary = findCategorySummary(output, "microplastics");

  assert.equal(summary.severity, "yellow");
  assert.equal(summary.redReasonType, undefined);
});

test("Old Formula Citrus Drink makes BVO red without duplicate category counting", () => {
  const output = runProduct("old-formula-citrus-drink");
  const bannedSummary = findCategorySummary(output, "banned_restricted_items");
  const harmfulSummary = findCategorySummary(output, "harmful_additives");
  const bvoMatch = output.matcherResult.duplicateSafeMatches.find((match) =>
    match.matchedCategories.includes("Banned / Restricted Items") &&
    match.matchedCategories.includes("Harmful Additives"),
  );

  assert.equal(bannedSummary.severity, "red");
  assert.equal(harmfulSummary.severity, "red");
  assert.ok(bvoMatch);
  assert.equal(
    output.matcherResult.duplicateSafeMatches.filter((match) =>
      match.matchedCategories.includes("Banned / Restricted Items"),
    ).length,
    1,
  );
});

test("natural flavour stays out of Natural / Positive in demo products", () => {
  const output = runProduct("red-berry-soda");

  assert.equal(
    output.scanResult.ingredientBreakdown.naturalPositive.some(
      (item) => item.originalText === "Natural flavour",
    ),
    false,
  );
  assert.equal(
    output.scanResult.ingredientBreakdown.unknownReview.some(
      (item) => item.originalText === "Natural flavour",
    ),
    true,
  );
});

test("vegetable oil stays out of Natural / Positive in demo products", () => {
  const output = runProduct("mystery-protein-bar");
  const inNaturalPositive = output.scanResult.ingredientBreakdown.naturalPositive.some(
    (item) => item.originalText === "Vegetable oil",
  );
  const inWarningGroups =
    output.scanResult.ingredientBreakdown.unknownReview.some(
      (item) => item.originalText === "Vegetable oil",
    ) ||
    output.scanResult.ingredientBreakdown.processedArtificial.some(
      (item) => item.originalText === "Vegetable oil",
    );

  assert.equal(inNaturalPositive, false);
  assert.equal(inWarningGroups, true);
});

test("Natural / Positive ingredients do not cancel serious warning categories", () => {
  const output = runProduct("chocolate-milk-drink", {
    userAllergyProfile: ["milk"],
  });
  const allergySummary = findCategorySummary(output, "allergy_risk");

  assert.ok(output.scanResult.ingredientBreakdown.naturalPositive.length > 0);
  assert.equal(allergySummary.severity, "red");
  assert.equal(output.scanResult.finalVerdict.verdictTone, "red");
});
