import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";

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

function createDom() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://truthlabel.test",
  });

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
  });

  return dom;
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
        brandName: "Truthlabel Test",
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

test("manual scan storage reuses its parsed snapshot while localStorage is unchanged", () => {
  const dom = createDom();

  try {
    const payload: StoredManualScan = {
      input: {
        productName: "Saved Manual Product",
        ingredientText: "Water, sodium benzoate",
        scanSource: "manual_paste",
      },
      result: getDemoScanResult("Drinks / Beverages", []),
      savedAt: "2026-07-16T00:00:00.000Z",
    };

    dom.window.localStorage.setItem(
      "insideit.manual-scan.latest",
      JSON.stringify(payload),
    );

    const firstSnapshot = loadLatestManualScan();
    const secondSnapshot = loadLatestManualScan();

    assert.strictEqual(secondSnapshot, firstSnapshot);
  } finally {
    dom.window.close();
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");
  }
});

test("barcode scan storage reuses its parsed snapshot while localStorage is unchanged", () => {
  const dom = createDom();

  try {
    const payload: StoredBarcodeScan = {
      input: {
        barcode: "5449000000996",
        userAllergyProfile: [],
      },
      lookupStatus: "found",
      productData: {
        productName: "Saved Barcode Product",
        brandName: "Truthlabel Test",
        barcode: "5449000000996",
        productCategory: "Drinks / Beverages",
        ingredientText: "Water, Sugar",
        ingredients: ["Water", "Sugar"],
        allergenStatement: "",
        packagingText: "Can",
        scanSource: "barcode",
        externalSignals: [],
        dataQualityWarnings: [],
      },
      result: getDemoScanResult("Drinks / Beverages", []),
      message: "Stored with browser localStorage.",
      dataQualityWarnings: [],
      savedAt: "2026-07-16T00:00:00.000Z",
    };

    dom.window.localStorage.setItem(
      "insideit.barcode-scan.latest",
      JSON.stringify(payload),
    );

    const firstSnapshot = loadLatestBarcodeScan();
    const secondSnapshot = loadLatestBarcodeScan();

    assert.strictEqual(secondSnapshot, firstSnapshot);
  } finally {
    dom.window.close();
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");
  }
});
