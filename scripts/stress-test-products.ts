import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { ScanResult } from "../src/lib/buildScanResult";
import type { ExternalSafetySignal } from "../src/lib/externalSafety/externalSafetyTypes";
import { runManualScan } from "../src/lib/runManualScan";

type Severity = "green" | "yellow" | "red";
type ScanSource = "manual_paste" | "barcode" | "ocr";

type ExpectedCheck = {
  verdictTone?: Severity;
  headline?: string;
  minExposureRisk?: number;
  maxExposureRisk?: number;
  minIngredientLoad?: number;
  maxIngredientLoad?: number;
  requiredVisibleCategoryIds?: string[];
  forbiddenVisibleCategoryIds?: string[];
  requiredDeepCategoryIds?: string[];
  forbiddenDeepCategoryIds?: string[];
  requiredMatchedCategoryNames?: string[];
  forbiddenMatchedCategoryNames?: string[];
  requiredMatchedItemText?: string[];
  forbiddenMatchedItemText?: string[];
  requiredNaturalPositiveText?: string[];
  forbiddenNaturalPositiveText?: string[];
  requiredProcessedArtificialText?: string[];
  forbiddenProcessedArtificialText?: string[];
  requiredUnknownReviewText?: string[];
  forbiddenUnknownReviewText?: string[];
  brandTrustStatus?: ScanResult["brandTrustSafety"]["status"];
  brandTrustSeverity?: ScanResult["brandTrustSafety"]["severity"];
};

type StressProduct = {
  id: string;
  productName: string;
  brandName?: string;
  barcode?: string;
  productCategory: string;
  ingredientText: string;
  allergenStatement?: string;
  packagingText?: string;
  userAllergyProfile?: string[];
  externalSignals?: Array<string | ExternalSafetySignal | Record<string, unknown>>;
  scanSource?: ScanSource;
  expected: ExpectedCheck;
  notes?: string;
};

type ProductRun = {
  product: StressProduct;
  result?: ScanResult;
  issues: string[];
  warnings: string[];
  error?: string;
};

const reportPath = path.join(
  process.cwd(),
  "docs",
  "truthlabel-product-stress-report.md",
);

function externalSafetySignal(
  overrides: Partial<ExternalSafetySignal>,
): ExternalSafetySignal {
  return {
    id: overrides.id ?? "mock-signal",
    sourceProvider: overrides.sourceProvider ?? "mock",
    sourceName: overrides.sourceName ?? "Truthlabel mock official source",
    sourceUrl: overrides.sourceUrl,
    region: overrides.region ?? "US",
    signalType: overrides.signalType ?? "active_recall",
    status: overrides.status ?? "active",
    severity: overrides.severity ?? "red",
    title: overrides.title ?? "Active official recall",
    productName: overrides.productName,
    brandName: overrides.brandName,
    companyName: overrides.companyName,
    reason:
      overrides.reason ??
      "Official product-specific safety signal used for local stress testing.",
    affectedLots: overrides.affectedLots,
    affectedDates: overrides.affectedDates,
    affectedRegions: overrides.affectedRegions,
    recallClass: overrides.recallClass,
    publishedDate: overrides.publishedDate,
    lastUpdatedDate: overrides.lastUpdatedDate,
    matchedBy: overrides.matchedBy ?? ["product_name", "brand_name"],
    matchConfidence: overrides.matchConfidence ?? "high",
    userFacingMessage:
      overrides.userFacingMessage ??
      "Official safety signal found for this product or batch.",
    raw: overrides.raw,
  };
}

