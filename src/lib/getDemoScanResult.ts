import { getCategoryProfileBySlug } from "@/data/categoryProfiles";
import {
  getDefaultDemoProductIdForCategorySlug,
  getDemoProductById,
} from "@/data/demoProducts";

import { type ScanResult } from "./buildScanResult";
import { runDemoScan } from "./runDemoScan";

function getCategoryPreviewPackagingText(
  categoryLabel: string,
  fallbackPackagingText: string,
) {
  if (/drink|beverage/i.test(categoryLabel)) {
    return "PET bottle";
  }

  return fallbackPackagingText;
}

function getCategoryPreviewExternalSignals(categoryLabel: string) {
  const signals: Array<string | Record<string, unknown>> = [];

  if (/baby|kids/i.test(categoryLabel)) {
    signals.push("Category marker for baby food heavy metal review");
  }

  if (/seafood/i.test(categoryLabel)) {
    signals.push("Category marker for seafood mercury review");
  }

  return signals;
}

export function getDemoScanResult(
  categorySlug: string | undefined,
  userAllergyProfile: string[],
  demoProductId?: string,
): ScanResult {
  const categoryProfile = getCategoryProfileBySlug(categorySlug);
  const demoProduct = getDemoProductById(
    demoProductId ?? getDefaultDemoProductIdForCategorySlug(categorySlug),
  );
  const useCategoryPreviewOverrides =
    !demoProductId && typeof categorySlug === "string" && categorySlug.length > 0;

  const productCategory = useCategoryPreviewOverrides
    ? categoryProfile.label
    : demoProduct.productCategory;
  const packagingText = useCategoryPreviewOverrides
    ? getCategoryPreviewPackagingText(categoryProfile.label, demoProduct.packagingText)
    : demoProduct.packagingText;
  const externalSignals = useCategoryPreviewOverrides
    ? [...demoProduct.externalSignals, ...getCategoryPreviewExternalSignals(categoryProfile.label)]
    : demoProduct.externalSignals;

  return runDemoScan(demoProduct, {
    productCategory,
    packagingText,
    userAllergyProfile,
    externalSignals,
  }).scanResult;
}
