import type { ExposureRiskMainReason, ExposureRiskResult } from "@/lib/calculateExposureRisk";
import { bannedRestrictedItems } from "@/data/ingredientIntelligence/bannedRestrictedItems";
import { publicAppConfig } from "@/lib/appConfig";
import type { RedReasonType, IngredientCategorySummary } from "@/lib/ingredientCategoryRules";
import {
  getCategoryCopy,
  truthlabelCategoryDisplayNames,
  type CategoryCopy,
} from "@/lib/truthlabelCategoryCopy";
import type {
  IngredientIntelligenceDuplicateSafeMatch,
  IngredientIntelligenceMatch,
  IngredientIntelligenceMatcherInput,
  IngredientIntelligenceMatcherOutput,
} from "@/lib/ingredientIntelligenceMatcher";
import { normalizeIngredientIntelligenceText } from "@/lib/ingredientIntelligenceMatcher";
import {
  buildEvidenceAwareFinalVerdict,
  type TruthlabelFinalVerdictCode,
  type TruthlabelImmediateStopReason,
} from "@/lib/buildEvidenceAwareFinalVerdict";
import {
  calculateIngredientLoad,
  type IngredientLoadResult,
} from "@/lib/calculateIngredientLoad";

type Severity = "green" | "yellow" | "red";
type IngredientGroup =
  | "natural_positive"
  | "processed_artificial"
  | "unknown_review"
  | "unmatched";
type ScanSource = "manual_paste" | "barcode" | "ocr" | "demo";
type ProductImageSource = "product_database" | "captured_scan" | "sample_scan";
type DeepCheckStatus = "checked" | "not_checked";
type BrandTrustStatus =
  | "not_checked"
  | "clear_checked"
  | "yellow_review"
  | "red_warning";

export type BuildScanResultInput = {
  productName?: string;
  brandName?: string;
  barcode?: string;
  productCategory?: string;
  ingredients: string[];
  ingredientListAvailable: boolean;
  matcherResult: IngredientIntelligenceMatcherOutput;
  categorySummaries: IngredientCategorySummary[];
  exposureRiskResult: ExposureRiskResult;
  userAllergyProfile?: string[];
  externalSignals?: IngredientIntelligenceMatcherInput["externalSignals"];
  scanSource: ScanSource;
  productImageUrl?: string;
  productImageSource?: ProductImageSource;
  additionalConfidenceNotes?: string[];
};

export type ScanResultProductHero = {
  productName: string;
  brandName: string;
  barcode: string;
  productCategory: string;
  exposureRisk: number;
  riskBand: string;
  verdictLabel: string;
  verdictTone: Severity;
  scanSource: ScanSource;
  imageUrl: string;
  imageSource?: ProductImageSource;
  ingredientCount: number;
  ingredientLoadScore: number;
  ingredientLoadLevel: IngredientLoadResult["level"];
  ingredientLoadTone: IngredientLoadResult["tone"];
  ingredientLoadRawPoints: number;
};

export type ScanResultOverviewRow = {
  categoryId: string;
  label: string;
  severity: Severity;
  displayValue: string;
  reason: string;
  title: string;
  message: string;
  action?: string;
  shortMessage: string;
  redReasonType?: RedReasonType;
  matchCount: number;
  matchedItemsPreview: string[];
  displayAllowed: boolean;
  sortOrder: number;
  isInformational: boolean;
};

export type ScanResultIngredientItem = {
  originalText: string;
  displayName: string;
  group: IngredientGroup;
  matchedCategories: string[];
  severity: Severity;
  userFacingReason: string;
  canonicalIngredientId: string;
  duplicateSafe: true;
};

export type ScanResultIngredientBreakdown = {
  totalIngredients: number;
  naturalPositive: ScanResultIngredientItem[];
  processedArtificial: ScanResultIngredientItem[];
  unknownReview: ScanResultIngredientItem[];
  matchedIngredients: ScanResultIngredientItem[];
  unmatchedIngredients: ScanResultIngredientItem[];
};

export type ScanResultDeepExposureCheck = {
  categoryId: string;
  iconName?: string;
  label: string;
  severity: Severity | null;
  displayValue: string;
  manualStatusLabel?: string;
  manualStatusTone?: Severity;
  reason: string;
  title: string;
  message: string;
  action?: string;
  shortMessage: string;
  redReasonType?: RedReasonType;
  matchCount: number;
  matchedItemsPreview: string[];
  matchedItemDetails: ScanResultMatchedItemDetail[];
  displayAllowed: boolean;
  status: DeepCheckStatus;
};

