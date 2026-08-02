import assert from "node:assert/strict";
import test from "node:test";

import { normalizeExternalProduct } from "@/lib/productDatabase/normalizeExternalProduct";
import { lookupMockProduct } from "@/lib/productDatabase/mockProductDatabaseClient";

import {
  BarcodeValidationError,
  runBarcodeScan,
  validateBarcode,
} from "./runBarcodeScan";
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

function findQuickOverviewRow(
  output: Awaited<ReturnType<typeof runBarcodeScan>>,
  categoryId: string,
) {
  const row = output.scanResult?.quickOverview.find(
    (entry) => entry.categoryId === categoryId,
  );

  assert.ok(row, `Expected quick overview row for ${categoryId}`);
  return row;
}

function findDeepExposureRow(
  output: Awaited<ReturnType<typeof runBarcodeScan>>,
  categoryId: string,
) {
  const row = output.scanResult?.deepExposureChecks.find(
    (entry) => entry.categoryId === categoryId,
  );

  assert.ok(row, `Expected deep exposure row for ${categoryId}`);
  return row;
}

test("valid barcode passes validation", () => {
  assert.equal(validateBarcode(" 1000000000002 "), "1000000000002");
});

test("invalid barcode fails validation", () => {
  assert.throws(
    () => validateBarcode("abc123"),
    (error: unknown) => {
      assert.ok(error instanceof BarcodeValidationError);
      assert.equal(error.message, "Enter a valid product barcode.");
      return true;
    },
  );
});

test("product found with ingredients returns a scan result", async () => {
  const output = await runBarcodeScan(
    { barcode: "1000000000001" },
    { lookupProduct: lookupMockProduct },
  );

  assert.equal(output.lookupStatus, "found");
  assert.equal(output.manualInputNeeded, false);
  assert.ok(output.scanResult);
  assert.equal(output.scanResult?.productHero.scanSource, "barcode");
  assert.equal(output.scanResult?.productHero.productName, "Simple Rolled Oats");
  assert.equal(
    output.scanResult?.productHero.imageUrl,
    "https://images.openfoodfacts.org/mock/simple-rolled-oats.jpg",
  );
  assert.equal(output.scanResult?.productHero.imageSource, "product_database");
});

test("barcode scan uses captured image when product database image is missing", async () => {
  const output = await runBarcodeScan(
    {
      barcode: "1000000000002",
      capturedImageUrl: "data:image/jpeg;base64,YmFyY29kZQ==",
    },
    { lookupProduct: lookupMockProduct },
  );

  assert.equal(output.lookupStatus, "found");
  assert.equal(
    output.scanResult?.productHero.imageUrl,
    "data:image/jpeg;base64,YmFyY29kZQ==",
  );
  assert.equal(output.scanResult?.productHero.imageSource, "captured_scan");
  assert.equal(
    output.productData?.imageUrl,
    "data:image/jpeg;base64,YmFyY29kZQ==",
  );
});

test("product found without ingredients returns manual fallback", async () => {
  const output = await runBarcodeScan(
    { barcode: "1000000000014" },
    { lookupProduct: lookupMockProduct },
  );

  assert.equal(output.lookupStatus, "found_missing_ingredients");
  assert.equal(output.manualInputNeeded, true);
  assert.equal(output.scanResult, undefined);
  assert.ok(output.productData);
  assert.equal(output.productData?.ingredientText, "");
});

test("product not found returns manual fallback", async () => {
  const output = await runBarcodeScan(
    { barcode: "0000000000000" },
    { lookupProduct: lookupMockProduct },
  );

  assert.equal(output.lookupStatus, "not_found");
  assert.equal(output.manualInputNeeded, true);
  assert.equal(output.scanResult, undefined);
});

test("unknown regional barcode not found returns general manual fallback guidance", async () => {
  const output = await runBarcodeScan(
    { barcode: "6003678052405" },
    {
      lookupProduct: async (input) => ({
        found: false,
        provider: "open_food_facts",
        barcode: input.barcode,
        dataQualityWarnings: ["product not found"],
      }),
    },
  );

  assert.equal(output.lookupStatus, "not_found");
  assert.equal(output.manualInputNeeded, true);
  assert.match(output.message, /does not have this barcode/i);
  assert.match(output.message, /product record may have changed/i);
  assert.ok(
    output.dataQualityWarnings.every(
      (warning) => !/South African|South Africa/i.test(warning),
    ),
  );
});

