import type {
  ScanResult,
  ScanResultDeepExposureCheck,
  ScanResultOverviewRow,
} from "@/lib/buildScanResult";
import type {
  ScanHistoryCategorySnapshot,
  ScanHistoryResultSnapshot,
  ScanHistorySaveInput,
  ScanHistorySeverity,
  ScanHistorySummaryCounts,
} from "@/lib/scanHistory/scanHistoryTypes";

export const TRUTHLABEL_RULE_VERSION = "truthlabel-rules-v1";
export const TRUTHLABEL_INGREDIENT_DATABASE_VERSION =
  "truthlabel-ingredient-db-v1";

function isSeverity(value: string | null | undefined): value is ScanHistorySeverity {
  return value === "green" || value === "yellow" || value === "red";
}

function toSnapshotSeverity(value: string | null | undefined): ScanHistorySeverity {
  return isSeverity(value) ? value : "green";
}

function categorySortWeight(severity: ScanHistorySeverity) {
  if (severity === "red") {
    return 0;
  }

  if (severity === "yellow") {
    return 1;
  }

  return 2;
}

function rowToCategorySnapshot(
  row: ScanResultOverviewRow | ScanResultDeepExposureCheck,
): ScanHistoryCategorySnapshot {
  const severity = toSnapshotSeverity(row.severity);
  const details =
    "matchedItemDetails" in row ? row.matchedItemDetails : [];

  return {
    categoryId: row.categoryId,
    categoryName: row.label,
    severity,
    triggerReason: row.reason,
    count: row.matchCount,
    title: row.title,
    explanation: row.message,
    action: row.action ?? null,
    findings:
      details.length > 0
        ? details.map((detail) => ({
            canonicalIngredientId: detail.canonicalIngredientId || null,
            displayName: detail.displayName,
            severity,
            reason: detail.userFacingReason,
            explanation: detail.userFacingReason,
          }))
        : row.matchedItemsPreview.map((displayName) => ({
            canonicalIngredientId: null,
            displayName,
            severity,
            reason: row.reason,
            explanation: row.message,
          })),
  };
}

export function buildScanHistoryCategories(
  scanResult: ScanResult,
): ScanHistoryCategorySnapshot[] {
  const byCategory = new Map<string, ScanHistoryCategorySnapshot>();

  [...scanResult.quickOverview, ...scanResult.deepExposureChecks].forEach((row) => {
    if (!row.displayAllowed || !isSeverity(row.severity)) {
      return;
    }

    const next = rowToCategorySnapshot(row);
    const current = byCategory.get(next.categoryId);

    if (
      !current ||
      categorySortWeight(next.severity) < categorySortWeight(current.severity)
    ) {
      byCategory.set(next.categoryId, next);
      return;
    }

    if (current.severity === next.severity) {
      byCategory.set(next.categoryId, {
        ...current,
        count: Math.max(current.count, next.count),
        findings: [...current.findings, ...next.findings],
      });
    }
  });

  return [...byCategory.values()];
}

export function summarizeScanHistoryResult(
  scanResult: ScanResult,
): ScanHistorySummaryCounts {
  const categories = buildScanHistoryCategories(scanResult);
  const greenCount = categories.filter((entry) => entry.severity === "green").length;
  const visibleYellowCount = categories.filter(
    (entry) => entry.severity === "yellow",
  ).length;
  const visibleRedCount = categories.filter((entry) => entry.severity === "red").length;
  const yellowCount = Math.max(
    visibleYellowCount,
    scanResult.finalVerdict.yellowCount,
  );
  const redCount = Math.max(visibleRedCount, scanResult.finalVerdict.totalRedCount);
  const allergenRedCount = categories.filter(
    (entry) => entry.categoryId === "allergy_risk" && entry.severity === "red",
  ).length;
  const highProcessingLoad = categories.some(
    (entry) =>
      entry.severity === "red" &&
      (entry.categoryId === "ultra_processed_indicators" ||
        entry.categoryId === "natural_vs_processed"),
  );

  return {
    greenCount,
    yellowCount,
    redCount,
    seriousRedCount: scanResult.finalVerdict.seriousRedCount,
    overloadRedCount: scanResult.finalVerdict.overloadRedCount,
    allergenRedCount,
    highProcessingLoad,
  };
}

export function buildScanHistorySnapshot(
  input: ScanHistorySaveInput,
): ScanHistoryResultSnapshot {
  return {
    scanResult: input.scanResult,
    categories: buildScanHistoryCategories(input.scanResult),
    ingredientsText: input.ingredientText?.trim() || null,
    parsedIngredients:
      input.parsedIngredients ?? [
        ...input.scanResult.ingredientBreakdown.matchedIngredients,
        ...input.scanResult.ingredientBreakdown.unmatchedIngredients,
      ].map((ingredient) => ingredient.originalText),
    nutrition: input.nutrition ?? null,
    nutriScore: input.nutriScore ?? null,
    novaGroup: input.novaGroup ?? null,
    dataConfidence:
      input.scanResult.confidenceNotes.length > 0 ? "medium" : "high",
    source: input.source ?? input.scanResult.productHero.scanSource ?? null,
    sourceLastUpdatedAt: input.sourceLastUpdatedAt ?? null,
    ruleVersion: TRUTHLABEL_RULE_VERSION,
    ingredientDatabaseVersion: TRUTHLABEL_INGREDIENT_DATABASE_VERSION,
  };
}

export function buildScanHistorySaveSignature(input: ScanHistorySaveInput) {
  const product = input.scanResult.productHero;

  return [
    product.barcode || "no-barcode",
    product.productName,
    product.brandName,
    input.scanResult.ingredientLoad.score,
    input.scanResult.finalVerdict.verdictCode,
    input.ingredientText?.trim() || "",
  ]
    .join("|")
    .toLowerCase();
}
