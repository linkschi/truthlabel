import type { ScanResult } from "@/lib/buildScanResult";
import type { BarcodeExternalSignal } from "@/lib/productDatabase/productDatabaseTypes";
import {
  getSavedAllergyProfile,
  getUserSettings,
} from "@/lib/userSettings/userSettingsStorage";

import { buildScanResult } from "./buildScanResult";
import { calculateExposureRisk } from "./calculateExposureRisk";
import { applyIngredientCategoryRules } from "./ingredientCategoryRules";
import { matchIngredientIntelligence } from "./ingredientIntelligenceMatcher";
import {
  extractInlineAllergenStatement,
  parseIngredientInput,
} from "./parseIngredientInput";

export type IngredientScanInput = {
  productName?: string;
  brandName?: string;
  barcode?: string;
  productCategory?: string;
  ingredientText: string;
  allergenStatement?: string;
  packagingText?: string;
  userAllergyProfile?: string[];
  externalSignals?: BarcodeExternalSignal[];
  scanSource?: "manual_paste" | "barcode" | "ocr";
  additionalConfidenceNotes?: string[];
};

export type ManualScanInput = IngredientScanInput;

export class ManualScanValidationError extends Error {
  field: "ingredientText";

  constructor(message: string) {
    super(message);
    this.name = "ManualScanValidationError";
    this.field = "ingredientText";
  }
}

function uniqueStrings(values: Array<string | undefined | null>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

export function runIngredientScan(input: IngredientScanInput): ScanResult {
  const ingredients = parseIngredientInput(input.ingredientText);

  if (ingredients.length === 0) {
    throw new ManualScanValidationError(
      "Please paste the ingredient list so Truthlabel can scan the product.",
    );
  }

  const productName = input.productName?.trim() || "Unknown product";
  const brandName = input.brandName?.trim() || "Unknown brand";
  const barcode = input.barcode?.trim() || "";
  const userSettings = getUserSettings();
  const productCategory =
    input.productCategory?.trim() ||
    userSettings.scanPreferences.defaultProductCategory ||
    "General / Unknown";
  const allergenStatement =
    input.allergenStatement?.trim() ||
    extractInlineAllergenStatement(input.ingredientText);
  const packagingText = input.packagingText?.trim() || undefined;
  const userAllergyProfile =
    input.userAllergyProfile === undefined
      ? getSavedAllergyProfile(userSettings)
      : uniqueStrings(input.userAllergyProfile);
  const externalSignals = input.externalSignals ?? [];
  const scanSource = input.scanSource ?? "manual_paste";
  const additionalConfidenceNotes = input.additionalConfidenceNotes ?? [];

  const matcherResult = matchIngredientIntelligence({
    ingredients,
    productName,
    brandName,
    productCategory,
    packagingText,
    allergenStatement,
    userAllergyProfile,
    externalSignals,
  });

  const categoryRules = applyIngredientCategoryRules({
    ...matcherResult,
    productCategory,
    ingredientListAvailable: true,
    userAllergyProfile,
    externalSignals,
    ingredientCount: ingredients.length,
  });

  const exposureRiskResult = calculateExposureRisk({
    categorySummaries: categoryRules.categorySummaries,
    matchedIngredients: matcherResult.matchedIngredients,
    duplicateSafeMatches: matcherResult.duplicateSafeMatches,
    ingredientGroups: matcherResult.ingredientGroups,
    ingredientCount: ingredients.length,
    productCategory,
    userAllergyProfile,
    externalSignals,
  });

  return buildScanResult({
    productName,
    brandName,
    barcode,
    productCategory,
    ingredients,
    ingredientListAvailable: true,
    matcherResult,
    categorySummaries: categoryRules.categorySummaries,
    exposureRiskResult,
    userAllergyProfile,
    externalSignals,
    scanSource,
    additionalConfidenceNotes,
  });
}

export function runManualScan(input: ManualScanInput): ScanResult {
  return runIngredientScan({
    ...input,
    scanSource: input.scanSource ?? "manual_paste",
  });
}
