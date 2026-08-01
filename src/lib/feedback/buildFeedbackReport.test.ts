import assert from "node:assert/strict";
import test from "node:test";

import { runManualScan } from "@/lib/runManualScan";

import { buildFeedbackReport } from "./buildFeedbackReport";

test("buildFeedbackReport includes product context, warnings, and privacy note", () => {
  const result = runManualScan({
    productName: "Tester Soda",
    brandName: "Truthlabel Labs",
    ingredientText: "Carbonated water, Red No. 3, Sodium benzoate",
  });

  const report = buildFeedbackReport({
    issueType: "wrong_ingredient_match",
    message: "The warning order looks confusing on this result.",
    ingredientText: "Carbonated water, Red No. 3, Sodium benzoate",
    scanResult: result,
    browserDeviceInfo: "Chrome | Android | viewport 412x915",
    reportCreatedAt: "2026-07-15T12:00:00.000Z",
  });

  assert.ok(report.includes("Truthlabel MVP Feedback Report"));
  assert.ok(report.includes("Product name: Tester Soda"));
  assert.ok(report.includes("Brand name: Truthlabel Labs"));
  assert.ok(report.includes("Scan method: manual"));
  assert.ok(report.includes("Ingredient Score:"));
  assert.ok(!report.includes("Exposure Risk:"));
  assert.ok(report.includes("Top warnings shown:"));
  assert.ok(report.includes("Banned / Restricted Items"));
  assert.ok(
    report.includes(
      "Privacy note: Only share information you are comfortable sending.",
    ),
  );
});

test("buildFeedbackReport can build a copyable report without a scan result", () => {
  const report = buildFeedbackReport({
    issueType: "app_bug",
    productName: "Unknown label",
    brandName: "Unknown brand",
    scanMethod: "ocr",
    message: "The app closed while I was reviewing OCR text.",
    browserDeviceInfo: "Safari | iPhone",
    reportCreatedAt: "2026-07-15T12:30:00.000Z",
  });

  assert.ok(report.includes("Issue type: app_bug"));
  assert.ok(report.includes("Product name: Unknown label"));
  assert.ok(report.includes("Scan method: ocr"));
  assert.ok(report.includes("Barcode: Not provided"));
  assert.ok(report.includes("Browser/device: Safari | iPhone"));
});
