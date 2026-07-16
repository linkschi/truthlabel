import type { ScanResult } from "@/lib/buildScanResult";
import { publicAppConfig } from "@/lib/appConfig";
import { runExternalSafetyLookup } from "@/lib/externalSafety/runExternalSafetyLookup";
import type {
  ExternalSafetyLookupInput,
  ExternalSafetyLookupResult,
  ExternalSafetySignal,
} from "@/lib/externalSafety/externalSafetyTypes";
import { normalizeExternalProduct } from "@/lib/productDatabase/normalizeExternalProduct";
import {
  lookupOpenFoodFactsProduct,
  ProductDatabaseLookupError,
} from "@/lib/productDatabase/openFoodFactsClient";
import type {
  BarcodeExternalSignal,
  ExternalProductLookupInput,
  ExternalProductLookupResult,
  NormalizedProductForScan,
} from "@/lib/productDatabase/productDatabaseTypes";
import {
  getSavedAllergyProfile,
  getUserSettings,
} from "@/lib/userSettings/userSettingsStorage";

import { runIngredientScan } from "./runManualScan";

export type BarcodeScanInput = {
  barcode: string;
  userAllergyProfile?: string[];
  country?: string;
  language?: string;
  region?: string;
  autoRunExternalSafetyLookup?: boolean;
};

export type BarcodeScanLookupStatus =
  | "found"
  | "not_found"
  | "found_missing_ingredients"
  | "error";

export type BarcodeScanOutput = {
  lookupStatus: BarcodeScanLookupStatus;
  productData: NormalizedProductForScan | null;
  scanResult?: ScanResult;
  manualInputNeeded: boolean;
  message: string;
  dataQualityWarnings: string[];
};

export class BarcodeValidationError extends Error {
  field: "barcode";

  constructor(message: string) {
    super(message);
    this.name = "BarcodeValidationError";
    this.field = "barcode";
  }
}

type ProductLookupClient = (
  input: ExternalProductLookupInput,
) => Promise<ExternalProductLookupResult>;
type ExternalSafetyLookupClient = (
  input: ExternalSafetyLookupInput,
) => Promise<ExternalSafetyLookupResult>;

