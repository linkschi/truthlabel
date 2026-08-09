import type { ExternalSafetySignal } from "@/lib/externalSafety/externalSafetyTypes";

import { usMeatBatch01Records } from "./usMeatBatch01";
import { usMeatBatch02Records } from "./usMeatBatch02";
import { usMeatBatch03Records } from "./usMeatBatch03";
import { usMeatBatch04Records } from "./usMeatBatch04";
import { usMeatBatch05Records } from "./usMeatBatch05";
import { usMeatBatch07Records } from "./usMeatBatch07";
import { usMeatBatch08Records } from "./usMeatBatch08";
import { usMeatBatch09Records } from "./usMeatBatch09";
import { usMeatBatch10Records } from "./usMeatBatch10";
import { usMeatBatch11Records } from "./usMeatBatch11";
import { usMeatBatch12Records } from "./usMeatBatch12";
import { usMeatBatch13Records } from "./usMeatBatch13";
import { usMeatBatch14Records } from "./usMeatBatch14";
import { usMeatBatch15Records } from "./usMeatBatch15";
import { usMeatBatch16Records } from "./usMeatBatch16";
import { usMeatBatch17Records } from "./usMeatBatch17";
import { usMeatBatch18Records } from "./usMeatBatch18";
import { usMeatBatch19Records } from "./usMeatBatch19";
import { usMeatBatch20Records } from "./usMeatBatch20";
import { usMeatBatch21Records } from "./usMeatBatch21";
import { usMeatBatch22Records } from "./usMeatBatch22";

export type MeatResearchMarkerValue =
  | "yes"
  | "no"
  | "hidden"
  | "not_listed"
  | "context_only";

export type ProductResearchClaimDetail = {
  claim: string;
  madeBy?: string;
  verificationStatus?: string;
  sourceUrl?: string;
};

export type ProductResearchReviewNote = {
  scope: string;
  note: string;
  evidenceLevel?: string;
  sourceUrl?: string;
};

export type UsMeatResearchRecord = {
  id: string;
  productName: string;
  productNameAliases: string[];
  brandName: string;
  retailer?: string;
  barcodes: string[];
  barcodeStatus?: string;
  categoryPath: string[];
  productUrl?: string;
  mainImageUrl?: string;
  countryOfOrigin?: string;
  countryOfOriginStatus?: string;
  storageState?: string;
  manufacturerOrDistributor?: string;
  ingredients: string[];
  exactIngredientText?: string;
  ingredientDisclosure: "available" | "not_exposed" | "inconsistent";
  ingredientInvestigationStatus?: string;
  packageClaims: string[];
  claimDetails?: ProductResearchClaimDetail[];
  productSpecificChecks?: Record<string, string>;
  markerFacts: Partial<Record<
    | "grassFed"
    | "organic"
    | "antibiotics"
    | "growthHormones"
    | "addedWater"
    | "phosphates"
    | "mechanicallySeparated"
    | "finelyTexturedBeef"
    | "celeryPowder"
    | "sodiumNitrite"
    | "bha"
    | "propylGallate"
    | "msg"
    | "highSodium"
    | "retainedWater"
    | "addedColor",
    MeatResearchMarkerValue
  >>;
  reviewNotes: string[];
  structuredReviewNotes?: ProductResearchReviewNote[];
  localWarnings: string[];
  externalSignals: ExternalSafetySignal[];
};

function historicalSignal(args: {
  id: string;
  sourceProvider: ExternalSafetySignal["sourceProvider"];
  sourceName: string;
  title: string;
  productName: string;
  brandName: string;
  reason: string;
  affectedDates?: string[];
  matchedBy: ExternalSafetySignal["matchedBy"];
}): ExternalSafetySignal {
  return {
    id: args.id,
    sourceProvider: args.sourceProvider,
    sourceName: args.sourceName,
    region: "United States",
    signalType: "historical_recall",
    status: "historical",
    severity: "yellow",
    title: args.title,
    productName: args.productName,
    brandName: args.brandName,
    reason: args.reason,
    affectedDates: args.affectedDates,
    matchedBy: args.matchedBy,
    matchConfidence: "high",
    userFacingMessage:
      "A resolved historical recall was found for this exact product or product family. Check the current package and lot if you need batch-level certainty.",
  };
}

const meatDataWarning =
  "Truthlabel used local US meat research for this product. Product formulas and claims can change, so verify the current package label.";

