import assert from "node:assert/strict";
import test from "node:test";

import type { UserProfile } from "@/data/fakeProduct";
import { analyzeNormalizedProduct } from "./analyzeNormalizedProduct";

const quietProfile: UserProfile = {
  allergies: [],
  avoid: [],
};

test("real product analysis flags a yellow artificial colour match", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10001",
      name: "Test Drink",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Tartrazine",
          text: "Tartrazine (E102)",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const ingredient = result.ingredients[0];
  const scanCheck = result.scanChecks.find((item) => item.id === "scan-artificial-colours");

  assert.equal(ingredient.level, "yellow");
  assert.ok(ingredient.badges.includes("ARTIFICIAL COLOUR FOUND"));
  assert.equal(scanCheck?.tone, "yellow");
  assert.equal(scanCheck?.status, "Found");
  assert.ok(result.watchListHits.includes("Artificial colours"));
});

test("real product analysis flags a red restricted artificial colour match", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10002",
      name: "Test Candy",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Red No. 3",
          text: "Red No. 3 (E127)",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const ingredient = result.ingredients[0];
  const scanCheck = result.scanChecks.find((item) => item.id === "scan-artificial-colours");
  const restrictedCheck = result.scanChecks.find(
    (item) => item.id === "scan-banned-restricted",
  );

  assert.equal(ingredient.level, "red");
  assert.equal(ingredient.rowStatusLabel, "Restricted");
  assert.ok(ingredient.badges.includes("BANNED / RESTRICTED COLOUR"));
  assert.equal(scanCheck?.tone, "red");
  assert.equal(restrictedCheck?.tone, "red");
  assert.ok(result.immediateWarnings.some((item) => item.id === "real-restricted-item"));
});

test("real product analysis flags flavour systems as yellow review items", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10003",
      name: "Test Soup",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Yeast extract",
          text: "Yeast extract",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const ingredient = result.ingredients[0];
  const scanCheck = result.scanChecks.find((item) => item.id === "scan-flavour-systems");

  assert.equal(ingredient.level, "yellow");
  assert.ok(ingredient.badges.includes("FLAVOURING SYSTEM FOUND"));
  assert.equal(scanCheck?.tone, "yellow");
  assert.equal(scanCheck?.status, "1");
  assert.ok(result.watchListHits.includes("Flavour systems"));
});

test("real product analysis turns three flavour systems into a red load check", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10004",
      name: "Test Snack",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Monosodium glutamate",
          text: "Monosodium glutamate",
        },
        {
          name: "Yeast extract",
          text: "Yeast extract",
        },
        {
          name: "Natural flavour",
          text: "Natural flavour",
        },
        {
          name: "Disodium guanylate",
          text: "Disodium guanylate",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const scanCheck = result.scanChecks.find((item) => item.id === "scan-flavour-systems");

  assert.equal(scanCheck?.tone, "red");
  assert.equal(scanCheck?.status, "High load");
  assert.ok(result.summary.reasons.includes("High flavour-system load"));
  assert.ok(!result.immediateWarnings.some((item) => item.id === "real-restricted-item"));
});

test("real product analysis treats restricted flavouring as an immediate red issue", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10005",
      name: "Test Flavouring",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Safrole flavouring",
          text: "Safrole flavouring",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const ingredient = result.ingredients[0];
  const scanCheck = result.scanChecks.find((item) => item.id === "scan-flavour-systems");
  const restrictedCheck = result.scanChecks.find(
    (item) => item.id === "scan-banned-restricted",
  );

  assert.equal(ingredient.level, "red");
  assert.equal(ingredient.rowStatusLabel, "Restricted");
  assert.ok(ingredient.badges.includes("BANNED / RESTRICTED FLAVOURING"));
  assert.equal(scanCheck?.tone, "red");
  assert.equal(restrictedCheck?.tone, "red");
  assert.ok(result.immediateWarnings.some((item) => item.id === "real-restricted-item"));
});

test("real product analysis flags one processed oil as yellow", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10006",
      name: "Test Crackers",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Canola oil",
          text: "Canola oil",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const ingredient = result.ingredients[0];
  const scanCheck = result.scanChecks.find((item) => item.id === "scan-processed-oils");

  assert.equal(ingredient.level, "yellow");
  assert.ok(ingredient.badges.includes("SEED OIL FOUND"));
  assert.equal(scanCheck?.tone, "yellow");
  assert.equal(scanCheck?.status, "1");
  assert.ok(result.watchListHits.includes("Processed oils"));
});

test("real product analysis turns three processed oils into a red load check", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10007",
      name: "Test Chips",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Canola oil",
          text: "Canola oil",
        },
        {
          name: "Soybean oil",
          text: "Soybean oil",
        },
        {
          name: "Sunflower oil",
          text: "Sunflower oil",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const scanCheck = result.scanChecks.find((item) => item.id === "scan-processed-oils");

  assert.equal(scanCheck?.tone, "red");
  assert.equal(scanCheck?.status, "High load");
  assert.ok(result.summary.reasons.includes("High processed-oil load"));
  assert.ok(!result.immediateWarnings.some((item) => item.id === "real-restricted-item"));
});

test("real product analysis treats hydrogenated oil as a yellow processed-oil review", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10008",
      name: "Test Spread",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Hydrogenated soybean oil",
          text: "Hydrogenated soybean oil",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const ingredient = result.ingredients[0];
  const scanCheck = result.scanChecks.find((item) => item.id === "scan-processed-oils");

  assert.equal(ingredient.level, "yellow");
  assert.equal(ingredient.rowStatusLabel, "Hydrogenated");
  assert.ok(ingredient.badges.includes("HYDROGENATED OIL FOUND"));
  assert.equal(scanCheck?.tone, "yellow");
  assert.equal(scanCheck?.status, "Hydrogenated found");
  assert.ok(!result.summary.reasons.includes("Hydrogenated processed fat"));
  assert.ok(!result.immediateWarnings.some((item) => item.id === "real-hydrogenated-oil"));
});

