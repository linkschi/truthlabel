import {
  hydrogenatedPartiallyHydrogenatedOilsDataPack,
  type HydrogenatedPartiallyHydrogenatedOilsItem,
} from "@/data/ingredientIntelligence/hydrogenatedPartiallyHydrogenatedOils";
import { normalizeAliasText } from "@/lib/ingredientIntelligence/aliasMatching";

export type HydrogenatedPartiallyHydrogenatedOilsCategorySummary = {
  totalCount: number;
  redItemCount: number;
  categorySeverity: "green" | "red";
  hasHydrogenatedOil: boolean;
  hasFullyHydrogenatedOil: boolean;
  hasPartiallyHydrogenatedOil: boolean;
  hasTransFatMarker: boolean;
  hasAutomaticRed: boolean;
  redItems: HydrogenatedPartiallyHydrogenatedOilsItem[];
};

const partiallyHydrogenatedGeneralId = "partially_hydrogenated_oil_general";
const hydrogenatedGeneralId = "hydrogenated_oil_general";
const fullyHydrogenatedId = "fully_hydrogenated_oil";
const transFatMarkerId = "trans_fat_marker";
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

function includesNormalizedTerm(haystack: string, term: string) {
  return ` ${haystack} `.includes(` ${term} `);
}

function hasNegativeTransFatClaim(haystack: string) {
  return [
    "0g trans fat",
    "0 g trans fat",
    "0 trans fat",
    "zero trans fat",
    "no trans fat",
    "trans fat free",
    "free of trans fat",
    "without trans fat",
  ].some((term) => includesNormalizedTerm(haystack, normalizeAliasText(term)));
}

function hasNonHydrogenatedWording(haystack: string) {
  return includesNormalizedTerm(haystack, "non hydrogenated");
}

function hasPartiallyHydrogenatedWording(haystack: string) {
  return includesNormalizedTerm(haystack, "partially hydrogenated");
}

function hasFullyHydrogenatedWording(haystack: string) {
  return includesNormalizedTerm(haystack, "fully hydrogenated");
}

function hasGenericHydrogenatedOilPattern(haystack: string) {
  if (
    hasNonHydrogenatedWording(haystack) ||
    hasPartiallyHydrogenatedWording(haystack) ||
    hasFullyHydrogenatedWording(haystack)
  ) {
    return false;
  }

  return (
    includesNormalizedTerm(haystack, "hydrogenated") &&
    ["oil", "oils", "fat", "fats"].some((term) =>
      includesNormalizedTerm(haystack, term),
    )
  );
}

function isTransFatPresenceMarker(haystack: string) {
  if (hasNegativeTransFatClaim(haystack)) {
    return false;
  }

  return [
    "contains trans fat",
    "contains trans fats",
    "trans fatty acids",
    "artificial trans fat",
    "artificial trans fats",
    "industrial trans fat",
    "industrial trans fats",
    "industrially produced trans fat",
    "industrially produced trans fats",
    "trans fat",
    "trans fats",
  ].some((term) => includesNormalizedTerm(haystack, normalizeAliasText(term)));
}

function shouldIncludeAlias(
  item: HydrogenatedPartiallyHydrogenatedOilsItem,
  fieldName: (typeof aliasFields)[number],
  value: string,
) {
  const normalizedValue = normalizeAliasText(value);

  if (!normalizedValue) {
    return false;
  }

  if (item.id === transFatMarkerId) {
    return false;
  }

  if (fieldName !== "abbreviations") {
    return true;
  }

  if (item.id === partiallyHydrogenatedGeneralId) {
    return normalizedValue === "pho" || normalizedValue === "phos";
  }

  return normalizedValue === "hvo" || normalizedValue === "fhvo" || normalizedValue.startsWith("ph ");
}

function buildMatchTerms(item: HydrogenatedPartiallyHydrogenatedOilsItem) {
  const values = new Set<string>([item.mainName]);

  aliasFields.forEach((fieldName) => {
    item[fieldName].forEach((value) => {
      if (shouldIncludeAlias(item, fieldName, value)) {
        values.add(value);
      }
    });
  });

  return [...values].map(normalizeAliasText).filter(Boolean);
}

