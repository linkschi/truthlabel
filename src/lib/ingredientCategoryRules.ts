import { artificialSweetenersDataPack } from "@/data/ingredientIntelligence/artificialSweetenersSugarSubstitutes";
import {
  artificialEngineeredFoodConstructionGroups,
} from "@/data/ingredientIntelligence/artificialEngineeredFoodConstruction";
import { brandTrustSafetyRecallsLawsuitsDataPack } from "@/data/ingredientIntelligence/brandTrustSafetyRecallsLawsuits";
import { cancerLinkedWatchDataPack } from "@/data/ingredientIntelligence/cancerLinkedWatch";
import { flavourEnhancersFlavouringsDataPack } from "@/data/ingredientIntelligence/flavourEnhancersFlavourings";
import { harmfulAdditivesDataPack } from "@/data/ingredientIntelligence/harmfulAdditives";
import { heavyMetalsDataPack } from "@/data/ingredientIntelligence/heavyMetals";
import { hydrogenatedPartiallyHydrogenatedOilsDataPack } from "@/data/ingredientIntelligence/hydrogenatedPartiallyHydrogenatedOils";
import { microplasticsDataPack } from "@/data/ingredientIntelligence/microplastics";
import { preservativesShelfLifeSystemsDataPack } from "@/data/ingredientIntelligence/preservativesShelfLifeSystems";
import {
  mergedArtificialColours,
  type MergedArtificialColour,
} from "@/lib/ingredientIntelligence/artificialColours";

import type {
  IngredientIntelligenceDuplicateSafeMatch,
  IngredientIntelligenceMatcherInput,
  IngredientIntelligenceMatcherOutput,
} from "./ingredientIntelligenceMatcher";
import { normalizeIngredientIntelligenceText } from "./ingredientIntelligenceMatcher";

type CategorySeverity = "green" | "yellow" | "red";
type EvidenceType = IngredientIntelligenceDuplicateSafeMatch["evidenceType"];

export type RedReasonType =
  | "direct_red_ingredient"
  | "banned_restricted"
  | "allergy_profile_match"
  | "count_overload"
  | "verified_external_signal"
  | "category_combo_trigger"
  | "long_ingredient_list"
  | "high_processed_share";

export type IngredientCategorySummary = {
  categoryId: string;
  categoryName: string;
  severity: CategorySeverity;
  matchCount: number;
  displayLabel: string;
  shortMessage: string;
  userFacingReason: string;
  matchedItems: IngredientIntelligenceDuplicateSafeMatch[];
  evidenceTypes: EvidenceType[];
  displayAllowed: boolean;
  redReasonType?: RedReasonType;
  sortOrder: number;
  isInformational?: boolean;
};

export type IngredientCategoryRulesInput = Pick<
  IngredientIntelligenceMatcherOutput,
  | "matchedCategories"
  | "ingredientGroups"
  | "unmatchedIngredients"
  | "duplicateSafeMatches"
  | "matchedIngredients"
> & {
  productCategory?: string;
  ingredientListAvailable: boolean;
  userAllergyProfile?: string[];
  externalSignals?: IngredientIntelligenceMatcherInput["externalSignals"];
  ingredientCount?: number;
};

export type IngredientCategoryRulesOutput = {
  categorySummaries: IngredientCategorySummary[];
};

const categoryNames = {
  banned_restricted_items: "Banned / Restricted Items",
  artificial_colours: "Artificial Colours",
  artificial_sweeteners_sugar_substitutes:
    "Artificial Sweeteners / Sugar Substitutes",
  preservatives_shelf_life_systems: "Preservatives & Shelf-Life Systems",
  emulsifiers_stabilisers_thickeners_gums:
    "Emulsifiers / Stabilisers / Thickeners / Gums",
  flavour_enhancers_flavourings: "Flavour Enhancers / Flavourings",
  seed_oils_processed_oils: "Seed Oils / Processed Oils",
  hydrogenated_partially_hydrogenated_oils:
    "Hydrogenated / Partially Hydrogenated Oils",
  ultra_processed_indicators: "Ultra-Processed Indicators",
  artificial_engineered_food_construction:
    "Artificial / Engineered Food Construction",
  harmful_additives: "Harmful Additives",
  cancer_linked_watch: "Cancer-linked Watch",
  allergy_risk: "Allergy Risk",
  natural_positive: "Natural / Positive Ingredients",
  unknown_review: "Unknown / Review Ingredients",
  meat_specific_concerns: "Meat-Specific Concerns",
  fry_oil_fast_food_oil: "Fry Oil / Fast Food Oil",
  heavy_metals: "Heavy Metals",
  microplastics: "Microplastics",
  brand_trust_safety: "Brand Trust / Safety / Recalls / Lawsuits",
  total_ingredients: "Total Ingredients",
  natural_vs_processed: "Natural vs Processed",
  additives_and_preservatives: "Additives & Preservatives",
} as const;

type CategoryId = keyof typeof categoryNames;

const severityRank: Record<CategorySeverity, number> = {
  green: 0,
  yellow: 1,
  red: 2,
};

const redReasonRank: Record<RedReasonType, number> = {
  banned_restricted: 0,
  allergy_profile_match: 1,
  verified_external_signal: 2,
  direct_red_ingredient: 3,
  count_overload: 4,
  category_combo_trigger: 5,
  high_processed_share: 6,
  long_ingredient_list: 7,
};

const combinedAdditiveCategoryIds = new Set<CategoryId>([
  "artificial_colours",
  "artificial_sweeteners_sugar_substitutes",
  "preservatives_shelf_life_systems",
  "emulsifiers_stabilisers_thickeners_gums",
  "flavour_enhancers_flavourings",
  "harmful_additives",
]);

const fillerBinderConstructionGroupIds = new Set([
  "fillers_and_extenders",
  "binders_and_texture_builders",
]);

const mechanicalConstructionGroupIds = new Set([
  "reformed_reconstructed_meat_or_seafood_markers",
  "mechanically_separated_recovered_meat_markers",
]);

const imitationConstructionGroupIds = new Set([
  "imitation_analogue_food_markers",
  "cultivated_cell_cultured_protein_markers",
  "cultivated_fat_seafood_and_animal_cell_derived_ingredients",
  "engineered_heme_leghemoglobin_meat_like_flavour_systems",
]);

const appearanceTextureConstructionGroupIds = new Set([
  "binders_and_texture_builders",
  "emulsifiers_and_stabilisers",
  "artificial_colours_and_appearance_systems",
  "protein_isolates_and_textured_proteins",
  "extruded_printed_structured_food_technology_markers",
]);

