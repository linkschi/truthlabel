import {
  emulsifiersStabilisersGumsDataPack,
  type EmulsifiersStabilisersGumsItem,
} from "@/data/ingredientIntelligence/emulsifiersStabilisersGums";
import { bannedRestrictedItems } from "@/data/ingredientIntelligence/bannedRestrictedItems";
import { findAliasMatches } from "@/lib/ingredientIntelligence/aliasMatching";

export type EmulsifiersStabilisersGumsCategorySummary = {
  totalCount: number;
  redItemCount: number;
  yellowItemCount: number;
  categorySeverity: "green" | "yellow" | "red";
  hasAutomaticRed: boolean;
  redItems: EmulsifiersStabilisersGumsItem[];
  yellowItems: EmulsifiersStabilisersGumsItem[];
};

function itemText(item: EmulsifiersStabilisersGumsItem) {
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

function overlapsBannedRestricted(item: EmulsifiersStabilisersGumsItem) {
  return findAliasMatches(bannedRestrictedItems, undefined, itemText(item)).length > 0;
}

function hasAutomaticRedRule(item: EmulsifiersStabilisersGumsItem) {
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

export function findTextureAdditiveMatches(labelText: string) {
  return findAliasMatches(
    emulsifiersStabilisersGumsDataPack.items,
    undefined,
    labelText,
  );
}

export function summarizeTextureAdditiveMatches(
  matches: EmulsifiersStabilisersGumsItem[],
): EmulsifiersStabilisersGumsCategorySummary {
  const uniqueMatches = new Map<string, EmulsifiersStabilisersGumsItem>();

  matches.forEach((item) => {
    uniqueMatches.set(item.id, item);
  });

  const dedupedMatches = [...uniqueMatches.values()];
  const redItems = dedupedMatches.filter(hasAutomaticRedRule);
  const yellowItems = dedupedMatches.filter((item) => !redItems.includes(item));
  const totalCount = dedupedMatches.length;
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
