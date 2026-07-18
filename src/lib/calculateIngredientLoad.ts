import type { IngredientCategorySummary } from "@/lib/ingredientCategoryRules";
import {
  normalizeIngredientIntelligenceText,
  type IngredientIntelligenceDuplicateSafeMatch,
} from "@/lib/ingredientIntelligenceMatcher";

export const INGREDIENT_LOAD_POINTS = {
  fortification: 0.5,
  simple: 1,
  processed: 2,
  unclear: 2,
  industrial: 3,
  yellow: 5,
  red: 25,
} as const;

export const INGREDIENT_LOAD_REFERENCE = 60;

export type IngredientLoadClass = keyof typeof INGREDIENT_LOAD_POINTS;
export type IngredientLoadTone = "green" | "yellow" | "red";
export type IngredientLoadLevel =
  | "Low Ingredient Load"
  | "Moderate Ingredient Load"
  | "High Ingredient Load"
  | "Very High Ingredient Load";

export type ScoredIngredient = {
  canonicalIngredientId: string;
  displayName: string;
  originalIngredientTexts: string[];
  loadClass: IngredientLoadClass;
  points: number;
  matchedCategories: string[];
};

export type IngredientLoadResult = {
  rawLoad: number;
  score: number;
  referenceLoad: typeof INGREDIENT_LOAD_REFERENCE;
  level: IngredientLoadLevel;
  tone: IngredientLoadTone;
  message: string;
  scoredIngredients: ScoredIngredient[];
};

export type CalculateIngredientLoadInput = {
  ingredients: string[];
  duplicateSafeMatches: IngredientIntelligenceDuplicateSafeMatch[];
  categorySummaries: IngredientCategorySummary[];
};

const individuallySeriousReasonTypes = new Set([
  "banned_restricted",
  "direct_red_ingredient",
  "verified_external_signal",
]);

const yellowConcernCategoryIds = new Set([
  "artificial_colours",
  "artificial_sweeteners_sugar_substitutes",
  "preservatives_shelf_life_systems",
  "emulsifiers_stabilisers_thickeners_gums",
  "flavour_enhancers_flavourings",
  "seed_oils_processed_oils",
  "hydrogenated_partially_hydrogenated_oils",
  "harmful_additives",
  "cancer_linked_watch",
  "fry_oil_fast_food_oil",
]);

const fortificationPattern = new RegExp(
  [
    "ascorbic acid",
    "folic acid",
    "niacin",
    "thiamine mononitrate",
    "riboflavin",
    "pyridoxine hydrochloride",
    "cyanocobalamin",
    "vitamin a palmitate",
    "vitamin d3",
    "ferrous sulfate",
    "ferrous sulphate",
    "reduced iron",
    "zinc oxide",
    "calcium carbonate",
    "calcium phosphate",
    "vitamin premix",
    "mineral premix",
    "nutrient premix",
  ].join("|"),
);

const standardProcessedPattern = new RegExp(
  [
    "milk powder",
    "whey powder",
    "fruit concentrate",
    "juice concentrate",
    "refined flour",
    "cocoa mass",
    "cocoa butter",
    "cheese powder",
    "syrup",
    "refined starch",
    "dried",
    "dehydrated",
    "reconstituted",
    "rehydrated",
  ].join("|"),
);

const industrialPattern = new RegExp(
  [
    "maltodextrin",
    "modified starch",
    "modified food starch",
    "protein isolate",
    "protein concentrate",
    "hydrolyzed protein",
    "hydrolysed protein",
    "hydrolyzed vegetable protein",
    "hydrolysed vegetable protein",
    "non dairy creamer",
    "textured vegetable protein",
    "textured soy protein",
    "interesterified fat",
    "interesterified oil",
    "structured fat",
    "meat binder",
    "meat filler",
    "meat extender",
    "mechanically separated",
    "mechanically recovered",
    "mechanically deboned",
    "reformed meat",
    "restructured meat",
    "reconstructed meat",
  ].join("|"),
);

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function getIngredientLoadPresentation(score: number): Pick<
  IngredientLoadResult,
  "level" | "tone" | "message"
> {
  if (score <= 24) {
    return {
      level: "Low Ingredient Load",
      tone: "green",
      message:
        "This product has a lighter overall ingredient load. Most ingredients make only a small contribution to the score.",
    };
  }

  if (score <= 49) {
    return {
      level: "Moderate Ingredient Load",
      tone: "yellow",
      message:
        "This product has a noticeable ingredient load. This does not mean you need to avoid it, but you may want to consume it in moderation.",
    };
  }

  if (score <= 74) {
    return {
      level: "High Ingredient Load",
      tone: "red",
      message:
        "This product has a heavy ingredient load from its overall formula, processed ingredients, or serious concerns. Consider limiting how often you consume it.",
    };
  }

  return {
    level: "Very High Ingredient Load",
    tone: "red",
    message:
      "This product has a very heavy ingredient load with multiple serious, moderate, or highly processed ingredients. Truthlabel recommends choosing a simpler alternative.",
  };
}

function getMatchesByIngredient(
  ingredients: string[],
  matches: IngredientIntelligenceDuplicateSafeMatch[],
) {
  const result = new Map<string, IngredientIntelligenceDuplicateSafeMatch[]>();

  ingredients.forEach((ingredient) => {
    const normalizedIngredient = normalizeIngredientIntelligenceText(ingredient);
    if (!normalizedIngredient || result.has(normalizedIngredient)) {
      return;
    }

    result.set(
      normalizedIngredient,
      matches.filter((match) =>
        match.originalIngredientTexts.some(
          (originalText) =>
            normalizeIngredientIntelligenceText(originalText) ===
            normalizedIngredient,
        ),
      ),
    );
  });

  return result;
}

