import {
  createDemoId,
  type DemoScanRecord,
} from "@/lib/demoScanBuilder/demoScanTypes";
import {
  safeLocalStorageGetItem,
  safeLocalStorageRemoveItem,
  safeLocalStorageSetItem,
} from "@/lib/browserStorage";

const DEMO_SCAN_STORAGE_KEY = "truthlabel.admin.demoScans.v1";
const DEMO_SCAN_STORAGE_EVENT = "truthlabel:admin-demo-scans-changed";
const EMPTY_DEMO_SCANS: DemoScanRecord[] = [];
let demoScanRecordsFallback: DemoScanRecord[] = EMPTY_DEMO_SCANS;
let demoScanRecordsRawValue: string | null = null;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isDemoScanRecord(value: unknown): value is DemoScanRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (value as DemoScanRecord).kind === "truthlabel_demo_scan";
}

function normalizeDemoScanRecords(records: DemoScanRecord[]) {
  if (records.length === 0) {
    return EMPTY_DEMO_SCANS;
  }

  return [...records].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

function parseStoredDemoScans(rawValue: string | null) {
  if (!rawValue) {
    demoScanRecordsRawValue = null;
    demoScanRecordsFallback = EMPTY_DEMO_SCANS;
    return EMPTY_DEMO_SCANS;
  }

  if (rawValue === demoScanRecordsRawValue) {
    return demoScanRecordsFallback;
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      demoScanRecordsRawValue = rawValue;
      demoScanRecordsFallback = EMPTY_DEMO_SCANS;
      return EMPTY_DEMO_SCANS;
    }

    const nextRecords = normalizeDemoScanRecords(parsedValue.filter(isDemoScanRecord));
    demoScanRecordsRawValue = rawValue;
    demoScanRecordsFallback = nextRecords;
    return nextRecords;
  } catch {
    demoScanRecordsRawValue = rawValue;
    return demoScanRecordsFallback;
  }
}

export function listDemoScans(): DemoScanRecord[] {
  if (!canUseStorage()) {
    return demoScanRecordsFallback;
  }

  return parseStoredDemoScans(safeLocalStorageGetItem(DEMO_SCAN_STORAGE_KEY));
}

export function getDemoScanStoreServerSnapshot() {
  return EMPTY_DEMO_SCANS;
}

function notifyDemoScanSubscribers() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(DEMO_SCAN_STORAGE_EVENT));
}

export function subscribeToDemoScans(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === DEMO_SCAN_STORAGE_KEY) {
      onStoreChange();
    }
  }

  window.addEventListener(DEMO_SCAN_STORAGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(DEMO_SCAN_STORAGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function loadDemoScan(demoId: string) {
  return listDemoScans().find((demo) => demo.id === demoId) ?? null;
}

export function saveDemoScan(record: DemoScanRecord) {
  const nextRecord = {
    ...record,
    kind: "truthlabel_demo_scan" as const,
    updatedAt: new Date().toISOString(),
  };
  const nextRecords = normalizeDemoScanRecords([
    nextRecord,
    ...listDemoScans().filter((demo) => demo.id !== nextRecord.id),
  ]);
  const serializedRecords = JSON.stringify(nextRecords);

  demoScanRecordsFallback = nextRecords;
  demoScanRecordsRawValue = serializedRecords;
  safeLocalStorageSetItem(DEMO_SCAN_STORAGE_KEY, serializedRecords);
  notifyDemoScanSubscribers();
  return nextRecord;
}

export function deleteDemoScan(demoId: string) {
  const nextRecords = normalizeDemoScanRecords(
    listDemoScans().filter((demo) => demo.id !== demoId),
  );

  demoScanRecordsFallback = nextRecords;

  if (nextRecords.length === 0) {
    demoScanRecordsRawValue = null;
    safeLocalStorageRemoveItem(DEMO_SCAN_STORAGE_KEY);
  } else {
    demoScanRecordsRawValue = JSON.stringify(nextRecords);
    safeLocalStorageSetItem(DEMO_SCAN_STORAGE_KEY, demoScanRecordsRawValue);
  }

  notifyDemoScanSubscribers();
}

export function duplicateDemoScan(record: DemoScanRecord) {
  const now = new Date().toISOString();

  return saveDemoScan({
    ...record,
    id: createDemoId(),
    internalTitle: `${record.internalTitle || record.productName} copy`,
    createdAt: now,
    updatedAt: now,
    categories: record.categories.map((category) => ({
      ...category,
      id: createDemoId("category"),
      findings: category.findings.map((finding) => ({
        ...finding,
        id: createDemoId("finding"),
      })),
    })),
  });
}
