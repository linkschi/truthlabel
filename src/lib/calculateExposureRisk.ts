import { artificialSweetenersDataPack } from "@/data/ingredientIntelligence/artificialSweetenersSugarSubstitutes";
import { brandTrustSafetyRecallsLawsuitsDataPack } from "@/data/ingredientIntelligence/brandTrustSafetyRecallsLawsuits";
import { cancerLinkedWatchDataPack } from "@/data/ingredientIntelligence/cancerLinkedWatch";
import { harmfulAdditivesDataPack } from "@/data/ingredientIntelligence/harmfulAdditives";
import { heavyMetalsDataPack } from "@/data/ingredientIntelligence/heavyMetals";
import { hydrogenatedPartiallyHydrogenatedOilsDataPack } from "@/data/ingredientIntelligence/hydrogenatedPartiallyHydrogenatedOils";
import { microplasticsDataPack } from "@/data/ingredientIntelligence/microplastics";
import { preservativesShelfLifeSystemsDataPack } from "@/data/ingredientIntelligence/preservativesShelfLifeSystems";
import type { AdditiveBreakdownResult, ExposureCheckResult, IngredientClassification } from "@/types/exposure";
import type { ArtificialEngineeredFoodConstructionSummary } from "@/lib/ingredientIntelligence/artificialEngineeredFoodConstruction";

import type {
  IngredientCategorySummary,
  RedReasonType,
} from "./ingredientCategoryRules";
import type {
  IngredientIntelligenceDuplicateSafeMatch,
  IngredientIntelligenceMatcherInput,
  IngredientIntelligenceMatcherOutput,
} from "./ingredientIntelligenceMatcher";
import { normalizeIngredientIntelligenceText } from "./ingredientIntelligenceMatcher";

export type ExposureRiskBand =
  | "Low Risk / Clean Pass"
  | "Worth Reviewing"
  | "High Review"
  | "Poor"
  | "Strong Warning";

export type ExposureVerdictLabel =
  | "Clean Pass"
  | "Worth Reviewing"
  | "High Review"
  | "Poor"
  | "Strong Warning";

export type ExposureVerdictTone = "green" | "yellow" | "red";

export type ExposureRiskMainReason = {
  categoryId: string;
  categoryName: string;
  severity: "green" | "yellow" | "red";
  reasonType: RedReasonType | "yellow_category" | "informational";
  message: string;
  matchedItems: string[];
};

export type ExposureRiskScoreBreakdown = {
  id: string;
  categoryId?: string;
  ingredientId?: string;
  label: string;
  points: number;
  reasonType:
    | "direct_red_signal"
    | "count_overload"
    | "yellow_category"
    | "minimum_floor"
    | "yellow_floor"
    | "yellow_only_cap";
  message: string;
};

export type ExposureRiskResult = {
  exposureRisk: number;
  riskBand: ExposureRiskBand;
  verdictLabel: ExposureVerdictLabel;
  verdictMessage: string;
  verdictTone: ExposureVerdictTone;
  mainReasons: ExposureRiskMainReason[];
  scoreBreakdown: ExposureRiskScoreBreakdown[];
  redReasonTypes: RedReasonType[];
  confidenceNotes: string[];
  duplicateSafeScoring: true;
  hasRedIssue: boolean;
  hasSeriousRedIssue: boolean;
  hasAllergyRisk: boolean;
};

export type ExposureRiskScoringInput = {
  categorySummaries: IngredientCategorySummary[];
  matchedIngredients: IngredientIntelligenceMatcherOutput["matchedIngredients"];
  duplicateSafeMatches: IngredientIntelligenceDuplicateSafeMatch[];
  ingredientGroups: IngredientIntelligenceMatcherOutput["ingredientGroups"];
  ingredientCount: number;
  productCategory?: string;
  userAllergyProfile?: string[];
  externalSignals?: IngredientIntelligenceMatcherInput["externalSignals"];
};

type LegacyExposureRiskInput = {
  checkResults: ExposureCheckResult[];
  ingredientClassification: IngredientClassification;
  additivesBreakdown: AdditiveBreakdownResult[];
  constructionSummary?: ArtificialEngineeredFoodConstructionSummary;
};

type CalculateExposureRiskInput =
  | ExposureRiskScoringInput
  | LegacyExposureRiskInput;

type DirectScoreCandidate = {
  scoreEntityId: string;
  categoryId: string;
  categoryName: string;
  points: number;
  reasonType: RedReasonType;
  message: string;
  matchedItem: IngredientIntelligenceDuplicateSafeMatch;
};

type FloorRule = {
  id: string;
  minimumScore: number;
  reasonType: RedReasonType | "yellow_floor";
  label: string;
  message: string;
};

