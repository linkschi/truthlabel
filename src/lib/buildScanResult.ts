import type { ExposureRiskMainReason, ExposureRiskResult } from "@/lib/calculateExposureRisk";
import { publicAppConfig } from "@/lib/appConfig";
import type { RedReasonType, IngredientCategorySummary } from "@/lib/ingredientCategoryRules";
import type {
  IngredientIntelligenceDuplicateSafeMatch,
  IngredientIntelligenceMatch,
  IngredientIntelligenceMatcherInput,
  IngredientIntelligenceMatcherOutput,
} from "@/lib/ingredientIntelligenceMatcher";
import { normalizeIngredientIntelligenceText } from "@/lib/ingredientIntelligenceMatcher";

type Severity = "green" | "yellow" | "red";
type IngredientGroup =
  | "natural_positive"
  | "processed_artificial"
  | "unknown_review"
  | "unmatched";
type ScanSource = "manual_paste" | "barcode" | "ocr" | "demo";
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
  ingredientCount: number;
};

export type ScanResultOverviewRow = {
  categoryId: string;
  label: string;
  severity: Severity;
  displayValue: string;
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
  label: string;
  severity: Severity | null;
  displayValue: string;
  shortMessage: string;
  redReasonType?: RedReasonType;
  matchCount: number;
  matchedItemsPreview: string[];
  displayAllowed: boolean;
  status: DeepCheckStatus;
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
  headline: string;
  summary: string;
  mainReasons: ExposureRiskMainReason[];
  avoidWording: string[];
  confidenceNotes: string[];
};

export type ScanResult = {
  productHero: ScanResultProductHero;
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
};

const redReasonOrder: Record<RedReasonType, number> = {
  banned_restricted: 0,
  allergy_profile_match: 1,
  verified_external_signal: 2,
  direct_red_ingredient: 3,
  count_overload: 4,
  high_processed_share: 5,
  long_ingredient_list: 6,
  category_combo_trigger: 7,
};

const externalCategoryIds = new Set([
  "heavy_metals",
  "microplastics",
  "brand_trust_safety",
]);

const deepExposureCheckIds = [
  "banned_restricted_items",
  "cancer_linked_watch",
  "allergy_risk",
  "heavy_metals",
  "microplastics",
  "brand_trust_safety",
  "meat_specific_concerns",
  "fry_oil_fast_food_oil",
] as const;

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

function toQuickOverviewRow(summary: IngredientCategorySummary, sortOrder: number): ScanResultOverviewRow {
  return {
    categoryId: summary.categoryId,
    label: summary.categoryName,
    severity: summary.severity,
    displayValue: summary.displayLabel,
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
      : sourcePacks.some(
          (packId) => packId !== "natural_positive" && packId !== "unknown_review",
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
    totalIngredients: input.ingredients.length,
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
  const label = summary?.categoryName ?? categoryLabels[categoryId] ?? categoryId;

  if (!summary || !summary.displayAllowed) {
    return {
      categoryId,
      label,
      severity: null,
      displayValue: "Not checked",
      shortMessage: "Not checked.",
      matchCount: summary?.matchCount ?? 0,
      matchedItemsPreview: summary ? getMatchedItemsPreview(summary.matchedItems) : [],
      displayAllowed: false,
      status: "not_checked",
    };
  }

  return {
    categoryId,
    label,
    severity: summary.severity,
    displayValue: summary.displayLabel,
    shortMessage: summary.shortMessage,
    redReasonType: summary.redReasonType,
    matchCount: summary.matchCount,
    matchedItemsPreview: getMatchedItemsPreview(summary.matchedItems),
    displayAllowed: true,
    status: "checked",
  };
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
        "Brand safety and recall status were not checked in live official sources.",
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
        "Brand safety and recall status were not checked in live official sources.",
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
      "Cancer-linked Watch is a review signal, not proof that the product causes cancer.",
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
  return {
    exposureRisk: input.exposureRiskResult.exposureRisk,
    riskBand: input.exposureRiskResult.riskBand,
    verdictLabel: input.exposureRiskResult.verdictLabel,
    verdictTone: input.exposureRiskResult.verdictTone,
    headline: input.exposureRiskResult.verdictLabel,
    summary: input.exposureRiskResult.verdictMessage,
    mainReasons: input.exposureRiskResult.mainReasons,
    avoidWording: [...avoidWording],
    confidenceNotes,
  };
}

export function buildScanResult(input: BuildScanResultInput): ScanResult {
  const categoryMap = toCategoryMap(input.categorySummaries);
  const sortedSummaries = sortCategorySummaries(input.categorySummaries);
  const quickOverview = sortedSummaries
    .filter((summary) => summary.displayAllowed)
    .map((summary, index) => toQuickOverviewRow(summary, index));
  const ingredientBreakdown = buildIngredientBreakdown(input);
  const deepExposureChecks = deepExposureCheckIds.map((categoryId) =>
    toDeepExposureCheck(categoryId, categoryMap.get(categoryId)),
  );
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
      ingredientCount: input.ingredients.length,
    },
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
