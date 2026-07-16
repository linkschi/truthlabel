export const hydrogenatedPartiallyHydrogenatedOilsDataPack = {
  id: "hydrogenated_partially_hydrogenated_oils",
  categoryName: "Hydrogenated / Partially Hydrogenated Oils",
  categoryMeaning:
    "This category detects hydrogenated oils, partially hydrogenated oils, hydrogenated vegetable fats, shortenings, margarines, and trans-fat markers. Truthlabel flags these because they show the product uses chemically modified fat systems rather than simple whole-food fats.",
  dataStatus: "starter_verified_core",
  defaultCategorySeverity: "red",

  items: [
    {
      id: "partially_hydrogenated_oil_general",
      mainName: "Partially Hydrogenated Oil",
      otherNames: [
        "Partially hydrogenated oil",
        "Partially hydrogenated oils",
        "Partially hydrogenated vegetable oil",
        "Partially hydrogenated vegetable oils",
        "Partially hydrogenated fat",
        "Partially hydrogenated fats",
        "Partially hydrogenated vegetable fat",
        "Partially hydrogenated vegetable fats",
        "Partially hydrogenated edible oil",
        "Partially hydrogenated edible oils",
      ],
      chemicalNames: [
        "Partially hydrogenated triglycerides",
        "Partially hydrogenated vegetable triglycerides",
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PHO", "PHOs"],
      labelVariants: [
        "Partially hydrogenated oil",
        "Partially hydrogenated vegetable oil",
        "Partially hydrogenated fat",
        "Partially hydrogenated vegetable fat",
        "Contains partially hydrogenated oil",
        "Made with partially hydrogenated oil",
        "PHO",
        "PHOs",
      ],
      spellingVariants: [
        "Partially hydrogenated",
        "Partially-hydrogenated",
        "Part hydrogenated",
      ],
      regionalNames: [],
      severity: "red",
      reason:
        "Partially hydrogenated oils are a major artificial trans-fat marker and are no longer GRAS for food use in the United States.",
      healthConcernType: "partially_hydrogenated_oil_trans_fat_marker",
      warningLabel: "PARTIALLY HYDROGENATED OIL FOUND",
      userFacingReason:
        "This product contains partially hydrogenated oil, a serious processed-fat marker. Truthlabel flags this as red immediately because partially hydrogenated oils are linked to artificial trans fat and major regulatory restrictions in some regions.",
      matchingNotes:
        "Match partially hydrogenated oil, partially hydrogenated vegetable oil, partially hydrogenated fat, PHO, and PHOs. Do not double count if PHO and the full phrase both appear.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core",
    },

    {
      id: "partially_hydrogenated_soybean_oil",
      mainName: "Partially Hydrogenated Soybean Oil",
      otherNames: [
        "Partially hydrogenated soybean oil",
        "Partially hydrogenated soya oil",
        "Partially hydrogenated soy oil",
        "Partially hydrogenated soyabean oil",
        "PH soybean oil",
        "PH soya oil",
        "Partially hydrogenated soybean vegetable oil",
      ],
      chemicalNames: ["Partially hydrogenated soybean triglycerides"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PHO", "PH soybean oil"],
      labelVariants: [
        "Partially hydrogenated soybean oil",
        "Partially hydrogenated soya oil",
        "Partially hydrogenated soy oil",
      ],
      spellingVariants: [
        "Soybean",
        "Soya bean",
        "Soyabean",
        "Partially-hydrogenated",
      ],
      regionalNames: ["Soya oil"],
      severity: "red",
      reason:
        "Specific partially hydrogenated oil source. Truthlabel treats this as an automatic red PHO/trans-fat marker.",
      healthConcernType: "partially_hydrogenated_oil_trans_fat_marker",
      warningLabel: "PARTIALLY HYDROGENATED SOYBEAN OIL FOUND",
      userFacingReason:
        "This product contains partially hydrogenated soybean/soya oil. Truthlabel flags this as red immediately because it is a partially hydrogenated oil marker.",
      matchingNotes:
        "Match partially hydrogenated soybean oil, soya oil, soy oil, soyabean oil, and PH soybean oil.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core",
    },

    {
      id: "partially_hydrogenated_cottonseed_oil",
      mainName: "Partially Hydrogenated Cottonseed Oil",
      otherNames: [
        "Partially hydrogenated cottonseed oil",
        "Partially hydrogenated cotton seed oil",
        "PH cottonseed oil",
        "Partially hydrogenated cottonseed vegetable oil",
      ],
      chemicalNames: ["Partially hydrogenated cottonseed triglycerides"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PHO", "PH cottonseed oil"],
      labelVariants: [
        "Partially hydrogenated cottonseed oil",
        "Partially hydrogenated cotton seed oil",
      ],
      spellingVariants: [
        "Cottonseed",
        "Cotton seed",
        "Partially-hydrogenated",
      ],
      regionalNames: [],
      severity: "red",
      reason:
        "Specific partially hydrogenated oil source. Truthlabel treats this as an automatic red PHO/trans-fat marker.",
      healthConcernType: "partially_hydrogenated_oil_trans_fat_marker",
      warningLabel: "PARTIALLY HYDROGENATED COTTONSEED OIL FOUND",
      userFacingReason:
        "This product contains partially hydrogenated cottonseed oil. Truthlabel flags this as red immediately because it is a partially hydrogenated oil marker.",
      matchingNotes:
        "Match partially hydrogenated cottonseed oil, partially hydrogenated cotton seed oil, and PH cottonseed oil.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core",
    },

    {
      id: "partially_hydrogenated_canola_rapeseed_oil",
      mainName: "Partially Hydrogenated Canola / Rapeseed Oil",
      otherNames: [
        "Partially hydrogenated canola oil",
        "Partially hydrogenated rapeseed oil",
        "Partially hydrogenated low erucic acid rapeseed oil",
        "Partially hydrogenated LEAR oil",
        "PH canola oil",
        "PH rapeseed oil",
      ],
      chemicalNames: [
        "Partially hydrogenated rapeseed triglycerides",
        "Partially hydrogenated canola triglycerides",
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PHO", "LEAR"],
      labelVariants: [
        "Partially hydrogenated canola oil",
        "Partially hydrogenated rapeseed oil",
        "Partially hydrogenated LEAR oil",
      ],
      spellingVariants: ["Partially-hydrogenated"],
      regionalNames: ["Rapeseed oil"],
      severity: "red",
      reason:
        "Specific partially hydrogenated oil source. Truthlabel treats this as an automatic red PHO/trans-fat marker.",
      healthConcernType: "partially_hydrogenated_oil_trans_fat_marker",
      warningLabel: "PARTIALLY HYDROGENATED CANOLA / RAPESEED OIL FOUND",
      userFacingReason:
        "This product contains partially hydrogenated canola/rapeseed oil. Truthlabel flags this as red immediately because it is a partially hydrogenated oil marker.",
      matchingNotes:
        "Match partially hydrogenated canola oil, partially hydrogenated rapeseed oil, partially hydrogenated LEAR oil, PH canola oil, and PH rapeseed oil.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core",
    },

    {
      id: "partially_hydrogenated_palm_palm_kernel_oil",
      mainName: "Partially Hydrogenated Palm / Palm Kernel Oil",
      otherNames: [
        "Partially hydrogenated palm oil",
        "Partially hydrogenated palm kernel oil",
        "Partially hydrogenated palm fat",
        "Partially hydrogenated palm kernel fat",
        "Partially hydrogenated palm olein",
        "Partially hydrogenated palm stearin",
        "Partially hydrogenated palm kernel olein",
        "Partially hydrogenated palm kernel stearin",
        "PH palm oil",
        "PH palm kernel oil",
      ],
      chemicalNames: [
        "Partially hydrogenated palm triglycerides",
        "Partially hydrogenated palm kernel triglycerides",
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PHO", "PKO"],
      labelVariants: [
        "Partially hydrogenated palm oil",
        "Partially hydrogenated palm kernel oil",
        "Partially hydrogenated palm fat",
        "Partially hydrogenated palm kernel fat",
      ],
      spellingVariants: [
        "Palm kernel",
        "Palmkernel",
        "Palm kernal",
        "Partially-hydrogenated",
      ],
      regionalNames: [],
      severity: "red",
      reason:
        "Specific partially hydrogenated oil/fat source. Truthlabel treats this as an automatic red PHO/trans-fat marker.",
      healthConcernType: "partially_hydrogenated_oil_trans_fat_marker",
      warningLabel: "PARTIALLY HYDROGENATED PALM FAT FOUND",
      userFacingReason:
        "This product contains partially hydrogenated palm or palm kernel oil. Truthlabel flags this as red immediately because it is a partially hydrogenated fat marker.",
      matchingNotes:
        "Match partially hydrogenated palm oil, palm kernel oil, palm fat, palm olein, palm stearin, palm kernel olein, and palm kernel stearin.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core",
    },

    {
      id: "partially_hydrogenated_corn_sunflower_safflower_oils",
      mainName: "Partially Hydrogenated Corn / Sunflower / Safflower Oils",
      otherNames: [
        "Partially hydrogenated corn oil",
        "Partially hydrogenated maize oil",
        "Partially hydrogenated sunflower oil",
        "Partially hydrogenated sunflower seed oil",
        "Partially hydrogenated safflower oil",
        "Partially hydrogenated safflower seed oil",
        "PH corn oil",
        "PH maize oil",
        "PH sunflower oil",
        "PH safflower oil",
      ],
      chemicalNames: [
        "Partially hydrogenated corn triglycerides",
        "Partially hydrogenated sunflower triglycerides",
        "Partially hydrogenated safflower triglycerides",
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PHO"],
      labelVariants: [
        "Partially hydrogenated corn oil",
        "Partially hydrogenated maize oil",
        "Partially hydrogenated sunflower oil",
        "Partially hydrogenated safflower oil",
      ],
      spellingVariants: ["Partially-hydrogenated"],
      regionalNames: ["Maize oil"],
      severity: "red",
      reason:
        "Specific partially hydrogenated oil sources. Truthlabel treats these as automatic red PHO/trans-fat markers.",
      healthConcernType: "partially_hydrogenated_oil_trans_fat_marker",
      warningLabel: "PARTIALLY HYDROGENATED SEED OIL FOUND",
      userFacingReason:
        "This product contains partially hydrogenated corn, maize, sunflower, or safflower oil. Truthlabel flags this as red immediately because it is a partially hydrogenated oil marker.",
      matchingNotes:
        "Match partially hydrogenated corn oil, maize oil, sunflower oil, sunflower seed oil, safflower oil, and safflower seed oil.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core",
    },

    {
      id: "hydrogenated_oil_general",
      mainName: "Hydrogenated Oil",
      otherNames: [
        "Hydrogenated oil",
        "Hydrogenated oils",
        "Hydrogenated vegetable oil",
        "Hydrogenated vegetable oils",
        "Hydrogenated fat",
        "Hydrogenated fats",
        "Hydrogenated vegetable fat",
        "Hydrogenated vegetable fats",
        "Hydrogenated edible oil",
        "Hydrogenated edible oils",
      ],
      chemicalNames: [
        "Hydrogenated triglycerides",
        "Hydrogenated vegetable triglycerides",
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["HVO"],
      labelVariants: [
        "Hydrogenated oil",
        "Hydrogenated vegetable oil",
        "Hydrogenated fat",
        "Hydrogenated vegetable fat",
        "Contains hydrogenated oil",
        "Made with hydrogenated oil",
      ],
      spellingVariants: ["Hydrogenated"],
      regionalNames: [],
      severity: "red",
      reason:
        "Hydrogenated oils are chemically modified fat systems. Truthlabel treats them as serious processed-fat markers, but not automatically as banned unless partially hydrogenated or region-specific rules apply.",
      healthConcernType: "hydrogenated_processed_fat",
      warningLabel: "HYDROGENATED OIL FOUND",
      userFacingReason:
        "This product contains hydrogenated oil or fat. Truthlabel flags this as a serious processed-fat marker because the oil has been chemically hardened or modified.",
      matchingNotes:
        "Match hydrogenated oil, hydrogenated vegetable oil, hydrogenated fat, hydrogenated vegetable fat, and HVO. If the phrase says partially hydrogenated, use the PHO red rule.",
      scoringImpact: "red_processed_fat",
      dataStatus: "starter",
    },

    {
      id: "fully_hydrogenated_oil",
      mainName: "Fully Hydrogenated Oil",
      otherNames: [
        "Fully hydrogenated oil",
        "Fully hydrogenated oils",
        "Fully hydrogenated vegetable oil",
        "Fully hydrogenated vegetable oils",
        "Fully hydrogenated fat",
        "Fully hydrogenated vegetable fat",
        "Fully hydrogenated soybean oil",
        "Fully hydrogenated soya oil",
        "Fully hydrogenated canola oil",
        "Fully hydrogenated rapeseed oil",
        "Fully hydrogenated cottonseed oil",
        "Fully hydrogenated palm oil",
        "Fully hydrogenated palm kernel oil",
        "Fully hydrogenated coconut oil",
        "Fully hydrogenated sunflower oil",
      ],
      chemicalNames: [
        "Fully hydrogenated triglycerides",
        "Fully hydrogenated vegetable triglycerides",
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["FHVO"],
      labelVariants: [
        "Fully hydrogenated oil",
        "Fully hydrogenated vegetable oil",
        "Fully hydrogenated fat",
        "Fully hydrogenated vegetable fat",
      ],
      spellingVariants: [
        "Fully-hydrogenated",
        "Fully hydrogenated",
      ],
      regionalNames: [],
      severity: "red",
      reason:
        "Fully hydrogenated oils are chemically hardened fat systems. Truthlabel flags them red as a serious processed-fat marker, but they should not be described as PHOs unless the label says partially hydrogenated.",
      healthConcernType: "fully_hydrogenated_processed_fat",
      warningLabel: "FULLY HYDROGENATED OIL FOUND",
      userFacingReason:
        "This product contains fully hydrogenated oil or fat. Truthlabel flags this as a serious processed-fat marker because the oil has been chemically hardened or modified.",
      matchingNotes:
        "Match fully hydrogenated oil, fully hydrogenated vegetable oil, fully hydrogenated fat, fully hydrogenated soybean/soya/canola/rapeseed/cottonseed/palm/palm kernel/coconut/sunflower oil, and FHVO. Do not call it partially hydrogenated unless the label says partially.",
      scoringImpact: "red_processed_fat",
      dataStatus: "starter",
    },

    {
      id: "hydrogenated_shortening",
      mainName: "Hydrogenated Shortening",
      otherNames: [
        "Hydrogenated shortening",
        "Partially hydrogenated shortening",
        "Hydrogenated vegetable shortening",
        "Partially hydrogenated vegetable shortening",
        "Hydrogenated baking shortening",
        "Partially hydrogenated baking shortening",
        "Hydrogenated frying shortening",
        "Partially hydrogenated frying shortening",
      ],
      chemicalNames: [
        "Hydrogenated vegetable fat shortening",
        "Partially hydrogenated vegetable fat shortening",
      ],
      brandNames: ["Crisco"],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PHO"],
      labelVariants: [
        "Hydrogenated shortening",
        "Partially hydrogenated shortening",
        "Hydrogenated vegetable shortening",
        "Partially hydrogenated vegetable shortening",
      ],
      spellingVariants: [
        "Partially-hydrogenated",
        "Partially hydrogenated",
      ],
      regionalNames: [],
      severity: "red",
      reason:
        "Hydrogenated or partially hydrogenated shortening is a serious processed-fat marker. If partially hydrogenated, it should trigger the PHO red rule.",
      healthConcernType: "hydrogenated_shortening_processed_fat",
      warningLabel: "HYDROGENATED SHORTENING FOUND",
      userFacingReason:
        "This product contains hydrogenated or partially hydrogenated shortening. Truthlabel flags this as red because it is a chemically modified processed-fat system.",
      matchingNotes:
        "Match hydrogenated shortening, partially hydrogenated shortening, hydrogenated vegetable shortening, and partially hydrogenated vegetable shortening. If partially hydrogenated appears, classify under PHO automatic red.",
      scoringImpact: "automatic_red_if_partially_hydrogenated_else_red_processed_fat",
      dataStatus: "starter",
    },

    {
      id: "hydrogenated_margarine_spread",
      mainName: "Hydrogenated Margarine / Spread",
      otherNames: [
        "Hydrogenated margarine",
        "Partially hydrogenated margarine",
        "Hydrogenated vegetable fat spread",
        "Partially hydrogenated vegetable fat spread",
        "Hydrogenated vegetable oil spread",
        "Partially hydrogenated vegetable oil spread",
        "Hydrogenated table spread",
        "Partially hydrogenated table spread",
      ],
      chemicalNames: [
        "Hydrogenated vegetable fat spread",
        "Partially hydrogenated vegetable fat spread",
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PHO"],
      labelVariants: [
        "Hydrogenated margarine",
        "Partially hydrogenated margarine",
        "Hydrogenated vegetable fat spread",
        "Partially hydrogenated vegetable fat spread",
      ],
      spellingVariants: [
        "Partially-hydrogenated",
        "Partially hydrogenated",
      ],
      regionalNames: [],
      severity: "red",
      reason:
        "Hydrogenated or partially hydrogenated spreads are chemically modified fat systems. If partially hydrogenated, they should trigger the PHO red rule.",
      healthConcernType: "hydrogenated_spread_processed_fat",
      warningLabel: "HYDROGENATED FAT SPREAD FOUND",
      userFacingReason:
        "This product contains a hydrogenated or partially hydrogenated fat spread. Truthlabel flags this as red because it is a chemically modified processed-fat system.",
      matchingNotes:
        "Match hydrogenated margarine, partially hydrogenated margarine, hydrogenated vegetable fat spread, and partially hydrogenated vegetable fat spread. If partially hydrogenated appears, classify under PHO automatic red.",
      scoringImpact: "automatic_red_if_partially_hydrogenated_else_red_processed_fat",
      dataStatus: "starter",
    },

    {
      id: "trans_fat_marker",
      mainName: "Trans Fat Marker",
      otherNames: [
        "Trans fat",
        "Trans fats",
        "Trans fatty acids",
        "Trans-fatty acids",
        "Artificial trans fat",
        "Artificial trans fats",
        "Industrially produced trans fat",
        "Industrially-produced trans fat",
        "Industrial trans fat",
        "Industrial trans fats",
      ],
      chemicalNames: [
        "Trans fatty acids",
        "Trans-unsaturated fatty acids",
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["TFA", "TFAs", "iTFA", "iTFAs"],
      labelVariants: [
        "Contains trans fat",
        "Contains trans fats",
        "Trans fatty acids",
        "Artificial trans fat",
        "Industrial trans fat",
        "Industrially produced trans fat",
      ],
      spellingVariants: [
        "Trans-fat",
        "Trans fat",
        "Industrially-produced",
        "Industrially produced",
      ],
      regionalNames: [],
      severity: "red",
      reason:
        "Trans fat wording is a serious fat-quality warning. However, nutrition-panel wording like 0g trans fat must not trigger this item by itself.",
      healthConcernType: "trans_fat_marker",
      warningLabel: "TRANS FAT MARKER FOUND",
      userFacingReason:
        "This product contains a trans fat marker. Truthlabel flags this as red because industrial trans fats are a serious fat-quality concern.",
      matchingNotes:
        "Match trans fat only when it appears as a positive ingredient/claim such as contains trans fat or trans fatty acids. Do not trigger from '0g trans fat', 'zero trans fat', 'no trans fat', or 'trans fat free' unless partially hydrogenated oil also appears in the ingredient list.",
      scoringImpact: "automatic_red",
      dataStatus: "starter",
    },
  ],

  categoryScoringRules: {
    noHydrogenatedOrPartiallyHydrogenatedOilFound: {
      severity: "green",
      display: "No",
      scoreImpact: 0,
    },

    anyHydrogenatedOilFound: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: 25,
      reason:
        "Product contains hydrogenated oil or hydrogenated fat, which Truthlabel treats as a serious processed-fat marker.",
    },

    anyPartiallyHydrogenatedOilFound: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: "automatic_red",
      reason:
        "Product contains partially hydrogenated oil, a major artificial trans-fat marker with serious regulatory restrictions in some regions.",
    },

    anyTransFatMarkerFound: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: "automatic_red",
      reason:
        "Product contains a trans fat marker. Do not trigger this rule from '0g trans fat' or 'trans fat free' claims unless PHO is also present.",
    },
  },

  finalVerdictRules: {
    redHydrogenated:
      "This product contains hydrogenated oil or fat. Truthlabel flags this as a serious processed-fat marker because the oil has been chemically hardened or modified.",

    redPartiallyHydrogenated:
      "This product contains partially hydrogenated oil. Truthlabel flags this as red immediately because partially hydrogenated oils are linked to artificial trans fat and major regulatory restrictions in some regions.",

    redTransFat:
      "This product contains a trans fat marker. Truthlabel flags this as a serious fat-quality concern.",

    green:
      "No hydrogenated or partially hydrogenated oils were found from the available ingredient list.",
  },

  matchingNormalizationRules: [
    "lowercase all ingredient text",
    "remove punctuation",
    "remove brackets",
    "collapse extra spaces",
    "normalize partially-hydrogenated and partially hydrogenated",
    "normalize fully-hydrogenated and fully hydrogenated",
    "normalize trans-fat and trans fat",
    "normalize trans-fatty acids and trans fatty acids",
    "normalize industrially-produced and industrially produced",
    "normalize soybean, soya bean, soya, and soyabean where appropriate",
    "normalize cottonseed and cotton seed",
    "normalize palm kernel, palmkernel, and palm kernal",
    "do not double count PHO and partially hydrogenated oil if both appear",
    "do not double count hydrogenated oil and the specific base oil if they refer to the same listed ingredient",
    "if partially hydrogenated appears, use the partially_hydrogenated red rule over the generic hydrogenated rule",
    "do not trigger trans_fat_marker from '0g trans fat', 'zero trans fat', 'no trans fat', or 'trans fat free' claims unless PHO is also present in the ingredient list",
  ],
} as const;

export type HydrogenatedPartiallyHydrogenatedOilsDataPack =
  typeof hydrogenatedPartiallyHydrogenatedOilsDataPack;
export type HydrogenatedPartiallyHydrogenatedOilsItem =
  (typeof hydrogenatedPartiallyHydrogenatedOilsDataPack.items)[number];
