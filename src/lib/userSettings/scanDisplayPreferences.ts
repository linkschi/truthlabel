import type { ScanResult } from "@/lib/buildScanResult";

import type { InsideItUserSettings } from "./userSettingsTypes";

export function getVisibleDeepExposureChecks(
  scanResult: ScanResult,
  settings: InsideItUserSettings,
) {
  return scanResult.deepExposureChecks.filter(
    (row) =>
      row.displayAllowed ||
      (settings.scanPreferences.showNotCheckedExternalSections &&
        row.status === "not_checked"),
  );
}

export function getVisibleConfidenceNotes(
  scanResult: ScanResult,
  settings: InsideItUserSettings,
) {
  return settings.scanPreferences.showConfidenceNotes
    ? scanResult.confidenceNotes
    : [];
}

export function shouldShowBrandTrustSafety(
  scanResult: ScanResult,
  settings: InsideItUserSettings,
) {
  return (
    scanResult.brandTrustSafety.status !== "not_checked" ||
    settings.scanPreferences.showNotCheckedExternalSections
  );
}