export type ScanResultMatchedItemDetail = {
  displayName: string;
  canonicalIngredientId: string;
  severity?: Severity;
  explanation?: string;
  userFacingReason: string;
  restrictionRegions: string[];
  restrictionReasons: string[];
};

export type ScanResultAdditiveGroup = {
  groupId: string;
  label: string;
  severity: Severity;
  matchCount: number;
  matchedItems: string[];
};

export type ScanResultAdditivesAndPreservatives = {
  overallSeverity: Severity;
  totalAdditiveMatches: number;
  groups: ScanResultAdditiveGroup[];
  summaryMessage: string;
};

export type ScanResultBrandTrustSafety = {
  status: BrandTrustStatus;
  severity: Severity | null;
  message: string;
  signals: string[];
  lookupPerformed: boolean;
};

export type ScanResultFinalVerdict = {
  exposureRisk: number;
  riskBand: string;
  verdictLabel: string;
  verdictTone: Severity;
  verdictCode: TruthlabelFinalVerdictCode;
  headline: string;
  opening: string;
  summary: string;
  totalRedCount: number;
  seriousRedCount: number;
  overloadRedCount: number;
  yellowCount: number;
  immediateStopReason?: TruthlabelImmediateStopReason;
  mainReasons: ExposureRiskMainReason[];
  avoidWording: string[];
  confidenceNotes: string[];
};

export type ScanResult = {
  productHero: ScanResultProductHero;
  ingredientLoad: IngredientLoadResult;
  quickOverview: ScanResultOverviewRow[];
  ingredientBreakdown: ScanResultIngredientBreakdown;
  deepExposureChecks: ScanResultDeepExposureCheck[];
  additivesAndPreservatives: ScanResultAdditivesAndPreservatives;
  brandTrustSafety: ScanResultBrandTrustSafety;
  finalVerdict: ScanResultFinalVerdict;
  confidenceNotes: string[];
  debug?: {
    sourceCount?: number;
    rawMatchCount?: number;
    categoryCount?: number;
    matchedIngredientCount: number;
    quickOverviewCount: number;
    deepExposureCheckCount: number;
    hiddenDeepExposureCheckCount: number;
    uncheckedExternalChecks: string[];
    normalizedProfileGroups?: string[];
  };
};

const categoryLabels: Record<string, string> = {
  banned_restricted_items: truthlabelCategoryDisplayNames.banned_restricted_items,
  artificial_colours: truthlabelCategoryDisplayNames.artificial_colours,
  artificial_sweeteners_sugar_substitutes:
    truthlabelCategoryDisplayNames.artificial_sweeteners_sugar_substitutes,
  preservatives_shelf_life_systems:
    truthlabelCategoryDisplayNames.preservatives_shelf_life_systems,
  emulsifiers_stabilisers_thickeners_gums:
    truthlabelCategoryDisplayNames.emulsifiers_stabilisers_thickeners_gums,
  flavour_enhancers_flavourings:
    truthlabelCategoryDisplayNames.flavour_enhancers_flavourings,
  seed_oils_processed_oils: truthlabelCategoryDisplayNames.seed_oils_processed_oils,
  hydrogenated_partially_hydrogenated_oils:
    truthlabelCategoryDisplayNames.hydrogenated_partially_hydrogenated_oils,
  ultra_processed_indicators:
    truthlabelCategoryDisplayNames.ultra_processed_indicators,
  artificial_engineered_food_construction:
    truthlabelCategoryDisplayNames.artificial_engineered_food_construction,
  harmful_additives: truthlabelCategoryDisplayNames.harmful_additives,
  cancer_linked_watch: truthlabelCategoryDisplayNames.cancer_linked_watch,
  allergy_risk: truthlabelCategoryDisplayNames.allergy_risk,
  natural_positive: truthlabelCategoryDisplayNames.natural_positive,
  unknown_review: truthlabelCategoryDisplayNames.unknown_review,
  meat_specific_concerns: truthlabelCategoryDisplayNames.meat_specific_concerns,
  fry_oil_fast_food_oil: truthlabelCategoryDisplayNames.fry_oil_fast_food_oil,
  heavy_metals: truthlabelCategoryDisplayNames.heavy_metals,
  microplastics: truthlabelCategoryDisplayNames.microplastics,
  brand_trust_safety: truthlabelCategoryDisplayNames.brand_trust_safety,
  total_ingredients: truthlabelCategoryDisplayNames.total_ingredients,
  natural_vs_processed: truthlabelCategoryDisplayNames.natural_vs_processed,
  additives_and_preservatives:
    truthlabelCategoryDisplayNames.additives_and_preservatives,
};

