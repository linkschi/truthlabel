import assert from "node:assert/strict";
import test from "node:test";

import { getDemoScanResult } from "@/lib/getDemoScanResult";

import {
  loadLatestBarcodeScan,
  saveLatestBarcodeScan,
  type StoredBarcodeScan,
} from "./barcodeScanStorage";
import {
  loadLatestManualScan,
  saveLatestManualScan,
  type StoredManualScan,
} from "./manualScanStorage";

function withNoWindow(callback: () => void) {
  const hadWindow = "window" in globalThis;
  const originalWindow = hadWindow ? globalThis.window : undefined;

  Reflect.deleteProperty(globalThis, "window");

  try {
    callback();
  } finally {
    if (hadWindow) {
      Object.defineProperty(globalThis, "window", {
        value: originalWindow,
        configurable: true,
      });
    }
  }
}

test("manual scan storage keeps an in-memory fallback when localStorage is unavailable", () => {
  withNoWindow(() => {
    const payload: StoredManualScan = {
      input: {
        productName: "Fallback Manual Product",
        ingredientText: "Rolled oats",
        scanSource: "manual_paste",
      },
      result: getDemoScanResult("Fresh / Simple Foods", []),
      savedAt: "2026-07-15T00:00:00.000Z",
    };

    saveLatestManualScan(payload);

    assert.deepEqual(loadLatestManualScan(), payload);
  });
});

test("barcode scan storage keeps an in-memory fallback when localStorage is unavailable", () => {
  withNoWindow(() => {
    const payload: StoredBarcodeScan = {
      input: {
        barcode: "0123456789012",
        userAllergyProfile: ["Milk"],
      },
      lookupStatus: "found",
      productData: {
        productName: "Fallback Barcode Product",
        brandName: "InsideIt Test",
        barcode: "0123456789012",
        productCategory: "General / Unknown",
        ingredientText: "Water, Sugar",
        ingredients: ["Water", "Sugar"],
        allergenStatement: "",
        packagingText: "PET bottle",
        scanSource: "barcode",
        externalSignals: [],
        dataQualityWarnings: [],
      },
      result: getDemoScanResult("Drinks / Beverages", []),
      message: "Stored without browser localStorage.",
      dataQualityWarnings: [],
      savedAt: "2026-07-15T00:00:00.000Z",
    };

    saveLatestBarcodeScan(payload);

    assert.deepEqual(loadLatestBarcodeScan(), payload);
  });
});
