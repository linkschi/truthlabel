export type MicroplasticsBasicSeveritySuggestion = "yellow" | "red";

export type MicroplasticsDataStatus =
  | "starter"
  | "needs_external_data"
  | "needs_region_verification"
  | "verified_core";

export type MicroplasticsConfidenceLevel = "high" | "medium" | "low" | null;

export type MicroplasticsCategoryTag = "microplastics";

export type MicroplasticsContaminantType =
  | "microplastics"
  | "nanoplastics"
  | "plastic_contact"
  | "multiple";

export type MicroplasticsDetectionBasis =
  | "ingredient_marker"
  | "product_category_marker"
  | "packaging_marker"
  | "official_testing_data"
  | "brand_lab_data"
  | "external_dataset";

export type MicroplasticsItem = {
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
  contaminantType: MicroplasticsContaminantType;
  detectionBasis: MicroplasticsDetectionBasis;
  linkedExistingPackIds: string[];
  categoryTags: MicroplasticsCategoryTag[];
  basicSeveritySuggestion: MicroplasticsBasicSeveritySuggestion;
  reason: string;
  userFacingReason: string;
  dataStatus: MicroplasticsDataStatus;
  confidenceLevel: MicroplasticsConfidenceLevel;
  sourceRefs: string[];
  matchingNotes: string;
};

