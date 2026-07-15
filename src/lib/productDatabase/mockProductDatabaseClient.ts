import {
  ProductDatabaseLookupError,
} from "@/lib/productDatabase/openFoodFactsClient";
import type {
  ExternalProductLookupInput,
  ExternalProductLookupResult,
} from "@/lib/productDatabase/productDatabaseTypes";

const mockProducts: Record<string, ExternalProductLookupResult> = {
  "1000000000001": {
    found: true,
    provider: "mock",
    barcode: "1000000000001",
    productName: "Simple Rolled Oats",
    brandName: "Whole Pantry",
    productCategory: "oats",
    ingredientsText: "Rolled oats",
    ingredients: ["Rolled oats"],
    packagingText: "Paper bag",
    rawCategories: ["oats", "cereals"],
    rawLabels: ["paper bag"],
    rawAllergens: [],
    rawTraces: [],
    dataQualityWarnings: [],
  },
  "1000000000002": {
    found: true,
    provider: "mock",
    barcode: "1000000000002",
    productName: "Red Berry Soda",
    brandName: "Bright Sip",
    productCategory: "beverages",
    ingredientsText:
      "Carbonated water, sugar, citric acid, natural flavour, Red No. 3, sodium benzoate",
    ingredients: [
      "Carbonated water",
      "Sugar",
      "Citric acid",
      "Natural flavour",
      "Red No. 3",
      "Sodium benzoate",
    ],
    packagingText: "Aluminium can",
    rawCategories: ["beverages", "sodas"],
    rawLabels: ["aluminium can"],
    rawAllergens: [],
    rawTraces: [],
    dataQualityWarnings: [],
  },
  "1000000000003": {
    found: true,
    provider: "mock",
    barcode: "1000000000003",
    productName: "Zero Sugar Citrus Drink",
    brandName: "Bright Sip Zero",
    productCategory: "beverages",
    ingredientsText:
      "Carbonated water, citric acid, aspartame, acesulfame potassium, sucralose, natural flavour, sodium benzoate",
    ingredients: [
      "Carbonated water",
      "Citric acid",
      "Aspartame",
      "Acesulfame potassium",
      "Sucralose",
      "Natural flavour",
      "Sodium benzoate",
    ],
    packagingText: "Aluminium can",
    rawCategories: ["beverages", "soft drinks"],
    rawLabels: ["aluminium can"],
    rawAllergens: [],
    rawTraces: [],
    dataQualityWarnings: [],
  },
  "1000000000009": {
    found: true,
    provider: "mock",
    barcode: "1000000000009",
    productName: "Chocolate Milk Drink",
    brandName: "Dairy Day",
    productCategory: "milk drinks",
    ingredientsText:
      "Milk, sugar, cocoa powder, carrageenan, natural flavour",
    ingredients: [
      "Milk",
      "Sugar",
      "Cocoa powder",
      "Carrageenan",
      "Natural flavour",
    ],
    allergenStatement: "Contains: milk",
    packagingText: "Plastic bottle",
    rawCategories: ["milk drinks", "beverages"],
    rawLabels: ["plastic bottle"],
    rawAllergens: ["milk"],
    rawTraces: [],
    dataQualityWarnings: [],
  },
  "1000000000014": {
    found: true,
    provider: "mock",
    barcode: "1000000000014",
    productName: "Mystery Snack Bites",
    brandName: "Label Gap",
    productCategory: "snacks",
    ingredientsText: "",
    ingredients: [],
    packagingText: "Plastic pouch",
    rawCategories: ["snacks"],
    rawLabels: ["plastic pouch"],
    rawAllergens: [],
    rawTraces: [],
    dataQualityWarnings: [],
  },
  "0000000000000": {
    found: false,
    provider: "mock",
    barcode: "0000000000000",
    dataQualityWarnings: ["Product was not found in the mock product database."],
  },
};

export async function lookupMockProduct(
  input: ExternalProductLookupInput,
): Promise<ExternalProductLookupResult> {
  const barcode = input.barcode.trim();

  if (barcode === "9999999999999") {
    throw new ProductDatabaseLookupError(
      "network",
      "Product lookup failed. Check your connection and try again.",
    );
  }

  return (
    mockProducts[barcode] ?? {
      found: false,
      provider: "mock",
      barcode,
      dataQualityWarnings: ["Product was not found in the mock product database."],
    }
  );
}