const allergenLabelsByCanonicalId: Record<string, string> = {
  allergy_milk: "milk",
  allergy_egg: "egg",
  allergy_peanut: "peanut",
  allergy_tree_nuts: "tree nuts",
  allergy_wheat_gluten: "wheat / gluten",
  allergy_soy: "soy",
  allergy_fish: "fish",
  allergy_crustacean_shellfish: "crustacean shellfish",
  allergy_sesame: "sesame",
  allergy_celery: "celery",
  allergy_mustard: "mustard",
  allergy_lupin: "lupin",
  allergy_molluscs: "molluscs",
  allergy_sulphites_sulfites: "sulphites / sulfites",
  allergy_label_warning: "allergen warning",
};

const externalLookupKeywords: Record<CategoryId, string[]> = {
  banned_restricted_items: [],
  artificial_colours: [],
  artificial_sweeteners_sugar_substitutes: [],
  preservatives_shelf_life_systems: [],
  emulsifiers_stabilisers_thickeners_gums: [],
  flavour_enhancers_flavourings: [],
  seed_oils_processed_oils: [],
  hydrogenated_partially_hydrogenated_oils: [],
  ultra_processed_indicators: [],
  artificial_engineered_food_construction: [],
  harmful_additives: [],
  cancer_linked_watch: [],
  allergy_risk: [],
  natural_positive: [],
  unknown_review: [],
  meat_specific_concerns: [],
  fry_oil_fast_food_oil: [],
  heavy_metals: ["heavy metal", "lead", "arsenic", "cadmium", "mercury"],
  microplastics: ["microplastic", "nanoplastic", "plastic contact"],
  brand_trust_safety: [
    "brand trust",
    "brand safety",
    "recall",
    "lawsuit",
    "public health alert",
    "outbreak",
    "warning letter",
  ],
  total_ingredients: [],
  natural_vs_processed: [],
  additives_and_preservatives: [],
};

const constructionGroupMatchers = artificialEngineeredFoodConstructionGroups.map(
  (group) => ({
    id: group.id,
    searchTerms: uniqueStrings([group.groupName, ...group.markers])
      .map((term) => normalizeIngredientIntelligenceText(term))
      .filter(Boolean),
  }),
);

const artificialColourRedIds = new Set(
  mergedArtificialColours
    .filter((item) => item.severity === "red")
    .map((item) => getArtificialColourLookupId(item)),
);

const artificialSweetenerRedIds = new Set(
  artificialSweetenersDataPack.items
    .filter((item) => item.severity === "red")
    .map((item) => item.id),
);

const preservativeRedIds = new Set(
  preservativesShelfLifeSystemsDataPack.items
    .filter((item) => item.severity === "red")
    .map((item) => item.id),
);

const flavouringRedIds = new Set(
  flavourEnhancersFlavouringsDataPack.items
    .filter((item) => item.severity === "red")
    .map((item) => item.id),
);

const harmfulAdditiveRedIds = new Set(
  harmfulAdditivesDataPack.items.flatMap((item) =>
    [item.canonicalIngredientId, item.linkedIngredientId, item.id].filter(
      (value): value is string =>
        item.basicSeveritySuggestion === "red" && typeof value === "string",
    ),
  ),
);

const cancerWatchRedIds = new Set(
  cancerLinkedWatchDataPack.items
    .filter((item) => item.basicSeveritySuggestion === "red")
    .map((item) => item.id),
);

const heavyMetalsRedIds = new Set(
  heavyMetalsDataPack.items
    .filter((item) => item.basicSeveritySuggestion === "red")
    .map((item) => item.id),
);

const microplasticsRedIds = new Set(
  microplasticsDataPack.items
    .filter((item) => item.basicSeveritySuggestion === "red")
    .map((item) => item.id),
);

const brandTrustRedIds = new Set(
  brandTrustSafetyRecallsLawsuitsDataPack.items
    .filter((item) => item.basicSeveritySuggestion === "red")
    .map((item) => item.id),
);

const brandTrustGreenIds = new Set(
  brandTrustSafetyRecallsLawsuitsDataPack.items
    .filter((item) => item.basicSeveritySuggestion === "green")
    .map((item) => item.id),
);

const hydrogenatedRedIds = new Set(
  hydrogenatedPartiallyHydrogenatedOilsDataPack.items
    .filter((item) => item.severity === "red")
    .map((item) => item.id),
);

