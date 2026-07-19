import { bannedRestricted, type RestrictedIngredient } from "@/data/bannedRestricted";
import { type ConcernLevel, type UserProfile } from "@/data/fakeProduct";
import { warningTemplates } from "@/data/warningTemplates";
import {
  buildIngredientModal,
  buildNutrientModal,
  buildScanCheckModal,
  ingredientMatchesAllergy,
  type AnalyzedIngredient,
  type AnalyzedNutrient,
  type ImmediateWarning,
  type ProductAnalysis,
  type ScanCheckItem,
} from "@/lib/analyzeProduct";
import {
  findArtificialColourMatches,
  summarizeArtificialColourMatches,
  type MergedArtificialColour,
} from "@/lib/ingredientIntelligence/artificialColours";
import { findArtificialSweetenerMatches } from "@/lib/ingredientIntelligence/artificialSweeteners";
import { summarizeArtificialSweetenerMatches } from "@/lib/ingredientIntelligence/artificialSweeteners";
import { findTextureAdditiveMatches } from "@/lib/ingredientIntelligence/emulsifiersStabilisersGums";
import { summarizeTextureAdditiveMatches } from "@/lib/ingredientIntelligence/emulsifiersStabilisersGums";
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
import {
  findSeedOilProcessedOilMatches,
  summarizeSeedOilProcessedOilMatches,
} from "@/lib/ingredientIntelligence/seedOilsProcessedOils";
import {
  findUltraProcessedAutomaticRedTriggers,
  findUltraProcessedIndicatorMatches,
  summarizeUltraProcessedIndicatorMatches,
} from "@/lib/ingredientIntelligence/ultraProcessedIndicators";
import {
  calculateConcernScore,
  getConcernDetail,
  getConcernLabel,
} from "@/lib/scoring";
import { buildOverallSummary } from "@/lib/summaryEngine";
import type { NormalizedIngredient, NormalizedNutrient, NormalizedProduct } from "@/types/product";

const additiveTerms = [
  "colour",
  "color",
  "flavour",
  "flavor",
  "sweetener",
  "stabilizer",
  "emulsifier",
  "emulsifiers",
  "vanillin",
  "maltodextrin",
] as const;

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function matchesTerms(value: string, terms: readonly string[]) {
  const normalizedValue = normalizeForMatch(value);
  return terms.some((term) => normalizedValue.includes(normalizeForMatch(term)));
}

function findRestrictedIngredient(value: string) {
  const normalizedValue = normalizeForMatch(value);
  return Object.values(bannedRestricted).find(
    (entry): entry is RestrictedIngredient =>
      Boolean(entry) &&
      entry.aliases.some((alias) => normalizedValue.includes(normalizeForMatch(alias))),
  );
}

function getPrimaryArtificialColourMatch(matches: MergedArtificialColour[]) {
  return matches.find((match) => match.severity === "red") ?? matches[0];
}

function toRestrictedIngredient(match: MergedArtificialColour): RestrictedIngredient {
  const regionNote =
    match.restrictedRegions.length > 0
      ? `Restricted or removed in ${match.restrictedRegions.join(", ")}.`
      : "Restricted colour watch item.";

  return {
    name: match.canonicalName,
    aliases: [
      match.canonicalName,
      ...match.aliases,
      ...match.eNumbers,
      ...match.insNumbers.map((value) => `INS ${value}`),
    ],
    regionNote,
    whyFlagged: match.restrictionReason,
    whatToDo: "Avoid this ingredient where possible.",
  };
}

function buildArtificialColourStatus(summary: ReturnType<typeof summarizeArtificialColourMatches>) {
  if (summary.totalCount === 0) {
    return "None found";
  }

  if (summary.hasAutomaticRed) {
    return "Found";
  }

  if (summary.categorySeverity === "red") {
    return "High load";
  }

  return "Found";
}

function buildArtificialColourExplanation(
  summary: ReturnType<typeof summarizeArtificialColourMatches>,
) {
  if (summary.totalCount === 0) {
    return "No artificial colour warning was found in the available label data.";
  }

  if (summary.hasAutomaticRed) {
    const names = summary.redItems.map((item) => item.canonicalName).join(", ");
    return `${names} triggered a serious artificial-colour warning in this product.`;
  }

  if (summary.totalCount >= 3) {
    return "This product contains multiple artificial colours, which Truthlabel treats as a high artificial colour load.";
  }

  return "Artificial colour additives were found in this product.";
}

function buildFlavourSystemStatus(
  summary: ReturnType<typeof summarizeFlavourSystemMatches>,
) {
  if (summary.totalCount === 0) {
    return "None found";
  }

  if (summary.hasAutomaticRed) {
    return "Found";
  }

  if (summary.categorySeverity === "red") {
    return "High load";
  }

  return String(summary.totalCount);
}

function buildFlavourSystemExplanation(
  summary: ReturnType<typeof summarizeFlavourSystemMatches>,
) {
  if (summary.totalCount === 0) {
    return "No flavour-system marker was found in the available label data.";
  }

  if (summary.hasAutomaticRed) {
    const names = summary.redItems.map((item) => item.mainName).join(", ");
    return `${names} triggered the banned/restricted flavouring rule.`;
  }

  if (summary.totalCount >= 3) {
    return "This product contains multiple flavouring or flavour-enhancing systems. Truthlabel treats this as a high flavour-system load.";
  }

  return "This product contains flavourings or flavour enhancers that build or boost taste.";
}

function buildProcessedOilStatus(
  summary: ReturnType<typeof summarizeSeedOilProcessedOilMatches>,
  hydrogenatedSummary: ReturnType<
    typeof summarizeHydrogenatedPartiallyHydrogenatedOilMatches
  >,
) {
  if (hydrogenatedSummary.hasPartiallyHydrogenatedOil) {
    return "PHO found";
  }

  if (hydrogenatedSummary.hasTransFatMarker) {
    return "Trans fat found";
  }

  if (hydrogenatedSummary.hasHydrogenatedOil) {
    return "Hydrogenated found";
  }

  if (summary.totalCount === 0) {
    return "None found";
  }

  if (summary.categorySeverity === "red") {
    return "High load";
  }

  return String(summary.totalCount);
}

function buildHydrogenatedOilStatus(
  summary: ReturnType<typeof summarizeHydrogenatedPartiallyHydrogenatedOilMatches>,
) {
  if (summary.totalCount === 0) {
    return "No";
  }

  if (summary.hasPartiallyHydrogenatedOil) {
    return "PHO found";
  }

  if (summary.hasTransFatMarker) {
    return "Trans fat found";
  }

  return "Review";
}

