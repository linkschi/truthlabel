export type HeavyMetalsBasicSeveritySuggestion = "yellow" | "red";

export type HeavyMetalsDataStatus =
  | "starter"
  | "needs_external_data"
  | "needs_region_verification"
  | "verified_core";

export type HeavyMetalsConfidenceLevel = "high" | "medium" | "low" | null;

export type HeavyMetalsCategoryTag = "heavy_metals";

export type HeavyMetalsContaminantType =
  | "lead"
  | "arsenic"
  | "cadmium"
  | "mercury"
  | "multiple";

export type HeavyMetalsDetectionBasis =
  | "ingredient_marker"
  | "product_category_marker"
  | "official_testing_data"
  | "recall_data"
  | "brand_lab_data"
  | "external_dataset";

export type HeavyMetalsItem = {
  id: string;
  mainName: string;
  otherNames: string[];
  chemicalNames: string[];
  brandNames: string[];
  eNumbers: string[];
  insNumbers: string[];
  abbreviations: string[];
  labelVariants: string[];
  spellingVariants: string[];
  regionalNames: string[];
  contaminantType: HeavyMetalsContaminantType;
  detectionBasis: HeavyMetalsDetectionBasis;
  linkedExistingPackIds: string[];
  categoryTags: HeavyMetalsCategoryTag[];
  basicSeveritySuggestion: HeavyMetalsBasicSeveritySuggestion;
  reason: string;
  userFacingReason: string;
  dataStatus: HeavyMetalsDataStatus;
  confidenceLevel: HeavyMetalsConfidenceLevel;
  sourceRefs: string[];
  matchingNotes: string;
};

