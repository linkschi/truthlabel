import {
  artificialEngineeredFoodConstructionCategoryColorMap,
  artificialEngineeredFoodConstructionGroups,
  artificialEngineeredFoodConstructionGroupsById,
  getArtificialEngineeredFoodConstructionGroupBehavior,
  type ArtificialEngineeredFoodConstructionGroup,
} from "@/data/ingredientIntelligence/artificialEngineeredFoodConstruction";
import { bannedRestrictedItems } from "@/data/ingredientIntelligence/bannedRestrictedItems";
import type { ProductCategory } from "@/types/exposure";

type MatchableSeverity = "green" | "yellow" | "red";
type EvidenceSourceKind = "ingredient" | "product_name" | "label";

type NormalizedTerm = {
  normalized: string;
  collapsed: string;
};

type EvidenceSource = {
  original: string;
  normalized: string;
  collapsed: string;
  kind: EvidenceSourceKind;
};

type EvidenceMatch = {
  label: string;
  kinds: Set<EvidenceSourceKind>;
  matchedGroupIds: Set<string>;
  hasCountedMatch: boolean;
  hasNeutralOnlyMatch: boolean;
  overlapsBannedRestricted: boolean;
};

export type ArtificialEngineeredFoodConstructionInput = {
  ingredientNames: string[];
  productName?: string;
  labelTexts?: string[];
  productCategory?: ProductCategory;
};

export type ArtificialEngineeredFoodConstructionGroupMatch = {
  group: ArtificialEngineeredFoodConstructionGroup;
  matchedIngredients: string[];
  matchedCount: number;
};

export type ArtificialEngineeredFoodConstructionSummary = {
  totalMarkerCount: number;
  neutralMarkerCount: number;
  consumerPreferenceMarkerCount: number;
  processingMarkerCount: number;
  inheritedMarkerCount: number;
  transparencyMarkerCount: number;
  overloadEligibleMarkerCount: number;
  displayCount: number;
  categorySeverity: MatchableSeverity;
  hasMeaningfulValue: boolean;
  matchedIngredients: string[];
  neutralMatchedIngredients: string[];
  matchedGroups: ArtificialEngineeredFoodConstructionGroupMatch[];
  triggeredGroupNames: string[];
  hasBioengineeredDisclosure: boolean;
  hasCultivatedProtein: boolean;
  hasImitationFood: boolean;
  hasReformedOrReconstructed: boolean;
  hasMechanicallySeparated: boolean;
  fillerExtenderCount: number;
  binderTextureBuilderCount: number;
  extenderBinderCombinedCount: number;
  hasTextureOrAppearanceSystem: boolean;
  hasFlavorOrColourSystem: boolean;
  hasBannedRestrictedOverlap: boolean;
  bannedRestrictedOverlapNames: string[];
  hasTransparencyRisk: boolean;
  hasHeavyConstructionLoad: boolean;
  hasMeatOrSeafoodExtenderTrigger: boolean;
  hasReformedWithBinderTrigger: boolean;
  hasImitationTextureTrigger: boolean;
  hasSimpleFoodMismatch: boolean;
  scoreContribution: number;
  warningText: string;
  redReasons: string[];
};

const labelTransparencyRiskGroup =
  artificialEngineeredFoodConstructionGroupsById.label_transparency_risk_markers;
const directlyMatchableGroups = artificialEngineeredFoodConstructionGroups.filter(
  (group) => group.id !== labelTransparencyRiskGroup.id,
);

const fillerExtenderGroupId = "fillers_and_extenders";
const binderTextureBuilderGroupId = "binders_and_texture_builders";
const reformedGroupId = "reformed_reconstructed_meat_or_seafood_markers";
const mechanicallySeparatedGroupId =
  "mechanically_separated_recovered_meat_markers";
const imitationGroupId = "imitation_analogue_food_markers";
const cultivatedGroupId = "cultivated_cell_cultured_protein_markers";
const bioengineeredGroupId = "bioengineered_gmo_disclosure_markers";
const animalFreeDairyGroupId =
  "animal_free_dairy_precision_fermented_milk_proteins";
const animalFreeEggGroupId =
  "animal_free_egg_fermentation_derived_egg_proteins";
const engineeredHemeGroupId =
  "engineered_heme_leghemoglobin_meat_like_flavour_systems";
const molecularFarmingGroupId = "molecular_farming_plant_made_animal_proteins";
const specificBioengineeredFoodsGroupId =
  "specific_bioengineered_food_disclosure_targets";