function getConcernCanonicalIds(categorySummaries: IngredientCategorySummary[]) {
  const red = new Set<string>();
  const yellow = new Set<string>();

  categorySummaries.forEach((summary) => {
    if (!summary.displayAllowed || summary.severity === "green") {
      return;
    }

    if (
      summary.severity === "red" &&
      summary.redReasonType &&
      individuallySeriousReasonTypes.has(summary.redReasonType) &&
      summary.categoryId !== "allergy_risk"
    ) {
      summary.matchedItems.forEach((match) => {
        if (
          summary.categoryId === "banned_restricted_items" ||
          match.basicSeveritySuggestion === "red"
        ) {
          red.add(match.canonicalIngredientId);
        }
      });
    }

    if (yellowConcernCategoryIds.has(summary.categoryId)) {
      summary.matchedItems.forEach((match) => {
        if (!red.has(match.canonicalIngredientId)) {
          yellow.add(match.canonicalIngredientId);
        }
      });
    }
  });

  return { red, yellow };
}

function chooseCanonicalMatch(
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  redCanonicalIds: Set<string>,
  yellowCanonicalIds: Set<string>,
) {
  return (
    matches.find((match) => redCanonicalIds.has(match.canonicalIngredientId)) ??
    matches.find((match) => yellowCanonicalIds.has(match.canonicalIngredientId)) ??
    matches.find((match) => !match.sourcePacks.includes("allergy_risk")) ??
    matches[0]
  );
}

function classifyIngredient(
  normalizedIngredient: string,
  matches: IngredientIntelligenceDuplicateSafeMatch[],
  redCanonicalIds: Set<string>,
  yellowCanonicalIds: Set<string>,
): IngredientLoadClass {
  if (matches.some((match) => redCanonicalIds.has(match.canonicalIngredientId))) {
    return "red";
  }

  if (fortificationPattern.test(normalizedIngredient)) {
    return "fortification";
  }

  if (standardProcessedPattern.test(normalizedIngredient)) {
    return "processed";
  }

  if (industrialPattern.test(normalizedIngredient)) {
    return "industrial";
  }

  if (matches.some((match) => match.sourcePacks.includes("unknown_review"))) {
    return "unclear";
  }

  if (matches.some((match) => yellowCanonicalIds.has(match.canonicalIngredientId))) {
    return "yellow";
  }

  return "simple";
}

export function calculateIngredientLoad(
  input: CalculateIngredientLoadInput,
): IngredientLoadResult {
  const { red, yellow } = getConcernCanonicalIds(input.categorySummaries);
  const matchesByIngredient = getMatchesByIngredient(
    input.ingredients,
    input.duplicateSafeMatches,
  );
  const uniqueIngredients = new Map<string, ScoredIngredient>();

  matchesByIngredient.forEach((matches, normalizedIngredient) => {
    const originalIngredientTexts = uniqueStrings(
      input.ingredients.filter(
        (ingredient) =>
          normalizeIngredientIntelligenceText(ingredient) === normalizedIngredient,
      ),
    );
    const representative = chooseCanonicalMatch(matches, red, yellow);
    const loadClass = classifyIngredient(
      normalizedIngredient,
      matches,
      red,
      yellow,
    );
    // Allergen groups intentionally group related foods, but butter and milk are
    // still separate label ingredients and must each contribute to ingredient load.
    const representativeCanonicalId = representative?.canonicalIngredientId;
    const canonicalIngredientId =
      representativeCanonicalId && !representativeCanonicalId.startsWith("allergy_")
        ? representativeCanonicalId
        : `ingredient_${normalizedIngredient}`;
    const scoredIngredient: ScoredIngredient = {
      canonicalIngredientId,
      displayName: representative?.displayName ?? originalIngredientTexts[0] ?? normalizedIngredient,
      originalIngredientTexts,
      loadClass,
      points: INGREDIENT_LOAD_POINTS[loadClass],
      matchedCategories: uniqueStrings(
        matches.flatMap((match) => match.matchedCategories),
      ),
    };
    const current = uniqueIngredients.get(canonicalIngredientId);

    if (!current || scoredIngredient.points > current.points) {
      uniqueIngredients.set(canonicalIngredientId, scoredIngredient);
      return;
    }

    if (current.points === scoredIngredient.points) {
      uniqueIngredients.set(canonicalIngredientId, {
        ...current,
        originalIngredientTexts: uniqueStrings([
          ...current.originalIngredientTexts,
          ...scoredIngredient.originalIngredientTexts,
        ]),
        matchedCategories: uniqueStrings([
          ...current.matchedCategories,
          ...scoredIngredient.matchedCategories,
        ]),
      });
    }
  });

  const scoredIngredients = [...uniqueIngredients.values()];
  const rawLoad = scoredIngredients.reduce(
    (total, ingredient) => total + ingredient.points,
    0,
  );
  const score = Math.min(
    100,
    Math.round((rawLoad / INGREDIENT_LOAD_REFERENCE) * 100),
  );

  return {
    rawLoad,
    score,
    referenceLoad: INGREDIENT_LOAD_REFERENCE,
    ...getIngredientLoadPresentation(score),
    scoredIngredients,
  };
}