function removeDoubleCounts(
  matches: Map<string, HydrogenatedPartiallyHydrogenatedOilsItem>,
) {
  const cleanedMatches = new Map(matches);
  const hasPartiallyHydrogenated = [...cleanedMatches.values()].some((item) =>
    item.healthConcernType.includes("partially_hydrogenated"),
  );
  const hasSpecificPartiallyHydrogenated = [...cleanedMatches.values()].some(
    (item) =>
      item.id !== partiallyHydrogenatedGeneralId &&
      item.healthConcernType.includes("partially_hydrogenated"),
  );
  const hasFullyHydrogenated = cleanedMatches.has(fullyHydrogenatedId);
  const hasSpecificHydrogenated =
    cleanedMatches.has("hydrogenated_shortening") ||
    cleanedMatches.has("hydrogenated_margarine_spread");

  if (hasSpecificPartiallyHydrogenated) {
    cleanedMatches.delete(partiallyHydrogenatedGeneralId);
  }

  if (hasPartiallyHydrogenated || hasFullyHydrogenated || hasSpecificHydrogenated) {
    cleanedMatches.delete(hydrogenatedGeneralId);
  }

  if (hasPartiallyHydrogenated) {
    cleanedMatches.delete(transFatMarkerId);
  }

  return cleanedMatches;
}

export function findHydrogenatedPartiallyHydrogenatedOilMatches(labelText: string) {
  const haystack = normalizeAliasText(labelText);
  const matches = new Map<string, HydrogenatedPartiallyHydrogenatedOilsItem>();

  if (!haystack) {
    return [];
  }

  hydrogenatedPartiallyHydrogenatedOilsDataPack.items.forEach((item) => {
    if (item.id === transFatMarkerId) {
      if (isTransFatPresenceMarker(haystack)) {
        matches.set(item.id, item);
      }

      return;
    }

    if (item.id === hydrogenatedGeneralId && hasNonHydrogenatedWording(haystack)) {
      return;
    }

    if (item.id === hydrogenatedGeneralId && hasGenericHydrogenatedOilPattern(haystack)) {
      matches.set(item.id, item);

      return;
    }

    const matched = buildMatchTerms(item).some((term) =>
      includesNormalizedTerm(haystack, term),
    );

    if (matched) {
      matches.set(item.id, item);
    }
  });

  return [...removeDoubleCounts(matches).values()];
}

export function summarizeHydrogenatedPartiallyHydrogenatedOilMatches(
  matches: HydrogenatedPartiallyHydrogenatedOilsItem[],
): HydrogenatedPartiallyHydrogenatedOilsCategorySummary {
  const uniqueMatches = new Map<string, HydrogenatedPartiallyHydrogenatedOilsItem>();

  matches.forEach((item) => {
    uniqueMatches.set(item.id, item);
  });

  const redItems = [...uniqueMatches.values()];
  const hasPartiallyHydrogenatedOil = redItems.some((item) =>
    item.healthConcernType.includes("partially_hydrogenated"),
  );
  const hasFullyHydrogenatedOil = redItems.some((item) =>
    item.healthConcernType.includes("fully_hydrogenated"),
  );
  const hasTransFatMarker = redItems.some((item) => item.id === transFatMarkerId);
  const hasHydrogenatedOil = redItems.some(
    (item) =>
      item.healthConcernType.includes("hydrogenated") ||
      item.healthConcernType.includes("trans_fat"),
  );
  const hasAutomaticRed =
    hasPartiallyHydrogenatedOil ||
    hasTransFatMarker ||
    redItems.some((item) => item.scoringImpact === "automatic_red");

  return {
    totalCount: redItems.length,
    redItemCount: redItems.length,
    categorySeverity: redItems.length > 0 ? "red" : "green",
    hasHydrogenatedOil,
    hasFullyHydrogenatedOil,
    hasPartiallyHydrogenatedOil,
    hasTransFatMarker,
    hasAutomaticRed,
    redItems,
  };
}
