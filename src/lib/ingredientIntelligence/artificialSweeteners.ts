import {
  artificialSweetenersDataPack,
  type ArtificialSweetenersItem,
} from "@/data/ingredientIntelligence/artificialSweetenersSugarSubstitutes";
import { findAliasMatches } from "@/lib/ingredientIntelligence/aliasMatching";

export type ArtificialSweetenerCategorySummary = {
  totalCount: number;
  redItemCount: number;
  yellowItemCount: number;
  categorySeverity: "green" | "yellow" | "red";
  hasAutomaticRed: boolean;
  redItems: ArtificialSweetenersItem[];
  yellowItems: ArtificialSweetenersItem[];
};

export function findArtificialSweetenerMatches(labelText: string) {
  const matches = new Map(
    findAliasMatches(
      artificialSweetenersDataPack.items,
      artificialSweetenersDataPack.aliasCoverage,
      labelText,
    ).map((item) => [item.id, item]),
  );

  if (
    matches.has("crude_stevia_whole_leaf") &&
    matches.has("steviol_glycosides")
  ) {
    matches.delete("steviol_glycosides");
  }

  return [...matches.values()];
}

export function summarizeArtificialSweetenerMatches(
  matches: ArtificialSweetenersItem[],
): ArtificialSweetenerCategorySummary {
  const uniqueMatches = new Map<string, ArtificialSweetenersItem>();

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
      totalCount === 0 ? "green" : hasAutomaticRed || totalCount >= 3 ? "red" : "yellow",
    hasAutomaticRed,
    redItems,
    yellowItems,
  };
}