test("real product analysis treats fully hydrogenated oil as a yellow processed-fat review", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10009",
      name: "Test Spread",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Fully hydrogenated soybean oil",
          text: "Fully hydrogenated soybean oil",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const ingredient = result.ingredients[0];
  const hydrogenatedCheck = result.scanChecks.find(
    (item) => item.id === "scan-hydrogenated-oils",
  );

  assert.equal(ingredient.level, "yellow");
  assert.equal(ingredient.rowStatusLabel, "Hydrogenated");
  assert.ok(ingredient.badges.includes("FULLY HYDROGENATED OIL FOUND"));
  assert.equal(hydrogenatedCheck?.tone, "yellow");
  assert.equal(hydrogenatedCheck?.status, "Review");
});

test("real product analysis treats partially hydrogenated oil as PHO regulatory red", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10010",
      name: "Test Cookie",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Partially hydrogenated soybean oil",
          text: "Partially hydrogenated soybean oil",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const ingredient = result.ingredients[0];
  const hydrogenatedCheck = result.scanChecks.find(
    (item) => item.id === "scan-hydrogenated-oils",
  );

  assert.equal(ingredient.level, "red");
  assert.equal(ingredient.rowStatusLabel, "PHO");
  assert.ok(ingredient.badges.includes("PARTIALLY HYDROGENATED SOYBEAN OIL FOUND"));
  assert.equal(hydrogenatedCheck?.tone, "red");
  assert.equal(hydrogenatedCheck?.status, "PHO found");
  assert.ok(result.summary.reasons.includes("Partially hydrogenated oil"));
});

test("real product analysis flags positive trans fat markers but not trans-fat-free claims", () => {
  const positiveResult = analyzeNormalizedProduct(
    {
      barcode: "10011",
      name: "Test Frosting",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Contains trans fat",
          text: "Contains trans fat",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );
  const negativeResult = analyzeNormalizedProduct(
    {
      barcode: "10012",
      name: "Test Label Claim",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "0g trans fat",
          text: "0g trans fat",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const positiveIngredient = positiveResult.ingredients[0];
  const positiveCheck = positiveResult.scanChecks.find(
    (item) => item.id === "scan-hydrogenated-oils",
  );
  const negativeIngredient = negativeResult.ingredients[0];
  const negativeCheck = negativeResult.scanChecks.find(
    (item) => item.id === "scan-hydrogenated-oils",
  );

  assert.equal(positiveIngredient.level, "red");
  assert.equal(positiveIngredient.rowStatusLabel, "Trans fat");
  assert.ok(positiveIngredient.badges.includes("TRANS FAT MARKER FOUND"));
  assert.equal(positiveCheck?.tone, "red");
  assert.equal(positiveCheck?.status, "Trans fat found");
  assert.equal(negativeIngredient.level, "green");
  assert.equal(negativeCheck?.tone, "green");
  assert.equal(negativeCheck?.status, "No");
});

test("real product analysis flags one ultra-processed marker as yellow", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10013",
      name: "Test Powder",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Maltodextrin",
          text: "Maltodextrin",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const ingredient = result.ingredients[0];
  const scanCheck = result.scanChecks.find((item) => item.id === "scan-ultra-processed");

  assert.equal(ingredient.level, "yellow");
  assert.ok(ingredient.badges.includes("ULTRA-PROCESSED MARKER FOUND"));
  assert.equal(scanCheck?.tone, "yellow");
  assert.equal(scanCheck?.status, "1");
});

test("real product analysis turns six ultra-processed markers into a red load check", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10014",
      name: "Test Bar",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Maltodextrin",
          text: "Maltodextrin",
        },
        {
          name: "Corn syrup solids",
          text: "Corn syrup solids",
        },
        {
          name: "Modified corn starch",
          text: "Modified corn starch",
        },
        {
          name: "Soy protein isolate",
          text: "Soy protein isolate",
        },
        {
          name: "Hydrolyzed vegetable protein",
          text: "Hydrolyzed vegetable protein",
        },
        {
          name: "Soy lecithin",
          text: "Soy lecithin",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const scanCheck = result.scanChecks.find((item) => item.id === "scan-ultra-processed");

  assert.equal(scanCheck?.tone, "red");
  assert.equal(scanCheck?.status, "High load");
  assert.ok(result.summary.reasons.includes("High ultra-processed load"));
});

test("real product analysis makes ultra-processed check red for automatic red overlap", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10015",
      name: "Test Shortening",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Partially hydrogenated oil",
          text: "Partially hydrogenated oil",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const scanCheck = result.scanChecks.find((item) => item.id === "scan-ultra-processed");

  assert.equal(scanCheck?.tone, "red");
  assert.equal(scanCheck?.status, "Red marker");
  assert.ok(result.summary.reasons.includes("Ultra-processed red marker"));
});

test("real product analysis keeps ultra-processed check green for trans-fat-free wording alone", () => {
  const result = analyzeNormalizedProduct(
    {
      barcode: "10016",
      name: "Test Claim",
      brand: "Truthlabel Demo",
      ingredients: [
        {
          name: "Trans fat free",
          text: "Trans fat free",
        },
      ],
      nutrients: [],
      allergens: [],
      additives: [],
      rawSource: "openfoodfacts",
    },
    quietProfile,
  );

  const scanCheck = result.scanChecks.find((item) => item.id === "scan-ultra-processed");

  assert.equal(result.ingredients[0].level, "green");
  assert.equal(scanCheck?.tone, "green");
  assert.equal(scanCheck?.status, "None found");
});