const cultivatedAnimalLikeIngredientGroupId =
  "cultivated_fat_seafood_and_animal_cell_derived_ingredients";
const microbialBiomassProteinGroupId =
  "microbial_biomass_fermentation_protein";
const structuredFoodTechnologyGroupId =
  "extruded_printed_structured_food_technology_markers";
const artificialFlavourGroupId = "artificial_flavours_and_flavour_systems";
const artificialColourGroupId = "artificial_colours_and_appearance_systems";
const emulsifierGroupId = "emulsifiers_and_stabilisers";
const powderGroupId = "ultra_processed_powder_concentrate_markers";
const concentrateGroupId = "made_from_concentrate_reconstructed_food_markers";
const fortificationGroupId = "synthetic_vitamins_and_fortification_systems";
const novelConstructionTechnologyGroupIds = [
  animalFreeDairyGroupId,
  animalFreeEggGroupId,
  engineeredHemeGroupId,
  molecularFarmingGroupId,
  specificBioengineeredFoodsGroupId,
  cultivatedAnimalLikeIngredientGroupId,
  microbialBiomassProteinGroupId,
  structuredFoodTechnologyGroupId,
] as const;

const meatKeywords = [
  "meat",
  "beef",
  "pork",
  "ham",
  "bacon",
  "sausage",
  "salami",
  "pepperoni",
  "chicken",
  "turkey",
  "burger",
  "nugget",
  "kebab",
];

const seafoodKeywords = [
  "fish",
  "seafood",
  "salmon",
  "tuna",
  "crab",
  "shrimp",
  "prawn",
  "lobster",
  "scallop",
  "surimi",
  "cod",
  "tilapia",
];

const simpleFoodKeywords = [
  "milk",
  "juice",
  "yogurt",
  "yoghurt",
  "cheese",
  "butter",
  "egg",
  "eggs",
  "chicken breast",
  "fish fillet",
  "beef strips",
];

const drinkKeywords = [
  "juice",
  "drink",
  "beverage",
  "smoothie",
  "soda",
  "cola",
  "water",
  "tea",
];

const normalizedGenericBannedTerms = new Set(
  [
    "artificial color",
    "artificial colour",
    "synthetic color",
    "synthetic colour",
    "color added",
    "colour added",
  ].map(normalizeConstructionText),
);

function normalizeConstructionText(value: string) {
  return value
    .toLowerCase()
    .replace(/β/g, "beta")
    .replace(/α/g, "alpha")
    .replace(/colour/g, "color")
    .replace(/flavour/g, "flavor")
    .replace(/flavoured/g, "flavored")
    .replace(/fibre/g, "fiber")
    .replace(/sulphite/g, "sulfite")
    .replace(/sulphate/g, "sulfate")
    .replace(/hydrolysed/g, "hydrolyzed")
    .replace(/pregelatinised/g, "pregelatinized")
    .replace(/analogue/g, "analog")
    .replace(/stabiliser/g, "stabilizer")
    .replace(/’/g, "'")
    .replace(/[()[\]{}]/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toNormalizedTerm(value: string): NormalizedTerm {
  const normalized = normalizeConstructionText(value);

  return {
    normalized,
    collapsed: normalized.replace(/\s+/g, ""),
  };
}

function hasAnyKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(normalizeConstructionText(keyword)));
}

function sourceMatchesTerm(source: EvidenceSource, term: NormalizedTerm) {
  if (!term.normalized) {
    return false;
  }

  if (source.normalized.includes(term.normalized)) {
    return true;
  }

  return term.collapsed.length >= 4 && source.collapsed.includes(term.collapsed);
}

