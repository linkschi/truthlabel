import assert from "node:assert/strict";
import test from "node:test";

import { getDemoScanResult } from "@/lib/getDemoScanResult";

import { defaultUserSettings } from "./defaultUserSettings";
import {
  getVisibleConfidenceNotes,
  getVisibleDeepExposureChecks,
  shouldShowBrandTrustSafety,
} from "./scanDisplayPreferences";

function buildSettings(overrides?: Partial<typeof defaultUserSettings>) {
  return {
    ...defaultUserSettings,
    ...overrides,
    allergyProfile: {
      ...defaultUserSettings.allergyProfile,
      ...(overrides?.allergyProfile ?? {}),
    },
    regionSettings: {
      ...defaultUserSettings.regionSettings,
      ...(overrides?.regionSettings ?? {}),
    },
    scanPreferences: {
      ...defaultUserSettings.scanPreferences,
      ...(overrides?.scanPreferences ?? {}),
    },
  };
}

test("display preferences keep Deep Exposure focused on yellow and red issue rows", () => {
  const result = getDemoScanResult("general-unknown", ["milk"]);
  const settings = buildSettings({
    scanPreferences: {
      ...defaultUserSettings.scanPreferences,
      showNotCheckedExternalSections: true,
    },
  });

  const deepChecks = getVisibleDeepExposureChecks(result);

  assert.ok(deepChecks.length > 0);
  assert.ok(
    deepChecks.every(
      (row) => row.severity === "yellow" || row.severity === "red",
    ),
  );
  assert.equal(shouldShowBrandTrustSafety(result, settings), false);
});

test("display preferences hide not-checked external rows and brand trust when disabled", () => {
  const result = getDemoScanResult("general-unknown", ["milk"]);
  const settings = buildSettings({
    scanPreferences: {
      ...defaultUserSettings.scanPreferences,
      showNotCheckedExternalSections: false,
    },
  });

  const deepChecks = getVisibleDeepExposureChecks(result);

  assert.equal(
    deepChecks.some((row) => row.categoryId === "brand_trust_safety"),
    false,
  );
  assert.equal(shouldShowBrandTrustSafety(result, settings), false);
});

test("display preferences hide confidence notes when disabled", () => {
  const result = getDemoScanResult("general-unknown", ["milk"]);
  const settings = buildSettings({
    scanPreferences: {
      ...defaultUserSettings.scanPreferences,
      showConfidenceNotes: false,
    },
  });

  assert.deepEqual(getVisibleConfidenceNotes(result, settings), []);
});