const products: StressProduct[] = [
  {
    id: "simple-oats",
    productName: "Simple Rolled Oats",
    brandName: "Local Test",
    productCategory: "Fresh / Simple Foods",
    ingredientText: "Rolled oats",
    expected: {
      verdictTone: "green",
      headline: "No major concerns",
      maxExposureRisk: 20,
      maxIngredientLoad: 5,
      forbiddenDeepCategoryIds: ["allergy_risk", "brand_trust_safety"],
    },
  },
  {
    id: "plain-water",
    productName: "Plain Still Water",
    brandName: "Local Test",
    productCategory: "Drinks / Beverages",
    ingredientText: "Water",
    expected: {
      verdictTone: "green",
      headline: "No major concerns",
      maxExposureRisk: 20,
      maxIngredientLoad: 5,
    },
  },
  {
    id: "pet-bottled-water",
    productName: "PET Bottled Water",
    brandName: "Local Test",
    productCategory: "Drinks / Beverages",
    ingredientText: "Water",
    packagingText: "Plastic bottle, PET bottle, single-use plastic cap",
    expected: {
      requiredVisibleCategoryIds: ["microplastics"],
      maxExposureRisk: 55,
    },
    notes: "Packaging should create a microplastics review marker, not a contamination claim.",
  },
  {
    id: "apple-juice",
    productName: "Apple Juice",
    brandName: "Local Test",
    productCategory: "Drinks / Beverages",
    ingredientText: "Apple juice, ascorbic acid",
    expected: {
      requiredDeepCategoryIds: ["heavy_metals"],
      maxExposureRisk: 55,
    },
    notes: "Fruit juice can be a lead/arsenic review category, but should not become red from category alone.",
  },
  {
    id: "zero-sugar-drink",
    productName: "Zero Sugar Cola",
    brandName: "Local Test",
    productCategory: "Drinks / Beverages",
    ingredientText:
      "Carbonated water, caramel colour, phosphoric acid, aspartame, acesulfame potassium, sucralose, sodium benzoate, natural flavour",
    expected: {
      verdictTone: "red",
      minExposureRisk: 50,
      requiredMatchedCategoryNames: [
        "Artificial Sweeteners / Sugar Substitutes",
        "Preservatives & Shelf-Life Systems",
        "Unknown / Review Ingredients",
      ],
    },
  },
  {
    id: "red-berry-soda-red-3",
    productName: "Red Berry Soda",
    brandName: "Local Test",
    productCategory: "Drinks / Beverages",
    ingredientText:
      "Carbonated water, sugar, citric acid, Red No. 3, sodium benzoate, natural flavour",
    expected: {
      verdictTone: "red",
      minExposureRisk: 70,
      requiredVisibleCategoryIds: ["banned_restricted_items"],
      requiredMatchedCategoryNames: ["Artificial Colours", "Banned / Restricted Items"],
      requiredMatchedItemText: ["Red No. 3"],
    },
  },
  {
    id: "three-artificial-colours",
    productName: "Color Blast Candy",
    brandName: "Local Test",
    productCategory: "Sweets / Candy",
    ingredientText:
      "Sugar, glucose syrup, citric acid, Red 40, Yellow 5, Blue 1, artificial flavour",
    expected: {
      verdictTone: "red",
      minExposureRisk: 50,
      requiredMatchedCategoryNames: ["Artificial Colours"],
    },
  },
  {
    id: "titanium-dioxide-candy",
    productName: "White Coated Candy",
    brandName: "Local Test",
    productCategory: "Sweets / Candy",
    ingredientText: "Sugar, glucose syrup, titanium dioxide, shellac, flavouring",
    expected: {
      verdictTone: "red",
      minExposureRisk: 70,
      requiredVisibleCategoryIds: ["banned_restricted_items"],
      requiredMatchedItemText: ["titanium dioxide"],
    },
  },
  {
    id: "preservative-overload-known",
    productName: "Shelf Stable Sauce Known Preservatives",
    brandName: "Local Test",
    productCategory: "Sauces / Condiments",
    ingredientText:
      "Water, tomato paste, sugar, salt, sodium benzoate, potassium benzoate, sodium nitrite, BHT",
    expected: {
      verdictTone: "red",
      minExposureRisk: 50,
      requiredDeepCategoryIds: ["preservatives_shelf_life_systems"],
    },
  },
  {
    id: "preservative-coverage-sorbate-propionate",
    productName: "Shelf Stable Sauce Sorbate Propionate",
    brandName: "Local Test",
    productCategory: "Sauces / Condiments",
    ingredientText:
      "Water, tomato paste, sugar, salt, sodium benzoate, potassium sorbate, calcium propionate, xanthan gum, natural flavour",
    expected: {
      forbiddenVisibleCategoryIds: ["meat_specific_concerns"],
      requiredMatchedCategoryNames: ["Preservatives & Shelf-Life Systems"],
      requiredMatchedItemText: [
        "Sodium benzoate",
        "Potassium sorbate",
        "Calcium propionate",
      ],
    },
    notes: "This catches common preservative aliases that should not disappear from the preservative category.",
  },
  {
    id: "two-seed-oils",
    productName: "Mixed Oil Crisps",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText:
      "Potatoes, sunflower oil, canola oil, salt, maltodextrin, flavouring",
    expected: {
      verdictTone: "red",
      minExposureRisk: 50,
      requiredVisibleCategoryIds: ["seed_oils_processed_oils"],
      requiredMatchedCategoryNames: ["Seed Oils / Processed Oils"],
    },
  },
  {
    id: "vegetable-oil-unspecified",
    productName: "Vegetable Oil Crackers",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText:
      "Wheat flour, sugar, vegetable oil, salt, natural flavour, raising agent",
    expected: {
      requiredMatchedCategoryNames: [
        "Seed Oils / Processed Oils",
        "Unknown / Review Ingredients",
      ],
      forbiddenNaturalPositiveText: ["vegetable oil"],
    },
    notes: "Generic vegetable oil should not be treated as a positive simple oil.",
  },
  {
    id: "partially-hydrogenated-oil",
    productName: "Old Style Shortening Cookies",
    brandName: "Local Test",
    productCategory: "Bakery / Desserts",
    ingredientText:
      "Wheat flour, sugar, partially hydrogenated soybean oil, salt, vanilla",
    expected: {
      verdictTone: "red",
      minExposureRisk: 70,
      requiredVisibleCategoryIds: ["banned_restricted_items"],
      requiredDeepCategoryIds: ["hydrogenated_partially_hydrogenated_oils"],
      requiredMatchedCategoryNames: [
        "Banned / Restricted Items",
        "Hydrogenated / Partially Hydrogenated Oils",
      ],
    },
  },
  {
    id: "brominated-vegetable-oil",
    productName: "Citrus Soda With BVO",
    brandName: "Local Test",
    productCategory: "Drinks / Beverages",
    ingredientText:
      "Carbonated water, sugar, brominated vegetable oil, citric acid, citrus flavour",
    expected: {
      verdictTone: "red",
      minExposureRisk: 70,
      requiredVisibleCategoryIds: ["banned_restricted_items"],
      requiredMatchedItemText: ["brominated vegetable oil"],
    },
  },
  {
    id: "natural-flavour",
    productName: "Natural Flavour Water",
    brandName: "Local Test",
    productCategory: "Drinks / Beverages",
    ingredientText: "Water, natural flavour",
    expected: {
      requiredMatchedCategoryNames: [
        "Unknown / Review Ingredients",
        "Flavour Enhancers / Flavourings",
      ],
      forbiddenNaturalPositiveText: ["natural flavour"],
    },
  },
  {
    id: "fruit-flavour-false-fruit",
    productName: "Fruit Flavour Drink",
    brandName: "Local Test",
    productCategory: "Drinks / Beverages",
    ingredientText: "Water, sugar, fruit flavour, citric acid",
    expected: {
      forbiddenDeepCategoryIds: ["fry_oil_fast_food_oil"],
      forbiddenNaturalPositiveText: ["fruit flavour"],
      requiredMatchedCategoryNames: ["Flavour Enhancers / Flavourings"],
    },
  },
  {
    id: "eggplant-false-egg",
    productName: "Eggplant Relish",
    brandName: "Local Test",
    productCategory: "Fresh / Simple Foods",
    ingredientText: "Eggplant, tomato, olive oil, vinegar, salt",
    userAllergyProfile: ["egg"],
    expected: {
      forbiddenDeepCategoryIds: ["allergy_risk"],
      maxExposureRisk: 45,
    },
  },
  {
    id: "milk-thistle-false-milk",
    productName: "Milk Thistle Capsules",
    brandName: "Local Test",
    productCategory: "Supplements",
    ingredientText: "Milk thistle extract, cellulose capsule",
    userAllergyProfile: ["milk"],
    expected: {
      forbiddenDeepCategoryIds: ["allergy_risk"],
      maxExposureRisk: 45,
    },
  },
  {
    id: "nutritional-yeast-false-nut",
    productName: "Nutritional Yeast Seasoning",
    brandName: "Local Test",
    productCategory: "Seasonings",
    ingredientText: "Nutritional yeast, salt",
    userAllergyProfile: ["tree_nuts", "peanut"],
    expected: {
      forbiddenDeepCategoryIds: ["allergy_risk"],
      maxExposureRisk: 45,
    },
  },
  {
    id: "gluten-free-false-wheat",
    productName: "Gluten Free Corn Cakes",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText: "Corn, salt, gluten-free seasoning",
    userAllergyProfile: ["wheat"],
    expected: {
      forbiddenDeepCategoryIds: ["allergy_risk"],
      forbiddenMatchedItemText: ["Wheat"],
      maxExposureRisk: 45,
    },
  },
  {
    id: "peanut-free-false-peanut",
    productName: "Peanut Free Chocolate",
    brandName: "Local Test",
    productCategory: "Chocolate / Cocoa Products",
    ingredientText: "Sugar, cocoa mass, cocoa butter, soy lecithin, peanut-free claim",
    userAllergyProfile: ["peanut"],
    expected: {
      forbiddenDeepCategoryIds: ["allergy_risk"],
      maxExposureRisk: 55,
    },
  },
  {
    id: "milk-allergy-direct",
    productName: "Chocolate Milk",
    brandName: "Local Test",
    productCategory: "Dairy / Egg Products",
    ingredientText: "Milk, sugar, cocoa, carrageenan",
    userAllergyProfile: ["milk"],
    expected: {
      verdictTone: "red",
      headline: "Do not consume",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["allergy_risk"],
    },
  },
  {
    id: "milk-without-profile",
    productName: "Plain Yogurt",
    brandName: "Local Test",
    productCategory: "Dairy / Egg Products",
    ingredientText: "Milk, live cultures",
    expected: {
      forbiddenDeepCategoryIds: ["allergy_risk"],
      maxExposureRisk: 35,
    },
  },
  {
    id: "may-contain-milk-profile",
    productName: "Dark Chocolate May Contain Milk",
    brandName: "Local Test",
    productCategory: "Chocolate / Cocoa Products",
    ingredientText: "Cocoa mass, sugar, cocoa butter, soy lecithin",
    allergenStatement: "May contain milk and tree nuts.",
    userAllergyProfile: ["milk"],
    expected: {
      verdictTone: "red",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["allergy_risk"],
    },
  },
  {
    id: "soy-allergy-direct",
    productName: "Soy Protein Bar",
    brandName: "Local Test",
    productCategory: "Protein / Bars",
    ingredientText: "Soy protein isolate, chicory fiber, cocoa, natural flavour",
    userAllergyProfile: ["soy"],
    expected: {
      verdictTone: "red",
      headline: "Do not consume",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["allergy_risk"],
      requiredMatchedCategoryNames: ["Artificial / Engineered Food Construction"],
    },
  },
  {
    id: "baby-rice-puffs",
    productName: "Baby Rice Puffs",
    brandName: "Local Test",
    productCategory: "Baby / Kids Food",
    ingredientText: "Rice flour, brown rice syrup, apple juice concentrate",
    expected: {
      requiredDeepCategoryIds: ["heavy_metals"],
      maxExposureRisk: 65,
    },
  },
  {
    id: "infant-rice-cereal",
    productName: "Infant Rice Cereal",
    brandName: "Local Test",
    productCategory: "Baby / Kids Food",
    ingredientText: "Rice flour, calcium carbonate, iron, vitamin C",
    expected: {
      requiredDeepCategoryIds: ["heavy_metals"],
      maxExposureRisk: 65,
    },
  },
  {
    id: "dark-chocolate-bar",
    productName: "Dark Chocolate Bar",
    brandName: "Local Test",
    productCategory: "Chocolate / Cocoa Products",
    ingredientText: "Cocoa mass, sugar, cocoa butter, vanilla",
    expected: {
      requiredDeepCategoryIds: ["heavy_metals"],
      maxExposureRisk: 65,
    },
  },
  {
    id: "cinnamon-spice",
    productName: "Ground Cinnamon",
    brandName: "Local Test",
    productCategory: "Spices / Seasonings",
    ingredientText: "Ground cinnamon",
    expected: {
      requiredDeepCategoryIds: ["heavy_metals"],
      maxExposureRisk: 65,
    },
  },
  {
    id: "swordfish",
    productName: "Swordfish Steak",
    brandName: "Local Test",
    productCategory: "Seafood",
    ingredientText: "Swordfish",
    expected: {
      requiredDeepCategoryIds: ["heavy_metals"],
      maxExposureRisk: 65,
    },
  },
  {
    id: "tuna",
    productName: "Canned Tuna",
    brandName: "Local Test",
    productCategory: "Seafood",
    ingredientText: "Tuna, water, salt",
    expected: {
      requiredDeepCategoryIds: ["heavy_metals"],
      maxExposureRisk: 65,
    },
  },
  {
    id: "seaweed-snack",
    productName: "Seaweed Snack",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText: "Seaweed, rice bran oil, salt",
    expected: {
      requiredDeepCategoryIds: ["heavy_metals"],
      requiredVisibleCategoryIds: ["seed_oils_processed_oils"],
      maxExposureRisk: 70,
    },
  },
  {
    id: "chicken-sausage",
    productName: "Chicken Sausage",
    brandName: "Local Test",
    productCategory: "Meat / Fast Food",
    ingredientText:
      "Mechanically separated chicken, water, soy protein, salt, sodium phosphate, sodium nitrite, smoke flavour",
    expected: {
      verdictTone: "red",
      minExposureRisk: 50,
      requiredVisibleCategoryIds: ["meat_specific_concerns"],
      requiredDeepCategoryIds: ["meat_specific_concerns"],
      requiredMatchedCategoryNames: ["Meat-Specific Concerns"],
    },
  },
  {
    id: "deli-ham",
    productName: "Processed Deli Ham",
    brandName: "Local Test",
    productCategory: "Meat / Fast Food",
    ingredientText:
      "Pork, water, salt, sodium phosphate, sodium nitrite, carrageenan, natural smoke flavour",
    expected: {
      requiredVisibleCategoryIds: ["meat_specific_concerns"],
      requiredDeepCategoryIds: ["meat_specific_concerns"],
      minExposureRisk: 45,
    },
  },
  {
    id: "breaded-fish-fingers",
    productName: "Breaded Fish Fingers",
    brandName: "Local Test",
    productCategory: "Seafood",
    ingredientText:
      "Fish, wheat flour, vegetable oil, water, modified starch, salt, sodium phosphate, yeast extract",
    expected: {
      requiredVisibleCategoryIds: [
        "seed_oils_processed_oils",
        "fry_oil_fast_food_oil",
      ],
      requiredDeepCategoryIds: ["fry_oil_fast_food_oil"],
      minExposureRisk: 45,
    },
  },
  {
    id: "plant-burger",
    productName: "Plant Burger Patty",
    brandName: "Local Test",
    productCategory: "Plant-Based Meat",
    ingredientText:
      "Water, textured vegetable protein, canola oil, methylcellulose, soy leghemoglobin, natural flavour, caramel colour",
    expected: {
      requiredMatchedCategoryNames: [
        "Artificial / Engineered Food Construction",
        "Seed Oils / Processed Oils",
      ],
      minExposureRisk: 45,
    },
  },
  {
    id: "unknown-review-overload",
    productName: "Mystery Protein Bar",
    brandName: "Local Test",
    productCategory: "Protein / Bars",
    ingredientText:
      "Protein blend, proprietary blend, natural flavour, seasoning blend, vegetable oil, modified starch",
    expected: {
      verdictTone: "red",
      minExposureRisk: 50,
      requiredMatchedCategoryNames: ["Unknown / Review Ingredients"],
    },
  },
  {
    id: "ultra-processing-overload",
    productName: "Ultra Processed Cereal Bar",
    brandName: "Local Test",
    productCategory: "Breakfast Cereals",
    ingredientText:
      "Wheat flour, corn syrup solids, maltodextrin, modified starch, soy protein isolate, hydrolyzed vegetable protein, mono and diglycerides, artificial flavour",
    expected: {
      verdictTone: "red",
      minExposureRisk: 50,
      requiredVisibleCategoryIds: ["ultra_processed_indicators"],
    },
  },
  {
    id: "long-simple-formula",
    productName: "Long Ingredient Granola",
    brandName: "Local Test",
    productCategory: "Breakfast Cereals",
    ingredientText:
      "Oats, almonds, raisins, pumpkin seeds, sunflower seeds, coconut, honey, brown sugar, cinnamon, vanilla, sea salt, dates, cranberries, apple, quinoa",
    expected: {
      requiredVisibleCategoryIds: ["total_ingredients"],
      minExposureRisk: 40,
    },
    notes: "Checks whether a long mostly simple list is explained as ingredient-count pressure instead of ingredient danger.",
  },
  {
    id: "fortified-cereal",
    productName: "Fortified Wheat Cereal",
    brandName: "Local Test",
    productCategory: "Breakfast Cereals",
    ingredientText:
      "Whole grain wheat, sugar, salt, niacin, reduced iron, vitamin B6, riboflavin, thiamin, folic acid, vitamin D",
    expected: {
      maxIngredientLoad: 35,
      maxExposureRisk: 55,
    },
    notes: "Added vitamins/minerals should not behave like additive danger by themselves.",
  },
  {
    id: "sulphite-dried-fruit",
    productName: "Dried Apricots",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText: "Apricots, sulfur dioxide",
    expected: {
      requiredMatchedCategoryNames: ["Preservatives & Shelf-Life Systems"],
      requiredMatchedItemText: ["sulfur dioxide"],
    },
  },
  {
    id: "e-number-label",
    productName: "Imported Bright Drink",
    brandName: "Local Test",
    productCategory: "Drinks / Beverages",
    ingredientText: "Water, sugar, E211, E102, E129, E951, flavouring",
    expected: {
      verdictTone: "red",
      minExposureRisk: 50,
      requiredMatchedCategoryNames: [
        "Artificial Colours",
        "Artificial Sweeteners / Sugar Substitutes",
        "Preservatives & Shelf-Life Systems",
      ],
    },
  },
  {
    id: "phosphate-nuggets",
    productName: "Chicken Nuggets",
    brandName: "Local Test",
    productCategory: "Meat / Fast Food",
    ingredientText:
      "Chicken, wheat flour, water, sunflower oil, sodium phosphate, salt, seasoning, sodium acid pyrophosphate",
    expected: {
      requiredVisibleCategoryIds: [
        "meat_specific_concerns",
        "fry_oil_fast_food_oil",
      ],
      minExposureRisk: 40,
    },
  },
  {
    id: "egg-mayo-allergy",
    productName: "Mayonnaise",
    brandName: "Local Test",
    productCategory: "Sauces / Condiments",
    ingredientText:
      "Soybean oil, water, egg yolk, vinegar, sugar, salt, calcium disodium EDTA",
    userAllergyProfile: ["egg"],
    expected: {
      headline: "Do not consume",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["allergy_risk"],
    },
  },
  {
    id: "sesame-crackers-allergy",
    productName: "Sesame Crackers",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText: "Wheat flour, sesame seeds, sunflower oil, salt",
    userAllergyProfile: ["sesame"],
    expected: {
      headline: "Do not consume",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["allergy_risk"],
    },
  },
  {
    id: "active-recall-signal",
    productName: "Mock Recalled Peanut Snack",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText: "Peanuts, salt",
    externalSignals: [
      externalSafetySignal({
        id: "active-recall-peanut-snack",
        title: "Active official recall for Mock Recalled Peanut Snack",
        signalType: "active_recall",
        status: "active",
        severity: "red",
        reason: "Official recall for affected batch.",
        matchedBy: ["product_name", "brand_name"],
        matchConfidence: "high",
      }),
    ],
    expected: {
      headline: "Do not consume",
      verdictTone: "red",
      minExposureRisk: 90,
      brandTrustStatus: "red_warning",
      brandTrustSeverity: "red",
    },
  },
  {
    id: "historical-recall-signal",
    productName: "Mock Historical Cereal",
    brandName: "Local Test",
    productCategory: "Breakfast Cereals",
    ingredientText: "Corn, sugar, salt",
    externalSignals: [
      externalSafetySignal({
        id: "historical-recall-cereal",
        title: "Historical recall for Mock Historical Cereal",
        signalType: "historical_recall",
        status: "historical",
        severity: "yellow",
        reason: "Resolved historical recall.",
        matchConfidence: "high",
      }),
    ],
    expected: {
      brandTrustStatus: "yellow_review",
      brandTrustSeverity: "yellow",
      maxExposureRisk: 65,
    },
  },
  {
    id: "medium-active-recall-signal",
    productName: "Mock Possible Recall Sauce",
    brandName: "Local Test",
    productCategory: "Sauces / Condiments",
    ingredientText: "Tomato, water, salt",
    externalSignals: [
      externalSafetySignal({
        id: "medium-recall-sauce",
        title: "Possible active recall match for sauce family",
        signalType: "active_recall",
        status: "active",
        severity: "yellow",
        reason: "Medium-confidence product family match.",
        matchedBy: ["brand_name", "category_keyword"],
        matchConfidence: "medium",
      }),
    ],
    expected: {
      brandTrustStatus: "yellow_review",
      brandTrustSeverity: "yellow",
      maxExposureRisk: 75,
    },
  },
  {
    id: "heavy-metal-official-signal",
    productName: "Mock Lead Recall Applesauce",
    brandName: "Local Test",
    productCategory: "Baby / Kids Food",
    ingredientText: "Apple puree, cinnamon",
    externalSignals: [
      externalSafetySignal({
        id: "lead-applesauce-warning",
        title: "Official lead warning for applesauce pouch",
        signalType: "heavy_metal_warning",
        status: "active",
        severity: "red",
        reason: "Verified product-specific lead warning.",
        matchConfidence: "high",
      }),
    ],
    expected: {
      headline: "Do not consume",
      verdictTone: "red",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["heavy_metals"],
      brandTrustStatus: "red_warning",
      brandTrustSeverity: "red",
    },
  },
  {
    id: "microplastic-official-signal",
    productName: "Mock Plastic Fragment Water",
    brandName: "Local Test",
    productCategory: "Drinks / Beverages",
    ingredientText: "Water",
    externalSignals: [
      externalSafetySignal({
        id: "microplastic-water-warning",
        title: "Official microplastic detection warning",
        signalType: "other_safety_signal",
        status: "active",
        severity: "red",
        reason: "Verified product-specific microplastic detection warning.",
        matchConfidence: "high",
      }),
    ],
    expected: {
      headline: "Do not consume",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["microplastics"],
      brandTrustStatus: "red_warning",
      brandTrustSeverity: "red",
    },
  },
  {
    id: "fresh-fruit-cup",
    productName: "Fresh Fruit Cup",
    brandName: "Local Test",
    productCategory: "Fresh / Simple Foods",
    ingredientText: "Apple, banana, orange, grapes",
    expected: {
      verdictTone: "green",
      headline: "No major concerns",
      maxExposureRisk: 20,
      minIngredientLoad: 5,
      maxIngredientLoad: 10,
    },
  },
  {
    id: "peanut-butter-no-profile",
    productName: "Peanut Butter",
    brandName: "Local Test",
    productCategory: "Fresh / Simple Foods",
    ingredientText: "Roasted peanuts, salt",
    expected: {
      forbiddenDeepCategoryIds: ["allergy_risk"],
      maxExposureRisk: 35,
    },
  },
  {
    id: "peanut-butter-profile",
    productName: "Peanut Butter",
    brandName: "Local Test",
    productCategory: "Fresh / Simple Foods",
    ingredientText: "Roasted peanuts, salt",
    userAllergyProfile: ["peanut"],
    expected: {
      headline: "Do not consume",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["allergy_risk"],
    },
  },
  {
    id: "shrimp-profile",
    productName: "Cooked Shrimp",
    brandName: "Local Test",
    productCategory: "Seafood",
    ingredientText: "Shrimp, salt",
    userAllergyProfile: ["shellfish"],
    expected: {
      headline: "Do not consume",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["allergy_risk"],
    },
  },
  {
    id: "baked-not-fried-crackers",
    productName: "Baked Not Fried Crackers",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText: "Wheat flour, sunflower oil, salt, yeast",
    expected: {
      forbiddenDeepCategoryIds: ["fry_oil_fast_food_oil"],
      requiredVisibleCategoryIds: ["seed_oils_processed_oils"],
      maxExposureRisk: 65,
    },
  },
  {
    id: "simple-olive-oil",
    productName: "Extra Virgin Olive Oil",
    brandName: "Local Test",
    productCategory: "Fresh / Simple Foods",
    ingredientText: "Extra virgin olive oil",
    expected: {
      forbiddenDeepCategoryIds: ["fry_oil_fast_food_oil"],
      maxExposureRisk: 25,
    },
  },
  {
    id: "fried-in-olive-oil",
    productName: "Fried Potato Slices",
    brandName: "Local Test",
    productCategory: "Fast Food",
    ingredientText: "Potatoes, olive oil, salt",
    expected: {
      requiredVisibleCategoryIds: ["fry_oil_fast_food_oil"],
      maxExposureRisk: 65,
    },
    notes:
      "Olive oil should not be treated as a seed-oil concern, but frying context can still show a fry-oil processing marker.",
  },
  {
    id: "palm-oil-cookies",
    productName: "Palm Oil Cookies",
    brandName: "Local Test",
    productCategory: "Bakery / Desserts",
    ingredientText: "Wheat flour, sugar, palm oil, cocoa powder, salt",
    expected: {
      requiredVisibleCategoryIds: ["seed_oils_processed_oils"],
      minExposureRisk: 20,
    },
  },
  {
    id: "hydrogenated-not-partially",
    productName: "Fully Hydrogenated Shortening",
    brandName: "Local Test",
    productCategory: "Bakery / Desserts",
    ingredientText: "Fully hydrogenated palm oil",
    expected: {
      requiredMatchedCategoryNames: [
        "Hydrogenated / Partially Hydrogenated Oils",
      ],
      forbiddenDeepCategoryIds: ["banned_restricted_items"],
      maxExposureRisk: 70,
    },
  },
  {
    id: "generic-spices",
    productName: "Generic Seasoning Blend",
    brandName: "Local Test",
    productCategory: "Spices / Seasonings",
    ingredientText: "Spices, salt, natural flavour",
    expected: {
      requiredMatchedCategoryNames: ["Unknown / Review Ingredients"],
      maxExposureRisk: 75,
    },
  },
  {
    id: "named-spices",
    productName: "Named Spice Mix",
    brandName: "Local Test",
    productCategory: "Spices / Seasonings",
    ingredientText: "Black pepper, turmeric, cumin, coriander",
    expected: {
      forbiddenMatchedCategoryNames: ["Unknown / Review Ingredients"],
      maxExposureRisk: 45,
    },
  },
  {
    id: "vegetable-protein-unspecified",
    productName: "Vegetable Protein Patty",
    brandName: "Local Test",
    productCategory: "Plant-Based Meat",
    ingredientText: "Vegetable protein, water, canola oil, seasoning",
    expected: {
      requiredMatchedCategoryNames: [
        "Unknown / Review Ingredients",
        "Artificial / Engineered Food Construction",
      ],
      minExposureRisk: 25,
    },
  },
  {
    id: "hydrolyzed-wheat-protein-profile",
    productName: "Hydrolyzed Wheat Protein Snack",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText: "Corn, hydrolyzed wheat protein, sunflower oil, salt",
    userAllergyProfile: ["wheat"],
    expected: {
      headline: "Do not consume",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["allergy_risk"],
      requiredMatchedCategoryNames: ["Flavour Enhancers / Flavourings"],
    },
  },
  {
    id: "sulfite-dried-fruit-profile",
    productName: "Sulfited Dried Apricots",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText: "Apricots, sulphur dioxide",
    userAllergyProfile: ["sulphites"],
    expected: {
      requiredMatchedCategoryNames: ["Preservatives & Shelf-Life Systems"],
      requiredDeepCategoryIds: ["allergy_risk"],
      minExposureRisk: 90,
    },
  },
  {
    id: "carrageenan-chocolate-milk-no-meat",
    productName: "Chocolate Milk Drink",
    brandName: "Local Test",
    productCategory: "Dairy / Egg Products",
    ingredientText: "Milk, sugar, cocoa, carrageenan",
    expected: {
      forbiddenVisibleCategoryIds: ["meat_specific_concerns"],
      maxExposureRisk: 65,
    },
  },
  {
    id: "chicken-flavour-crisps-no-meat",
    productName: "Chicken Flavour Crisps",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText:
      "Potatoes, sunflower oil, chicken flavour, salt, monosodium glutamate",
    expected: {
      forbiddenVisibleCategoryIds: ["meat_specific_concerns"],
      requiredVisibleCategoryIds: ["seed_oils_processed_oils"],
      requiredDeepCategoryIds: ["fry_oil_fast_food_oil"],
    },
  },
  {
    id: "beef-flavour-no-meat",
    productName: "Beef Flavour Noodles",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText:
      "Wheat flour, palm oil, beef flavour, salt, monosodium glutamate, caramel colour",
    expected: {
      forbiddenVisibleCategoryIds: ["meat_specific_concerns"],
      requiredMatchedCategoryNames: ["Flavour Enhancers / Flavourings"],
    },
  },
  {
    id: "cured-bacon",
    productName: "Cured Bacon",
    brandName: "Local Test",
    productCategory: "Meat / Fast Food",
    ingredientText: "Pork, water, salt, sugar, sodium nitrite, sodium phosphate",
    expected: {
      requiredVisibleCategoryIds: ["meat_specific_concerns"],
      requiredDeepCategoryIds: ["meat_specific_concerns"],
      requiredMatchedCategoryNames: ["Preservatives & Shelf-Life Systems"],
      minExposureRisk: 45,
    },
  },
  {
    id: "cultivated-chicken",
    productName: "Cultivated Chicken Bites",
    brandName: "Local Test",
    productCategory: "Plant-Based Meat",
    ingredientText:
      "Cultivated chicken cells, wheat protein, methylcellulose, natural flavour",
    expected: {
      requiredMatchedCategoryNames: [
        "Meat-Specific Concerns",
        "Artificial / Engineered Food Construction",
      ],
      minExposureRisk: 45,
    },
  },
  {
    id: "bioengineered-corn-chips",
    productName: "Bioengineered Corn Chips",
    brandName: "Local Test",
    productCategory: "Processed Snacks",
    ingredientText: "Bioengineered corn, sunflower oil, salt",
    expected: {
      requiredMatchedCategoryNames: [
        "Artificial / Engineered Food Construction",
        "Seed Oils / Processed Oils",
      ],
      maxExposureRisk: 75,
    },
  },
  {
    id: "no-added-hormones-claim",
    productName: "No Hormones Beef",
    brandName: "Local Test",
    productCategory: "Meat / Fast Food",
    ingredientText: "Beef",
    packagingText: "No added hormones, raised without antibiotics",
    expected: {
      requiredVisibleCategoryIds: ["meat_specific_concerns"],
      maxExposureRisk: 45,
    },
    notes:
      "Animal-raising claims should be informational/review context, not proof of health or safety.",
  },
  {
    id: "protein-blend-unspecified",
    productName: "Protein Shake Powder",
    brandName: "Local Test",
    productCategory: "Protein / Bars",
    ingredientText:
      "Protein blend, cocoa powder, natural flavour, sucralose, acesulfame potassium",
    expected: {
      requiredMatchedCategoryNames: [
        "Unknown / Review Ingredients",
        "Artificial Sweeteners / Sugar Substitutes",
      ],
      minExposureRisk: 30,
    },
  },
  {
    id: "allergen-free-claim-does-not-clear",
    productName: "Dairy Free Creamer With Casein",
    brandName: "Local Test",
    productCategory: "Dairy / Egg Products",
    ingredientText: "Coconut oil, sodium caseinate, sugar, flavouring",
    userAllergyProfile: ["milk"],
    expected: {
      headline: "Do not consume",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["allergy_risk"],
    },
    notes:
      "Free-from style product naming must not override a direct allergen ingredient.",
  },
  {
    id: "ocr-like-line-breaks",
    productName: "OCR Text Sauce",
    brandName: "Local Test",
    productCategory: "Sauces / Condiments",
    ingredientText:
      "INGREDIENTS:\nWater,\nTomato paste , Sugar , Salt,\nSodium Benzoate .\nContains: Milk",
    userAllergyProfile: ["milk"],
    scanSource: "ocr",
    expected: {
      headline: "Do not consume",
      minExposureRisk: 90,
      requiredDeepCategoryIds: ["allergy_risk"],
    },
    notes: "This bypasses OCR extraction but checks that OCR-like text still reaches parser/allergy logic.",
  },
];

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function lower(value: string) {
  return value.toLowerCase();
}

