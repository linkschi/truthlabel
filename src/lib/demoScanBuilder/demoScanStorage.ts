import {
  createDemoId,
  type DemoScanRecord,
} from "@/lib/demoScanBuilder/demoScanTypes";

const DEMO_SCAN_STORAGE_KEY = "truthlabel.admin.demoScans.v1";
const DEMO_SCAN_STORAGE_EVENT = "truthlabel:admin-demo-scans-changed";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isDemoScanRecord(value: unknown): value is DemoScanRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (value as DemoScanRecord).kind === "truthlabel_demo_scan";
}

export function listDemoScans(): DemoScanRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(DEMO_SCAN_STORAGE_KEY);
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : [];

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter(isDemoScanRecord)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  } catch {
    return [];
  }
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
  if (!canUseStorage()) {
    return record;
  }

  const nextRecord = {
    ...record,
    kind: "truthlabel_demo_scan" as const,
    updatedAt: new Date().toISOString(),
  };
  const existingRecords = listDemoScans();
  const nextRecords = [
    nextRecord,
    ...existingRecords.filter((demo) => demo.id !== nextRecord.id),
  ];

  window.localStorage.setItem(DEMO_SCAN_STORAGE_KEY, JSON.stringify(nextRecords));
  notifyDemoScanSubscribers();
  return nextRecord;
}

export function deleteDemoScan(demoId: string) {
  if (!canUseStorage()) {
    return;
  }

  const nextRecords = listDemoScans().filter((demo) => demo.id !== demoId);
  window.localStorage.setItem(DEMO_SCAN_STORAGE_KEY, JSON.stringify(nextRecords));
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
