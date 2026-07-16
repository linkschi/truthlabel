export type ArtificialSweetenersItemSeverity = "yellow" | "red";

export type ArtificialSweetenersItemScoringImpact =
  | "yellow_sweetener"
  | "automatic_red";

export type ArtificialSweetenersItemDataStatus =
  | "starter"
  | "verified_core"
  | "needs_region_verification";

export type ArtificialSweetenersCategorySeverity = "green" | "yellow" | "red";

export type ArtificialSweetenersDisplayMode =
  | "No"
  | "yellow_count_badge"
  | "red_count_badge";

export type ArtificialSweetenersItem = {
  id: string;
  mainName: string;
  otherNames: string[];
  chemicalNames?: string[];
  brandNames?: string[];
  eNumbers?: string[];
  insNumbers?: string[];
  abbreviations?: string[];
  labelVariants?: string[];
  spellingVariants?: string[];
  regionalNames?: string[];
  eNumberVariants?: string[];
  severity: ArtificialSweetenersItemSeverity;
  reason: string;
  healthConcernType: string;
  warningLabel: string;
  userFacingReason: string;
  matchingNotes: string;
  scoringImpact: ArtificialSweetenersItemScoringImpact;
  dataStatus: ArtificialSweetenersItemDataStatus;
  restrictedRegions?: string[];
  sourceRefs?: string[];
};

export type ArtificialSweetenersAliasCoverage = Partial<Pick<
  ArtificialSweetenersItem,
  | "otherNames"
  | "chemicalNames"
  | "brandNames"
  | "eNumbers"
  | "insNumbers"
  | "abbreviations"
  | "labelVariants"
  | "spellingVariants"
  | "regionalNames"
  | "eNumberVariants"
>>;

export type ArtificialSweetenersCategoryRule = {
  severity: ArtificialSweetenersCategorySeverity;
  display: ArtificialSweetenersDisplayMode;
  scoreImpact: number | "automatic_red";
  reason?: string;
  examples?: string[];
};

