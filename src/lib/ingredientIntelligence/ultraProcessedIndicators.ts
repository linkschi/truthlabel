import { bannedRestrictedItems } from "@/data/ingredientIntelligence/bannedRestrictedItems";
import {
  ultraProcessedIndicatorsDataPack,
  type UltraProcessedIndicatorsItem,
} from "@/data/ingredientIntelligence/ultraProcessedIndicators";
import { findAliasMatches, normalizeAliasText } from "@/lib/ingredientIntelligence/aliasMatching";
import {
  findArtificialColourMatches,
  summarizeArtificialColourMatches,
} from "@/lib/ingredientIntelligence/artificialColours";
import {
  findArtificialSweetenerMatches,
  summarizeArtificialSweetenerMatches,
} from "@/lib/ingredientIntelligence/artificialSweeteners";
import {
  findTextureAdditiveMatches,
  summarizeTextureAdditiveMatches,
} from "@/lib/ingredientIntelligence/emulsifiersStabilisersGums";
import {
  findFlavourSystemMatches,
  summarizeFlavourSystemMatches,
} from "@/lib/ingredientIntelligence/flavourEnhancersFlavourings";
import {
  findHydrogenatedPartiallyHydrogenatedOilMatches,
  summarizeHydrogenatedPartiallyHydrogenatedOilMatches,
} from "@/lib/ingredientIntelligence/hydrogenatedPartiallyHydrogenatedOils";
import {
  findPreservativeMatches,
  summarizePreservativeMatches,
} from "@/lib/ingredientIntelligence/preservativesShelfLifeSystems";

export type UltraProcessedAutomaticRedTrigger = {
  id: string;
  label: string;
  source: string;
};

export type UltraProcessedIndicatorsCategorySummary = {
  totalCount: number;
  displayCount: number;
  redItemCount: number;
  yellowItemCount: number;
  categorySeverity: "green" | "yellow" | "red";
  hasAutomaticRed: boolean;
  scoreContribution: number;
  redItems: UltraProcessedIndicatorsItem[];
  yellowItems: UltraProcessedIndicatorsItem[];
  automaticRedTriggers: UltraProcessedAutomaticRedTrigger[];
};

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

const flavouringSystemsId = "flavouring_systems";
const flavourEnhancersId = "flavour_enhancers";

function includesNormalizedTerm(haystack: string, term: string) {
  return ` ${haystack} `.includes(` ${term} `);
}

function buildMatchTerms(item: UltraProcessedIndicatorsItem) {
  const values = new Set<string>([item.mainName]);

  aliasFields.forEach((fieldName) => {
    item[fieldName].forEach((value) => values.add(value));
  });

  return [...values].map(normalizeAliasText).filter(Boolean);
}

function removeGenericUltraProcessedDoubleCounts(
  matches: Map<string, UltraProcessedIndicatorsItem>,
) {
  const cleanedMatches = new Map(matches);

  if (cleanedMatches.has(flavourEnhancersId)) {
    cleanedMatches.delete(flavouringSystemsId);
  }

  return cleanedMatches;
}

function addTrigger(
  triggers: Map<string, UltraProcessedAutomaticRedTrigger>,
  source: string,
  id: string,
  label: string,
) {
  triggers.set(`${source}:${id}`, { id, label, source });
}

function addTriggerItems<TItem extends { id: string }>(
  triggers: Map<string, UltraProcessedAutomaticRedTrigger>,
  source: string,
  items: readonly TItem[],
  getLabel: (item: TItem) => string,
) {
  items.forEach((item) => addTrigger(triggers, source, item.id, getLabel(item)));
}

export function findUltraProcessedIndicatorMatches(labelText: string) {
  const haystack = normalizeAliasText(labelText);
  const matches = new Map<string, UltraProcessedIndicatorsItem>();

  if (!haystack) {
    return [];
  }

  ultraProcessedIndicatorsDataPack.items.forEach((item) => {
    const matched = buildMatchTerms(item).some((term) =>
      includesNormalizedTerm(haystack, term),
    );

    if (matched) {
      matches.set(item.id, item);
    }
  });

  return [...removeGenericUltraProcessedDoubleCounts(matches).values()];
}