function getVisibleCategoryIds(result: ScanResult) {
  return uniqueSorted([
    ...result.quickOverview.map((row) => row.categoryId),
    ...result.deepExposureChecks.map((row) => row.categoryId),
  ]);
}

function getDeepCategoryIds(result: ScanResult) {
  return uniqueSorted(result.deepExposureChecks.map((row) => row.categoryId));
}

function getMatchedCategoryNames(result: ScanResult) {
  return uniqueSorted(
    [
      ...result.ingredientBreakdown.naturalPositive,
      ...result.ingredientBreakdown.processedArtificial,
      ...result.ingredientBreakdown.unknownReview,
      ...result.ingredientBreakdown.unmatchedIngredients,
    ].flatMap((item) => item.matchedCategories),
  );
}

function getMatchedText(result: ScanResult) {
  const breakdownText = [
    ...result.ingredientBreakdown.naturalPositive,
    ...result.ingredientBreakdown.processedArtificial,
    ...result.ingredientBreakdown.unknownReview,
    ...result.ingredientBreakdown.unmatchedIngredients,
  ].flatMap((item) => [
    item.originalText,
    item.displayName,
    item.canonicalIngredientId,
    item.userFacingReason,
  ]);

  const exposureText = result.deepExposureChecks.flatMap((row) => [
    row.label,
    row.title,
    row.message,
    row.shortMessage,
    row.reason,
    ...row.matchedItemsPreview,
    ...row.matchedItemDetails.flatMap((item) => [
      item.displayName,
      item.canonicalIngredientId,
      item.userFacingReason,
      ...item.restrictionRegions,
      ...item.restrictionReasons,
    ]),
  ]);

  return uniqueSorted([...breakdownText, ...exposureText]);
}

