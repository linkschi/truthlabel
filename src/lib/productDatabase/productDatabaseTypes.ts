import type { ExternalSafetySignal } from "@/lib/externalSafety/externalSafetyTypes";

export type ProductDatabaseProvider =
  | "open_food_facts"
  | "truthlabel_local_research"
  | "mock"
  | "unknown";

export type ExternalProductLookupInput = {
  barcode: string;
  country?: string;
  language?: string;
};

export type ExternalProductLookupResult = {
  found: boolean;
  provider: ProductDatabaseProvider;
  barcode: string;
  productName?: string;
  brandName?: string;
  productCategory?: string;
  ingredientsText?: string;
  ingredients?: string[];
  allergenStatement?: string;
  packagingText?: string;
  imageUrl?: string;
  rawCategories?: string[];
  rawLabels?: string[];
  rawAllergens?: string[];
  rawTraces?: string[];
  externalSignals?: BarcodeExternalSignal[];
  dataQualityWarnings: string[];
  raw?: unknown;
};

export type BarcodeExternalSignal =
  | string
  | Record<string, unknown>
  | ExternalSafetySignal;

export type NormalizedProductForScan = {
  productName: string;
  brandName: string;
  barcode: string;
  productCategory: string;
  ingredientText: string;
  ingredients: string[];
  allergenStatement: string;
  packagingText: string;
  imageUrl?: string;
  scanSource: "barcode";
  externalSignals: BarcodeExternalSignal[];
  dataQualityWarnings: string[];
};
