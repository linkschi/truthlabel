import { allergenAliases } from "@/data/allergenAliases";
import { bannedRestricted } from "@/data/bannedRestricted";
import {
  concernLabels,
  fakeProduct,
  type ConcernLevel,
  type UserProfile,
} from "@/data/fakeProduct";
import { ingredientDefinitions } from "@/data/ingredientDefinitions";
import { nutrientDefinitions } from "@/data/nutrientDefinitions";
import { warningTemplates } from "@/data/warningTemplates";
import {
  calculateConcernScore,
  getConcernDetail,
  getConcernLabel,
} from "@/lib/scoring";
import {
  buildOverallSummary,
  type OverallSummaryContent,
} from "@/lib/summaryEngine";
import type { ProductDataSource } from "@/types/product";

export type ModalSection = {
  label: string;
  text: string;
};

export type ModalContent = {
  title: string;
  tone: ConcernLevel;
  sections: ModalSection[];
};

export type DisplayedProduct = {
  name: string;
  brand: string;
  barcode: string;
  imageAlt?: string;
  imageUrl?: string;
  rawSource?: ProductDataSource;
};

export type ImmediateWarning = {
  id: string;
  title: string;
  body: string;
  tone: ConcernLevel;
  rowStatusLabel: string;
  modal: ModalContent;
};

export type ChecklistItem = {
  id: string;
  label: string;
  status: "Yes" | "No";
  tone: ConcernLevel;
  explanation: string;
  modal: ModalContent;
};

export type ScanCheckItem = {
  id: string;
  label: string;
  status: string;
  tone: ConcernLevel | "neutral";
  explanation?: string;
  modal?: ModalContent;
};

export type AnalyzedIngredient = {
  key: string;
  name: string;
  level: ConcernLevel;
  rowStatusLabel: string;
  summaryLabel: string;
  helperText: string;
  badges: string[];
  modal: ModalContent;
};

export type AnalyzedNutrient = {
  key: string;
  name: string;
  value: string;
  level: ConcernLevel;
  band: string;
  rowStatusLabel: string;
  summaryLabel: string;
  modal: ModalContent;
};

export type ProductAnalysis = {
  product: DisplayedProduct;
  profile: UserProfile;
  watchListHits: string[];
  immediateWarnings: ImmediateWarning[];
  scanChecks: ScanCheckItem[];
  ingredients: AnalyzedIngredient[];
  nutrients: AnalyzedNutrient[];
  checklist: ChecklistItem[];
  score: {
    value: number;
    label: string;
    detail: string;
  };
  summary: OverallSummaryContent;
  dataAvailability?: {
    ingredients: "available" | "missing";
    nutrition: "available" | "missing";
  };
};

const allergyFreeFromPhrases = [
  "peanut free",
  "peanuts free",
  "gluten free",
  "dairy free",
  "milk free",
  "egg free",
  "eggs free",
  "soy free",
  "soya free",
  "nut free",
  "nuts free",
  "sesame free",
  "shellfish free",
  "fish free",
  "wheat free",
  "free from peanut",
  "free from peanuts",
  "free from gluten",
  "free from dairy",
  "free from milk",
  "free from egg",
  "free from eggs",
  "free from soy",
  "free from soya",
  "free from nuts",
  "free from sesame",
  "free from shellfish",
  "free from fish",
  "free from wheat",
] as const;

const allergyFalsePositivePhrases: Partial<Record<UserProfile["allergies"][number], string[]>> = {
  Milk: ["milk thistle"],
  Egg: ["eggplant"],
};