function getIngredientGroupText(
  result: ScanResult,
  group:
    | "naturalPositive"
    | "processedArtificial"
    | "unknownReview"
    | "unmatchedIngredients",
) {
  return uniqueSorted(
    result.ingredientBreakdown[group].flatMap((item) => [
      item.originalText,
      item.displayName,
      item.canonicalIngredientId,
      item.userFacingReason,
      ...item.matchedCategories,
    ]),
  );
}

function includesCaseInsensitive(values: string[], expected: string) {
  const needle = lower(expected);
  return values.some((value) => lower(value).includes(needle));
}

function assertIncludes(
  issues: string[],
  values: string[],
  expected: string,
  label: string,
) {
  if (!values.includes(expected)) {
    issues.push(`${label} missing: ${expected}`);
  }
}

function assertNotIncludes(
  issues: string[],
  values: string[],
  forbidden: string,
  label: string,
) {
  if (values.includes(forbidden)) {
    issues.push(`${label} should not appear: ${forbidden}`);
  }
}

function assertTextIncludes(
  issues: string[],
  values: string[],
  expected: string,
  label: string,
) {
  if (!includesCaseInsensitive(values, expected)) {
    issues.push(`${label} missing text: ${expected}`);
  }
}

function assertTextExcludes(
  issues: string[],
  values: string[],
  forbidden: string,
  label: string,
) {
  if (includesCaseInsensitive(values, forbidden)) {
    issues.push(`${label} should not contain text: ${forbidden}`);
  }
}

