import { usMeatProductResearchRecords } from "@/data/productResearch/usMeatProducts";
import type { UsMeatResearchRecord } from "@/data/productResearch/usMeatProducts";
import type {
  ExternalProductLookupInput,
  ExternalProductLookupResult,
} from "@/lib/productDatabase/productDatabaseTypes";

function normalizeText(value: string | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values: Array<string | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const trimmed = value?.trim();
    if (!trimmed || seen.has(trimmed)) {
      return;
    }

    seen.add(trimmed);
    result.push(trimmed);
  });

  return result;
}

function barcodeCandidates(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return new Set<string>();
  }

  const candidates = new Set([trimmed]);
  if (trimmed.length === 12) {
    candidates.add(`0${trimmed}`);
  }

  if (trimmed.length === 13 && trimmed.startsWith("0")) {
    candidates.add(trimmed.slice(1));
  }

  return candidates;
}

function hasBarcodeMatch(record: UsMeatResearchRecord, barcode: string | undefined) {
  const inputCandidates = barcodeCandidates(barcode);
  if (inputCandidates.size === 0 || record.barcodes.length === 0) {
    return false;
  }

  return record.barcodes.some((recordBarcode) => {
    const recordCandidates = barcodeCandidates(recordBarcode);
    return [...recordCandidates].some((candidate) => inputCandidates.has(candidate));
  });
}

function buildNameCandidates(record: UsMeatResearchRecord) {
  return [
    record.productName,
    ...record.productNameAliases,
    `${record.brandName} ${record.productName}`,
  ].map(normalizeText);
}

function hasNameMatch(
  record: UsMeatResearchRecord,
  productName: string | undefined,
  brandName: string | undefined,
) {
  const normalizedProductName = normalizeText(productName);
  if (normalizedProductName.length < 8) {
    return false;
  }

  const normalizedBrand = normalizeText(brandName);
  const recordBrand = normalizeText(record.brandName);
  const brandMatches =
    !normalizedBrand ||
    normalizedBrand === "unknown brand" ||
    normalizedBrand.includes(recordBrand) ||
    recordBrand.includes(normalizedBrand) ||
    normalizedProductName.includes(recordBrand);

  if (!brandMatches) {
    return false;
  }

  return buildNameCandidates(record).some((candidate) => {
    if (!candidate || candidate.length < 8) {
      return false;
    }

    return (
      normalizedProductName === candidate ||
      normalizedProductName.includes(candidate) ||
      candidate.includes(normalizedProductName)
    );
  });
}

export function findUsMeatProductResearch(input: {
  barcode?: string;
  productName?: string;
  brandName?: string;
}) {
  const barcodeMatch = usMeatProductResearchRecords.find((record) =>
    hasBarcodeMatch(record, input.barcode),
  );

  if (barcodeMatch) {
    return barcodeMatch;
  }

  return usMeatProductResearchRecords.find((record) =>
    hasNameMatch(record, input.productName, input.brandName),
  );
}

function buildPackagingText(record: UsMeatResearchRecord) {
  return uniqueStrings([
    ...record.packageClaims,
    ...Object.entries(record.markerFacts)
      .filter(([, value]) => value === "yes" || value === "no")
      .map(([marker, value]) => `${marker}: ${value}`),
  ]).join(". ");
}

function recordToExternalProduct(
  record: UsMeatResearchRecord,
  barcode: string,
): ExternalProductLookupResult {
  const ingredientsText = record.ingredients.join(", ");

  return {
    found: true,
    provider: "truthlabel_local_research",
    barcode: barcode || record.barcodes[0] || "",
    productName: record.productName,
    brandName: record.brandName,
    productCategory: record.categoryPath.join(" > "),
    ingredientsText,
    ingredients: record.ingredients,
    packagingText: buildPackagingText(record),
    imageUrl: record.mainImageUrl,
    rawCategories: record.categoryPath,
    rawLabels: record.packageClaims,
    rawAllergens: [],
    rawTraces: [],
    externalSignals: record.externalSignals,
    dataQualityWarnings: record.localWarnings,
    raw: {
      source: "truthlabel_us_meat_product_research",
      recordId: record.id,
      barcodeStatus: record.barcodeStatus,
      productUrl: record.productUrl,
      mainImageUrl: record.mainImageUrl,
      countryOfOrigin: record.countryOfOrigin,
      countryOfOriginStatus: record.countryOfOriginStatus,
      storageState: record.storageState,
      manufacturerOrDistributor: record.manufacturerOrDistributor,
      ingredientDisclosure: record.ingredientDisclosure,
      exactIngredientText: record.exactIngredientText,
      ingredientInvestigationStatus: record.ingredientInvestigationStatus,
      claimDetails: record.claimDetails,
      productSpecificChecks: record.productSpecificChecks,
      markerFacts: record.markerFacts,
      reviewNotes: record.reviewNotes,
      structuredReviewNotes: record.structuredReviewNotes,
    },
  };
}

export function lookupUsMeatProductResearch(
  input: ExternalProductLookupInput,
): ExternalProductLookupResult | null {
  const record = findUsMeatProductResearch({ barcode: input.barcode });
  if (!record) {
    return null;
  }

  return recordToExternalProduct(record, input.barcode.trim());
}

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

function hasIngredients(result: ExternalProductLookupResult) {
  return Boolean(result.ingredientsText?.trim()) || Boolean(result.ingredients?.length);
}

export function enrichWithUsMeatProductResearch(
  result: ExternalProductLookupResult,
): ExternalProductLookupResult {
  if (!result.found) {
    return lookupUsMeatProductResearch({
      barcode: result.barcode,
    }) ?? result;
  }

  const record = findUsMeatProductResearch({
    barcode: result.barcode,
    productName: result.productName,
    brandName: result.brandName,
  });

  if (!record) {
    return result;
  }

  const localProduct = recordToExternalProduct(record, result.barcode);
  const useLocalIngredients = !hasIngredients(result) && record.ingredients.length > 0;

  return {
    ...result,
    provider:
      result.provider === "unknown"
        ? "truthlabel_local_research"
        : result.provider,
    productName: hasValue(result.productName)
      ? result.productName
      : localProduct.productName,
    brandName: hasValue(result.brandName)
      ? result.brandName
      : localProduct.brandName,
    productCategory: hasValue(result.productCategory)
      ? result.productCategory
      : localProduct.productCategory,
    ingredientsText: useLocalIngredients
      ? localProduct.ingredientsText
      : result.ingredientsText,
    ingredients: useLocalIngredients ? localProduct.ingredients : result.ingredients,
    packagingText: uniqueStrings([
      result.packagingText,
      localProduct.packagingText,
    ]).join(". "),
    rawCategories: uniqueStrings([
      ...(result.rawCategories ?? []),
      ...(localProduct.rawCategories ?? []),
    ]),
    rawLabels: uniqueStrings([
      ...(result.rawLabels ?? []),
      ...(localProduct.rawLabels ?? []),
    ]),
    externalSignals: [
      ...(result.externalSignals ?? []),
      ...(localProduct.externalSignals ?? []),
    ],
    dataQualityWarnings: uniqueStrings([
      ...result.dataQualityWarnings,
      ...record.localWarnings,
    ]),
    raw: {
      externalProduct: result.raw,
      truthlabelLocalResearch: localProduct.raw,
    },
  };
}

export function getUsMeatProductResearchCount() {
  return usMeatProductResearchRecords.length;
}
