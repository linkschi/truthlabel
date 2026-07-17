import type { ScanResult } from "@/lib/buildScanResult";
import {
  safeLocalStorageGetItem,
  safeLocalStorageSetItem,
} from "@/lib/browserStorage";
import type { ManualScanInput } from "@/lib/runManualScan";

const MANUAL_SCAN_STORAGE_KEY = "insideit.manual-scan.latest";
let latestManualScanFallback: StoredManualScan | null = null;
let latestManualScanRawValue: string | null = null;

export type StoredManualScan = {
  input: ManualScanInput;
  result: ScanResult;
  savedAt: string;
};

export function saveLatestManualScan(payload: StoredManualScan) {
  const serializedPayload = JSON.stringify(payload);

  latestManualScanFallback = payload;
  latestManualScanRawValue = serializedPayload;

  safeLocalStorageSetItem(MANUAL_SCAN_STORAGE_KEY, serializedPayload);
}

export function loadLatestManualScan() {
  const rawValue = safeLocalStorageGetItem(MANUAL_SCAN_STORAGE_KEY);

  if (!rawValue) {
    latestManualScanRawValue = null;
    return latestManualScanFallback;
  }

  if (rawValue === latestManualScanRawValue) {
    return latestManualScanFallback;
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredManualScan;
    latestManualScanRawValue = rawValue;
    latestManualScanFallback = parsed;
    return parsed;
  } catch {
    latestManualScanRawValue = rawValue;
    return latestManualScanFallback;
  }
}
