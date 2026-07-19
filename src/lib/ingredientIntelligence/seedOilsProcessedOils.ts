import {
  seedOilsProcessedOilsDataPack,
  type SeedOilsProcessedOilsItem,
} from "@/data/ingredientIntelligence/seedOilsProcessedOils";
import { bannedRestrictedItems } from "@/data/ingredientIntelligence/bannedRestrictedItems";
import {
  findAliasMatches,
  normalizeAliasText,
} from "@/lib/ingredientIntelligence/aliasMatching";

export type SeedOilsProcessedOilsCategorySummary = {
  totalCount: number;
  redItemCount: number;
  yellowItemCount: number;
  categorySeverity: "green" | "yellow" | "red";
  hasHydrogenatedOil: boolean;
  hasAutomaticRed: boolean;
  redItems: SeedOilsProcessedOilsItem[];
  yellowItems: SeedOilsProcessedOilsItem[];
};

const genericOilId = "generic_vegetable_oil";
const refinedOilId = "refined_oil_marker";
const hydrogenatedOilId = "hydrogenated_oils";
const partiallyHydrogenatedOilId = "partially_hydrogenated_oils";
const baseOilIds = new Set([
  "canola_oil_rapeseed_oil",
  "soybean_oil",
  "sunflower_oil",
  "corn_oil",
  "cottonseed_oil",
  "safflower_oil",
  "grapeseed_oil",
  "rice_bran_oil",
  "peanut_oil_groundnut_oil",
  "sesame_oil",
  "palm_oil",
  "palm_kernel_oil",
  "coconut_oil_processed",
]);
const aliasFields = [
  "otherNames",
  "chemicalNames",
  "brandNames",
  "eNumbers",
  "insNumbers",
  "abbreviations",
  "labelVariants",
  "regionalNames",
] as const;

function itemText(item: SeedOilsProcessedOilsItem) {
  return [
    item.mainName,
    ...item.otherNames,
    ...item.chemicalNames,
    ...item.brandNames,
    ...item.eNumbers,
    ...item.insNumbers,
    ...item.abbreviations,
    ...item.labelVariants,
    ...item.spellingVariants,
    ...item.regionalNames,
  ].join(" ");
}

function buildMatchTerms(item: SeedOilsProcessedOilsItem) {
  const values = new Set<string>([item.mainName]);

  aliasFields.forEach((fieldName) => {
    item[fieldName].forEach((value) => values.add(value));
  });

  const terms = new Set<string>();

  [...values]
    .map(normalizeAliasText)
    .filter(Boolean)
    .forEach((value) => {
      terms.add(value);
    });

  return [...terms.values()];
}

function includesNormalizedTerm(haystack: string, term: string) {
  return ` ${haystack} `.includes(` ${term} `);
}

function hasNonHydrogenatedWording(haystack: string) {
  return includesNormalizedTerm(haystack, "non hydrogenated");
}

function overlapsBannedRestricted(item: SeedOilsProcessedOilsItem) {
  return findAliasMatches(bannedRestrictedItems, undefined, itemText(item)).length > 0;
}

function hasAutomaticRedRule(item: SeedOilsProcessedOilsItem) {
  const ruleFields = item as unknown as {
    severity: string;
    scoringImpact: string;
  };

  return (
    ruleFields.severity === "red" ||
    ruleFields.scoringImpact === "automatic_red" ||
    overlapsBannedRestricted(item)
  );
}

function removeSingleIngredientDoubleCounts(
  matches: Map<string, SeedOilsProcessedOilsItem>,
) {
  const cleanedMatches = new Map(matches);
  const hasBaseOil = [...cleanedMatches.keys()].some((id) => baseOilIds.has(id));
  const hasHydrogenated =
    cleanedMatches.has(hydrogenatedOilId) ||
    cleanedMatches.has(partiallyHydrogenatedOilId);

  if (cleanedMatches.has(partiallyHydrogenatedOilId)) {
    cleanedMatches.delete(hydrogenatedOilId);
  }

  if (hasBaseOil || cleanedMatches.has(refinedOilId) || hasHydrogenated) {
    cleanedMatches.delete(genericOilId);
  }

  if (hasHydrogenated) {
    baseOilIds.forEach((id) => cleanedMatches.delete(id));
    cleanedMatches.delete(refinedOilId);
  }

  return cleanedMatches;
}

export function findSeedOilProcessedOilMatches(labelText: string) {
  const haystack = normalizeAliasText(labelText);
  const matches = new Map<string, SeedOilsProcessedOilsItem>();

  if (!haystack) {
    return [];
  }

  seedOilsProcessedOilsDataPack.items.forEach((item) => {
    if (item.id === hydrogenatedOilId && hasNonHydrogenatedWording(haystack)) {
      return;
    }

    const matched = buildMatchTerms(item).some((value) => {
      if (!value) {
        return false;
      }

      return includesNormalizedTerm(haystack, value);
    });

    if (matched) {
      matches.set(item.id, item);
    }
  });

  return [...removeSingleIngredientDoubleCounts(matches).values()];
}

export function summarizeSeedOilProcessedOilMatches(
  matches: SeedOilsProcessedOilsItem[],
): SeedOilsProcessedOilsCategorySummary {
  const uniqueMatches = new Map<string, SeedOilsProcessedOilsItem>();

  matches.forEach((item) => {
    uniqueMatches.set(item.id, item);
  });

  const dedupedMatches = [...uniqueMatches.values()];
  const redItems = dedupedMatches.filter(hasAutomaticRedRule);
  const yellowItems = dedupedMatches.filter(
    (item) => item.severity === "yellow" && !redItems.includes(item),
  );
  const totalCount = redItems.length + yellowItems.length;
  const hasHydrogenatedOil = dedupedMatches.some(
    (item) =>
      item.id === hydrogenatedOilId ||
      item.id === partiallyHydrogenatedOilId ||
      item.healthConcernType.includes("hydrogenated"),
  );
  const hasAutomaticRed = redItems.length > 0;

  return {
    totalCount,
    redItemCount: redItems.length,
    yellowItemCount: yellowItems.length,
    categorySeverity:
      totalCount === 0 ? "green" : hasAutomaticRed || totalCount >= 3 ? "red" : "yellow",
    hasHydrogenatedOil,
    hasAutomaticRed,
    redItems,
    yellowItems,
  };
}
