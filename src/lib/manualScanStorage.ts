import type { ScanResult } from "@/lib/buildScanResult";
import {
  safeLocalStorageGetItem,
  safeLocalStorageSetItem,
} from "@/lib/browserStorage";
import type { ManualScanInput } from "@/lib/runManualScan";

const MANUAL_SCAN_STORAGE_KEY = "insideit.manual-scan.latest";
let latestManualScanFallback: StoredManualScan | null = null;

export type StoredManualScan = {
  input: ManualScanInput;
  result: ScanResult;
  savedAt: string;
};

export function saveLatestManualScan(payload: StoredManualScan) {
  latestManualScanFallback = payload;

  safeLocalStorageSetItem(MANUAL_SCAN_STORAGE_KEY, JSON.stringify(payload));
}

export function loadLatestManualScan() {
  const rawValue = safeLocalStorageGetItem(MANUAL_SCAN_STORAGE_KEY);

  if (!rawValue) {
    return latestManualScanFallback;
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredManualScan;
    latestManualScanFallback = parsed;
    return parsed;
  } catch {
    return latestManualScanFallback;
  }
}
