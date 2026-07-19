import assert from "node:assert/strict";
import test from "node:test";

import { calculateExposureRisk } from "./calculateExposureRisk";
import { applyIngredientCategoryRules } from "./ingredientCategoryRules";
import {
  matchIngredientIntelligence,
  normalizeIngredientIntelligenceText,
} from "./ingredientIntelligenceMatcher";
import {
  extractInlineAllergenStatement,
  parseIngredientInput,
} from "./parseIngredientInput";
import {
  ManualScanValidationError,
  type ManualScanInput,
  runManualScan,
} from "./runManualScan";
import { defaultUserSettings } from "./userSettings/defaultUserSettings";

function installMockWindowWithStorage(initialValues: Record<string, string>) {
  const storage = new Map<string, string>(Object.entries(initialValues));
  const mockWindow = {
    localStorage: {
      getItem(key: string) {
        return storage.has(key) ? storage.get(key)! : null;
      },
      setItem(key: string, value: string) {
        storage.set(key, value);
      },
      removeItem(key: string) {
        storage.delete(key);
      },
      clear() {
        storage.clear();
      },
    },
  } as unknown as Window & typeof globalThis;
  const originalWindow = globalThis.window;

  Object.defineProperty(globalThis, "window", {
    value: mockWindow,
    configurable: true,
    writable: true,
  });

  return () => {
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      configurable: true,
      writable: true,
    });
  };
}

function analyzeManualInput(input: ManualScanInput) {
  const ingredients = parseIngredientInput(input.ingredientText);
  const productName = input.productName?.trim() || "Unknown product";
  const brandName = input.brandName?.trim() || "Unknown brand";
  const productCategory = input.productCategory?.trim() || "General / Unknown";
  const allergenStatement =
    input.allergenStatement?.trim() ||
    extractInlineAllergenStatement(input.ingredientText);
  const packagingText = input.packagingText?.trim() || undefined;
  const userAllergyProfile = input.userAllergyProfile ?? [];
  const ingredientCount = new Set(
    ingredients.map(normalizeIngredientIntelligenceText).filter(Boolean),
  ).size;

  const matcherResult = matchIngredientIntelligence({
    ingredients,
    productName,
    brandName,
    productCategory,
    packagingText,
    allergenStatement,
    userAllergyProfile,
    externalSignals: [],
  });

  const categorySummaries = applyIngredientCategoryRules({
    ...matcherResult,
    productCategory,
    ingredientListAvailable: true,
    userAllergyProfile,
    externalSignals: [],
    ingredientCount,
  }).categorySummaries;

  const exposureRiskResult = calculateExposureRisk({
    categorySummaries,
    matchedIngredients: matcherResult.matchedIngredients,
    duplicateSafeMatches: matcherResult.duplicateSafeMatches,
    ingredientGroups: matcherResult.ingredientGroups,
    ingredientCount,
    productCategory,
    userAllergyProfile,
    externalSignals: [],
  });

  return {
    ingredients,
    categorySummaries,
    exposureRiskResult,
    scanResult: runManualScan(input),
  };
}

function findCategorySummary(
  output: ReturnType<typeof analyzeManualInput>,
  categoryId: string,
) {
  const summary = output.categorySummaries.find(
    (entry) => entry.categoryId === categoryId,
  );

  assert.ok(summary, `Expected category summary for ${categoryId}`);
  return summary;
}

test("runManualScan uses fallback product metadata and lets clean oats stay green", () => {
  const output = analyzeManualInput({
    ingredientText: "Ingredients: Rolled oats",
  });

  assert.deepEqual(output.ingredients, ["Rolled oats"]);
  assert.equal(output.scanResult.productHero.productName, "Unknown product");
  assert.equal(output.scanResult.productHero.brandName, "Unknown brand");
  assert.equal(output.scanResult.productHero.productCategory, "General / Unknown");
  assert.equal(output.scanResult.productHero.scanSource, "manual_paste");
  assert.equal(output.scanResult.productHero.ingredientCount, 1);
  assert.equal(output.scanResult.finalVerdict.verdictTone, "green");
});

test("runManualScan counts unique parsed ingredients for Ingredient Count", () => {
  const output = analyzeManualInput({
    ingredientText: "Ingredients: Water, water, sugar",
  });
  const summary = findCategorySummary(output, "total_ingredients");

  assert.equal(summary.displayLabel, "2");
  assert.equal(output.scanResult.productHero.ingredientCount, 2);
  assert.equal(output.scanResult.ingredientBreakdown.totalIngredients, 2);
});

test("runManualScan makes banned or restricted additives turn the manual result red", () => {
  const output = analyzeManualInput({
    productName: "Berry Drink",
    productCategory: "Drinks / Beverages",
    ingredientText: "Water, sugar, citric acid, Red No. 3",
  });
  const summary = findCategorySummary(output, "banned_restricted_items");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "banned_restricted");
  assert.equal(output.scanResult.finalVerdict.verdictTone, "red");
});

test("runManualScan turns three sweeteners into a red overload summary", () => {
  const output = analyzeManualInput({
    productCategory: "Drinks / Beverages",
    ingredientText:
      "Carbonated water, sucralose, saccharin, acesulfame potassium",
  });
  const summary = findCategorySummary(
    output,
    "artificial_sweeteners_sugar_substitutes",
  );

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "count_overload");
  assert.equal(summary.matchCount, 3);
});