function buildHydrogenatedOilExplanation(
  summary: ReturnType<typeof summarizeHydrogenatedPartiallyHydrogenatedOilMatches>,
) {
  if (summary.totalCount === 0) {
    return "No hydrogenated or partially hydrogenated oils were found from the available ingredient list.";
  }

  const names = summary.matchedItems.map((item) => item.mainName).join(", ");

  if (summary.hasPartiallyHydrogenatedOil) {
    return `${names} triggered the partially hydrogenated oil regulatory concern.`;
  }

  if (summary.hasTransFatMarker) {
    return `${names} triggered the positive trans-fat marker rule.`;
  }

  return `${names} triggered a hydrogenated processed-fat review marker.`;
}

function buildUltraProcessedStatus(
  summary: ReturnType<typeof summarizeUltraProcessedIndicatorMatches>,
  novaGroup?: number,
) {
  if (summary.hasAutomaticRed) {
    return "Red marker";
  }

  if (summary.categorySeverity === "red") {
    return "High load";
  }

  if (summary.categorySeverity === "yellow") {
    return String(summary.totalCount);
  }

  if (novaGroup === 4) {
    return "Likely";
  }

  return "No";
}

function buildUltraProcessedExplanation(
  summary: ReturnType<typeof summarizeUltraProcessedIndicatorMatches>,
  novaGroup?: number,
) {
  if (summary.hasAutomaticRed) {
    const triggerNames = summary.automaticRedTriggers
      .map((trigger) => trigger.label)
      .join(", ");

    return `${triggerNames} triggered a red rule in another category, so this ultra-processed check is red too.`;
  }

  if (summary.categorySeverity === "red") {
    return "This product contains multiple ultra-processed markers. Truthlabel treats this as a high ultra-processed load.";
  }

  if (summary.categorySeverity === "yellow") {
    return "This product contains ultra-processed markers that suggest the food is processed, stabilised, flavour-built, texture-built, or made from ingredient systems.";
  }

  if (novaGroup === 4) {
    return "Nova group 4 suggests a more ultra-processed product, but ingredient-marker detail is limited.";
  }

  return "No ultra-processed markers were found from the available ingredient list.";
}

function buildProcessedOilExplanation(
  summary: ReturnType<typeof summarizeSeedOilProcessedOilMatches>,
  hydrogenatedSummary: ReturnType<
    typeof summarizeHydrogenatedPartiallyHydrogenatedOilMatches
  >,
) {
  if (hydrogenatedSummary.totalCount > 0) {
    const names = hydrogenatedSummary.matchedItems
      .map((item) => item.mainName)
      .join(", ");

    if (hydrogenatedSummary.hasPartiallyHydrogenatedOil) {
      return `${names} triggered the partially hydrogenated oil rule.`;
    }

    if (hydrogenatedSummary.hasTransFatMarker) {
      return `${names} triggered the positive trans-fat marker rule.`;
    }

    return `${names} triggered a hydrogenated processed-fat review marker.`;
  }

  if (summary.totalCount === 0) {
    return "No seed oil or processed-oil marker was found in the available label data.";
  }

  if (summary.totalCount >= 3) {
    return "This product contains multiple seed oils, processed oils, refined oils, or processed fat systems. Truthlabel treats this as a high processed-oil load.";
  }

  return "This product contains a seed oil, processed oil, refined oil, frying oil, or processed fat marker.";
}

function getIngredientSearchText(ingredient: NormalizedIngredient) {
  return [ingredient.name, ingredient.text].filter(Boolean).join(" ");
}

function getMatchedAllergies(
  ingredientText: string,
  allergenTags: string[],
  profile: UserProfile,
) {
  return profile.allergies.filter((allergy) => {
    const ingredientMatch = ingredientMatchesAllergy(ingredientText, allergy);
    const allergenTagMatch = allergenTags.some((tag) =>
      ingredientMatchesAllergy(tag, allergy),
    );

    return ingredientMatch || allergenTagMatch;
  });
}

function getNutrientLevel(
  name: "Sugar" | "Salt" | "Sodium" | "Saturated fat" | "Fibre" | "Protein" | "Fat" | "Calories",
  value: number | undefined,
): { level: ConcernLevel; band: string; isEnoughData: boolean } {
  if (value === undefined) {
    return {
      level: "green",
      band: "Not enough label data",
      isEnoughData: false,
    };
  }

  if (name === "Sugar") {
    if (value >= 22.5) {
      return { level: "red", band: "Very high", isEnoughData: true };
    }

    if (value >= 5) {
      return { level: "yellow", band: "Review", isEnoughData: true };
    }

    return { level: "green", band: "Low", isEnoughData: true };
  }

  if (name === "Salt") {
    if (value >= 1.5) {
      return { level: "red", band: "Very high", isEnoughData: true };
    }

    if (value >= 0.3) {
      return { level: "yellow", band: "Review", isEnoughData: true };
    }

    return { level: "green", band: "Low", isEnoughData: true };
  }

  if (name === "Sodium") {
    if (value >= 0.6) {
      return { level: "red", band: "Very high", isEnoughData: true };
    }

    if (value >= 0.12) {
      return { level: "yellow", band: "Review", isEnoughData: true };
    }

    return { level: "green", band: "Low", isEnoughData: true };
  }

  if (name === "Saturated fat") {
    if (value >= 5) {
      return { level: "red", band: "Very high", isEnoughData: true };
    }

    if (value >= 1.5) {
      return { level: "yellow", band: "Review", isEnoughData: true };
    }

    return { level: "green", band: "Low", isEnoughData: true };
  }

  if (name === "Fibre") {
    if (value <= 3) {
      return { level: "yellow", band: "Low", isEnoughData: true };
    }

    return { level: "green", band: "Supportive", isEnoughData: true };
  }

  if (name === "Protein") {
    return { level: "green", band: "Listed", isEnoughData: true };
  }

  if (name === "Fat") {
    return { level: "green", band: "Listed", isEnoughData: true };
  }

  return { level: "green", band: "Listed", isEnoughData: true };
}

function buildGenericIngredientSummary(ingredient: NormalizedIngredient) {
  if (ingredient.text && ingredient.text !== ingredient.name) {
    return `Shown on the label as "${ingredient.text}".`;
  }

  return "Listed on the product label.";
}

