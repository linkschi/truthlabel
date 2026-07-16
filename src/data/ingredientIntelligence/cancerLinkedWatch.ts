export type CancerLinkedWatchBasicSeveritySuggestion = "yellow" | "red";

export type CancerLinkedWatchDataStatus =
  | "starter"
  | "verified_core"
  | "needs_expansion"
  | "needs_region_verification";

export type CancerLinkedWatchConfidenceLevel =
  | "high"
  | "medium"
  | "low"
  | null;

export type CancerLinkedWatchCategoryTag = "cancer_linked_watch";

export type CancerLinkedWatchReasonType =
  | "regulatory_cancer_related_revocation"
  | "genotoxicity_concern"
  | "iarc_possible_carcinogen"
  | "animal_study_cancer_concern"
  | "processed_meat_nitrosamine_context"
  | "banned_restricted_flavouring_cancer_concern"
  | "banned_restricted_flavouring_concern"
  | "banned_restricted_botanical_concern"
  | "processing_byproduct_review"
  | "smoke_processing_review"
  | "processed_meat_context";

export type CancerLinkedWatchItem = {
  id: string;
  canonicalIngredientId: string;
  linkedIngredientId: string | null;
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
  linkedExistingPackIds: string[];
  categoryTags: CancerLinkedWatchCategoryTag[];
  basicSeveritySuggestion: CancerLinkedWatchBasicSeveritySuggestion;
  cancerWatchReasonType: CancerLinkedWatchReasonType;
  reason: string;
  userFacingReason: string;
  dataStatus: CancerLinkedWatchDataStatus;
  confidenceLevel: CancerLinkedWatchConfidenceLevel;
  sourceRefs: string[];
  matchingNotes: string;
};