function normalizeAllergyMatchText(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripAllergyPhrases(value: string, phrases: readonly string[]) {
  let normalizedValue = ` ${normalizeAllergyMatchText(value)} `;

  phrases.forEach((phrase) => {
    const normalizedPhrase = normalizeAllergyMatchText(phrase);

    if (!normalizedPhrase) {
      return;
    }

    const pattern = new RegExp(
      `(^|\\s)${escapeRegExp(normalizedPhrase)}(?=\\s|$)`,
      "g",
    );
    normalizedValue = normalizedValue.replace(pattern, " ");
  });

  return normalizeAllergyMatchText(normalizedValue);
}

function hasWholePhraseMatch(value: string, phrase: string) {
  const normalizedPhrase = normalizeAllergyMatchText(phrase);

  if (!normalizedPhrase) {
    return false;
  }

  const pattern = new RegExp(
    `(^|\\s)${escapeRegExp(normalizedPhrase)}(?=\\s|$)`,
  );

  return pattern.test(value);
}

export function ingredientMatchesAllergy(ingredientName: string, allergyName: string) {
  const aliases = allergenAliases[allergyName as keyof typeof allergenAliases] ?? [];
  let normalizedName = normalizeAllergyMatchText(ingredientName);

  if (!normalizedName) {
    return false;
  }

  normalizedName = stripAllergyPhrases(normalizedName, allergyFreeFromPhrases);
  normalizedName = stripAllergyPhrases(
    normalizedName,
    allergyFalsePositivePhrases[
      allergyName as keyof typeof allergyFalsePositivePhrases
    ] ?? [],
  );

  return aliases.some((alias) => hasWholePhraseMatch(normalizedName, alias));
}

export function buildIngredientModal(args: {
  name: string;
  level: ConcernLevel;
  shortDefinition: string;
  usedFor: string;
  whyFlagged?: string;
  whatItMeans?: string;
  whatToDo?: string;
}): ModalContent {
  if (args.level === "green") {
    return {
      title: args.name,
      tone: args.level,
      sections: [
        {
          label: "What it is",
          text: args.shortDefinition,
        },
        {
          label: "What this means",
          text: "No major red flag was found for this ingredient in the current scan.",
        },
        {
          label: "What to do",
          text: "Keep it in context with the rest of the label.",
        },
      ],
    };
  }

  return {
    title: args.name,
    tone: args.level,
    sections: [
      {
        label: "Why this was flagged",
        text: args.whyFlagged ?? "This ingredient was flagged in the current scan.",
      },
      {
        label: "What this means",
        text:
          args.level === "red"
            ? args.whatItMeans ?? "This ingredient should not be ignored."
            : args.whatItMeans ?? "This ingredient is worth questioning in context.",
      },
      {
        label: "What to do",
        text:
          args.whatToDo ??
          (args.level === "red"
            ? "Review it before buying or eating."
            : "Use it as a review point before regular use."),
      },
    ],
  };
}

export function buildNutrientModal(args: {
  name: string;
  level: ConcernLevel;
  shortDefinition: string;
  whatItDoes: string;
  levelText: string;
  value: string;
}): ModalContent {
  if (args.level === "green") {
    return {
      title: args.name,
      tone: args.level,
      sections: [
        {
          label: "What it is",
          text: args.shortDefinition,
        },
        {
          label: "What this means",
          text: `No major red flag was found here at ${args.value}.`,
        },
        {
          label: "What to do",
          text: "Keep it in context with the rest of the nutrition panel.",
        },
      ],
    };
  }

  return {
    title: args.name,
    tone: args.level,
    sections: [
      {
        label: "Why this was flagged",
        text: args.levelText,
      },
      {
        label: "What this means",
        text: args.whatItDoes,
      },
      {
        label: "What to do",
        text:
          args.level === "red"
            ? "Treat this as a red flag before buying or eating."
            : "Keep this in mind while questioning the rest of the label.",
      },
    ],
  };
}

export function buildChecklistModal(title: string, tone: ConcernLevel, explanation: string) {
  return {
    title,
    tone,
    sections: [
      {
        label: "Why this was flagged",
        text:
          tone === "green"
            ? `No issue was found for ${title.toLowerCase()} in this product.`
            : explanation,
      },
      {
        label: "What this means",
        text:
          tone === "red"
            ? "This product is not a clean pass on this check."
            : tone === "yellow"
              ? "This is not a clean pass and is worth questioning in context."
              : "No extra action is needed for this item right now.",
      },
      {
        label: "What to do",
        text:
          tone === "red"
            ? "Review the flagged item before buying or eating."
            : tone === "yellow"
              ? "Use it as a review point while checking the rest of the label."
              : "No extra action is needed for this item right now.",
      },
    ],
  };
}

export function buildScanCheckModal(title: string, tone: ConcernLevel, explanation: string) {
  return {
    title,
    tone,
    sections: [
      {
        label: "Why this was flagged",
        text: explanation,
      },
      {
        label: "What this means",
        text:
          tone === "red"
            ? "The front label does not tell the full story here."
            : "This product is not a clean pass on this check.",
      },
      {
        label: "What to do",
        text:
          tone === "red"
            ? "Review the flagged item before buying or eating."
            : "Use it as a review point before regular use.",
      },
    ],
  };
}

export function analyzeProduct(profile: UserProfile): ProductAnalysis {
  const matchedWatchHits = new Set<string>();
  const matchedAllergyIngredients: string[] = [];
  const matchedAllergyLabels = new Set<string>();
  const regulatoryIngredients: string[] = [];

  const ingredients: AnalyzedIngredient[] = fakeProduct.ingredients.map((ingredient) => {
    const definition = ingredientDefinitions[ingredient.key];
    const matchedAllergies = profile.allergies.filter((allergy) =>
      ingredientMatchesAllergy(ingredient.name, allergy),
    );
    const matchedAvoids = ingredient.watchTags.filter((tag) => profile.avoid.includes(tag));
    const restricted = bannedRestricted[ingredient.key];

    let level = ingredient.baseLevel;

    if (matchedAllergies.length > 0 || restricted) {
      level = "red";
    }

    if (matchedAllergies.length > 0) {
      matchedAllergyIngredients.push(ingredient.name);
      matchedAllergies.forEach((allergy) => matchedAllergyLabels.add(allergy));
    }

    if (restricted) {
      regulatoryIngredients.push(ingredient.name);
    }

    matchedAvoids.forEach((tag) => matchedWatchHits.add(tag));

    const badges: string[] = [];

    if (matchedAllergies.length > 0) {
      badges.push(`${matchedAllergies.join(", ")} allergy risk`);
    }

    if (restricted) {
      badges.push("Banned/restricted item");
    }

    if (matchedAvoids.length > 0) {
      badges.push(`Avoid list: ${matchedAvoids.join(", ")}`);
    }

    let helperText = concernLabels[level];

    if (matchedAllergies.length > 0) {
      helperText = `Matches your saved ${matchedAllergies.join(", ").toLowerCase()} allergy`;
    } else if (restricted) {
      helperText = "Banned/restricted item found.";
    } else if (matchedAvoids.length > 0) {
      helperText = `Matches your saved avoid list: ${matchedAvoids.join(", ")}`;
    }

    const modal = buildIngredientModal({
      name: ingredient.name,
      level,
      shortDefinition: definition.shortDefinition,
      usedFor: definition.usedFor,
      whyFlagged:
        matchedAllergies.length > 0
          ? `${ingredient.name} matches your saved ${matchedAllergies
              .join(", ")
              .toLowerCase()} allergy.`
          : restricted
            ? restricted.whyFlagged
            : definition.warningText,
      whatItMeans:
        matchedAllergies.length > 0
          ? "This ingredient should not be ignored if that allergy applies to you."
          : restricted
            ? "The front label does not tell the full story about this ingredient."
            : definition.warningText,
      whatToDo:
        matchedAllergies.length > 0
          ? "Avoid this product if that allergy applies to you."
          : restricted?.whatToDo ?? definition.whatToDo,
    });

    return {
      key: ingredient.key,
      name: ingredient.name,
      level,
      rowStatusLabel:
        matchedAllergies.length > 0
          ? "Allergy"
          : restricted
            ? "Restricted"
            : level === "yellow"
              ? "Review"
              : level === "red"
                ? "Red flag"
                : "Normal",
      summaryLabel: ingredient.summaryLabel,
      helperText,
      badges,
      modal,
    };
  });

  const nutrients: AnalyzedNutrient[] = fakeProduct.nutrients.map((nutrient) => {
    const definition = nutrientDefinitions[nutrient.key];

    if (nutrient.watchTag && profile.avoid.includes(nutrient.watchTag)) {
      matchedWatchHits.add(nutrient.watchTag);
    }

    const levelText =
      nutrient.level === "red"
        ? definition.highText
        : nutrient.level === "yellow"
          ? definition.mediumText
          : definition.lowText;

    return {
      key: nutrient.key,
      name: nutrient.name,
      value: nutrient.displayValue,
      level: nutrient.level,
      band: nutrient.band,
      rowStatusLabel:
        /\d/.test(nutrient.displayValue) || nutrient.level === "red"
          ? nutrient.band
          : nutrient.displayValue,
      summaryLabel: nutrient.summaryLabel,
      modal: buildNutrientModal({
        name: nutrient.name,
        level: nutrient.level,
        shortDefinition: definition.shortDefinition,
        whatItDoes: definition.whatItDoes,
        levelText,
        value: nutrient.displayValue,
      }),
    };
  });

  const hasAllergyMatch = matchedAllergyIngredients.length > 0;
  const hasRegulatoryWarning = regulatoryIngredients.length > 0;
  const hasRedNutrient = nutrients.some((nutrient) => nutrient.level === "red");
  const hasYellowIngredient = ingredients.some((ingredient) => ingredient.level === "yellow");
  const hasYellowNutrient = nutrients.some((nutrient) => nutrient.level === "yellow");
  const highRiskIngredients = ingredients.filter((ingredient) => ingredient.level !== "green");
  const watchListHits = Array.from(matchedWatchHits);
  const sugarSignal = nutrients.find((nutrient) => nutrient.key === "sugar");
  const sodiumSignal = nutrients.find((nutrient) => nutrient.key === "sodium");
  const saturatedFatSignal = nutrients.find((nutrient) => nutrient.key === "saturated-fat");
  const fibreSignal = nutrients.find((nutrient) => nutrient.key === "fibre");
  const additiveIngredients = ingredients.filter((ingredient) =>
    ["soy-lecithin", "red-no-3"].includes(ingredient.key),
  );
  const hasAdditiveReview = additiveIngredients.length > 0;
  const hasArtificialColours = ingredients.some((ingredient) => ingredient.key === "red-no-3");
  const hasProcessingReview =
    ingredients.length >= 5 &&
    (hasAdditiveReview || ingredients.some((ingredient) => ingredient.key === "wheat-flour"));
  const hasNutritionBalanceReview = nutrients.some((nutrient) => nutrient.level !== "green");
  const hasAvoidListMatch = watchListHits.length > 0;
  const hasTooManyIngredients = ingredients.length >= 8;

  const immediateWarnings: ImmediateWarning[] = [];

  if (hasAllergyMatch) {
    immediateWarnings.push({
      id: "personal-allergy",
      title: "Allergy risk",
      body: `Contains ${matchedAllergyIngredients.join(", ")}.`,
      tone: "red",
      rowStatusLabel: "Found",
      modal: {
        title: "Allergy risk",
        tone: "red",
        sections: [
          {
            label: "Why this was flagged",
            text: "The scan compares the ingredient list against your saved allergies on this device.",
          },
          {
            label: "What this means",
            text: "This ingredient should not be ignored if you are allergic to it.",
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
    immediateWarnings.push({
      id: "regulatory-watch",
      title: "Banned/restricted item",
      body: `Contains ${regulatoryIngredients.join(", ")}.`,
      tone: "red",
      rowStatusLabel: "Found",
      modal: {
        title: "Banned/restricted item",
        tone: "red",
        sections: [
          {
            label: "Why this was flagged",
            text: `${regulatoryIngredients.join(", ")} is banned or restricted in some regions.`,
          },
          {
            label: "What this means",
            text: "This product is not a clean pass. The front label does not tell the full story here.",
          },
          {
            label: "What to do",
            text: warningTemplates.immediate.regulatory.action,
          },
        ],
      },
    });
  }

  const sugarNutrient = nutrients.find(
    (nutrient) => nutrient.key === "sugar" && nutrient.level === "red",
  );

  if (sugarNutrient) {
    immediateWarnings.push({
      id: "high-sugar-warning",
      title: "Too much sugar",
      body: "Sugar level is very high.",
      tone: "red",
      rowStatusLabel: "Found",
      modal: {
        title: "Too much sugar",
        tone: "red",
        sections: [
          {
            label: "Why this was flagged",
            text: "That amount crosses into the serious red range for this phase.",
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

  const checklist: ChecklistItem[] = [
    {
      id: "allergy-match",
      label: "Allergy risk",
      status: hasAllergyMatch ? "Yes" : "No",
      tone: hasAllergyMatch ? "red" : "green",
      explanation: hasAllergyMatch
        ? `Found: ${matchedAllergyIngredients.join(", ")}.`
        : warningTemplates.checklist.allergyMatch.no,
      modal: buildChecklistModal(
        "Allergy risk",
        hasAllergyMatch ? "red" : "green",
        hasAllergyMatch
          ? warningTemplates.checklist.allergyMatch.yes
          : warningTemplates.checklist.allergyMatch.no,
      ),
    },
    {
      id: "high-content-concern",
      label: "Too much sugar",
      status: hasRedNutrient ? "Yes" : "No",
      tone: hasRedNutrient ? "red" : "green",
      explanation: hasRedNutrient
        ? "Very high sugar pushes this into the serious red range."
        : warningTemplates.checklist.highContentConcern.no,
      modal: buildChecklistModal(
        "Too much sugar",
        hasRedNutrient ? "red" : "green",
        hasRedNutrient
          ? warningTemplates.checklist.highContentConcern.yes
          : warningTemplates.checklist.highContentConcern.no,
      ),
    },
    {
      id: "restricted-ingredient",
      label: "Banned/restricted item",
      status: hasRegulatoryWarning ? "Yes" : "No",
      tone: hasRegulatoryWarning ? "red" : "green",
      explanation: hasRegulatoryWarning
        ? `Found: ${regulatoryIngredients.join(", ")}.`
        : warningTemplates.checklist.restrictedIngredient.no,
      modal: buildChecklistModal(
        "Banned/restricted item",
        hasRegulatoryWarning ? "red" : "green",
        hasRegulatoryWarning
          ? warningTemplates.checklist.restrictedIngredient.yes
          : warningTemplates.checklist.restrictedIngredient.no,
      ),
    },
    {
      id: "high-risk-ingredients",
      label: "Ingredients worth questioning",
      status: highRiskIngredients.length > 0 ? "Yes" : "No",
      tone: highRiskIngredients.length > 0 ? "yellow" : "green",
      explanation:
        highRiskIngredients.length > 0
          ? `Review: ${highRiskIngredients.map((ingredient) => ingredient.name).join(", ")}.`
          : warningTemplates.checklist.highRiskIngredients.no,
      modal: buildChecklistModal(
        "Ingredients worth questioning",
        highRiskIngredients.length > 0 ? "yellow" : "green",
        highRiskIngredients.length > 0
          ? warningTemplates.checklist.highRiskIngredients.yes
          : warningTemplates.checklist.highRiskIngredients.no,
      ),
    },
    {
      id: "nutrition-concern",
      label: "Unhealthy nutrition signals",
      status: nutrients.some((nutrient) => nutrient.level !== "green") ? "Yes" : "No",
      tone: nutrients.some((nutrient) => nutrient.level !== "green") ? "yellow" : "green",
      explanation: nutrients.some((nutrient) => nutrient.level !== "green")
        ? `Review: ${nutrients
            .filter((nutrient) => nutrient.level !== "green")
            .map((nutrient) => `${nutrient.name} (${nutrient.band.toLowerCase()})`)
            .join(", ")}.`
        : warningTemplates.checklist.nutritionConcern.no,
      modal: buildChecklistModal(
        "Unhealthy nutrition signals",
        nutrients.some((nutrient) => nutrient.level !== "green") ? "yellow" : "green",
        nutrients.some((nutrient) => nutrient.level !== "green")
          ? warningTemplates.checklist.nutritionConcern.yes
          : warningTemplates.checklist.nutritionConcern.no,
      ),
    },
  ];

  const scanChecks = ([
    {
      id: "scan-allergy-match",
      label: "Allergy risk",
      status: hasAllergyMatch ? "Found" : "None",
      tone: hasAllergyMatch ? "red" : "green",
      explanation: hasAllergyMatch
        ? `Found: ${matchedAllergyIngredients.join(", ")}.`
        : warningTemplates.checklist.allergyMatch.no,
      modal: hasAllergyMatch
        ? buildScanCheckModal(
            "Allergy risk",
            "red",
            `This product contains ${matchedAllergyIngredients.join(", ")}, which matches your saved allergy.`,
          )
        : undefined,
    },
    {
      id: "scan-too-much-sugar",
      label: "Too much sugar",
      status:
        sugarSignal?.level === "red"
          ? "Found"
          : sugarSignal?.level === "yellow"
            ? "Review"
            : "None",
      tone: sugarSignal?.level ?? "green",
      explanation:
        sugarSignal?.level === "red"
          ? "Sugar crosses into the serious red range for this scan."
          : sugarSignal?.level === "yellow"
            ? "Sugar is high enough to be worth questioning."
            : "No high-sugar red flag was found in this sample.",
      modal:
        sugarSignal && sugarSignal.level !== "green"
          ? buildScanCheckModal(
              "Too much sugar",
              sugarSignal.level,
              sugarSignal.level === "red"
                ? "Sugar crosses into the serious red range for this scan."
                : "Sugar is high enough to be worth questioning.",
            )
          : undefined,
    },
    {
      id: "scan-too-much-salt",
      label: "Too much salt",
      status:
        sodiumSignal?.level === "red"
          ? "Found"
          : sodiumSignal?.level === "yellow"
            ? "Review"
            : "None",
      tone: sodiumSignal?.level ?? "green",
      explanation:
        sodiumSignal?.level === "red"
          ? "Salt crosses into the serious red range for this scan."
          : sodiumSignal?.level === "yellow"
            ? "Salt is high enough to be worth questioning."
            : "No high-salt red flag was found in this sample.",
      modal:
        sodiumSignal && sodiumSignal.level !== "green"
          ? buildScanCheckModal(
              "Too much salt",
              sodiumSignal.level,
              sodiumSignal.level === "red"
                ? "Salt crosses into the serious red range for this scan."
                : "Salt is high enough to be worth questioning.",
            )
          : undefined,
    },
    {
      id: "scan-unhealthy-fat",
      label: "Unhealthy fat",
      status:
        saturatedFatSignal?.level === "red"
          ? "Found"
          : saturatedFatSignal?.level === "yellow"
            ? "Review"
            : saturatedFatSignal?.band ?? "None",
      tone: saturatedFatSignal?.level ?? "green",
      explanation:
        saturatedFatSignal?.level === "red"
          ? "Fat levels cross into the serious red range for this scan."
          : saturatedFatSignal?.level === "yellow"
            ? "Fat levels are high enough to be worth questioning."
            : "No major unhealthy-fat red flag was found in this sample.",
      modal:
        saturatedFatSignal && saturatedFatSignal.level !== "green"
          ? buildScanCheckModal(
              "Unhealthy fat",
              saturatedFatSignal.level,
              saturatedFatSignal.level === "red"
                ? "Fat levels cross into the serious red range for this scan."
                : "Fat levels are high enough to be worth questioning.",
            )
          : undefined,
    },
    {
      id: "scan-regulatory-watch",
      label: "Banned/restricted item",
      status: hasRegulatoryWarning ? "Found" : "None",
      tone: hasRegulatoryWarning ? "red" : "green",
      explanation: hasRegulatoryWarning
        ? `Found: ${regulatoryIngredients.join(", ")}.`
        : warningTemplates.checklist.restrictedIngredient.no,
      modal: hasRegulatoryWarning
        ? buildScanCheckModal(
            "Banned/restricted item",
            "red",
            `${regulatoryIngredients.join(", ")} is flagged as banned or restricted in some regions.`,
          )
        : undefined,
    },
    {
      id: "scan-additives",
      label: "Artificial additives",
      status: hasAdditiveReview ? "Found" : "None",
      tone: hasAdditiveReview ? "yellow" : "green",
      explanation: hasAdditiveReview
        ? `Review: ${additiveIngredients.map((ingredient) => ingredient.name).join(", ")}.`
        : "No standout additive review items were found in this sample.",
      modal: hasAdditiveReview
        ? buildScanCheckModal(
            "Artificial additives",
            "yellow",
            `${additiveIngredients.map((ingredient) => ingredient.name).join(", ")} were found and are worth questioning.`,
          )
        : undefined,
    },
    {
      id: "scan-processing-level",
      label: "Ultra-processed food",
      status: hasProcessingReview ? "Likely" : "No",
      tone: hasProcessingReview ? "yellow" : "green",
      explanation: hasProcessingReview
        ? "Multiple refined and helper ingredients make this look more processed than a simple snack."
        : "The ingredient pattern stays on the simpler side for this sample.",
      modal: hasProcessingReview
        ? buildScanCheckModal(
            "Ultra-processed food",
            "yellow",
            "The ingredient mix includes several refined or helper ingredients, which suggests a more processed product.",
          )
        : undefined,
    },
    {
      id: "scan-low-fibre",
      label: "Low fibre",
      status: fibreSignal?.level === "yellow" ? "Found" : "None",
      tone: fibreSignal?.level ?? "green",
      explanation:
        fibreSignal?.level === "yellow"
          ? "Fibre is low enough to be worth questioning."
          : "No low-fibre warning was found in this sample.",
      modal:
        fibreSignal && fibreSignal.level !== "green"
          ? buildScanCheckModal(
              "Low fibre",
              fibreSignal.level,
              "Fibre is low enough to be worth questioning.",
            )
          : undefined,
    },
    {
      id: "scan-artificial-colours",
      label: "Artificial colours",
      status: hasArtificialColours ? "Found" : "None",
      tone: hasArtificialColours ? "yellow" : "green",
      explanation: hasArtificialColours
        ? "Artificial colour additives were found in this product."
        : "No artificial colour warning was found in this sample.",
      modal: hasArtificialColours
        ? buildScanCheckModal(
            "Artificial colours",
            "yellow",
            "Artificial colour additives were found in this product.",
          )
        : undefined,
    },
    {
      id: "scan-artificial-sweeteners",
      label: "Artificial sweeteners",
      status: "None",
      tone: "green",
    },
    {
      id: "scan-preservatives",
      label: "Preservatives",
      status: "None",
      tone: "green",
    },
    {
      id: "scan-processed-oils",
      label: "Processed oils",
      status: "None",
      tone: "green",
    },
    {
      id: "scan-too-many-ingredients",
      label: "Too many ingredients",
      status: hasTooManyIngredients ? "Likely" : "No",
      tone: hasTooManyIngredients ? "yellow" : "green",
      explanation: hasTooManyIngredients
        ? "This ingredient list is long enough to be worth questioning."
        : "The ingredient count does not trigger a long-list warning in this sample.",
      modal: hasTooManyIngredients
        ? buildScanCheckModal(
            "Too many ingredients",
            "yellow",
            "This ingredient list is long enough to be worth questioning.",
          )
        : undefined,
    },
    {
      id: "scan-avoid-list-match",
      label: "Matches your saved avoid list",
      status: hasAvoidListMatch ? "Found" : "None",
      tone: hasAvoidListMatch ? "yellow" : "green",
      explanation: hasAvoidListMatch
        ? `Matched: ${watchListHits.join(", ")}.`
        : "No saved avoid-list item was matched in this sample.",
      modal: hasAvoidListMatch
        ? buildScanCheckModal(
            "Matches your saved avoid list",
            "yellow",
            `This product matches your saved avoid-list items: ${watchListHits.join(", ")}.`,
          )
        : undefined,
    },
    {
      id: "scan-unhealthy-nutrition",
      label: "Unhealthy nutrition signals",
      status: hasNutritionBalanceReview ? "Found" : "None",
      tone: hasNutritionBalanceReview ? "yellow" : "green",
      explanation: hasNutritionBalanceReview
        ? "The nutrition panel triggered multiple signals worth questioning."
        : "No broader nutrition warning was found in this sample.",
      modal: hasNutritionBalanceReview
        ? buildScanCheckModal(
            "Unhealthy nutrition signals",
            "yellow",
            "The nutrition panel triggered multiple signals worth questioning.",
          )
        : undefined,
    },
    {
      id: "scan-total-ingredients",
      label: "Total ingredients",
      status: String(ingredients.length),
      tone: "neutral",
    },
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

  if (sugarNutrient) {
    reasons.push("Too much sugar");
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

  if (reasons.length === 0 && highRiskIngredients.length > 0) {
    reasons.push("Items worth reviewing");
  }

  return {
    product: {
      name: fakeProduct.name,
      brand: fakeProduct.brand,
      barcode: fakeProduct.barcode,
      imageAlt: fakeProduct.imageAlt,
      rawSource: "sample",
    },
    profile,
    watchListHits,
    immediateWarnings,
    scanChecks,
    ingredients,
    nutrients,
    checklist,
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
      ingredients: "available",
      nutrition: "available",
    },
  };
}