function buildRealIngredientAnalysis(
  ingredient: NormalizedIngredient,
  product: NormalizedProduct,
  profile: UserProfile,
  watchListHits: Set<string>,
) {
  const ingredientText = getIngredientSearchText(ingredient);
  const matchedAllergies = getMatchedAllergies(ingredientText, product.allergens, profile);
  const artificialColourMatches = findArtificialColourMatches(ingredientText);
  const primaryArtificialColour = getPrimaryArtificialColourMatch(artificialColourMatches);
  const restrictedArtificialColour = artificialColourMatches.find(
    (match) => match.severity === "red",
  );
  const restricted =
    restrictedArtificialColour !== undefined
      ? toRestrictedIngredient(restrictedArtificialColour)
      : findRestrictedIngredient(ingredientText);
  const textureAdditiveMatches = findTextureAdditiveMatches(ingredientText);
  const textureAdditiveSummary = summarizeTextureAdditiveMatches(textureAdditiveMatches);
  const matchesTextureAdditive = textureAdditiveSummary.totalCount > 0;
  const flavourSystemMatches = findFlavourSystemMatches(ingredientText);
  const flavourSystemSummary = summarizeFlavourSystemMatches(flavourSystemMatches);
  const matchesFlavourSystem = flavourSystemSummary.totalCount > 0;
  const matchesAdditives =
    artificialColourMatches.length > 0 ||
    matchesTextureAdditive ||
    matchesFlavourSystem ||
    matchesTerms(ingredientText, additiveTerms) ||
    product.additives.some((tag) =>
      normalizeForMatch(ingredientText).includes(normalizeForMatch(tag)),
    );
  const preservativeMatches = findPreservativeMatches(ingredientText);
  const preservativeSummary = summarizePreservativeMatches(preservativeMatches);
  const matchesPreservatives = preservativeSummary.totalCount > 0;
  const seedOilMatches = findSeedOilProcessedOilMatches(ingredientText);
  const seedOilSummary = summarizeSeedOilProcessedOilMatches(seedOilMatches);
  const hydrogenatedOilMatches =
    findHydrogenatedPartiallyHydrogenatedOilMatches(ingredientText);
  const hydrogenatedOilSummary =
    summarizeHydrogenatedPartiallyHydrogenatedOilMatches(hydrogenatedOilMatches);
  const ultraProcessedIndicatorMatches =
    findUltraProcessedIndicatorMatches(ingredientText);
  const ultraProcessedAutomaticRedTriggers =
    findUltraProcessedAutomaticRedTriggers(ingredientText);
  const ultraProcessedIndicatorSummary =
    summarizeUltraProcessedIndicatorMatches(
      ultraProcessedIndicatorMatches,
      ultraProcessedAutomaticRedTriggers,
    );
  const matchesProcessedOil =
    seedOilSummary.totalCount > 0 || hydrogenatedOilSummary.totalCount > 0;
  const matchesUltraProcessedIndicator = ultraProcessedIndicatorMatches.length > 0;
  const artificialSweetenerMatches = findArtificialSweetenerMatches(ingredientText);
  const artificialSweetenerSummary =
    summarizeArtificialSweetenerMatches(artificialSweetenerMatches);
  const matchesArtificialSweetener = artificialSweetenerSummary.totalCount > 0;

  let level: ConcernLevel = "green";
  let rowStatusLabel = "Normal";
  let helperText = "No urgent issue found in the current scan.";
  let whyFlagged = "";
  let whatItMeans = "";
  let whatToDo = "";
  const badges: string[] = [];

  if (matchedAllergies.length > 0) {
    level = "red";
    rowStatusLabel = "Allergy";
    helperText = `Matches your saved ${matchedAllergies.join(", ").toLowerCase()} allergy`;
    whyFlagged = `${ingredient.name} matches your saved ${matchedAllergies
      .join(", ")
      .toLowerCase()} allergy.`;
    whatItMeans = "This ingredient should not be ignored if that allergy applies to you.";
    whatToDo = "Avoid this product if that allergy applies to you.";
    badges.push(`${matchedAllergies.join(", ")} allergy risk`);
  } else if (restricted) {
    level = "red";
    rowStatusLabel = "Restricted";
    helperText =
      restrictedArtificialColour !== undefined
        ? `${restrictedArtificialColour.warningLabel.toLowerCase()}.`
        : "Banned/restricted item found.";
    whyFlagged =
      restrictedArtificialColour?.userFacingReason ??
      `${ingredient.name} matches a banned or restricted item in the current rule set.`;
    whatItMeans =
      restrictedArtificialColour?.restrictionReason ??
      "The label tells the real story here. This ingredient deserves a hard look.";
    whatToDo = restricted.whatToDo;
    badges.push(restrictedArtificialColour?.warningLabel ?? "Banned/restricted item");
    if (artificialColourMatches.length > 0) {
      watchListHits.add("Artificial colours");
    }
  } else if (primaryArtificialColour) {
    level = "yellow";
    rowStatusLabel = "Review";
    helperText = `${primaryArtificialColour.warningLabel.toLowerCase()}.`;
    whyFlagged = primaryArtificialColour.userFacingReason;
    whatItMeans = primaryArtificialColour.restrictionReason;
    whatToDo = "Avoid products with artificial colours where possible.";
    badges.push(primaryArtificialColour.warningLabel);
    watchListHits.add("Artificial colours");
  } else if (matchesPreservatives) {
    const preservative =
      preservativeSummary.redItems[0] ?? preservativeSummary.yellowItems[0]!;
    level = preservativeSummary.hasAutomaticRed ? "red" : "yellow";
    rowStatusLabel = preservativeSummary.hasAutomaticRed ? "Restricted" : "Review";
    helperText = preservativeSummary.hasAutomaticRed
      ? "Serious preservative concern found."
      : "Preservative found.";
    whyFlagged = `${ingredient.name} matches ${preservative.mainName}, a preservative in the current rule set.`;
    whatItMeans = "This ingredient is worth questioning in context.";
    whatToDo = "Use it as a review point before regular use.";
    badges.push("Preservative");
    watchListHits.add("Preservatives");
  } else if (matchesArtificialSweetener) {
    const sweetener =
      artificialSweetenerSummary.redItems[0] ??
      artificialSweetenerSummary.yellowItems[0]!;
    level = artificialSweetenerSummary.hasAutomaticRed ? "red" : "yellow";
    rowStatusLabel = artificialSweetenerSummary.hasAutomaticRed
      ? "Restricted"
      : "Review";
    helperText = artificialSweetenerSummary.hasAutomaticRed
      ? "Serious sweetener concern found."
      : "Artificial sweetener found.";
    whyFlagged = `${ingredient.name} matches ${sweetener.mainName}, an artificial or non-sugar sweetener in the current rule set.`;
    whatItMeans = "This ingredient is worth questioning in context.";
    whatToDo = "Use it as a review point before regular use.";
    badges.push("Artificial sweetener");
    watchListHits.add("Artificial sweeteners");
  } else if (matchesTextureAdditive) {
    const textureAdditive =
      textureAdditiveSummary.redItems[0] ?? textureAdditiveSummary.yellowItems[0]!;
    level = textureAdditiveSummary.hasAutomaticRed ? "red" : "yellow";
    rowStatusLabel = textureAdditiveSummary.hasAutomaticRed ? "Restricted" : "Review";
    helperText = textureAdditiveSummary.hasAutomaticRed
      ? "Serious texture-additive concern found."
      : "Texture additive found.";
    whyFlagged = `${ingredient.name} matches ${textureAdditive.mainName}, a texture-support additive in the current rule set.`;
    whatItMeans = "This ingredient is used to build, hold, thicken, or stabilise food texture.";
    whatToDo = "Use it as a review point before regular use.";
    badges.push(textureAdditive.warningLabel);
  } else if (matchesFlavourSystem) {
    const flavourSystem = flavourSystemSummary.redItems[0] ?? flavourSystemMatches[0];
    level = flavourSystemSummary.hasAutomaticRed ? "red" : "yellow";
    rowStatusLabel = flavourSystemSummary.hasAutomaticRed ? "Restricted" : "Review";
    helperText = flavourSystemSummary.hasAutomaticRed
      ? "Banned/restricted flavouring found."
      : "Flavour system found.";
    whyFlagged = flavourSystem.userFacingReason;
    whatItMeans = flavourSystemSummary.hasAutomaticRed
      ? "This is a serious regulatory flavouring concern."
      : "This ingredient is used to build, boost, or standardize taste beyond simple whole-food flavour.";
    whatToDo = flavourSystemSummary.hasAutomaticRed
      ? "Avoid the flagged flavouring and review the full label before buying or eating."
      : "Use it as a review point before regular use.";
    badges.push(flavourSystem.warningLabel);
    watchListHits.add("Flavour systems");
  } else if (matchesProcessedOil) {
    const oilMatch =
      hydrogenatedOilSummary.redItems[0] ??
      hydrogenatedOilSummary.matchedItems[0] ??
      seedOilSummary.redItems[0] ??
      seedOilMatches[0];
    level = hydrogenatedOilSummary.categorySeverity === "red"
      ? "red"
      : hydrogenatedOilSummary.totalCount > 0
        ? "yellow"
      : seedOilSummary.categorySeverity;
    rowStatusLabel = hydrogenatedOilSummary.hasPartiallyHydrogenatedOil
      ? "PHO"
      : hydrogenatedOilSummary.hasTransFatMarker
        ? "Trans fat"
        : hydrogenatedOilSummary.hasHydrogenatedOil
          ? "Hydrogenated"
          : seedOilSummary.categorySeverity === "red"
        ? "High load"
        : "Review";
    helperText = hydrogenatedOilSummary.hasPartiallyHydrogenatedOil
      ? "Partially hydrogenated oil found."
      : hydrogenatedOilSummary.hasTransFatMarker
        ? "Trans fat marker found."
        : hydrogenatedOilSummary.hasHydrogenatedOil
          ? "Hydrogenated processed-fat review marker found."
          : seedOilSummary.categorySeverity === "red"
        ? "High processed-oil load."
        : "Processed oil found.";
    whyFlagged = oilMatch.userFacingReason;
    whatItMeans = hydrogenatedOilSummary.hasPartiallyHydrogenatedOil
      ? "This is a red regulatory concern because partially hydrogenated oils are linked to artificial trans fat and major restrictions in some regions."
      : hydrogenatedOilSummary.hasTransFatMarker
        ? "This is a serious fat-quality concern. The app does not trigger this from 0g or trans-fat-free claims."
        : hydrogenatedOilSummary.hasHydrogenatedOil
          ? "This is a processed-fat review marker because the fat system has been chemically hardened or modified."
          : seedOilSummary.categorySeverity === "red"
        ? "This is a red processed-oil load concern, not a banned/restricted claim by itself."
        : "This ingredient is worth questioning if you are trying to avoid heavily processed oils.";
    whatToDo = level === "red"
      ? "Review the highlighted oil markers before buying or eating regularly."
      : "Use it as a review point before regular use.";
    badges.push(oilMatch.warningLabel);
    if (seedOilMatches.some((item) => item.id === "palm_oil")) {
      watchListHits.add("Palm oil");
    }
    watchListHits.add("Processed oils");
  } else if (matchesUltraProcessedIndicator) {
    const ultraMarker =
      ultraProcessedIndicatorSummary.redItems[0] ??
      ultraProcessedIndicatorMatches[0];
    level = ultraProcessedIndicatorSummary.hasAutomaticRed ? "red" : "yellow";
    rowStatusLabel = ultraProcessedIndicatorSummary.hasAutomaticRed
      ? "Red marker"
      : "Review";
    helperText = ultraProcessedIndicatorSummary.hasAutomaticRed
      ? "Ultra-processed marker with red overlap."
      : "Ultra-processed marker found.";
    whyFlagged = ultraMarker.userFacingReason;
    whatItMeans = ultraProcessedIndicatorSummary.hasAutomaticRed
      ? "This marker also triggered a red rule in another category."
      : "This ingredient suggests the product may be processed, stabilised, flavour-built, texture-built, or made from ingredient systems.";
    whatToDo = "Use it as part of the full label exposure picture before buying or eating regularly.";
    badges.push(ultraMarker.warningLabel);
    watchListHits.add("Ultra-processed markers");
  } else if (matchesAdditives) {
    level = "yellow";
    rowStatusLabel = "Review";
    helperText = "Artificial additive found.";
    whyFlagged = `${ingredient.name} looks like an additive or helper ingredient.`;
    whatItMeans = "This ingredient is worth questioning in context.";
    whatToDo = "Use it as a review point before regular use.";
    badges.push("Artificial additive");
  }

  return {
    matchedAllergies,
    restricted,
    artificialColourMatches,
    flavourSystemMatches,
    hasRestrictedFlavouring: flavourSystemSummary.hasAutomaticRed,
    seedOilMatches,
    hydrogenatedOilMatches,
    ultraProcessedIndicatorMatches,
    ultraProcessedAutomaticRedTriggers,
    additiveLike: matchesAdditives,
    preservativeLike: matchesPreservatives,
    flavourSystemLike: matchesFlavourSystem,
    processedOilLike: matchesProcessedOil,
    level,
    ingredient: {
      key: normalizeForMatch(ingredient.name) || ingredient.name,
      name: ingredient.name,
      level,
      rowStatusLabel,
      summaryLabel: ingredient.name,
      helperText,
      badges,
      modal: buildIngredientModal({
        name: ingredient.name,
        level,
        shortDefinition: buildGenericIngredientSummary(ingredient),
        usedFor: "Listed on the label for this product.",
        whyFlagged,
        whatItMeans,
        whatToDo,
      }),
    } satisfies AnalyzedIngredient,
  };
}

