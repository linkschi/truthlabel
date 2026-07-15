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
  latestBarcodeScanFallback = payload;

  safeLocalStorageSetItem(BARCODE_SCAN_STORAGE_KEY, JSON.stringify(payload));
}

export function loadLatestBarcodeScan() {
  const rawValue = safeLocalStorageGetItem(BARCODE_SCAN_STORAGE_KEY);

  if (!rawValue) {
    return latestBarcodeScanFallback;
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredBarcodeScan;
    latestBarcodeScanFallback = parsed;
    return parsed;
  } catch {
    return latestBarcodeScanFallback;
  }
}
