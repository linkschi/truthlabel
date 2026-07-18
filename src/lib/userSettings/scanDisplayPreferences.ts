import type { ScanResult } from "@/lib/buildScanResult";

import type { InsideItUserSettings } from "./userSettingsTypes";

export function getVisibleDeepExposureChecks(
  scanResult: ScanResult,
) {
  return scanResult.deepExposureChecks.filter(
    (row) =>
      row.displayAllowed &&
      (row.severity === "yellow" || row.severity === "red"),
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
  void scanResult;
  void settings;

  // TODO: Re-enable Brand Trust / Safety on the result page after the MVP layout is ready for it.
  return false;
}
