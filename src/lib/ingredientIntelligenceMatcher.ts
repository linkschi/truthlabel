import { allergenAliases } from "@/data/allergenAliases";
import { allergyRiskDataPack } from "@/data/ingredientIntelligence/allergyRisk";
import {
  artificialEngineeredFoodConstructionGroups,
} from "@/data/ingredientIntelligence/artificialEngineeredFoodConstruction";
import { artificialSweetenersDataPack } from "@/data/ingredientIntelligence/artificialSweetenersSugarSubstitutes";
import { bannedRestrictedItems } from "@/data/ingredientIntelligence/bannedRestrictedItems";
import { brandTrustSafetyRecallsLawsuitsDataPack } from "@/data/ingredientIntelligence/brandTrustSafetyRecallsLawsuits";
import { cancerLinkedWatchDataPack } from "@/data/ingredientIntelligence/cancerLinkedWatch";
import { emulsifiersStabilisersGumsDataPack } from "@/data/ingredientIntelligence/emulsifiersStabilisersGums";
import { isExternalSafetySignal } from "@/lib/externalSafety/externalSafetyTypes";
import { flavourEnhancersFlavouringsDataPack } from "@/data/ingredientIntelligence/flavourEnhancersFlavourings";
import { fryOilFastFoodOilDataPack } from "@/data/ingredientIntelligence/fryOilFastFoodOil";
import { harmfulAdditivesDataPack } from "@/data/ingredientIntelligence/harmfulAdditives";
import { heavyMetalsDataPack } from "@/data/ingredientIntelligence/heavyMetals";
import { hydrogenatedPartiallyHydrogenatedOilsDataPack } from "@/data/ingredientIntelligence/hydrogenatedPartiallyHydrogenatedOils";
import { meatSpecificConcernsDataPack } from "@/data/ingredientIntelligence/meatSpecificConcerns";
import { microplasticsDataPack } from "@/data/ingredientIntelligence/microplastics";
import { naturalPositiveIngredientsDataPack } from "@/data/ingredientIntelligence/naturalPositiveIngredients";
import { preservativesShelfLifeSystemsDataPack } from "@/data/ingredientIntelligence/preservativesShelfLifeSystems";
import { seedOilsProcessedOilsDataPack } from "@/data/ingredientIntelligence/seedOilsProcessedOils";
import { ultraProcessedIndicatorsDataPack } from "@/data/ingredientIntelligence/ultraProcessedIndicators";
import { unknownReviewIngredientsDataPack } from "@/data/ingredientIntelligence/unknownReviewIngredients";
import { mergedArtificialColours } from "@/lib/ingredientIntelligence/artificialColours";

type MatcherSeverity = "green" | "yellow" | "red";
type IngredientGroupKey =
  | "natural_positive"
  | "processed_artificial"
  | "unknown_review";
type EvidenceType =
  | "ingredient_label"
  | "product_category"
  | "packaging_marker"
  | "external_dataset"
  | "user_profile";
type SourceKind =
  | "ingredient"
  | "product_name"
  | "brand_name"
  | "product_category"
  | "packaging"
  | "allergen_statement"
  | "external_signal";
type PackMatchProfile =
  | "ingredient_only"
  | "ingredient_plus_product"
  | "ingredient_plus_product_and_packaging"
  | "allergy"
  | "external";
type CanonicalStrategy =
  | "duplicate_group"
  | "canonical_or_item"
  | "item_id"
  | "matched_term"
  | "allergen_group"
  | "signal_id"
  | "external_mixed";

type AnyItem = Record<string, unknown>;
type ExternalSignalInput = string | Record<string, unknown>;

type PackDefinition = {
  categoryId: string;
  categoryName: string;
  sourcePackId: string;
  items: readonly AnyItem[];
  matchProfile: PackMatchProfile;
  canonicalStrategy: CanonicalStrategy;
  ingredientGroup: IngredientGroupKey | null;
};

type PreparedPackItem = {
  pack: PackDefinition;
  item: AnyItem;
  itemId: string;
  displayName: string;
  searchTerms: SearchTerm[];
  basicSeveritySuggestion: MatcherSeverity;
  userFacingReason: string;
  dataStatus: string | null;
  confidenceLevel: string | null;
  linkedExistingPackIds: string[];
  allergenGroup: string | null;
  ingredientGroup: string | null;
  detectionBasis: string | null;
  requiresProductEvidence: boolean;
};

type SearchTerm = {
  raw: string;
  normalized: string;
};

type PreparedSource = {
  kind: SourceKind;
  original: string;
  normalized: string;
};

type RawItemMatch = {
  canonicalIngredientId: string;
  displayName: string;
  originalIngredientText: string;
  matchedTerms: string[];
  matchedCategories: string[];
  sourcePacks: string[];
  basicSeveritySuggestion: MatcherSeverity;
  userFacingReason: string;
  dataStatus: string | null;
  confidenceLevel: string | null;
  linkedExistingPackIds: string[];
  evidenceType: EvidenceType;
  duplicateSafe: true;
  sourceKind: SourceKind;
  categoryId: string;
  categoryName: string;
  canAdoptSpecificCanonical: boolean;
};

export type IngredientIntelligenceMatcherInput = {
  ingredients: string[];
  productName?: string;
  brandName?: string;
  productCategory?: string;
  packagingText?: string;
  allergenStatement?: string;
  userAllergyProfile?: string[];
  externalSignals?: ExternalSignalInput[];
};

export type IngredientIntelligenceMatch = {
  canonicalIngredientId: string;
  displayName: string;
  originalIngredientText: string;
  matchedTerm: string;
  matchedAliases: string[];
  matchedCategories: string[];
  sourcePacks: string[];
  basicSeveritySuggestion: MatcherSeverity;
  highestSeveritySuggestion: MatcherSeverity;
  userFacingReason: string;
  dataStatus: string | null;
  confidenceLevel: string | null;
  linkedExistingPackIds: string[];
  evidenceType: EvidenceType;
  duplicateSafe: true;
};

export type IngredientIntelligenceDuplicateSafeMatch =
  IngredientIntelligenceMatch & {
    originalIngredientTexts: string[];
  };

