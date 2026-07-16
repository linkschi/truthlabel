import type { ExternalSafetyProvider } from "../externalSafetyProvider";
import { createEmptyLookupResult } from "../externalSafetyProvider";
import type {
  ExternalSafetyLookupInput,
  ExternalSafetyLookupResult,
  ExternalSafetySignal,
} from "../externalSafetyTypes";

type MockScenario =
  | "clean"
  | "active_allergen_recall"
  | "active_pathogen_recall"
  | "historical_recall"
  | "heavy_metal_warning"
  | "medium_confidence_active_match"
  | "low_confidence_broad_match"
  | "microplastic_warning"
  | "error";

function buildSignal(
  scenario: MockScenario,
  input: ExternalSafetyLookupInput,
): ExternalSafetySignal | null {
  const productName = input.productName ?? "Mock Product";
  const brandName = input.brandName ?? "Mock Brand";

  switch (scenario) {
    case "active_allergen_recall":
      return {
        id: "mock-active-allergen-recall",
        sourceProvider: "mock",
        sourceName: "Mock Recall Provider",
        sourceUrl: "https://example.test/recalls/mock-active-allergen-recall",
        region: input.region ?? input.country ?? "US",
        signalType: "allergen_recall",
        status: "active",
        severity: "red",
        title: `${brandName} ${productName} recalled for undeclared milk`,
        productName,
        brandName,
        reason: "Undeclared milk allergen.",
        affectedLots: ["LOT-123"],
        affectedDates: ["2026-07-01"],
        affectedRegions: ["US"],
        recallClass: "Class I",
        publishedDate: "2026-07-01",
        lastUpdatedDate: "2026-07-02",
        matchedBy: ["product_name", "brand_name"],
        matchConfidence: "high",
        userFacingMessage:
          "Official recall or public health alert found for this product or batch. Check the affected lot/date details.",
      };
    case "active_pathogen_recall":
      return {
        id: "mock-active-pathogen-recall",
        sourceProvider: "mock",
        sourceName: "Mock Recall Provider",
        sourceUrl: "https://example.test/recalls/mock-active-pathogen-recall",
        region: input.region ?? input.country ?? "US",
        signalType: "pathogen_contamination",
        status: "active",
        severity: "red",
        title: `${brandName} ${productName} recalled for possible Salmonella contamination`,
        productName,
        brandName,
        reason: "Possible Salmonella contamination.",
        affectedLots: ["LOT-456"],
        affectedDates: ["2026-06-12"],
        affectedRegions: ["US"],
        recallClass: "Class I",
        publishedDate: "2026-06-12",
        lastUpdatedDate: "2026-06-12",
        matchedBy: ["product_name", "brand_name"],
        matchConfidence: "high",
        userFacingMessage:
          "Official recall or public health alert found for this product or batch. Check the affected lot/date details.",
      };
    case "historical_recall":
      return {
        id: "mock-historical-recall",
        sourceProvider: "mock",
        sourceName: "Mock Recall Provider",
        sourceUrl: "https://example.test/recalls/mock-historical-recall",
        region: input.region ?? input.country ?? "US",
        signalType: "historical_recall",
        status: "historical",
        severity: "yellow",
        title: `${brandName} ${productName} historical recall`,
        productName,
        brandName,
        reason: "Past recall that may not affect current stock.",
        affectedDates: ["2025-04-20"],
        affectedRegions: ["US"],
        matchedBy: ["product_name", "brand_name"],
        matchConfidence: "high",
        userFacingMessage:
          "Historical recall found. This may not apply to the current product or batch.",
      };
    case "heavy_metal_warning":
      return {
        id: "mock-heavy-metal-warning",
        sourceProvider: "mock",
        sourceName: "Mock Safety Provider",
        sourceUrl: "https://example.test/recalls/mock-heavy-metal-warning",
        region: input.region ?? input.country ?? "US",
        signalType: "heavy_metal_warning",
        status: "active",
        severity: "red",
        title: `${brandName} ${productName} heavy metal warning`,
        productName,
        brandName,
        reason: "Lead detected above the action level.",
        affectedLots: ["HM-900"],
        affectedRegions: ["US"],
        publishedDate: "2026-07-08",
        matchedBy: ["product_name", "brand_name"],
        matchConfidence: "high",
        userFacingMessage:
          "Verified heavy-metal warning or testing signal found. Truthlabel flags this as a serious external safety concern.",
      };
    case "medium_confidence_active_match":
      return {
        id: "mock-medium-confidence-active-match",
        sourceProvider: "mock",
        sourceName: "Mock Recall Provider",
        sourceUrl: "https://example.test/recalls/mock-medium-confidence-active-match",
        region: input.region ?? input.country ?? "US",
        signalType: "active_recall",
        status: "active",
        severity: "yellow",
        title: `${productName} possible recall match`,
        productName,
        brandName,
        reason: "Name similarity only.",
        affectedRegions: ["US"],
        matchedBy: ["product_name"],
        matchConfidence: "medium",
        userFacingMessage:
          "Possible safety alert match found. Check product, brand, lot code, date, and region.",
      };
    case "low_confidence_broad_match":
      return {
        id: "mock-low-confidence-broad-match",
        sourceProvider: "mock",
        sourceName: "Mock Recall Provider",
        sourceUrl: "https://example.test/recalls/mock-low-confidence-broad-match",
        region: input.region ?? input.country ?? "US",
        signalType: "active_recall",
        status: "active",
        severity: "yellow",
        title: "Broad category recall notice",
        productName,
        reason: "Category-level notice only.",
        affectedRegions: ["US"],
        matchedBy: ["category_keyword"],
        matchConfidence: "low",
        userFacingMessage:
          "Possible low-confidence match found. Confirm the exact product before acting on this notice.",
      };
    case "microplastic_warning":
      return {
        id: "mock-microplastic-warning",
        sourceProvider: "mock",
        sourceName: "Mock Safety Provider",
        sourceUrl: "https://example.test/recalls/mock-microplastic-warning",
        region: input.region ?? input.country ?? "US",
        signalType: "other_safety_signal",
        status: "active",
        severity: "red",
        title: `${brandName} ${productName} microplastics detected`,
        productName,
        brandName,
        reason: "Verified microplastics detected in the product sample.",
        affectedRegions: ["US"],
        matchedBy: ["product_name", "brand_name"],
        matchConfidence: "high",
        userFacingMessage:
          "Verified microplastic or nanoplastic detection signal found. Truthlabel flags this as a serious external review concern.",
      };
    default:
      return null;
  }
}

export function lookupMockExternalSafety(
  scenario: MockScenario,
): ExternalSafetyProvider["lookup"] {
  return async (input) => {
    if (scenario === "error") {
      throw new Error("Mock external safety provider failed.");
    }

    const signal = buildSignal(scenario, input);
    if (!signal) {
      return createEmptyLookupResult({
        lookupPerformed: true,
        cleanCheckedSources: ["Mock Recall Provider"],
      });
    }

    return {
      lookupPerformed: true,
      signals: [signal],
      cleanCheckedSources: [],
      warnings: [],
      errors: [],
    };
  };
}

export const mockExternalSafetyProvider: ExternalSafetyProvider = {
  providerId: "mock",
  providerName: "Mock Recall Provider",
  async lookup(input): Promise<ExternalSafetyLookupResult> {
    return lookupMockExternalSafety("clean")(input);
  },
};
