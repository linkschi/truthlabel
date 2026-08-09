export type HealthyAlternativeCategoryName =
  | "Bread & Bakery"
  | "Breakfast"
  | "Dairy"
  | "Eggs"
  | "Meat"
  | "Seafood"
  | "Snacks"
  | "Drinks"
  | "Sauces & Condiments"
  | "Frozen Foods"
  | "Rice & Pasta"
  | "Cooking Oils"
  | "Chocolate & Sweets"
  | "Baby & Kids Foods"
  | "Plant-Based Alternatives";

export type HealthyAlternativeCategory = {
  id: string;
  slug: string;
  name: HealthyAlternativeCategoryName;
  description: string;
  order: number;
};

export type HealthyAlternativeProcessingLevel = {
  group?: number;
  label: string;
};

export type HealthyAlternativeAmazon = {
  asin?: string;
  url?: string;
  affiliateUrl?: string | null;
};

export type HealthyAlternativeImages = {
  primary?: string;
  gallery?: string[];
};

export type HealthyAlternativeSelection = {
  recommended: boolean;
  rank: number;
  reason: string;
};

export type HealthyAlternativeProductSource = {
  kind: "demo" | "curated";
  note?: string;
};

export type HealthyAlternativeProduct = {
  id: string;
  slug: string;
  productName: string;
  brand: string;
  category: HealthyAlternativeCategoryName;
  subcategory: string;
  productType: string;
  shortDescription?: string;
  whyRecommended?: string;
  recommendationTags: string[];
  ingredients?: string[];
  ingredientCount?: number;
  processingLevel?: HealthyAlternativeProcessingLevel;
  keyBenefits?: string[];
  thingsToKnow?: string[];
  dietaryTags?: string[];
  packageSize?: string;
  amazon?: HealthyAlternativeAmazon;
  images?: HealthyAlternativeImages;
  selection: HealthyAlternativeSelection;
  alternativeForMarkers?: string[];
  replaces?: string[];
  source: HealthyAlternativeProductSource;
};