test("network error returns manual fallback", async () => {
  const output = await runBarcodeScan(
    { barcode: "9999999999999" },
    { lookupProduct: lookupMockProduct },
  );

  assert.equal(output.lookupStatus, "error");
  assert.equal(output.manualInputNeeded, true);
  assert.equal(output.scanResult, undefined);
});

test("Red Berry Soda from barcode returns a red warning", async () => {
  const output = await runBarcodeScan(
    { barcode: "1000000000002" },
    { lookupProduct: lookupMockProduct },
  );
  const bannedRow = findQuickOverviewRow(output, "banned_restricted_items");

  assert.equal(bannedRow.severity, "red");
  assert.equal(output.scanResult?.finalVerdict.verdictTone, "red");
});

test("Zero Sugar Drink from barcode returns direct red sweetener warning", async () => {
  const output = await runBarcodeScan(
    { barcode: "1000000000003" },
    { lookupProduct: lookupMockProduct },
  );
  const sweetenerOverviewRow = output.scanResult?.quickOverview.find(
    (entry) => entry.categoryId === "artificial_sweeteners_sugar_substitutes",
  );
  const sweetenerDeepRow = findDeepExposureRow(
    output,
    "artificial_sweeteners_sugar_substitutes",
  );

  assert.equal(sweetenerOverviewRow, undefined);
  assert.equal(sweetenerDeepRow.severity, "red");
  assert.equal(sweetenerDeepRow.redReasonType, "direct_red_ingredient");
});

test("Chocolate Milk with milk allergy profile returns Allergy Risk red", async () => {
  const output = await runBarcodeScan(
    {
      barcode: "1000000000009",
      userAllergyProfile: ["milk"],
    },
    { lookupProduct: lookupMockProduct },
  );
  const allergyRow = findQuickOverviewRow(output, "allergy_risk");

  assert.equal(allergyRow.severity, "red");
  assert.equal(allergyRow.redReasonType, "allergy_profile_match");
});

test("missing ingredients does not show false green ingredient-based checks", async () => {
  const output = await runBarcodeScan(
    { barcode: "1000000000014" },
    { lookupProduct: lookupMockProduct },
  );

  assert.equal(output.lookupStatus, "found_missing_ingredients");
  assert.equal(output.scanResult, undefined);
});

test("external product warnings are added to confidence notes", async () => {
  const output = await runBarcodeScan(
    { barcode: "1000000000001" },
    { lookupProduct: lookupMockProduct },
  );
  const confidenceNotes = output.scanResult?.confidenceNotes ?? [];

  assert.ok(
    confidenceNotes.includes(
      "Product database data may be incomplete or user-submitted. Check the product label if something looks missing.",
    ),
  );
  assert.ok(
    confidenceNotes.includes(
      "Allergen data from the product database may be incomplete. Always check the package label for allergen statements.",
    ),
  );
});

test("product category mapping works correctly", () => {
  const normalized = normalizeExternalProduct({
    found: true,
    provider: "mock",
    barcode: "12345678",
    productName: "Toddler Rice Puffs",
    brandName: "Little Start",
    productCategory: "baby foods",
    ingredientsText: "Rice flour, apple powder",
    ingredients: ["Rice flour", "Apple powder"],
    rawCategories: ["baby foods", "infant cereals"],
    rawLabels: [],
    rawAllergens: [],
    rawTraces: [],
    dataQualityWarnings: [],
  });

  assert.equal(normalized.productCategory, "Baby / Kids Food");
});

test("runBarcodeScan uses saved region settings for external safety lookup", async () => {
  const restoreWindow = installMockWindowWithStorage({
    "insideit.user-settings": JSON.stringify({
      ...defaultUserSettings,
      regionSettings: {
        region: "UK",
        country: "GB",
        language: "en-GB",
      },
      updatedAt: "2026-07-15T10:00:00.000Z",
    }),
  });
  let capturedLookupInput:
    | {
        barcode?: string;
        productName?: string;
        brandName?: string;
        productCategory?: string;
        country?: string;
        region?: string;
      }
    | undefined;

  try {
    const output = await runBarcodeScan(
      { barcode: "1000000000001" },
      {
        lookupProduct: lookupMockProduct,
        lookupExternalSafety: async (lookupInput) => {
          capturedLookupInput = lookupInput;

          return {
            lookupPerformed: true,
            signals: [],
            cleanCheckedSources: ["openFDA"],
            warnings: [],
            errors: [],
          };
        },
      },
    );

    assert.equal(capturedLookupInput?.region, "UK");
    assert.equal(capturedLookupInput?.country, "GB");
    assert.equal(output.scanResult?.brandTrustSafety.status, "clear_checked");
  } finally {
    restoreWindow();
  }
});
