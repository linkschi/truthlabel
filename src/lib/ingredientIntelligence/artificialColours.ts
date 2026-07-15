import {
  artificialColoursStarter,
  type ArtificialColourStarterItem,
} from "@/data/ingredientIntelligence/artificialColoursStarter";
import {
  artificialColoursSeverityOverlay,
  type ArtificialColourSeverityOverlayItem,
} from "@/data/ingredientIntelligence/artificialColoursSeverityOverlay";
import { mergeIngredientLayers } from "@/lib/ingredientIntelligence/mergeIngredientLayers";

export type MergedArtificialColour = Omit<
  ArtificialColourStarterItem,
  "severity" | "scoreImpact" | "warningLabel" | "userFacingReason"
> &
  ArtificialColourSeverityOverlayItem;

export type ArtificialColourCategorySummary = {
  totalCount: number;
  redItemCount: number;
  yellowItemCount: number;
  categorySeverity: "green" | "yellow" | "red";
  hasAutomaticRed: boolean;
  redItems: MergedArtificialColour[];
  yellowItems: MergedArtificialColour[];
};

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function buildMatchTerms(item: MergedArtificialColour) {
  const terms = new Set<string>();

  [
    item.canonicalName,
    ...item.aliases,
    ...item.eNumbers,
    ...item.eNumbers.map((value) => value.replace(/\s+/g, "")),
  ]
    .map(normalizeForMatch)
    .filter(Boolean)
    .forEach((value) => terms.add(value));

  item.insNumbers.forEach((value) => {
    [`INS ${value}`, `INS No ${value}`, `INS No. ${value}`, `INS-${value}`]
      .map(normalizeForMatch)
      .filter(Boolean)
      .forEach((term) => terms.add(term));
  });

  return [...terms];
}

export const mergedArtificialColours = mergeIngredientLayers(
  artificialColoursStarter,
  artificialColoursSeverityOverlay,
  {
    datasetName: "artificial colours",
    requireOverlayForEveryStarter: true,
  },
) as MergedArtificialColour[];

const artificialColourMatchTerms = mergedArtificialColours.map((item) => ({
  item,
  terms: buildMatchTerms(item),
}));

export const mergedArtificialColoursById = Object.fromEntries(
  mergedArtificialColours.map((item) => [item.id, item]),
) satisfies Record<string, MergedArtificialColour>;

export function findArtificialColourMatches(labelText: string) {
  const haystack = normalizeForMatch(labelText);
  const matches = new Map<string, MergedArtificialColour>();

  if (!haystack) {
    return [] as MergedArtificialColour[];
  }

  artificialColourMatchTerms.forEach(({ item, terms }) => {
    const matched = terms.some((term) => haystack.includes(term));
    if (!matched) {
      return;
    }

    matches.set(item.duplicateGroupId, item);
  });

  return [...matches.values()];
}

export function summarizeArtificialColourMatches(
  matches: MergedArtificialColour[],
): ArtificialColourCategorySummary {
  const uniqueMatches = new Map<string, MergedArtificialColour>();

  matches.forEach((item) => {
    uniqueMatches.set(item.duplicateGroupId, item);
  });

  const dedupedMatches = [...uniqueMatches.values()];
  const redItems = dedupedMatches.filter((item) => item.severity === "red");
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
