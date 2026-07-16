export type BrandTrustSafetyBasicSeveritySuggestion =
  | "green"
  | "yellow"
  | "red";

export type BrandTrustSafetyDataStatus =
  | "starter"
  | "needs_external_data"
  | "needs_region_verification"
  | "verified_core";

export type BrandTrustSafetyConfidenceLevel =
  | "high"
  | "medium"
  | "low"
  | null;

export type BrandTrustSafetyCategoryTag = "brand_trust_safety";

export type BrandTrustSafetyDataSourceType =
  | "official_recall"
  | "public_health_alert"
  | "enforcement_report"
  | "outbreak_notice"
  | "warning_letter"
  | "lawsuit"
  | "settlement"
  | "third_party_testing"
  | "brand_disclosure"
  | "news_report"
  | "user_report";

export type BrandTrustSafetyDetectionBasis =
  | "external_dataset"
  | "official_database"
  | "brand_product_match"
  | "barcode_match"
  | "manual_review";

export type BrandTrustSafetyAffectedScope =
  | "specific_product"
  | "specific_batch"
  | "brand_level"
  | "company_level"
  | "category_level";

export type BrandTrustSafetySignalType =
  | "active_recall"
  | "historical_recall"
  | "public_health_alert"
  | "undeclared_allergen"
  | "pathogen_contamination"
  | "foreign_material"
  | "heavy_metal_warning"
  | "chemical_contamination"
  | "misbranding_labeling"
  | "outbreak_investigation"
  | "regulatory_enforcement"
  | "repeated_recalls"
  | "lawsuit_allegation"
  | "settlement_or_court_confirmed"
  | "third_party_testing"
  | "brand_disclosure"
  | "missing_data"
  | "user_report"
  | "clean_recall_check";

export type BrandTrustSafetySignalItem = {
  id: string;
  mainName: string;
  signalType: BrandTrustSafetySignalType;
  dataSourceType: BrandTrustSafetyDataSourceType;
  detectionBasis: BrandTrustSafetyDetectionBasis;
  affectedScope: BrandTrustSafetyAffectedScope;
  linkedExistingPackIds: string[];
  categoryTags: BrandTrustSafetyCategoryTag[];
  basicSeveritySuggestion: BrandTrustSafetyBasicSeveritySuggestion;
  redOnlyWhenVerified: true;
  reason: string;
  userFacingReason: string;
  dataStatus: BrandTrustSafetyDataStatus;
  confidenceLevel: BrandTrustSafetyConfidenceLevel;
  sourceRefs: string[];
  matchingNotes: string;
};