const riskBandConfig: Array<{
  max: number;
  riskBand: ExposureRiskBand;
  verdictLabel: ExposureVerdictLabel;
  verdictTone: ExposureVerdictTone;
  verdictMessage: string;
}> = [
  {
    max: 24,
    riskBand: "Low Risk / Clean Pass",
    verdictLabel: "Clean Pass",
    verdictTone: "green",
    verdictMessage:
      "Few or no major ingredient concerns were found from the available label data.",
  },
  {
    max: 49,
    riskBand: "Worth Reviewing",
    verdictLabel: "Worth Reviewing",
    verdictTone: "yellow",
    verdictMessage:
      "This product has some ingredient concerns worth reviewing.",
  },
  {
    max: 64,
    riskBand: "High Review",
    verdictLabel: "High Review",
    verdictTone: "yellow",
    verdictMessage:
      "This product has several ingredient concerns or processing markers.",
  },
  {
    max: 79,
    riskBand: "Poor",
    verdictLabel: "Poor",
    verdictTone: "red",
    verdictMessage:
      "This product has serious ingredient concerns or high category-load warnings.",
  },
  {
    max: 100,
    riskBand: "Strong Warning",
    verdictLabel: "Strong Warning",
    verdictTone: "red",
    verdictMessage:
      "This product has serious warning signals such as banned/restricted ingredients, allergy-profile matches, verified safety alerts, or heavy additive/processing concerns.",
  },
];

const directReasonRank: Record<RedReasonType, number> = {
  verified_external_signal: 0,
  allergy_profile_match: 1,
  banned_restricted: 2,
  direct_red_ingredient: 3,
  category_combo_trigger: 4,
  count_overload: 5,
  high_processed_share: 6,
  long_ingredient_list: 7,
};

const mainReasonPriority: Record<string, number> = {
  active_official_recall: 1,
  verified_external_signal: 2,
  allergy_profile_match: 3,
  banned_restricted_items: 4,
  banned_restricted: 4,
  hydrogenated_partially_hydrogenated_oils: 5,
  red_cancer_linked_watch: 6,
  red_harmful_additive: 7,
  count_overload: 8,
  natural_vs_processed: 9,
  total_ingredients: 10,
  yellow_category: 11,
};

const scoreExcludedCategoryIds = new Set([
  "additives_and_preservatives",
  "artificial_engineered_food_construction",
  "artificial_colours",
  "unknown_review",
]);

const countOverloadRedScores: Partial<Record<string, number>> = {
  artificial_sweeteners_sugar_substitutes: 20,
  preservatives_shelf_life_systems: 20,
  emulsifiers_stabilisers_thickeners_gums: 18,
  flavour_enhancers_flavourings: 18,
  seed_oils_processed_oils: 18,
  ultra_processed_indicators: 22,
  unknown_review: 15,
  meat_specific_concerns: 18,
  fry_oil_fast_food_oil: 18,
  cancer_linked_watch: 25,
};

const specialRedScores: Partial<Record<string, number>> = {
  total_ingredients: 15,
  natural_vs_processed: 22,
};

const yellowPerMatchScores: Partial<Record<string, number>> = {
  artificial_sweeteners_sugar_substitutes: 6,
  preservatives_shelf_life_systems: 6,
  emulsifiers_stabilisers_thickeners_gums: 5,
  flavour_enhancers_flavourings: 5,
  seed_oils_processed_oils: 8,
  ultra_processed_indicators: 5,
  harmful_additives: 8,
  cancer_linked_watch: 10,
  unknown_review: 3,
  meat_specific_concerns: 5,
  fry_oil_fast_food_oil: 5,
};

const yellowFlatScores: Partial<Record<string, number>> = {
  allergy_risk: 8,
  total_ingredients: 8,
  natural_vs_processed: 10,
  heavy_metals: 10,
  microplastics: 8,
};

const brandTrustSignalYellowScores: Record<string, number> = {
  resolved_historical_recall: 12,
  repeated_recall_history: 12,
  product_specific_lawsuit_allegation: 8,
  brand_level_lawsuit_allegation: 8,
  warning_letter_regulatory_enforcement: 10,
  settlement_court_confirmed_signal: 10,
  third_party_product_testing_concern: 10,
};

const brandTrustRedSignalIds = new Set(
  brandTrustSafetyRecallsLawsuitsDataPack.items
    .filter((item) => item.basicSeveritySuggestion === "red")
    .map((item) => item.id),
);

const heavyMetalsRedIds = new Set(
  heavyMetalsDataPack.items
    .filter((item) => item.basicSeveritySuggestion === "red")
    .map((item) => item.id),
);

const microplasticsRedIds = new Set(
  (
    microplasticsDataPack.items as readonly {
      id: string;
      basicSeveritySuggestion: "yellow" | "red";
    }[]
  )
    .filter((item) => item.basicSeveritySuggestion === "red")
    .map((item) => item.id),
);

