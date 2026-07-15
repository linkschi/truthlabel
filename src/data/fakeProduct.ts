export const allergyOptions = [
  "Milk",
  "Egg",
  "Peanuts",
  "Tree nuts",
  "Wheat / gluten",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
  "Mustard",
  "Celery",
  "Lupin",
  "Molluscs",
  "Sulphites",
] as const;

export const avoidOptions = [
  "Artificial colours",
  "Artificial sweeteners",
  "Preservatives",
  "High sugar",
  "High sodium",
  "Palm oil",
] as const;

export type AllergyConcern = (typeof allergyOptions)[number];
export type AvoidConcern = (typeof avoidOptions)[number];
export type ConcernLevel = "green" | "yellow" | "red";

export const concernLabels: Record<ConcernLevel, string> = {
  green: "Low concern",
  yellow: "Worth reviewing",
  red: "Red flag",
};

export type UserProfile = {
  allergies: AllergyConcern[];
  avoid: AvoidConcern[];
};

export const defaultProfile: UserProfile = {
  allergies: ["Milk"],
  avoid: ["High sugar"],
};

export type IngredientKey =
  | "sugar"
  | "wheat-flour"
  | "milk-powder"
  | "soy-lecithin"
  | "red-no-3"
  | "natural-flavouring";

export type NutrientKey =
  | "sugar"
  | "sodium"
  | "saturated-fat"
  | "protein"
  | "fibre";

export type ProductIngredient = {
  key: IngredientKey;
  name: string;
  baseLevel: ConcernLevel;
  summaryLabel: string;
  watchTags: AvoidConcern[];
};

export type ProductNutrient = {
  key: NutrientKey;
  name: string;
  displayValue: string;
  level: ConcernLevel;
  band: string;
  summaryLabel: string;
  watchTag?: AvoidConcern;
};

export type FakeProduct = {
  name: string;
  brand: string;
  barcode: string;
  imageAlt: string;
  ingredients: ProductIngredient[];
  nutrients: ProductNutrient[];
};

export const fakeProduct: FakeProduct = {
  name: "Chocolate Cereal Bar",
  brand: "Example Foods",
  barcode: "123456789",
  imageAlt: "Illustrated placeholder for Chocolate Cereal Bar packaging.",
  ingredients: [
    {
      key: "sugar",
      name: "Sugar",
      baseLevel: "yellow",
      summaryLabel: "Added sugar",
      watchTags: ["High sugar"],
    },
    {
      key: "wheat-flour",
      name: "Wheat flour",
      baseLevel: "green",
      summaryLabel: "Refined flour base",
      watchTags: [],
    },
    {
      key: "milk-powder",
      name: "Milk powder",
      baseLevel: "yellow",
      summaryLabel: "Milk powder",
      watchTags: [],
    },
    {
      key: "soy-lecithin",
      name: "Soy lecithin",
      baseLevel: "yellow",
      summaryLabel: "Soy emulsifier",
      watchTags: [],
    },
    {
      key: "red-no-3",
      name: "Red No. 3",
      baseLevel: "red",
      summaryLabel: "Flagged synthetic colour",
      watchTags: ["Artificial colours"],
    },
    {
      key: "natural-flavouring",
      name: "Natural flavouring",
      baseLevel: "green",
      summaryLabel: "Flavour support",
      watchTags: [],
    },
  ],
  nutrients: [
    {
      key: "sugar",
      name: "Sugar",
      displayValue: "32g",
      level: "red",
      band: "Very high",
      summaryLabel: "Very high sugar",
      watchTag: "High sugar",
    },
    {
      key: "sodium",
      name: "Sodium",
      displayValue: "Medium",
      level: "yellow",
      band: "Review",
      summaryLabel: "Moderate sodium",
      watchTag: "High sodium",
    },
    {
      key: "saturated-fat",
      name: "Saturated fat",
      displayValue: "Low",
      level: "green",
      band: "Low",
      summaryLabel: "Low saturated fat",
    },
    {
      key: "protein",
      name: "Protein",
      displayValue: "Normal",
      level: "green",
      band: "Normal",
      summaryLabel: "Normal protein",
    },
    {
      key: "fibre",
      name: "Fibre",
      displayValue: "Low",
      level: "yellow",
      band: "Review",
      summaryLabel: "Low fibre",
    },
  ],
};
