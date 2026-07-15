import type { AllergyConcern } from "@/data/fakeProduct";

export type Severity = "green" | "yellow" | "red" | "neutral";

export type IngredientGroup =
  | "natural_positive"
  | "processed_artificial"
  | "unknown_review";

export type ProductCategory =
  | "packaged_processed"
  | "meat_fast_food"
  | "drinks_beverages"
  | "baby_kids"
  | "seafood"
  | "dairy_egg"
  | "fresh_simple"
  | "general_unknown";

export type ExposureCheckId =
  | "harmful_additives"
  | "artificial_engineered_food_construction"
  | "banned_restricted_items"
  | "seed_oil"
  | "total_ingredients"
  | "ultra_processed"
  | "natural_vs_processed"
  | "allergy_risk"
  | "artificial_sweeteners"
  | "artificial_colours"
  | "preservatives"
  | "microplastics"
  | "heavy_metals"
  | "meat_feed_source"
  | "fry_oil_seed_oils"
  | "additives_preservatives"
  | "ingredient_count"
  | "cancer_linked_watch"
  | "brand_trust_safety"
  | "lawsuits_recalls";

export type IssueCounts = {
  red: number;
  yellow: number;
};

export type AdditiveBreakdownKind =
  | "artificial_colours"
  | "preservatives"
  | "emulsifiers"
  | "artificial_sweeteners"
  | "stabilisers_thickeners"
  | "flavour_enhancers"
  | "other_additives";

export type IngredientRecord = {
  id: string;
  displayName: string;
  aliases: string[];
  group: IngredientGroup;
  severity: Severity;
  issueTags: ExposureCheckId[];
  shortDefinition?: string;
  whyUsed?: string;
  whyFlagged?: string;
  whatItMeans?: string;
  whatToDo?: string;
  evidenceStatus?: "demo" | "needs_source" | "verified";
  additiveKinds?: AdditiveBreakdownKind[];
  allergenConcerns?: AllergyConcern[];
};

export type ExposureCheckResult = {
  id: ExposureCheckId;
  label: string;
  value?: string | number;
  severity: Severity;
  redCount: number;
  yellowCount: number;
  isAutomaticSeriousOverride: boolean;
  hasMeaningfulValue: boolean;
};

export type ExposureDetailSection = {
  label: string;
  text: string;
};

export type ExposureDetail = {
  title: string;
  tone: Exclude<Severity, "neutral">;
  status: string;
  sections: ExposureDetailSection[];
};

export type CategoryProfile = {
  id: ProductCategory;
  slug: string;
  label: string;
  description: string;
  quickOverviewIds: ExposureCheckId[];
};

export type IngredientClassification = {
  groups: Record<IngredientGroup, IngredientRecord[]>;
  totalCount: number;
  naturalCount: number;
  processedCount: number;
  unknownCount: number;
  redCount: number;
  yellowCount: number;
  naturalPercent: number;
  processedPercent: number;
};

export type AdditiveBreakdownResult = {
  id: AdditiveBreakdownKind;
  label: string;
  count: number;
  severity: Severity;
  redCount: number;
  yellowCount: number;
  detail: ExposureDetail;
};

export type ExposureRiskBand =
  | "Clean Pass"
  | "Worth Reviewing"
  | "High Review"
  | "Poor"
  | "Strong Warning";