export const brandTrustSafetyRecallsLawsuitsDataPack = {
  id: "brand_trust_safety",
  categoryName: "Brand Trust / Safety / Recalls / Lawsuits",
  categoryMeaning:
    "This category tracks brand and product-level safety and trust signals from external data such as recalls, public health alerts, official enforcement signals, outbreak investigations, undeclared allergen events, contamination recalls, repeated recall history, lawsuits, settlements, and product-specific safety notices. It is not an ingredient-list-only category. Truthlabel uses it to add external context without claiming that every product from a brand is unsafe.",
  dataStatus: "starter_needs_external_data",
  defaultCategorySeverity: "yellow",

  items: [
    {
      id: "active_official_recall",
      mainName: "Active Official Recall",
      signalType: "active_recall",
      dataSourceType: "official_recall",
      detectionBasis: "official_database",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "red",
      redOnlyWhenVerified: true,
      reason:
        "Official active recall signal for a specific product, batch, or product group.",
      userFacingReason:
        "This product has an active official recall signal. Truthlabel flags this as a serious safety concern based on external recall data.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [
        "FDA_RECALLS_MARKET_WITHDRAWALS_SAFETY_ALERTS",
        "FDA_ENFORCEMENT_REPORTS",
        "USDA_FSIS_RECALLS_PUBLIC_HEALTH_ALERTS",
      ],
      matchingNotes:
        "Only trigger red when the brand, product, batch, or barcode match is strong enough. Do not apply one recalled batch to all products unless the official recall scope says so.",
    },
    {
      id: "resolved_historical_recall",
      mainName: "Resolved / Historical Recall",
      signalType: "historical_recall",
      dataSourceType: "official_recall",
      detectionBasis: "official_database",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "yellow",
      redOnlyWhenVerified: true,
      reason:
        "Past recall signal that may be relevant to trust or history but may not affect the current product.",
      userFacingReason:
        "This product or brand has a historical recall signal. Truthlabel flags this for review, but it may not apply to the current product or batch.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [
        "FDA_RECALLS_MARKET_WITHDRAWALS_SAFETY_ALERTS",
        "FDA_ENFORCEMENT_REPORTS",
        "USDA_FSIS_RECALLS_PUBLIC_HEALTH_ALERTS",
      ],
      matchingNotes:
        "Show date, recall reason, and affected lots if available. Do not imply current danger if the recall is resolved.",
    },
    {
      id: "public_health_alert",
      mainName: "Public Health Alert",
      signalType: "public_health_alert",
      dataSourceType: "public_health_alert",
      detectionBasis: "official_database",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "red",
      redOnlyWhenVerified: true,
      reason:
        "Official public health alert signal for a product or product group.",
      userFacingReason:
        "This product has an official public health alert signal. Truthlabel flags this as a serious safety review item.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [
        "USDA_FSIS_RECALLS_PUBLIC_HEALTH_ALERTS",
        "FDA_RECALLS_MARKET_WITHDRAWALS_SAFETY_ALERTS",
      ],
      matchingNotes:
        "Use official alert scope. Public health alerts may not always be recalls but should still be shown clearly.",
    },
    {
      id: "undeclared_allergen_recall",
      mainName: "Undeclared Allergen Recall",
      signalType: "undeclared_allergen",
      dataSourceType: "official_recall",
      detectionBasis: "official_database",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["allergy_risk", "lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "red",
      redOnlyWhenVerified: true,
      reason:
        "Official recall or alert because a product contains an undeclared allergen.",
      userFacingReason:
        "This product has an undeclared allergen recall or alert signal. Truthlabel flags this as a serious label safety concern.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [
        "FDA_RECALLS_MARKET_WITHDRAWALS_SAFETY_ALERTS",
        "USDA_FSIS_RECALLS_PUBLIC_HEALTH_ALERTS",
      ],
      matchingNotes:
        "If the undeclared allergen matches the user's allergy profile, make the warning especially prominent later. Do not claim all batches are affected unless the official recall scope confirms it.",
    },
    {
      id: "pathogen_contamination_recall",
      mainName: "Pathogen Contamination Recall",
      signalType: "pathogen_contamination",
      dataSourceType: "official_recall",
      detectionBasis: "official_database",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "red",
      redOnlyWhenVerified: true,
      reason:
        "Official recall or alert for possible pathogen contamination.",
      userFacingReason:
        "This product has an official contamination recall or alert signal. Truthlabel flags this as a serious safety concern based on external data.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [
        "FDA_RECALLS_MARKET_WITHDRAWALS_SAFETY_ALERTS",
        "USDA_FSIS_RECALLS_PUBLIC_HEALTH_ALERTS",
      ],
      matchingNotes:
        "Possible pathogens may include Salmonella, E. coli, Listeria, botulinum-related concerns, or others. Do not add scary detail; show the official reason plainly.",
    },
    {
      id: "foreign_material_recall",
      mainName: "Foreign Material Recall",
      signalType: "foreign_material",
      dataSourceType: "official_recall",
      detectionBasis: "official_database",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "red",
      redOnlyWhenVerified: true,
      reason:
        "Official recall or alert because of possible foreign material contamination.",
      userFacingReason:
        "This product has an official foreign-material recall or alert signal. Truthlabel flags this as a serious safety review item.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [
        "FDA_RECALLS_MARKET_WITHDRAWALS_SAFETY_ALERTS",
        "USDA_FSIS_RECALLS_PUBLIC_HEALTH_ALERTS",
      ],
      matchingNotes:
        "Do not add graphic detail. Use official recall wording and affected scope.",
    },
    {
      id: "heavy_metal_recall_warning",
      mainName: "Heavy Metal Recall / Warning",
      signalType: "heavy_metal_warning",
      dataSourceType: "official_recall",
      detectionBasis: "official_database",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["heavy_metals", "lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "red",
      redOnlyWhenVerified: true,
      reason:
        "Official recall, warning, or verified testing signal related to lead, arsenic, cadmium, mercury, or other heavy metal concerns.",
      userFacingReason:
        "This product has an official heavy-metal warning or recall signal. Truthlabel flags this as a serious safety concern based on external data.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Only trigger red from official recall or warning or verified product-specific testing data.",
    },
    {
      id: "chemical_contamination_recall",
      mainName: "Chemical Contamination Recall",
      signalType: "chemical_contamination",
      dataSourceType: "official_recall",
      detectionBasis: "official_database",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "red",
      redOnlyWhenVerified: true,
      reason:
        "Official recall or alert for chemical contamination or excess chemical residue.",
      userFacingReason:
        "This product has an official chemical-contamination recall or alert signal. Truthlabel flags this as a serious safety review item.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: ["FDA_RECALLS_MARKET_WITHDRAWALS_SAFETY_ALERTS"],
      matchingNotes:
        "Only use official or verified data. Do not infer chemical contamination from ingredients alone.",
    },
    {
      id: "misbranding_labeling_recall",
      mainName: "Misbranding / Labeling Recall",
      signalType: "misbranding_labeling",
      dataSourceType: "official_recall",
      detectionBasis: "official_database",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "yellow",
      redOnlyWhenVerified: true,
      reason:
        "Official recall or alert for misbranding, incorrect labeling, or label mismatch.",
      userFacingReason:
        "This product has a misbranding or labeling recall signal. Truthlabel flags this as a label trust review item.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [
        "FDA_RECALLS_MARKET_WITHDRAWALS_SAFETY_ALERTS",
        "USDA_FSIS_RECALLS_PUBLIC_HEALTH_ALERTS",
      ],
      matchingNotes:
        "May become red if the misbranding includes undeclared allergens, wrong ingredients, or serious safety relevance.",
    },
    {
      id: "active_outbreak_investigation",
      mainName: "Active Outbreak Investigation",
      signalType: "outbreak_investigation",
      dataSourceType: "outbreak_notice",
      detectionBasis: "official_database",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "red",
      redOnlyWhenVerified: true,
      reason:
        "Official active outbreak investigation linked to a product, brand, facility, or food category.",
      userFacingReason:
        "This product, brand, or category has an active outbreak investigation signal. Truthlabel flags this as a serious safety review item based on external data.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: ["CDC_FOODBORNE_OUTBREAKS"],
      matchingNotes:
        "Only trigger from official public health sources. Use careful wording if the source says the investigation is ongoing.",
    },
    {
      id: "warning_letter_regulatory_enforcement",
      mainName: "Warning Letter / Regulatory Enforcement Signal",
      signalType: "regulatory_enforcement",
      dataSourceType: "warning_letter",
      detectionBasis: "official_database",
      affectedScope: "company_level",
      linkedExistingPackIds: ["brand_trust_safety"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "yellow",
      redOnlyWhenVerified: true,
      reason:
        "Official regulatory warning or enforcement signal related to manufacturing, labeling, quality, contamination, or safety practices.",
      userFacingReason:
        "This brand or company has a regulatory warning or enforcement signal. Truthlabel flags this as a brand trust review item.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: ["FDA_WARNING_LETTERS"],
      matchingNotes:
        "Do not apply a company-level warning to every product as red unless the official source directly links the issue to the product.",
    },
    {
      id: "repeated_recall_history",
      mainName: "Repeated Recall History",
      signalType: "repeated_recalls",
      dataSourceType: "enforcement_report",
      detectionBasis: "brand_product_match",
      affectedScope: "brand_level",
      linkedExistingPackIds: ["brand_trust_safety", "lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "yellow",
      redOnlyWhenVerified: true,
      reason:
        "Brand or company has multiple recall signals within a defined time window.",
      userFacingReason:
        "This brand has repeated recall history in available external data. Truthlabel flags this as a brand trust review item.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [
        "FDA_ENFORCEMENT_REPORTS",
        "FOODSAFETY_GOV_RECALLS",
        "COMPANY_RECALL_PAGES",
      ],
      matchingNotes:
        "Rules later should define the time window and threshold, such as two or more relevant recalls in 24 months. Do not create this from one recall.",
    },
    {
      id: "product_specific_lawsuit_allegation",
      mainName: "Product-Specific Lawsuit Allegation",
      signalType: "lawsuit_allegation",
      dataSourceType: "lawsuit",
      detectionBasis: "external_dataset",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "yellow",
      redOnlyWhenVerified: true,
      reason: "Product-specific lawsuit allegation exists in external data.",
      userFacingReason:
        "This product has a lawsuit allegation signal. Truthlabel flags this for review, but allegations are not proof unless confirmed by a court decision, settlement, or verified official finding.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: ["COURT_RECORDS", "CLASS_ACTION_DATABASES"],
      matchingNotes:
        "Do not treat lawsuit allegations as proven facts. Show case status and source when available.",
    },
    {
      id: "brand_level_lawsuit_allegation",
      mainName: "Brand-Level Lawsuit Allegation",
      signalType: "lawsuit_allegation",
      dataSourceType: "lawsuit",
      detectionBasis: "external_dataset",
      affectedScope: "brand_level",
      linkedExistingPackIds: ["lawsuits_recalls", "brand_trust_safety"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "yellow",
      redOnlyWhenVerified: true,
      reason: "Brand-level lawsuit allegation exists in external data.",
      userFacingReason:
        "This brand has a lawsuit allegation signal. Truthlabel flags this as a brand trust review item, not proof that this specific product is unsafe.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: ["COURT_RECORDS", "CLASS_ACTION_DATABASES"],
      matchingNotes:
        "Brand-level lawsuits should not automatically make every product red.",
    },
    {
      id: "settlement_court_confirmed_signal",
      mainName: "Settlement / Court-Confirmed Safety Signal",
      signalType: "settlement_or_court_confirmed",
      dataSourceType: "settlement",
      detectionBasis: "external_dataset",
      affectedScope: "brand_level",
      linkedExistingPackIds: ["lawsuits_recalls", "brand_trust_safety"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "yellow",
      redOnlyWhenVerified: true,
      reason:
        "Settlement or court-confirmed signal exists in external data.",
      userFacingReason:
        "This brand or product has a settlement or court-confirmed legal signal. Truthlabel flags this as a trust review item and should show the exact issue and date when available.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: ["COURT_RECORDS", "CLASS_ACTION_DATABASES"],
      matchingNotes:
        "Do not imply admission of guilt unless settlement or court records explicitly say so.",
    },
    {
      id: "third_party_product_testing_concern",
      mainName: "Third-Party Product Testing Concern",
      signalType: "third_party_testing",
      dataSourceType: "third_party_testing",
      detectionBasis: "external_dataset",
      affectedScope: "specific_product",
      linkedExistingPackIds: [
        "heavy_metals",
        "microplastics",
        "lawsuits_recalls",
      ],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "yellow",
      redOnlyWhenVerified: true,
      reason:
        "Third-party testing signal exists for product safety or contaminant review.",
      userFacingReason:
        "This product has a third-party testing signal. Truthlabel flags this for review and should show the test source, date, and result when available.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: ["THIRD_PARTY_TESTING_REPORTS"],
      matchingNotes:
        "Third-party testing can be useful but should not outrank official data. Severity depends on source quality and the actual result.",
    },
    {
      id: "brand_transparency_disclosure",
      mainName: "Brand Transparency Disclosure",
      signalType: "brand_disclosure",
      dataSourceType: "brand_disclosure",
      detectionBasis: "external_dataset",
      affectedScope: "brand_level",
      linkedExistingPackIds: ["brand_trust_safety"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "yellow",
      redOnlyWhenVerified: true,
      reason:
        "Brand provides transparency disclosures such as ingredient sourcing, COAs, testing reports, allergen protocols, or manufacturing details.",
      userFacingReason:
        "This brand has transparency information available. Truthlabel records this as brand trust context, not as proof the product is safer.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: ["BRAND_COA_DOCUMENTS", "COMPANY_RECALL_PAGES"],
      matchingNotes:
        "Do not mark green just because a brand provides marketing claims. Use verified documents only.",
    },
    {
      id: "missing_brand_product_safety_data",
      mainName: "Missing Brand / Product Safety Data",
      signalType: "missing_data",
      dataSourceType: "news_report",
      detectionBasis: "manual_review",
      affectedScope: "brand_level",
      linkedExistingPackIds: ["brand_trust_safety"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "yellow",
      redOnlyWhenVerified: true,
      reason: "Brand or product safety data is missing or not available.",
      userFacingReason:
        "Truthlabel could not confirm brand or product safety history from available external data. Missing data is not proof of safety or danger.",
      dataStatus: "starter",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Only show this when the user asks for brand trust detail. Do not clutter the main scan result.",
    },
    {
      id: "user_reported_concern",
      mainName: "User-Reported Concern",
      signalType: "user_report",
      dataSourceType: "user_report",
      detectionBasis: "external_dataset",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["brand_trust_safety"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "yellow",
      redOnlyWhenVerified: true,
      reason: "User-submitted concern exists but is not verified.",
      userFacingReason:
        "Truthlabel has a user-reported concern for this product. This is not verified and should be treated as review information only.",
      dataStatus: "starter",
      confidenceLevel: "low",
      sourceRefs: ["USER_REPORTS"],
      matchingNotes:
        "Never show user reports as red unless independently verified by official or high-confidence external data.",
    },
    {
      id: "clean_official_recall_check",
      mainName: "Clean Official Recall Check",
      signalType: "clean_recall_check",
      dataSourceType: "official_recall",
      detectionBasis: "official_database",
      affectedScope: "specific_product",
      linkedExistingPackIds: ["lawsuits_recalls"],
      categoryTags: ["brand_trust_safety"],
      basicSeveritySuggestion: "green",
      redOnlyWhenVerified: true,
      reason:
        "No official recall signal found in checked databases at the time of lookup.",
      userFacingReason:
        "No official recall signal was found in the checked sources at the time of lookup. This does not guarantee the product is risk-free.",
      dataStatus: "needs_external_data",
      confidenceLevel: null,
      sourceRefs: [
        "FDA_RECALLS_MARKET_WITHDRAWALS_SAFETY_ALERTS",
        "FDA_ENFORCEMENT_REPORTS",
        "USDA_FSIS_RECALLS_PUBLIC_HEALTH_ALERTS",
      ],
      matchingNotes:
        "Only show if the system actually performed a current lookup. Do not show green from absence of local static data.",
    },
  ] satisfies BrandTrustSafetySignalItem[],

  externalDataSourcesToSupportLater: [
    "FDA_RECALLS_MARKET_WITHDRAWALS_SAFETY_ALERTS",
    "FDA_ENFORCEMENT_REPORTS",
    "FDA_WARNING_LETTERS",
    "USDA_FSIS_RECALLS_PUBLIC_HEALTH_ALERTS",
    "CDC_FOODBORNE_OUTBREAKS",
    "FOODSAFETY_GOV_RECALLS",
    "COMPANY_RECALL_PAGES",
    "COURT_RECORDS",
    "CLASS_ACTION_DATABASES",
    "THIRD_PARTY_TESTING_REPORTS",
    "BRAND_COA_DOCUMENTS",
    "USER_REPORTS",
  ],

  matchingRules: [
    "This category should not rely only on ingredient text.",
    "Use matching keys later such as barcode, GTIN, UPC, product name, brand name, parent company, lot code, batch number, best-before date, manufacture date, facility name, region, recall identifier, official recall URL, case number for lawsuits, source date, and event status.",
    "Normalize lowercase text, remove punctuation, collapse spaces, normalize brand names, UPC or GTIN or barcode formats, lot and batch code formatting, date formats, and company aliases or parent-company names.",
  ],

  falsePositiveGuards: [
    "Do not apply a recall to all products from a brand unless the official recall scope says so.",
    "Do not apply a batch recall when the user's product batch is unknown without saying the batch match is unconfirmed.",
    "Do not treat a lawsuit allegation as proven.",
    "Do not treat a news article as equal to an official recall.",
    "Do not mark green unless a current lookup was actually performed.",
    "Do not claim no recalls ever unless a verified historical lookup supports it.",
    "Do not show user reports as verified safety facts.",
  ],

  classificationRules: [
    "Official active recalls and public health alerts should be treated as serious red signals when the product, batch, or barcode match is verified.",
    "Historical recalls, lawsuit allegations, repeated recall history, warning letters, and transparency disclosures default to yellow review context.",
    "This category should add external trust and safety context only. It should not override ingredient-based warnings.",
    "Green should only appear when a real current lookup was performed and no official recall signal was found in checked sources.",
  ],

  displayRulesForLater: {
    notChecked: {
      severity: "yellow",
      display: "Not checked",
    },
    noSignalFound: {
      severity: "green",
      display:
        "No official recall signal found in checked sources at the time of lookup. This does not guarantee the product is risk-free.",
    },
    activeOfficialSignal: {
      severity: "red",
      display:
        "Official recall or public health alert found for this product or batch. Check the affected lot and date details.",
    },
    historicalRecall: {
      severity: "yellow",
      display:
        "Historical recall found. This may not apply to the current product or batch.",
    },
    lawsuitAllegation: {
      severity: "yellow",
      display:
        "Lawsuit allegation found. This is not proof unless confirmed by court decision, settlement, or official finding.",
    },
    repeatedRecallHistory: {
      severity: "yellow",
      display: "Repeated recall history found in available external data.",
    },
  },
};

export type BrandTrustSafetyRecallsLawsuitsDataPack =
  typeof brandTrustSafetyRecallsLawsuitsDataPack;
export type BrandTrustSafetyRecallsLawsuitsSignalItem =
  (typeof brandTrustSafetyRecallsLawsuitsDataPack.items)[number];