export const artificialSweetenersDataPack = {
  id: "artificial_sweeteners_sugar_substitutes",
  categoryName: "Artificial Sweeteners / Sugar Substitutes",
  categoryMeaning:
    "This category detects artificial sweeteners, high-intensity sweeteners, sugar alcohols, and non-sugar sweetening systems. Truthlabel flags these because the product's sweetness is being created through added sweetener technology rather than simple whole-food sweetness.",
  dataStatus: "starter_verified_core",
  defaultCategorySeverity: "yellow",

  items: [
    {
      id: "aspartame",
      mainName: "Aspartame",
      otherNames: [
        "Aspartame",
        "E951",
        "E-951",
        "INS 951",
        "NutraSweet",
        "Equal",
        "Canderel",
        "APM",
      ],
      severity: "yellow",
      reason:
        "High-intensity artificial sweetener used to create sweetness with very little sugar or calories.",
      healthConcernType: "high_intensity_artificial_sweetener",
      warningLabel: "ARTIFICIAL SWEETENER FOUND",
      userFacingReason:
        "This product contains aspartame, a high-intensity artificial sweetener. Truthlabel flags this because the product's sweetness is being created through added sweetener technology rather than simple sugar or whole-food sweetness.",
      matchingNotes:
        "Match aspartame, E951, INS 951, NutraSweet, Equal, Canderel, and APM.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "verified_core",
    },
    {
      id: "acesulfame_potassium",
      mainName: "Acesulfame Potassium",
      otherNames: [
        "Acesulfame potassium",
        "Acesulfame K",
        "Ace-K",
        "Ace K",
        "Acesulfame-K",
        "E950",
        "E-950",
        "INS 950",
        "Sunett",
        "Sweet One",
      ],
      severity: "yellow",
      reason:
        "High-intensity artificial sweetener commonly used in low-sugar drinks, protein products, desserts, and snacks.",
      healthConcernType: "high_intensity_artificial_sweetener",
      warningLabel: "ARTIFICIAL SWEETENER FOUND",
      userFacingReason:
        "This product contains acesulfame potassium, a high-intensity artificial sweetener. Truthlabel flags this because the product uses a non-sugar sweetening system.",
      matchingNotes:
        "Match acesulfame potassium, acesulfame K, Ace-K, Ace K, E950, INS 950, Sunett, and Sweet One.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "verified_core",
    },
    {
      id: "sucralose",
      mainName: "Sucralose",
      otherNames: ["Sucralose", "E955", "E-955", "INS 955", "Splenda"],
      severity: "yellow",
      reason:
        "High-intensity artificial sweetener used to replace sugar in drinks, desserts, sauces, protein products, and packaged foods.",
      healthConcernType: "high_intensity_artificial_sweetener",
      warningLabel: "ARTIFICIAL SWEETENER FOUND",
      userFacingReason:
        "This product contains sucralose, a high-intensity artificial sweetener. Truthlabel flags this because the sweetness is built with a non-sugar sweetener system.",
      matchingNotes: "Match sucralose, E955, INS 955, and Splenda.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "verified_core",
    },
    {
      id: "saccharin",
      mainName: "Saccharin",
      otherNames: [
        "Saccharin",
        "Sodium saccharin",
        "Calcium saccharin",
        "Potassium saccharin",
        "E954",
        "E-954",
        "INS 954",
        "Sweet'N Low",
        "Sweet N Low",
      ],
      severity: "yellow",
      reason:
        "High-intensity artificial sweetener used in some low-sugar foods, drinks, tabletop sweeteners, and diet products.",
      healthConcernType: "high_intensity_artificial_sweetener",
      warningLabel: "ARTIFICIAL SWEETENER FOUND",
      userFacingReason:
        "This product contains saccharin, a high-intensity artificial sweetener. Truthlabel flags this because the product uses an added non-sugar sweetening system.",
      matchingNotes:
        "Match saccharin, sodium saccharin, calcium saccharin, potassium saccharin, E954, INS 954, Sweet'N Low, and Sweet N Low.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "verified_core",
    },
    {
      id: "cyclamates",
      mainName: "Cyclamates",
      otherNames: [
        "Cyclamate",
        "Cyclamates",
        "Cyclamic acid",
        "Sodium cyclamate",
        "Calcium cyclamate",
        "Magnesium cyclamate",
        "Potassium cyclamate",
        "Sodium cyclohexylsulfamate",
        "Calcium cyclohexylsulfamate",
        "E952",
        "E-952",
        "INS 952",
      ],
      severity: "red",
      reason:
        "Cyclamates are prohibited for food use in the United States and are not permitted to be used in foods in Canada, though other regions may allow them.",
      healthConcernType: "banned_restricted_sweetener",
      warningLabel: "BANNED / RESTRICTED SWEETENER",
      userFacingReason:
        "This product contains cyclamate, a sweetener banned/restricted for food use in some regions including the United States and Canadian foods. Truthlabel flags this as a serious regulatory concern.",
      matchingNotes:
        "Match cyclamate, cyclamates, cyclamic acid, sodium cyclamate, calcium cyclamate, magnesium cyclamate, potassium cyclamate, E952, and INS 952.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core",
      restrictedRegions: ["US", "Canada-food-use"],
      sourceRefs: [
        "FDA_CYCLAMATE_PROHIBITED",
        "CANADA_CYCLAMATE_NOT_PERMITTED_IN_FOODS",
      ],
    },
    {
      id: "neotame",
      mainName: "Neotame",
      otherNames: ["Neotame", "E961", "E-961", "INS 961", "Newtame"],
      severity: "yellow",
      reason:
        "High-intensity artificial sweetener used in some low-sugar or reduced-calorie products.",
      healthConcernType: "high_intensity_artificial_sweetener",
      warningLabel: "ARTIFICIAL SWEETENER FOUND",
      userFacingReason:
        "This product contains neotame, a high-intensity artificial sweetener. Truthlabel flags this because the product uses added sweetener technology.",
      matchingNotes: "Match neotame, E961, INS 961, and Newtame.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "verified_core",
    },
    {
      id: "advantame",
      mainName: "Advantame",
      otherNames: ["Advantame", "E969", "E-969", "INS 969"],
      severity: "yellow",
      reason:
        "Very high-intensity artificial sweetener used in some reduced-sugar products.",
      healthConcernType: "high_intensity_artificial_sweetener",
      warningLabel: "ARTIFICIAL SWEETENER FOUND",
      userFacingReason:
        "This product contains advantame, a very high-intensity artificial sweetener. Truthlabel flags this because the product uses added sweetener technology.",
      matchingNotes: "Match advantame, E969, and INS 969.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "verified_core",
    },
    {
      id: "alitame",
      mainName: "Alitame",
      otherNames: ["Alitame", "E956", "E-956", "INS 956", "Aclame"],
      severity: "yellow",
      reason:
        "High-intensity sweetener with region-specific approval status. Truthlabel flags it as a non-sugar sweetener requiring review.",
      healthConcernType: "high_intensity_sweetener_region_review",
      warningLabel: "ARTIFICIAL SWEETENER FOUND",
      userFacingReason:
        "This product contains alitame, a high-intensity sweetener with region-specific approval status. Truthlabel flags this as a non-sugar sweetener for review.",
      matchingNotes: "Match alitame, E956, INS 956, and Aclame.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "needs_region_verification",
    },
    {
      id: "aspartame_acesulfame_salt",
      mainName: "Aspartame-Acesulfame Salt",
      otherNames: [
        "Aspartame-acesulfame salt",
        "Aspartame acesulfame salt",
        "Acesulfame-aspartame salt",
        "E962",
        "E-962",
        "INS 962",
      ],
      severity: "yellow",
      reason: "Combined sweetener salt made from aspartame and acesulfame.",
      healthConcernType: "combined_high_intensity_sweetener",
      warningLabel: "ARTIFICIAL SWEETENER FOUND",
      userFacingReason:
        "This product contains aspartame-acesulfame salt, a combined high-intensity sweetener. Truthlabel flags this because the product uses added sweetener technology.",
      matchingNotes:
        "Match aspartame-acesulfame salt, acesulfame-aspartame salt, E962, and INS 962.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
    {
      id: "steviol_glycosides",
      mainName: "Steviol Glycosides",
      otherNames: [
        "Steviol glycosides",
        "Stevia extract",
        "Stevia leaf extract",
        "Rebaudioside A",
        "Reb A",
        "Rebaudioside M",
        "Reb M",
        "Rebaudioside D",
        "Reb D",
        "Stevioside",
        "E960",
        "E-960",
        "INS 960",
        "Truvia",
        "PureVia",
      ],
      severity: "yellow",
      reason:
        "High-intensity non-sugar sweetener derived from stevia compounds. Truthlabel flags it because it is still an added sweetening system.",
      healthConcernType: "non_sugar_high_intensity_sweetener",
      warningLabel: "NON-SUGAR SWEETENER FOUND",
      userFacingReason:
        "This product contains steviol glycosides, a non-sugar high-intensity sweetener. Truthlabel flags this because sweetness is being added through a concentrated sweetener system.",
      matchingNotes:
        "Match steviol glycosides, stevia extract, stevia leaf extract, rebaudioside A/M/D, Reb A/M/D, stevioside, E960, and INS 960.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "verified_core",
    },
    {
      id: "crude_stevia_whole_leaf",
      mainName: "Whole-Leaf / Crude Stevia Extract",
      otherNames: [
        "Whole-leaf stevia",
        "Whole leaf stevia",
        "Crude stevia extract",
        "Crude stevia",
        "Unrefined stevia leaf extract",
      ],
      severity: "red",
      reason:
        "FDA says whole-leaf and crude stevia extracts are not permitted for use as sweeteners in the United States.",
      healthConcernType: "not_permitted_sweetener",
      warningLabel: "NOT-PERMITTED SWEETENER",
      userFacingReason:
        "This product contains whole-leaf or crude stevia extract, which is not permitted for use as a sweetener in the United States. Truthlabel flags this as a serious regulatory concern.",
      matchingNotes:
        "Match whole-leaf stevia, whole leaf stevia, crude stevia extract, crude stevia, and unrefined stevia leaf extract. Do not confuse with approved purified steviol glycosides.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core",
      restrictedRegions: ["US"],
      sourceRefs: ["FDA_HIGH_INTENSITY_SWEETENERS"],
    },
    {
      id: "monk_fruit_extract",
      mainName: "Monk Fruit Extract",
      otherNames: [
        "Monk fruit extract",
        "Luo han guo extract",
        "Lo han kuo extract",
        "Siraitia grosvenorii extract",
        "Mogrosides",
        "Mogroside V",
        "Monk fruit sweetener",
        "Lakanto",
      ],
      severity: "yellow",
      reason:
        "Non-sugar high-intensity sweetener derived from monk fruit compounds.",
      healthConcernType: "non_sugar_high_intensity_sweetener",
      warningLabel: "NON-SUGAR SWEETENER FOUND",
      userFacingReason:
        "This product contains monk fruit extract, a non-sugar high-intensity sweetener. Truthlabel flags this because the product uses a concentrated sweetener system.",
      matchingNotes:
        "Match monk fruit extract, luo han guo extract, lo han kuo extract, mogrosides, mogroside V, monk fruit sweetener, and Lakanto.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
    {
      id: "thaumatin",
      mainName: "Thaumatin",
      otherNames: ["Thaumatin", "E957", "E-957", "INS 957", "Talin"],
      severity: "yellow",
      reason: "Intense sweetener/flavour modifier used in some foods.",
      healthConcernType: "intense_sweetener_flavour_modifier",
      warningLabel: "NON-SUGAR SWEETENER FOUND",
      userFacingReason:
        "This product contains thaumatin, an intense sweetener or flavour modifier. Truthlabel flags this because the product uses a concentrated sweetening or taste-modifying system.",
      matchingNotes: "Match thaumatin, E957, INS 957, and Talin.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
    {
      id: "neohesperidin_dihydrochalcone",
      mainName: "Neohesperidin DC",
      otherNames: [
        "Neohesperidin DC",
        "Neohesperidin dihydrochalcone",
        "NHDC",
        "E959",
        "E-959",
        "INS 959",
      ],
      severity: "yellow",
      reason:
        "High-intensity sweetener/flavour modifier used in some products.",
      healthConcernType: "intense_sweetener_flavour_modifier",
      warningLabel: "NON-SUGAR SWEETENER FOUND",
      userFacingReason:
        "This product contains neohesperidin DC, a high-intensity sweetener or taste modifier. Truthlabel flags this as an added sweetening system.",
      matchingNotes:
        "Match neohesperidin DC, neohesperidin dihydrochalcone, NHDC, E959, and INS 959.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
    {
      id: "allulose",
      mainName: "Allulose",
      otherNames: ["Allulose", "D-allulose", "D-psicose", "Psicose", "Rare sugar"],
      severity: "yellow",
      reason:
        "Low-calorie rare sugar used as a sugar substitute in some products.",
      healthConcernType: "sugar_substitute_rare_sugar",
      warningLabel: "SUGAR SUBSTITUTE FOUND",
      userFacingReason:
        "This product contains allulose, a low-calorie sugar substitute. Truthlabel flags this because the product uses a sweetening system instead of ordinary sugar alone.",
      matchingNotes:
        "Match allulose, D-allulose, D-psicose, psicose, and rare sugar.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "needs_region_verification",
    },
    {
      id: "erythritol",
      mainName: "Erythritol",
      otherNames: ["Erythritol", "E968", "E-968", "INS 968"],
      severity: "yellow",
      reason: "Sugar alcohol/polyol used as a low-calorie sweetener.",
      healthConcernType: "sugar_alcohol_polyol",
      warningLabel: "SUGAR ALCOHOL FOUND",
      userFacingReason:
        "This product contains erythritol, a sugar alcohol sweetener. Truthlabel flags this because the product uses a non-sugar sweetening system.",
      matchingNotes: "Match erythritol, E968, and INS 968.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
    {
      id: "xylitol",
      mainName: "Xylitol",
      otherNames: ["Xylitol", "E967", "E-967", "INS 967", "Birch sugar"],
      severity: "yellow",
      reason:
        "Sugar alcohol/polyol used as a sweetener, often in gum, candy, oral-care foods, and low-sugar products.",
      healthConcernType: "sugar_alcohol_polyol",
      warningLabel: "SUGAR ALCOHOL FOUND",
      userFacingReason:
        "This product contains xylitol, a sugar alcohol sweetener. Truthlabel flags this because the product uses a non-sugar sweetening system.",
      matchingNotes: "Match xylitol, E967, INS 967, and birch sugar.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
    {
      id: "sorbitol",
      mainName: "Sorbitol",
      otherNames: [
        "Sorbitol",
        "Sorbitol syrup",
        "D-glucitol",
        "Glucitol",
        "E420",
        "E-420",
        "INS 420",
      ],
      severity: "yellow",
      reason:
        "Sugar alcohol/polyol used as a sweetener, humectant, and texture ingredient.",
      healthConcernType: "sugar_alcohol_polyol",
      warningLabel: "SUGAR ALCOHOL FOUND",
      userFacingReason:
        "This product contains sorbitol, a sugar alcohol sweetener. Truthlabel flags this because the product uses a non-sugar sweetening and texture system.",
      matchingNotes:
        "Match sorbitol, sorbitol syrup, D-glucitol, glucitol, E420, and INS 420.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
    {
      id: "maltitol",
      mainName: "Maltitol",
      otherNames: [
        "Maltitol",
        "Maltitol syrup",
        "Hydrogenated maltose",
        "E965",
        "E-965",
        "INS 965",
      ],
      severity: "yellow",
      reason:
        "Sugar alcohol/polyol used in sugar-free sweets, chocolate, bakery products, and desserts.",
      healthConcernType: "sugar_alcohol_polyol",
      warningLabel: "SUGAR ALCOHOL FOUND",
      userFacingReason:
        "This product contains maltitol, a sugar alcohol sweetener. Truthlabel flags this because the product uses a non-sugar sweetening system.",
      matchingNotes:
        "Match maltitol, maltitol syrup, hydrogenated maltose, E965, and INS 965.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
    {
      id: "mannitol",
      mainName: "Mannitol",
      otherNames: ["Mannitol", "E421", "E-421", "INS 421"],
      severity: "yellow",
      reason: "Sugar alcohol/polyol used as a sweetener or bulking ingredient.",
      healthConcernType: "sugar_alcohol_polyol",
      warningLabel: "SUGAR ALCOHOL FOUND",
      userFacingReason:
        "This product contains mannitol, a sugar alcohol sweetener or bulking ingredient. Truthlabel flags this as a non-sugar sweetening system.",
      matchingNotes: "Match mannitol, E421, and INS 421.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
    {
      id: "isomalt",
      mainName: "Isomalt",
      otherNames: ["Isomalt", "E953", "E-953", "INS 953"],
      severity: "yellow",
      reason:
        "Sugar alcohol/polyol used in sugar-free candies, sweets, and processed desserts.",
      healthConcernType: "sugar_alcohol_polyol",
      warningLabel: "SUGAR ALCOHOL FOUND",
      userFacingReason:
        "This product contains isomalt, a sugar alcohol sweetener. Truthlabel flags this because the product uses a non-sugar sweetening system.",
      matchingNotes: "Match isomalt, E953, and INS 953.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
    {
      id: "lactitol",
      mainName: "Lactitol",
      otherNames: ["Lactitol", "E966", "E-966", "INS 966"],
      severity: "yellow",
      reason:
        "Sugar alcohol/polyol used as a low-calorie sweetener or bulking ingredient.",
      healthConcernType: "sugar_alcohol_polyol",
      warningLabel: "SUGAR ALCOHOL FOUND",
      userFacingReason:
        "This product contains lactitol, a sugar alcohol sweetener. Truthlabel flags this as a non-sugar sweetening or bulking system.",
      matchingNotes: "Match lactitol, E966, and INS 966.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
    {
      id: "polyglycitol_syrup",
      mainName: "Polyglycitol Syrup",
      otherNames: [
        "Polyglycitol syrup",
        "Hydrogenated starch hydrolysate",
        "Hydrogenated starch hydrolysates",
        "HSH",
        "E964",
        "E-964",
        "INS 964",
      ],
      severity: "yellow",
      reason:
        "Sugar alcohol/polyol syrup used as a sweetener, bulking agent, or texture ingredient.",
      healthConcernType: "sugar_alcohol_polyol_syrup",
      warningLabel: "SUGAR ALCOHOL FOUND",
      userFacingReason:
        "This product contains polyglycitol syrup or hydrogenated starch hydrolysates, a sugar alcohol sweetening system. Truthlabel flags this as a non-sugar sweetener and texture ingredient.",
      matchingNotes:
        "Match polyglycitol syrup, hydrogenated starch hydrolysate, hydrogenated starch hydrolysates, HSH, E964, and INS 964.",
      scoringImpact: "yellow_sweetener",
      dataStatus: "starter",
    },
  ] satisfies ArtificialSweetenersItem[],

  aliasCoverage: {
    aspartame: {
      chemicalNames: [
        "L-aspartyl-L-phenylalanine methyl ester",
        "Asp-Phe methyl ester",
        "N-L-alpha-aspartyl-L-phenylalanine 1-methyl ester",
      ],
      abbreviations: ["APM"],
      brandNames: ["NutraSweet", "Equal", "Canderel", "AminoSweet"],
      labelVariants: [
        "Sweetener E951",
        "Artificial sweetener E951",
        "Contains phenylalanine",
        "Source of phenylalanine",
      ],
    },
    acesulfame_potassium: {
      otherNames: [
        "Acesulfame K",
        "Acesulfame-K",
        "Ace-K",
        "Ace K",
        "Acesulfame potassium salt",
      ],
      chemicalNames: [
        "Potassium acesulfame",
        "Potassium salt of acesulfame",
      ],
      abbreviations: ["Ace-K", "Ace K"],
      brandNames: ["Sunett", "Sweet One"],
      labelVariants: ["Sweetener E950", "Artificial sweetener E950"],
    },
    sucralose: {
      chemicalNames: [
        "Trichlorosucrose",
        "1,6-dichloro-1,6-dideoxy-beta-D-fructofuranosyl-4-chloro-4-deoxy-alpha-D-galactopyranoside",
      ],
      brandNames: ["Splenda"],
      labelVariants: ["Sweetener E955", "Artificial sweetener E955"],
    },
    saccharin: {
      chemicalNames: [
        "Benzoic sulfimide",
        "o-benzoic sulfimide",
        "1,2-benzisothiazol-3-one 1,1-dioxide",
      ],
      otherNames: [
        "Sodium saccharin",
        "Calcium saccharin",
        "Potassium saccharin",
      ],
      brandNames: ["Sweet'N Low", "Sweet N Low", "Sweet Twin", "Necta Sweet"],
      labelVariants: ["Sweetener E954", "Artificial sweetener E954"],
    },
    cyclamates: {
      chemicalNames: [
        "Cyclamic acid",
        "Cyclohexylsulfamic acid",
        "Cyclohexylsulphamic acid",
        "Sodium cyclohexylsulfamate",
        "Sodium cyclohexylsulphamate",
        "Calcium cyclohexylsulfamate",
        "Calcium cyclohexylsulphamate",
      ],
      otherNames: [
        "Cyclamate",
        "Sodium cyclamate",
        "Calcium cyclamate",
        "Magnesium cyclamate",
        "Potassium cyclamate",
      ],
      spellingVariants: ["Cyclohexylsulfamate", "Cyclohexylsulphamate"],
      labelVariants: ["Sweetener E952", "Artificial sweetener E952"],
    },
    neotame: {
      brandNames: ["Newtame"],
      labelVariants: ["Sweetener E961", "Artificial sweetener E961"],
    },
    advantame: {
      labelVariants: ["Sweetener E969", "Artificial sweetener E969"],
    },
    alitame: {
      brandNames: ["Aclame"],
      labelVariants: ["Sweetener E956", "Artificial sweetener E956"],
    },
    aspartame_acesulfame_salt: {
      otherNames: [
        "Aspartame-acesulfame salt",
        "Aspartame acesulfame salt",
        "Acesulfame-aspartame salt",
        "Aspartame-acesulfame",
        "Acesulfame aspartame",
      ],
      labelVariants: ["Sweetener E962", "Artificial sweetener E962"],
    },
    steviol_glycosides: {
      otherNames: [
        "Steviol glycosides",
        "Stevia extract",
        "Stevia leaf extract",
        "Purified stevia extract",
        "High-purity stevia extract",
        "Stevioside",
        "Rebaudioside A",
        "Reb A",
        "Rebaudioside M",
        "Reb M",
        "Rebaudioside D",
        "Reb D",
        "Rebaudioside C",
        "Reb C",
        "Glucosylated steviol glycosides",
        "Enzyme-modified stevia",
        "Enzymatically modified stevia",
      ],
      brandNames: ["Truvia", "PureVia", "SweetLeaf", "Stevia in the Raw"],
      labelVariants: [
        "Sweetener E960",
        "Stevia sweetener",
        "Steviol glycoside sweetener",
      ],
    },
    crude_stevia_whole_leaf: {
      otherNames: [
        "Whole-leaf stevia",
        "Whole leaf stevia",
        "Crude stevia extract",
        "Crude stevia",
        "Unrefined stevia",
        "Unrefined stevia leaf extract",
        "Stevia leaf powder",
      ],
      labelVariants: [
        "Whole leaf stevia sweetener",
        "Crude stevia sweetener",
      ],
    },
    monk_fruit_extract: {
      otherNames: [
        "Monk fruit extract",
        "Monk fruit sweetener",
        "Luo han guo",
        "Luo han guo extract",
        "Lo han kuo",
        "Lo han kuo extract",
        "Siraitia grosvenorii extract",
        "Mogrosides",
        "Mogroside V",
      ],
      brandNames: ["Lakanto", "Monk Fruit in the Raw"],
      labelVariants: ["Monk fruit sweetener", "Luo han guo sweetener"],
    },
    thaumatin: {
      brandNames: ["Talin"],
      labelVariants: [
        "Sweetener E957",
        "Flavour modifier E957",
        "Flavor modifier E957",
      ],
    },
    neohesperidin_dihydrochalcone: {
      otherNames: ["Neohesperidin DC", "Neohesperidin dihydrochalcone"],
      abbreviations: ["NHDC"],
      labelVariants: [
        "Sweetener E959",
        "Flavour modifier E959",
        "Flavor modifier E959",
      ],
    },
    allulose: {
      otherNames: [
        "D-allulose",
        "D-psicose",
        "Psicose",
        "Rare sugar",
        "D-ribo-2-hexulose",
      ],
      labelVariants: [
        "Low calorie sugar",
        "Rare sugar sweetener",
        "Allulose sweetener",
      ],
    },
    erythritol: {
      chemicalNames: ["meso-erythritol", "erythrol"],
      labelVariants: ["Sweetener E968", "Sugar alcohol E968", "Polyol E968"],
    },
    xylitol: {
      otherNames: ["Birch sugar"],
      chemicalNames: ["Xylite"],
      labelVariants: ["Sweetener E967", "Sugar alcohol E967", "Polyol E967"],
    },
    sorbitol: {
      otherNames: ["Sorbitol syrup", "D-glucitol", "Glucitol"],
      labelVariants: [
        "Sweetener E420",
        "Sugar alcohol E420",
        "Polyol E420",
        "Humectant E420",
      ],
    },
    maltitol: {
      otherNames: ["Maltitol syrup", "Hydrogenated maltose"],
      labelVariants: ["Sweetener E965", "Sugar alcohol E965", "Polyol E965"],
    },
    mannitol: {
      chemicalNames: ["D-mannitol"],
      labelVariants: ["Sweetener E421", "Sugar alcohol E421", "Polyol E421"],
    },
    isomalt: {
      chemicalNames: ["Hydrogenated isomaltulose"],
      otherNames: ["Isomaltitol"],
      labelVariants: ["Sweetener E953", "Sugar alcohol E953", "Polyol E953"],
    },
    lactitol: {
      otherNames: ["Lactit"],
      labelVariants: ["Sweetener E966", "Sugar alcohol E966", "Polyol E966"],
    },
    polyglycitol_syrup: {
      otherNames: [
        "Polyglycitol syrup",
        "Hydrogenated starch hydrolysate",
        "Hydrogenated starch hydrolysates",
        "Hydrogenated glucose syrup",
      ],
      abbreviations: ["HSH"],
      labelVariants: [
        "Sweetener E964",
        "Sugar alcohol syrup E964",
        "Polyol syrup E964",
      ],
    },
  } satisfies Record<string, ArtificialSweetenersAliasCoverage>,

  categoryScoringRules: {
    noSweetenersFound: {
      severity: "green",
      display: "No",
      scoreImpact: 0,
    },
    oneToTwoSweeteners: {
      severity: "yellow",
      display: "yellow_count_badge",
      scoreImpact: 6,
      reason: "Product contains added non-sugar sweetening systems.",
    },
    threeOrMoreSweeteners: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: 20,
      reason:
        "Product contains multiple sweetener systems. Truthlabel treats this as a high sweetener-load concern.",
    },
    anyBannedRestrictedSweetener: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: "automatic_red",
      examples: ["cyclamates", "crude_stevia_whole_leaf"],
    },
  } satisfies Record<string, ArtificialSweetenersCategoryRule>,

  finalVerdictRules: {
    yellow:
      "This product contains artificial or non-sugar sweeteners. Truthlabel flags this because the product's sweetness is being created through added sweetener systems.",
    redLoad:
      "This product contains multiple sweetener systems. Truthlabel flags this as a high sweetener-load concern.",
    redRestricted:
      "This product contains a banned or restricted sweetener. Truthlabel flags this as a serious regulatory concern.",
  },

  matchingNormalizationRules: [
    "lowercase all ingredient text",
    "remove punctuation",
    "normalize E-numbers with and without hyphen",
    "normalize Ace-K, Ace K, and acesulfame K",
    "normalize Sweet'N Low and Sweet N Low",
    "normalize high-intensity sweetener brand aliases",
    "normalize flavour/flavor modifier spelling",
    "normalize colour/color spelling",
    "normalize hydrolyzed/hydrolysed spelling",
    "do not double count the same sweetener if name and E-number both appear",
  ],
} as const;

export type ArtificialSweetenersDataPack = typeof artificialSweetenersDataPack;