const cancerWatchRedIds = new Set(
  cancerLinkedWatchDataPack.items
    .filter((item) => item.basicSeveritySuggestion === "red")
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

const hydrogenatedRedIds = new Set(
  hydrogenatedPartiallyHydrogenatedOilsDataPack.items
    .filter((item) => item.severity === "red")
    .map((item) => item.id),
);

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function isLegacyExposureRiskInput(
  input: CalculateExposureRiskInput,
): input is LegacyExposureRiskInput {
  return "checkResults" in input;
}

function isDirectRedIdMatch(
  match: IngredientIntelligenceDuplicateSafeMatch,
  ids: Set<string>,
) {
  if (ids.has(match.canonicalIngredientId)) {
    return true;
  }

  const normalizedDisplayName = normalizeIngredientIntelligenceText(match.displayName);

  return [...ids].some(
    (id) => normalizeIngredientIntelligenceText(id) === normalizedDisplayName,
  );
}

function toVerdict(score: number) {
  return (
    riskBandConfig.find((entry) => score <= entry.max) ?? riskBandConfig.at(-1)!
  );
}

function addBreakdown(
  breakdown: ExposureRiskScoreBreakdown[],
  entry: ExposureRiskScoreBreakdown,
) {
  if (entry.points === 0) {
    return;
  }

  breakdown.push(entry);
}

function isScoreExcludedCategory(categoryId: string) {
  return scoreExcludedCategoryIds.has(categoryId);
}

function buildDirectScoreCandidates(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
) {
  const candidates: DirectScoreCandidate[] = [];

  matches.forEach((match) => {
    if (
      match.sourcePacks.includes("allergy_risk") &&
      match.evidenceType === "user_profile"
    ) {
      candidates.push({
        scoreEntityId: match.canonicalIngredientId,
        categoryId: "allergy_risk",
        categoryName: "Allergy Risk",
        points: 45,
        reasonType: "allergy_profile_match",
        message:
          "This ingredient matches the user's allergy profile, so it forces a strong warning floor.",
        matchedItem: match,
      });
    }

    if (
      match.sourcePacks.includes("banned_restricted_items") &&
      match.basicSeveritySuggestion === "red"
    ) {
      candidates.push({
        scoreEntityId: match.canonicalIngredientId,
        categoryId: "banned_restricted_items",
        categoryName: "Banned / Restricted Items",
        points: 35,
        reasonType: "banned_restricted",
        message:
          "This ingredient appears in the banned/restricted category, so it adds a serious regulatory concern score.",
        matchedItem: match,
      });
    }

    if (
      match.sourcePacks.includes("brand_trust_safety") &&
      isDirectRedIdMatch(match, brandTrustRedSignalIds)
    ) {
      candidates.push({
        scoreEntityId: match.canonicalIngredientId,
        categoryId: "brand_trust_safety",
        categoryName: "Brand Trust / Safety / Recalls / Lawsuits",
        points: 45,
        reasonType: "verified_external_signal",
        message:
          "This product has an official recall, public-health alert, or equivalent verified external safety signal.",
        matchedItem: match,
      });
    }

    if (
      match.sourcePacks.includes("heavy_metals") &&
      isDirectRedIdMatch(match, heavyMetalsRedIds)
    ) {
      candidates.push({
        scoreEntityId: match.canonicalIngredientId,
        categoryId: "heavy_metals",
        categoryName: "Heavy Metals",
        points: 40,
        reasonType: "verified_external_signal",
        message:
          "This product has a verified heavy-metal warning, recall, or testing signal.",
        matchedItem: match,
      });
    }

    if (
      match.sourcePacks.includes("microplastics") &&
      isDirectRedIdMatch(match, microplasticsRedIds)
    ) {
      candidates.push({
        scoreEntityId: match.canonicalIngredientId,
        categoryId: "microplastics",
        categoryName: "Microplastics",
        points: 35,
        reasonType: "verified_external_signal",
        message:
          "This product has a verified microplastic or nanoplastic detection signal.",
        matchedItem: match,
      });
    }

    if (
      match.sourcePacks.includes("hydrogenated_partially_hydrogenated_oils") &&
      isDirectRedIdMatch(match, hydrogenatedRedIds)
    ) {
      candidates.push({
        scoreEntityId: match.canonicalIngredientId,
        categoryId: "hydrogenated_partially_hydrogenated_oils",
        categoryName: "Hydrogenated / Partially Hydrogenated Oils",
        points: 35,
        reasonType: "direct_red_ingredient",
        message:
          "Partially hydrogenated oil or a positive trans-fat marker was found, which adds a serious processed-fat score.",
        matchedItem: match,
      });
    }

    if (
      match.sourcePacks.includes("cancer_linked_watch") &&
      isDirectRedIdMatch(match, cancerWatchRedIds)
    ) {
      candidates.push({
        scoreEntityId: match.canonicalIngredientId,
        categoryId: "cancer_linked_watch",
        categoryName: "Cancer-linked Watch",
        points: 30,
        reasonType: "direct_red_ingredient",
        message:
          "A red cancer-related concern item was found, which adds a serious review score.",
        matchedItem: match,
      });
    }

    if (
      match.sourcePacks.includes("harmful_additives") &&
      isDirectRedIdMatch(match, harmfulAdditiveRedIds)
    ) {
      candidates.push({
        scoreEntityId: match.canonicalIngredientId,
        categoryId: "harmful_additives",
        categoryName: "Harmful Additives",
        points: 25,
        reasonType: "direct_red_ingredient",
        message:
          "A red harmful-additive item was found, which adds a high-concern additive score.",
        matchedItem: match,
      });
    }

    if (
      match.sourcePacks.includes("artificial_sweeteners_sugar_substitutes") &&
      isDirectRedIdMatch(match, artificialSweetenerRedIds)
    ) {
      candidates.push({
        scoreEntityId: match.canonicalIngredientId,
        categoryId: "artificial_sweeteners_sugar_substitutes",
        categoryName: "Artificial Sweeteners / Sugar Substitutes",
        points: 25,
        reasonType: "direct_red_ingredient",
        message:
          "A red artificial-sweetener item was found, which adds a serious sweetener-system score.",
        matchedItem: match,
      });
    }

    if (
      match.sourcePacks.includes("preservatives_shelf_life_systems") &&
      isDirectRedIdMatch(match, preservativeRedIds)
    ) {
      candidates.push({
        scoreEntityId: match.canonicalIngredientId,
        categoryId: "preservatives_shelf_life_systems",
        categoryName: "Preservatives & Shelf-Life Systems",
        points: 25,
        reasonType: "direct_red_ingredient",
        message:
          "A red preservative item was found, which adds a serious shelf-life additive score.",
        matchedItem: match,
      });
    }
  });

  return candidates;
}

function collapseDirectScoreCandidates(candidates: DirectScoreCandidate[]) {
  const byEntity = new Map<string, DirectScoreCandidate>();

  candidates.forEach((candidate) => {
    const current = byEntity.get(candidate.scoreEntityId);

    if (!current) {
      byEntity.set(candidate.scoreEntityId, candidate);
      return;
    }

    if (candidate.points > current.points) {
      byEntity.set(candidate.scoreEntityId, candidate);
      return;
    }

    if (
      candidate.points === current.points &&
      directReasonRank[candidate.reasonType] < directReasonRank[current.reasonType]
    ) {
      byEntity.set(candidate.scoreEntityId, candidate);
    }
  });

  return [...byEntity.values()];
}

function getCountOverloadPoints(summary: IngredientCategorySummary) {
  if (summary.severity !== "red") {
    return 0;
  }

  if (summary.redReasonType === "count_overload") {
    return countOverloadRedScores[summary.categoryId] ?? 0;
  }

  if (summary.redReasonType === "category_combo_trigger") {
    return 0;
  }

  if (
    summary.redReasonType === "long_ingredient_list" ||
    summary.redReasonType === "high_processed_share"
  ) {
    return specialRedScores[summary.categoryId] ?? 0;
  }

  return 0;
}

function getYellowCategoryPoints(summary: IngredientCategorySummary) {
  if (summary.severity !== "yellow") {
    return 0;
  }

  if (summary.categoryId === "brand_trust_safety") {
    return summary.matchedItems.reduce((total, match) => {
      const points = brandTrustSignalYellowScores[match.canonicalIngredientId] ?? 0;
      return total + points;
    }, 0);
  }

  const perMatchPoints = yellowPerMatchScores[summary.categoryId];
  if (typeof perMatchPoints === "number") {
    return summary.matchCount * perMatchPoints;
  }

  return yellowFlatScores[summary.categoryId] ?? 0;
}

function getFloorRules(categorySummaries: IngredientCategorySummary[]) {
  const rules: FloorRule[] = [];
  const scorableSummaries = categorySummaries.filter(
    (summary) => !isScoreExcludedCategory(summary.categoryId),
  );
  const hasYellowCategory = scorableSummaries.some(
    (summary) => summary.displayAllowed && summary.severity === "yellow",
  );
  const redSummaries = scorableSummaries.filter(
    (summary) => summary.displayAllowed && summary.severity === "red",
  );

  if (hasYellowCategory) {
    rules.push({
      id: "yellow_review_floor",
      minimumScore: 25,
      reasonType: "yellow_floor",
      label: "Yellow review floor",
      message:
        "At least one yellow concern was found, so the product should not remain in the clean-pass band.",
    });
  }

  if (redSummaries.length > 0) {
    rules.push({
      id: "any_red_floor",
      minimumScore: 65,
      reasonType: "count_overload",
      label: "Any red category floor",
      message:
        "Any red category forces the score into the red band.",
    });
  }

  const hasSeriousRedCategory = redSummaries.some((summary) =>
    isSeriousRedSummary(summary),
  );

  if (hasSeriousRedCategory) {
    rules.push({
      id: "serious_red_floor",
      minimumScore: 80,
      reasonType: "verified_external_signal",
      label: "Serious red category floor",
      message:
        "A serious red category was found, so the score must be at least 80.",
    });
  }

  if (
    redSummaries.some(
      (summary) =>
        summary.categoryId === "allergy_risk" &&
        summary.redReasonType === "allergy_profile_match",
    )
  ) {
    rules.push({
      id: "allergy_profile_floor",
      minimumScore: 90,
      reasonType: "allergy_profile_match",
      label: "Allergy profile floor",
      message:
        "An allergy-profile match was found, so the score must be at least 90.",
    });
  }

  if (
    redSummaries.some(
      (summary) =>
        summary.categoryId === "brand_trust_safety" &&
        summary.redReasonType === "verified_external_signal",
    )
  ) {
    rules.push({
      id: "active_recall_floor",
      minimumScore: 90,
      reasonType: "verified_external_signal",
      label: "Active recall floor",
      message:
        "An active recall or public-health alert was found, so the score must be at least 90.",
    });
  }

  if (
    redSummaries.some((summary) => summary.categoryId === "banned_restricted_items")
  ) {
    rules.push({
      id: "banned_restricted_floor",
      minimumScore: 85,
      reasonType: "banned_restricted",
      label: "Banned or restricted floor",
      message:
        "A banned or restricted ingredient was found, so the score must be at least 85.",
    });
  }

  if (
    redSummaries.some(
      (summary) =>
        summary.categoryId === "hydrogenated_partially_hydrogenated_oils" &&
        summary.redReasonType === "direct_red_ingredient",
    )
  ) {
    rules.push({
      id: "hydrogenated_oil_floor",
      minimumScore: 80,
      reasonType: "direct_red_ingredient",
      label: "Partially hydrogenated oil floor",
      message:
        "Partially hydrogenated oil or a positive trans-fat marker was found, so the score must be at least 80.",
    });
  }

  if (
    redSummaries.some(
      (summary) =>
        summary.categoryId === "heavy_metals" &&
        summary.redReasonType === "verified_external_signal",
    )
  ) {
    rules.push({
      id: "heavy_metal_floor",
      minimumScore: 90,
      reasonType: "verified_external_signal",
      label: "Heavy metals floor",
      message:
        "A verified heavy-metal warning was found, so the score must be at least 90.",
    });
  }

  if (
    redSummaries.some(
      (summary) =>
        summary.categoryId === "microplastics" &&
        summary.redReasonType === "verified_external_signal",
    )
  ) {
    rules.push({
      id: "microplastic_floor",
      minimumScore: 85,
      reasonType: "verified_external_signal",
      label: "Microplastic floor",
      message:
        "A verified microplastic or nanoplastic signal was found, so the score must be at least 85.",
    });
  }

  return rules;
}

function isSeriousRedSummary(summary: IngredientCategorySummary) {
  if (summary.categoryId === "banned_restricted_items") {
    return true;
  }

  if (
    summary.categoryId === "allergy_risk" &&
    summary.redReasonType === "allergy_profile_match"
  ) {
    return true;
  }

  if (
    summary.categoryId === "brand_trust_safety" &&
    summary.redReasonType === "verified_external_signal"
  ) {
    return true;
  }

  if (summary.categoryId === "hydrogenated_partially_hydrogenated_oils") {
    return true;
  }

  if (
    summary.categoryId === "cancer_linked_watch" &&
    summary.redReasonType !== "count_overload"
  ) {
    return true;
  }

  if (
    (summary.categoryId === "heavy_metals" ||
      summary.categoryId === "microplastics") &&
    summary.redReasonType === "verified_external_signal"
  ) {
    return true;
  }

  return false;
}

function getMainReasonKey(summary: IngredientCategorySummary) {
  if (
    summary.categoryId === "allergy_risk" &&
    summary.redReasonType === "allergy_profile_match"
  ) {
    return "allergy_profile_match";
  }

  if (
    summary.categoryId === "brand_trust_safety" &&
    summary.severity === "red" &&
    summary.redReasonType === "verified_external_signal"
  ) {
    return "active_official_recall";
  }

  if (summary.categoryId === "banned_restricted_items") {
    return "banned_restricted_items";
  }

  if (
    (summary.categoryId === "heavy_metals" ||
      summary.categoryId === "microplastics") &&
    summary.redReasonType === "verified_external_signal"
  ) {
    return "verified_external_signal";
  }

  if (summary.categoryId === "hydrogenated_partially_hydrogenated_oils") {
    return "hydrogenated_partially_hydrogenated_oils";
  }

  if (
    summary.categoryId === "cancer_linked_watch" &&
    summary.severity === "red" &&
    summary.redReasonType !== "count_overload"
  ) {
    return "red_cancer_linked_watch";
  }

  if (
    summary.categoryId === "harmful_additives" &&
    summary.severity === "red" &&
    summary.redReasonType !== "count_overload"
  ) {
    return "red_harmful_additive";
  }

  if (summary.severity === "red" && summary.redReasonType === "count_overload") {
    return "count_overload";
  }

  if (summary.categoryId === "natural_vs_processed") {
    return "natural_vs_processed";
  }

  if (summary.categoryId === "total_ingredients") {
    return "total_ingredients";
  }

  return "yellow_category";
}

function buildMainReasons(categorySummaries: IngredientCategorySummary[]) {
  return categorySummaries
    .filter(
      (summary) =>
        !isScoreExcludedCategory(summary.categoryId) &&
        summary.displayAllowed &&
        (summary.severity === "red" || summary.severity === "yellow"),
    )
    .map((summary) => {
      const reasonKey = getMainReasonKey(summary);
      return {
        categoryId: summary.categoryId,
        categoryName: summary.categoryName,
        severity: summary.severity,
        reasonType:
          summary.severity === "red"
            ? (summary.redReasonType ?? "direct_red_ingredient")
            : ("yellow_category" as const),
        message: summary.shortMessage,
        matchedItems: uniqueStrings(
          summary.matchedItems.flatMap((match) => [
            match.displayName,
            ...match.originalIngredientTexts,
          ]),
        ).slice(0, 5),
        priority: mainReasonPriority[reasonKey] ?? mainReasonPriority.yellow_category,
      };
    })
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      if (left.severity !== right.severity) {
        return left.severity === "red" ? -1 : 1;
      }

      return left.categoryName.localeCompare(right.categoryName);
    })
    .slice(0, 5)
    .map((entry) => {
      const { priority, ...reason } = entry;
      void priority;
      return reason;
    });
}

