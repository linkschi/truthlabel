import { getCategoryProfile } from "@/data/categoryProfiles";
import type {
  ExposureCheckResult,
  ProductCategory,
  Severity,
} from "@/types/exposure";

function getPriority(severity: Severity) {
  if (severity === "red") {
    return 0;
  }

  if (severity === "yellow") {
    return 1;
  }

  if (severity === "neutral") {
    return 2;
  }

  return 3;
}

const hiddenQuickOverviewIds = new Set<ExposureCheckResult["id"]>([
  "additives_preservatives",
  "artificial_engineered_food_construction",
  "artificial_colours",
  "total_ingredients",
]);

const requiredIngredientOverviewIds: ExposureCheckResult["id"][] = [
  "ultra_processed",
];

export function buildQuickOverview(
  productCategory: ProductCategory,
  allCheckResults: ExposureCheckResult[],
) {
  const profile = getCategoryProfile(productCategory);
  const normalIds = [
    ...profile.quickOverviewIds,
    ...requiredIngredientOverviewIds,
  ].filter((id, index, ids) => !hiddenQuickOverviewIds.has(id) && ids.indexOf(id) === index);
  const allById = new Map(allCheckResults.map((row) => [row.id, row]));

  const normalRows = normalIds
    .map((id, index) => ({ row: allById.get(id), index }))
    .filter(
      (
        entry,
      ): entry is { row: ExposureCheckResult; index: number } => entry.row !== undefined,
    );

  const seriousRows = allCheckResults
    .filter(
      (row) =>
        !hiddenQuickOverviewIds.has(row.id) &&
        row.isAutomaticSeriousOverride &&
        row.hasMeaningfulValue &&
        row.severity === "red",
    )
    .map((row, index) => ({
      row,
      index: normalRows.length + index,
    }));

  const merged = [...normalRows, ...seriousRows];
  const seen = new Set<string>();

  return merged
    .filter(({ row }) => {
      if (!row.hasMeaningfulValue || seen.has(row.id)) {
        return false;
      }

      seen.add(row.id);
      return true;
    })
    .sort((a, b) => {
      const priorityDelta = getPriority(a.row.severity) - getPriority(b.row.severity);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return a.index - b.index;
    })
    .map(({ row }) => row);
}