export type IngredientIntelligenceCategorySummary = {
  categoryId: string;
  categoryName: string;
  matches: IngredientIntelligenceDuplicateSafeMatch[];
  matchCount: number;
  highestSeveritySuggestion: MatcherSeverity;
  evidenceTypes: EvidenceType[];
  dataStatusSummary: string;
  displayAllowed: true;
};

export type IngredientIntelligenceMatcherOutput = {
  matchedIngredients: IngredientIntelligenceMatch[];
  matchedCategories: IngredientIntelligenceCategorySummary[];
  unmatchedIngredients: string[];
  ingredientGroups: Record<
    IngredientGroupKey,
    IngredientIntelligenceMatch[]
  >;
  duplicateSafeMatches: IngredientIntelligenceDuplicateSafeMatch[];
  debug?: {
    sourceCount: number;
    rawMatchCount: number;
    categoryCount: number;
    normalizedProfileGroups: string[];
  };
};

const severityRank: Record<MatcherSeverity, number> = {
  green: 0,
  yellow: 1,
  red: 2,
};

const confidenceRank: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const exactFalsePositivePhrasesByTerm: Record<string, string[]> = {
  milk: ["milk thistle"],
  egg: ["eggplant"],
  nut: ["nutritional yeast"],
  chicken: ["chicken flavor", "chicken flavour"],
  beef: ["beef flavor", "beef flavour"],
  fruit: ["fruit flavor", "fruit flavour"],
  fried: ["not fried", "not deep fried", "baked not fried", "air fried"],
  "deep fried": [
    "not fried",
    "not deep fried",
    "baked not fried",
    "air fried",
  ],
  starch: ["modified starch", "modified food starch", "modified vegetable starch"],
};

const freeFromSensitiveTerms = new Set([
  "soy",
  "gluten",
  "dairy",
  "milk",
  "peanut",
  "peanuts",
  "oil",
  "egg",
  "eggs",
  "nuts",
  "sesame",
  "fish",
  "shellfish",
  "wheat",
]);

const packDefinitions: PackDefinition[] = [
  {
    categoryId: "artificial_colours",
    categoryName: "Artificial Colours",
    sourcePackId: "artificial_colours",
    items: mergedArtificialColours as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "duplicate_group",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: "banned_restricted_items",
    categoryName: "Banned / Restricted Items",
    sourcePackId: "banned_restricted_items",
    items: bannedRestrictedItems as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "canonical_or_item",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: "artificial_engineered_food_construction",
    categoryName: "Artificial / Engineered Food Construction",
    sourcePackId: "artificial_engineered_food_construction",
    items: artificialEngineeredFoodConstructionGroups as unknown as AnyItem[],
    matchProfile: "ingredient_plus_product",
    canonicalStrategy: "matched_term",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: artificialSweetenersDataPack.id,
    categoryName: artificialSweetenersDataPack.categoryName,
    sourcePackId: artificialSweetenersDataPack.id,
    items: artificialSweetenersDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "item_id",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: emulsifiersStabilisersGumsDataPack.id,
    categoryName: emulsifiersStabilisersGumsDataPack.categoryName,
    sourcePackId: emulsifiersStabilisersGumsDataPack.id,
    items: emulsifiersStabilisersGumsDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "item_id",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: flavourEnhancersFlavouringsDataPack.id,
    categoryName: flavourEnhancersFlavouringsDataPack.categoryName,
    sourcePackId: flavourEnhancersFlavouringsDataPack.id,
    items: flavourEnhancersFlavouringsDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "item_id",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: hydrogenatedPartiallyHydrogenatedOilsDataPack.id,
    categoryName: hydrogenatedPartiallyHydrogenatedOilsDataPack.categoryName,
    sourcePackId: hydrogenatedPartiallyHydrogenatedOilsDataPack.id,
    items:
      hydrogenatedPartiallyHydrogenatedOilsDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "canonical_or_item",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: preservativesShelfLifeSystemsDataPack.id,
    categoryName: preservativesShelfLifeSystemsDataPack.categoryName,
    sourcePackId: preservativesShelfLifeSystemsDataPack.id,
    items: preservativesShelfLifeSystemsDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "item_id",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: seedOilsProcessedOilsDataPack.id,
    categoryName: seedOilsProcessedOilsDataPack.categoryName,
    sourcePackId: seedOilsProcessedOilsDataPack.id,
    items: seedOilsProcessedOilsDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "item_id",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: harmfulAdditivesDataPack.id,
    categoryName: harmfulAdditivesDataPack.categoryName,
    sourcePackId: harmfulAdditivesDataPack.id,
    items: harmfulAdditivesDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "canonical_or_item",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: cancerLinkedWatchDataPack.id,
    categoryName: cancerLinkedWatchDataPack.categoryName,
    sourcePackId: cancerLinkedWatchDataPack.id,
    items: cancerLinkedWatchDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "canonical_or_item",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: allergyRiskDataPack.id,
    categoryName: allergyRiskDataPack.categoryName,
    sourcePackId: allergyRiskDataPack.id,
    items: allergyRiskDataPack.items as unknown as AnyItem[],
    matchProfile: "allergy",
    canonicalStrategy: "allergen_group",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: naturalPositiveIngredientsDataPack.id,
    categoryName: naturalPositiveIngredientsDataPack.categoryName,
    sourcePackId: naturalPositiveIngredientsDataPack.id,
    items: naturalPositiveIngredientsDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "matched_term",
    ingredientGroup: "natural_positive",
  },
  {
    categoryId: unknownReviewIngredientsDataPack.id,
    categoryName: unknownReviewIngredientsDataPack.categoryName,
    sourcePackId: unknownReviewIngredientsDataPack.id,
    items: unknownReviewIngredientsDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "matched_term",
    ingredientGroup: "unknown_review",
  },
  {
    categoryId: ultraProcessedIndicatorsDataPack.id,
    categoryName: ultraProcessedIndicatorsDataPack.categoryName,
    sourcePackId: ultraProcessedIndicatorsDataPack.id,
    items: ultraProcessedIndicatorsDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_only",
    canonicalStrategy: "matched_term",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: meatSpecificConcernsDataPack.id,
    categoryName: meatSpecificConcernsDataPack.categoryName,
    sourcePackId: meatSpecificConcernsDataPack.id,
    items: meatSpecificConcernsDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_plus_product",
    canonicalStrategy: "matched_term",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: fryOilFastFoodOilDataPack.id,
    categoryName: fryOilFastFoodOilDataPack.categoryName,
    sourcePackId: fryOilFastFoodOilDataPack.id,
    items: fryOilFastFoodOilDataPack.items as unknown as AnyItem[],
    matchProfile: "ingredient_plus_product_and_packaging",
    canonicalStrategy: "matched_term",
    ingredientGroup: "processed_artificial",
  },
  {
    categoryId: heavyMetalsDataPack.id,
    categoryName: heavyMetalsDataPack.categoryName,
    sourcePackId: heavyMetalsDataPack.id,
    items: heavyMetalsDataPack.items as unknown as AnyItem[],
    matchProfile: "external",
    canonicalStrategy: "external_mixed",
    ingredientGroup: null,
  },
  {
    categoryId: microplasticsDataPack.id,
    categoryName: microplasticsDataPack.categoryName,
    sourcePackId: microplasticsDataPack.id,
    items: microplasticsDataPack.items as unknown as AnyItem[],
    matchProfile: "external",
    canonicalStrategy: "external_mixed",
    ingredientGroup: null,
  },
  {
    categoryId: brandTrustSafetyRecallsLawsuitsDataPack.id,
    categoryName: brandTrustSafetyRecallsLawsuitsDataPack.categoryName,
    sourcePackId: brandTrustSafetyRecallsLawsuitsDataPack.id,
    items:
      brandTrustSafetyRecallsLawsuitsDataPack.items as unknown as AnyItem[],
    matchProfile: "external",
    canonicalStrategy: "signal_id",
    ingredientGroup: null,
  },
];