function formatList(values: string[]) {
  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function shouldKeepBannedTerm(value: string) {
  if (!value) {
    return false;
  }

  if (normalizedGenericBannedTerms.has(value)) {
    return false;
  }

  return !value.startsWith("colored with ") && !value.startsWith("coloured with ");
}

const bannedRestrictedTerms = Array.from(
  new Set(
    bannedRestrictedItems
      .flatMap((item) => [item.mainName, ...item.otherNames])
      .map(toNormalizedTerm)
      .filter((term) => shouldKeepBannedTerm(term.normalized))
      .map((term) => `${term.normalized}||${term.collapsed}`),
  ),
).map((entry) => {
  const [normalized, collapsed] = entry.split("||");

  return { normalized, collapsed };
});

const directGroupIndex = directlyMatchableGroups.map((group) => ({
  group,
  markerTerms: group.markers.map(toNormalizedTerm).filter((term) => term.normalized),
}));

function buildEvidenceSources({
  ingredientNames,
  productName,
  labelTexts,
}: ArtificialEngineeredFoodConstructionInput) {
  const seen = new Set<string>();
  const sources: EvidenceSource[] = [];

  const append = (value: string | undefined, kind: EvidenceSourceKind) => {
    const trimmed = value?.trim();
    if (!trimmed) {
      return;
    }

    const term = toNormalizedTerm(trimmed);
    if (!term.normalized) {
      return;
    }

    const key = `${kind}:${term.normalized}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    sources.push({
      original: trimmed,
      normalized: term.normalized,
      collapsed: term.collapsed,
      kind,
    });
  };

  ingredientNames.forEach((ingredient) => append(ingredient, "ingredient"));
  append(productName, "product_name");
  labelTexts?.forEach((labelText) => append(labelText, "label"));

  return sources;
}

function getEvidenceCount(
  matches: Map<string, EvidenceMatch>,
  groupIds: string[],
) {
  return [...matches.values()].filter((match) =>
    groupIds.some((groupId) => match.matchedGroupIds.has(groupId)),
  ).length;
}

function evidenceHasGroupBehavior(
  match: EvidenceMatch,
  predicate: (
    behavior: ReturnType<
      typeof getArtificialEngineeredFoodConstructionGroupBehavior
    >,
  ) => boolean,
) {
  return [...match.matchedGroupIds].some((groupId) =>
    predicate(getArtificialEngineeredFoodConstructionGroupBehavior(groupId)),
  );
}

function getEvidenceCountByGroupBehavior(
  matches: EvidenceMatch[],
  predicate: (
    behavior: ReturnType<
      typeof getArtificialEngineeredFoodConstructionGroupBehavior
    >,
  ) => boolean,
) {
  return matches.filter((match) => evidenceHasGroupBehavior(match, predicate))
    .length;
}

function getGroupMatchedIngredients(
  groupMatches: ArtificialEngineeredFoodConstructionGroupMatch[],
  groupId: string,
) {
  return (
    groupMatches.find((match) => match.group.id === groupId)?.matchedIngredients ?? []
  );
}

function buildGroupMatches(evidenceMatches: Map<string, EvidenceMatch>) {
  const groupToIngredients = new Map<string, Set<string>>();

  evidenceMatches.forEach((match) => {
    match.matchedGroupIds.forEach((groupId) => {
      const bucket = groupToIngredients.get(groupId) ?? new Set<string>();
      bucket.add(match.label);
      groupToIngredients.set(groupId, bucket);
    });
  });

  return artificialEngineeredFoodConstructionGroups
    .filter((group) => group.id !== labelTransparencyRiskGroup.id)
    .filter((group) => groupToIngredients.has(group.id))
    .map((group) => ({
      group,
      matchedIngredients: [...(groupToIngredients.get(group.id) ?? [])].sort(),
      matchedCount: groupToIngredients.get(group.id)?.size ?? 0,
    }))
    .filter((match) => match.matchedCount > 0);
}

function buildWarningText({
  categorySeverity,
  groupMatches,
}: {
  categorySeverity: MatchableSeverity;
  groupMatches: ArtificialEngineeredFoodConstructionGroupMatch[];
}) {
  if (categorySeverity === "red") {
    return artificialEngineeredFoodConstructionCategoryColorMap.red.overloadMessage;
  }

  const directMatches = groupMatches.filter(
    (match) => match.group.id !== labelTransparencyRiskGroup.id,
  );

  if (directMatches.length === 1) {
    const behavior = getArtificialEngineeredFoodConstructionGroupBehavior(
      directMatches[0].group.id,
    );

    return `${behavior.title}. ${behavior.directExplanation}`;
  }

  if (
    directMatches.length > 1 &&
    directMatches.every((match) =>
      [bioengineeredGroupId, specificBioengineeredFoodsGroupId].includes(
        match.group.id as
          | typeof bioengineeredGroupId
          | typeof specificBioengineeredFoodsGroupId,
      ),
    )
  ) {
    return artificialEngineeredFoodConstructionGroupsById[
      specificBioengineeredFoodsGroupId
    ].userFacingWarning;
  }

  if (
    directMatches.length > 1 &&
    directMatches.every((match) =>
      [cultivatedGroupId, cultivatedAnimalLikeIngredientGroupId].includes(
        match.group.id as
          | typeof cultivatedGroupId
          | typeof cultivatedAnimalLikeIngredientGroupId,
      ),
    )
  ) {
    return artificialEngineeredFoodConstructionGroupsById[
      cultivatedAnimalLikeIngredientGroupId
    ].userFacingWarning;
  }

  if (groupMatches.length > 1) {
    return artificialEngineeredFoodConstructionCategoryColorMap.yellow.message;
  }

  return "No artificial or engineered food-construction markers were found.";
}

export function analyzeArtificialEngineeredFoodConstruction(
  input: ArtificialEngineeredFoodConstructionInput,
): ArtificialEngineeredFoodConstructionSummary {
  const evidenceSources = buildEvidenceSources(input);
  const evidenceMatches = new Map<string, EvidenceMatch>();
  const joinedContextText = evidenceSources.map((source) => source.normalized).join(" ");

  directGroupIndex.forEach(({ group, markerTerms }) => {
    evidenceSources.forEach((source) => {
      const matched = markerTerms.some((term) => sourceMatchesTerm(source, term));
      if (!matched) {
        return;
      }

      const current = evidenceMatches.get(source.normalized) ?? {
        label: source.original,
        kinds: new Set<EvidenceSourceKind>(),
        matchedGroupIds: new Set<string>(),
        hasCountedMatch: false,
        hasNeutralOnlyMatch: false,
        overlapsBannedRestricted: false,
      };

      current.kinds.add(source.kind);
      current.matchedGroupIds.add(group.id);

      if (group.severityDefault === "neutral") {
        current.hasNeutralOnlyMatch = true;
      } else {
        current.hasCountedMatch = true;
      }

      evidenceMatches.set(source.normalized, current);
    });
  });

  evidenceMatches.forEach((match, normalizedKey) => {
    const source = {
      normalized: normalizedKey,
      collapsed: normalizedKey.replace(/\s+/g, ""),
    };

    match.overlapsBannedRestricted = bannedRestrictedTerms.some(
      (term) =>
        source.normalized.includes(term.normalized) ||
        (term.collapsed.length >= 4 && source.collapsed.includes(term.collapsed)),
    );
  });

  const countedEvidence = [...evidenceMatches.values()].filter(
    (match) => match.hasCountedMatch,
  );
  const neutralOnlyEvidence = [...evidenceMatches.values()].filter(
    (match) => !match.hasCountedMatch && match.hasNeutralOnlyMatch,
  );

  const totalMarkerCount = countedEvidence.length;
  const neutralMarkerCount = neutralOnlyEvidence.length;
  const consumerPreferenceMarkerCount = getEvidenceCountByGroupBehavior(
    countedEvidence,
    (behavior) => behavior.flagType === "consumer_preference",
  );
  const processingMarkerCount = getEvidenceCountByGroupBehavior(
    countedEvidence,
    (behavior) => behavior.flagType === "processing",
  );
  const inheritedMarkerCount = getEvidenceCountByGroupBehavior(
    countedEvidence,
    (behavior) => behavior.flagType === "inherited",
  );
  const transparencyMarkerCount = getEvidenceCountByGroupBehavior(
    countedEvidence,
    (behavior) => behavior.flagType === "label_transparency",
  );
  const overloadEligibleMarkerCount = getEvidenceCountByGroupBehavior(
    countedEvidence,
    (behavior) => behavior.overloadEligible,
  );
  const hasBioengineeredDisclosure = countedEvidence.some((match) =>
    match.matchedGroupIds.has(bioengineeredGroupId) ||
    match.matchedGroupIds.has(specificBioengineeredFoodsGroupId),
  );
  const hasCultivatedProtein = countedEvidence.some((match) =>
    match.matchedGroupIds.has(cultivatedGroupId) ||
    match.matchedGroupIds.has(cultivatedAnimalLikeIngredientGroupId),
  );
  const hasImitationFood = countedEvidence.some((match) =>
    match.matchedGroupIds.has(imitationGroupId),
  );
  const hasNovelConstructionTechnologyMarker = countedEvidence.some((match) =>
    novelConstructionTechnologyGroupIds.some((groupId) =>
      match.matchedGroupIds.has(groupId),
    ),
  );
  const hasReformedOrReconstructed = countedEvidence.some((match) =>
    match.matchedGroupIds.has(reformedGroupId),
  );
  const hasMechanicallySeparated = countedEvidence.some((match) =>
    match.matchedGroupIds.has(mechanicallySeparatedGroupId),
  );
  const fillerExtenderCount = getEvidenceCount(evidenceMatches, [fillerExtenderGroupId]);
  const binderTextureBuilderCount = getEvidenceCount(evidenceMatches, [
    binderTextureBuilderGroupId,
  ]);
  const extenderBinderCombinedCount = getEvidenceCount(evidenceMatches, [
    fillerExtenderGroupId,
    binderTextureBuilderGroupId,
  ]);
  const hasTextureOrAppearanceSystem =
    getEvidenceCount(evidenceMatches, [
      binderTextureBuilderGroupId,
      emulsifierGroupId,
      artificialFlavourGroupId,
      artificialColourGroupId,
    ]) > 0;
  const hasFlavorOrColourSystem =
    getEvidenceCount(evidenceMatches, [
      artificialFlavourGroupId,
      artificialColourGroupId,
    ]) > 0;
  const hasPowderOrConcentrateSignals =
    getEvidenceCount(evidenceMatches, [powderGroupId, concentrateGroupId]) > 0;
  const novelTechnologyCompanionCategoryCount = [
    fillerExtenderCount > 0,
    binderTextureBuilderCount > 0,
    hasFlavorOrColourSystem,
    hasReformedOrReconstructed || hasMechanicallySeparated,
  ].filter(Boolean).length;
  const hasBannedRestrictedOverlap = [...evidenceMatches.values()].some(
    (match) => match.overlapsBannedRestricted,
  );
  const bannedRestrictedOverlapNames = countedEvidence
    .filter((match) => match.overlapsBannedRestricted)
    .map((match) => match.label)
    .sort();
  const looksLikeMeatOrFastFood =
    input.productCategory === "meat_fast_food" ||
    hasAnyKeyword(joinedContextText, meatKeywords);
  const looksLikeSeafood =
    input.productCategory === "seafood" ||
    hasAnyKeyword(joinedContextText, seafoodKeywords);
  const looksLikeSimpleFood =
    input.productCategory === "fresh_simple" ||
    hasAnyKeyword(joinedContextText, simpleFoodKeywords);
  const looksLikeDrink =
    input.productCategory === "drinks_beverages" ||
    hasAnyKeyword(joinedContextText, drinkKeywords);
  const looksLikeMeatFishOrSeafood = looksLikeMeatOrFastFood || looksLikeSeafood;
  const hasHeavyConstructionLoad =
    overloadEligibleMarkerCount >=
    artificialEngineeredFoodConstructionCategoryColorMap.red.overloadThreshold;
  const hasMeatOrSeafoodExtenderTrigger =
    looksLikeMeatFishOrSeafood && extenderBinderCombinedCount >= 2;
  const hasReformedWithBinderTrigger =
    (hasReformedOrReconstructed || hasMechanicallySeparated) &&
    extenderBinderCombinedCount >= 1;
  const hasImitationTextureTrigger =
    (hasImitationFood || hasCultivatedProtein) && hasTextureOrAppearanceSystem;
  const hasSimpleFoodMismatch = looksLikeSimpleFood && totalMarkerCount >= 4;
  const hasDrinkConstructionTrigger =
    looksLikeDrink && hasPowderOrConcentrateSignals && hasFlavorOrColourSystem;
  const hasNovelTechnologyEscalationTrigger =
    hasNovelConstructionTechnologyMarker &&
    novelTechnologyCompanionCategoryCount >= 2;
  const hasTransparencyRisk =
    hasHeavyConstructionLoad ||
    hasMeatOrSeafoodExtenderTrigger ||
    hasReformedWithBinderTrigger ||
    hasImitationTextureTrigger ||
    hasSimpleFoodMismatch ||
    hasDrinkConstructionTrigger ||
    hasNovelTechnologyEscalationTrigger;

  const redReasons: string[] = [];

  if (hasBannedRestrictedOverlap) {
    redReasons.push(
      `Matched marker also appears in Banned / Restricted Items: ${formatList(
        bannedRestrictedOverlapNames,
      )}.`,
    );
  }

  if (hasHeavyConstructionLoad) {
    redReasons.push(
      `The product shows ${overloadEligibleMarkerCount} overload-eligible processing markers, which crosses Truthlabel's ${artificialEngineeredFoodConstructionCategoryColorMap.red.overloadThreshold}-marker engineered-food overload threshold.`,
    );
  }

  let categorySeverity: MatchableSeverity = "green";

  if (redReasons.length > 0) {
    categorySeverity = "red";
  } else if (
    totalMarkerCount > 0 ||
    hasBioengineeredDisclosure ||
    hasCultivatedProtein ||
    hasImitationFood ||
    hasReformedOrReconstructed ||
    hasMechanicallySeparated ||
    neutralMarkerCount >= 2
  ) {
    categorySeverity = "yellow";
  }

  const groupMatches = buildGroupMatches(evidenceMatches);
  if (hasTransparencyRisk) {
    groupMatches.push({
      group: labelTransparencyRiskGroup,
      matchedIngredients: countedEvidence.map((match) => match.label).sort(),
      matchedCount: countedEvidence.length,
    });
  }

  const uniqueGroupMatches = artificialEngineeredFoodConstructionGroups
    .map((group) => groupMatches.find((match) => match.group.id === group.id))
    .filter(
      (
        match,
      ): match is ArtificialEngineeredFoodConstructionGroupMatch => Boolean(match),
    );

  let scoreContribution = 0;

  if (overloadEligibleMarkerCount >= 5) {
    scoreContribution += 25;
  } else if (overloadEligibleMarkerCount === 4) {
    scoreContribution += 16;
  } else if (overloadEligibleMarkerCount === 3) {
    scoreContribution += 10;
  } else if (overloadEligibleMarkerCount === 2) {
    scoreContribution += 6;
  } else if (overloadEligibleMarkerCount === 1) {
    scoreContribution += 4;
  }

  if (hasMechanicallySeparated || hasReformedOrReconstructed) {
    scoreContribution = Math.max(scoreContribution, 12);
  }

  if (
    hasBannedRestrictedOverlap ||
    hasHeavyConstructionLoad
  ) {
    scoreContribution = Math.max(scoreContribution, 25);
  }

  const displayCount =
    categorySeverity === "green"
      ? 0
      : totalMarkerCount > 0
        ? totalMarkerCount
        : neutralMarkerCount;

  return {
    totalMarkerCount,
    neutralMarkerCount,
    consumerPreferenceMarkerCount,
    processingMarkerCount,
    inheritedMarkerCount,
    transparencyMarkerCount,
    overloadEligibleMarkerCount,
    displayCount,
    categorySeverity,
    hasMeaningfulValue: categorySeverity !== "green" || neutralMarkerCount >= 2,
    matchedIngredients: countedEvidence.map((match) => match.label).sort(),
    neutralMatchedIngredients: neutralOnlyEvidence.map((match) => match.label).sort(),
    matchedGroups: uniqueGroupMatches,
    triggeredGroupNames: uniqueGroupMatches.map((match) => match.group.groupName),
    hasBioengineeredDisclosure,
    hasCultivatedProtein,
    hasImitationFood,
    hasReformedOrReconstructed,
    hasMechanicallySeparated,
    fillerExtenderCount,
    binderTextureBuilderCount,
    extenderBinderCombinedCount,
    hasTextureOrAppearanceSystem,
    hasFlavorOrColourSystem,
    hasBannedRestrictedOverlap,
    bannedRestrictedOverlapNames,
    hasTransparencyRisk,
    hasHeavyConstructionLoad,
    hasMeatOrSeafoodExtenderTrigger,
    hasReformedWithBinderTrigger,
    hasImitationTextureTrigger,
    hasSimpleFoodMismatch,
    scoreContribution,
    warningText: buildWarningText({
      categorySeverity,
      groupMatches: uniqueGroupMatches.filter(
        (match) => match.group.id !== fortificationGroupId || totalMarkerCount > 0,
      ),
    }),
    redReasons,
  };
}

export function describeArtificialEngineeredFoodConstruction(
  summary: ArtificialEngineeredFoodConstructionSummary,
) {
  if (summary.categorySeverity === "green") {
    return "No artificial or engineered food-construction markers were found.";
  }

  if (summary.categorySeverity === "red") {
    return labelTransparencyRiskGroup.strongerWarning;
  }

  return summary.warningText;
}

export function getConstructionGroupMatchedIngredients(
  summary: ArtificialEngineeredFoodConstructionSummary,
  groupId: string,
) {
  return getGroupMatchedIngredients(summary.matchedGroups, groupId);
}