const legacyUsMeatProductResearchRecords = [
  {
    id: "walmart_all_natural_73_27_ground_beef_1_lb_tray",
    productName: "Walmart All Natural 73% Lean / 27% Fat Ground Beef - 1 lb Tray",
    productNameAliases: [
      "Walmart All Natural 73% Lean 27% Fat Ground Beef",
      "All Natural 73% Lean 27% Fat Ground Beef 1 lb Tray",
    ],
    brandName: "Walmart",
    retailer: "Walmart",
    barcodes: [],
    categoryPath: ["Meat", "Beef", "Ground beef"],
    ingredients: [],
    ingredientDisclosure: "not_exposed",
    packageClaims: [
      "All natural",
      "Minimally processed",
      "No artificial ingredients",
    ],
    markerFacts: {
      grassFed: "hidden",
      organic: "hidden",
      antibiotics: "hidden",
      growthHormones: "hidden",
      addedWater: "hidden",
      phosphates: "hidden",
      finelyTexturedBeef: "hidden",
    },
    reviewNotes: [
      "Natural does not establish grass-fed, organic, antibiotic-free, or hormone-free production.",
      "Ingredient and additive status were not exposed in the accessible retailer listing.",
      "General red-meat research applies at the product-type level.",
    ],
    localWarnings: [
      meatDataWarning,
      "Ingredient text was not exposed in the researched retailer listing.",
    ],
    externalSignals: [],
  },
  {
    id: "great_value_all_natural_chicken_breasts_5_lb_frozen",
    productName: "Great Value All Natural Boneless Skinless Chicken Breasts - 5 lb Frozen",
    productNameAliases: [
      "Great Value All Natural Boneless Skinless Chicken Breasts",
      "Great Value Frozen Boneless Skinless Chicken Breasts",
    ],
    brandName: "Great Value",
    retailer: "Walmart",
    barcodes: [],
    categoryPath: ["Meat", "Chicken", "Chicken breast"],
    ingredients: [],
    ingredientDisclosure: "not_exposed",
    packageClaims: [
      "All natural",
      "Ice-glazed",
      "Individually frozen",
      "Raised with no added hormones",
    ],
    markerFacts: {
      organic: "hidden",
      antibiotics: "hidden",
      growthHormones: "context_only",
      retainedWater: "hidden",
    },
    reviewNotes: [
      "The accessible retailer page did not expose the ingredient statement.",
      "No added hormones on poultry needs context because federal rules do not permit hormone use in poultry.",
      "No antibiotic, free-range, or organic claim was found in this listing.",
    ],
    localWarnings: [
      meatDataWarning,
      "Primary retailer ingredient list was not accessible; do not assume plain chicken only.",
    ],
    externalSignals: [],
  },
  {
    id: "marketside_uncured_thick_cut_bacon_12_oz",
    productName: "Marketside Uncured Thick Cut Bacon - 12 oz",
    productNameAliases: ["Marketside Uncured Thick Cut Bacon"],
    brandName: "Marketside",
    retailer: "Walmart",
    barcodes: [],
    categoryPath: ["Meat", "Pork", "Bacon"],
    ingredients: [
      "Pork",
      "Water",
      "Turbinado sugar",
      "Sea salt",
      "Celery powder",
      "Cherry powder",
    ],
    ingredientDisclosure: "available",
    packageClaims: ["Uncured", "Nitrate free", "Gluten free"],
    markerFacts: {
      addedWater: "yes",
      celeryPowder: "yes",
      phosphates: "not_listed",
    },
    reviewNotes: [
      "Uncured and nitrate-free claims can be misunderstood when celery powder is present.",
      "Bacon falls under processed-meat research.",
      "Secondary retailer data listed sodium at about 13% DV per serving.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "great_value_fully_cooked_original_pork_sausage_patties_35_6_oz",
    productName:
      "Great Value Fully Cooked Original Pork Sausage Patties - Family Size 35.6 oz",
    productNameAliases: [
      "Great Value Fully Cooked Original Pork Sausage Patties",
      "Great Value Original Pork Sausage Patties 35.6 oz",
    ],
    brandName: "Great Value",
    retailer: "Walmart",
    barcodes: ["078742030623"],
    categoryPath: ["Meat", "Pork", "Breakfast sausage"],
    ingredients: [
      "Pork",
      "Water",
      "Salt",
      "Corn syrup solids",
      "Spices",
      "Dextrose",
      "Sugar",
      "Natural flavor",
      "Propyl gallate",
      "BHA",
      "Citric acid",
    ],
    ingredientDisclosure: "available",
    packageClaims: ["Fully cooked", "Original pork sausage patties"],
    markerFacts: {
      addedWater: "yes",
      bha: "yes",
      propylGallate: "yes",
      phosphates: "not_listed",
    },
    reviewNotes: [
      "Contains BHA and propyl gallate as antioxidant/preservative ingredients.",
      "Sausage falls within processed-meat research.",
      "A 2019 recall applied only to specific lots and dates.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [
      historicalSignal({
        id: "usda_fsis_2019_great_value_pork_sausage_salmonella",
        sourceProvider: "usda_fsis",
        sourceName: "USDA FSIS historical recall",
        title: "Historical Salmonella recall for specific Great Value sausage lots",
        productName:
          "Great Value Fully Cooked Original Pork Sausage Patties - Family Size 35.6 oz",
        brandName: "Great Value",
        reason:
          "Specific 35.6 oz Great Value Fully Cooked Original Pork Sausage Patties lots were recalled in October 2019 over possible Salmonella contamination. This is historical and lot-specific, not a current recall.",
        affectedDates: ["2019-10"],
        matchedBy: ["barcode", "product_name"],
      }),
    ],
  },
  {
    id: "walmart_73_27_ground_beef_1_lb_roll",
    productName: "Walmart 73% Lean / 27% Fat Ground Beef - 1 lb Roll",
    productNameAliases: [
      "Walmart 73% Lean 27% Fat Ground Beef Roll",
      "73% Lean 27% Fat Ground Beef 1 lb Roll",
    ],
    brandName: "Walmart",
    retailer: "Walmart",
    barcodes: [],
    categoryPath: ["Meat", "Beef", "Ground beef"],
    ingredients: [],
    ingredientDisclosure: "not_exposed",
    packageClaims: [
      "All natural",
      "Minimally processed",
      "No artificial ingredients",
    ],
    markerFacts: {
      grassFed: "hidden",
      organic: "hidden",
      antibiotics: "hidden",
      growthHormones: "hidden",
      addedWater: "hidden",
      phosphates: "hidden",
    },
    reviewNotes: [
      "Missing ingredient disclosure remains hidden.",
      "Natural alone does not establish animal-raising claims.",
      "Red-meat research is applicable at the category level.",
    ],
    localWarnings: [
      meatDataWarning,
      "Ingredient text was not exposed in the researched retailer listing.",
    ],
    externalSignals: [],
  },
  {
    id: "heb_100_pure_lean_ground_beef_93",
    productName: "H-E-B 100% Pure Lean Ground Beef - 93% Lean",
    productNameAliases: ["H-E-B 100% Pure Lean Ground Beef", "HEB 93% Lean Ground Beef"],
    brandName: "H-E-B",
    retailer: "H-E-B",
    barcodes: [],
    categoryPath: ["Meat", "Beef", "Ground beef"],
    ingredients: ["Beef"],
    ingredientDisclosure: "available",
    packageClaims: ["100% pure", "No additives", "No preservatives"],
    markerFacts: {
      addedWater: "no",
      phosphates: "no",
      grassFed: "hidden",
      organic: "hidden",
      antibiotics: "hidden",
      growthHormones: "hidden",
    },
    reviewNotes: [
      "No grass-fed, organic, antibiotic, or hormone production claim was disclosed on the page.",
      "Red-meat research applies generally.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "heb_natural_boneless_chicken_breasts",
    productName: "H-E-B Natural Boneless Chicken Breasts",
    productNameAliases: ["HEB Natural Boneless Chicken Breasts"],
    brandName: "H-E-B",
    retailer: "H-E-B",
    barcodes: [],
    categoryPath: ["Meat", "Chicken", "Chicken breast"],
    ingredients: ["Boneless skinless chicken breast"],
    ingredientDisclosure: "available",
    packageClaims: [
      "No antibiotics ever",
      "Vegetarian fed",
      "No added hormones",
      "Minimally processed",
      "No artificial ingredients",
      "Texas farm sourced",
    ],
    markerFacts: {
      antibiotics: "no",
      growthHormones: "context_only",
      addedWater: "no",
      phosphates: "no",
    },
    reviewNotes: [
      "No antibiotics ever is a meaningful animal-raising claim and should stay separate from composition.",
      "No added hormones is federal-baseline context for poultry.",
      "Animal-raising claims should keep claim evidence attached.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "heb_original_bacon_48_oz",
    productName: "H-E-B Original Bacon - 48 oz",
    productNameAliases: ["HEB Original Bacon 48 oz"],
    brandName: "H-E-B",
    retailer: "H-E-B",
    barcodes: [],
    categoryPath: ["Meat", "Pork", "Bacon"],
    ingredients: [
      "Pork",
      "Water",
      "Salt",
      "Sugar",
      "Sodium phosphates",
      "Sodium erythorbate",
      "Sodium nitrite",
    ],
    ingredientDisclosure: "available",
    packageClaims: ["No added MSG"],
    markerFacts: {
      addedWater: "yes",
      phosphates: "yes",
      sodiumNitrite: "yes",
    },
    reviewNotes: [
      "Conventional cure contains sodium nitrite and sodium phosphate.",
      "Bacon is processed meat in IARC's research framework.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "heb_made_in_texas_turkey_smoked_sausage_13_oz",
    productName: "H-E-B Made In Texas Turkey Smoked Sausage - 13 oz",
    productNameAliases: ["HEB Made In Texas Turkey Smoked Sausage"],
    brandName: "H-E-B",
    retailer: "H-E-B",
    barcodes: [],
    categoryPath: ["Meat", "Turkey", "Smoked sausage"],
    ingredients: [
      "Turkey",
      "Mechanically separated turkey",
      "Water",
      "Corn syrup",
      "Sea salt",
      "Oat fiber",
      "Seasoning",
      "Modified corn starch",
      "Dextrose",
      "Sodium phosphate",
      "Yeast extract",
      "Cultured celery powder",
      "Cultured cherry powder",
    ],
    ingredientDisclosure: "available",
    packageClaims: ["Made in Texas"],
    markerFacts: {
      mechanicallySeparated: "yes",
      addedWater: "yes",
      phosphates: "yes",
      celeryPowder: "yes",
    },
    reviewNotes: [
      "Mechanically separated poultry is an important processing disclosure.",
      "Made in Texas is a manufacturing/location claim and should not automatically become animal country-of-origin.",
      "A related producer recall existed for a different H-E-B smoked sausage; store only as producer/product-line context.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "heb_mi_tienda_parrillera_smoked_sausage_black_pepper_paprika",
    productName: "H-E-B Mi Tienda Parrillera Smoked Sausage - Black Pepper & Paprika",
    productNameAliases: [
      "HEB Mi Tienda Parrillera Smoked Sausage Black Pepper Paprika",
      "Mi Tienda Parrillera Smoked Sausage Black Pepper Paprika",
    ],
    brandName: "H-E-B Mi Tienda",
    retailer: "H-E-B",
    barcodes: [],
    categoryPath: ["Meat", "Mixed sausage", "Chicken pork beef"],
    ingredients: [
      "Mechanically separated chicken",
      "Pork",
      "Beef",
      "Water",
      "Sugar",
      "Paprika",
      "Chile pepper",
      "Yeast extract",
      "Garlic",
      "Maltodextrin",
      "Molasses solids",
      "Canola oil",
      "Worcestershire components",
      "Caramel color",
      "Soybean oil",
      "Paprika extract",
      "Corn syrup",
      "Modified corn starch",
      "Salt",
      "Autolyzed yeast",
      "Sodium phosphate",
      "MSG",
      "Sodium nitrite",
    ],
    ingredientDisclosure: "available",
    packageClaims: [],
    markerFacts: {
      mechanicallySeparated: "yes",
      addedWater: "yes",
      phosphates: "yes",
      msg: "yes",
      sodiumNitrite: "yes",
      addedColor: "yes",
      highSodium: "yes",
    },
    reviewNotes: [
      "Contains mechanically separated chicken plus pork and beef.",
      "Includes sodium phosphate, MSG, sodium nitrite, modified corn starch, and added color.",
      "25% DV sodium meets FDA's general definition of high sodium.",
      "Processed-meat research applies.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "heb_mi_tienda_especial_smoked_sausage_garlic_onion_black_pepper",
    productName:
      "H-E-B Mi Tienda Especial Smoked Sausage - Garlic, Onion & Black Pepper",
    productNameAliases: [
      "HEB Mi Tienda Especial Smoked Sausage Garlic Onion Black Pepper",
      "Mi Tienda Especial Smoked Sausage Garlic Onion Black Pepper",
    ],
    brandName: "H-E-B Mi Tienda",
    retailer: "H-E-B",
    barcodes: [],
    categoryPath: ["Meat", "Mixed sausage", "Chicken pork beef"],
    ingredients: [
      "Mechanically separated chicken",
      "Pork",
      "Beef",
      "Water",
      "Corn syrup",
      "Onion",
      "Garlic",
      "Spices",
      "Sugar",
      "Annatto",
      "Yeast extract",
      "MSG",
      "Mustard",
      "Maltodextrin",
      "Canola oil",
      "Soybean oil",
      "Sunflower oil",
      "Modified corn starch",
      "Salt",
      "Sodium phosphate",
      "Sodium nitrite",
    ],
    ingredientDisclosure: "available",
    packageClaims: [],
    markerFacts: {
      mechanicallySeparated: "yes",
      addedWater: "yes",
      phosphates: "yes",
      msg: "yes",
      sodiumNitrite: "yes",
      addedColor: "yes",
      highSodium: "yes",
    },
    reviewNotes: [
      "Multiple meat species plus mechanically separated chicken.",
      "Sodium phosphate, MSG, nitrite, modified corn starch, and annatto are present.",
      "27% DV sodium meets FDA's high-sodium guideline.",
      "Processed-meat research applies.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "earl_campbells_smoked_sausage_40_oz",
    productName: "Earl Campbell's Smoked Sausage - 40 oz",
    productNameAliases: ["Earl Campbells Smoked Sausage 40 oz"],
    brandName: "Earl Campbell's",
    retailer: undefined,
    barcodes: [],
    categoryPath: ["Meat", "Pork beef chicken", "Smoked sausage"],
    ingredients: [
      "Pork",
      "Beef",
      "Mechanically separated chicken",
      "Water",
      "Corn syrup",
      "Modified food starch",
      "Salt",
      "Dextrose",
      "Flavorings",
      "Potassium lactate",
      "Sodium phosphate",
      "Sodium diacetate",
      "Sodium nitrite",
    ],
    ingredientDisclosure: "available",
    packageClaims: [],
    markerFacts: {
      mechanicallySeparated: "yes",
      addedWater: "yes",
      phosphates: "yes",
      sodiumNitrite: "yes",
    },
    reviewNotes: [
      "Formulation uses mechanically separated poultry and several functional additives.",
      "Producer recall context exists for a different H-E-B smoked sausage and should not be attached as an exact recall.",
      "Processed-meat research applies.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "standard_pride_ground_beef_80_lean_5_lb",
    productName: "Standard Pride Ground Beef 80% Lean - 5 lb",
    productNameAliases: ["Standard Pride Ground Beef 80% Lean"],
    brandName: "Standard Pride",
    retailer: undefined,
    barcodes: [],
    categoryPath: ["Meat", "Beef", "Ground beef"],
    ingredients: ["Ground beef", "Finely textured beef"],
    ingredientDisclosure: "available",
    packageClaims: [],
    markerFacts: {
      finelyTexturedBeef: "yes",
      addedWater: "no",
      phosphates: "no",
    },
    reviewNotes: [
      "Label explicitly discloses finely textured beef.",
      "Do not call this mechanically separated beef; USDA treats these as distinct concepts.",
      "Finely textured beef has had past public controversy over transparency, but that does not establish a safety violation in this product.",
      "Red-meat research applies.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "heb_fresh_boneless_skinless_chicken_breasts_value_pack",
    productName: "H-E-B Fresh Boneless Skinless Chicken Breasts - Value Pack",
    productNameAliases: ["HEB Fresh Boneless Skinless Chicken Breasts Value Pack"],
    brandName: "H-E-B",
    retailer: "H-E-B",
    barcodes: [],
    categoryPath: ["Meat", "Chicken", "Chicken breast"],
    ingredients: ["Chicken"],
    ingredientDisclosure: "available",
    packageClaims: [],
    markerFacts: {
      addedWater: "no",
      phosphates: "no",
      antibiotics: "hidden",
      organic: "hidden",
    },
    reviewNotes: [
      "Do not automatically transfer H-E-B Natural line claims to this plain chicken product.",
      "Missing animal-raising claims remain hidden.",
      "Raw poultry carries ordinary handling risk, but that is not a product-specific defect.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "heb_original_thick_cut_bacon_12_oz",
    productName: "H-E-B Original Thick Cut Bacon - 12 oz",
    productNameAliases: ["HEB Original Thick Cut Bacon 12 oz"],
    brandName: "H-E-B",
    retailer: "H-E-B",
    barcodes: [],
    categoryPath: ["Meat", "Pork", "Bacon"],
    ingredients: [
      "Pork",
      "Water",
      "Salt",
      "Sugar",
      "Sodium phosphates",
      "Sodium erythorbate",
      "Sodium nitrite",
    ],
    ingredientDisclosure: "available",
    packageClaims: [],
    markerFacts: {
      addedWater: "yes",
      phosphates: "yes",
      sodiumNitrite: "yes",
    },
    reviewNotes: [
      "Conventional phosphate/nitrite cure.",
      "Bacon is processed meat under IARC's definition.",
      "No exact recall surfaced in this pass.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "simple_truth_organic_grass_fed_85_15_ground_beef_1_lb",
    productName: "Simple Truth Organic Grass Fed 85/15 Ground Beef - 1 lb",
    productNameAliases: [
      "Simple Truth Organic Grass Fed 85/15 Ground Beef",
      "Simple Truth Organic Grass-Fed 85/15 Ground Beef",
    ],
    brandName: "Simple Truth",
    retailer: "Kroger",
    barcodes: ["0001111096896"],
    categoryPath: ["Meat", "Beef", "Ground beef"],
    ingredients: ["Organic beef"],
    ingredientDisclosure: "available",
    packageClaims: ["USDA Organic", "Grass fed", "No antibiotics ever", "No added hormones"],
    markerFacts: {
      organic: "yes",
      grassFed: "yes",
      antibiotics: "no",
      growthHormones: "no",
      addedWater: "no",
      phosphates: "no",
    },
    reviewNotes: [
      "USDA Organic and grass-fed claims are explicit.",
      "Broader raised-without-antibiotics cattle research is claim-verification context only, not evidence against this product.",
      "General red-meat research applies.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "simple_truth_organic_boneless_skinless_chicken_breasts",
    productName: "Simple Truth Organic Boneless & Skinless Chicken Breasts",
    productNameAliases: ["Simple Truth Organic Boneless Skinless Chicken Breasts"],
    brandName: "Simple Truth",
    retailer: "Kroger",
    barcodes: ["0029082900000"],
    categoryPath: ["Meat", "Chicken", "Chicken breast"],
    ingredients: ["Organic boneless skinless chicken breasts with rib meat"],
    ingredientDisclosure: "available",
    packageClaims: [
      "USDA Organic",
      "Free range",
      "No antibiotics",
      "No retained water absorbed",
      "No preservatives",
    ],
    markerFacts: {
      organic: "yes",
      antibiotics: "no",
      retainedWater: "no",
      addedWater: "no",
      phosphates: "no",
    },
    reviewNotes: [
      "Strong product-specific disclosure around free-range, organic, no-antibiotics, and no-retained-water practices.",
      "Kroger notes that federal regulations prohibit hormones in poultry, so hormone claims need context.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "applegate_naturals_oven_roasted_turkey_breast_7_oz",
    productName: "Applegate Naturals Oven Roasted Turkey Breast - 7 oz",
    productNameAliases: ["Applegate Naturals Oven Roasted Turkey Breast"],
    brandName: "Applegate",
    retailer: undefined,
    barcodes: ["0002531758600"],
    categoryPath: ["Meat", "Turkey", "Deli meat"],
    ingredients: [
      "Turkey breast",
      "Water",
      "Sea salt",
      "Potato starch",
      "Salt",
      "Chicken broth",
      "Rosemary extract",
    ],
    ingredientDisclosure: "available",
    packageClaims: ["No chemical nitrites or nitrates", "Humanely raised"],
    markerFacts: {
      addedWater: "yes",
      phosphates: "not_listed",
      antibiotics: "hidden",
    },
    reviewNotes: [
      "Humanely raised is a marketing/animal-raising claim unless independent certification evidence is attached.",
      "No chemical nitrites or nitrates does not mean the sliced deli meat is unprocessed.",
      "No-added-hormone poultry claims need regulatory context.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "oscar_mayer_original_bacon_8_oz",
    productName: "Oscar Mayer Original Bacon - 8 oz",
    productNameAliases: ["Oscar Mayer Original Bacon"],
    brandName: "Oscar Mayer",
    retailer: undefined,
    barcodes: ["0004470001976"],
    categoryPath: ["Meat", "Pork", "Bacon"],
    ingredients: [
      "Pork",
      "Water",
      "Salt",
      "Sugar",
      "Sodium phosphates",
      "Sodium ascorbate",
      "Sodium nitrite",
    ],
    ingredientDisclosure: "available",
    packageClaims: [],
    markerFacts: {
      addedWater: "yes",
      phosphates: "yes",
      sodiumNitrite: "yes",
    },
    reviewNotes: [
      "Conventional nitrite/phosphate cure.",
      "Processed-meat research applies.",
      "Oscar Mayer Turkey Bacon had a separate 2025 recall; do not attach that as this pork bacon's exact recall.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "simple_truth_85_15_natural_grass_fed_angus_ground_beef_1_lb",
    productName: "Simple Truth 85/15 Natural Grass Fed Angus Ground Beef - 1 lb",
    productNameAliases: [
      "Simple Truth Natural Grass Fed Angus Ground Beef 85/15",
      "Simple Truth 85/15 Natural Grass-Fed Angus Ground Beef",
    ],
    brandName: "Simple Truth",
    retailer: "Kroger",
    barcodes: ["0001111067478"],
    categoryPath: ["Meat", "Beef", "Ground beef"],
    ingredients: ["Beef"],
    ingredientDisclosure: "available",
    packageClaims: ["Grass fed", "Grass finished", "USDA Organic in retailer description"],
    markerFacts: {
      grassFed: "yes",
      organic: "context_only",
      antibiotics: "hidden",
      growthHormones: "hidden",
    },
    reviewNotes: [
      "Retailer listing inconsistency: title says natural grass fed Angus while description calls it USDA organic.",
      "Broader antibiotic-free claim-verification research is not evidence against this particular product.",
      "Red-meat research applies.",
    ],
    localWarnings: [
      meatDataWarning,
      "Retailer wording was inconsistent around natural, grass-fed, and organic claims.",
    ],
    externalSignals: [],
  },
  {
    id: "applegate_organic_oven_roasted_turkey_breast_6_oz",
    productName: "Applegate Organic Oven Roasted Turkey Breast - 6 oz",
    productNameAliases: ["Applegate Organic Oven Roasted Turkey Breast"],
    brandName: "Applegate",
    retailer: undefined,
    barcodes: ["0002531768600"],
    categoryPath: ["Meat", "Turkey", "Deli meat"],
    ingredients: [
      "Organic turkey breast",
      "Water",
      "Sea salt",
      "Organic potato starch",
      "Organic chicken broth",
      "Rosemary extract",
    ],
    ingredientDisclosure: "available",
    packageClaims: ["Organic", "Humanely raised"],
    markerFacts: {
      organic: "yes",
      addedWater: "yes",
      phosphates: "not_listed",
      highSodium: "yes",
    },
    reviewNotes: [
      "Sodium is listed at 450 mg / 20% DV per serving, meeting FDA's high-sodium threshold.",
      "Even without chemical nitrite/nitrate, sliced deli turkey remains relevant to processed-meat research.",
      "Humanely-raised/no-antibiotics claims should stay distinct from independently verified product facts.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "johnsonville_original_bratwurst_19_oz",
    productName: "Johnsonville Original Bratwurst - 19 oz",
    productNameAliases: ["Johnsonville Original Bratwurst"],
    brandName: "Johnsonville",
    retailer: undefined,
    barcodes: ["0007778200787"],
    categoryPath: ["Meat", "Pork", "Bratwurst"],
    ingredients: [
      "Pork",
      "Water",
      "Corn syrup",
      "Pork broth with natural flavorings",
      "Salt",
      "Dextrose",
      "Natural flavors",
      "Dried vinegar",
      "BHA",
      "Propyl gallate",
      "Citric acid",
    ],
    ingredientDisclosure: "available",
    packageClaims: [],
    markerFacts: {
      addedWater: "yes",
      bha: "yes",
      propylGallate: "yes",
      phosphates: "not_listed",
      highSodium: "yes",
    },
    reviewNotes: [
      "Contains BHA and propyl gallate.",
      "29% DV sodium is high by FDA's general rule.",
      "A different Johnsonville Cheddar Bratwurst recall should not be attached to this Original Bratwurst.",
      "Sausage falls within processed-meat research.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "hillshire_farm_smoked_sausage_14_oz",
    productName: "Hillshire Farm Smoked Sausage - 14 oz",
    productNameAliases: [
      "Hillshire Farm Smoked Sausage",
      "Hillshire Farm Smoked Sausage Made with Pork Turkey and Beef",
    ],
    brandName: "Hillshire Farm",
    retailer: undefined,
    barcodes: ["0004450034171"],
    categoryPath: ["Meat", "Pork beef turkey", "Smoked sausage"],
    ingredients: [
      "Pork",
      "Beef",
      "Mechanically separated turkey",
      "Water",
      "Corn syrup",
      "Salt",
      "Natural flavors",
      "Dextrose",
      "Oat fiber",
      "Sodium phosphate",
      "MSG",
      "Hardwood-smoked sugar",
      "Sodium erythorbate",
      "Sodium nitrite",
      "Beef collagen casing",
    ],
    ingredientDisclosure: "available",
    packageClaims: [],
    markerFacts: {
      mechanicallySeparated: "yes",
      addedWater: "yes",
      phosphates: "yes",
      msg: "yes",
      sodiumNitrite: "yes",
    },
    reviewNotes: [
      "Mechanically separated turkey is explicitly declared.",
      "Contains phosphate, MSG, erythorbate, and nitrite.",
      "Historical product-family recall existed in 2023 over possible bone fragments; only specified lots/use-by dates were affected.",
      "A separate 2025 corn-dog/sausage-on-a-stick issue is broader company context, not this product's recall.",
      "Processed-meat research applies.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [
      historicalSignal({
        id: "usda_fsis_2023_hillshire_smoked_sausage_bone_fragments",
        sourceProvider: "usda_fsis",
        sourceName: "USDA FSIS historical recall",
        title: "Historical Hillshire Farm smoked sausage bone-fragment recall",
        productName: "Hillshire Farm Smoked Sausage - 14 oz",
        brandName: "Hillshire Farm",
        reason:
          "Hillshire Farm Smoked Sausage Made with Pork, Turkey and Beef was recalled in 2023 over possible bone fragments; only specified lots/use-by dates were affected.",
        affectedDates: ["2023"],
        matchedBy: ["barcode", "product_name"],
      }),
    ],
  },
  {
    id: "simple_truth_traditional_pork_sausage_patties_12_oz",
    productName: "Simple Truth Traditional Pork Sausage Patties - 12 oz",
    productNameAliases: ["Simple Truth Traditional Pork Sausage Patties"],
    brandName: "Simple Truth",
    retailer: "Kroger",
    barcodes: ["0001111097129"],
    categoryPath: ["Meat", "Pork", "Breakfast sausage"],
    ingredients: [
      "Pork",
      "Water",
      "Salt",
      "Dextrose",
      "Spices",
      "Potassium chloride",
      "Maltodextrin",
      "Flavoring",
    ],
    ingredientDisclosure: "available",
    packageClaims: ["No antibiotics ever", "Vegetarian fed", "Preservative free"],
    markerFacts: {
      antibiotics: "no",
      addedWater: "yes",
      phosphates: "not_listed",
      highSodium: "yes",
    },
    reviewNotes: [
      "Kroger states animals were never administered antibiotics or animal by-products.",
      "23% DV sodium is high by FDA's general guideline.",
      "Sausage is processed meat even when nitrites are not listed.",
    ],
    localWarnings: [meatDataWarning],
    externalSignals: [],
  },
  {
    id: "simple_truth_organic_turkey_breast_oven_roasted_sliced_6_oz",
    productName: "Simple Truth Organic Turkey Breast Oven Roasted Sliced - 6 oz",
    productNameAliases: [
      "Simple Truth Organic Oven Roasted Sliced Turkey Breast",
      "Simple Truth Organic Turkey Breast Oven Roasted",
    ],
    brandName: "Simple Truth",
    retailer: "Kroger",
    barcodes: ["0001111064050"],
    categoryPath: ["Meat", "Turkey", "Deli meat"],
    ingredients: ["Organic turkey", "Water", "Sea salt", "Organic honey"],
    ingredientDisclosure: "inconsistent",
    packageClaims: ["Organic", "No nitrates or nitrites added"],
    markerFacts: {
      organic: "yes",
      antibiotics: "hidden",
      addedWater: "yes",
      phosphates: "not_listed",
    },
    reviewNotes: [
      "Kroger says there are four ingredients, but the no nitrates/nitrites qualifier references celery powder that is not present in the displayed ingredient list.",
      "Allergen/advisory section says the product may contain sulfur dioxide and sulfites; this is advisory, not a declared ingredient.",
      "Deli turkey remains relevant to processed-meat research.",
    ],
    localWarnings: [
      meatDataWarning,
      "Retailer information was internally inconsistent around celery powder and the displayed ingredient list.",
    ],
    externalSignals: [],
  },
] satisfies UsMeatResearchRecord[];

function uniqueById(records: readonly UsMeatResearchRecord[]) {
  const seen = new Set<string>();
  const uniqueRecords: UsMeatResearchRecord[] = [];

  records.forEach((record) => {
    if (seen.has(record.id)) {
      return;
    }

    seen.add(record.id);
    uniqueRecords.push(record);
  });

  return uniqueRecords;
}

export const usMeatProductResearchRecords = uniqueById([
  ...usMeatBatch01Records,
  ...usMeatBatch02Records,
  ...usMeatBatch03Records,
  ...usMeatBatch04Records,
  ...usMeatBatch05Records,
  ...usMeatBatch07Records,
  ...usMeatBatch08Records,
  ...usMeatBatch09Records,
  ...usMeatBatch10Records,
  ...usMeatBatch11Records,
  ...usMeatBatch12Records,
  ...usMeatBatch13Records,
  ...usMeatBatch14Records,
  ...usMeatBatch15Records,
  ...usMeatBatch16Records,
  ...usMeatBatch17Records,
  ...usMeatBatch18Records,
  ...usMeatBatch19Records,
  ...usMeatBatch20Records,
  ...usMeatBatch21Records,
  ...usMeatBatch22Records,
  ...legacyUsMeatProductResearchRecords,
]);
