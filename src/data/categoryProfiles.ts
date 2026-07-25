import type {
  CategoryProfile,
  ExposureCheckId,
  ProductCategory,
} from "@/types/exposure";

export const exposureCheckLabels: Record<ExposureCheckId, string> = {
  harmful_additives: "Harmful additives",
  artificial_engineered_food_construction:
    "Artificial / Engineered Food Construction",
  banned_restricted_items: "Banned / Restricted Items",
  seed_oil: "Seed oil / processed oils",
  total_ingredients: "Ingredient Count",
  ultra_processed: "Ultra Processed",
  natural_vs_processed: "Natural vs Processed",
  allergy_risk: "Allergy Risk",
  artificial_sweeteners: "Artificial Sweeteners",
  artificial_colours: "Artificial Colours",
  preservatives: "Preservatives",
  microplastics: "Microplastics",
  heavy_metals: "Heavy Metals",
  meat_feed_source: "Meat Feed Source",
  fry_oil_seed_oils: "Fry Oil / Seed Oils",
  additives_preservatives: "Additives & Preservatives",
  ingredient_count: "Ingredient Count",
  cancer_linked_watch: "Cancer-linked Watch",
  brand_trust_safety: "Brand Trust / Safety",
  lawsuits_recalls: "Recall Warning",
};

export const automaticSeriousOverrideChecks: ExposureCheckId[] = [
  "allergy_risk",
  "banned_restricted_items",
  "cancer_linked_watch",
  "microplastics",
  "heavy_metals",
  "brand_trust_safety",
  "lawsuits_recalls",
];

export const defaultProductCategory: ProductCategory = "packaged_processed";

export const categoryProfiles: CategoryProfile[] = [
  {
    id: "packaged_processed",
    slug: "packaged-processed-foods",
    label: "Packaged / Processed Foods",
    description: "Default row set for shelf foods, bars, snacks, and heavily packaged items.",
    quickOverviewIds: [
      "harmful_additives",
      "banned_restricted_items",
      "seed_oil",
      "total_ingredients",
      "ultra_processed",
      "allergy_risk",
    ],
  },
  {
    id: "meat_fast_food",
    slug: "meat-fast-food",
    label: "Meat / Fast Food",
    description: "Default row set for takeaway-style products, prepared meats, and sandwiches.",
    quickOverviewIds: [
      "harmful_additives",
      "seed_oil",
      "total_ingredients",
      "ultra_processed",
      "meat_feed_source",
      "fry_oil_seed_oils",
    ],
  },
  {
    id: "drinks_beverages",
    slug: "drinks-beverages",
    label: "Drinks / Beverages",
    description: "Default row set for bottled drinks, sweetened beverages, and functional drinks.",
    quickOverviewIds: [
      "harmful_additives",
      "banned_restricted_items",
      "artificial_sweeteners",
      "preservatives",
      "total_ingredients",
      "ultra_processed",
      "microplastics",
      "allergy_risk",
    ],
  },
  {
    id: "baby_kids",
    slug: "baby-kids-food",
    label: "Baby / Kids Food",
    description: "Default row set for child-focused foods where stricter warning thresholds matter more.",
    quickOverviewIds: [
      "harmful_additives",
      "banned_restricted_items",
      "artificial_sweeteners",
      "total_ingredients",
      "ultra_processed",
      "heavy_metals",
      "allergy_risk",
    ],
  },
  {
    id: "seafood",
    slug: "seafood",
    label: "Seafood",
    description: "Default row set for seafood products where contamination signals are more central.",
    quickOverviewIds: [
      "heavy_metals",
      "microplastics",
      "banned_restricted_items",
      "allergy_risk",
      "total_ingredients",
      "ultra_processed",
    ],
  },
  {
    id: "dairy_egg",
    slug: "dairy-egg-products",
    label: "Dairy / Egg Products",
    description: "Default row set for dairy-heavy and egg-based packaged products.",
    quickOverviewIds: [
      "allergy_risk",
      "harmful_additives",
      "banned_restricted_items",
      "total_ingredients",
      "ultra_processed",
    ],
  },
  {
    id: "fresh_simple",
    slug: "fresh-simple-foods",
    label: "Fresh / Simple Foods",
    description: "Default row set for simpler foods where the main question is whether the label stays clean.",
    quickOverviewIds: [
      "total_ingredients",
      "ultra_processed",
      "harmful_additives",
      "banned_restricted_items",
      "allergy_risk",
    ],
  },
  {
    id: "general_unknown",
    slug: "general-unknown",
    label: "General / Unknown",
    description: "Fallback row set when the product category is broad or not clearly identified yet.",
    quickOverviewIds: [
      "harmful_additives",
      "banned_restricted_items",
      "total_ingredients",
      "ultra_processed",
      "allergy_risk",
    ],
  },
];

export function getCategoryProfile(category: ProductCategory) {
  return (
    categoryProfiles.find((profile) => profile.id === category) ??
    categoryProfiles.find((profile) => profile.id === defaultProductCategory)!
  );
}

export function getCategoryProfileBySlug(slug?: string | null) {
  return (
    categoryProfiles.find((profile) => profile.slug === slug) ??
    categoryProfiles.find((profile) => profile.id === defaultProductCategory)!
  );
}

export function getCategorySlug(category: ProductCategory) {
  return getCategoryProfile(category).slug;
}