function buildRealNutrientAnalysis(nutrient: NormalizedNutrient) {
  const value = nutrient.value;
  const levelInfo = getNutrientLevel(
    nutrient.name as
      | "Sugar"
      | "Salt"
      | "Sodium"
      | "Saturated fat"
      | "Fibre"
      | "Protein"
      | "Fat"
      | "Calories",
    value,
  );

  const valueText = value === undefined
    ? "Not enough label data"
    : `${Number.isInteger(value) ? value : value.toFixed(1)}${nutrient.unit ?? ""}`;

  const whatItDoesByName: Record<string, string> = {
    Sugar: "Higher sugar can push a product out of the calmer range quickly.",
    Salt: "Higher salt can turn into a real warning even when the product does not taste salty.",
    Sodium: "Higher sodium can turn into a real warning even when the product does not taste salty.",
    "Saturated fat": "Higher saturated fat can make the overall nutrition picture harder to ignore.",
    Protein: "Protein is part of the nutrition picture, but it is not a red flag by itself here.",
    Fibre: "Low fibre can make the product feel less balanced overall.",
    Fat: "Total fat is part of the overall label picture.",
    Calories: "Calories are part of the overall label picture.",
  };

  const levelTextByName: Record<string, string> = {
    Sugar:
      levelInfo.level === "red"
        ? "Sugar crosses into the serious red range for this scan."
        : levelInfo.level === "yellow"
          ? "Sugar is high enough to be worth questioning."
          : "No major sugar warning was found in the current data.",
    Salt:
      levelInfo.level === "red"
        ? "Salt crosses into the serious red range for this scan."
        : levelInfo.level === "yellow"
          ? "Salt is high enough to be worth questioning."
          : "No major salt warning was found in the current data.",
    Sodium:
      levelInfo.level === "red"
        ? "Sodium crosses into the serious red range for this scan."
        : levelInfo.level === "yellow"
          ? "Sodium is high enough to be worth questioning."
          : "No major sodium warning was found in the current data.",
    "Saturated fat":
      levelInfo.level === "red"
        ? "Saturated fat crosses into the serious red range for this scan."
        : levelInfo.level === "yellow"
          ? "Saturated fat is high enough to be worth questioning."
          : "No major saturated fat warning was found in the current data.",
    Fibre:
      levelInfo.level === "yellow"
        ? "Fibre is low enough to be worth questioning."
        : "Fibre does not raise a warning from the current data.",
    Protein: "Protein is listed, but it does not trigger a warning here by itself.",
    Fat: "Total fat is listed for context.",
    Calories: "Calories are listed for context.",
  };

  return {
    levelInfo,
    nutrient: {
      key: normalizeForMatch(nutrient.name) || nutrient.name,
      name: nutrient.name,
      value: valueText,
      level: levelInfo.level,
      band: levelInfo.band,
      rowStatusLabel:
        levelInfo.level === "green" && (nutrient.name === "Protein" || nutrient.name === "Fat" || nutrient.name === "Calories")
          ? "Listed"
          : levelInfo.band,
      summaryLabel: nutrient.name,
      modal: buildNutrientModal({
        name: nutrient.name,
        level: levelInfo.level,
        shortDefinition: `${nutrient.name} per ${nutrient.per ?? "100g"} from the barcode database.`,
        whatItDoes:
          whatItDoesByName[nutrient.name] ?? "This value is part of the overall label picture.",
        levelText:
          levelTextByName[nutrient.name] ?? "This value was pulled from the available label data.",
        value: valueText,
      }),
    } satisfies AnalyzedNutrient,
  };
}

