import type { DemoProduct } from "@/data/demoProducts";
import {
  getSavedAllergyProfile,
  getUserSettings,
} from "@/lib/userSettings/userSettingsStorage";

import { buildScanResult } from "./buildScanResult";
import { calculateExposureRisk } from "./calculateExposureRisk";
import { applyIngredientCategoryRules } from "./ingredientCategoryRules";
import {
  matchIngredientIntelligence,
  normalizeIngredientIntelligenceText,
  type IngredientIntelligenceMatcherInput,
} from "./ingredientIntelligenceMatcher";

export type RunDemoScanOptions = {
  productCategory?: string;
  packagingText?: string;
  allergenStatement?: string;
  userAllergyProfile?: string[];
  externalSignals?: IngredientIntelligenceMatcherInput["externalSignals"];
};

export type RunDemoScanResult = {
  demoProduct: DemoProduct;
  matcherResult: ReturnType<typeof matchIngredientIntelligence>;
  categorySummaries: ReturnType<typeof applyIngredientCategoryRules>["categorySummaries"];
  exposureRiskResult: ReturnType<typeof calculateExposureRisk>;
  scanResult: ReturnType<typeof buildScanResult>;
};

function countUniqueParsedIngredients(ingredients: string[]) {
  return new Set(
    ingredients.map(normalizeIngredientIntelligenceText).filter(Boolean),
  ).size;
}

export function runDemoScan(
  demoProduct: DemoProduct,
  options: RunDemoScanOptions = {},
): RunDemoScanResult {
  const userSettings = getUserSettings();
  const ingredients = [...demoProduct.ingredients];
  const ingredientListAvailable = ingredients.length > 0;
  const productCategory = options.productCategory ?? demoProduct.productCategory;
  const packagingText = options.packagingText ?? demoProduct.packagingText;
  const allergenStatement =
    options.allergenStatement ?? demoProduct.allergenStatement;
  const userAllergyProfile =
    options.userAllergyProfile ?? getSavedAllergyProfile(userSettings);
  const externalSignals = options.externalSignals ?? demoProduct.externalSignals;
  const ingredientCount = countUniqueParsedIngredients(ingredients);

  const matcherResult = matchIngredientIntelligence({
    ingredients,
    productName: demoProduct.productName,
    brandName: demoProduct.brandName,
    productCategory,
    packagingText,
    allergenStatement,
    userAllergyProfile,
    externalSignals,
  });

  const categoryRules = applyIngredientCategoryRules({
    ...matcherResult,
    productCategory,
    ingredientListAvailable,
    userAllergyProfile,
    externalSignals,
    ingredientCount,
  });

  const exposureRiskResult = calculateExposureRisk({
    categorySummaries: categoryRules.categorySummaries,
    matchedIngredients: matcherResult.matchedIngredients,
    duplicateSafeMatches: matcherResult.duplicateSafeMatches,
    ingredientGroups: matcherResult.ingredientGroups,
    ingredientCount,
    productCategory,
    userAllergyProfile,
    externalSignals,
  });

  const scanResult = buildScanResult({
    productName: demoProduct.productName,
    brandName: demoProduct.brandName,
    barcode: demoProduct.barcode,
    productCategory,
    ingredients,
    ingredientListAvailable,
    matcherResult,
    categorySummaries: categoryRules.categorySummaries,
    exposureRiskResult,
    userAllergyProfile,
    externalSignals,
    scanSource: demoProduct.scanSource,
  });

  return {
    demoProduct,
    matcherResult,
    categorySummaries: categoryRules.categorySummaries,
    exposureRiskResult,
    scanResult,
  };
}
