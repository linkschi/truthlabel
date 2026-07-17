import type { ScanResult } from "@/lib/buildScanResult";
import {
  safeLocalStorageGetItem,
  safeLocalStorageSetItem,
} from "@/lib/browserStorage";
import type { NormalizedProductForScan } from "@/lib/productDatabase/productDatabaseTypes";
import type {
  BarcodeScanInput,
  BarcodeScanLookupStatus,
} from "@/lib/runBarcodeScan";

const BARCODE_SCAN_STORAGE_KEY = "insideit.barcode-scan.latest";
let latestBarcodeScanFallback: StoredBarcodeScan | null = null;
let latestBarcodeScanRawValue: string | null = null;

export type StoredBarcodeScan = {
  input: BarcodeScanInput;
  lookupStatus: BarcodeScanLookupStatus;
  productData: NormalizedProductForScan;
  result: ScanResult;
  message: string;
  dataQualityWarnings: string[];
  savedAt: string;
};

export function saveLatestBarcodeScan(payload: StoredBarcodeScan) {
  const serializedPayload = JSON.stringify(payload);

  latestBarcodeScanFallback = payload;
  latestBarcodeScanRawValue = serializedPayload;

  safeLocalStorageSetItem(BARCODE_SCAN_STORAGE_KEY, serializedPayload);
}

export function loadLatestBarcodeScan() {
  const rawValue = safeLocalStorageGetItem(BARCODE_SCAN_STORAGE_KEY);

  if (!rawValue) {
    latestBarcodeScanRawValue = null;
    return latestBarcodeScanFallback;
  }

  if (rawValue === latestBarcodeScanRawValue) {
    return latestBarcodeScanFallback;
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredBarcodeScan;
    latestBarcodeScanRawValue = rawValue;
    latestBarcodeScanFallback = parsed;
    return parsed;
  } catch {
    latestBarcodeScanRawValue = rawValue;
    return latestBarcodeScanFallback;
  }
}