const redReasonOrder: Record<RedReasonType, number> = {
  verified_external_signal: 0,
  allergy_profile_match: 1,
  banned_restricted: 2,
  direct_red_ingredient: 3,
  category_combo_trigger: 4,
  count_overload: 5,
  high_processed_share: 6,
  long_ingredient_list: 7,
};

const externalCategoryIds = new Set([
  "heavy_metals",
  "microplastics",
  "brand_trust_safety",
]);

const hiddenQuickOverviewCategoryIds = new Set([
  "additives_and_preservatives",
  "artificial_engineered_food_construction",
  "artificial_colours",
  "artificial_sweeteners_sugar_substitutes",
  "emulsifiers_stabilisers_thickeners_gums",
  "flavour_enhancers_flavourings",
  "hydrogenated_partially_hydrogenated_oils",
  "natural_positive",
  "natural_vs_processed",
  "preservatives_shelf_life_systems",
  "brand_trust_safety",
  "unknown_review",
]);

const hiddenDeepExposureCategoryIds = new Set([
  "additives_and_preservatives",
  "artificial_engineered_food_construction",
  "artificial_colours",
  "emulsifiers_stabilisers_thickeners_gums",
  "natural_positive",
  "natural_vs_processed",
  "brand_trust_safety",
  "unknown_review",
]);

const meatContextTerms = [
  "meat",
  "fast food",
  "poultry",
  "chicken",
  "beef",
  "pork",
  "ham",
  "bacon",
  "sausage",
  "deli",
  "burger",
  "patty",
  "nugget",
  "turkey",
  "seafood",
  "fish",
];

const fryContextTerms = [
  "fast food",
  "fried",
  "deep fried",
  "fries",
  "chips",
  "crisps",
  "nugget",
  "onion rings",
  "fried chicken",
  "fried fish",
  "hash browns",
];

const heavyMetalContextTerms = [
  "baby",
  "kids",
  "infant",
  "toddler",
  "seafood",
  "fish",
  "rice",
  "cereal",
  "cocoa",
  "cacao",
  "chocolate",
  "spice",
  "cinnamon",
  "seaweed",
  "juice",
  "drink",
  "beverage",
];

const microplasticContextTerms = [
  "drink",
  "beverage",
  "bottle",
  "bottled",
  "water",
  "seafood",
  "fish",
  "shellfish",
  "salt",
  "chewing gum",
  "tea bag",
];

const additiveGroupDefinitions = [
  { id: "artificial_colours", label: "Artificial Colours" },
  {
    id: "artificial_sweeteners_sugar_substitutes",
    label: "Artificial Sweeteners",
  },
  {
    id: "preservatives_shelf_life_systems",
    label: "Preservatives",
  },
  {
    id: "emulsifiers_stabilisers_thickeners_gums",
    label: "Emulsifiers / Stabilisers / Gums",
  },
  {
    id: "flavour_enhancers_flavourings",
    label: "Flavour Enhancers / Flavourings",
  },
  { id: "harmful_additives", label: "Harmful Additives" },
] as const;

const avoidWording = [
  "poison",
  "toxic",
  "deadly",
  "guaranteed unsafe",
  "causes cancer",
  "medically dangerous",
  "safe for everyone",
] as const;

