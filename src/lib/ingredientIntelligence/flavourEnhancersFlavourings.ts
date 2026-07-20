import {
  flavourEnhancersFlavouringsDataPack,
  type FlavourEnhancersFlavouringsItem,
} from "@/data/ingredientIntelligence/flavourEnhancersFlavourings";
import { bannedRestrictedItems } from "@/data/ingredientIntelligence/bannedRestrictedItems";
import {
  findAliasMatches,
  normalizeAliasText,
} from "@/lib/ingredientIntelligence/aliasMatching";

export type FlavourEnhancersFlavouringsCategorySummary = {
  totalCount: number;
  redItemCount: number;
  yellowItemCount: number;
  categorySeverity: "green" | "yellow" | "red";
  hasAutomaticRed: boolean;
  redItems: FlavourEnhancersFlavouringsItem[];
  yellowItems: FlavourEnhancersFlavouringsItem[];
};

const genericFlavouringTermsId = "generic_flavouring_terms";
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

function itemText(item: FlavourEnhancersFlavouringsItem) {
  const identityFields = item as FlavourEnhancersFlavouringsItem & {
    canonicalIngredientId?: string;
    linkedIngredientId?: string;
  };

  return [
    identityFields.canonicalIngredientId,
    identityFields.linkedIngredientId,
    item.id,
    item.mainName,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildMatchTerms(item: FlavourEnhancersFlavouringsItem) {
  const values = new Set<string>([item.mainName]);

  aliasFields.forEach((fieldName) => {
    item[fieldName].forEach((value) => values.add(value));
  });

  const terms = new Map<string, { value: string; allowCollapsed: boolean }>();

  [...values]
    .map(normalizeAliasText)
    .filter(Boolean)
    .forEach((value) => {
      terms.set(value, { value, allowCollapsed: false });

      if (value.includes(" ")) {
        terms.set(value.replace(/\s+/g, ""), {
          value: value.replace(/\s+/g, ""),
          allowCollapsed: true,
        });
      }
    });

  return [...terms.values()];
}

function includesNormalizedTerm(haystack: string, term: string) {
  return ` ${haystack} `.includes(` ${term} `);
}

function overlapsBannedRestricted(item: FlavourEnhancersFlavouringsItem) {
  return findAliasMatches(bannedRestrictedItems, undefined, itemText(item)).length > 0;
}

function hasAutomaticRedRule(item: FlavourEnhancersFlavouringsItem) {
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

function removeGenericDuplicate(
  matches: Map<string, FlavourEnhancersFlavouringsItem>,
) {
  if (matches.size <= 1 || !matches.has(genericFlavouringTermsId)) {
    return matches;
  }

  const cleanedMatches = new Map(matches);
  cleanedMatches.delete(genericFlavouringTermsId);

  return cleanedMatches;
}

export function findFlavourSystemMatches(labelText: string) {
  const haystack = normalizeAliasText(labelText);
  const collapsedHaystack = haystack.replace(/\s+/g, "");
  const matches = new Map<string, FlavourEnhancersFlavouringsItem>();

  if (!haystack) {
    return [];
  }

  flavourEnhancersFlavouringsDataPack.items.forEach((item) => {
    const matched = buildMatchTerms(item).some(({ value, allowCollapsed }) => {
      if (!value) {
        return false;
      }

      return (
        includesNormalizedTerm(haystack, value) ||
        (allowCollapsed && collapsedHaystack.includes(value))
      );
    });

    if (matched) {
      matches.set(item.id, item);
    }
  });

  return [...removeGenericDuplicate(matches).values()];
}

export function summarizeFlavourSystemMatches(
  matches: FlavourEnhancersFlavouringsItem[],
): FlavourEnhancersFlavouringsCategorySummary {
  const uniqueMatches = new Map<string, FlavourEnhancersFlavouringsItem>();

  matches.forEach((item) => {
    uniqueMatches.set(item.id, item);
  });

  const dedupedMatches = [...uniqueMatches.values()];
  const redItems = dedupedMatches.filter(hasAutomaticRedRule);
  const yellowItems = dedupedMatches.filter(
    (item) => item.severity === "yellow" && !redItems.includes(item),
  );
  const totalCount = redItems.length + yellowItems.length;
  const hasAutomaticRed = redItems.length > 0;

  return {
    totalCount,
    redItemCount: redItems.length,
    yellowItemCount: yellowItems.length,
    categorySeverity:
      totalCount === 0 ? "green" : hasAutomaticRed || totalCount >= 4 ? "red" : "yellow",
    hasAutomaticRed,
    redItems,
    yellowItems,
  };
}