function createScanCheck(
  id: string,
  label: string,
  status: string,
  tone: ConcernLevel | "neutral",
  explanation?: string,
) {
  return {
    id,
    label,
    status,
    tone,
    explanation,
    modal:
      tone === "red" || tone === "yellow"
        ? buildScanCheckModal(label, tone, explanation ?? `${label} was flagged in the current scan.`)
        : undefined,
  } satisfies ScanCheckItem;
}

export function analyzeNormalizedProduct(
  product: NormalizedProduct,
  profile: UserProfile,
): ProductAnalysis {
  const watchListHits = new Set<string>();
  const ingredientsAvailable = product.ingredients.length > 0;
  const nutritionAvailable = product.nutrients.length > 0;

  const analyzedIngredients = product.ingredients.map((ingredient) =>
    buildRealIngredientAnalysis(ingredient, product, profile, watchListHits),
  );
  const ingredients = analyzedIngredients.map((entry) => entry.ingredient);

  const matchedAllergyLabels = new Set<string>();
  const matchedAllergyItems = new Set<string>();
  const artificialColourMatches = new Map<string, MergedArtificialColour>();
  const flavourSystemMatches = new Map<
    string,
    ReturnType<typeof findFlavourSystemMatches>[number]
  >();
  const seedOilMatches = new Map<
    string,
    ReturnType<typeof findSeedOilProcessedOilMatches>[number]
  >();
  const hydrogenatedOilMatches = new Map<
    string,
    ReturnType<typeof findHydrogenatedPartiallyHydrogenatedOilMatches>[number]
  >();
  const ultraProcessedIndicatorMatches = new Map<
    string,
    ReturnType<typeof findUltraProcessedIndicatorMatches>[number]
  >();
  const ultraProcessedAutomaticRedTriggers = new Map<
    string,
    ReturnType<typeof findUltraProcessedAutomaticRedTriggers>[number]
  >();
  let hasRegulatoryWarning = false;
  let hasAdditives = false;
  let hasPreservatives = false;
  let hasFlavourSystems = false;
  let hasProcessedOils = false;

  analyzedIngredients.forEach((entry) => {
    entry.matchedAllergies.forEach((allergy) => matchedAllergyLabels.add(allergy));

    if (entry.matchedAllergies.length > 0) {
      matchedAllergyItems.add(entry.ingredient.name);
    }

    entry.artificialColourMatches.forEach((match) => {
      artificialColourMatches.set(match.duplicateGroupId, match);
    });

    entry.flavourSystemMatches.forEach((match) => {
      flavourSystemMatches.set(match.id, match);
    });

    entry.seedOilMatches.forEach((match) => {
      seedOilMatches.set(match.id, match);
    });

    entry.hydrogenatedOilMatches.forEach((match) => {
      hydrogenatedOilMatches.set(match.id, match);
    });

    entry.ultraProcessedIndicatorMatches.forEach((match) => {
      ultraProcessedIndicatorMatches.set(match.id, match);
    });

    entry.ultraProcessedAutomaticRedTriggers.forEach((trigger) => {
      ultraProcessedAutomaticRedTriggers.set(`${trigger.source}:${trigger.id}`, trigger);
    });

    if (entry.restricted || entry.hasRestrictedFlavouring) {
      hasRegulatoryWarning = true;
    }

    if (entry.additiveLike) {
      hasAdditives = true;
    }

    if (entry.preservativeLike) {
      hasPreservatives = true;
    }

    if (entry.flavourSystemLike) {
      hasFlavourSystems = true;
    }

    if (entry.processedOilLike) {
      hasProcessedOils = true;
    }
  });

  product.allergens.forEach((allergen) => {
    profile.allergies.forEach((savedAllergy) => {
      if (ingredientMatchesAllergy(allergen, savedAllergy)) {
        matchedAllergyLabels.add(savedAllergy);
        matchedAllergyItems.add(titleCase(allergen));
      }
    });
  });

  const analyzedNutrients = product.nutrients.map(buildRealNutrientAnalysis);
  const nutrients = analyzedNutrients.map((entry) => entry.nutrient);
  const nutrientMap = new Map(
    analyzedNutrients.map((entry) => [entry.nutrient.name, entry]),
  );

  const sugarSignal = nutrientMap.get("Sugar");
  const saltSignal = nutrientMap.get("Salt") ?? nutrientMap.get("Sodium");
  const saturatedFatSignal = nutrientMap.get("Saturated fat");
  const fibreSignal = nutrientMap.get("Fibre");
  const artificialColourSummary = summarizeArtificialColourMatches([
    ...artificialColourMatches.values(),
  ]);
  const flavourSystemSummary = summarizeFlavourSystemMatches([
    ...flavourSystemMatches.values(),
  ]);
  const seedOilSummary = summarizeSeedOilProcessedOilMatches([
    ...seedOilMatches.values(),
  ]);
  const hydrogenatedOilSummary =
    summarizeHydrogenatedPartiallyHydrogenatedOilMatches([
      ...hydrogenatedOilMatches.values(),
    ]);
  const ultraProcessedIndicatorSummary = summarizeUltraProcessedIndicatorMatches(
    [...ultraProcessedIndicatorMatches.values()],
    [...ultraProcessedAutomaticRedTriggers.values()],
  );
  const hasAllergyMatch = matchedAllergyLabels.size > 0;
  const hasRedNutrient = analyzedNutrients.some((entry) => entry.levelInfo.level === "red");
  const hasYellowIngredient = ingredients.some((ingredient) => ingredient.level === "yellow");
  const hasYellowNutrient = analyzedNutrients.some((entry) => entry.levelInfo.level === "yellow");
  const ultraProcessed = product.novaGroup === 4;
  const tooManyIngredients = ingredientsAvailable ? product.ingredients.length >= 12 : false;

  if ((sugarSignal?.nutrient.level === "red" || sugarSignal?.nutrient.level === "yellow") && profile.avoid.includes("High sugar")) {
    watchListHits.add("High sugar");
  }

  if ((saltSignal?.nutrient.level === "red" || saltSignal?.nutrient.level === "yellow") && profile.avoid.includes("High sodium")) {
    watchListHits.add("High sodium");
  }

  const immediateWarnings: ImmediateWarning[] = [];

  if (hasAllergyMatch) {
    const matchedItems = Array.from(matchedAllergyItems);

    immediateWarnings.push({
      id: "real-allergy-risk",
      title: "Allergy risk",
      body: matchedItems.length > 0 ? `Found: ${matchedItems.join(", ")}.` : "A saved allergy was matched.",
      tone: "red",
      rowStatusLabel: "Found",
      modal: {
        title: "Allergy risk",
        tone: "red",
        sections: [
          {
            label: "Why this was flagged",
            text: "The ingredient list or allergen tags match a saved allergy on this device.",
          },
          {
            label: "What this means",
            text: "This product is not a clean pass if that allergy applies to you.",
          },
          {
            label: "What to do",
            text: warningTemplates.immediate.allergy.action,
          },
        ],
      },
    });
  }

  if (hasRegulatoryWarning) {
    const restrictedItems = ingredients
      .filter((ingredient) => ingredient.rowStatusLabel === "Restricted")
      .map((ingredient) => ingredient.name);

    immediateWarnings.push({
      id: "real-restricted-item",
      title: "Banned/restricted item",
      body: restrictedItems.length > 0 ? `Found: ${restrictedItems.join(", ")}.` : "A restricted item was found.",
      tone: "red",
      rowStatusLabel: "Found",
      modal: {
        title: "Banned/restricted item",
        tone: "red",
        sections: [
          {
            label: "Why this was flagged",
            text: "The ingredient list matched a banned or restricted item in the current rule set.",
          },
          {
            label: "What this means",
            text: "The label tells the real story here. This product is not a clean pass.",
          },
          {
            label: "What to do",
            text: warningTemplates.immediate.regulatory.action,
          },
        ],
      },
    });
  }

  if (sugarSignal?.nutrient.level === "red") {
    immediateWarnings.push({
      id: "real-too-much-sugar",
      title: "Too much sugar",
      body: `Found: ${sugarSignal.nutrient.value}.`,
      tone: "red",
      rowStatusLabel: "Found",
      modal: {
        title: "Too much sugar",
        tone: "red",
        sections: [
          {
            label: "Why this was flagged",
            text: "Sugar crosses into the serious red range for this scan.",
          },
          {
            label: "What this means",
            text: "This product triggered a major content warning. It is not a clean pass on sugar.",
          },
          {
            label: "What to do",
            text: warningTemplates.immediate.highSugar.action,
          },
        ],
      },
    });
  }

  if (saltSignal?.nutrient.level === "red") {
    immediateWarnings.push({
      id: "real-too-much-salt",
      title: "Too much salt",
      body: `Found: ${saltSignal.nutrient.value}.`,
      tone: "red",
      rowStatusLabel: "Found",
      modal: {
        title: "Too much salt",
        tone: "red",
        sections: [
          {
            label: "Why this was flagged",
            text: "Salt crosses into the serious red range for this scan.",
          },
          {
            label: "What this means",
            text: "This product triggered a major content warning. It is not a clean pass on salt.",
          },
          {
            label: "What to do",
            text: "Review the highlighted nutrition warning before buying or eating.",
          },
        ],
      },
    });
  }

  if (saturatedFatSignal?.nutrient.level === "red") {
    immediateWarnings.push({
      id: "real-unhealthy-fat",
      title: "Unhealthy fat",
      body: `Found: ${saturatedFatSignal.nutrient.value}.`,
      tone: "red",
      rowStatusLabel: "Found",
      modal: {
        title: "Unhealthy fat",
        tone: "red",
        sections: [
          {
            label: "Why this was flagged",
            text: "Saturated fat crosses into the serious red range for this scan.",
          },
          {
            label: "What this means",
            text: "This product triggered a major content warning. It is not a clean pass on fat.",
          },
          {
            label: "What to do",
            text: "Review the highlighted nutrition warning before buying or eating.",
          },
        ],
      },
    });
  }

  if (hydrogenatedOilSummary.categorySeverity === "red") {
    const names = hydrogenatedOilSummary.redItems.map((item) => item.mainName);
    const title = hydrogenatedOilSummary.hasPartiallyHydrogenatedOil
      ? "Partially hydrogenated oil"
      : hydrogenatedOilSummary.hasTransFatMarker
        ? "Trans fat marker"
        : "Hydrogenated processed fat";

    immediateWarnings.push({
      id: "real-hydrogenated-oil",
      title,
      body: names.length > 0 ? `Found: ${names.join(", ")}.` : "A hydrogenated fat marker was found.",
      tone: "red",
      rowStatusLabel: "Found",
      modal: {
        title,
        tone: "red",
        sections: [
          {
            label: "Why this was flagged",
            text:
              hydrogenatedOilSummary.hasPartiallyHydrogenatedOil
                ? "The ingredient list matched a partially hydrogenated oil marker."
                : hydrogenatedOilSummary.hasTransFatMarker
                  ? "The label contains a positive trans-fat marker, not just a 0g or trans-fat-free claim."
                  : "The ingredient list matched a hydrogenated or fully hydrogenated fat marker.",
          },
          {
            label: "What this means",
            text:
              hydrogenatedOilSummary.hasPartiallyHydrogenatedOil
                ? "Truthlabel treats PHO as a red regulatory concern because it is linked to artificial trans fat and major restrictions in some regions."
                : "Truthlabel treats this as a serious processed-fat marker because the fat system has been chemically modified.",
          },
          {
            label: "What to do",
            text: "Review the highlighted fat marker before buying or eating regularly.",
          },
        ],
      },
    });
  }

  const scanChecks = ([
    !ingredientsAvailable && product.allergens.length === 0
      ? createScanCheck(
          "scan-allergy-risk",
          "Allergy risk",
          "Not enough label data",
          "neutral",
        )
      : hasAllergyMatch
        ? createScanCheck(
            "scan-allergy-risk",
            "Allergy risk",
            "Found",
            "red",
            `Matched: ${Array.from(matchedAllergyLabels).join(", ")}.`,
          )
        : createScanCheck("scan-allergy-risk", "Allergy risk", "None found", "green"),
    !sugarSignal
      ? createScanCheck(
          "scan-too-much-sugar",
          "Too much sugar",
          "Not enough label data",
          "neutral",
        )
      : sugarSignal.nutrient.level === "red"
        ? createScanCheck(
            "scan-too-much-sugar",
            "Too much sugar",
            "Found",
            "red",
            "Sugar crosses into the serious red range for this scan.",
          )
        : sugarSignal.nutrient.level === "yellow"
          ? createScanCheck(
              "scan-too-much-sugar",
              "Too much sugar",
              "Review",
              "yellow",
              "Sugar is high enough to be worth questioning.",
            )
          : createScanCheck("scan-too-much-sugar", "Too much sugar", "None found", "green"),
    !saltSignal
      ? createScanCheck(
          "scan-too-much-salt",
          "Too much salt",
          "Not enough label data",
          "neutral",
        )
      : saltSignal.nutrient.level === "red"
        ? createScanCheck(
            "scan-too-much-salt",
            "Too much salt",
            "Found",
            "red",
            `${saltSignal.nutrient.name} crosses into the serious red range for this scan.`,
          )
        : saltSignal.nutrient.level === "yellow"
          ? createScanCheck(
              "scan-too-much-salt",
              "Too much salt",
              "Review",
              "yellow",
              `${saltSignal.nutrient.name} is high enough to be worth questioning.`,
            )
          : createScanCheck("scan-too-much-salt", "Too much salt", "None found", "green"),
    !saturatedFatSignal
      ? createScanCheck(
          "scan-unhealthy-fat",
          "Unhealthy fat",
          "Not enough label data",
          "neutral",
        )
      : saturatedFatSignal.nutrient.level === "red"
        ? createScanCheck(
            "scan-unhealthy-fat",
            "Unhealthy fat",
            "Found",
            "red",
            "Saturated fat crosses into the serious red range for this scan.",
          )
        : saturatedFatSignal.nutrient.level === "yellow"
          ? createScanCheck(
              "scan-unhealthy-fat",
              "Unhealthy fat",
              "Review",
              "yellow",
              "Saturated fat is high enough to be worth questioning.",
            )
          : createScanCheck("scan-unhealthy-fat", "Unhealthy fat", "None found", "green"),
    !ingredientsAvailable && product.novaGroup === undefined
      ? createScanCheck(
          "scan-ultra-processed",
          "Ultra-processed food",
          "Not enough label data",
          "neutral",
        )
      : ultraProcessedIndicatorSummary.categorySeverity !== "green"
        ? createScanCheck(
            "scan-ultra-processed",
            "Ultra-processed food",
            buildUltraProcessedStatus(ultraProcessedIndicatorSummary, product.novaGroup),
            ultraProcessedIndicatorSummary.categorySeverity,
            buildUltraProcessedExplanation(
              ultraProcessedIndicatorSummary,
              product.novaGroup,
            ),
          )
      : ultraProcessed
        ? createScanCheck(
            "scan-ultra-processed",
            "Ultra-processed food",
            buildUltraProcessedStatus(ultraProcessedIndicatorSummary, product.novaGroup),
            "yellow",
            buildUltraProcessedExplanation(
              ultraProcessedIndicatorSummary,
              product.novaGroup,
            ),
          )
        : createScanCheck("scan-ultra-processed", "Ultra-processed food", "None found", "green"),
    !ingredientsAvailable
      ? createScanCheck(
          "scan-artificial-colours",
          "Artificial colours",
          "Not enough label data",
          "neutral",
        )
      : createScanCheck(
          "scan-artificial-colours",
          "Artificial colours",
          buildArtificialColourStatus(artificialColourSummary),
          artificialColourSummary.categorySeverity,
          buildArtificialColourExplanation(artificialColourSummary),
        ),
    !ingredientsAvailable && product.additives.length === 0
      ? createScanCheck(
          "scan-artificial-additives",
          "Artificial additives",
          "Not enough label data",
          "neutral",
        )
      : hasAdditives || product.additives.length > 0
        ? createScanCheck(
            "scan-artificial-additives",
            "Artificial additives",
            "Found",
            "yellow",
            product.additives.length > 0
              ? `Found: ${product.additives.join(", ")}.`
              : "Artificial additives or helper ingredients were found on the label.",
          )
        : createScanCheck("scan-artificial-additives", "Artificial additives", "None found", "green"),
    !ingredientsAvailable
      ? createScanCheck(
          "scan-preservatives",
          "Preservatives",
          "Not enough label data",
          "neutral",
        )
      : hasPreservatives
        ? createScanCheck(
            "scan-preservatives",
            "Preservatives",
            "Found",
            "yellow",
            "Preservatives were found on the label.",
          )
        : createScanCheck("scan-preservatives", "Preservatives", "None found", "green"),
    !ingredientsAvailable
      ? createScanCheck(
          "scan-flavour-systems",
          "Flavour systems",
          "Not enough label data",
          "neutral",
        )
      : hasFlavourSystems
        ? createScanCheck(
            "scan-flavour-systems",
            "Flavour systems",
            buildFlavourSystemStatus(flavourSystemSummary),
            flavourSystemSummary.categorySeverity,
            buildFlavourSystemExplanation(flavourSystemSummary),
          )
        : createScanCheck("scan-flavour-systems", "Flavour systems", "None found", "green"),
    !ingredientsAvailable
      ? createScanCheck(
          "scan-processed-oils",
          "Processed oils",
          "Not enough label data",
          "neutral",
        )
      : hasProcessedOils
        ? createScanCheck(
            "scan-processed-oils",
            "Processed oils",
            buildProcessedOilStatus(seedOilSummary, hydrogenatedOilSummary),
            hydrogenatedOilSummary.categorySeverity === "red"
              ? "red"
              : hydrogenatedOilSummary.totalCount > 0
                ? "yellow"
              : seedOilSummary.categorySeverity,
            buildProcessedOilExplanation(seedOilSummary, hydrogenatedOilSummary),
          )
        : createScanCheck("scan-processed-oils", "Processed oils", "None found", "green"),
    !ingredientsAvailable
      ? createScanCheck(
          "scan-hydrogenated-oils",
          "Hydrogenated oils",
          "Not enough label data",
          "neutral",
        )
      : hydrogenatedOilSummary.totalCount > 0
        ? createScanCheck(
            "scan-hydrogenated-oils",
            "Hydrogenated oils",
            buildHydrogenatedOilStatus(hydrogenatedOilSummary),
            hydrogenatedOilSummary.categorySeverity,
            buildHydrogenatedOilExplanation(hydrogenatedOilSummary),
          )
        : createScanCheck("scan-hydrogenated-oils", "Hydrogenated oils", "No", "green"),
    !ingredientsAvailable
      ? createScanCheck(
          "scan-too-many-ingredients",
          "Too many ingredients",
          "Not enough label data",
          "neutral",
        )
      : tooManyIngredients
        ? createScanCheck(
            "scan-too-many-ingredients",
            "Too many ingredients",
            "Likely",
            "yellow",
            "This ingredient list is long enough to be worth questioning.",
          )
        : createScanCheck("scan-too-many-ingredients", "Too many ingredients", "None found", "green"),
    !ingredientsAvailable
      ? createScanCheck(
          "scan-banned-restricted",
          "Banned/restricted item",
          "Not enough label data",
          "neutral",
        )
      : hasRegulatoryWarning
        ? createScanCheck(
            "scan-banned-restricted",
            "Banned/restricted item",
            "Found",
            "red",
            "A banned or restricted item was found on the label.",
          )
        : createScanCheck("scan-banned-restricted", "Banned/restricted item", "None found", "green"),
    !fibreSignal
      ? createScanCheck(
          "scan-low-fibre",
          "Low fibre",
          "Not enough label data",
          "neutral",
        )
      : fibreSignal.nutrient.level === "yellow"
        ? createScanCheck(
            "scan-low-fibre",
            "Low fibre",
            "Found",
            "yellow",
            "Fibre is low enough to be worth questioning.",
          )
        : createScanCheck("scan-low-fibre", "Low fibre", "None found", "green"),
    ingredientsAvailable
      ? createScanCheck(
          "scan-total-ingredients",
          "Total ingredients",
          String(product.ingredients.length),
          "neutral",
        )
      : createScanCheck(
          "scan-total-ingredients",
          "Total ingredients",
          "Not enough label data",
          "neutral",
        ),
  ] satisfies ScanCheckItem[]).sort((left, right) => {
    const order = {
      red: 0,
      yellow: 1,
      green: 2,
      neutral: 3,
    } as const;

    return order[left.tone] - order[right.tone];
  });

  const scoreValue = calculateConcernScore({
    hasAllergyMatch,
    hasRegulatoryWarning,
    hasRedNutrient,
    hasYellowIngredient,
    hasYellowNutrient,
    redFlagCount: immediateWarnings.length,
  });
  const scoreLabel = getConcernLabel(scoreValue);
  const reasons: string[] = [];

  if (sugarSignal?.nutrient.level === "red") {
    reasons.push("Too much sugar");
  }

  if (saltSignal?.nutrient.level === "red") {
    reasons.push("Too much salt");
  }

  if (saturatedFatSignal?.nutrient.level === "red") {
    reasons.push("Unhealthy fat");
  }

  if (hasAllergyMatch) {
    reasons.push(
      `${Array.from(matchedAllergyLabels)
        .join(", ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())} allergy risk`,
    );
  }

  if (hasRegulatoryWarning) {
    reasons.push("Banned/restricted item");
  }

  if (artificialColourSummary.redItemCount > 0) {
    reasons.push("Artificial colour red flag");
  } else if (artificialColourSummary.totalCount >= 3) {
    reasons.push("High artificial colour load");
  }

  if (flavourSystemSummary.hasAutomaticRed) {
    reasons.push("Banned/restricted flavouring");
  } else if (flavourSystemSummary.categorySeverity === "red") {
    reasons.push("High flavour-system load");
  }

  if (hydrogenatedOilSummary.hasPartiallyHydrogenatedOil) {
    reasons.push("Partially hydrogenated oil");
  } else if (hydrogenatedOilSummary.hasTransFatMarker) {
    reasons.push("Trans fat marker");
  } else if (
    hydrogenatedOilSummary.hasHydrogenatedOil &&
    hydrogenatedOilSummary.categorySeverity === "red"
  ) {
    reasons.push("Hydrogenated processed fat");
  } else if (seedOilSummary.categorySeverity === "red") {
    reasons.push("High processed-oil load");
  }

  if (ultraProcessedIndicatorSummary.hasAutomaticRed) {
    reasons.push("Ultra-processed red marker");
  } else if (ultraProcessedIndicatorSummary.categorySeverity === "red") {
    reasons.push("High ultra-processed load");
  }

  if (reasons.length === 0 && (hasYellowIngredient || hasYellowNutrient || ultraProcessed)) {
    reasons.push("Items worth reviewing");
  }

  return {
    product: {
      name: product.name,
      brand: product.brand ?? "Unknown brand",
      barcode: product.barcode,
      imageUrl: product.imageUrl,
      rawSource: "openfoodfacts",
    },
    profile,
    watchListHits: Array.from(watchListHits),
    immediateWarnings,
    scanChecks,
    ingredients,
    nutrients,
    checklist: [],
    score: {
      value: scoreValue,
      label: scoreLabel,
      detail: getConcernDetail(scoreValue),
    },
    summary: buildOverallSummary({
      label: scoreLabel,
      reasons,
      hasAllergyMatch,
    }),
    dataAvailability: {
      ingredients: ingredientsAvailable ? "available" : "missing",
      nutrition: nutritionAvailable ? "available" : "missing",
    },
  };
}