export const microplasticsDataPack = {
  id: "microplastics",
  categoryName: "Microplastics",
  categoryMeaning:
    "This category tracks microplastic and nanoplastic exposure review signals such as bottled water, plastic packaging, microwave-in-plastic markers, tea bag or coffee pod plastic-contact markers, seafood or salt review markers, and verified external testing signals. It is not a normal ingredient-only category. InsideIt uses it to surface review context or verified external concern without pretending ordinary ingredient text proves contamination.",
  dataStatus: "starter_needs_external_data",
  defaultCategorySeverity: "yellow",

  items: [
    {
      id: "microplastics",
      mainName: "Microplastics",
      otherNames: [
        "Microplastics",
        "Microplastic particles",
        "Plastic particles",
        "Plastic microparticles",
        "Microscopic plastic particles",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Microplastics detected",
        "Plastic particles detected",
        "Microplastic contamination",
      ],
      spellingVariants: ["Micro plastic", "Microplastic"],
      regionalNames: [],
      contaminantType: "microplastics",
      detectionBasis: "external_dataset",
      linkedExistingPackIds: [],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "red",
      reason:
        "Microplastic contaminant marker. Red should only trigger from verified product-specific testing, official warning, or external dataset evidence.",
      userFacingReason:
        "This product has a verified microplastic-related testing signal. InsideIt flags this as a serious microplastic concern based on external data.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not trigger from ordinary ingredient text unless product-specific external data says microplastics were detected.",
    },
    {
      id: "nanoplastics",
      mainName: "Nanoplastics",
      otherNames: [
        "Nanoplastics",
        "Nanoplastic particles",
        "Plastic nanoparticles",
        "Nano-plastics",
        "Nano plastic particles",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Nanoplastics detected",
        "Plastic nanoparticles detected",
        "Nanoplastic contamination",
      ],
      spellingVariants: [
        "Nano plastic",
        "Nanoplastic",
        "Nano-plastic",
        "Nanoplastics",
      ],
      regionalNames: [],
      contaminantType: "nanoplastics",
      detectionBasis: "external_dataset",
      linkedExistingPackIds: [],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "red",
      reason:
        "Nanoplastic contaminant marker. Red should only trigger from verified product-specific testing, official warning, or external dataset evidence.",
      userFacingReason:
        "This product has a verified nanoplastic-related testing signal. InsideIt flags this as a serious nanoplastic concern based on external data.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not trigger from ordinary ingredient text unless external data confirms detection.",
    },
    {
      id: "bottled_water_plastic_packaging_marker",
      mainName: "Bottled Water Plastic Packaging Marker",
      otherNames: [
        "Bottled water",
        "Plastic bottled water",
        "PET bottled water",
        "Spring water bottle",
        "Mineral water bottle",
        "Purified water bottle",
        "Drinking water bottle",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Bottled water",
        "Spring water",
        "Mineral water",
        "Purified water",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "plastic_contact",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: ["natural_positive:water"],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Bottled water in plastic packaging is a product category where microplastic review may be relevant, but product-specific testing is needed.",
      userFacingReason:
        "This appears to be bottled water or plastic-packaged water. InsideIt flags this as a microplastic review marker, not proof that this exact product contains elevated microplastics.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: ["WHO_MICROPLASTICS_DRINKING_WATER_2019"],
      matchingNotes:
        "Use product category and packaging fields where available. Do not trigger red without verified test data.",
    },
    {
      id: "plastic_bottle_drink_marker",
      mainName: "Plastic Bottle Drink Marker",
      otherNames: [
        "Plastic bottle",
        "PET bottle",
        "Recycled PET bottle",
        "rPET bottle",
        "HDPE bottle",
        "Plastic drink bottle",
        "Bottled drink",
        "Bottled beverage",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PET", "rPET", "HDPE"],
      labelVariants: [
        "Plastic bottle",
        "PET bottle",
        "rPET bottle",
        "Bottled drink",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "plastic_contact",
      detectionBasis: "packaging_marker",
      linkedExistingPackIds: [],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Plastic-bottle packaging may be relevant to microplastic review, but packaging alone does not prove contamination.",
      userFacingReason:
        "This product appears to use plastic bottle packaging. InsideIt flags this as a plastic-contact review marker, not proof of microplastic contamination.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: ["FDA_MICROPLASTICS_NANOPLASTICS_FOODS"],
      matchingNotes:
        "Only use if packaging data exists or label or product title clearly indicates a plastic bottle.",
    },
    {
      id: "plastic_food_container_marker",
      mainName: "Plastic Food Tray / Tub / Cup Marker",
      otherNames: [
        "Plastic tray",
        "Plastic tub",
        "Plastic cup",
        "Plastic pot",
        "Plastic container",
        "Plastic pouch",
        "Plastic wrapper",
        "Plastic wrap",
        "Plastic film",
        "Plastic bag",
        "Sachet",
        "Pouch",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Plastic tray",
        "Plastic tub",
        "Plastic container",
        "Plastic pouch",
        "Plastic wrapper",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "plastic_contact",
      detectionBasis: "packaging_marker",
      linkedExistingPackIds: [],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Plastic-contact food packaging may be relevant to microplastic review, but packaging alone does not prove contamination.",
      userFacingReason:
        "This product appears to use plastic food packaging. InsideIt flags this as a plastic-contact review marker, not proof of microplastic contamination.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: ["FDA_MICROPLASTICS_NANOPLASTICS_FOODS"],
      matchingNotes:
        "Use packaging metadata if available. Do not assume contamination from packaging alone.",
    },
    {
      id: "microwave_in_plastic_marker",
      mainName: "Microwave-in-Plastic Marker",
      otherNames: [
        "Microwave in tray",
        "Microwaveable tray",
        "Microwavable tray",
        "Microwave in packaging",
        "Cook in bag",
        "Steam-in-bag",
        "Steam in bag",
        "Boil-in-bag",
        "Boil in bag",
        "Heat in pouch",
        "Heat in container",
        "Microwave-safe plastic",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Microwave in tray",
        "Cook in bag",
        "Steam-in-bag",
        "Boil-in-bag",
        "Microwaveable tray",
      ],
      spellingVariants: ["Microwaveable", "Microwavable"],
      regionalNames: [],
      contaminantType: "plastic_contact",
      detectionBasis: "packaging_marker",
      linkedExistingPackIds: [],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Heating food in plastic-contact packaging is a plastic-contact review marker.",
      userFacingReason:
        "This product appears designed to be heated in plastic packaging. InsideIt flags this as a plastic-contact review item.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not claim migration or contamination without verified evidence. This is a review marker.",
    },
    {
      id: "plastic_tea_bag_marker",
      mainName: "Plastic Tea Bag Marker",
      otherNames: [
        "Plastic tea bag",
        "Nylon tea bag",
        "PET tea bag",
        "Pyramid tea bag",
        "Silken tea bag",
        "Mesh tea bag",
        "Tea sachet",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PET"],
      labelVariants: ["Pyramid tea bag", "Nylon tea bag", "Mesh tea bag"],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "plastic_contact",
      detectionBasis: "packaging_marker",
      linkedExistingPackIds: ["natural_positive:tea_coffee_infusions"],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Some tea bag materials may involve plastic contact, which can be relevant to microplastic review.",
      userFacingReason:
        "This product may use plastic-contact tea bag material. InsideIt flags this as a microplastic review marker when packaging details support it.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Only trigger when packaging or material data supports a plastic-contact tea bag. Do not flag all tea.",
    },
    {
      id: "coffee_pod_capsule_marker",
      mainName: "Coffee Pod / Capsule Marker",
      otherNames: [
        "Coffee pod",
        "Coffee capsule",
        "Plastic coffee pod",
        "Plastic capsule",
        "Single-serve capsule",
        "Single serve capsule",
        "K-cup",
        "K cup",
        "Nespresso capsule",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Coffee pod",
        "Coffee capsule",
        "Single-serve capsule",
        "K-cup",
      ],
      spellingVariants: ["K-cup", "K cup"],
      regionalNames: [],
      contaminantType: "plastic_contact",
      detectionBasis: "packaging_marker",
      linkedExistingPackIds: ["natural_positive:tea_coffee_infusions"],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Single-serve pods or capsules may involve plastic contact and heat, which can be relevant to microplastic review.",
      userFacingReason:
        "This product uses a pod or capsule format. InsideIt flags this as a plastic-contact review marker when packaging details support it.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not flag all coffee. Use pod or capsule packaging context.",
    },
    {
      id: "seafood_microplastic_review_marker",
      mainName: "Seafood Microplastic Review Marker",
      otherNames: [
        "Seafood",
        "Fish",
        "Shellfish",
        "Mussels",
        "Oysters",
        "Clams",
        "Shrimp",
        "Prawns",
        "Crab",
        "Lobster",
        "Squid",
        "Octopus",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: ["Seafood", "Shellfish", "Mussels", "Oysters"],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "microplastics",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: [
        "allergy_risk:fish",
        "allergy_risk:crustacean_shellfish",
        "allergy_risk:molluscs",
      ],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Seafood is a product category where microplastic review may be relevant depending on species, sourcing, and testing data.",
      userFacingReason:
        "This product is a seafood item. InsideIt flags this as a microplastic review marker, not proof that this exact product contains elevated microplastics.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not make all seafood red. Use product-specific testing data for stronger warnings.",
    },
    {
      id: "bivalve_shellfish_microplastic_review",
      mainName: "Bivalve Shellfish Microplastic Review",
      otherNames: [
        "Mussels",
        "Oysters",
        "Clams",
        "Scallops",
        "Cockles",
        "Bivalves",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: ["Mussels", "Oysters", "Clams", "Scallops"],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "microplastics",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: ["allergy_risk:molluscs"],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Bivalve shellfish are a seafood subgroup often discussed in microplastic exposure review because they may be eaten whole.",
      userFacingReason:
        "This product appears to contain bivalve shellfish. InsideIt flags this as a microplastic review marker, not proof of product-specific contamination.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Also link to Allergy Risk for molluscs or shellfish where relevant.",
    },
    {
      id: "salt_microplastic_review_marker",
      mainName: "Salt Microplastic Review Marker",
      otherNames: [
        "Sea salt",
        "Salt",
        "Table salt",
        "Rock salt",
        "Himalayan salt",
        "Salt flakes",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: ["Sea salt", "Table salt", "Salt flakes"],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "microplastics",
      detectionBasis: "product_category_marker",
      linkedExistingPackIds: ["natural_positive:salt"],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Salt products may require microplastic review depending on source and testing data.",
      userFacingReason:
        "This product contains salt or sea salt. InsideIt may flag this as a microplastic review item when product category or testing data supports it.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not flag small amounts of salt inside any product as a microplastic concern. Use only when the product itself is salt or external data supports it.",
    },
    {
      id: "chewing_gum_plastic_polymer_review",
      mainName: "Chewing Gum Plastic Polymer Review",
      otherNames: [
        "Gum base",
        "Synthetic gum base",
        "Polyvinyl acetate",
        "Polyethylene",
        "Butadiene-styrene rubber",
        "Isobutylene-isoprene copolymer",
        "Petroleum wax",
        "Paraffin wax",
      ],
      chemicalNames: ["Polyvinyl acetate", "Polyethylene"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PVA", "PE"],
      labelVariants: ["Gum base", "Synthetic gum base"],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "plastic_contact",
      detectionBasis: "ingredient_marker",
      linkedExistingPackIds: [
        "banned_restricted_items:paraffin_wax_canada_restricted",
      ],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "yellow",
      reason:
        "Chewing gum base may include synthetic polymer ingredients depending on formulation.",
      userFacingReason:
        "This product contains gum base or synthetic polymer gum-base wording. InsideIt flags this as a plastic-polymer review item.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not claim microplastic shedding without evidence. This is an ingredient and material transparency marker.",
    },
    {
      id: "plastic_packaging_external_test_marker",
      mainName: "Plastic Packaging External Test Marker",
      otherNames: [
        "Microplastic test result",
        "Nanoplastic test result",
        "Plastic particle test result",
        "Packaging migration test",
        "Plastic migration test",
        "Third-party microplastic test",
        "Certificate of analysis",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["COA"],
      labelVariants: [
        "Microplastic testing",
        "Nanoplastic testing",
        "Plastic particle testing",
        "Certificate of analysis",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "multiple",
      detectionBasis: "external_dataset",
      linkedExistingPackIds: [],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "yellow",
      reason:
        "External testing context. Severity depends on actual measured results.",
      userFacingReason:
        "This product has microplastic or packaging-migration testing context. InsideIt should use the actual result if available.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Do not treat tested as good or bad by itself.",
    },
    {
      id: "verified_microplastic_detection_marker",
      mainName: "Verified Microplastic Detection Marker",
      otherNames: [
        "Microplastics detected",
        "Plastic particles detected",
        "Elevated microplastics",
        "Microplastic contamination",
        "Confirmed microplastic presence",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Microplastics detected",
        "Elevated microplastics",
        "Confirmed microplastic presence",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "microplastics",
      detectionBasis: "official_testing_data",
      linkedExistingPackIds: [],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "red",
      reason:
        "Verified detection marker from official testing or a credible external dataset.",
      userFacingReason:
        "This product has verified microplastic detection data. InsideIt flags this as a serious microplastic concern based on external evidence.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Only trigger from external data, not normal ingredient text.",
    },
    {
      id: "verified_nanoplastic_detection_marker",
      mainName: "Verified Nanoplastic Detection Marker",
      otherNames: [
        "Nanoplastics detected",
        "Plastic nanoparticles detected",
        "Elevated nanoplastics",
        "Nanoplastic contamination",
        "Confirmed nanoplastic presence",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Nanoplastics detected",
        "Elevated nanoplastics",
        "Confirmed nanoplastic presence",
      ],
      spellingVariants: [],
      regionalNames: [],
      contaminantType: "nanoplastics",
      detectionBasis: "official_testing_data",
      linkedExistingPackIds: [],
      categoryTags: ["microplastics"],
      basicSeveritySuggestion: "red",
      reason:
        "Verified nanoplastic detection marker from official testing or a credible external dataset.",
      userFacingReason:
        "This product has verified nanoplastic detection data. InsideIt flags this as a serious nanoplastic concern based on external evidence.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Only trigger from external data, not normal ingredient text.",
    },
  ] satisfies MicroplasticsItem[],

  matchingRules: [
    "Search mainName, otherNames, chemicalNames, brandNames, eNumbers, insNumbers, abbreviations, labelVariants, spellingVariants, and regionalNames.",
    "Normalize to lowercase, remove punctuation, collapse spaces, normalize microplastic/micro plastic, nanoplastic/nano plastic, nano-plastic/nanoplastic, PET/rPET/HDPE, K-cup/K cup, and microwaveable/microwavable.",
    "Use product type, packaging context, ingredient context, official testing data, brand lab data, and external dataset context together when available.",
    "This is not a normal ingredient-only category. Product-specific testing is needed for confirmation.",
  ],

  falsePositiveGuards: [
    "Do not claim microplastic contamination from ingredient text alone.",
    "Do not flag every plastic-packaged product as red.",
    "Do not flag every tea product as a tea-bag microplastic issue.",
    "Do not flag all coffee as a pod or capsule risk.",
    "Do not flag all salt inside packaged food; only salt as a product category or verified data.",
    "Do not flag seafood as red without verified data.",
    "Do not treat third-party tested as good or bad without the actual result.",
    "Do not claim packaging migration unless verified data supports it.",
  ],

  classificationRules: [
    "Product category markers like bottled water, seafood, bivalves, and salt products default to yellow review when they are relevant.",
    "Packaging markers like plastic bottles, microwave-in-plastic formats, plastic tea bags, and coffee pods default to yellow review when they are relevant.",
    "Verified elevated result, official warning, or credible external dataset can support red when the evidence is product-specific.",
    "Do not make red from packaging or category risk alone.",
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
      "Product category or packaging marker only = yellow review",
      "Verified elevated result, official warning, or credible external dataset = red",
      "Missing data is not proof of absence",
    ],
  },
};

export type MicroplasticsDataPack = typeof microplasticsDataPack;
export type MicroplasticsDataPackItem =
  (typeof microplasticsDataPack.items)[number];
