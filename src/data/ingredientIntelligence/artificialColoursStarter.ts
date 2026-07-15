export type ArtificialColourCategory =
  | "artificial_colours"
  | "colour_additive"
  | "banned_restricted_items"
  | "cancer_linked_watch"
  | "harmful_additives"
  | "additives_preservatives"
  | "ultra_processed_indicators"
  | "processed_artificial";

export type ArtificialColourFamily =
  | "yellow"
  | "yellow_orange"
  | "red"
  | "blue"
  | "green"
  | "black"
  | "brown"
  | "orange"
  | "white";

export type ArtificialColourSourceType = "label_based" | "manual_watchlist";

export type ArtificialColourScoreImpact = "yellow_additive" | "automatic_red";

export type ArtificialColourEvidenceStatus = "needs_region_verification";

export type ArtificialColourRegionCode =
  | "US"
  | "EU"
  | "UK"
  | "Canada"
  | "AU_NZ"
  | "ZA";

export type ArtificialColourRegionStatus = "needs_verification" | "unknown";

export type ArtificialColourDisplaySection =
  | "quick_overview"
  | "additives_preservatives"
  | "individual_ingredients"
  | "natural_vs_processed"
  | "final_verdict";

export type ArtificialColourStarterItem = {
  id: string;
  canonicalName: string;
  aliases: string[];
  eNumbers: string[];
  insNumbers: string[];
  colourFamily: ArtificialColourFamily;
  categories: ArtificialColourCategory[];
  severity: "yellow" | "red";
  scoreImpact: ArtificialColourScoreImpact;
  sourceType: ArtificialColourSourceType;
  evidenceStatus: ArtificialColourEvidenceStatus;
  regionStatus: Record<ArtificialColourRegionCode, ArtificialColourRegionStatus>;
  explanation: string;
  matchingNotes: string;
  displaySections: ArtificialColourDisplaySection[];
  warningLabel: string;
  userFacingReason: string;
  duplicateGroupId: string;
  dataSources: string[];
};

