import {
  preservativesShelfLifeSystemsDataPack,
  type PreservativesShelfLifeSystemsItem,
} from "@/data/ingredientIntelligence/preservativesShelfLifeSystems";
import { findAliasMatches } from "@/lib/ingredientIntelligence/aliasMatching";

export type PreservativesShelfLifeSystemsCategorySummary = {
  totalCount: number;
  redItemCount: number;
  yellowItemCount: number;
  categorySeverity: "green" | "yellow" | "red";
  hasAutomaticRed: boolean;
  redItems: PreservativesShelfLifeSystemsItem[];
  yellowItems: PreservativesShelfLifeSystemsItem[];
};

export function findPreservativeMatches(labelText: string) {
  return findAliasMatches(
    preservativesShelfLifeSystemsDataPack.items,
    preservativesShelfLifeSystemsDataPack.aliasCoverage,
    labelText,
  );
}

export function summarizePreservativeMatches(
  matches: PreservativesShelfLifeSystemsItem[],
): PreservativesShelfLifeSystemsCategorySummary {
  const uniqueMatches = new Map<string, PreservativesShelfLifeSystemsItem>();

  matches.forEach((item) => {
    uniqueMatches.set(item.id, item);
  });

  const dedupedMatches = [...uniqueMatches.values()];
  const redItems = dedupedMatches.filter(
    (item) => item.scoringImpact === "automatic_red" || item.severity === "red",
  );
  const yellowItems = dedupedMatches.filter((item) => item.severity === "yellow");
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