function getArtificialColourLookupId(item: MergedArtificialColour) {
  return ((item as { duplicateGroupId?: string }).duplicateGroupId ?? item.id);
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueBy<T>(values: T[], getKey: (value: T) => string) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = getKey(value);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function containsWholeTerm(value: string, term: string) {
  return ` ${value} `.includes(` ${term} `);
}

function flattenExternalSignalInput(value: unknown) {
  const fragments: string[] = [];

  const collect = (entry: unknown) => {
    if (typeof entry === "string" || typeof entry === "number") {
      fragments.push(String(entry));
      return;
    }

    if (Array.isArray(entry)) {
      entry.forEach((nested) => collect(nested));
      return;
    }

    if (entry && typeof entry === "object") {
      Object.entries(entry).forEach(([key, nested]) => {
        fragments.push(key.replace(/[_-]+/g, " "));
        collect(nested);
      });
    }
  };

  collect(value);
  return uniqueStrings(fragments).join(" ");
}

function getAllDuplicateSafeMatches(input: IngredientCategoryRulesInput) {
  if (input.duplicateSafeMatches?.length) {
    return input.duplicateSafeMatches;
  }

  return uniqueBy(
    (input.matchedCategories ?? []).flatMap((category) => category.matches),
    (match) =>
      [
        match.canonicalIngredientId,
        match.originalIngredientText,
        [...match.sourcePacks].sort().join("|"),
      ].join("::"),
  );
}

function getCategoryMatches(
  allMatches: IngredientIntelligenceDuplicateSafeMatch[],
  categoryId: CategoryId,
) {
  return allMatches.filter((match) => match.sourcePacks.includes(categoryId));
}

function toEvidenceTypes(matches: IngredientIntelligenceDuplicateSafeMatch[]) {
  return uniqueStrings(matches.map((match) => match.evidenceType)) as EvidenceType[];
}

function getParsedIngredientCount(
  input: IngredientCategoryRulesInput,
  allMatches: IngredientIntelligenceDuplicateSafeMatch[],
) {
  if (typeof input.ingredientCount === "number") {
    return input.ingredientCount;
  }

  const matchedIngredientTexts = allMatches.flatMap((match) =>
    match.originalIngredientTexts.length
      ? match.originalIngredientTexts
      : [match.originalIngredientText],
  );

  return uniqueStrings(
    [...matchedIngredientTexts, ...(input.unmatchedIngredients ?? [])].map(
      normalizeIngredientIntelligenceText,
    ),
  ).length;
}

function formatCountLabel(count: number) {
  return count === 0 ? "No" : `${count}`;
}

function normalizeProductCategory(value: string | undefined) {
  return normalizeIngredientIntelligenceText(value ?? "");
}

function isMeatFishSeafoodProduct(productCategory: string | undefined) {
  const normalized = normalizeProductCategory(productCategory);
  return [
    "meat",
    "beef",
    "pork",
    "chicken",
    "turkey",
    "poultry",
    "fish",
    "seafood",
    "shellfish",
    "shrimp",
    "tuna",
    "salmon",
    "burger",
    "sausage",
    "nugget",
    "deli",
    "fast food",
  ].some((term) => containsWholeTerm(normalized, term));
}

function getMatchLookupTexts(match: IngredientIntelligenceDuplicateSafeMatch) {
  return uniqueStrings([
    match.displayName,
    match.matchedTerm,
    ...match.matchedAliases,
    ...match.originalIngredientTexts,
    match.originalIngredientText,
  ])
    .map((value) => normalizeIngredientIntelligenceText(value))
    .filter(Boolean);
}

function getConstructionGroupIds(match: IngredientIntelligenceDuplicateSafeMatch) {
  const lookupTexts = getMatchLookupTexts(match);
  return constructionGroupMatchers
    .filter(({ searchTerms }) =>
      searchTerms.some((term) =>
        lookupTexts.some((value) => containsWholeTerm(value, term)),
      ),
    )
    .map((group) => group.id);
}

function isDirectRedIdMatch(
  match: IngredientIntelligenceDuplicateSafeMatch,
  redIds: Set<string>,
) {
  if (redIds.has(match.canonicalIngredientId)) {
    return true;
  }

  const normalizedDisplay = normalizeIngredientIntelligenceText(match.displayName);
  return [...redIds].some(
    (entry) => normalizeIngredientIntelligenceText(entry) === normalizedDisplay,
  );
}

function isBannedRestrictedOverlap(match: IngredientIntelligenceDuplicateSafeMatch) {
  return match.sourcePacks.includes("banned_restricted_items");
}

function isAllergyProfileMatch(match: IngredientIntelligenceDuplicateSafeMatch) {
  return (
    match.sourcePacks.includes("allergy_risk") && match.evidenceType === "user_profile"
  );
}

function isHeavyMetalsVerifiedRed(match: IngredientIntelligenceDuplicateSafeMatch) {
  return (
    match.sourcePacks.includes("heavy_metals") &&
    isDirectRedIdMatch(match, heavyMetalsRedIds)
  );
}

function isMicroplasticsVerifiedRed(match: IngredientIntelligenceDuplicateSafeMatch) {
  return (
    match.sourcePacks.includes("microplastics") &&
    isDirectRedIdMatch(match, microplasticsRedIds)
  );
}

function isBrandTrustVerifiedRed(match: IngredientIntelligenceDuplicateSafeMatch) {
  return (
    match.sourcePacks.includes("brand_trust_safety") &&
    isDirectRedIdMatch(match, brandTrustRedIds)
  );
}

function getAutomaticRedReasonFromMatch(
  match: IngredientIntelligenceDuplicateSafeMatch,
): RedReasonType | null {
  if (isBannedRestrictedOverlap(match)) {
    return "banned_restricted";
  }

  if (isAllergyProfileMatch(match)) {
    return "allergy_profile_match";
  }

  if (match.sourcePacks.includes("hydrogenated_partially_hydrogenated_oils")) {
    return "direct_red_ingredient";
  }

  if (
    isHeavyMetalsVerifiedRed(match) ||
    isMicroplasticsVerifiedRed(match) ||
    isBrandTrustVerifiedRed(match)
  ) {
    return "verified_external_signal";
  }

  return null;
}

function buildBaseSummary(
  categoryId: CategoryId,
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  overrides: Partial<Omit<IngredientCategorySummary, "categoryId" | "categoryName">>,
): IngredientCategorySummary {
  return {
    categoryId,
    categoryName: categoryNames[categoryId],
    severity: "green",
    matchCount: matches.length,
    displayLabel: matches.length === 0 ? "No" : formatCountLabel(matches.length),
    shortMessage: "",
    userFacingReason: "",
    matchedItems: matches,
    evidenceTypes: toEvidenceTypes(matches),
    displayAllowed: true,
    sortOrder: 0,
    ...overrides,
  };
}

function buildCountCategorySummary(params: {
  categoryId: CategoryId;
  matches: IngredientIntelligenceDuplicateSafeMatch[];
  ingredientListAvailable: boolean;
  redThreshold: number;
  greenMessage: string;
  yellowMessage: string;
  redMessage: string;
  directRedPredicate?: (match: IngredientIntelligenceDuplicateSafeMatch) => boolean;
  directRedReasonType?: RedReasonType;
}) {
  const {
    categoryId,
    matches,
    ingredientListAvailable,
    redThreshold,
    greenMessage,
    yellowMessage,
    redMessage,
    directRedPredicate,
    directRedReasonType = "direct_red_ingredient",
  } = params;

  if (!ingredientListAvailable && matches.length === 0) {
    return buildBaseSummary(categoryId, matches, {
      displayAllowed: false,
      displayLabel: "Not checked",
      shortMessage: "Not checked.",
      userFacingReason: "This category was not checked because ingredient data was not available.",
    });
  }

  const directRedMatch = directRedPredicate
    ? matches.find((match) => directRedPredicate(match))
    : undefined;

  if (directRedMatch) {
    return buildBaseSummary(categoryId, matches, {
      severity: "red",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: redMessage,
      userFacingReason: redMessage,
      redReasonType: directRedReasonType,
    });
  }

  if (matches.length >= redThreshold) {
    return buildBaseSummary(categoryId, matches, {
      severity: "red",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: redMessage,
      userFacingReason: redMessage,
      redReasonType: "count_overload",
    });
  }

  if (matches.length > 0) {
    return buildBaseSummary(categoryId, matches, {
      severity: "yellow",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: yellowMessage,
      userFacingReason: yellowMessage,
    });
  }

  return buildBaseSummary(categoryId, matches, {
    severity: "green",
    displayLabel: "No",
    shortMessage: greenMessage,
    userFacingReason: greenMessage,
  });
}

function buildBannedRestrictedSummary(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  ingredientListAvailable: boolean,
) {
  if (!ingredientListAvailable && matches.length === 0) {
    return buildBaseSummary("banned_restricted_items", matches, {
      displayAllowed: false,
      displayLabel: "Not checked",
      shortMessage: "Not checked.",
      userFacingReason: "This category was not checked because ingredient data was not available.",
    });
  }

  if (matches.length > 0) {
    const message =
      "This product contains a banned, restricted, revoked, or not-permitted ingredient in at least one region. Truthlabel flags this as a serious regulatory concern.";
    return buildBaseSummary("banned_restricted_items", matches, {
      severity: "red",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "banned_restricted",
    });
  }

  return buildBaseSummary("banned_restricted_items", matches, {
    severity: "green",
    displayLabel: "No",
    shortMessage: "No banned or restricted ingredient found from available label data.",
    userFacingReason:
      "No banned or restricted ingredient found from available label data.",
  });
}

function buildAllergyRiskSummary(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  ingredientListAvailable: boolean,
) {
  if (!ingredientListAvailable && matches.length === 0) {
    return buildBaseSummary("allergy_risk", matches, {
      displayAllowed: false,
      displayLabel: "Not checked",
      shortMessage: "Not checked.",
      userFacingReason: "This category was not checked because ingredient data was not available.",
    });
  }

  if (matches.length === 0) {
    const message = "No common allergen found from available label data.";
    return buildBaseSummary("allergy_risk", matches, {
      severity: "green",
      displayLabel: "No",
      shortMessage: message,
      userFacingReason: message,
    });
  }

  const specificAllergens = uniqueStrings(
    matches
      .map((match) => allergenLabelsByCanonicalId[match.canonicalIngredientId])
      .filter(
        (value): value is string =>
          Boolean(value) && value !== allergenLabelsByCanonicalId.allergy_label_warning,
      ),
  );
  const hasCrossContactWarning = matches.some((match) =>
    getMatchLookupTexts(match).some(
      (text) =>
        containsWholeTerm(text, "may contain") ||
        containsWholeTerm(text, "traces of") ||
        containsWholeTerm(text, "shared equipment") ||
        containsWholeTerm(text, "same oil") ||
        containsWholeTerm(text, "same facility") ||
        match.canonicalIngredientId === "allergy_label_warning",
    ),
  );
  const profileMatchAllergen = matches.find((match) => isAllergyProfileMatch(match));

  if (profileMatchAllergen) {
    const allergen =
      allergenLabelsByCanonicalId[profileMatchAllergen.canonicalIngredientId] ??
      "a flagged allergen";
    const message = hasCrossContactWarning
      ? `This label includes a possible cross-contact warning for ${allergen}, which matches your allergy profile.`
      : `This product contains ${allergen}, which matches your allergy profile. Avoid this product if you are allergic to ${allergen}.`;
    return buildBaseSummary("allergy_risk", matches, {
      severity: "red",
      displayLabel: "Found",
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "allergy_profile_match",
    });
  }

  if (specificAllergens.length > 0) {
    const message =
      specificAllergens.length === 1
        ? `This product contains a common allergen: ${specificAllergens[0]}.`
        : `This product contains common allergens: ${specificAllergens.join(", ")}.`;
    return buildBaseSummary("allergy_risk", matches, {
      severity: "yellow",
      displayLabel: "Found",
      shortMessage: message,
      userFacingReason: message,
    });
  }

  const warningMessage =
    "This label includes a possible cross-contact warning for a common allergen.";
  return buildBaseSummary("allergy_risk", matches, {
    severity: "yellow",
    displayLabel: "Found",
    shortMessage: warningMessage,
    userFacingReason: warningMessage,
  });
}

function buildNaturalPositiveSummary(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  ingredientListAvailable: boolean,
) {
  const count = matches.length;

  if (!ingredientListAvailable) {
    return buildBaseSummary("natural_positive", matches, {
      displayAllowed: false,
      displayLabel: "Not checked",
      shortMessage: "Not checked.",
      userFacingReason: "Recognizable ingredient share cannot be calculated without ingredient data.",
      isInformational: true,
    });
  }

  const message = `Recognizable ingredients found: ${count}.`;
  return buildBaseSummary("natural_positive", matches, {
    severity: "green",
    displayLabel: String(count),
    shortMessage: message,
    userFacingReason: message,
    isInformational: true,
  });
}

function buildHeavyMetalsSummary(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  input: IngredientCategoryRulesInput,
) {
  const lookupState = getExternalLookupState("heavy_metals", input.externalSignals);
  const verifiedRed = matches.some(isHeavyMetalsVerifiedRed);

  if (verifiedRed) {
    const message =
      "Verified heavy-metal warning or testing signal found. Truthlabel flags this as a serious external safety concern.";
    return buildBaseSummary("heavy_metals", matches, {
      severity: "red",
      displayLabel: "Found",
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "verified_external_signal",
    });
  }

  if (matches.length > 0) {
    const message =
      "This product type may need heavy-metal review. This is not proof that this exact product contains elevated heavy metals.";
    return buildBaseSummary("heavy_metals", matches, {
      severity: "yellow",
      displayLabel: "Review",
      shortMessage: message,
      userFacingReason: message,
    });
  }

  if (lookupState.clean) {
    const message =
      "No heavy-metal warning found in checked sources at the time of lookup.";
    return buildBaseSummary("heavy_metals", matches, {
      severity: "green",
      displayLabel: "No",
      shortMessage: message,
      userFacingReason: message,
    });
  }

  return buildBaseSummary("heavy_metals", matches, {
    displayAllowed: false,
    displayLabel: lookupState.lookupPerformed ? "Not checked" : "Not checked",
    shortMessage: "Not checked.",
    userFacingReason:
      "Heavy-metal lookup data was not available. Missing data is not proof of absence.",
  });
}

function buildMicroplasticsSummary(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  input: IngredientCategoryRulesInput,
) {
  const lookupState = getExternalLookupState("microplastics", input.externalSignals);
  const verifiedRed = matches.some(isMicroplasticsVerifiedRed);

  if (verifiedRed) {
    const message =
      "Verified microplastic or nanoplastic detection signal found. Truthlabel flags this as a serious external review concern.";
    return buildBaseSummary("microplastics", matches, {
      severity: "red",
      displayLabel: "Found",
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "verified_external_signal",
    });
  }

  if (matches.length > 0) {
    const message =
      "This product type or packaging may need microplastic review. This is not proof that this exact product contains elevated microplastics.";
    return buildBaseSummary("microplastics", matches, {
      severity: "yellow",
      displayLabel: "Review",
      shortMessage: message,
      userFacingReason: message,
    });
  }

  if (lookupState.clean) {
    const message =
      "No microplastic warning found in checked sources at the time of lookup.";
    return buildBaseSummary("microplastics", matches, {
      severity: "green",
      displayLabel: "No",
      shortMessage: message,
      userFacingReason: message,
    });
  }

  return buildBaseSummary("microplastics", matches, {
    displayAllowed: false,
    displayLabel: "Not checked",
    shortMessage: "Not checked.",
    userFacingReason:
      "Microplastic lookup data was not available. Missing data is not proof of absence.",
  });
}

function buildBrandTrustSummary(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  input: IngredientCategoryRulesInput,
) {
  const lookupState = getExternalLookupState(
    "brand_trust_safety",
    input.externalSignals,
  );
  const redMatch = matches.find(isBrandTrustVerifiedRed);
  const greenMatch = matches.find((match) => isDirectRedIdMatch(match, brandTrustGreenIds));
  const lawsuitMatch = matches.find((match) =>
    getMatchLookupTexts(match).some((text) => containsWholeTerm(text, "lawsuit allegation")),
  );
  const historicalRecallMatch = matches.find((match) =>
    getMatchLookupTexts(match).some((text) => containsWholeTerm(text, "historical recall")),
  );

  if (redMatch) {
    const message =
      "Official recall or public health alert found for this product or batch. Check the affected lot/date details.";
    return buildBaseSummary("brand_trust_safety", matches, {
      severity: "red",
      displayLabel: "Found",
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "verified_external_signal",
    });
  }

  if (greenMatch || lookupState.clean) {
    const message =
      "No official recall signal found in checked sources at the time of lookup. This does not guarantee the product is risk-free.";
    return buildBaseSummary("brand_trust_safety", matches, {
      severity: "green",
      displayLabel: "No",
      shortMessage: message,
      userFacingReason: message,
    });
  }

  if (lawsuitMatch) {
    const message =
      "Lawsuit allegation found. This is not proof unless confirmed by court decision, settlement, or official finding.";
    return buildBaseSummary("brand_trust_safety", matches, {
      severity: "yellow",
      displayLabel: "Review",
      shortMessage: message,
      userFacingReason: message,
    });
  }

  if (historicalRecallMatch) {
    const message =
      "Historical recall found. This may not apply to the current product or batch.";
    return buildBaseSummary("brand_trust_safety", matches, {
      severity: "yellow",
      displayLabel: "Review",
      shortMessage: message,
      userFacingReason: message,
    });
  }

  if (matches.length > 0) {
    const message =
      "Brand or product safety review signal found. Review the external evidence and affected scope.";
    return buildBaseSummary("brand_trust_safety", matches, {
      severity: "yellow",
      displayLabel: "Review",
      shortMessage: message,
      userFacingReason: message,
    });
  }

  return buildBaseSummary("brand_trust_safety", matches, {
    displayAllowed: false,
    displayLabel: "Not checked",
    shortMessage: "Not checked.",
    userFacingReason:
      "Brand-trust lookup data was not available. Missing data is not proof of safety or danger.",
  });
}

function buildTotalIngredientsSummary(
  totalIngredientCount: number,
  ingredientListAvailable: boolean,
) {
  const matches: IngredientIntelligenceDuplicateSafeMatch[] = [];

  if (!ingredientListAvailable) {
    return buildBaseSummary("total_ingredients", matches, {
      displayAllowed: false,
      displayLabel: "Not checked",
      shortMessage: "Not checked.",
      userFacingReason: "Total ingredient count cannot be calculated without ingredient data.",
    });
  }

  if (totalIngredientCount >= 15) {
    const message = "This product has a very long ingredient list.";
    return buildBaseSummary("total_ingredients", matches, {
      severity: "red",
      matchCount: totalIngredientCount,
      displayLabel: String(totalIngredientCount),
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "long_ingredient_list",
    });
  }

  if (totalIngredientCount >= 8) {
    const message = "This product has a longer ingredient list worth reviewing.";
    return buildBaseSummary("total_ingredients", matches, {
      severity: "yellow",
      matchCount: totalIngredientCount,
      displayLabel: String(totalIngredientCount),
      shortMessage: message,
      userFacingReason: message,
    });
  }

  const message = "This product has a shorter ingredient list.";
  return buildBaseSummary("total_ingredients", matches, {
    severity: "green",
    matchCount: totalIngredientCount,
    displayLabel: String(totalIngredientCount),
    shortMessage: message,
    userFacingReason: message,
  });
}

function buildNaturalVsProcessedSummary(
  input: IngredientCategoryRulesInput,
) {
  const naturalCount = input.ingredientGroups.natural_positive.length;
  const processedCount = input.ingredientGroups.processed_artificial.length;
  const unknownCount = input.ingredientGroups.unknown_review.length;
  const totalClassified = naturalCount + processedCount + unknownCount;
  const matches = input.ingredientGroups.processed_artificial.map((match) => ({
    ...match,
    originalIngredientTexts: [match.originalIngredientText],
  })) as IngredientIntelligenceDuplicateSafeMatch[];

  if (!input.ingredientListAvailable || totalClassified === 0) {
    return buildBaseSummary("natural_vs_processed", matches, {
      displayAllowed: false,
      displayLabel: "Not checked",
      shortMessage: "Not checked.",
      userFacingReason:
        "Natural versus processed share cannot be calculated without ingredient data.",
    });
  }

  const processedShare = totalClassified === 0 ? 0 : processedCount / totalClassified;
  const processedPercent = Math.round(processedShare * 100);

  if (processedShare >= 0.6) {
    const message =
      "This product appears heavily processed based on the ingredient list.";
    return buildBaseSummary("natural_vs_processed", matches, {
      severity: "red",
      matchCount: processedCount,
      displayLabel: `${processedPercent}%`,
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "high_processed_share",
    });
  }

  if (processedShare >= 0.31) {
    const message =
      "This product appears mixed based on the ingredient list.";
    return buildBaseSummary("natural_vs_processed", matches, {
      severity: "yellow",
      matchCount: processedCount,
      displayLabel: `${processedPercent}%`,
      shortMessage: message,
      userFacingReason: message,
    });
  }

  const message = "This product appears mostly simple based on the ingredient list.";
  return buildBaseSummary("natural_vs_processed", matches, {
    severity: "green",
    matchCount: processedCount,
    displayLabel: `${processedPercent}%`,
    shortMessage: message,
    userFacingReason: message,
  });
}

function buildAdditivesAndPreservativesSummary(
  allMatches: IngredientIntelligenceDuplicateSafeMatch[],
  ingredientListAvailable: boolean,
) {
  const matches = uniqueBy(
    allMatches.filter((match) =>
      match.sourcePacks.some((sourcePack) =>
        combinedAdditiveCategoryIds.has(sourcePack as CategoryId),
      ),
    ),
    (match) => match.canonicalIngredientId,
  );

  if (!ingredientListAvailable && matches.length === 0) {
    return buildBaseSummary("additives_and_preservatives", matches, {
      displayAllowed: false,
      displayLabel: "Not checked",
      shortMessage: "Not checked.",
      userFacingReason: "This category was not checked because ingredient data was not available.",
    });
  }

  const hasDirectRed = matches.some(
    (match) =>
      isDirectRedIdMatch(match, artificialColourRedIds) ||
      isDirectRedIdMatch(match, artificialSweetenerRedIds) ||
      isDirectRedIdMatch(match, preservativeRedIds) ||
      isDirectRedIdMatch(match, flavouringRedIds) ||
      isDirectRedIdMatch(match, harmfulAdditiveRedIds) ||
      isBannedRestrictedOverlap(match),
  );

  if (hasDirectRed) {
    const message =
      "This product contains multiple additive and preservative systems. Truthlabel flags this as a high additive-load concern.";
    return buildBaseSummary("additives_and_preservatives", matches, {
      severity: "red",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: message,
      userFacingReason: message,
      redReasonType: isBannedRestrictedOverlap(matches[0]!) ? "banned_restricted" : "direct_red_ingredient",
    });
  }

  if (matches.length >= 4) {
    const message =
      "This product contains multiple additive and preservative systems. Truthlabel flags this as a high additive-load concern.";
    return buildBaseSummary("additives_and_preservatives", matches, {
      severity: "red",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "count_overload",
    });
  }

  if (matches.length > 0) {
    const message =
      "This product contains additive or preservative systems. Truthlabel flags this for review.";
    return buildBaseSummary("additives_and_preservatives", matches, {
      severity: "yellow",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: message,
      userFacingReason: message,
    });
  }

  return buildBaseSummary("additives_and_preservatives", matches, {
    severity: "green",
    displayLabel: "No",
    shortMessage: "No additive or preservative system found from available label data.",
    userFacingReason:
      "No additive or preservative system found from available label data.",
  });
}

function getExternalLookupState(
  categoryId: CategoryId,
  externalSignals: IngredientIntelligenceMatcherInput["externalSignals"],
) {
  const keywords = externalLookupKeywords[categoryId];
  let lookupPerformed = false;
  let clean = false;

  (externalSignals ?? []).forEach((signal) => {
    const flattened = flattenExternalSignalInput(signal);
    const normalized = normalizeIngredientIntelligenceText(flattened);
    const signalObject =
      signal && typeof signal === "object" && !Array.isArray(signal)
        ? (signal as Record<string, unknown>)
        : null;
    const explicitCategory = signalObject
      ? normalizeIngredientIntelligenceText(
          String(
            signalObject.categoryId ??
              signalObject.category ??
              signalObject.lookupCategory ??
              signalObject.packId ??
              "",
          ),
        )
      : "";
    const statusText = signalObject
      ? normalizeIngredientIntelligenceText(
          flattenExternalSignalInput([
            signalObject.status,
            signalObject.lookupStatus,
            signalObject.result,
            signalObject.outcome,
            signalObject.state,
            signalObject.severity,
          ]),
        )
      : normalized;
    const applies =
      explicitCategory === normalizeIngredientIntelligenceText(categoryId) ||
      keywords.some((keyword) => containsWholeTerm(normalized, keyword));

    if (!applies) {
      return;
    }

    const hasLookupMarker =
      Boolean(signalObject?.lookupPerformed) ||
      Boolean(signalObject?.checked) ||
      Boolean(signalObject?.performed) ||
      containsWholeTerm(normalized, "lookup") ||
      containsWholeTerm(normalized, "checked") ||
      containsWholeTerm(normalized, "database");

    if (hasLookupMarker) {
      lookupPerformed = true;
    }

    if (
      containsWholeTerm(statusText, "clean") ||
      containsWholeTerm(statusText, "clear") ||
      containsWholeTerm(statusText, "none found") ||
      containsWholeTerm(statusText, "no signal") ||
      containsWholeTerm(statusText, "no warning") ||
      containsWholeTerm(statusText, "no recall") ||
      containsWholeTerm(statusText, "not found")
    ) {
      lookupPerformed = true;
      clean = true;
    }
  });

  return { lookupPerformed, clean };
}

function summarizeConstructionCategory(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  ingredientListAvailable: boolean,
  productCategory: string | undefined,
) {
  if (!ingredientListAvailable && matches.length === 0) {
    return buildBaseSummary("artificial_engineered_food_construction", matches, {
      displayAllowed: false,
      displayLabel: "Not checked",
      shortMessage: "Not checked.",
      userFacingReason: "This category was not checked because ingredient data was not available.",
    });
  }

  const groupMatches = matches.map((match) => ({
    match,
    groupIds: getConstructionGroupIds(match),
  }));
  const fillerBinderCount = groupMatches.filter(({ groupIds }) =>
    groupIds.some((id) => fillerBinderConstructionGroupIds.has(id)),
  ).length;
  const hasMechanicalMarker = groupMatches.some(({ groupIds }) =>
    groupIds.some((id) => mechanicalConstructionGroupIds.has(id)),
  );
  const hasImitationMarker = groupMatches.some(({ groupIds }) =>
    groupIds.some((id) => imitationConstructionGroupIds.has(id)),
  );
  const hasAppearanceTextureMarker = groupMatches.some(({ groupIds }) =>
    groupIds.some((id) => appearanceTextureConstructionGroupIds.has(id)),
  );
  const hasBannedOverlap = matches.some(isBannedRestrictedOverlap);
  const meatLikeProduct = isMeatFishSeafoodProduct(productCategory);
  const hasComboTrigger =
    hasBannedOverlap ||
    (meatLikeProduct && fillerBinderCount >= 2) ||
    (hasMechanicalMarker && fillerBinderCount >= 1) ||
    (hasImitationMarker && hasAppearanceTextureMarker);

  if (hasComboTrigger) {
    const message =
      "This product contains multiple food-construction markers. Truthlabel flags this as a serious food-construction concern.";
    return buildBaseSummary("artificial_engineered_food_construction", matches, {
      severity: "red",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: message,
      userFacingReason: message,
      redReasonType: hasBannedOverlap ? "banned_restricted" : "category_combo_trigger",
    });
  }

  if (matches.length >= 4) {
    const message =
      "This product contains multiple food-construction markers. Truthlabel flags this as a serious food-construction concern.";
    return buildBaseSummary("artificial_engineered_food_construction", matches, {
      severity: "red",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "count_overload",
    });
  }

  if (matches.length > 0) {
    const message =
      "This product contains artificial or engineered food-construction markers. Truthlabel flags this because the ingredient list suggests the food may be built, extended, reconstructed, or heavily structured.";
    return buildBaseSummary("artificial_engineered_food_construction", matches, {
      severity: "yellow",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: message,
      userFacingReason: message,
    });
  }

  return buildBaseSummary("artificial_engineered_food_construction", matches, {
    severity: "green",
    displayLabel: "No",
    shortMessage: "No artificial or engineered food-construction marker found from available label data.",
    userFacingReason:
      "No artificial or engineered food-construction marker found from available label data.",
  });
}

function summarizeUltraProcessedCategory(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  ingredientListAvailable: boolean,
) {
  if (!ingredientListAvailable && matches.length === 0) {
    return buildBaseSummary("ultra_processed_indicators", matches, {
      displayAllowed: false,
      displayLabel: "Not checked",
      shortMessage: "Not checked.",
      userFacingReason: "This category was not checked because ingredient data was not available.",
    });
  }

  const automaticRedMatch = matches.find((match) => getAutomaticRedReasonFromMatch(match));
  if (automaticRedMatch) {
    const message =
      "This product contains multiple ultra-processed markers.";
    return buildBaseSummary("ultra_processed_indicators", matches, {
      severity: "red",
      displayLabel: "High",
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "category_combo_trigger",
    });
  }

  if (matches.length >= 4) {
    const message =
      "This product contains multiple ultra-processed markers.";
    return buildBaseSummary("ultra_processed_indicators", matches, {
      severity: "red",
      displayLabel: "High",
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "count_overload",
    });
  }

  if (matches.length > 0) {
    const message =
      "This product contains ultra-processed ingredient markers.";
    return buildBaseSummary("ultra_processed_indicators", matches, {
      severity: "yellow",
      displayLabel: "Likely",
      shortMessage: message,
      userFacingReason: message,
    });
  }

  return buildBaseSummary("ultra_processed_indicators", matches, {
    severity: "green",
    displayLabel: "No major markers",
    shortMessage:
      "No major ultra-processed markers were found from the available ingredient list.",
    userFacingReason:
      "No major ultra-processed markers were found from the available ingredient list.",
  });
}

function summarizeMeatSpecificCategory(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  ingredientListAvailable: boolean,
) {
  if (!ingredientListAvailable && matches.length === 0) {
    return buildBaseSummary("meat_specific_concerns", matches, {
      displayAllowed: false,
      displayLabel: "Not checked",
      shortMessage: "Not checked.",
      userFacingReason: "This category was not checked because ingredient data was not available.",
    });
  }

  const automaticRedMatch = matches.find((match) => getAutomaticRedReasonFromMatch(match));
  if (automaticRedMatch) {
    const message =
      "This product contains multiple meat-processing markers. Truthlabel flags this as a high meat-processing concern.";
    return buildBaseSummary("meat_specific_concerns", matches, {
      severity: "red",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: message,
      userFacingReason: message,
      redReasonType: getAutomaticRedReasonFromMatch(automaticRedMatch) ?? "category_combo_trigger",
    });
  }

  if (matches.length >= 3) {
    const message =
      "This product contains multiple meat-processing markers. Truthlabel flags this as a high meat-processing concern.";
    return buildBaseSummary("meat_specific_concerns", matches, {
      severity: "red",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: message,
      userFacingReason: message,
      redReasonType: "count_overload",
    });
  }

  if (matches.length > 0) {
    const message =
      "This product contains meat-specific processing markers. Truthlabel flags this as a meat-processing review item.";
    return buildBaseSummary("meat_specific_concerns", matches, {
      severity: "yellow",
      displayLabel: formatCountLabel(matches.length),
      shortMessage: message,
      userFacingReason: message,
    });
  }

  return buildBaseSummary("meat_specific_concerns", matches, {
    severity: "green",
    displayLabel: "No",
    shortMessage: "No meat-specific processing marker found from available label data.",
    userFacingReason:
      "No meat-specific processing marker found from available label data.",
  });
}

function sortCategorySummaries(summaries: IngredientCategorySummary[]) {
  return [...summaries].sort((left, right) => {
    const leftHidden = left.displayAllowed ? 0 : 1;
    const rightHidden = right.displayAllowed ? 0 : 1;
    if (leftHidden !== rightHidden) {
      return leftHidden - rightHidden;
    }

    const leftBucket = getSortBucket(left);
    const rightBucket = getSortBucket(right);
    if (leftBucket !== rightBucket) {
      return leftBucket - rightBucket;
    }

    if (left.severity === "red" && right.severity === "red") {
      const leftReason =
        left.redReasonType ? redReasonRank[left.redReasonType] : Number.MAX_SAFE_INTEGER;
      const rightReason =
        right.redReasonType
          ? redReasonRank[right.redReasonType]
          : Number.MAX_SAFE_INTEGER;
      if (leftReason !== rightReason) {
        return leftReason - rightReason;
      }
    }

    if (severityRank[left.severity] !== severityRank[right.severity]) {
      return severityRank[right.severity] - severityRank[left.severity];
    }

    return left.categoryName.localeCompare(right.categoryName);
  }).map((summary, index) => ({
    ...summary,
    sortOrder: index,
  }));
}

function getSortBucket(summary: IngredientCategorySummary) {
  if (!summary.displayAllowed) {
    return 4;
  }

  if (summary.severity === "red") {
    return 0;
  }

  if (summary.severity === "yellow") {
    return 1;
  }

  if (summary.isInformational) {
    return 2;
  }

  return 3;
}

export function summarizeCategoryMatches(
  input: IngredientCategoryRulesInput,
) {
  const allMatches = getAllDuplicateSafeMatches(input);
  const ingredientListAvailable = input.ingredientListAvailable;
  const totalIngredientCount = getParsedIngredientCount(input, allMatches);

  const summaries: IngredientCategorySummary[] = [
    buildBannedRestrictedSummary(
      getCategoryMatches(allMatches, "banned_restricted_items"),
      ingredientListAvailable,
    ),
    buildCountCategorySummary({
      categoryId: "artificial_colours",
      matches: getCategoryMatches(allMatches, "artificial_colours"),
      ingredientListAvailable,
      redThreshold: 3,
      greenMessage: "No artificial colour found from available label data.",
      yellowMessage:
        "This product contains artificial colour additives. Truthlabel flags these as additive review items.",
      redMessage:
        "This product contains multiple artificial colour additives. Truthlabel flags this as a high artificial-colour load.",
      directRedPredicate: (match) => isDirectRedIdMatch(match, artificialColourRedIds),
    }),
    buildCountCategorySummary({
      categoryId: "artificial_sweeteners_sugar_substitutes",
      matches: getCategoryMatches(
        allMatches,
        "artificial_sweeteners_sugar_substitutes",
      ),
      ingredientListAvailable,
      redThreshold: 3,
      greenMessage:
        "No artificial or non-sugar sweetener found from available label data.",
      yellowMessage:
        "This product contains artificial or non-sugar sweeteners. Truthlabel flags these as added sweetener-system concerns.",
      redMessage:
        "This product contains multiple sweetener systems. Truthlabel flags this as a high sweetener-load concern.",
      directRedPredicate: (match) => isDirectRedIdMatch(match, artificialSweetenerRedIds),
    }),
    buildCountCategorySummary({
      categoryId: "preservatives_shelf_life_systems",
      matches: getCategoryMatches(allMatches, "preservatives_shelf_life_systems"),
      ingredientListAvailable,
      redThreshold: 3,
      greenMessage:
        "No preservative or shelf-life additive found from available label data.",
      yellowMessage:
        "This product contains preservatives or shelf-life additives. Truthlabel flags this because the product is chemically supported for longer storage or stability.",
      redMessage:
        "This product contains multiple preservative systems. Truthlabel flags this as a high shelf-life additive load.",
      directRedPredicate: (match) => isDirectRedIdMatch(match, preservativeRedIds),
    }),
    buildCountCategorySummary({
      categoryId: "emulsifiers_stabilisers_thickeners_gums",
      matches: getCategoryMatches(
        allMatches,
        "emulsifiers_stabilisers_thickeners_gums",
      ),
      ingredientListAvailable,
      redThreshold: 3,
      greenMessage:
        "No emulsifier, stabiliser, thickener, or gum found from available label data.",
      yellowMessage:
        "This product contains emulsifiers, stabilisers, thickeners, or gums. Truthlabel flags these as texture-additive review items.",
      redMessage:
        "This product contains multiple texture-additive systems. Truthlabel flags this as a high emulsifier/stabiliser load.",
    }),
    buildCountCategorySummary({
      categoryId: "flavour_enhancers_flavourings",
      matches: getCategoryMatches(allMatches, "flavour_enhancers_flavourings"),
      ingredientListAvailable,
      redThreshold: 3,
      greenMessage:
        "No flavour enhancer or flavouring system found from available label data.",
      yellowMessage:
        "This product contains flavour enhancers or flavouring systems. Truthlabel flags these as taste-building additive review items.",
      redMessage:
        "This product contains multiple flavouring or flavour-enhancer systems. Truthlabel flags this as a high flavour-system load.",
      directRedPredicate: (match) => isDirectRedIdMatch(match, flavouringRedIds),
    }),
    buildCountCategorySummary({
      categoryId: "seed_oils_processed_oils",
      matches: getCategoryMatches(allMatches, "seed_oils_processed_oils"),
      ingredientListAvailable,
      redThreshold: 2,
      greenMessage: "No seed or processed oil found from available label data.",
      yellowMessage:
        "This product contains a seed oil or processed oil. Truthlabel flags this as a processed-oil review item.",
      redMessage:
        "This product contains multiple seed or processed oils. Truthlabel flags this as a high processed-oil load.",
    }),
    buildCountCategorySummary({
      categoryId: "hydrogenated_partially_hydrogenated_oils",
      matches: getCategoryMatches(
        allMatches,
        "hydrogenated_partially_hydrogenated_oils",
      ),
      ingredientListAvailable,
      redThreshold: 1,
      greenMessage:
        "No hydrogenated or partially hydrogenated oil found from available label data.",
      yellowMessage:
        "This product contains hydrogenated or partially hydrogenated oil. Truthlabel flags this as a serious processed-fat concern.",
      redMessage:
        "This product contains hydrogenated or partially hydrogenated oil. Truthlabel flags this as a serious processed-fat concern.",
      directRedPredicate: (match) => isDirectRedIdMatch(match, hydrogenatedRedIds),
    }),
    summarizeUltraProcessedCategory(
      getCategoryMatches(allMatches, "ultra_processed_indicators"),
      ingredientListAvailable,
    ),
    summarizeConstructionCategory(
      getCategoryMatches(allMatches, "artificial_engineered_food_construction"),
      ingredientListAvailable,
      input.productCategory,
    ),
    buildCountCategorySummary({
      categoryId: "harmful_additives",
      matches: getCategoryMatches(allMatches, "harmful_additives"),
      ingredientListAvailable,
      redThreshold: 3,
      greenMessage: "No harmful additive watch item found from available label data.",
      yellowMessage:
        "This product contains additive review concerns. Truthlabel flags these as harmful-additive watch items.",
      redMessage:
        "This product contains multiple additive concerns. Truthlabel flags this as a high harmful-additive load.",
      directRedPredicate: (match) => isDirectRedIdMatch(match, harmfulAdditiveRedIds),
    }),
    buildCountCategorySummary({
      categoryId: "cancer_linked_watch",
      matches: getCategoryMatches(allMatches, "cancer_linked_watch"),
      ingredientListAvailable,
      redThreshold: 2,
      greenMessage: "No Cancer-linked Watch signal found from available label data.",
      yellowMessage:
        "This product contains an ingredient on Truthlabel's Cancer-linked Watch. This is a review signal, not proof that the product causes cancer.",
      redMessage:
        "This product contains multiple Cancer-linked Watch signals. Truthlabel flags this as a serious review concern, not proof that the product causes cancer.",
      directRedPredicate: (match) => isDirectRedIdMatch(match, cancerWatchRedIds),
    }),
    buildAllergyRiskSummary(
      getCategoryMatches(allMatches, "allergy_risk"),
      ingredientListAvailable,
    ),
    buildNaturalPositiveSummary(
      getCategoryMatches(allMatches, "natural_positive"),
      ingredientListAvailable,
    ),
    buildCountCategorySummary({
      categoryId: "unknown_review",
      matches: getCategoryMatches(allMatches, "unknown_review"),
      ingredientListAvailable,
      redThreshold: 4,
      greenMessage: "No vague or low-transparency label term found from available label data.",
      yellowMessage:
        "This product contains vague or low-transparency ingredient wording. Truthlabel flags this for review because the exact ingredient source is not fully clear.",
      redMessage:
        "This product contains multiple vague or low-transparency label terms. Truthlabel flags this as a serious label-transparency concern.",
    }),
    summarizeMeatSpecificCategory(
      getCategoryMatches(allMatches, "meat_specific_concerns"),
      ingredientListAvailable,
    ),
    buildCountCategorySummary({
      categoryId: "fry_oil_fast_food_oil",
      matches: getCategoryMatches(allMatches, "fry_oil_fast_food_oil"),
      ingredientListAvailable,
      redThreshold: 3,
      greenMessage:
        "No frying-oil or fast-food oil marker found from available label data.",
      yellowMessage:
        "This product contains frying-oil or fast-food oil markers. Truthlabel flags this as a frying-oil review item.",
      redMessage:
        "This product contains multiple frying-oil or fast-food oil markers. Truthlabel flags this as a high frying-oil processing concern.",
    }),
    buildHeavyMetalsSummary(getCategoryMatches(allMatches, "heavy_metals"), input),
    buildMicroplasticsSummary(getCategoryMatches(allMatches, "microplastics"), input),
    buildBrandTrustSummary(getCategoryMatches(allMatches, "brand_trust_safety"), input),
    buildTotalIngredientsSummary(totalIngredientCount, ingredientListAvailable),
    buildNaturalVsProcessedSummary(input),
    buildAdditivesAndPreservativesSummary(allMatches, ingredientListAvailable),
  ];

  return sortCategorySummaries(summaries);
}

export function applyIngredientCategoryRules(
  input: IngredientCategoryRulesInput,
): IngredientCategoryRulesOutput {
  return {
    categorySummaries: summarizeCategoryMatches(input),
  };
}

export function getCategorySeverity(summary: IngredientCategorySummary) {
  return summary.severity;
}

export function getCategoryDisplayMessage(summary: IngredientCategorySummary) {
  return summary.shortMessage;
}