const allergyProfileTermsByGroup = buildAllergyProfileTermsByGroup();

const preparedPackItems: PreparedPackItem[] = packDefinitions.flatMap((pack) =>
  pack.items.map((item) => preparePackItem(pack, item)),
);

function normalizeSubscriptDigits(value: string) {
  return value
    .replace(/\u2080/g, "0")
    .replace(/\u2081/g, "1")
    .replace(/\u2082/g, "2")
    .replace(/\u2083/g, "3")
    .replace(/\u2084/g, "4")
    .replace(/\u2085/g, "5")
    .replace(/\u2086/g, "6")
    .replace(/\u2087/g, "7")
    .replace(/\u2088/g, "8")
    .replace(/\u2089/g, "9");
}

export function normalizeIngredientIntelligenceText(value: string) {
  return normalizeSubscriptDigits(value)
    .toLowerCase()
    .replace(/[\u2018\u2019'`]/g, "")
    .replace(/\u03b1/g, "alpha")
    .replace(/\u03b2/g, "beta")
    .replace(/â€™/g, "")
    .replace(/&/g, " and ")
    .replace(/\bc\.?\s*i\.?\b/g, "ci")
    .replace(/\bfd\s*(?:and)?\s*c\b/g, "fdc")
    .replace(/\be\s*-\s*(\d+[a-z]?)\b/g, " e$1 ")
    .replace(/\be\s+(\d+[a-z]?)\b/g, " e$1 ")
    .replace(/\bins(?:\s*no\.?)?\s*-\s*(\d+[a-z]?)\b/g, " ins$1 ")
    .replace(/\bins(?:\s*no\.?)?\s+(\d+[a-z]?)\b/g, " ins$1 ")
    .replace(/colour/g, "color")
    .replace(/flavour/g, "flavor")
    .replace(/flavoured/g, "flavored")
    .replace(/stabiliser/g, "stabilizer")
    .replace(/sulphite/g, "sulfite")
    .replace(/sulphur/g, "sulfur")
    .replace(/sulphate/g, "sulfate")
    .replace(/hydrolysed/g, "hydrolyzed")
    .replace(/yoghurt/g, "yogurt")
    .replace(/soya/g, "soy")
    .replace(/maize/g, "corn")
    .replace(/saltpetre/g, "saltpeter")
    .replace(/deep[\s-]*fried/g, "deep fried")
    .replace(/high[\s-]*oleic/g, "high oleic")
    .replace(/micro[\s-]*plastic/g, "microplastic")
    .replace(/nano[\s-]*plastic/g, "nanoplastic")
    .replace(/[()[\]{}]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toCanonicalSlug(value: string) {
  return normalizeIngredientIntelligenceText(value).replace(/\s+/g, "_");
}

function humanizeIdentifier(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toMatcherSeverity(value: unknown): MatcherSeverity {
  if (value === "red" || value === "yellow" || value === "green") {
    return value;
  }

  if (value === "neutral") {
    return "yellow";
  }

  return "yellow";
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function getStringArray(item: AnyItem, key: string) {
  return asStringArray(item[key]);
}

function getItemDisplayName(item: AnyItem) {
  return (
    asString(item.mainName) ??
    asString(item.canonicalName) ??
    asString(item.groupName) ??
    humanizeIdentifier(asString(item.id) ?? "unknown")
  );
}

function getItemDataStatus(item: AnyItem) {
  return (
    asString(item.dataStatus) ??
    asString(item.evidenceStatus) ??
    asString(item.healthConcernType) ??
    null
  );
}

function getLinkedExistingPackIds(item: AnyItem) {
  const linkedIngredientId = asString(item.linkedIngredientId);

  return uniqueStrings(
    asStringArray(item.linkedExistingPackIds).concat(
      linkedIngredientId ? [linkedIngredientId] : [],
    ),
  );
}

function buildSearchTerms(item: AnyItem, pack: PackDefinition) {
  const values = new Set<string>();
  const pushValue = (entry: string | null) => {
    if (!entry) {
      return;
    }

    values.add(entry);
  };

  const pushValues = (entries: string[]) => {
    entries.forEach((entry) => pushValue(entry));
  };

  pushValue(asString(item.id)?.replace(/[_-]+/g, " ") ?? null);
  pushValue(asString(item.mainName));
  pushValue(asString(item.canonicalName));
  pushValue(asString(item.groupName));
  pushValues(getStringArray(item, "aliases"));
  pushValues(getStringArray(item, "markers"));
  pushValues(getStringArray(item, "otherNames"));
  pushValues(getStringArray(item, "chemicalNames"));
  pushValues(getStringArray(item, "brandNames"));
  pushValues(getStringArray(item, "abbreviations"));
  pushValues(getStringArray(item, "labelVariants"));
  getStringArray(item, "spellingVariants")
    .filter((entry) => /\s|\d/.test(normalizeIngredientIntelligenceText(entry)))
    .forEach((entry) => pushValue(entry));
  pushValues(getStringArray(item, "regionalNames"));
  pushValues(getStringArray(item, "eNumberVariants"));

  getStringArray(item, "eNumbers").forEach((entry) => {
    pushValue(entry);
    const normalizedEntry = normalizeIngredientIntelligenceText(entry);
    if (/^\d+[a-z]?$/.test(normalizedEntry)) {
      pushValue(`E${normalizedEntry}`);
    }
  });

  getStringArray(item, "insNumbers").forEach((entry) => {
    pushValue(entry);
    const normalizedEntry = normalizeIngredientIntelligenceText(entry);
    if (/^\d+[a-z]?$/.test(normalizedEntry)) {
      pushValue(`INS ${normalizedEntry}`);
      pushValue(`INS-${normalizedEntry}`);
    }
  });

  if (pack.categoryId === "allergy_risk") {
    const allergenGroup = asString(item.allergenGroup);
    if (allergenGroup && allergyProfileTermsByGroup[allergenGroup]) {
      pushValues(allergyProfileTermsByGroup[allergenGroup]);
    }
  }

  return uniqueStrings([...values])
    .map((raw) => ({
      raw,
      normalized: normalizeIngredientIntelligenceText(raw),
    }))
    .filter((term) => Boolean(term.normalized))
    .sort((left, right) => right.normalized.length - left.normalized.length);
}

function preparePackItem(pack: PackDefinition, item: AnyItem): PreparedPackItem {
  return {
    pack,
    item,
    itemId: asString(item.id) ?? getItemDisplayName(item),
    displayName: getItemDisplayName(item),
    searchTerms: buildSearchTerms(item, pack),
    basicSeveritySuggestion: toMatcherSeverity(
      item.basicSeveritySuggestion ?? item.severity ?? item.severityDefault,
    ),
    userFacingReason: asString(item.userFacingReason) ?? "",
    dataStatus: getItemDataStatus(item),
    confidenceLevel: asString(item.confidenceLevel),
    linkedExistingPackIds: getLinkedExistingPackIds(item),
    allergenGroup: asString(item.allergenGroup),
    ingredientGroup: asString(item.ingredientGroup),
    detectionBasis: asString(item.detectionBasis),
    requiresProductEvidence: item.requiresProductEvidence === true,
  };
}

function buildAllergyProfileTermsByGroup() {
  const groupTerms: Record<string, string[]> = {
    milk: uniqueStrings(["milk", "dairy", ...allergenAliases.Milk]),
    egg: uniqueStrings(["egg", "eggs", ...allergenAliases.Egg]),
    peanut: uniqueStrings(["peanut", "peanuts", ...allergenAliases.Peanuts]),
    tree_nuts: uniqueStrings([
      "tree nut",
      "tree nuts",
      "nuts",
      ...allergenAliases["Tree nuts"],
    ]),
    wheat_gluten: uniqueStrings([
      "wheat",
      "gluten",
      "wheat gluten",
      ...allergenAliases["Wheat / gluten"],
    ]),
    soy: uniqueStrings(["soy", "soya", ...allergenAliases.Soy]),
    fish: uniqueStrings(["fish", ...allergenAliases.Fish]),
    crustacean_shellfish: uniqueStrings([
      "shellfish",
      "shell fish",
      "crustacean",
      "crustaceans",
      ...allergenAliases.Shellfish,
    ]),
    sesame: uniqueStrings(["sesame", ...allergenAliases.Sesame]),
    celery: ["celery"],
    mustard: ["mustard"],
    lupin: ["lupin", "lupine"],
    molluscs: ["mollusc", "molluscs", "mollusk", "mollusks", "shellfish"],
    sulphites_sulfites: ["sulfite", "sulfites", "sulphite", "sulphites"],
  };

  return Object.fromEntries(
    Object.entries(groupTerms).map(([key, values]) => [
      key,
      uniqueStrings(values).map(normalizeIngredientIntelligenceText),
    ]),
  ) as Record<string, string[]>;
}

function normalizeUserAllergyProfile(profile: string[] | undefined) {
  const normalizedGroups = new Set<string>();

  (profile ?? []).forEach((entry) => {
    const normalizedEntry = normalizeIngredientIntelligenceText(entry);

    Object.entries(allergyProfileTermsByGroup).forEach(([group, aliases]) => {
      if (
        normalizedEntry === normalizeIngredientIntelligenceText(group) ||
        aliases.includes(normalizedEntry)
      ) {
        normalizedGroups.add(group);
      }
    });
  });

  return [...normalizedGroups];
}

function flattenExternalSignalInput(value: ExternalSignalInput) {
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
        fragments.push(humanizeIdentifier(key));
        collect(nested);
      });
    }
  };

  collect(value);
  return uniqueStrings(fragments).join(" ");
}

function expandProductCategoryText(value: string) {
  const normalized = normalizeIngredientIntelligenceText(value);
  const expansions = [value];

  if (
    normalized.includes("baby") ||
    normalized.includes("kid") ||
    normalized.includes("kids") ||
    normalized.includes("infant") ||
    normalized.includes("toddler")
  ) {
    expansions.push("baby food infant food toddler food kids food");
  }

  if (
    normalized.includes("drink") ||
    normalized.includes("beverage") ||
    normalized.includes("water")
  ) {
    expansions.push("drink beverage bottled drink bottled beverage");
  }

  if (normalized.includes("meat") || normalized.includes("fast food")) {
    expansions.push("meat fast food fried food processed meat");
  }

  if (normalized.includes("seafood") || normalized.includes("fish")) {
    expansions.push("seafood fish shellfish bivalves");
  }

  if (normalized.includes("dairy") || normalized.includes("egg")) {
    expansions.push("dairy egg");
  }

  return expansions.join(" ");
}

function buildPreparedSources(input: IngredientIntelligenceMatcherInput) {
  const sources: PreparedSource[] = [];

  input.ingredients.forEach((ingredient) => {
    if (!ingredient.trim()) {
      return;
    }

    sources.push({
      kind: "ingredient",
      original: ingredient,
      normalized: normalizeIngredientIntelligenceText(ingredient),
    });
  });

  if (input.productName?.trim()) {
    sources.push({
      kind: "product_name",
      original: input.productName,
      normalized: normalizeIngredientIntelligenceText(input.productName),
    });
  }

  if (input.brandName?.trim()) {
    sources.push({
      kind: "brand_name",
      original: input.brandName,
      normalized: normalizeIngredientIntelligenceText(input.brandName),
    });
  }

  if (input.productCategory?.trim()) {
    const expanded = expandProductCategoryText(input.productCategory);
    sources.push({
      kind: "product_category",
      original: input.productCategory,
      normalized: normalizeIngredientIntelligenceText(expanded),
    });
  }

  if (input.packagingText?.trim()) {
    sources.push({
      kind: "packaging",
      original: input.packagingText,
      normalized: normalizeIngredientIntelligenceText(input.packagingText),
    });
  }

  if (input.allergenStatement?.trim()) {
    sources.push({
      kind: "allergen_statement",
      original: input.allergenStatement,
      normalized: normalizeIngredientIntelligenceText(input.allergenStatement),
    });
  }

  (input.externalSignals ?? []).forEach((signal) => {
    if (isExternalSafetySignal(signal)) {
      return;
    }

    const flattened = flattenExternalSignalInput(signal);

    if (!flattened.trim()) {
      return;
    }

    sources.push({
      kind: "external_signal",
      original: flattened,
      normalized: normalizeIngredientIntelligenceText(flattened),
    });
  });

  return sources.filter((source) => Boolean(source.normalized));
}

function containsWholeNormalizedTerm(value: string, term: string) {
  return ` ${value} `.includes(` ${term} `);
}

function hasFreeFromContext(source: string, term: string) {
  if (!freeFromSensitiveTerms.has(term)) {
    return false;
  }

  return (
    containsWholeNormalizedTerm(source, `${term} free`) ||
    containsWholeNormalizedTerm(source, `free ${term}`) ||
    containsWholeNormalizedTerm(source, `free from ${term}`)
  );
}

function hasCrossContactContext(normalizedSource: string) {
  return [
    "may contain",
    "traces of",
    "may contain traces",
    "shared equipment",
    "same equipment",
    "same facility",
    "same factory",
    "shared fryer",
    "shared oil",
  ].some((term) => containsWholeNormalizedTerm(normalizedSource, term));
}

function shouldBlockTermMatch(
  prepared: PreparedPackItem,
  source: PreparedSource,
  term: SearchTerm,
) {
  const normalizedSource = source.normalized;
  const normalizedTerm = term.normalized;

  if (!normalizedTerm || !normalizedSource) {
    return true;
  }

  if (hasFreeFromContext(normalizedSource, normalizedTerm)) {
    return true;
  }

  const blockedPhrases = exactFalsePositivePhrasesByTerm[normalizedTerm] ?? [];
  if (
    blockedPhrases.some((phrase) =>
      containsWholeNormalizedTerm(
        normalizedSource,
        normalizeIngredientIntelligenceText(phrase),
      ),
    )
  ) {
    return true;
  }

  if (
    prepared.pack.categoryId === "natural_positive" &&
    normalizedTerm === "fruit" &&
    (containsWholeNormalizedTerm(normalizedSource, "fruit flavor") ||
      containsWholeNormalizedTerm(normalizedSource, "fruit flavour"))
  ) {
    return true;
  }

  if (
    prepared.pack.categoryId === "natural_positive" &&
    normalizedTerm === "vegetable" &&
    containsWholeNormalizedTerm(normalizedSource, "vegetable oil")
  ) {
    return true;
  }

  if (
    prepared.pack.categoryId === "allergy_risk" &&
    prepared.itemId === "wheat_gluten_cereals" &&
    source.kind === "ingredient" &&
    (normalizedTerm === "oats" || normalizedTerm === "oat flour")
  ) {
    return true;
  }

  if (
    prepared.pack.categoryId === "allergy_risk" &&
    prepared.itemId === "wheat_gluten_cereals" &&
    containsWholeNormalizedTerm(normalizedSource, "gluten free") &&
    (normalizedTerm === "oats" || normalizedTerm === "oat flour")
  ) {
    return true;
  }

  if (
    prepared.pack.categoryId === "microplastics" &&
    prepared.itemId === "salt_microplastic_review_marker" &&
    source.kind === "ingredient"
  ) {
    return true;
  }

  if (
    prepared.pack.categoryId === "hydrogenated_partially_hydrogenated_oils" &&
    containsWholeNormalizedTerm(normalizedSource, "partially hydrogenated") &&
    normalizedTerm.includes("hydrogenated") &&
    !normalizedTerm.includes("partially hydrogenated")
  ) {
    return true;
  }

  return false;
}

function resolveEvidenceType(
  prepared: PreparedPackItem,
  source: PreparedSource,
  userProfileMatched: boolean,
): EvidenceType {
  if (userProfileMatched) {
    return "user_profile";
  }

  if (
    prepared.pack.categoryId === "heavy_metals" ||
    prepared.pack.categoryId === "microplastics" ||
    prepared.pack.categoryId === "brand_trust_safety"
  ) {
    if (source.kind === "product_category" || source.kind === "product_name") {
      return "product_category";
    }

    if (source.kind === "packaging") {
      return "packaging_marker";
    }

    return "external_dataset";
  }

  return "ingredient_label";
}

function getSourcesForPreparedItem(
  prepared: PreparedPackItem,
  sources: PreparedSource[],
) {
  const byKind = (kind: SourceKind) =>
    sources.filter((source) => source.kind === kind);

  switch (prepared.pack.matchProfile) {
    case "ingredient_only":
      return byKind("ingredient");
    case "ingredient_plus_product":
      return [
        ...byKind("ingredient"),
        ...byKind("product_name"),
        ...byKind("product_category"),
      ];
    case "ingredient_plus_product_and_packaging":
      return [
        ...byKind("ingredient"),
        ...byKind("product_name"),
        ...byKind("product_category"),
        ...byKind("packaging"),
      ];
    case "allergy":
      return [...byKind("ingredient"), ...byKind("allergen_statement")];
    case "external": {
      if (prepared.requiresProductEvidence) {
        return byKind("external_signal");
      }

      switch (prepared.detectionBasis) {
        case "ingredient_marker":
          return byKind("ingredient");
        case "product_category_marker":
          return [
            ...byKind("ingredient"),
            ...byKind("product_name"),
            ...byKind("product_category"),
          ];
        case "packaging_marker":
          return [...byKind("packaging"), ...byKind("product_name")];
        case "external_dataset":
        case "official_testing_data":
        case "recall_data":
        case "brand_lab_data":
        case "official_database":
        case "barcode_match":
        case "brand_product_match":
        case "manual_review":
          return [
            ...byKind("external_signal"),
            ...byKind("product_name"),
            ...byKind("brand_name"),
          ];
        default:
          return [];
      }
    }
  }
}

function pickStrongestTerm(terms: string[]) {
  return [...terms].sort((left, right) => {
    const leftCodeLike = /^(e\d+[a-z]?|ins\d+[a-z]?)$/.test(left) ? 0 : 1;
    const rightCodeLike = /^(e\d+[a-z]?|ins\d+[a-z]?)$/.test(right) ? 0 : 1;

    if (leftCodeLike !== rightCodeLike) {
      return rightCodeLike - leftCodeLike;
    }

    return right.length - left.length;
  })[0];
}

function buildCanonicalIngredientId(
  prepared: PreparedPackItem,
  matchedTerms: string[],
) {
  const strongestTerm = pickStrongestTerm(matchedTerms);
  const canonicalIngredientId = asString(prepared.item.canonicalIngredientId);
  const linkedIngredientId = asString(prepared.item.linkedIngredientId);
  const duplicateGroupId = asString(prepared.item.duplicateGroupId);

  switch (prepared.pack.canonicalStrategy) {
    case "duplicate_group":
      return duplicateGroupId ?? canonicalIngredientId ?? prepared.itemId;
    case "canonical_or_item":
      return canonicalIngredientId ?? linkedIngredientId ?? prepared.itemId;
    case "item_id":
      return prepared.itemId;
    case "matched_term":
      return toCanonicalSlug(strongestTerm);
    case "allergen_group":
      return prepared.allergenGroup
        ? `allergy_${prepared.allergenGroup}`
        : toCanonicalSlug(strongestTerm);
    case "signal_id":
      return prepared.itemId;
    case "external_mixed":
      if (prepared.detectionBasis === "ingredient_marker") {
        return toCanonicalSlug(strongestTerm);
      }

      return prepared.itemId;
  }
}

function resolveDisplayName(prepared: PreparedPackItem, matchedTerms: string[]) {
  if (prepared.pack.canonicalStrategy === "matched_term") {
    return humanizeIdentifier(pickStrongestTerm(matchedTerms));
  }

  return prepared.displayName;
}

function chooseHigherSeverity(left: MatcherSeverity, right: MatcherSeverity) {
  return severityRank[left] >= severityRank[right] ? left : right;
}

function choosePreferredMatch(
  current: RawItemMatch | undefined,
  candidate: RawItemMatch,
) {
  if (!current) {
    return candidate;
  }

  if (
    severityRank[candidate.basicSeveritySuggestion] !==
    severityRank[current.basicSeveritySuggestion]
  ) {
    return severityRank[candidate.basicSeveritySuggestion] >
      severityRank[current.basicSeveritySuggestion]
      ? candidate
      : current;
  }

  const currentConfidence = confidenceRank[current.confidenceLevel ?? ""] ?? 0;
  const candidateConfidence = confidenceRank[candidate.confidenceLevel ?? ""] ?? 0;
  if (candidateConfidence !== currentConfidence) {
    return candidateConfidence > currentConfidence ? candidate : current;
  }

  return candidate.displayName.length > current.displayName.length
    ? candidate
    : current;
}

function buildRawMatches(
  input: IngredientIntelligenceMatcherInput,
  sources: PreparedSource[],
  normalizedProfileGroups: string[],
) {
  const rawMatches: RawItemMatch[] = [];

  preparedPackItems.forEach((prepared) => {
    const eligibleSources = getSourcesForPreparedItem(prepared, sources);

    eligibleSources.forEach((source) => {
      if (!source.normalized) {
        return;
      }

      const matchedTerms = prepared.searchTerms
        .filter((term) => containsWholeNormalizedTerm(source.normalized, term.normalized))
        .filter((term) => !shouldBlockTermMatch(prepared, source, term))
        .map((term) => term.raw);

      if (matchedTerms.length === 0) {
        return;
      }

      const userProfileMatched =
        prepared.pack.categoryId === "allergy_risk" &&
        Boolean(prepared.allergenGroup) &&
        normalizedProfileGroups.includes(prepared.allergenGroup!);
      const isAllergyMatch = prepared.pack.categoryId === "allergy_risk";
      const isAllergenWarningStatement =
        isAllergyMatch &&
        (prepared.itemId === "allergen_warning_statement" ||
          prepared.allergenGroup === "label_warning");
      const isCrossContactProfileMatch =
        isAllergyMatch &&
        userProfileMatched &&
        source.kind === "allergen_statement" &&
        hasCrossContactContext(source.normalized);
      const isDirectProfileMatch = userProfileMatched && !isCrossContactProfileMatch;

      const severity = isAllergyMatch
        ? isDirectProfileMatch
          ? "red"
          : isAllergenWarningStatement || isCrossContactProfileMatch
            ? "yellow"
            : "green"
        : prepared.basicSeveritySuggestion;

      rawMatches.push({
        canonicalIngredientId: buildCanonicalIngredientId(
          prepared,
          matchedTerms,
        ),
        displayName: resolveDisplayName(prepared, matchedTerms),
        originalIngredientText: source.original,
        matchedTerms: uniqueStrings(matchedTerms),
        matchedCategories: [prepared.pack.categoryName],
        sourcePacks: [prepared.pack.sourcePackId],
        basicSeveritySuggestion: severity,
        userFacingReason: prepared.userFacingReason,
        dataStatus: prepared.dataStatus,
        confidenceLevel: prepared.confidenceLevel,
        linkedExistingPackIds: prepared.linkedExistingPackIds,
        evidenceType: resolveEvidenceType(prepared, source, isDirectProfileMatch),
        duplicateSafe: true,
        sourceKind: source.kind,
        categoryId: prepared.pack.categoryId,
        categoryName: prepared.pack.categoryName,
        canAdoptSpecificCanonical:
          prepared.pack.canonicalStrategy === "matched_term" ||
          prepared.pack.canonicalStrategy === "external_mixed",
      });
    });
  });

  return coalesceBroadCanonicalMatches(
    removeGenericAllergenStatementDuplicates(rawMatches),
  );
}

function removeGenericAllergenStatementDuplicates(matches: RawItemMatch[]) {
  const specificAllergySources = new Set(
    matches
      .filter(
        (match) =>
          match.categoryId === "allergy_risk" &&
          match.canonicalIngredientId !== "allergy_label_warning" &&
          match.sourceKind === "allergen_statement",
      )
      .map((match) => match.originalIngredientText),
  );

  return matches.filter((match) => {
    if (match.categoryId !== "allergy_risk") {
      return true;
    }

    if (match.canonicalIngredientId !== "allergy_label_warning") {
      return true;
    }

    return !specificAllergySources.has(match.originalIngredientText);
  });
}

function coalesceBroadCanonicalMatches(matches: RawItemMatch[]) {
  const specificCanonicalBySourceAndTerm = new Map<string, string>();

  matches
    .filter((match) => !match.canAdoptSpecificCanonical)
    .forEach((match) => {
      match.matchedTerms.forEach((term) => {
        specificCanonicalBySourceAndTerm.set(
          `${normalizeIngredientIntelligenceText(match.originalIngredientText)}::${normalizeIngredientIntelligenceText(term)}`,
          match.canonicalIngredientId,
        );
      });
    });

  return matches.map((match) => {
    if (!match.canAdoptSpecificCanonical) {
      return match;
    }

    const adoptedCanonicalIds = uniqueStrings(
      match.matchedTerms
        .map((term) =>
          specificCanonicalBySourceAndTerm.get(
            `${normalizeIngredientIntelligenceText(match.originalIngredientText)}::${normalizeIngredientIntelligenceText(term)}`,
          ),
        )
        .filter((value): value is string => Boolean(value)),
    );

    if (adoptedCanonicalIds.length !== 1) {
      return match;
    }

    return {
      ...match,
      canonicalIngredientId: adoptedCanonicalIds[0],
    };
  });
}

function aggregateMatchesByOriginalText(matches: RawItemMatch[]) {
  const grouped = new Map<string, RawItemMatch[]>();

  matches.forEach((match) => {
    const key = `${match.originalIngredientText}::${match.canonicalIngredientId}`;
    grouped.set(key, [...(grouped.get(key) ?? []), match]);
  });

  return [...grouped.values()].map((group) => {
    const representative = group.reduce((best, current) =>
      choosePreferredMatch(best, current),
    );
    const matchedAliases = uniqueStrings(group.flatMap((match) => match.matchedTerms));
    const matchedCategories = uniqueStrings(
      group.flatMap((match) => match.matchedCategories),
    ).sort();
    const sourcePacks = uniqueStrings(group.flatMap((match) => match.sourcePacks)).sort();
    const linkedExistingPackIds = uniqueStrings(
      group.flatMap((match) => match.linkedExistingPackIds),
    ).sort();
    const highestSeveritySuggestion = group.reduce(
      (highest, match) =>
        chooseHigherSeverity(highest, match.basicSeveritySuggestion),
      representative.basicSeveritySuggestion,
    );

    return {
      canonicalIngredientId: representative.canonicalIngredientId,
      displayName: representative.displayName,
      originalIngredientText: representative.originalIngredientText,
      matchedTerm: humanizeIdentifier(pickStrongestTerm(matchedAliases)),
      matchedAliases,
      matchedCategories,
      sourcePacks,
      basicSeveritySuggestion: highestSeveritySuggestion,
      highestSeveritySuggestion,
      userFacingReason: representative.userFacingReason,
      dataStatus: representative.dataStatus,
      confidenceLevel: representative.confidenceLevel,
      linkedExistingPackIds,
      evidenceType: representative.evidenceType,
      duplicateSafe: true as const,
    } satisfies IngredientIntelligenceMatch;
  });
}

function aggregateDuplicateSafeMatches(matches: IngredientIntelligenceMatch[]) {
  const grouped = new Map<string, IngredientIntelligenceMatch[]>();

  matches.forEach((match) => {
    grouped.set(match.canonicalIngredientId, [
      ...(grouped.get(match.canonicalIngredientId) ?? []),
      match,
    ]);
  });

  return [...grouped.values()].map((group) => {
    const representative = group.reduce((best, current) => {
      if (!best) {
        return current;
      }

      if (
        severityRank[current.basicSeveritySuggestion] !==
        severityRank[best.basicSeveritySuggestion]
      ) {
        return severityRank[current.basicSeveritySuggestion] >
          severityRank[best.basicSeveritySuggestion]
          ? current
          : best;
      }

      return current.displayName.length > best.displayName.length ? current : best;
    });

    const matchedAliases = uniqueStrings(group.flatMap((match) => match.matchedAliases));
    const matchedCategories = uniqueStrings(
      group.flatMap((match) => match.matchedCategories),
    ).sort();
    const sourcePacks = uniqueStrings(group.flatMap((match) => match.sourcePacks)).sort();
    const originalIngredientTexts = uniqueStrings(
      group.map((match) => match.originalIngredientText),
    );
    const linkedExistingPackIds = uniqueStrings(
      group.flatMap((match) => match.linkedExistingPackIds),
    ).sort();
    const highestSeveritySuggestion = group.reduce(
      (highest, match) =>
        chooseHigherSeverity(highest, match.basicSeveritySuggestion),
      representative.basicSeveritySuggestion,
    );

    return {
      canonicalIngredientId: representative.canonicalIngredientId,
      displayName: representative.displayName,
      originalIngredientText: representative.originalIngredientText,
      originalIngredientTexts,
      matchedTerm: representative.matchedTerm,
      matchedAliases,
      matchedCategories,
      sourcePacks,
      basicSeveritySuggestion: highestSeveritySuggestion,
      highestSeveritySuggestion,
      userFacingReason: representative.userFacingReason,
      dataStatus: representative.dataStatus,
      confidenceLevel: representative.confidenceLevel,
      linkedExistingPackIds,
      evidenceType: representative.evidenceType,
      duplicateSafe: true as const,
    } satisfies IngredientIntelligenceDuplicateSafeMatch;
  });
}

function buildCategorySummaries(
  duplicateSafeMatches: IngredientIntelligenceDuplicateSafeMatch[],
) {
  const summaries = new Map<string, IngredientIntelligenceCategorySummary>();

  duplicateSafeMatches.forEach((match) => {
    match.matchedCategories.forEach((categoryName) => {
      const categoryId =
        packDefinitions.find((pack) => pack.categoryName === categoryName)?.categoryId ??
        toCanonicalSlug(categoryName);
      const current = summaries.get(categoryId);
      const nextMatches = [...(current?.matches ?? []), match];
      const evidenceTypes = uniqueStrings(
        nextMatches.map((entry) => entry.evidenceType),
      ) as EvidenceType[];
      const dataStatusSummary = uniqueStrings(
        nextMatches
          .map((entry) => entry.dataStatus)
          .filter((entry): entry is string => Boolean(entry)),
      ).join(", ");
      const highestSeveritySuggestion = nextMatches.reduce(
        (highest, entry) =>
          chooseHigherSeverity(highest, entry.basicSeveritySuggestion),
        nextMatches[0].basicSeveritySuggestion,
      );

      summaries.set(categoryId, {
        categoryId,
        categoryName,
        matches: nextMatches,
        matchCount: nextMatches.length,
        highestSeveritySuggestion,
        evidenceTypes,
        dataStatusSummary,
        displayAllowed: true,
      });
    });
  });

  return [...summaries.values()].sort((left, right) => {
    const severityDelta =
      severityRank[right.highestSeveritySuggestion] -
      severityRank[left.highestSeveritySuggestion];

    if (severityDelta !== 0) {
      return severityDelta;
    }

    return left.categoryName.localeCompare(right.categoryName);
  });
}

function buildIngredientGroups(matches: IngredientIntelligenceMatch[]) {
  const groupedByIngredient = new Map<string, IngredientIntelligenceMatch[]>();

  matches
    .filter((match) => match.evidenceType === "ingredient_label" || match.evidenceType === "user_profile")
    .forEach((match) => {
      groupedByIngredient.set(match.originalIngredientText, [
        ...(groupedByIngredient.get(match.originalIngredientText) ?? []),
        match,
      ]);
    });

  const groups: Record<IngredientGroupKey, IngredientIntelligenceMatch[]> = {
    natural_positive: [],
    processed_artificial: [],
    unknown_review: [],
  };

  groupedByIngredient.forEach((ingredientMatches) => {
    const sourcePackIds = ingredientMatches.flatMap((match) => match.sourcePacks);
    const processingSourcePackIds = sourcePackIds.filter(
      (packId) =>
        packId !== "natural_positive" &&
        packId !== "unknown_review" &&
        packId !== "allergy_risk",
    );
    const bucket: IngredientGroupKey = processingSourcePackIds.length > 0
      ? "processed_artificial"
      : sourcePackIds.includes("unknown_review")
        ? "unknown_review"
        : "natural_positive";
    const representative = ingredientMatches.reduce((best, current) => {
      if (!best) {
        return current;
      }

      if (
        severityRank[current.basicSeveritySuggestion] !==
        severityRank[best.basicSeveritySuggestion]
      ) {
        return severityRank[current.basicSeveritySuggestion] >
          severityRank[best.basicSeveritySuggestion]
          ? current
          : best;
      }

      return current.displayName.length > best.displayName.length
        ? current
        : best;
    });
    const highestSeveritySuggestion = ingredientMatches.reduce(
      (highest, match) =>
        chooseHigherSeverity(highest, match.basicSeveritySuggestion),
      representative.basicSeveritySuggestion,
    );

    groups[bucket].push({
      canonicalIngredientId: representative.canonicalIngredientId,
      displayName: representative.displayName,
      originalIngredientText: representative.originalIngredientText,
      matchedTerm: representative.matchedTerm,
      matchedAliases: uniqueStrings(
        ingredientMatches.flatMap((match) => match.matchedAliases),
      ),
      matchedCategories: uniqueStrings(
        ingredientMatches.flatMap((match) => match.matchedCategories),
      ).sort(),
      sourcePacks: uniqueStrings(
        ingredientMatches.flatMap((match) => match.sourcePacks),
      ).sort(),
      basicSeveritySuggestion: highestSeveritySuggestion,
      highestSeveritySuggestion,
      userFacingReason: representative.userFacingReason,
      dataStatus: representative.dataStatus,
      confidenceLevel: representative.confidenceLevel,
      linkedExistingPackIds: uniqueStrings(
        ingredientMatches.flatMap((match) => match.linkedExistingPackIds),
      ).sort(),
      evidenceType: representative.evidenceType,
      duplicateSafe: true,
    });
  });

  return groups;
}

export function matchIngredientIntelligence(
  input: IngredientIntelligenceMatcherInput,
): IngredientIntelligenceMatcherOutput {
  const normalizedProfileGroups = normalizeUserAllergyProfile(
    input.userAllergyProfile,
  );
  const preparedSources = buildPreparedSources(input);
  const rawMatches = buildRawMatches(input, preparedSources, normalizedProfileGroups);
  const matchedIngredients = aggregateMatchesByOriginalText(rawMatches);
  const duplicateSafeMatches = aggregateDuplicateSafeMatches(matchedIngredients);
  const matchedCategories = buildCategorySummaries(duplicateSafeMatches);
  const unmatchedIngredients = input.ingredients.filter((ingredient) => {
    const normalizedIngredient = normalizeIngredientIntelligenceText(ingredient);
    return !matchedIngredients.some(
      (match) =>
        normalizeIngredientIntelligenceText(match.originalIngredientText) ===
        normalizedIngredient,
    );
  });

  return {
    matchedIngredients,
    matchedCategories,
    unmatchedIngredients,
    ingredientGroups: buildIngredientGroups(matchedIngredients),
    duplicateSafeMatches,
    debug: {
      sourceCount: preparedSources.length,
      rawMatchCount: rawMatches.length,
      categoryCount: matchedCategories.length,
      normalizedProfileGroups,
    },
  };
}