function normalizeExternalSignals(
  signals: IngredientIntelligenceMatcherInput["externalSignals"],
) {
  return (signals ?? []).map((signal) =>
    normalizeIngredientIntelligenceText(flattenExternalSignalInput(signal)),
  );
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

function buildConfidenceNotes(input: ExposureRiskScoringInput) {
  const notes: string[] = [];
  const byCategoryId = new Map(
    input.categorySummaries.map((summary) => [summary.categoryId, summary]),
  );
  const normalizedSignals = normalizeExternalSignals(input.externalSignals);

  if (input.ingredientCount === 0) {
    notes.push("Ingredient-based warnings require a readable ingredient list.");
  }

  if (!byCategoryId.get("heavy_metals")?.displayAllowed) {
    notes.push(
      "Heavy metals require external testing or official data. Missing data is not proof of absence.",
    );
  }

  if (!byCategoryId.get("microplastics")?.displayAllowed) {
    notes.push(
      "Microplastic review depends on product type, packaging, or external testing data.",
    );
  }

  if (!byCategoryId.get("brand_trust_safety")?.displayAllowed) {
    notes.push(
      "No live brand safety or recall signal was found for this scan. Missing data is not proof of absence.",
    );
  }

  const hasExternalConcern = input.categorySummaries.some(
    (summary) =>
      ["brand_trust_safety", "heavy_metals", "microplastics"].includes(
        summary.categoryId,
      ) && summary.severity !== "green",
  );
  const hasBatchDetail = normalizedSignals.some((signal) =>
    ["batch", "lot", "lot code", "date", "region"].some((term) =>
      signal.includes(term),
    ),
  );

  if (hasExternalConcern && !hasBatchDetail) {
    notes.push(
      "Recall status may depend on batch, lot code, date, or region.",
    );
  }

  return uniqueStrings(notes);
}

function calculatePhase4ExposureRisk(
  input: ExposureRiskScoringInput,
): ExposureRiskResult {
  const scoreBreakdown: ExposureRiskScoreBreakdown[] = [];
  let score = 0;
  const scorableCategorySummaries = input.categorySummaries.filter(
    (summary) => !isScoreExcludedCategory(summary.categoryId),
  );

  const directCandidates = collapseDirectScoreCandidates(
    buildDirectScoreCandidates(input.duplicateSafeMatches),
  );

  directCandidates.forEach((candidate) => {
    score += candidate.points;
    addBreakdown(scoreBreakdown, {
      id: `direct_${candidate.categoryId}_${candidate.scoreEntityId}`,
      categoryId: candidate.categoryId,
      ingredientId: candidate.matchedItem.canonicalIngredientId,
      label: candidate.categoryName,
      points: candidate.points,
      reasonType: "direct_red_signal",
      message: candidate.message,
    });
  });

  scorableCategorySummaries.forEach((summary) => {
    const redPoints = getCountOverloadPoints(summary);
    if (redPoints > 0) {
      score += redPoints;
      addBreakdown(scoreBreakdown, {
        id: `count_overload_${summary.categoryId}`,
        categoryId: summary.categoryId,
        label: summary.categoryName,
        points: redPoints,
        reasonType: "count_overload",
        message: summary.shortMessage,
      });
    }

    const yellowPoints = getYellowCategoryPoints(summary);
    if (yellowPoints > 0) {
      score += yellowPoints;
      addBreakdown(scoreBreakdown, {
        id: `yellow_${summary.categoryId}`,
        categoryId: summary.categoryId,
        label: summary.categoryName,
        points: yellowPoints,
        reasonType: "yellow_category",
        message: summary.shortMessage,
      });
    }
  });

  const hasRedCategory = scorableCategorySummaries.some(
    (summary) => summary.displayAllowed && summary.severity === "red",
  );
  const hasDirectRedSignal = directCandidates.length > 0;
  const floorRules = getFloorRules(scorableCategorySummaries);
  const appliedFloor = floorRules
    .sort((left, right) => {
      if (left.minimumScore !== right.minimumScore) {
        return right.minimumScore - left.minimumScore;
      }

      return left.id.localeCompare(right.id);
    })
    .find((rule) => rule.minimumScore > score);

  if (appliedFloor) {
    const delta = appliedFloor.minimumScore - score;
    score = appliedFloor.minimumScore;
    addBreakdown(scoreBreakdown, {
      id: appliedFloor.id,
      label: appliedFloor.label,
      points: delta,
      reasonType:
        appliedFloor.reasonType === "yellow_floor"
          ? "yellow_floor"
          : "minimum_floor",
      message: appliedFloor.message,
    });
  }

  if (!hasRedCategory && !hasDirectRedSignal && score > 64) {
    const delta = 64 - score;
    score = 64;
    addBreakdown(scoreBreakdown, {
      id: "yellow_only_cap",
      label: "Yellow-only cap",
      points: delta,
      reasonType: "yellow_only_cap",
      message:
        "Yellow-only concerns stay below the red band unless a red category or direct red signal is present.",
    });
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const verdict = toVerdict(finalScore);
  const redReasonTypes = uniqueStrings(
    scorableCategorySummaries
      .filter((summary) => summary.severity === "red")
      .map((summary) => summary.redReasonType)
      .filter((value): value is RedReasonType => typeof value === "string"),
  ) as RedReasonType[];

  return {
    exposureRisk: finalScore,
    riskBand: verdict.riskBand,
    verdictLabel: verdict.verdictLabel,
    verdictMessage: verdict.verdictMessage,
    verdictTone: verdict.verdictTone,
    mainReasons: buildMainReasons(scorableCategorySummaries),
    scoreBreakdown,
    redReasonTypes,
    confidenceNotes: buildConfidenceNotes(input),
    duplicateSafeScoring: true,
    hasRedIssue: hasRedCategory,
    hasSeriousRedIssue: scorableCategorySummaries.some((summary) =>
      isSeriousRedSummary(summary),
    ),
    hasAllergyRisk: scorableCategorySummaries.some(
      (summary) =>
        summary.categoryId === "allergy_risk" &&
        summary.redReasonType === "allergy_profile_match",
    ),
  };
}

function findCheck(
  checkResults: ExposureCheckResult[],
  id: ExposureCheckResult["id"],
) {
  return checkResults.find((check) => check.id === id);
}

function hasPositiveCount(check?: ExposureCheckResult) {
  if (!check || !check.hasMeaningfulValue) {
    return false;
  }

  if (check.redCount + check.yellowCount > 0) {
    return true;
  }

  if (typeof check.value === "number") {
    return check.value > 0;
  }

  if (typeof check.value !== "string") {
    return false;
  }

  return !["no", "clear", "0", "none", "none found"].includes(
    check.value.trim().toLowerCase(),
  );
}

function calculateLegacyExposureRisk(
  input: LegacyExposureRiskInput,
): Pick<
  ExposureRiskResult,
  "exposureRisk" | "hasRedIssue" | "hasSeriousRedIssue" | "hasAllergyRisk"
> {
  const harmfulAdditives = findCheck(input.checkResults, "harmful_additives");
  const bannedRestricted = findCheck(
    input.checkResults,
    "banned_restricted_items",
  );
  const cancerLinkedWatch = findCheck(input.checkResults, "cancer_linked_watch");
  const microplastics = findCheck(input.checkResults, "microplastics");
  const heavyMetals = findCheck(input.checkResults, "heavy_metals");
  const brandTrustSafety = findCheck(input.checkResults, "brand_trust_safety");
  const lawsuitsRecalls = findCheck(input.checkResults, "lawsuits_recalls");
  const ingredientCount = findCheck(input.checkResults, "ingredient_count");
  const allergyRisk = findCheck(input.checkResults, "allergy_risk");
  const seedOil = findCheck(input.checkResults, "seed_oil");
  const ultraProcessed = findCheck(input.checkResults, "ultra_processed");
  const preservatives = findCheck(input.checkResults, "preservatives");
  const artificialSweeteners = findCheck(
    input.checkResults,
    "artificial_sweeteners",
  );

  const emulsifiers = input.additivesBreakdown.find(
    (item) => item.id === "emulsifiers",
  );
  const stabilisersThickeners = input.additivesBreakdown.find(
    (item) => item.id === "stabilisers_thickeners",
  );
  const flavourEnhancers = input.additivesBreakdown.find(
    (item) => item.id === "flavour_enhancers",
  );
  const textureAdditiveCount =
    (emulsifiers?.count ?? 0) + (stabilisersThickeners?.count ?? 0);
  const flavourSystemCount = flavourEnhancers?.count ?? 0;
  const harmfulAdditiveCount =
    (harmfulAdditives?.redCount ?? 0) + (harmfulAdditives?.yellowCount ?? 0);
  const automaticRedIssue =
    hasPositiveCount(allergyRisk) ||
    hasPositiveCount(bannedRestricted) ||
    hasPositiveCount(cancerLinkedWatch) ||
    hasPositiveCount(microplastics) ||
    hasPositiveCount(heavyMetals) ||
    brandTrustSafety?.severity === "red" ||
    lawsuitsRecalls?.severity === "red";
  const countBasedRedIssue =
    harmfulAdditiveCount >= 3 ||
    artificialSweeteners?.severity === "red" ||
    textureAdditiveCount >= 3 ||
    flavourSystemCount >= 3 ||
    input.ingredientClassification.totalCount >= 15 ||
    input.ingredientClassification.processedCount >= 6 ||
    input.ingredientClassification.processedPercent >= 60 ||
    ultraProcessed?.severity === "red" ||
    seedOil?.severity === "red";

  let risk = 0;

  if (hasPositiveCount(allergyRisk)) {
    risk += 45;
  }

  if (hasPositiveCount(bannedRestricted)) {
    risk += 35;
  }

  if (hasPositiveCount(cancerLinkedWatch)) {
    risk += 30;
  }

  if (hasPositiveCount(microplastics)) {
    risk += 30;
  }

  if (hasPositiveCount(heavyMetals)) {
    risk += 30;
  }

  if (brandTrustSafety?.severity === "red") {
    risk += 30;
  }

  if (lawsuitsRecalls?.severity === "red") {
    risk += 40;
  }

  if (harmfulAdditiveCount >= 3) {
    risk += 20;
  } else if (harmfulAdditiveCount >= 1) {
    risk += 8;
  }

  if (input.ingredientClassification.totalCount >= 15) {
    risk += 15;
  }

  if (input.ingredientClassification.processedPercent >= 60) {
    risk += 20;
  }

  if (ingredientCount?.severity === "red") {
    risk += 15;
  }

  if (seedOil?.severity === "red") {
    risk += 18;
  } else if (hasPositiveCount(seedOil)) {
    risk += 8;
  }

  if (ultraProcessed?.severity === "red") {
    risk += 25;
  } else if (ultraProcessed?.severity === "yellow") {
    risk += 10;
  }

  risk += input.ingredientClassification.processedCount * 3;
  risk += input.ingredientClassification.unknownCount * 2;

  if (hasPositiveCount(preservatives)) {
    risk += 6;
  }

  if (textureAdditiveCount >= 3) {
    risk += 22;
  } else if (textureAdditiveCount > 0) {
    risk += 8;
  }

  if (flavourSystemCount >= 3) {
    risk += 22;
  } else if (flavourSystemCount > 0) {
    risk += 8;
  }

  if (artificialSweeteners?.severity === "red") {
    risk += 20;
  } else if (hasPositiveCount(artificialSweeteners)) {
    risk += 6;
  }

  const hasRedIssue = automaticRedIssue || countBasedRedIssue;
  const hasSeriousRedIssue = automaticRedIssue;
  const hasAllergyRisk = hasPositiveCount(allergyRisk);

  if (!hasRedIssue && risk > 64) {
    risk = 64;
  }

  if (hasRedIssue && risk < 65) {
    risk = 65;
  }

  if (hasSeriousRedIssue && risk < 80) {
    risk = 80;
  }

  if (hasAllergyRisk && risk < 90) {
    risk = 90;
  }

  return {
    exposureRisk: Math.min(100, risk),
    hasRedIssue,
    hasSeriousRedIssue,
    hasAllergyRisk,
  };
}

function buildLegacyCompatibleResult(
  legacyResult: Pick<
    ExposureRiskResult,
    "exposureRisk" | "hasRedIssue" | "hasSeriousRedIssue" | "hasAllergyRisk"
  >,
): ExposureRiskResult {
  const verdict = toVerdict(legacyResult.exposureRisk);

  return {
    exposureRisk: legacyResult.exposureRisk,
    riskBand: verdict.riskBand,
    verdictLabel: verdict.verdictLabel,
    verdictMessage: verdict.verdictMessage,
    verdictTone: verdict.verdictTone,
    mainReasons: [],
    scoreBreakdown: [],
    redReasonTypes: [],
    confidenceNotes: [],
    duplicateSafeScoring: true,
    hasRedIssue: legacyResult.hasRedIssue,
    hasSeriousRedIssue: legacyResult.hasSeriousRedIssue,
    hasAllergyRisk: legacyResult.hasAllergyRisk,
  };
}

export function calculateExposureRiskFromCategorySummaries(
  input: ExposureRiskScoringInput,
) {
  return calculatePhase4ExposureRisk(input);
}

export function calculateExposureRisk(
  input: CalculateExposureRiskInput,
): ExposureRiskResult {
  if (isLegacyExposureRiskInput(input)) {
    return buildLegacyCompatibleResult(calculateLegacyExposureRisk(input));
  }

  return calculatePhase4ExposureRisk(input);
}