function uniqueStrings(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

function countUniqueIngredients(ingredients: string[]) {
  return new Set(
    ingredients.map(normalizeIngredientIntelligenceText).filter(Boolean),
  ).size;
}

function toCategoryMap(summaries: IngredientCategorySummary[]) {
  return new Map(summaries.map((summary) => [summary.categoryId, summary]));
}

function severityBucket(summary: Pick<IngredientCategorySummary, "severity" | "isInformational" | "displayAllowed">) {
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

function sortCategorySummaries(summaries: IngredientCategorySummary[]) {
  return [...summaries].sort((left, right) => {
    const leftBucket = severityBucket(left);
    const rightBucket = severityBucket(right);
    if (leftBucket !== rightBucket) {
      return leftBucket - rightBucket;
    }

    if (left.severity === "red" && right.severity === "red") {
      const leftReason =
        left.redReasonType === undefined
          ? Number.MAX_SAFE_INTEGER
          : redReasonOrder[left.redReasonType];
      const rightReason =
        right.redReasonType === undefined
          ? Number.MAX_SAFE_INTEGER
          : redReasonOrder[right.redReasonType];
      if (leftReason !== rightReason) {
        return leftReason - rightReason;
      }
    }

    return left.categoryName.localeCompare(right.categoryName);
  });
}

function getMatchedItemsPreview(matches: IngredientIntelligenceDuplicateSafeMatch[]) {
  return uniqueStrings(matches.map((match) => match.displayName)).slice(0, 3);
}

function getBannedRestrictedRecord(
  match: IngredientIntelligenceDuplicateSafeMatch,
) {
  return bannedRestrictedItems.find(
    (item) =>
      item.canonicalIngredientId === match.canonicalIngredientId ||
      item.id === match.canonicalIngredientId,
  );
}

function toMatchedItemDetail(
  match: IngredientIntelligenceDuplicateSafeMatch,
): ScanResultMatchedItemDetail {
  const bannedRestrictedRecord = getBannedRestrictedRecord(match);
  const restrictions =
    bannedRestrictedRecord?.countriesRestrictedOrBannedIn ?? [];

  return {
    displayName: match.displayName,
    canonicalIngredientId: match.canonicalIngredientId,
    userFacingReason: match.userFacingReason,
    restrictionRegions: uniqueStrings(
      restrictions.map((restriction) => restriction.region),
    ),
    restrictionReasons: uniqueStrings(
      restrictions.map((restriction) => restriction.reason),
    ),
  };
}

function getMatchedItemDetails(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
) {
  return matches.map(toMatchedItemDetail);
}

const notCheckedCopy: CategoryCopy = {
  reason: "Not found",
  title: "Not found",
  message:
    "This check did not run with enough data. Missing data is not proof of absence.",
};

function getSummaryCopy(
  summary: IngredientCategorySummary,
  details = getMatchedItemDetails(summary.matchedItems),
) {
  return getCategoryCopy({
    categoryId: summary.categoryId,
    severity: summary.severity,
    redReasonType: summary.redReasonType,
    matchCount: summary.matchCount,
    matchedItems: uniqueStrings(details.map((detail) => detail.displayName)),
    regions: uniqueStrings(details.flatMap((detail) => detail.restrictionRegions)),
    regulatoryReason: details.flatMap((detail) => detail.restrictionReasons)[0],
  });
}

function toQuickOverviewRow(summary: IngredientCategorySummary, sortOrder: number): ScanResultOverviewRow {
  const label =
    summary.categoryId === "ultra_processed_indicators"
      ? "Ultra-Processed"
      : categoryLabels[summary.categoryId] ?? summary.categoryName;
  const displayValue =
    summary.categoryId === "ultra_processed_indicators"
      ? summary.severity === "red"
        ? "High"
        : summary.severity === "yellow"
          ? "Likely"
          : "No major markers"
      : summary.displayLabel;
  const copy = getSummaryCopy(summary);

  return {
    categoryId: summary.categoryId,
    label,
    severity: summary.severity,
    displayValue,
    reason: copy.reason,
    title: copy.title,
    message: copy.message,
    action: copy.action,
    shortMessage: summary.shortMessage,
    redReasonType: summary.redReasonType,
    matchCount: summary.matchCount,
    matchedItemsPreview: getMatchedItemsPreview(summary.matchedItems),
    displayAllowed: summary.displayAllowed,
    sortOrder,
    isInformational: Boolean(summary.isInformational),
  };
}

function orderByIngredientList<T extends { originalText: string }>(
  items: T[],
  ingredients: string[],
) {
  const orderMap = new Map(
    ingredients.map((ingredient, index) => [
      normalizeIngredientIntelligenceText(ingredient),
      index,
    ]),
  );

  return [...items].sort((left, right) => {
    const leftIndex =
      orderMap.get(normalizeIngredientIntelligenceText(left.originalText)) ??
      Number.MAX_SAFE_INTEGER;
    const rightIndex =
      orderMap.get(normalizeIngredientIntelligenceText(right.originalText)) ??
      Number.MAX_SAFE_INTEGER;

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.originalText.localeCompare(right.originalText);
  });
}

function toIngredientItem(
  match: Pick<
    IngredientIntelligenceMatch,
    | "originalIngredientText"
    | "displayName"
    | "matchedCategories"
    | "basicSeveritySuggestion"
    | "highestSeveritySuggestion"
    | "userFacingReason"
    | "canonicalIngredientId"
    | "duplicateSafe"
    | "sourcePacks"
  >,
  group: Exclude<IngredientGroup, "unmatched">,
): ScanResultIngredientItem {
  return {
    originalText: match.originalIngredientText,
    displayName: match.displayName,
    group,
    matchedCategories: match.matchedCategories,
    severity:
      match.highestSeveritySuggestion === "red"
        ? "red"
        : match.highestSeveritySuggestion === "yellow"
          ? "yellow"
          : "green",
    userFacingReason: match.userFacingReason,
    canonicalIngredientId: match.canonicalIngredientId,
    duplicateSafe: true,
  };
}

function toUnmatchedIngredientItem(value: string): ScanResultIngredientItem {
  return {
    originalText: value,
    displayName: value,
    group: "unmatched",
    matchedCategories: [],
    severity: "yellow",
    userFacingReason:
      "Unmatched ingredients were not found in the current Truthlabel database.",
    canonicalIngredientId: `unmatched_${normalizeIngredientIntelligenceText(value).replace(/\s+/g, "_")}`,
    duplicateSafe: true,
  };
}

function buildIngredientBreakdown(input: BuildScanResultInput): ScanResultIngredientBreakdown {
  const ingredientMatchMap = new Map<string, IngredientIntelligenceMatch[]>();

  input.matcherResult.matchedIngredients
    .filter(
      (match) =>
        match.evidenceType === "ingredient_label" ||
        match.evidenceType === "user_profile",
    )
    .forEach((match) => {
      ingredientMatchMap.set(match.originalIngredientText, [
        ...(ingredientMatchMap.get(match.originalIngredientText) ?? []),
        match,
      ]);
    });

  const matchedItems = [...ingredientMatchMap.entries()].map(([, matches]) => {
    const representative = matches.reduce((best, current) => {
      if (!best) {
        return current;
      }

      const bestSeverity =
        best.highestSeveritySuggestion === "red"
          ? 2
          : best.highestSeveritySuggestion === "yellow"
            ? 1
            : 0;
      const currentSeverity =
        current.highestSeveritySuggestion === "red"
          ? 2
          : current.highestSeveritySuggestion === "yellow"
            ? 1
            : 0;

      if (currentSeverity !== bestSeverity) {
        return currentSeverity > bestSeverity ? current : best;
      }

      return current.displayName.length > best.displayName.length ? current : best;
    });
    const sourcePacks = uniqueStrings(matches.flatMap((match) => match.sourcePacks));
    const group: Exclude<IngredientGroup, "unmatched"> = sourcePacks.includes(
      "unknown_review",
    )
      ? "unknown_review"
      : matches.some(
          (match) =>
            match.highestSeveritySuggestion !== "green" &&
            match.sourcePacks.some(
              (packId) =>
                packId !== "natural_positive" &&
                packId !== "unknown_review" &&
                packId !== "allergy_risk",
            ),
        )
        ? "processed_artificial"
        : "natural_positive";

    return toIngredientItem(
      {
        ...representative,
        matchedCategories: uniqueStrings(
          matches.flatMap((match) => match.matchedCategories),
        ).sort(),
        sourcePacks,
      },
      group,
    );
  });

  const naturalPositive = matchedItems.filter(
    (item) => item.group === "natural_positive",
  );
  const processedArtificial = matchedItems.filter(
    (item) => item.group === "processed_artificial",
  );
  const unknownReview = matchedItems.filter((item) => item.group === "unknown_review");
  const matchedIngredients = orderByIngredientList(
    [...naturalPositive, ...processedArtificial, ...unknownReview],
    input.ingredients,
  );
  const unmatchedIngredients = orderByIngredientList(
    input.matcherResult.unmatchedIngredients.map(toUnmatchedIngredientItem),
    input.ingredients,
  );

  return {
    totalIngredients: countUniqueIngredients(input.ingredients),
    naturalPositive: orderByIngredientList(naturalPositive, input.ingredients),
    processedArtificial: orderByIngredientList(
      processedArtificial,
      input.ingredients,
    ),
    unknownReview: orderByIngredientList(unknownReview, input.ingredients),
    matchedIngredients,
    unmatchedIngredients,
  };
}

function toDeepExposureCheck(
  categoryId: string,
  summary: IngredientCategorySummary | undefined,
): ScanResultDeepExposureCheck {
  const label =
    (summary ? categoryLabels[summary.categoryId] : categoryLabels[categoryId]) ??
    summary?.categoryName ??
    categoryId;

  if (!summary || !summary.displayAllowed) {
    return {
      categoryId,
      label,
      severity: null,
      displayValue: "Not found",
      reason: notCheckedCopy.reason,
      title: notCheckedCopy.title,
      message: notCheckedCopy.message,
      action: notCheckedCopy.action,
      shortMessage: "Not found.",
      matchCount: summary?.matchCount ?? 0,
      matchedItemsPreview: summary ? getMatchedItemsPreview(summary.matchedItems) : [],
      matchedItemDetails: summary ? getMatchedItemDetails(summary.matchedItems) : [],
      displayAllowed: false,
      status: "not_checked",
    };
  }
  const matchedItemDetails = getMatchedItemDetails(summary.matchedItems);
  const copy = getSummaryCopy(summary, matchedItemDetails);

  return {
    categoryId,
    label,
    severity: summary.severity,
    displayValue: summary.displayLabel,
    reason: copy.reason,
    title: copy.title,
    message: copy.message,
    action: copy.action,
    shortMessage: summary.shortMessage,
    redReasonType: summary.redReasonType,
    matchCount: summary.matchCount,
    matchedItemsPreview: getMatchedItemsPreview(summary.matchedItems),
    matchedItemDetails,
    displayAllowed: true,
    status: "checked",
  };
}

function shouldShowAsDeepExposure(
  summary: IngredientCategorySummary,
  input: BuildScanResultInput,
) {
  return (
    summary.displayAllowed &&
    (summary.severity === "yellow" || summary.severity === "red") &&
    !hiddenDeepExposureCategoryIds.has(summary.categoryId) &&
    isSummaryAllowedForProductContext(summary, input)
  );
}

function hasContextTerm(context: string, terms: string[]) {
  return terms.some((term) => context.includes(term));
}

function getProductTypeContext(input: BuildScanResultInput) {
  return normalizeIngredientIntelligenceText(
    [input.productCategory, input.productName].filter(Boolean).join(" "),
  ).replace(
    /\b(?:chicken|beef|pork|bacon|ham|turkey|fish|shrimp|prawn)\s+(?:flavour|flavor|flavoured|flavored)\b/g,
    "",
  );
}

function hasIngredientListEvidence(
  summary: IngredientCategorySummary,
  input: BuildScanResultInput,
) {
  const normalizedIngredients = new Set(
    input.ingredients.map(normalizeIngredientIntelligenceText).filter(Boolean),
  );

  if (normalizedIngredients.size === 0) {
    return false;
  }

  return summary.matchedItems.some((match) => {
    const normalizedMatchedTexts = uniqueStrings([
      match.originalIngredientText,
      ...match.originalIngredientTexts,
    ])
      .map(normalizeIngredientIntelligenceText)
      .filter(Boolean);

    return normalizedMatchedTexts.some((text) => normalizedIngredients.has(text));
  });
}

function hasExplicitSafetyEvidence(summary: IngredientCategorySummary) {
  return summary.matchedItems.some(
    (match) =>
      match.evidenceType === "external_dataset" ||
      match.evidenceType === "packaging_marker" ||
      match.evidenceType === "user_profile",
  );
}

function isSummaryAllowedForProductContext(
  summary: IngredientCategorySummary,
  input: BuildScanResultInput,
) {
  if (hasIngredientListEvidence(summary, input) || hasExplicitSafetyEvidence(summary)) {
    return true;
  }

  const context = getProductTypeContext(input);

  if (summary.categoryId === "meat_specific_concerns") {
    return hasContextTerm(context, meatContextTerms);
  }

  if (summary.categoryId === "fry_oil_fast_food_oil") {
    return hasContextTerm(context, fryContextTerms);
  }

  if (summary.categoryId === "heavy_metals") {
    return hasContextTerm(context, heavyMetalContextTerms);
  }

  if (summary.categoryId === "microplastics") {
    return hasContextTerm(context, microplasticContextTerms);
  }

  return true;
}

function sortQuickOverviewSummaries(
  summaries: IngredientCategorySummary[],
) {
  return [...summaries].sort((left, right) => {
    const leftIsTotalIngredients = left.categoryId === "total_ingredients";
    const rightIsTotalIngredients = right.categoryId === "total_ingredients";

    if (leftIsTotalIngredients !== rightIsTotalIngredients) {
      return leftIsTotalIngredients ? 1 : -1;
    }

    return 0;
  });
}

function toAdditiveGroup(summary: IngredientCategorySummary | undefined, label: string, groupId: string): ScanResultAdditiveGroup {
  return {
    groupId,
    label,
    severity: summary?.severity ?? "green",
    matchCount: summary?.matchCount ?? 0,
    matchedItems: uniqueStrings(summary?.matchedItems.map((item) => item.displayName) ?? []),
  };
}

function buildAdditivesAndPreservatives(
  categoryMap: Map<string, IngredientCategorySummary>,
): ScanResultAdditivesAndPreservatives {
  const combinedSummary = categoryMap.get("additives_and_preservatives");
  const groups = additiveGroupDefinitions.map((definition) =>
    toAdditiveGroup(categoryMap.get(definition.id), definition.label, definition.id),
  );
  const totalAdditiveMatches =
    combinedSummary?.matchCount ??
    groups.reduce((total, group) => total + group.matchCount, 0);

  let summaryMessage =
    combinedSummary?.shortMessage ??
    "No additive or preservative systems found from available label data.";

  if (!combinedSummary) {
    if (groups.some((group) => group.severity === "red") || totalAdditiveMatches >= 4) {
      summaryMessage =
        "This product contains multiple additive and preservative systems. Truthlabel flags this as a high additive-load concern.";
    } else if (totalAdditiveMatches >= 1) {
      summaryMessage =
        "This product contains additive or preservative systems. Truthlabel flags this for review.";
    }
  }

  return {
    overallSeverity: combinedSummary?.severity ?? "green",
    totalAdditiveMatches,
    groups,
    summaryMessage,
  };
}

function buildBrandTrustSafety(
  categoryMap: Map<string, IngredientCategorySummary>,
): ScanResultBrandTrustSafety {
  const summary = categoryMap.get("brand_trust_safety");
  const signals = uniqueStrings(summary?.matchedItems.map((match) => match.displayName) ?? []);

  if (!summary || !summary.displayAllowed) {
    return {
      status: "not_checked",
      severity: null,
      message:
        "No live brand safety or recall signal was found for this scan. Missing data is not proof of absence.",
      signals,
      lookupPerformed: false,
    };
  }

  if (summary.severity === "green") {
    return {
      status: "clear_checked",
      severity: "green",
      message:
        "No official recall signal found in checked sources at the time of lookup. This does not guarantee the product is risk-free.",
      signals,
      lookupPerformed: true,
    };
  }

  if (summary.severity === "red") {
    return {
      status: "red_warning",
      severity: "red",
      message: summary.shortMessage,
      signals,
      lookupPerformed: true,
    };
  }

  return {
    status: "yellow_review",
    severity: "yellow",
    message: summary.shortMessage,
    signals,
    lookupPerformed: true,
  };
}

function buildConfidenceNotes(
  input: BuildScanResultInput,
  categoryMap: Map<string, IngredientCategorySummary>,
  brandTrustSafety: ScanResultBrandTrustSafety,
) {
  const notes = input.exposureRiskResult.confidenceNotes.filter(
    (note) =>
      ![
        "Heavy metals require external testing or official data. Missing data is not proof of absence.",
        "Microplastic review depends on product type, packaging, or external testing data.",
        "No live brand safety or recall signal was found for this scan. Missing data is not proof of absence.",
      ].includes(note),
  );
  const allergyRiskSummary = categoryMap.get("allergy_risk");
  const cancerSummary = categoryMap.get("cancer_linked_watch");
  const hasUncheckedExternalData = ["heavy_metals", "microplastics", "brand_trust_safety"].some(
    (categoryId) => !categoryMap.get(categoryId)?.displayAllowed,
  );

  if (!input.ingredientListAvailable) {
    notes.push("Ingredient-based warnings require a readable ingredient list.");
  }

  if (hasUncheckedExternalData) {
    notes.push(
      "Heavy metals, microplastics, and recall status require external data. Missing data is not proof of absence.",
    );
  }

  if (brandTrustSafety.status === "yellow_review" || brandTrustSafety.status === "red_warning") {
    notes.push(
      "Recall relevance may depend on batch, lot code, date, and region.",
    );
  }

  if (cancerSummary && cancerSummary.severity !== "green") {
    notes.push(
      "Cancer-related concern flags are review signals, not proof of harm from one product.",
    );
  }

  if (
    input.ingredientListAvailable &&
    allergyRiskSummary?.displayAllowed &&
    allergyRiskSummary.severity === "green"
  ) {
    notes.push(
      "No common allergen found from available label data does not confirm the product is suitable for allergies.",
    );
  }

  if (input.scanSource === "ocr") {
    notes.push(
      "OCR text may contain mistakes. Check the ingredient list against the package label.",
    );
  }

  return uniqueStrings([
    ...notes,
    ...(input.additionalConfidenceNotes ?? []),
  ]);
}

function buildFinalVerdict(
  input: BuildScanResultInput,
  confidenceNotes: string[],
): ScanResultFinalVerdict {
  const evidenceAwareVerdict = buildEvidenceAwareFinalVerdict({
    mainReasons: input.exposureRiskResult.mainReasons,
    externalSignals: input.externalSignals,
  });

  return {
    exposureRisk: input.exposureRiskResult.exposureRisk,
    riskBand: input.exposureRiskResult.riskBand,
    verdictLabel: evidenceAwareVerdict.verdictLabel,
    verdictTone: evidenceAwareVerdict.verdictTone,
    verdictCode: evidenceAwareVerdict.verdictCode,
    headline: evidenceAwareVerdict.verdictLabel,
    opening: evidenceAwareVerdict.opening,
    summary: evidenceAwareVerdict.summary,
    totalRedCount: evidenceAwareVerdict.totalRedCount,
    seriousRedCount: evidenceAwareVerdict.seriousRedCount,
    overloadRedCount: evidenceAwareVerdict.overloadRedCount,
    yellowCount: evidenceAwareVerdict.yellowCount,
    immediateStopReason: evidenceAwareVerdict.immediateStopReason,
    mainReasons: input.exposureRiskResult.mainReasons,
    avoidWording: [...avoidWording],
    confidenceNotes,
  };
}

export function buildScanResult(input: BuildScanResultInput): ScanResult {
  const categoryMap = toCategoryMap(input.categorySummaries);
  const ingredientCount = countUniqueIngredients(input.ingredients);
  const sortedSummaries = sortCategorySummaries(input.categorySummaries);
  const quickOverview = sortQuickOverviewSummaries(
    sortedSummaries.filter(
      (summary) =>
        summary.displayAllowed &&
        !hiddenQuickOverviewCategoryIds.has(summary.categoryId) &&
        isSummaryAllowedForProductContext(summary, input),
    ),
  )
    .map((summary, index) => toQuickOverviewRow(summary, index));
  const ingredientBreakdown = buildIngredientBreakdown(input);
  const ingredientLoad = calculateIngredientLoad({
    ingredients: input.ingredients,
    duplicateSafeMatches: input.matcherResult.duplicateSafeMatches,
    categorySummaries: input.categorySummaries,
  });
  const deepExposureChecks = sortedSummaries
    .filter((summary) => shouldShowAsDeepExposure(summary, input))
    .map((summary) => toDeepExposureCheck(summary.categoryId, summary));
  const additivesAndPreservatives = buildAdditivesAndPreservatives(categoryMap);
  const brandTrustSafety = buildBrandTrustSafety(categoryMap);
  const confidenceNotes = buildConfidenceNotes(
    input,
    categoryMap,
    brandTrustSafety,
  );
  const finalVerdict = buildFinalVerdict(input, confidenceNotes);

  return {
    productHero: {
      productName: input.productName?.trim() || "Unknown product",
      brandName: input.brandName?.trim() || "Unknown brand",
      barcode: input.barcode?.trim() || "",
      productCategory: input.productCategory?.trim() || "",
      exposureRisk: input.exposureRiskResult.exposureRisk,
      riskBand: input.exposureRiskResult.riskBand,
      verdictLabel: input.exposureRiskResult.verdictLabel,
      verdictTone: input.exposureRiskResult.verdictTone,
      scanSource: input.scanSource,
      imageUrl: input.productImageUrl?.trim() || "",
      imageSource: input.productImageUrl?.trim()
        ? input.productImageSource
        : undefined,
      ingredientCount,
      ingredientLoadScore: ingredientLoad.score,
      ingredientLoadLevel: ingredientLoad.level,
      ingredientLoadTone: ingredientLoad.tone,
      ingredientLoadRawPoints: ingredientLoad.rawLoad,
    },
    ingredientLoad,
    quickOverview,
    ingredientBreakdown,
    deepExposureChecks,
    additivesAndPreservatives,
    brandTrustSafety,
    finalVerdict,
    confidenceNotes,
    debug: publicAppConfig.flags.enableDebugOutput
      ? {
          sourceCount: input.matcherResult.debug?.sourceCount,
          rawMatchCount: input.matcherResult.debug?.rawMatchCount,
          categoryCount: input.matcherResult.debug?.categoryCount,
          matchedIngredientCount: ingredientBreakdown.matchedIngredients.length,
          quickOverviewCount: quickOverview.length,
          deepExposureCheckCount: deepExposureChecks.length,
          hiddenDeepExposureCheckCount: deepExposureChecks.filter(
            (check) => !check.displayAllowed,
          ).length,
          uncheckedExternalChecks: deepExposureChecks
            .filter(
              (check) =>
                check.status === "not_checked" && externalCategoryIds.has(check.categoryId),
            )
            .map((check) => check.categoryId),
          normalizedProfileGroups: input.matcherResult.debug?.normalizedProfileGroups,
        }
      : undefined,
  };
}