function evaluate(product: StressProduct): ProductRun {
  const issues: string[] = [];
  const warnings: string[] = [];

  try {
    const result = runManualScan({
      productName: product.productName,
      brandName: product.brandName,
      barcode: product.barcode,
      productCategory: product.productCategory,
      ingredientText: product.ingredientText,
      allergenStatement: product.allergenStatement,
      packagingText: product.packagingText,
      userAllergyProfile: product.userAllergyProfile,
      externalSignals: product.externalSignals,
      scanSource: product.scanSource,
    });

    const expected = product.expected;
    const visibleCategoryIds = getVisibleCategoryIds(result);
    const deepCategoryIds = getDeepCategoryIds(result);
    const matchedCategoryNames = getMatchedCategoryNames(result);
    const matchedText = getMatchedText(result);

    if (
      expected.verdictTone &&
      result.finalVerdict.verdictTone !== expected.verdictTone
    ) {
      issues.push(
        `verdict tone expected ${expected.verdictTone}, got ${result.finalVerdict.verdictTone}`,
      );
    }

    if (expected.headline && result.finalVerdict.headline !== expected.headline) {
      issues.push(
        `headline expected "${expected.headline}", got "${result.finalVerdict.headline}"`,
      );
    }

    if (
      expected.minExposureRisk !== undefined &&
      result.productHero.exposureRisk < expected.minExposureRisk
    ) {
      issues.push(
        `exposureRisk expected >= ${expected.minExposureRisk}, got ${result.productHero.exposureRisk}`,
      );
    }

    if (
      expected.maxExposureRisk !== undefined &&
      result.productHero.exposureRisk > expected.maxExposureRisk
    ) {
      issues.push(
        `exposureRisk expected <= ${expected.maxExposureRisk}, got ${result.productHero.exposureRisk}`,
      );
    }

    if (
      expected.minIngredientLoad !== undefined &&
      result.ingredientLoad.score < expected.minIngredientLoad
    ) {
      issues.push(
        `ingredientLoad expected >= ${expected.minIngredientLoad}, got ${result.ingredientLoad.score}`,
      );
    }

    if (
      expected.maxIngredientLoad !== undefined &&
      result.ingredientLoad.score > expected.maxIngredientLoad
    ) {
      issues.push(
        `ingredientLoad expected <= ${expected.maxIngredientLoad}, got ${result.ingredientLoad.score}`,
      );
    }

    expected.requiredVisibleCategoryIds?.forEach((categoryId) =>
      assertIncludes(issues, visibleCategoryIds, categoryId, "visible category"),
    );

    expected.forbiddenVisibleCategoryIds?.forEach((categoryId) =>
      assertNotIncludes(
        issues,
        visibleCategoryIds,
        categoryId,
        "visible category",
      ),
    );

    expected.requiredDeepCategoryIds?.forEach((categoryId) =>
      assertIncludes(issues, deepCategoryIds, categoryId, "deep category"),
    );

    expected.forbiddenDeepCategoryIds?.forEach((categoryId) =>
      assertNotIncludes(issues, deepCategoryIds, categoryId, "deep category"),
    );

    expected.requiredMatchedCategoryNames?.forEach((categoryName) =>
      assertIncludes(
        issues,
        matchedCategoryNames,
        categoryName,
        "matched ingredient category",
      ),
    );

    expected.forbiddenMatchedCategoryNames?.forEach((categoryName) =>
      assertNotIncludes(
        issues,
        matchedCategoryNames,
        categoryName,
        "matched ingredient category",
      ),
    );

    expected.requiredMatchedItemText?.forEach((text) =>
      assertTextIncludes(issues, matchedText, text, "matched item/detail"),
    );

    expected.forbiddenMatchedItemText?.forEach((text) =>
      assertTextExcludes(issues, matchedText, text, "matched item/detail"),
    );

    const naturalPositiveText = getIngredientGroupText(result, "naturalPositive");
    const processedArtificialText = getIngredientGroupText(
      result,
      "processedArtificial",
    );
    const unknownReviewText = getIngredientGroupText(result, "unknownReview");

    expected.requiredNaturalPositiveText?.forEach((text) =>
      assertTextIncludes(issues, naturalPositiveText, text, "natural/simple group"),
    );

    expected.forbiddenNaturalPositiveText?.forEach((text) =>
      assertTextExcludes(issues, naturalPositiveText, text, "natural/simple group"),
    );

    expected.requiredProcessedArtificialText?.forEach((text) =>
      assertTextIncludes(
        issues,
        processedArtificialText,
        text,
        "processed/artificial group",
      ),
    );

    expected.forbiddenProcessedArtificialText?.forEach((text) =>
      assertTextExcludes(
        issues,
        processedArtificialText,
        text,
        "processed/artificial group",
      ),
    );

    expected.requiredUnknownReviewText?.forEach((text) =>
      assertTextIncludes(issues, unknownReviewText, text, "unknown/review group"),
    );

    expected.forbiddenUnknownReviewText?.forEach((text) =>
      assertTextExcludes(issues, unknownReviewText, text, "unknown/review group"),
    );

    if (
      expected.brandTrustStatus &&
      result.brandTrustSafety.status !== expected.brandTrustStatus
    ) {
      issues.push(
        `brandTrust status expected ${expected.brandTrustStatus}, got ${result.brandTrustSafety.status}`,
      );
    }

    if (
      expected.brandTrustSeverity !== undefined &&
      result.brandTrustSafety.severity !== expected.brandTrustSeverity
    ) {
      issues.push(
        `brandTrust severity expected ${expected.brandTrustSeverity}, got ${result.brandTrustSafety.severity}`,
      );
    }

    if (
      result.finalVerdict.verdictTone === "green" &&
      result.deepExposureChecks.some((row) => row.severity === "red")
    ) {
      issues.push("green final verdict with red deep exposure check");
    }

    if (
      result.finalVerdict.verdictTone === "green" &&
      result.quickOverview.some((row) => row.severity === "red")
    ) {
      issues.push("green final verdict with red quick overview row");
    }

    if (
      result.finalVerdict.headline === "Do not consume" &&
      result.productHero.exposureRisk < 90
    ) {
      issues.push("Do not consume verdict scored below 90");
    }

    if (product.notes) {
      warnings.push(product.notes);
    }

    return { product, result, issues, warnings };
  } catch (error) {
    return {
      product,
      issues: ["scan crashed"],
      warnings,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function formatCategoryRows(result: ScanResult) {
  const rows = result.deepExposureChecks
    .filter((row) => row.severity === "red" || row.severity === "yellow")
    .map(
      (row) =>
        `${row.label}: ${row.severity ?? "not_checked"} (${row.displayValue}, count ${row.matchCount})`,
    );

  return rows.length > 0 ? rows.join("; ") : "No yellow/red deep checks";
}

function formatOverviewRows(result: ScanResult) {
  return result.quickOverview
    .map(
      (row) =>
        `${row.label}: ${row.severity} (${row.displayValue}, count ${row.matchCount})`,
    )
    .join("; ");
}

function buildReport(runs: ProductRun[]) {
  const failed = runs.filter((run) => run.issues.length > 0);
  const crashed = runs.filter((run) => run.error);
  const red = runs.filter((run) => run.result?.finalVerdict.verdictTone === "red");
  const yellow = runs.filter(
    (run) => run.result?.finalVerdict.verdictTone === "yellow",
  );
  const green = runs.filter(
    (run) => run.result?.finalVerdict.verdictTone === "green",
  );

  const lines: string[] = [
    "# Truthlabel Product Stress Test Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Products tested: ${runs.length}`,
    `- Passed expectation checks: ${runs.length - failed.length}`,
    `- Failed expectation checks: ${failed.length}`,
    `- Crashed scans: ${crashed.length}`,
    `- Red final verdicts: ${red.length}`,
    `- Yellow final verdicts: ${yellow.length}`,
    `- Green final verdicts: ${green.length}`,
    "",
    "## Failed or suspicious cases",
    "",
  ];

  if (failed.length === 0) {
    lines.push("No expectation failures found in this stress pass.", "");
  } else {
    failed.forEach((run) => {
      lines.push(`### ${run.product.productName} (${run.product.id})`, "");
      lines.push(`- Category: ${run.product.productCategory}`);
      lines.push(`- Ingredients: ${run.product.ingredientText}`);
      if (run.error) {
        lines.push(`- Error: ${run.error}`);
      }
      lines.push(`- Issues: ${run.issues.join("; ")}`);
      if (run.result) {
        lines.push(
          `- Result: ${run.result.finalVerdict.headline}, ${run.result.productHero.exposureRisk}/100, ingredient load ${run.result.ingredientLoad.score}/100`,
        );
        lines.push(`- Deep checks: ${formatCategoryRows(run.result)}`);
      }
      lines.push("");
    });
  }

  lines.push("## Full product run", "");

  runs.forEach((run) => {
    lines.push(`### ${run.product.productName} (${run.product.id})`, "");
    lines.push(`- Category: ${run.product.productCategory}`);
    if (run.product.userAllergyProfile?.length) {
      lines.push(`- Allergy profile: ${run.product.userAllergyProfile.join(", ")}`);
    }
    lines.push(`- Ingredients: ${run.product.ingredientText}`);
    if (run.product.allergenStatement) {
      lines.push(`- Allergen statement: ${run.product.allergenStatement}`);
    }
    if (run.product.packagingText) {
      lines.push(`- Packaging text: ${run.product.packagingText}`);
    }
    if (run.error) {
      lines.push(`- Status: FAILED TO SCAN`);
      lines.push(`- Error: ${run.error}`);
    } else if (run.result) {
      lines.push(
        `- Final: ${run.result.finalVerdict.headline} (${run.result.finalVerdict.verdictTone}), ${run.result.productHero.exposureRisk}/100`,
      );
      lines.push(
        `- Ingredient load: ${run.result.ingredientLoad.level}, ${run.result.ingredientLoad.score}/100, raw ${run.result.ingredientLoad.rawLoad}`,
      );
      lines.push(`- Quick overview: ${formatOverviewRows(run.result)}`);
      lines.push(`- Deep checks: ${formatCategoryRows(run.result)}`);
      lines.push(
        `- Natural/simple count: ${run.result.ingredientBreakdown.naturalPositive.length}`,
      );
      lines.push(
        `- Processed/artificial count: ${run.result.ingredientBreakdown.processedArtificial.length}`,
      );
      lines.push(
        `- Unknown/review count: ${run.result.ingredientBreakdown.unknownReview.length}`,
      );
    }
    lines.push(`- Expectation result: ${run.issues.length ? "FAILED" : "PASSED"}`);
    if (run.issues.length) {
      lines.push(`- Issues: ${run.issues.join("; ")}`);
    }
    if (run.warnings.length) {
      lines.push(`- Notes: ${run.warnings.join("; ")}`);
    }
    lines.push("");
  });

  lines.push("## Notes", "");
  lines.push(
    "- This is a local engine stress test. It does not use the deployed Vercel site.",
  );
  lines.push(
    "- Product labels are synthetic but realistic, designed to exercise matcher and scoring edge cases.",
  );
  lines.push(
    "- Camera behavior, mobile permissions, and live OCR quality still require real-device testing.",
  );
  lines.push(
    "- External safety signals in this report are mocked to verify rule handling without calling live recall APIs.",
  );
  lines.push(
    "- A failed expectation is not always a product bug; some are deliberately strict checks to reveal missing data-pack coverage.",
  );
  lines.push("");

  return lines.join("\n");
}

const runs = products.map(evaluate);
const report = buildReport(runs);
mkdirSync(path.dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");

const failures = runs.filter((run) => run.issues.length > 0);

console.log(`Truthlabel product stress test complete.`);
console.log(`Products tested: ${runs.length}`);
console.log(`Passed: ${runs.length - failures.length}`);
console.log(`Failed/suspicious: ${failures.length}`);
console.log(`Report: ${reportPath}`);

if (failures.length > 0) {
  console.log("");
  console.log("Failed/suspicious cases:");
  failures.forEach((run) => {
    console.log(`- ${run.product.id}: ${run.issues.join("; ")}`);
  });
  process.exitCode = 1;
}