export const heavyMetalsDataPack = {
  id: "heavy_metals",
  categoryName: "Heavy Metals",
  categoryMeaning:
    "This category tracks heavy-metal exposure review signals such as lead, inorganic arsenic, cadmium, mercury, high-mercury seafood markers, rice/infant cereal arsenic review markers, cocoa and spice review markers, and verified external warning signals. It is not a normal ingredient-only category. InsideIt uses it to show review context or verified external concerns without pretending that ordinary ingredient text proves contamination.",
  dataStatus: "starter_needs_external_data",
  defaultCategorySeverity: "yellow",

  items: [
    {
      id: "lead",
      mainName: "Lead",
      otherNames: ["Lead", "Lead contamination", "Lead detected", "Elevated lead"],
      chemicalNames: ["Lead"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["Pb"],
      labelVariants: ["Lead detected", "Elevated lead", "Lead contamination"],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "lead",
      detectionBasis: "external_dataset",
      linkedExistingPackIds: [],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "red",
      reason:
        "Heavy metal contaminant. Red should only trigger from verified product-specific testing, official recall, or official warning data.",
      userFacingReason:
        "This product has a verified lead-related warning or testing signal. InsideIt flags this as a serious heavy-metal concern based on external data.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not match ordinary ingredient text unless product-specific external data says lead was detected or recalled.",
    },
    {
      id: "inorganic_arsenic",
      mainName: "Inorganic Arsenic",
      otherNames: [
        "Inorganic arsenic",
        "Arsenic",
        "Arsenic contamination",
        "Elevated arsenic",
      ],
      chemicalNames: ["Inorganic arsenic", "Arsenic"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["As"],
      labelVariants: [
        "Arsenic detected",
        "Elevated arsenic",
        "Inorganic arsenic detected",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "arsenic",
      detectionBasis: "external_dataset",
      linkedExistingPackIds: [],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "red",
      reason:
        "Heavy metal or metalloid contaminant. Red should only trigger from verified product-specific testing, official recall, or official warning data.",
      userFacingReason:
        "This product has a verified arsenic-related warning or testing signal. InsideIt flags this as a serious heavy-metal concern based on external data.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: ["FDA_INORGANIC_ARSENIC_INFANT_RICE_CEREAL"],
      matchingNotes:
        "Do not claim a product contains arsenic from ingredient text alone.",
    },
    {
      id: "cadmium",
      mainName: "Cadmium",
      otherNames: ["Cadmium", "Cadmium contamination", "Elevated cadmium"],
      chemicalNames: ["Cadmium"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["Cd"],
      labelVariants: [
        "Cadmium detected",
        "Elevated cadmium",
        "Cadmium contamination",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "cadmium",
      detectionBasis: "external_dataset",
      linkedExistingPackIds: [],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "red",
      reason:
        "Heavy metal contaminant. Red should only trigger from verified product-specific testing, official recall, or official warning data.",
      userFacingReason:
        "This product has a verified cadmium-related warning or testing signal. InsideIt flags this as a serious heavy-metal concern based on external data.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not claim cadmium presence without product-specific data.",
    },
    {
      id: "mercury_methylmercury",
      mainName: "Mercury / Methylmercury",
      otherNames: [
        "Mercury",
        "Methylmercury",
        "Methyl mercury",
        "Mercury contamination",
        "Elevated mercury",
      ],
      chemicalNames: ["Mercury", "Methylmercury"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["Hg"],
      labelVariants: [
        "Mercury detected",
        "Elevated mercury",
        "Methylmercury detected",
      ],
      spellingVariants: ["Methyl mercury", "Methylmercury"],
      regionalNames: [],
      contaminantType: "mercury",
      detectionBasis: "external_dataset",
      linkedExistingPackIds: [],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "red",
      reason:
        "Heavy metal contaminant, especially relevant to some seafood categories. Red should only trigger from verified product-specific data or official high-mercury seafood rules.",
      userFacingReason:
        "This product has a verified mercury-related warning or high-mercury seafood signal. InsideIt flags this as a heavy-metal review concern.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: ["FDA_FISH_MERCURY_ADVICE"],
      matchingNotes:
        "Seafood type can create a review flag. Product-specific elevated mercury requires external data.",
    },
    {
      id: "high_mercury_fish_marker",
      mainName: "High-Mercury Fish Marker",
      otherNames: [
        "Shark",
        "Swordfish",
        "King mackerel",
        "Tilefish",
        "Tilefish from the Gulf of Mexico",
        "Bigeye tuna",
        "Marlin",
        "Orange roughy",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Shark",
        "Swordfish",
        "King mackerel",
        "Bigeye tuna",
        "Marlin",
        "Orange roughy",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "mercury",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: ["allergy_risk:fish"],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Some fish types are commonly treated as higher-mercury choices in seafood guidance.",
      userFacingReason:
        "This seafood type is flagged for mercury review. InsideIt flags this as a heavy-metal review marker, not proof of a product-specific test result.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: ["FDA_FISH_MERCURY_ADVICE"],
      matchingNotes:
        "Use product name, category, and ingredient list. Do not flag all fish as high mercury.",
    },
    {
      id: "seafood_mercury_review_marker",
      mainName: "Seafood Mercury Review Marker",
      otherNames: [
        "Fish",
        "Seafood",
        "Tuna",
        "Albacore tuna",
        "Canned tuna",
        "Fresh tuna",
        "Mackerel",
        "Grouper",
        "Sea bass",
        "Halibut",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: ["Seafood", "Fish", "Tuna"],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "mercury",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: ["allergy_risk:fish"],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Seafood may require mercury review depending on species and serving context.",
      userFacingReason:
        "This product is a seafood item. InsideIt may flag it for mercury review depending on the exact species and available data.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: ["FDA_FISH_MERCURY_ADVICE"],
      matchingNotes:
        "Do not make all seafood red. Only high-mercury species or verified data should create stronger warnings.",
    },
    {
      id: "infant_rice_cereal_arsenic_marker",
      mainName: "Infant Rice Cereal Arsenic Marker",
      otherNames: [
        "Infant rice cereal",
        "Baby rice cereal",
        "Rice cereal for infants",
        "Rice cereal",
        "Baby cereal rice",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: ["Infant rice cereal", "Baby rice cereal"],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "arsenic",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: [],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Rice cereal for infants is a known category for inorganic arsenic review and action-level guidance.",
      userFacingReason:
        "This product appears to be an infant rice cereal or rice-based baby cereal. InsideIt flags this for inorganic arsenic review based on product category.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: ["FDA_INORGANIC_ARSENIC_INFANT_RICE_CEREAL"],
      matchingNotes:
        "Red should only trigger from verified testing or known action-level exceedance.",
    },
    {
      id: "rice_rice_flour_rice_syrup_arsenic_review",
      mainName: "Rice / Rice Flour / Rice Syrup Arsenic Review",
      otherNames: [
        "Rice",
        "Brown rice",
        "White rice",
        "Rice flour",
        "Brown rice flour",
        "Rice starch",
        "Rice syrup",
        "Brown rice syrup",
        "Rice cereal",
        "Rice cakes",
        "Rice crisps",
        "Rice puffs",
        "Rice milk",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Rice",
        "Rice flour",
        "Brown rice syrup",
        "Rice cereal",
        "Rice cakes",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "arsenic",
      detectionBasis: "ingredient_marker",
      linkedExistingPackIds: [
        "natural_positive:whole_grains_simple_grains",
        "natural_positive:simple_flour_starch_ingredients",
      ],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Rice-based ingredients may require inorganic arsenic review depending on product type and testing data.",
      userFacingReason:
        "This product contains rice-based ingredients. InsideIt flags this as an arsenic review marker, not proof that this product has elevated arsenic.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: ["FDA_INORGANIC_ARSENIC_INFANT_RICE_CEREAL"],
      matchingNotes:
        "Do not make red from rice alone. Use product type, baby or kids profile, and verified testing data.",
    },
    {
      id: "baby_food_toxic_elements_marker",
      mainName: "Baby Food Toxic Elements Marker",
      otherNames: [
        "Baby food",
        "Infant food",
        "Toddler food",
        "Baby puree",
        "Baby purée",
        "Baby pouch",
        "Infant snack",
        "Toddler snack",
        "Baby cereal",
        "Teething biscuits",
        "Puffs",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Baby food",
        "Baby pouch",
        "Infant food",
        "Toddler food",
      ],
      spellingVariants: ["Puree", "Purée"],
      regionalNames: [],
      contaminantType: "multiple",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: [],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Foods for babies and young children are a priority category for reducing exposure to lead, arsenic, cadmium, and mercury.",
      userFacingReason:
        "This appears to be a baby or toddler food product. InsideIt flags it for heavy-metal review because toxic elements are a priority concern in foods for young children.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: ["FDA_CLOSER_TO_ZERO"],
      matchingNotes:
        "Do not claim the product contains heavy metals unless verified data exists.",
    },
    {
      id: "fruit_juice_lead_arsenic_review",
      mainName: "Fruit Juice Lead / Arsenic Review",
      otherNames: [
        "Apple juice",
        "Grape juice",
        "Pear juice",
        "Fruit juice",
        "Juice drink",
        "Juice beverage",
        "Fruit nectar",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: ["Apple juice", "Grape juice", "Fruit juice"],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "multiple",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: ["natural_positive:fruits"],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Some fruit juice categories have lead or arsenic review relevance depending on testing data and region.",
      userFacingReason:
        "This product appears to be a fruit juice or juice drink. InsideIt flags this as a lead or arsenic review marker, not proof of elevated heavy metals.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Use verified FDA or regional action levels or product testing data later.",
    },
    {
      id: "cocoa_chocolate_lead_cadmium_review",
      mainName: "Cocoa / Chocolate Lead-Cadmium Review",
      otherNames: [
        "Cocoa",
        "Cacao",
        "Cocoa powder",
        "Cacao powder",
        "Dark chocolate",
        "Chocolate",
        "Cocoa mass",
        "Cocoa liquor",
        "Chocolate liquor",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: ["Cocoa", "Cacao", "Dark chocolate", "Chocolate"],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "multiple",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: ["natural_positive:cocoa_chocolate_base"],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Cocoa and chocolate products may require lead or cadmium review depending on product-specific testing data.",
      userFacingReason:
        "This product contains cocoa or chocolate ingredients. InsideIt flags this as a lead or cadmium review marker, not proof that this product has elevated heavy metals.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not make red without verified product-specific testing, official warning, or recall data.",
    },
    {
      id: "spices_cinnamon_lead_review",
      mainName: "Spices / Cinnamon Lead Review",
      otherNames: [
        "Cinnamon",
        "Ground cinnamon",
        "Cassia cinnamon",
        "Spice",
        "Spices",
        "Spice blend",
        "Curry powder",
        "Turmeric",
        "Paprika",
        "Chili powder",
        "Chilli powder",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: ["Cinnamon", "Ground cinnamon", "Spice blend"],
      spellingVariants: ["Chili", "Chilli"],
      regionalNames: [],
      contaminantType: "lead",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: [
        "natural_positive:spices",
        "unknown_review:generic_spices",
      ],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Some spices can require lead review depending on source, testing data, or recall history.",
      userFacingReason:
        "This product contains spices or cinnamon. InsideIt flags this as a lead-review marker only when product category, recall data, or external testing supports it.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not flag every spice product as high risk. Use verified data later.",
    },
    {
      id: "seaweed_heavy_metal_review",
      mainName: "Seaweed Heavy Metal Review",
      otherNames: [
        "Seaweed",
        "Kelp",
        "Nori",
        "Wakame",
        "Kombu",
        "Dulse",
        "Hijiki",
        "Sea moss",
        "Irish moss",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: ["Seaweed", "Kelp", "Nori", "Kombu", "Wakame"],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "multiple",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: [],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Seaweed products may require heavy-metal review depending on species, source, and testing data.",
      userFacingReason:
        "This product contains seaweed or kelp. InsideIt flags this as a heavy-metal review marker, not proof of elevated heavy metals.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not make red without verified testing, official warning, or recall data.",
    },
    {
      id: "heavy_metal_recall_marker",
      mainName: "Heavy Metal Recall Marker",
      otherNames: [
        "Recalled for lead",
        "Recall due to lead",
        "Recalled for arsenic",
        "Recall due to arsenic",
        "Recalled for cadmium",
        "Recall due to cadmium",
        "Recalled for mercury",
        "Recall due to mercury",
        "Toxic element recall",
        "Heavy metal recall",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Recall due to lead",
        "Recall due to arsenic",
        "Heavy metal recall",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "multiple",
      detectionBasis: "recall_data",
      linkedExistingPackIds: [],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "red",
      reason: "Official recall or warning related to heavy metal contamination.",
      userFacingReason:
        "This product has an official heavy-metal recall or warning signal. InsideIt flags this as a serious heavy-metal concern.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Only trigger from recall or official alert data, not normal ingredient text.",
    },
    {
      id: "product_lab_test_heavy_metal_marker",
      mainName: "Product Lab Test Heavy Metal Marker",
      otherNames: [
        "Lab tested for lead",
        "Lab tested for arsenic",
        "Lab tested for cadmium",
        "Lab tested for mercury",
        "Heavy metal test result",
        "Third-party tested",
        "Certificate of analysis",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["COA"],
      labelVariants: [
        "Third-party tested",
        "Certificate of analysis",
        "Heavy metal testing",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "multiple",
      detectionBasis: "brand_lab_data",
      linkedExistingPackIds: [],
      categoryTags: ["heavy_metals"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Lab-test marker. The severity depends on the actual measured result, not the phrase alone.",
      userFacingReason:
        "This product mentions heavy-metal testing or a certificate of analysis. InsideIt records this as external-data context and should use the actual result if available.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not treat third-party tested as good or bad by itself. Use actual lab result values later.",
    },
  ] satisfies HeavyMetalsItem[],

  matchingRules: [
    "Search mainName, otherNames, chemicalNames, brandNames, eNumbers, insNumbers, abbreviations, labelVariants, spellingVariants, and regionalNames.",
    "Normalize to lowercase, remove punctuation, collapse spaces, normalize puree/purée, chili/chilli, methyl mercury/methylmercury, Pb/lead, Cd/cadmium, Hg/mercury, and As/arsenic.",
    "Use product type, product title, ingredient list, official testing data, recall data, brand lab data, and external dataset context together when available.",
    "This is not a normal ingredient-only category. Product-specific testing or official recall data is needed for confirmation.",
  ],

  falsePositiveGuards: [
    "Do not flag lead when it means leadership or leading.",
    "Do not flag Pb unless context clearly means lead or heavy-metal data.",
    "Do not claim rice contains elevated arsenic from ingredient text alone.",
    "Do not claim seafood contains elevated mercury from ingredient text alone.",
    "Do not claim chocolate contains elevated cadmium or lead from ingredient text alone.",
    "Do not flag third-party tested as good or bad without actual results.",
    "Do not make baby food red from category alone.",
    "Do not make spices red from category alone.",
  ],

  classificationRules: [
    "Product category markers like rice, baby food, seafood, cocoa, and spices default to yellow review when they are relevant.",
    "Verified elevated result, official warning, or official recall can support red when the evidence is product-specific.",
    "Do not make red from category risk alone.",
    "Missing data is not proof of absence.",
  ],

  displayRulesForLater: {
    noMarkers: {
      severity: "green",
      display: "No",
    },
    hasMarkers: {
      severity: "yellow",
      display: "Review",
    },
    hasVerifiedSignal: {
      severity: "red",
      display: "Serious concern",
    },
    notes: [
      "No marker or data = hide row or green No only if scan context supports it",
      "Product category marker only = yellow review",
      "Verified elevated result, recall, or official warning = red",
      "Missing data is not proof of absence",
    ],
  },
};

export type HeavyMetalsDataPack = typeof heavyMetalsDataPack;
export type HeavyMetalsDataPackItem =
  (typeof heavyMetalsDataPack.items)[number];