test("runManualScan turns four preservatives into a red overload summary", () => {
  const output = analyzeManualInput({
    productCategory: "Packaged / Processed Foods",
    ingredientText:
      "Water, sodium benzoate, potassium benzoate, sodium nitrite, TBHQ",
  });
  const summary = findCategorySummary(output, "preservatives_shelf_life_systems");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "count_overload");
  assert.equal(summary.matchCount, 4);
});

test("runManualScan upgrades inline allergen statements to red when they match the allergy profile", () => {
  const output = analyzeManualInput({
    productCategory: "Packaged / Processed Foods",
    ingredientText: "Ingredients: Oats, cocoa. Contains: milk.",
    userAllergyProfile: ["milk"],
  });
  const summary = findCategorySummary(output, "allergy_risk");

  assert.equal(summary.severity, "red");
  assert.equal(summary.redReasonType, "allergy_profile_match");
  assert.ok(output.scanResult.productHero.exposureRisk >= 90);
  assert.equal(output.scanResult.finalVerdict.headline, "Do not consume");
});

test("runManualScan keeps OCR scanSource and confidence notes in the final result", () => {
  const output = runManualScan({
    ingredientText: "Water, sugar",
    scanSource: "ocr",
    additionalConfidenceNotes: [
      "OCR confidence was low, so some ingredient warnings may be incomplete.",
    ],
  });

  assert.equal(output.productHero.scanSource, "ocr");
  assert.ok(
    output.confidenceNotes.includes(
      "OCR text may contain mistakes. Check the ingredient list against the package label.",
    ),
  );
  assert.ok(
    output.confidenceNotes.includes(
      "OCR confidence was low, so some ingredient warnings may be incomplete.",
    ),
  );
});

test("runManualScan keeps a captured scan image for the result hero", () => {
  const output = runManualScan({
    ingredientText: "Water, sugar",
    scanSource: "ocr",
    productImageUrl: "data:image/jpeg;base64,c2Nhbg==",
    productImageSource: "captured_scan",
  });

  assert.equal(output.productHero.imageUrl, "data:image/jpeg;base64,c2Nhbg==");
  assert.equal(output.productHero.imageSource, "captured_scan");
});

test("Red No. 3 extracted through OCR still produces a red warning", () => {
  const output = analyzeManualInput({
    ingredientText: "Water, sugar, Red No. 3",
    scanSource: "ocr",
  });
  const bannedSummary = findCategorySummary(output, "banned_restricted_items");

  assert.equal(bannedSummary.severity, "red");
  assert.equal(output.scanResult.finalVerdict.verdictTone, "red");
});

test("Milk extracted through OCR still makes Allergy Risk red when the profile matches", () => {
  const output = analyzeManualInput({
    ingredientText: "Milk powder, cocoa",
    userAllergyProfile: ["Milk"],
    scanSource: "ocr",
  });
  const allergySummary = findCategorySummary(output, "allergy_risk");

  assert.equal(allergySummary.severity, "red");
  assert.equal(allergySummary.redReasonType, "allergy_profile_match");
  assert.equal(output.scanResult.finalVerdict.verdictTone, "red");
});

test("runManualScan falls back to saved allergy profile and default category from user settings", () => {
  const restoreWindow = installMockWindowWithStorage({
    "insideit.user-settings": JSON.stringify({
      ...defaultUserSettings,
      allergyProfile: {
        allergens: ["soy"],
        customAllergens: [],
        lastUpdated: "2026-07-15T10:00:00.000Z",
      },
      scanPreferences: {
        ...defaultUserSettings.scanPreferences,
        defaultProductCategory: "Drinks / Beverages",
      },
      updatedAt: "2026-07-15T10:00:00.000Z",
    }),
  });

  try {
    const output = runManualScan({
      ingredientText: "Water, soy lecithin",
    });
    const allergyRow = output.quickOverview.find(
      (row) => row.categoryId === "allergy_risk",
    );

    assert.equal(output.productHero.productCategory, "Drinks / Beverages");
    assert.equal(allergyRow?.severity, "red");
    assert.equal(allergyRow?.redReasonType, "allergy_profile_match");
  } finally {
    restoreWindow();
  }
});

test("runManualScan keeps an explicit empty allergy profile and treats milk as informational", () => {
  const restoreWindow = installMockWindowWithStorage({
    "insideit.user-settings": JSON.stringify({
      ...defaultUserSettings,
      allergyProfile: {
        allergens: ["milk"],
        customAllergens: [],
        lastUpdated: "2026-07-15T10:00:00.000Z",
      },
      updatedAt: "2026-07-15T10:00:00.000Z",
    }),
  });

  try {
    const output = runManualScan({
      ingredientText: "Milk powder, cocoa",
      userAllergyProfile: [],
    });
    const allergyRow = output.quickOverview.find(
      (row) => row.categoryId === "allergy_risk",
    );

    assert.equal(allergyRow?.severity, "green");
    assert.equal(allergyRow?.redReasonType, undefined);
  } finally {
    restoreWindow();
  }
});

test("runManualScan throws a validation error when the ingredient list is missing", () => {
  assert.throws(
    () =>
      runManualScan({
        ingredientText: " \n ",
      }),
    (error: unknown) => {
      assert.ok(error instanceof ManualScanValidationError);
      assert.equal(
        error.message,
        "Please paste the ingredient list so Truthlabel can scan the product.",
      );
      return true;
    },
  );
});