function uniqueStrings(values: Array<string | undefined>) {
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

function uniqueProfile(values: string[] | undefined, fallback: string[]) {
  if (values === undefined) {
    return fallback;
  }

  return uniqueStrings(values);
}

function hasMeaningfulText(value: string | undefined) {
  return Boolean(value?.trim());
}

function hasKeyword(value: string | undefined, pattern: RegExp) {
  return pattern.test(value ?? "");
}

function toBrandTrustSignalTitle(signal: ExternalSafetySignal) {
  switch (signal.signalType) {
    case "allergen_recall":
      return "Undeclared Allergen Recall";
    case "pathogen_contamination":
      return "Pathogen Contamination Recall";
    case "foreign_material":
      return "Foreign Material Recall";
    case "heavy_metal_warning":
      return "Heavy Metal Warning";
    case "chemical_contamination":
      return "Chemical Contamination Recall";
    case "labeling_misbranding":
      return signal.severity === "red"
        ? "Active Official Recall"
        : "Historical Recall";
    case "public_health_alert":
      return "Public Health Alert";
    case "historical_recall":
      return "Resolved / Historical Recall";
    case "active_recall":
    default:
      return signal.severity === "red"
        ? "Active Official Recall"
        : "Resolved / Historical Recall";
  }
}

function buildLookupStatusSignal(
  categoryId: string,
  title: string,
  status: string,
  sourceName: string,
  reason: string,
): BarcodeExternalSignal {
  return {
    categoryId,
    lookupPerformed: true,
    checked: true,
    title,
    status,
    result: reason,
    sourceName,
    reason,
  };
}

function buildDerivedExternalSafetySignals(
  lookupResult: ExternalSafetyLookupResult,
): BarcodeExternalSignal[] {
  const derivedSignals: BarcodeExternalSignal[] = [...lookupResult.signals];

  lookupResult.signals.forEach((signal) => {
    const sourceName = signal.sourceName || signal.sourceProvider;
    const reason =
      signal.reason?.trim() ||
      signal.userFacingMessage.trim() ||
      signal.title.trim();
    const sharedSignal = buildLookupStatusSignal(
      "brand_trust_safety",
      toBrandTrustSignalTitle(signal),
      signal.status,
      sourceName,
      reason,
    );

    derivedSignals.push(sharedSignal);

    if (signal.signalType === "heavy_metal_warning") {
      derivedSignals.push(
        buildLookupStatusSignal(
          "heavy_metals",
          "Heavy Metal Warning",
          signal.status,
          sourceName,
          reason,
        ),
      );
    }

    if (
      hasKeyword(signal.title, /microplastic|nanoplastic/i) ||
      hasKeyword(signal.reason, /microplastic|nanoplastic/i) ||
      hasKeyword(signal.userFacingMessage, /microplastic|nanoplastic/i)
    ) {
      derivedSignals.push(
        buildLookupStatusSignal(
          "microplastics",
          "Microplastic Warning",
          signal.status,
          sourceName,
          reason,
        ),
      );
    }
  });

  if (lookupResult.lookupPerformed && lookupResult.signals.length === 0) {
    const checkedSources = lookupResult.cleanCheckedSources.join(", ");
    derivedSignals.push(
      buildLookupStatusSignal(
        "brand_trust_safety",
        "Clean Official Recall Check",
        "clean",
        checkedSources || "checked sources",
        "No official recall signal found in checked sources at the time of lookup.",
      ),
    );
  }

  return derivedSignals;
}

function buildExternalSafetyConfidenceNotes(
  lookupResult: ExternalSafetyLookupResult,
) {
  const notes: string[] = [];

  if (lookupResult.errors.length > 0) {
    notes.push("External safety lookup failed. Ingredient scan still completed.");
  }

  return notes;
}

export function validateBarcode(barcode: string) {
  const normalized = barcode.trim();

  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(normalized)) {
    throw new BarcodeValidationError("Enter a valid product barcode.");
  }

  return normalized;
}

export function buildBarcodeConfidenceNotes(
  productData: NormalizedProductForScan,
) {
  const notes = [
    "Product database data may be incomplete or user-submitted. Check the product label if something looks missing.",
    ...productData.dataQualityWarnings,
  ];

  if (!hasMeaningfulText(productData.ingredientText)) {
    notes.push("Ingredient-based warnings require a readable ingredient list.");
  }

  if (!hasMeaningfulText(productData.allergenStatement)) {
    notes.push(
      "Allergen data from the product database may be incomplete. Always check the package label for allergen statements.",
    );
  }

  if (!hasMeaningfulText(productData.packagingText)) {
    notes.push("Packaging data was missing, so microplastic review may be limited.");
  }

  return uniqueStrings(notes);
}

export function applyBarcodeConfidenceNotes(
  scanResult: ScanResult,
  productData: NormalizedProductForScan,
): ScanResult {
  const confidenceNotes = uniqueStrings([
    ...scanResult.confidenceNotes,
    ...scanResult.finalVerdict.confidenceNotes,
    ...buildBarcodeConfidenceNotes(productData),
  ]);

  return {
    ...scanResult,
    confidenceNotes,
    finalVerdict: {
      ...scanResult.finalVerdict,
      confidenceNotes,
    },
  };
}