// Starter dataset kept intentionally provisional.
// Region status still needs item-by-item verification later.
export const artificialColoursStarter: ArtificialColourStarterItem[] = [
  {
    id: "tartrazine",
    canonicalName: "Tartrazine",
    aliases: ["Yellow 5", "FD&C Yellow No. 5", "FD&C Yellow 5"],
    eNumbers: ["E102"],
    insNumbers: ["102"],
    colourFamily: "yellow",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic yellow colour additive used to make foods and drinks appear brighter.",
    matchingNotes:
      "Match Tartrazine, Yellow 5, FD&C Yellow No. 5, E102, and INS 102.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "tartrazine",
    dataSources: ["FDA", "UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "sunset_yellow_fcf",
    canonicalName: "Sunset Yellow FCF",
    aliases: [
      "Yellow 6",
      "FD&C Yellow No. 6",
      "FD&C Yellow 6",
      "Orange Yellow S",
    ],
    eNumbers: ["E110"],
    insNumbers: ["110"],
    colourFamily: "yellow_orange",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic yellow-orange colour additive used in processed foods and drinks.",
    matchingNotes:
      "Match Sunset Yellow FCF, Yellow 6, FD&C Yellow No. 6, Orange Yellow S, E110, and INS 110.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "sunset_yellow_fcf",
    dataSources: ["FDA", "UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "allura_red_ac",
    canonicalName: "Allura Red AC",
    aliases: ["Red 40", "FD&C Red No. 40", "FD&C Red 40"],
    eNumbers: ["E129"],
    insNumbers: ["129"],
    colourFamily: "red",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic red colour additive used to give processed foods and drinks a bright red colour.",
    matchingNotes:
      "Match Allura Red AC, Red 40, FD&C Red No. 40, E129, and INS 129.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "allura_red_ac",
    dataSources: ["FDA", "UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "erythrosine",
    canonicalName: "Erythrosine",
    aliases: ["Red No. 3", "Red 3", "FD&C Red No. 3", "FD&C Red 3"],
    eNumbers: ["E127"],
    insNumbers: ["127"],
    colourFamily: "red",
    categories: [
      "artificial_colours",
      "banned_restricted_items",
      "cancer_linked_watch",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "red",
    scoreImpact: "automatic_red",
    sourceType: "manual_watchlist",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic red colour additive included in InsideIt's restricted-colour and cancer-concern watchlist.",
    matchingNotes:
      "Match Erythrosine, Red No. 3, Red 3, FD&C Red No. 3, E127, and INS 127.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "final_verdict",
    ],
    warningLabel: "Restricted colour watch item",
    userFacingReason:
      "This colour appears on InsideIt's banned/restricted or cancer-concern watchlist.",
    duplicateGroupId: "erythrosine",
    dataSources: ["FDA", "UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "brilliant_blue_fcf",
    canonicalName: "Brilliant Blue FCF",
    aliases: ["Blue 1", "FD&C Blue No. 1", "FD&C Blue 1"],
    eNumbers: ["E133"],
    insNumbers: ["133"],
    colourFamily: "blue",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic blue colour additive used to make foods and drinks appear blue or brighter.",
    matchingNotes:
      "Match Brilliant Blue FCF, Blue 1, FD&C Blue No. 1, E133, and INS 133.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "brilliant_blue_fcf",
    dataSources: ["FDA", "UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "indigotine",
    canonicalName: "Indigotine",
    aliases: ["Indigo Carmine", "Blue 2", "FD&C Blue No. 2", "FD&C Blue 2"],
    eNumbers: ["E132"],
    insNumbers: ["132"],
    colourFamily: "blue",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic blue colour additive used in some processed foods and drinks.",
    matchingNotes:
      "Match Indigotine, Indigo Carmine, Blue 2, FD&C Blue No. 2, E132, and INS 132.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "indigotine",
    dataSources: ["FDA", "UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "fast_green_fcf",
    canonicalName: "Fast Green FCF",
    aliases: ["Green 3", "FD&C Green No. 3", "FD&C Green 3"],
    eNumbers: ["E143"],
    insNumbers: ["143"],
    colourFamily: "green",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic green colour additive used to make foods appear green or brighter.",
    matchingNotes:
      "Match Fast Green FCF, Green 3, FD&C Green No. 3, E143, and INS 143.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "fast_green_fcf",
    dataSources: ["FDA", "UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "amaranth",
    canonicalName: "Amaranth",
    aliases: [],
    eNumbers: ["E123"],
    insNumbers: ["123"],
    colourFamily: "red",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic red colour additive used in some food-colour systems.",
    matchingNotes: "Match Amaranth, E123, and INS 123.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "amaranth",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "ponceau_4r",
    canonicalName: "Ponceau 4R",
    aliases: ["Cochineal Red A"],
    eNumbers: ["E124"],
    insNumbers: ["124"],
    colourFamily: "red",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic red colour additive used in some processed foods.",
    matchingNotes: "Match Ponceau 4R, Cochineal Red A, E124, and INS 124.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "ponceau_4r",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "azorubine",
    canonicalName: "Azorubine",
    aliases: ["Carmoisine"],
    eNumbers: ["E122"],
    insNumbers: ["122"],
    colourFamily: "red",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation: "A synthetic red colour additive also known as Carmoisine.",
    matchingNotes: "Match Azorubine, Carmoisine, E122, and INS 122.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "azorubine",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "quinoline_yellow",
    canonicalName: "Quinoline Yellow",
    aliases: [],
    eNumbers: ["E104"],
    insNumbers: ["104"],
    colourFamily: "yellow",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic yellow colour additive used in some food-colour systems.",
    matchingNotes: "Match Quinoline Yellow, E104, and INS 104.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "quinoline_yellow",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "patent_blue_v",
    canonicalName: "Patent Blue V",
    aliases: [],
    eNumbers: ["E131"],
    insNumbers: ["131"],
    colourFamily: "blue",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic blue colour additive used in some food-colour systems.",
    matchingNotes: "Match Patent Blue V, E131, and INS 131.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "patent_blue_v",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "green_s",
    canonicalName: "Green S",
    aliases: [],
    eNumbers: ["E142"],
    insNumbers: ["142"],
    colourFamily: "green",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic green colour additive used in some processed foods.",
    matchingNotes: "Match Green S, E142, and INS 142.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "green_s",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "brilliant_black_bn",
    canonicalName: "Brilliant Black BN",
    aliases: ["Black PN"],
    eNumbers: ["E151"],
    insNumbers: ["151"],
    colourFamily: "black",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic black colour additive used in some food-colour systems.",
    matchingNotes: "Match Brilliant Black BN, Black PN, E151, and INS 151.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "brilliant_black_bn",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "brown_ht",
    canonicalName: "Brown HT",
    aliases: [],
    eNumbers: ["E155"],
    insNumbers: ["155"],
    colourFamily: "brown",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic brown colour additive used in some food-colour systems.",
    matchingNotes: "Match Brown HT, E155, and INS 155.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "brown_ht",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "litholrubine_bk",
    canonicalName: "Litholrubine BK",
    aliases: [],
    eNumbers: ["E180"],
    insNumbers: ["180"],
    colourFamily: "red",
    categories: [
      "artificial_colours",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic red colour additive used in limited food-colour contexts.",
    matchingNotes: "Match Litholrubine BK, E180, and INS 180.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Artificial colour found",
    userFacingReason:
      "This is a synthetic colour additive and is counted as an artificial additive.",
    duplicateGroupId: "litholrubine_bk",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "citrus_red_no_2",
    canonicalName: "Citrus Red No. 2",
    aliases: ["Citrus Red 2"],
    eNumbers: [],
    insNumbers: [],
    colourFamily: "red",
    categories: [
      "artificial_colours",
      "banned_restricted_items",
      "harmful_additives",
      "additives_preservatives",
      "processed_artificial",
    ],
    severity: "red",
    scoreImpact: "automatic_red",
    sourceType: "manual_watchlist",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic red colour additive included in InsideIt's restricted-colour watchlist.",
    matchingNotes: "Match Citrus Red No. 2 and Citrus Red 2.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "final_verdict",
    ],
    warningLabel: "Restricted colour watch item",
    userFacingReason:
      "This colour appears on InsideIt's banned/restricted watchlist.",
    duplicateGroupId: "citrus_red_no_2",
    dataSources: ["FDA"],
  },
  {
    id: "orange_b",
    canonicalName: "Orange B",
    aliases: [],
    eNumbers: [],
    insNumbers: [],
    colourFamily: "orange",
    categories: [
      "artificial_colours",
      "banned_restricted_items",
      "harmful_additives",
      "additives_preservatives",
      "processed_artificial",
    ],
    severity: "red",
    scoreImpact: "automatic_red",
    sourceType: "manual_watchlist",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A synthetic orange colour additive included in InsideIt's restricted-colour watchlist.",
    matchingNotes: "Match Orange B.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "final_verdict",
    ],
    warningLabel: "Restricted colour watch item",
    userFacingReason:
      "This colour appears on InsideIt's banned/restricted watchlist.",
    duplicateGroupId: "orange_b",
    dataSources: ["FDA"],
  },
  {
    id: "titanium_dioxide",
    canonicalName: "Titanium Dioxide",
    aliases: ["CI 77891"],
    eNumbers: ["E171"],
    insNumbers: ["171"],
    colourFamily: "white",
    categories: [
      "colour_additive",
      "banned_restricted_items",
      "harmful_additives",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "red",
    scoreImpact: "automatic_red",
    sourceType: "manual_watchlist",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A white colour additive included in InsideIt's region-restricted colour watchlist.",
    matchingNotes:
      "Match Titanium Dioxide, E171, INS 171, and CI 77891.",
    displaySections: [
      "quick_overview",
      "additives_preservatives",
      "individual_ingredients",
      "final_verdict",
    ],
    warningLabel: "Restricted colour watch item",
    userFacingReason:
      "This colour additive has different regulatory treatment by region and is on InsideIt's restricted-colour watchlist.",
    duplicateGroupId: "titanium_dioxide",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "caramel_colour",
    canonicalName: "Caramel Colour",
    aliases: ["Caramel Color"],
    eNumbers: ["E150"],
    insNumbers: ["150"],
    colourFamily: "brown",
    categories: [
      "colour_additive",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation: "A brown colour additive used to darken foods and drinks.",
    matchingNotes: "Match Caramel Colour, Caramel Color, E150, and INS 150.",
    displaySections: [
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Colour additive found",
    userFacingReason:
      "This is a colour additive and is counted as a processed/artificial ingredient.",
    duplicateGroupId: "caramel_colour",
    dataSources: ["FDA", "UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "caramel_i",
    canonicalName: "Caramel I",
    aliases: ["Plain Caramel"],
    eNumbers: ["E150a"],
    insNumbers: ["150a"],
    colourFamily: "brown",
    categories: [
      "colour_additive",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation:
      "A plain caramel colour additive used to darken foods and drinks.",
    matchingNotes:
      "Match Caramel I, Plain Caramel, E150a, and INS 150a.",
    displaySections: [
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Colour additive found",
    userFacingReason:
      "This is a colour additive and is counted as a processed/artificial ingredient.",
    duplicateGroupId: "caramel_i",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "caramel_ii",
    canonicalName: "Caramel II",
    aliases: ["Caustic Sulphite Caramel", "Caustic Sulfite Caramel"],
    eNumbers: ["E150b"],
    insNumbers: ["150b"],
    colourFamily: "brown",
    categories: [
      "colour_additive",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation: "A caramel colour additive used to darken foods and drinks.",
    matchingNotes:
      "Match Caramel II, Caustic Sulphite Caramel, Caustic Sulfite Caramel, E150b, and INS 150b.",
    displaySections: [
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Colour additive found",
    userFacingReason:
      "This is a colour additive and is counted as a processed/artificial ingredient.",
    duplicateGroupId: "caramel_ii",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "caramel_iii",
    canonicalName: "Caramel III",
    aliases: ["Ammonia Caramel"],
    eNumbers: ["E150c"],
    insNumbers: ["150c"],
    colourFamily: "brown",
    categories: [
      "colour_additive",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation: "A caramel colour additive used to darken foods and drinks.",
    matchingNotes:
      "Match Caramel III, Ammonia Caramel, E150c, and INS 150c.",
    displaySections: [
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Colour additive found",
    userFacingReason:
      "This is a colour additive and is counted as a processed/artificial ingredient.",
    duplicateGroupId: "caramel_iii",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
  {
    id: "caramel_iv",
    canonicalName: "Caramel IV",
    aliases: ["Sulphite Ammonia Caramel", "Sulfite Ammonia Caramel"],
    eNumbers: ["E150d"],
    insNumbers: ["150d"],
    colourFamily: "brown",
    categories: [
      "colour_additive",
      "additives_preservatives",
      "ultra_processed_indicators",
      "processed_artificial",
    ],
    severity: "yellow",
    scoreImpact: "yellow_additive",
    sourceType: "label_based",
    evidenceStatus: "needs_region_verification",
    regionStatus: {
      US: "needs_verification",
      EU: "needs_verification",
      UK: "needs_verification",
      Canada: "needs_verification",
      AU_NZ: "needs_verification",
      ZA: "unknown",
    },
    explanation: "A caramel colour additive used to darken foods and drinks.",
    matchingNotes:
      "Match Caramel IV, Sulphite Ammonia Caramel, Sulfite Ammonia Caramel, E150d, and INS 150d.",
    displaySections: [
      "additives_preservatives",
      "individual_ingredients",
      "natural_vs_processed",
    ],
    warningLabel: "Colour additive found",
    userFacingReason:
      "This is a colour additive and is counted as a processed/artificial ingredient.",
    duplicateGroupId: "caramel_iv",
    dataSources: ["UK/E-number list", "Canada permitted colours", "FSANZ"],
  },
];

export const artificialColoursStarterById = Object.fromEntries(
  artificialColoursStarter.map((item) => [item.id, item]),
) satisfies Record<string, ArtificialColourStarterItem>;
