import type { NutrientKey } from "@/data/fakeProduct";

export type NutrientDefinition = {
  key: NutrientKey;
  name: string;
  shortDefinition: string;
  whatItDoes: string;
  lowText: string;
  mediumText: string;
  highText: string;
  colorRules: {
    green: string;
    yellow: string;
    red: string;
  };
  summaryLabel: string;
};

export const nutrientDefinitions: Record<NutrientKey, NutrientDefinition> = {
  sugar: {
    key: "sugar",
    name: "Sugar",
    shortDefinition: "A quick-energy carbohydrate that also drives sweetness.",
    whatItDoes: "Large amounts can make a snack feel dessert-like instead of balanced.",
    lowText: "Low sugar stays in the calmer range for this app.",
    mediumText: "Moderate sugar gets a review tag so it is worth checking.",
    highText: "Very high sugar earns a red warning because the level is extreme.",
    colorRules: {
      green: "Green for low or normal sugar.",
      yellow: "Yellow for a review-level amount.",
      red: "Red only when the amount is very high.",
    },
    summaryLabel: "Very high sugar",
  },
  sodium: {
    key: "sodium",
    name: "Sodium",
    shortDefinition: "A mineral linked to salt content and overall flavour balance.",
    whatItDoes: "Higher amounts can push a snack into a review zone even if it does not taste salty.",
    lowText: "Low sodium stays in the normal range.",
    mediumText: "Medium sodium gets a yellow review tag.",
    highText: "Very high sodium would be a serious concern.",
    colorRules: {
      green: "Green for low sodium.",
      yellow: "Yellow for medium sodium.",
      red: "Red for extreme sodium only.",
    },
    summaryLabel: "Moderate sodium",
  },
  "saturated-fat": {
    key: "saturated-fat",
    name: "Saturated fat",
    shortDefinition: "A type of fat often tracked in packaged snack foods.",
    whatItDoes: "It affects richness, texture, and can shape the overall nutrition picture.",
    lowText: "Low saturated fat stays green.",
    mediumText: "Moderate levels should be reviewed in context.",
    highText: "Very high saturated fat would raise a stronger warning.",
    colorRules: {
      green: "Green for low saturated fat.",
      yellow: "Yellow for medium review levels.",
      red: "Red for extremely high amounts.",
    },
    summaryLabel: "Low saturated fat",
  },
  protein: {
    key: "protein",
    name: "Protein",
    shortDefinition: "A nutrient that helps with structure, fullness, and recovery.",
    whatItDoes: "Normal protein helps balance the snack without creating a concern by itself.",
    lowText: "Low protein would not be a warning, but it adds less balance.",
    mediumText: "Normal protein stays green in this app.",
    highText: "High protein can still be fine depending on the product.",
    colorRules: {
      green: "Green for normal or helpful protein.",
      yellow: "Yellow when balance should be reviewed.",
      red: "Protein alone is rarely a red flag here.",
    },
    summaryLabel: "Normal protein",
  },
  fibre: {
    key: "fibre",
    name: "Fibre",
    shortDefinition: "A carbohydrate that supports fullness and digestion.",
    whatItDoes: "Low fibre can make a snack feel less balanced when sugar is already high.",
    lowText: "Low fibre gets a yellow review tag in this sample.",
    mediumText: "Moderate fibre supports a better balance.",
    highText: "Very high fibre is not a concern here by default.",
    colorRules: {
      green: "Green for supportive fibre levels.",
      yellow: "Yellow for low fibre when the product needs review.",
      red: "Red is not used for fibre in this phase.",
    },
    summaryLabel: "Low fibre",
  },
};