export async function runBarcodeScan(
  input: BarcodeScanInput,
  options?: {
    lookupProduct?: ProductLookupClient;
    lookupExternalSafety?: ExternalSafetyLookupClient;
  },
): Promise<BarcodeScanOutput> {
  if (!publicAppConfig.flags.enableBarcodeLookup) {
    return {
      lookupStatus: "error",
      productData: null,
      manualInputNeeded: true,
      message:
        "Barcode lookup is unavailable in this build. Paste the ingredient list manually instead.",
      dataQualityWarnings: [],
    };
  }

  const userSettings = getUserSettings();
  const barcode = validateBarcode(input.barcode);
  const lookupProduct = options?.lookupProduct ?? lookupOpenFoodFactsProduct;
  const lookupExternalSafety =
    options?.lookupExternalSafety ?? runExternalSafetyLookup;
  const resolvedUserAllergyProfile = uniqueProfile(
    input.userAllergyProfile,
    getSavedAllergyProfile(userSettings),
  );
  const resolvedCountry =
    input.country?.trim() || userSettings.regionSettings.country || undefined;
  const resolvedLanguage =
    input.language?.trim() || userSettings.regionSettings.language || undefined;
  const resolvedRegion =
    input.region?.trim() || userSettings.regionSettings.region || undefined;
  const autoRunExternalSafetyLookup =
    publicAppConfig.flags.enableExternalSafetyLookup &&
    (input.autoRunExternalSafetyLookup ??
      userSettings.scanPreferences.autoRunExternalSafetyLookup);

  try {
    const lookupResult = await lookupProduct({
      barcode,
      country: resolvedCountry,
      language: resolvedLanguage,
    });

    if (!lookupResult.found) {
      return {
        lookupStatus: "not_found",
        productData: null,
        manualInputNeeded: true,
        message:
          "Product not found in the product database. You can still paste the ingredient list manually.",
        dataQualityWarnings: lookupResult.dataQualityWarnings,
      };
    }

    const productData = normalizeExternalProduct(lookupResult);

    if (!hasMeaningfulText(productData.ingredientText)) {
      return {
        lookupStatus: "found_missing_ingredients",
        productData,
        manualInputNeeded: true,
        message:
          "Product found, but the ingredient list was missing. Paste the ingredient list to complete the scan.",
        dataQualityWarnings: productData.dataQualityWarnings,
      };
    }

    let mergedExternalSignals = [...productData.externalSignals];
    const externalSafetyWarnings: string[] = [];
    const externalSafetyConfidenceNotes: string[] = [];

    if (autoRunExternalSafetyLookup) {
      const externalSafetyResult = await lookupExternalSafety({
        barcode: productData.barcode,
        productName: productData.productName,
        brandName: productData.brandName,
        productCategory: productData.productCategory,
        country: resolvedCountry,
        region: resolvedRegion,
      });

      mergedExternalSignals = [
        ...mergedExternalSignals,
        ...buildDerivedExternalSafetySignals(externalSafetyResult),
      ];
      externalSafetyWarnings.push(
        ...externalSafetyResult.warnings,
        ...externalSafetyResult.errors,
      );
      externalSafetyConfidenceNotes.push(
        ...buildExternalSafetyConfidenceNotes(externalSafetyResult),
      );
    }

    const scanResult = applyBarcodeConfidenceNotes(
      runIngredientScan({
        productName: productData.productName,
        brandName: productData.brandName,
        barcode: productData.barcode,
        productCategory: productData.productCategory,
        ingredientText: productData.ingredientText,
        allergenStatement: productData.allergenStatement,
        packagingText: productData.packagingText,
        userAllergyProfile: resolvedUserAllergyProfile,
        externalSignals: mergedExternalSignals,
        scanSource: "barcode",
        additionalConfidenceNotes: externalSafetyConfidenceNotes,
      }),
      {
        ...productData,
        externalSignals: mergedExternalSignals,
      },
    );

    return {
      lookupStatus: "found",
      productData: {
        ...productData,
        externalSignals: mergedExternalSignals,
      },
      scanResult,
      manualInputNeeded: false,
      message: "Product found. Truthlabel scanned the available ingredient data.",
      dataQualityWarnings: uniqueStrings([
        ...productData.dataQualityWarnings,
        ...externalSafetyWarnings,
      ]),
    };
  } catch (error) {
    if (error instanceof BarcodeValidationError) {
      throw error;
    }

    const warnings =
      error instanceof ProductDatabaseLookupError ? [error.message] : [];

    return {
      lookupStatus: "error",
      productData: null,
      manualInputNeeded: true,
      message:
        "Product lookup failed. Check your connection or paste the ingredient list manually.",
      dataQualityWarnings: warnings,
    };
  }
}