export function findUltraProcessedAutomaticRedTriggers(labelText: string) {
  const triggers = new Map<string, UltraProcessedAutomaticRedTrigger>();
  const bannedRestrictedMatches = findAliasMatches(
    bannedRestrictedItems,
    undefined,
    labelText,
  );
  const artificialColourSummary = summarizeArtificialColourMatches(
    findArtificialColourMatches(labelText),
  );
  const artificialSweetenerSummary = summarizeArtificialSweetenerMatches(
    findArtificialSweetenerMatches(labelText),
  );
  const preservativeSummary = summarizePreservativeMatches(
    findPreservativeMatches(labelText),
  );
  const textureSummary = summarizeTextureAdditiveMatches(
    findTextureAdditiveMatches(labelText),
  );
  const flavourSummary = summarizeFlavourSystemMatches(
    findFlavourSystemMatches(labelText),
  );
  const hydrogenatedSummary = summarizeHydrogenatedPartiallyHydrogenatedOilMatches(
    findHydrogenatedPartiallyHydrogenatedOilMatches(labelText),
  );

  addTriggerItems(
    triggers,
    "banned_restricted_items",
    bannedRestrictedMatches,
    (item) => item.mainName,
  );

  if (artificialColourSummary.hasAutomaticRed) {
    addTriggerItems(
      triggers,
      "artificial_colours",
      artificialColourSummary.redItems,
      (item) => item.canonicalName,
    );
  }

  if (artificialSweetenerSummary.hasAutomaticRed) {
    addTriggerItems(
      triggers,
      "artificial_sweeteners",
      artificialSweetenerSummary.redItems,
      (item) => item.mainName,
    );
  }

  if (preservativeSummary.hasAutomaticRed) {
    addTriggerItems(
      triggers,
      "preservatives",
      preservativeSummary.redItems,
      (item) => item.mainName,
    );
  }

  if (textureSummary.hasAutomaticRed) {
    addTriggerItems(
      triggers,
      "texture_additives",
      textureSummary.redItems,
      (item) => item.mainName,
    );
  }

  if (flavourSummary.hasAutomaticRed) {
    addTriggerItems(
      triggers,
      "flavour_systems",
      flavourSummary.redItems,
      (item) => item.mainName,
    );
  }

  if (hydrogenatedSummary.categorySeverity === "red") {
    addTriggerItems(
      triggers,
      "hydrogenated_oils",
      hydrogenatedSummary.redItems,
      (item) => item.mainName,
    );
  }

  return [...triggers.values()];
}

function dedupeAutomaticRedTriggers(
  triggers: UltraProcessedAutomaticRedTrigger[],
) {
  return [
    ...new Map(
      triggers.map((trigger) => [`${trigger.source}:${trigger.id}`, trigger]),
    ).values(),
  ];
}

function isRedUltraProcessedMarker(item: UltraProcessedIndicatorsItem) {
  const normalizedImpact = normalizeAliasText(item.scoringImpact);
  const severity = item.severity as "green" | "yellow" | "red";

  return (
    severity === "red" ||
    normalizedImpact.includes("automatic red") ||
    normalizedImpact.includes("red marker")
  );
}

export function summarizeUltraProcessedIndicatorMatches(
  matches: UltraProcessedIndicatorsItem[],
  automaticRedTriggers: UltraProcessedAutomaticRedTrigger[] = [],
): UltraProcessedIndicatorsCategorySummary {
  const uniqueMatches = new Map<string, UltraProcessedIndicatorsItem>();

  matches.forEach((item) => {
    uniqueMatches.set(item.id, item);
  });

  const dedupedMatches = [...uniqueMatches.values()];
  const dedupedAutomaticTriggers = dedupeAutomaticRedTriggers(automaticRedTriggers);
  const hasAutomaticRed =
    dedupedAutomaticTriggers.length > 0 || dedupedMatches.some(isRedUltraProcessedMarker);
  const totalCount = dedupedMatches.length;
  const categorySeverity =
    hasAutomaticRed || totalCount >= 6
      ? "red"
      : totalCount > 0
        ? "yellow"
        : "green";
  const redItems = categorySeverity === "red" ? dedupedMatches : [];
  const yellowItems = categorySeverity === "yellow" ? dedupedMatches : [];

  return {
    totalCount,
    displayCount: Math.max(totalCount, dedupedAutomaticTriggers.length),
    redItemCount: redItems.length,
    yellowItemCount: yellowItems.length,
    categorySeverity,
    hasAutomaticRed,
    scoreContribution:
      categorySeverity === "red" ? 25 : categorySeverity === "yellow" ? 10 : 0,
    redItems,
    yellowItems,
    automaticRedTriggers: dedupedAutomaticTriggers,
  };
}
