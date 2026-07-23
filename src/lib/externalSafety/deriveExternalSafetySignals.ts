import type { BarcodeExternalSignal } from "@/lib/productDatabase/productDatabaseTypes";

import type {
  ExternalSafetyLookupResult,
  ExternalSafetySignal,
} from "./externalSafetyTypes";
import { isExternalSafetySignal } from "./externalSafetyTypes";

function hasKeyword(value: string | undefined, pattern: RegExp) {
  return pattern.test(value ?? "");
}

function toBrandTrustSignalTitle(signal: ExternalSafetySignal) {
  switch (signal.signalType) {
    case "allergen_recall":
      return "Undeclared Allergen Recall";
    case "pathogen_contamination":
      return "Pathogen Contamination Recall";
    case "foreign_material":
      return "Foreign Material Recall";
    case "heavy_metal_warning":
      return "Heavy Metal Warning";
    case "chemical_contamination":
      return "Chemical Contamination Recall";
    case "labeling_misbranding":
      return signal.severity === "red"
        ? "Active Official Recall"
        : "Historical Recall";
    case "public_health_alert":
      return "Public Health Alert";
    case "historical_recall":
      return "Resolved / Historical Recall";
    case "active_recall":
    default:
      return signal.severity === "red"
        ? "Active Official Recall"
        : signal.status === "active"
          ? "Possible Safety Alert Match"
          : "Resolved / Historical Recall";
  }
}

function buildLookupStatusSignal(
  categoryId: string,
  title: string,
  status: string,
  sourceName: string,
  reason: string,
): BarcodeExternalSignal {
  return {
    categoryId,
    lookupPerformed: true,
    checked: true,
    title,
    status,
    result: reason,
    sourceName,
    reason,
  };
}

function buildDerivedSignalsForSafetySignal(signal: ExternalSafetySignal) {
  const sourceName = signal.sourceName || signal.sourceProvider;
  const reason =
    signal.reason?.trim() ||
    signal.userFacingMessage.trim() ||
    signal.title.trim();
  const derivedSignals: BarcodeExternalSignal[] = [
    buildLookupStatusSignal(
      "brand_trust_safety",
      toBrandTrustSignalTitle(signal),
      signal.status,
      sourceName,
      reason,
    ),
  ];

  if (signal.signalType === "heavy_metal_warning") {
    derivedSignals.push(
      buildLookupStatusSignal(
        "heavy_metals",
        "Heavy Metal Warning",
        signal.status,
        sourceName,
        reason,
      ),
    );
  }

  if (
    hasKeyword(signal.title, /microplastic|nanoplastic/i) ||
    hasKeyword(signal.reason, /microplastic|nanoplastic/i) ||
    hasKeyword(signal.userFacingMessage, /microplastic|nanoplastic/i)
  ) {
    derivedSignals.push(
      buildLookupStatusSignal(
        "microplastics",
        "Microplastic Warning",
        signal.status,
        sourceName,
        reason,
      ),
    );
  }

  return derivedSignals;
}

function stableSignalKey(signal: BarcodeExternalSignal) {
  if (typeof signal === "string") {
    return `text:${signal.trim().toLowerCase()}`;
  }

  if (!signal || typeof signal !== "object" || Array.isArray(signal)) {
    return `other:${String(signal)}`;
  }

  const record = signal as Record<string, unknown>;
  if (isExternalSafetySignal(signal)) {
    return `external-safety:${signal.id}`;
  }

  return [
    "lookup",
    record.categoryId,
    record.title,
    record.status,
    record.sourceName,
    record.reason,
    record.result,
  ]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .join(":");
}

function uniqueExternalSignals(signals: BarcodeExternalSignal[]) {
  const seen = new Set<string>();
  const uniqueSignals: BarcodeExternalSignal[] = [];

  signals.forEach((signal) => {
    const key = stableSignalKey(signal);
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    uniqueSignals.push(signal);
  });

  return uniqueSignals;
}

export function buildDerivedExternalSafetySignals(
  lookupResult: ExternalSafetyLookupResult,
): BarcodeExternalSignal[] {
  const derivedSignals: BarcodeExternalSignal[] = [...lookupResult.signals];

  lookupResult.signals.forEach((signal) => {
    derivedSignals.push(...buildDerivedSignalsForSafetySignal(signal));
  });

  if (lookupResult.lookupPerformed && lookupResult.signals.length === 0) {
    const checkedSources = lookupResult.cleanCheckedSources.join(", ");
    derivedSignals.push(
      buildLookupStatusSignal(
        "brand_trust_safety",
        "Clean Official Recall Check",
        "clean",
        checkedSources || "checked sources",
        "No official recall signal found in checked sources at the time of lookup.",
      ),
    );
  }

  return uniqueExternalSignals(derivedSignals);
}

export function normalizeExternalSignalsForIngredientScan(
  signals: BarcodeExternalSignal[] | undefined,
): BarcodeExternalSignal[] {
  const inputSignals = signals ?? [];
  const derivedSignals = inputSignals.flatMap((signal) =>
    isExternalSafetySignal(signal) ? buildDerivedSignalsForSafetySignal(signal) : [],
  );

  return uniqueExternalSignals([...inputSignals, ...derivedSignals]);
}