export const cancerLinkedWatchDataPack = {
  id: "cancer_linked_watch",
  categoryName: "Cancer-linked Watch",
  categoryMeaning:
    "This category tracks ingredients or additive systems that carry cancer-related watch signals such as regulatory concern, genotoxicity concern, IARC-style hazard discussion, animal-study carcinogenicity concern, processed-meat nitrosamine context, or overlap with existing banned/restricted items. Truthlabel uses this as a careful review watchlist, not as a claim that one product causes cancer.",
  dataStatus: "starter_needs_expansion",
  defaultCategorySeverity: "yellow",

  items: [
    {
      id: "erythrosine_red_no_3",
      canonicalIngredientId: "erythrosine",
      linkedIngredientId: "erythrosine",
      mainName: "Erythrosine / Red No. 3",
      otherNames: [
        "Red No. 3",
        "Red 3",
        "FD&C Red No. 3",
        "FD&C Red 3",
        "Erythrosine",
        "Acid Red 51",
        "Food Red 14",
        "CI 45430",
      ],
      chemicalNames: ["Tetraiodofluorescein disodium salt"],
      brandNames: [],
      eNumbers: ["E127", "E-127"],
      insNumbers: ["127", "INS 127"],
      abbreviations: [],
      labelVariants: [
        "Artificial colour E127",
        "Artificial color E127",
        "Colour added: erythrosine",
        "Color added: erythrosine",
      ],
      spellingVariants: ["Colour", "Color"],
      regionalNames: [],
      linkedExistingPackIds: [
        "artificial_colours:erythrosine",
        "banned_restricted_items:erythrosine_red_no_3",
        "harmful_additives:erythrosine_red_no_3",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "red",
      cancerWatchReasonType: "regulatory_cancer_related_revocation",
      reason:
        "Food colour additive with cancer-related regulatory revocation or restriction in some regions.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because it has cancer-related regulatory concern and has been revoked or restricted for food use in some regions.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: ["FDA_RED_3_2025", "CALIFORNIA_AB_418"],
      matchingNotes:
        "Reuse alias coverage from Artificial Colours, Banned / Restricted Items, and Harmful Additives. Do not double count if Red No. 3 and E127 appear together.",
    },
    {
      id: "titanium_dioxide_e171",
      canonicalIngredientId: "titanium_dioxide",
      linkedIngredientId: "titanium_dioxide",
      mainName: "Titanium Dioxide / E171",
      otherNames: [
        "Titanium dioxide",
        "Titanium dioxide colour",
        "Titanium dioxide color",
        "CI 77891",
        "Titanium white",
        "CI Pigment White 6",
      ],
      chemicalNames: ["Titanium(IV) oxide"],
      brandNames: [],
      eNumbers: ["E171", "E-171"],
      insNumbers: ["171", "INS 171"],
      abbreviations: [],
      labelVariants: [
        "Colour added: titanium dioxide",
        "Color added: titanium dioxide",
        "Food colour E171",
        "Food color E171",
      ],
      spellingVariants: ["Colour", "Color"],
      regionalNames: [],
      linkedExistingPackIds: [
        "artificial_colours:titanium_dioxide",
        "banned_restricted_items:titanium_dioxide_e171",
        "harmful_additives:titanium_dioxide_e171",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "red",
      cancerWatchReasonType: "genotoxicity_concern",
      reason:
        "Food colour additive with official genotoxicity concern in some regions.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because some regulators raised genotoxicity concerns for food use.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: ["EFSA_E171_2021", "EU_E171_BAN_2022"],
      matchingNotes:
        "Reuse alias coverage from Artificial Colours, Banned / Restricted Items, and Harmful Additives. Do not double count if titanium dioxide and E171 appear together.",
    },
    {
      id: "potassium_bromate",
      canonicalIngredientId: "potassium_bromate",
      linkedIngredientId: "potassium_bromate",
      mainName: "Potassium Bromate",
      otherNames: [
        "Potassium bromate",
        "Bromic acid potassium salt",
        "Bromate",
        "Potassium salt of bromic acid",
        "Bromated flour",
      ],
      chemicalNames: ["Potassium bromate"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Contains potassium bromate",
        "Made with bromated flour",
        "Flour improver: potassium bromate",
      ],
      spellingVariants: [],
      regionalNames: [],
      linkedExistingPackIds: ["banned_restricted_items:potassium_bromate"],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "red",
      cancerWatchReasonType: "iarc_possible_carcinogen",
      reason:
        "Flour treatment additive with cancer-hazard concern and banned/restricted status in some regions.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because it has cancer-hazard concern signals and restricted status in some regions.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: ["IARC_POTASSIUM_BROMATE_1999"],
      matchingNotes:
        "Reuse alias coverage from Banned / Restricted Items where available. Match bromated flour and potassium bromate as the same canonical ingredient.",
    },
    {
      id: "bha",
      canonicalIngredientId: "bha",
      linkedIngredientId: "bha",
      mainName: "BHA",
      otherNames: [
        "BHA",
        "Butylated hydroxyanisole",
        "Butyl hydroxyanisole",
        "tert-butyl-4-hydroxyanisole",
        "tertiary butylhydroxyanisole",
      ],
      chemicalNames: ["Butylated hydroxyanisole"],
      brandNames: [],
      eNumbers: ["E320", "E-320"],
      insNumbers: ["320", "INS 320"],
      abbreviations: ["BHA"],
      labelVariants: [
        "Antioxidant BHA",
        "Preservative E320",
        "Synthetic antioxidant BHA",
      ],
      spellingVariants: [],
      regionalNames: [],
      linkedExistingPackIds: [
        "preservatives_shelf_life_systems:bha",
        "harmful_additives:bha",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "yellow",
      cancerWatchReasonType: "animal_study_cancer_concern",
      reason:
        "Synthetic antioxidant preservative with animal-study cancer concern signals.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because it has animal-study cancer concern signals. Truthlabel flags it for review, not as proof that the product causes cancer.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: ["NTP_BHA_REPORT_ON_CARCINOGENS"],
      matchingNotes:
        "Reuse alias coverage from Preservatives & Shelf-Life Systems and Harmful Additives. Do not double count if BHA and E320 appear together.",
    },
    {
      id: "sodium_nitrite",
      canonicalIngredientId: "sodium_nitrite",
      linkedIngredientId: "sodium_nitrite",
      mainName: "Sodium Nitrite",
      otherNames: [
        "Sodium nitrite",
        "Nitrite",
        "Nitrite curing salt",
        "Cure salt",
        "Pink curing salt",
        "Prague powder #1",
        "Prague powder No. 1",
        "Cure #1",
        "Cure No. 1",
      ],
      chemicalNames: ["Sodium nitrite"],
      brandNames: [],
      eNumbers: ["E250", "E-250"],
      insNumbers: ["250", "INS 250"],
      abbreviations: [],
      labelVariants: [
        "Curing preservative E250",
        "Contains sodium nitrite",
        "Nitrite cure added",
      ],
      spellingVariants: [],
      regionalNames: [],
      linkedExistingPackIds: [
        "preservatives_shelf_life_systems:sodium_nitrite",
        "harmful_additives:sodium_nitrite",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "yellow",
      cancerWatchReasonType: "processed_meat_nitrosamine_context",
      reason:
        "Curing preservative used in processed meats; relevant to processed-meat and nitrosamine concern context.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because nitrite-cured processed meat is part of a cancer-concern discussion. Truthlabel flags this as a review concern, not proof of harm from one product.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: ["WHO_IARC_PROCESSED_MEAT_2015"],
      matchingNotes:
        "Reuse alias coverage from Preservatives & Shelf-Life Systems and Harmful Additives. Match sodium nitrite, nitrite curing salt, cure salt, and E250 as one item.",
    },
    {
      id: "potassium_nitrite",
      canonicalIngredientId: "potassium_nitrite",
      linkedIngredientId: "potassium_nitrite",
      mainName: "Potassium Nitrite",
      otherNames: [
        "Potassium nitrite",
        "Nitrite curing agent",
        "Potassium nitrite curing salt",
      ],
      chemicalNames: ["Potassium nitrite"],
      brandNames: [],
      eNumbers: ["E249", "E-249"],
      insNumbers: ["249", "INS 249"],
      abbreviations: [],
      labelVariants: [
        "Curing preservative E249",
        "Contains potassium nitrite",
        "Nitrite cure added",
      ],
      spellingVariants: [],
      regionalNames: [],
      linkedExistingPackIds: [
        "preservatives_shelf_life_systems:potassium_nitrite",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "yellow",
      cancerWatchReasonType: "processed_meat_nitrosamine_context",
      reason:
        "Curing preservative used in processed meats; relevant to processed-meat and nitrosamine concern context.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because nitrite-cured processed meat is part of a cancer-concern discussion. Truthlabel flags this as a review concern.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: ["WHO_IARC_PROCESSED_MEAT_2015"],
      matchingNotes:
        "Reuse alias coverage from Preservatives & Shelf-Life Systems. Match potassium nitrite and E249 as the same canonical ingredient.",
    },
    {
      id: "sodium_nitrate",
      canonicalIngredientId: "sodium_nitrate",
      linkedIngredientId: "sodium_nitrate",
      mainName: "Sodium Nitrate",
      otherNames: [
        "Sodium nitrate",
        "Nitrate",
        "Chile saltpetre",
        "Chile saltpeter",
        "Nitrate curing salt",
      ],
      chemicalNames: ["Sodium nitrate"],
      brandNames: [],
      eNumbers: ["E251", "E-251"],
      insNumbers: ["251", "INS 251"],
      abbreviations: [],
      labelVariants: [
        "Curing preservative E251",
        "Contains sodium nitrate",
        "Nitrate cure added",
      ],
      spellingVariants: ["Saltpetre", "Saltpeter"],
      regionalNames: [],
      linkedExistingPackIds: [
        "preservatives_shelf_life_systems:sodium_nitrate",
        "harmful_additives:sodium_nitrate",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "yellow",
      cancerWatchReasonType: "processed_meat_nitrosamine_context",
      reason:
        "Curing preservative used in some processed meats; relevant to processed-meat/nitrosamine concern context.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because nitrate-cured processed meat can be part of a cancer-concern discussion. Truthlabel flags this as a review concern.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: ["WHO_IARC_PROCESSED_MEAT_2015"],
      matchingNotes:
        "Reuse alias coverage from Preservatives & Shelf-Life Systems and Harmful Additives. Match sodium nitrate, nitrate curing salt, and E251 as one item.",
    },
    {
      id: "potassium_nitrate",
      canonicalIngredientId: "potassium_nitrate",
      linkedIngredientId: "potassium_nitrate",
      mainName: "Potassium Nitrate",
      otherNames: [
        "Potassium nitrate",
        "Saltpetre",
        "Saltpeter",
        "Nitre",
        "Niter",
        "Prague powder #2",
        "Prague powder No. 2",
        "Cure #2",
        "Cure No. 2",
      ],
      chemicalNames: ["Potassium nitrate"],
      brandNames: [],
      eNumbers: ["E252", "E-252"],
      insNumbers: ["252", "INS 252"],
      abbreviations: [],
      labelVariants: [
        "Curing preservative E252",
        "Contains potassium nitrate",
        "Nitrate cure added",
      ],
      spellingVariants: ["Saltpetre", "Saltpeter"],
      regionalNames: [],
      linkedExistingPackIds: [
        "preservatives_shelf_life_systems:potassium_nitrate",
        "harmful_additives:potassium_nitrate",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "yellow",
      cancerWatchReasonType: "processed_meat_nitrosamine_context",
      reason:
        "Curing preservative used in some processed meats; relevant to processed-meat/nitrosamine concern context.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because nitrate-cured processed meat can be part of a cancer-concern discussion. Truthlabel flags this as a review concern.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: ["WHO_IARC_PROCESSED_MEAT_2015"],
      matchingNotes:
        "Reuse alias coverage from Preservatives & Shelf-Life Systems and Harmful Additives. Match potassium nitrate, saltpetre/saltpeter, and E252 as one item.",
    },
    {
      id: "safrole",
      canonicalIngredientId: "safrole",
      linkedIngredientId: "safrole",
      mainName: "Safrole",
      otherNames: ["Safrole", "Sassafras oil", "Oil of sassafras"],
      chemicalNames: ["4-Allyl-1,2-methylenedioxybenzene"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Contains safrole",
        "Sassafras oil added",
        "Flavoring: sassafras oil",
      ],
      spellingVariants: ["Flavoring", "Flavouring"],
      regionalNames: [],
      linkedExistingPackIds: [
        "flavour_enhancers_flavourings:safrole",
        "banned_restricted_items:safrole",
        "harmful_additives:safrole",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "red",
      cancerWatchReasonType: "banned_restricted_flavouring_cancer_concern",
      reason:
        "Flavouring-related substance with banned/restricted status and cancer-related concern signals in some regions.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because it has been treated as a serious flavouring safety concern in some regions.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Reuse alias coverage from Flavour Enhancers / Flavourings, Banned / Restricted Items, and Harmful Additives. Match safrole and sassafras oil as the same ingredient.",
    },
    {
      id: "coumarin_added_tonka",
      canonicalIngredientId: "coumarin_added",
      linkedIngredientId: "coumarin_added",
      mainName: "Added Coumarin / Tonka Bean Extract",
      otherNames: [
        "Coumarin",
        "Added coumarin",
        "Tonka bean",
        "Tonka bean extract",
        "Tonka extract",
      ],
      chemicalNames: ["1,2-Benzopyrone", "Benzopyrone"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Contains added coumarin",
        "Tonka extract added",
        "Flavoring: tonka bean extract",
      ],
      spellingVariants: ["Flavoring", "Flavouring"],
      regionalNames: [],
      linkedExistingPackIds: [
        "flavour_enhancers_flavourings:added_coumarin_tonka",
        "banned_restricted_items:coumarin_added_tonka",
        "harmful_additives:coumarin_added_tonka",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "red",
      cancerWatchReasonType: "banned_restricted_flavouring_concern",
      reason:
        "Flavouring-related substance with restricted status when added directly in some regions.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because added coumarin or tonka bean extract has restricted food-use status in some regions.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Reuse alias coverage from Flavour Enhancers / Flavourings, Banned / Restricted Items, and Harmful Additives. Do not confuse this with natural trace coumarin in cinnamon.",
    },
    {
      id: "calamus_sweet_flag",
      canonicalIngredientId: "calamus",
      linkedIngredientId: "calamus",
      mainName: "Calamus / Sweet Flag",
      otherNames: ["Calamus", "Sweet flag", "Acorus calamus", "Calamus oil"],
      chemicalNames: ["Acorus calamus"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Contains calamus",
        "Contains sweet flag",
        "Flavoring: calamus oil",
      ],
      spellingVariants: ["Flavoring", "Flavouring"],
      regionalNames: [],
      linkedExistingPackIds: [
        "flavour_enhancers_flavourings:calamus_sweet_flag",
        "banned_restricted_items:calamus_sweet_flag",
        "harmful_additives:calamus_sweet_flag",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "red",
      cancerWatchReasonType: "banned_restricted_botanical_concern",
      reason:
        "Botanical flavouring-related ingredient with restricted food-use status in some regions.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because it has been treated as a serious botanical flavouring concern in some regions.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Reuse alias coverage from Flavour Enhancers / Flavourings, Banned / Restricted Items, and Harmful Additives. Match calamus, sweet flag, and Acorus calamus together.",
    },
    {
      id: "cinnamyl_anthranilate",
      canonicalIngredientId: "cinnamyl_anthranilate",
      linkedIngredientId: "cinnamyl_anthranilate",
      mainName: "Cinnamyl Anthranilate",
      otherNames: [
        "Cinnamyl anthranilate",
        "Cinnamyl anthranilate flavour",
        "Cinnamyl anthranilate flavor",
      ],
      chemicalNames: [
        "Cinnamyl 2-aminobenzoate",
        "Cinnamyl o-aminobenzoate",
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Contains cinnamyl anthranilate",
        "Flavoring: cinnamyl anthranilate",
      ],
      spellingVariants: ["Flavor", "Flavour", "Flavoring", "Flavouring"],
      regionalNames: [],
      linkedExistingPackIds: [
        "flavour_enhancers_flavourings:cinnamyl_anthranilate",
        "banned_restricted_items:cinnamyl_anthranilate",
        "harmful_additives:cinnamyl_anthranilate",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "red",
      cancerWatchReasonType: "banned_restricted_flavouring_cancer_concern",
      reason:
        "Flavouring substance with banned/restricted status and cancer-related concern signals in some regions.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch because it has been treated as a serious flavouring safety concern in some regions.",
      dataStatus: "needs_region_verification",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Reuse alias coverage from Flavour Enhancers / Flavourings, Banned / Restricted Items, and Harmful Additives. Match cinnamyl anthranilate and chemical-name variants as one item.",
    },
    {
      id: "caramel_colour_iii_iv",
      canonicalIngredientId: "caramel_colour_iii_iv",
      linkedIngredientId: null,
      mainName: "Caramel Colour III / IV",
      otherNames: [
        "Caramel colour III",
        "Caramel color III",
        "Ammonia caramel",
        "Caramel colour IV",
        "Caramel color IV",
        "Sulphite ammonia caramel",
        "Sulfite ammonia caramel",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: ["E150c", "E-150c", "E150d", "E-150d"],
      insNumbers: ["150c", "INS 150c", "150d", "INS 150d"],
      abbreviations: [],
      labelVariants: [
        "Colour added: caramel IV",
        "Color added: caramel IV",
        "Ammonia caramel colour",
        "Sulphite ammonia caramel colour",
      ],
      spellingVariants: [
        "Colour",
        "Color",
        "Sulphite",
        "Sulfite",
      ],
      regionalNames: [],
      linkedExistingPackIds: [
        "artificial_colours:caramel_iii",
        "artificial_colours:caramel_iv",
        "harmful_additives:caramel_colour_iii_iv",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "yellow",
      cancerWatchReasonType: "processing_byproduct_review",
      reason:
        "Industrial caramel colour systems sometimes discussed because of processing byproduct concerns.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch as a processing-byproduct review item. Truthlabel flags it for review, not as proof that the product causes cancer.",
      dataStatus: "needs_expansion",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Reuse alias coverage from Artificial Colours and Harmful Additives. Do not double count if both the plain name and E-number appear together.",
    },
    {
      id: "smoke_flavourings",
      canonicalIngredientId: "smoke_flavourings",
      linkedIngredientId: "smoke_flavourings",
      mainName: "Smoked / Smoke Flavouring",
      otherNames: [
        "Smoke flavouring",
        "Smoke flavoring",
        "Smoked flavour",
        "Smoked flavor",
        "Natural smoke flavour",
        "Natural smoke flavor",
        "Liquid smoke",
        "Smoke extract",
      ],
      chemicalNames: ["Smoke condensate", "Primary smoke condensate"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Flavouring: smoke flavour",
        "Flavoring: smoke flavor",
        "Natural smoke flavour added",
        "Natural smoke flavor added",
      ],
      spellingVariants: ["Flavor", "Flavour", "Flavoring", "Flavouring"],
      regionalNames: [],
      linkedExistingPackIds: [
        "flavour_enhancers_flavourings:smoke_flavourings",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "yellow",
      cancerWatchReasonType: "smoke_processing_review",
      reason:
        "Smoke flavouring or smoke-derived ingredients may need review because smoke-processing can involve compounds of concern depending on source and process.",
      userFacingReason:
        "This ingredient is on Truthlabel's Cancer-linked Watch as a smoke-processing review item. Truthlabel flags it for review, not as proof that the product causes cancer.",
      dataStatus: "needs_expansion",
      confidenceLevel: null,
      sourceRefs: [],
      matchingNotes:
        "Reuse alias coverage from Flavour Enhancers / Flavourings. Match smoke flavour/flavor, natural smoke flavour/flavor, liquid smoke, and smoke extract together.",
    },
    {
      id: "processed_meat_curing_system",
      canonicalIngredientId: "processed_meat_curing_system",
      linkedIngredientId: null,
      mainName: "Processed Meat Curing System",
      otherNames: [
        "Cured meat",
        "Curing salt",
        "Nitrite cured",
        "Nitrate cured",
        "Smoked meat",
        "Processed meat",
        "Bacon curing",
        "Ham curing",
        "Salami curing",
        "Sausage curing",
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Nitrite cured meat",
        "Nitrate cured meat",
        "Smoked processed meat",
      ],
      spellingVariants: [],
      regionalNames: [],
      linkedExistingPackIds: [
        "meat_specific_concerns",
        "preservatives_shelf_life_systems:sodium_nitrite",
        "preservatives_shelf_life_systems:potassium_nitrite",
        "preservatives_shelf_life_systems:sodium_nitrate",
        "preservatives_shelf_life_systems:potassium_nitrate",
      ],
      categoryTags: ["cancer_linked_watch"],
      basicSeveritySuggestion: "yellow",
      cancerWatchReasonType: "processed_meat_context",
      reason:
        "Processed meat curing and smoking are relevant to cancer-concern context.",
      userFacingReason:
        "This product appears to use a processed-meat curing or smoking system. Truthlabel flags this as a cancer-watch review concern, not proof of harm from one product.",
      dataStatus: "needs_expansion",
      confidenceLevel: null,
      sourceRefs: ["WHO_IARC_PROCESSED_MEAT_2015"],
      matchingNotes:
        "Use this as a system-level context match. Do not stack separate category counts for generic processed-meat wording plus individual nitrite/nitrate ingredients unless later scoring rules explicitly allow it.",
    },
  ] satisfies CancerLinkedWatchItem[],

  matchingRules: [
    "Search all name fields.",
    "Reuse aliases from linkedExistingPackIds where possible.",
    "Do not double count if an ingredient appears in multiple packs.",
    "Do not double count if a label includes both name and code, for example Red No. 3 (E127).",
    "Normalize colour/color, flavour/flavor, sulphite/sulfite, sulphur/sulfur, saltpetre/saltpeter, E127/E-127, and INS 127 variants.",
  ],

  overlapRules: [
    "Use canonicalIngredientId first for cross-pack dedupe.",
    "Use linkedIngredientId when a watch item points to a more specific existing pack item.",
    "Allow category overlap across Cancer-linked Watch, Harmful Additives, Banned / Restricted Items, Artificial Colours, Preservatives, and Flavourings without turning one ingredient into multiple separate score causes.",
  ],

  categoryDisplayRules: {
    noMatches: {
      severity: "green",
      display: "No",
    },
    yellowMatches: {
      severity: "yellow",
      display: "yellow",
    },
    redMatches: {
      severity: "red",
      display: "red",
    },
    notes: [
      "0 matches = green / No",
      "1+ yellow watch items = yellow",
      "1+ red watch items = red",
      "Multiple yellow watch items may become red later if the final rule engine adds an overload threshold.",
    ],
  },
};

export type CancerLinkedWatchDataPack = typeof cancerLinkedWatchDataPack;
export type CancerLinkedWatchDataPackItem =
  (typeof cancerLinkedWatchDataPack.items)[number];
