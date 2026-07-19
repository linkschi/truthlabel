export const flavourEnhancersFlavouringsDataPack = {
  id: "flavour_enhancers_flavourings",
  categoryName: "Flavour Enhancers / Flavourings",
  categoryMeaning:
    "This category detects flavour enhancers, flavourings, taste boosters, smoke flavours, savoury boosters, reaction flavours, and artificial or vague flavour systems. Truthlabel flags these because the product's taste may be built or intensified with added flavour technology rather than coming only from simple whole ingredients.",
  dataStatus: "starter_needs_expansion",
  defaultCategorySeverity: "yellow",

  items: [
    {
      id: "monosodium_glutamate_msg",
      mainName: "Monosodium Glutamate",
      otherNames: [
        "Monosodium glutamate",
        "MSG",
        "Sodium glutamate",
        "Monosodium L-glutamate",
        "L-glutamic acid monosodium salt",
        "Glutamate seasoning"
      ],
      chemicalNames: [
        "Sodium 2-aminopentanedioate",
        "Sodium salt of glutamic acid",
        "L-glutamic acid monosodium salt"
      ],
      brandNames: [
        "Accent",
        "Ajinomoto"
      ],
      eNumbers: ["E621", "E-621"],
      insNumbers: ["621", "INS 621"],
      abbreviations: ["MSG"],
      labelVariants: [
        "Flavour enhancer E621",
        "Flavor enhancer E621",
        "Flavour enhancer: MSG",
        "Flavor enhancer: MSG",
        "Monosodium glutamate flavour enhancer",
        "Monosodium glutamate flavor enhancer"
      ],
      spellingVariants: ["Flavour", "Flavor"],
      regionalNames: [],
      severity: "green",
      reason:
        "Flavour enhancer used to intensify savoury/umami taste in processed foods.",
      healthConcernType: "flavour_enhancer_umami_booster",
      warningLabel: "FLAVOUR ENHANCER FOUND",
      userFacingReason:
        "This product contains MSG, a flavour enhancer used to intensify savoury taste. Truthlabel flags this because the product's flavour is being boosted with an added taste enhancer.",
      matchingNotes:
        "Match monosodium glutamate, MSG, sodium glutamate, E621, INS 621, Accent, and Ajinomoto. Do not double count if MSG and E621 both appear.",
      scoringImpact: "yellow_flavour_enhancer",
      dataStatus: "starter"
    },

    {
      id: "glutamate_flavour_enhancers",
      mainName: "Glutamate Flavour Enhancers",
      otherNames: [
        "Glutamic acid",
        "Glutamates",
        "Monopotassium glutamate",
        "Potassium glutamate",
        "Calcium diglutamate",
        "Monoammonium glutamate",
        "Ammonium glutamate",
        "Magnesium diglutamate",
        "Magnesium glutamate"
      ],
      chemicalNames: [
        "L-glutamic acid",
        "Potassium salt of glutamic acid",
        "Calcium salt of glutamic acid",
        "Ammonium salt of glutamic acid",
        "Magnesium salt of glutamic acid"
      ],
      brandNames: [],
      eNumbers: [
        "E620",
        "E-620",
        "E622",
        "E-622",
        "E623",
        "E-623",
        "E624",
        "E-624",
        "E625",
        "E-625"
      ],
      insNumbers: [
        "620",
        "INS 620",
        "622",
        "INS 622",
        "623",
        "INS 623",
        "624",
        "INS 624",
        "625",
        "INS 625"
      ],
      abbreviations: [],
      labelVariants: [
        "Flavour enhancer E620",
        "Flavor enhancer E620",
        "Flavour enhancer E622",
        "Flavor enhancer E622",
        "Flavour enhancer E623",
        "Flavor enhancer E623",
        "Flavour enhancer E624",
        "Flavor enhancer E624",
        "Flavour enhancer E625",
        "Flavor enhancer E625"
      ],
      spellingVariants: ["Flavour", "Flavor"],
      regionalNames: [],
      severity: "green",
      reason:
        "Glutamate flavour enhancer family used to boost savoury/umami taste.",
      healthConcernType: "flavour_enhancer_umami_booster",
      warningLabel: "FLAVOUR ENHANCER FOUND",
      userFacingReason:
        "This product contains glutamate flavour enhancers used to boost savoury taste. Truthlabel flags this as an added flavour-enhancing system.",
      matchingNotes:
        "Match glutamic acid, glutamates, monopotassium glutamate, calcium diglutamate, monoammonium glutamate, magnesium diglutamate, E620, E622, E623, E624, E625, and INS variants.",
      scoringImpact: "yellow_flavour_enhancer",
      dataStatus: "starter"
    },

    {
      id: "guanylate_flavour_enhancers",
      mainName: "Guanylate Flavour Enhancers",
      otherNames: [
        "Guanylic acid",
        "Guanosine monophosphate",
        "Disodium guanylate",
        "Sodium guanylate",
        "Dipotassium guanylate",
        "Potassium guanylate",
        "Calcium guanylate"
      ],
      chemicalNames: [
        "Guanosine 5'-monophosphate",
        "Disodium 5'-guanylate",
        "Dipotassium 5'-guanylate",
        "Calcium 5'-guanylate"
      ],
      brandNames: [],
      eNumbers: [
        "E626",
        "E-626",
        "E627",
        "E-627",
        "E628",
        "E-628",
        "E629",
        "E-629"
      ],
      insNumbers: [
        "626",
        "INS 626",
        "627",
        "INS 627",
        "628",
        "INS 628",
        "629",
        "INS 629"
      ],
      abbreviations: [
        "GMP",
        "5'-GMP"
      ],
      labelVariants: [
        "Flavour enhancer E626",
        "Flavor enhancer E626",
        "Flavour enhancer E627",
        "Flavor enhancer E627",
        "Flavour enhancer E628",
        "Flavor enhancer E628",
        "Flavour enhancer E629",
        "Flavor enhancer E629"
      ],
      spellingVariants: ["Flavour", "Flavor"],
      regionalNames: [],
      severity: "green",
      reason:
        "Nucleotide flavour enhancer family used to strongly boost savoury taste, often together with MSG or glutamates.",
      healthConcernType: "nucleotide_flavour_enhancer",
      warningLabel: "FLAVOUR ENHANCER FOUND",
      userFacingReason:
        "This product contains guanylate flavour enhancers, used to intensify savoury taste. Truthlabel flags this as an added flavour-boosting system.",
      matchingNotes:
        "Match guanylic acid, disodium guanylate, dipotassium guanylate, calcium guanylate, GMP, E626, E627, E628, E629, and INS variants.",
      scoringImpact: "yellow_flavour_enhancer",
      dataStatus: "starter"
    },

    {
      id: "inosinate_flavour_enhancers",
      mainName: "Inosinate Flavour Enhancers",
      otherNames: [
        "Inosinic acid",
        "Inosinate",
        "Inosinates",
        "Disodium inosinate",
        "Sodium inosinate",
        "Dipotassium inosinate",
        "Potassium inosinate",
        "Calcium inosinate"
      ],
      chemicalNames: [
        "Inosine 5'-monophosphate",
        "Disodium 5'-inosinate",
        "Dipotassium 5'-inosinate",
        "Calcium 5'-inosinate"
      ],
      brandNames: [],
      eNumbers: [
        "E630",
        "E-630",
        "E631",
        "E-631",
        "E632",
        "E-632",
        "E633",
        "E-633"
      ],
      insNumbers: [
        "630",
        "INS 630",
        "631",
        "INS 631",
        "632",
        "INS 632",
        "633",
        "INS 633"
      ],
      abbreviations: [
        "IMP",
        "5'-IMP"
      ],
      labelVariants: [
        "Flavour enhancer E630",
        "Flavor enhancer E630",
        "Flavour enhancer E631",
        "Flavor enhancer E631",
        "Flavour enhancer E632",
        "Flavor enhancer E632",
        "Flavour enhancer E633",
        "Flavor enhancer E633"
      ],
      spellingVariants: ["Flavour", "Flavor"],
      regionalNames: [],
      severity: "green",
      reason:
        "Nucleotide flavour enhancer family used to intensify savoury taste, often in snacks, noodles, sauces, seasonings, and processed meats.",
      healthConcernType: "nucleotide_flavour_enhancer",
      warningLabel: "FLAVOUR ENHANCER FOUND",
      userFacingReason:
        "This product contains inosinate flavour enhancers, used to intensify savoury taste. Truthlabel flags this as an added flavour-boosting system.",
      matchingNotes:
        "Match inosinic acid, disodium inosinate, dipotassium inosinate, calcium inosinate, IMP, E630, E631, E632, E633, and INS variants.",
      scoringImpact: "yellow_flavour_enhancer",
      dataStatus: "starter"
    },

    {
      id: "ribonucleotide_flavour_enhancers",
      mainName: "Ribonucleotide Flavour Enhancers",
      otherNames: [
        "Disodium ribonucleotides",
        "Disodium 5'-ribonucleotides",
        "Disodium 5 ribonucleotides",
        "Ribonucleotides",
        "Calcium ribonucleotides",
        "Calcium 5'-ribonucleotides",
        "Calcium 5 ribonucleotides"
      ],
      chemicalNames: [
        "Disodium 5'-ribonucleotides",
        "Calcium 5'-ribonucleotides"
      ],
      brandNames: [],
      eNumbers: [
        "E634",
        "E-634",
        "E635",
        "E-635"
      ],
      insNumbers: [
        "634",
        "INS 634",
        "635",
        "INS 635"
      ],
      abbreviations: [
        "I+G",
        "5'-ribonucleotides"
      ],
      labelVariants: [
        "Flavour enhancer E634",
        "Flavor enhancer E634",
        "Flavour enhancer E635",
        "Flavor enhancer E635",
        "Flavour enhancer: disodium ribonucleotides",
        "Flavor enhancer: disodium ribonucleotides"
      ],
      spellingVariants: ["Flavour", "Flavor"],
      regionalNames: [],
      severity: "green",
      reason:
        "Powerful savoury flavour enhancer blend often used with MSG/glutamates to intensify processed food taste.",
      healthConcernType: "nucleotide_flavour_enhancer",
      warningLabel: "FLAVOUR ENHANCER FOUND",
      userFacingReason:
        "This product contains ribonucleotide flavour enhancers, used to intensify savoury taste. Truthlabel flags this as a strong added flavour-boosting system.",
      matchingNotes:
        "Match disodium ribonucleotides, disodium 5'-ribonucleotides, calcium ribonucleotides, E634, E635, INS 634, and INS 635.",
      scoringImpact: "yellow_flavour_enhancer",
      dataStatus: "starter"
    },

    {
      id: "yeast_extract",
      mainName: "Yeast Extract",
      otherNames: [
        "Yeast extract",
        "Yeast extracts",
        "Nutritional yeast extract",
        "Yeast autolysate",
        "Yeast seasoning"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Natural flavour yeast extract",
        "Natural flavor yeast extract",
        "Flavour enhancer yeast extract",
        "Flavor enhancer yeast extract"
      ],
      spellingVariants: ["Flavour", "Flavor"],
      regionalNames: [],
      severity: "green",
      reason:
        "Savoury flavouring ingredient often used to create umami taste in processed foods.",
      healthConcernType: "savoury_flavouring_umami_marker",
      warningLabel: "FLAVOURING SYSTEM FOUND",
      userFacingReason:
        "This product contains yeast extract, a savoury flavouring ingredient used to boost umami taste. Truthlabel flags this because flavour is being built with an added taste system.",
      matchingNotes:
        "Match yeast extract, yeast extracts, nutritional yeast extract, yeast autolysate, and yeast seasoning.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "autolyzed_yeast_extract",
      mainName: "Autolyzed Yeast Extract",
      otherNames: [
        "Autolyzed yeast extract",
        "Autolysed yeast extract",
        "Autolyzed yeast",
        "Autolysed yeast",
        "Yeast autolysate"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["AYE"],
      labelVariants: [
        "Natural flavour autolyzed yeast extract",
        "Natural flavor autolyzed yeast extract",
        "Flavour enhancer autolyzed yeast extract",
        "Flavor enhancer autolyzed yeast extract"
      ],
      spellingVariants: [
        "Autolyzed",
        "Autolysed",
        "Flavour",
        "Flavor"
      ],
      regionalNames: [],
      severity: "green",
      reason:
        "Processed yeast-derived flavouring used to intensify savoury taste.",
      healthConcernType: "savoury_flavouring_umami_marker",
      warningLabel: "FLAVOURING SYSTEM FOUND",
      userFacingReason:
        "This product contains autolyzed yeast extract, a processed savoury flavouring used to boost taste. Truthlabel flags this as an added flavour system.",
      matchingNotes:
        "Match autolyzed/autolysed yeast extract, autolyzed/autolysed yeast, yeast autolysate, and AYE.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "hydrolyzed_protein_flavourings",
      mainName: "Hydrolyzed Protein Flavourings",
      otherNames: [
        "Hydrolyzed vegetable protein",
        "Hydrolysed vegetable protein",
        "Hydrolyzed plant protein",
        "Hydrolysed plant protein",
        "Hydrolyzed soy protein",
        "Hydrolysed soy protein",
        "Hydrolyzed corn protein",
        "Hydrolysed corn protein",
        "Hydrolyzed wheat protein",
        "Hydrolysed wheat protein",
        "Hydrolyzed pea protein",
        "Hydrolysed pea protein",
        "Hydrolyzed maize protein",
        "Hydrolysed maize protein",
        "Hydrolyzed protein",
        "Hydrolysed protein",
        "Hydrolyzed collagen",
        "Hydrolysed collagen"
      ],
      chemicalNames: [
        "Protein hydrolysate",
        "Vegetable protein hydrolysate",
        "Plant protein hydrolysate"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [
        "HVP",
        "HPP",
        "HSP",
        "HCP"
      ],
      labelVariants: [
        "Flavouring hydrolyzed vegetable protein",
        "Flavoring hydrolyzed vegetable protein",
        "Flavour enhancer HVP",
        "Flavor enhancer HVP",
        "Savory flavouring HVP",
        "Savoury flavouring HVP"
      ],
      spellingVariants: [
        "Hydrolyzed",
        "Hydrolysed",
        "Flavor",
        "Flavour",
        "Savory",
        "Savoury"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Hydrolyzed protein flavourings are used to build savoury taste and processed flavour intensity.",
      healthConcernType: "hydrolyzed_protein_flavouring",
      warningLabel: "PROCESSED FLAVOURING FOUND",
      userFacingReason:
        "This product contains hydrolyzed protein flavouring, used to build savoury processed taste. Truthlabel flags this as an added flavour-construction ingredient.",
      matchingNotes:
        "Match hydrolyzed/hydrolysed vegetable protein, plant protein, soy protein, wheat protein, corn/maize protein, HVP, HPP, HSP, and protein hydrolysate.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "natural_flavourings",
      mainName: "Natural Flavourings",
      otherNames: [
        "Natural flavour",
        "Natural flavor",
        "Natural flavours",
        "Natural flavors",
        "Natural flavouring",
        "Natural flavoring",
        "Natural flavourings",
        "Natural flavorings",
        "Natural aroma",
        "Natural aromatic substances",
        "Natural flavouring substances",
        "Natural flavoring substances"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Flavouring: natural flavour",
        "Flavoring: natural flavor",
        "Natural flavour added",
        "Natural flavor added",
        "Contains natural flavours",
        "Contains natural flavors"
      ],
      spellingVariants: [
        "Flavour",
        "Flavor",
        "Flavouring",
        "Flavoring"
      ],
      regionalNames: [
        "Aroma",
        "Natural aroma"
      ],
      severity: "yellow",
      reason:
        "Broad flavouring term that may hide the exact flavouring substances used.",
      healthConcernType: "vague_flavouring_label",
      warningLabel: "VAGUE FLAVOURING FOUND",
      userFacingReason:
        "This product lists natural flavouring. Truthlabel flags this because the exact flavouring ingredients are not clearly shown on the label.",
      matchingNotes:
        "Match natural flavour/flavor, natural flavouring/flavoring, natural aroma, natural aromatic substances, and natural flavouring substances.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "artificial_flavourings",
      mainName: "Artificial Flavourings",
      otherNames: [
        "Artificial flavour",
        "Artificial flavor",
        "Artificial flavours",
        "Artificial flavors",
        "Artificial flavouring",
        "Artificial flavoring",
        "Artificial flavourings",
        "Artificial flavorings",
        "Artificial aroma",
        "Synthetic flavour",
        "Synthetic flavor",
        "Synthetic flavouring",
        "Synthetic flavoring"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Flavouring: artificial flavour",
        "Flavoring: artificial flavor",
        "Artificial flavour added",
        "Artificial flavor added",
        "Artificially flavoured",
        "Artificially flavored"
      ],
      spellingVariants: [
        "Flavour",
        "Flavor",
        "Flavouring",
        "Flavoring",
        "Flavoured",
        "Flavorored",
        "Flavored"
      ],
      regionalNames: [
        "Artificial aroma"
      ],
      severity: "yellow",
      reason:
        "Artificial flavouring used to create or imitate taste through added flavour substances.",
      healthConcernType: "artificial_flavouring",
      warningLabel: "ARTIFICIAL FLAVOURING FOUND",
      userFacingReason:
        "This product contains artificial flavouring. Truthlabel flags this because the product's taste is being created or boosted with artificial flavour technology.",
      matchingNotes:
        "Match artificial flavour/flavor, artificial flavouring/flavoring, synthetic flavour/flavor, artificial aroma, and artificially flavoured/flavored.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "generic_flavouring_terms",
      mainName: "Generic Flavouring Terms",
      otherNames: [
        "Flavouring",
        "Flavoring",
        "Flavourings",
        "Flavorings",
        "Flavour",
        "Flavor",
        "Aroma",
        "Aromas",
        "Aromatic substances",
        "Flavouring substances",
        "Flavoring substances",
        "Flavour preparation",
        "Flavor preparation",
        "Flavour preparations",
        "Flavor preparations"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Added flavouring",
        "Added flavoring",
        "Contains flavourings",
        "Contains flavorings",
        "With flavouring",
        "With flavoring"
      ],
      spellingVariants: [
        "Flavour",
        "Flavor",
        "Flavouring",
        "Flavoring"
      ],
      regionalNames: [
        "Aroma",
        "Aromas"
      ],
      severity: "yellow",
      reason:
        "Generic flavouring label terms do not fully reveal the exact substances used to create taste.",
      healthConcernType: "vague_flavouring_label",
      warningLabel: "VAGUE FLAVOURING FOUND",
      userFacingReason:
        "This product uses a generic flavouring term. Truthlabel flags this because the exact flavouring substances are not clearly disclosed.",
      matchingNotes:
        "Match flavouring/flavoring, flavourings/flavorings, aroma, aromas, aromatic substances, and flavour/flavor preparation.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "smoke_flavourings",
      mainName: "Smoke Flavourings",
      otherNames: [
        "Smoke flavour",
        "Smoke flavor",
        "Smoke flavouring",
        "Smoke flavoring",
        "Natural smoke flavour",
        "Natural smoke flavor",
        "Artificial smoke flavour",
        "Artificial smoke flavor",
        "Liquid smoke",
        "Smoke extract",
        "Wood smoke flavour",
        "Wood smoke flavor",
        "Hickory smoke flavour",
        "Hickory smoke flavor",
        "Mesquite smoke flavour",
        "Mesquite smoke flavor"
      ],
      chemicalNames: [
        "Smoke condensate",
        "Primary smoke condensate",
        "Smoke flavouring preparation"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Flavouring: smoke flavour",
        "Flavoring: smoke flavor",
        "Natural smoke flavour added",
        "Natural smoke flavor added",
        "Smoke flavour added",
        "Smoke flavor added"
      ],
      spellingVariants: [
        "Flavour",
        "Flavor",
        "Flavouring",
        "Flavoring"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Smoke flavouring creates smoked taste without traditional smoking or in addition to it.",
      healthConcernType: "smoke_flavouring_system",
      warningLabel: "SMOKE FLAVOURING FOUND",
      userFacingReason:
        "This product contains smoke flavouring. Truthlabel flags this because smoked taste may be added through a flavouring system rather than coming only from traditional smoking.",
      matchingNotes:
        "Match smoke flavour/flavor, natural smoke flavour/flavor, artificial smoke flavour/flavor, liquid smoke, smoke extract, and wood/hickory/mesquite smoke flavour terms.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "meat_flavour_systems",
      mainName: "Meat Flavour Systems",
      otherNames: [
        "Beef flavour",
        "Beef flavor",
        "Chicken flavour",
        "Chicken flavor",
        "Pork flavour",
        "Pork flavor",
        "Bacon flavour",
        "Bacon flavor",
        "Meat flavour",
        "Meat flavor",
        "Roast flavour",
        "Roast flavor",
        "Grilled meat flavour",
        "Grilled meat flavor",
        "Barbecue flavour",
        "Barbecue flavor",
        "BBQ flavour",
        "BBQ flavor"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["BBQ"],
      labelVariants: [
        "Artificial beef flavour",
        "Artificial beef flavor",
        "Natural beef flavour",
        "Natural beef flavor",
        "Chicken flavouring",
        "Chicken flavoring",
        "Meat flavouring",
        "Meat flavoring"
      ],
      spellingVariants: [
        "Flavour",
        "Flavor",
        "Flavouring",
        "Flavoring"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Meat-style flavouring systems can be used to create or intensify meat taste, especially in processed meats, snacks, sauces, noodles, and plant-based products.",
      healthConcernType: "meat_like_flavour_system",
      warningLabel: "MEAT-LIKE FLAVOURING FOUND",
      userFacingReason:
        "This product contains meat-style flavouring. Truthlabel flags this because meat-like taste may be built or boosted with added flavour systems.",
      matchingNotes:
        "Match beef/chicken/pork/bacon/meat flavour/flavor, BBQ flavour/flavor, roast flavour/flavor, grilled meat flavour/flavor, and related flavouring terms.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "dairy_butter_cheese_flavour_systems",
      mainName: "Dairy / Butter / Cheese Flavour Systems",
      otherNames: [
        "Cheese flavour",
        "Cheese flavor",
        "Butter flavour",
        "Butter flavor",
        "Cream flavour",
        "Cream flavor",
        "Milk flavour",
        "Milk flavor",
        "Dairy flavour",
        "Dairy flavor",
        "Yoghurt flavour",
        "Yogurt flavor",
        "Buttery flavour",
        "Buttery flavor",
        "Creamy flavour",
        "Creamy flavor"
      ],
      chemicalNames: [
        "Diacetyl",
        "Acetoin",
        "Acetyl propionyl",
        "2,3-pentanedione"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Artificial cheese flavour",
        "Artificial cheese flavor",
        "Natural cheese flavour",
        "Natural cheese flavor",
        "Butter flavouring",
        "Butter flavoring",
        "Buttery flavouring",
        "Buttery flavoring"
      ],
      spellingVariants: [
        "Yoghurt",
        "Yogurt",
        "Flavour",
        "Flavor",
        "Flavouring",
        "Flavoring"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Dairy-style flavouring systems can be used to create cheese, butter, cream, milk, or yoghurt-like taste in processed foods.",
      healthConcernType: "dairy_like_flavour_system",
      warningLabel: "DAIRY-LIKE FLAVOURING FOUND",
      userFacingReason:
        "This product contains dairy-style flavouring. Truthlabel flags this because cheese, butter, cream, or dairy-like taste may be built with added flavour systems.",
      matchingNotes:
        "Match cheese/butter/cream/milk/dairy/yoghurt/yogurt flavour/flavor, buttery/creamy flavour terms, diacetyl, acetoin, acetyl propionyl, and 2,3-pentanedione when used as flavouring.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "vanilla_flavour_systems",
      mainName: "Vanilla Flavour Systems",
      otherNames: [
        "Vanillin",
        "Ethyl vanillin",
        "Vanilla flavour",
        "Vanilla flavor",
        "Artificial vanilla flavour",
        "Artificial vanilla flavor",
        "Natural vanilla flavour",
        "Natural vanilla flavor",
        "Vanilla flavouring",
        "Vanilla flavoring"
      ],
      chemicalNames: [
        "4-hydroxy-3-methoxybenzaldehyde",
        "3-ethoxy-4-hydroxybenzaldehyde"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Artificial vanilla",
        "Imitation vanilla",
        "Vanilla flavour added",
        "Vanilla flavor added",
        "Vanillin flavouring",
        "Ethyl vanillin flavouring"
      ],
      spellingVariants: [
        "Flavour",
        "Flavor",
        "Flavouring",
        "Flavoring"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Vanilla flavour systems are used to create vanilla-like taste, sometimes without whole vanilla ingredients.",
      healthConcernType: "flavouring_system",
      warningLabel: "FLAVOURING SYSTEM FOUND",
      userFacingReason:
        "This product contains vanilla flavouring or vanillin. Truthlabel flags this because vanilla-like taste may be built with added flavouring substances rather than coming only from whole vanilla.",
      matchingNotes:
        "Match vanillin, ethyl vanillin, vanilla flavour/flavor, artificial vanilla, imitation vanilla, and vanilla flavouring/flavoring.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "maltol_ethyl_maltol",
      mainName: "Maltol / Ethyl Maltol",
      otherNames: [
        "Maltol",
        "Ethyl maltol",
        "Veltol",
        "Ethylmaltol"
      ],
      chemicalNames: [
        "3-hydroxy-2-methyl-4-pyrone",
        "2-ethyl-3-hydroxy-4-pyrone"
      ],
      brandNames: ["Veltol"],
      eNumbers: ["E636", "E-636", "E637", "E-637"],
      insNumbers: ["636", "INS 636", "637", "INS 637"],
      abbreviations: [],
      labelVariants: [
        "Flavour enhancer E636",
        "Flavor enhancer E636",
        "Flavour enhancer E637",
        "Flavor enhancer E637",
        "Sweet flavour enhancer",
        "Sweet flavor enhancer"
      ],
      spellingVariants: ["Flavour", "Flavor"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Flavour enhancer used to intensify sweet, caramel, candy, baked, or creamy notes.",
      healthConcernType: "sweet_flavour_enhancer",
      warningLabel: "FLAVOUR ENHANCER FOUND",
      userFacingReason:
        "This product contains maltol or ethyl maltol, flavour enhancers used to intensify sweet or caramel-like taste. Truthlabel flags this as an added flavour-enhancing system.",
      matchingNotes:
        "Match maltol, ethyl maltol, ethylmaltol, Veltol, E636, E637, and INS variants.",
      scoringImpact: "yellow_flavour_enhancer",
      dataStatus: "starter"
    },

    {
      id: "glycine_and_glycinates",
      mainName: "Glycine / Glycinates",
      otherNames: [
        "Glycine",
        "Sodium glycinate",
        "Glycinates"
      ],
      chemicalNames: [
        "Aminoacetic acid",
        "Sodium aminoacetate"
      ],
      brandNames: [],
      eNumbers: ["E640", "E-640"],
      insNumbers: ["640", "INS 640"],
      abbreviations: [],
      labelVariants: [
        "Flavour enhancer E640",
        "Flavor enhancer E640",
        "Flavour modifier glycine",
        "Flavor modifier glycine"
      ],
      spellingVariants: ["Flavour", "Flavor"],
      regionalNames: [],
      severity: "green",
      reason:
        "Flavour enhancer or modifier used in some processed foods.",
      healthConcernType: "flavour_enhancer_modifier",
      warningLabel: "FLAVOUR ENHANCER FOUND",
      userFacingReason:
        "This product contains glycine or glycinates used as a flavour enhancer or modifier. Truthlabel flags this as an added taste-modifying ingredient.",
      matchingNotes:
        "Match glycine, sodium glycinate, glycinates, E640, and INS 640.",
      scoringImpact: "yellow_flavour_enhancer",
      dataStatus: "starter"
    },

    {
      id: "reaction_flavours_process_flavours",
      mainName: "Reaction / Process Flavours",
      otherNames: [
        "Reaction flavour",
        "Reaction flavor",
        "Reaction flavours",
        "Reaction flavors",
        "Process flavour",
        "Process flavor",
        "Processed flavour",
        "Processed flavor",
        "Thermal process flavour",
        "Thermal process flavor",
        "Maillard reaction flavour",
        "Maillard reaction flavor",
        "Roasted flavouring",
        "Roasted flavoring"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Natural reaction flavour",
        "Natural reaction flavor",
        "Artificial reaction flavour",
        "Artificial reaction flavor",
        "Process flavouring",
        "Process flavoring"
      ],
      spellingVariants: [
        "Flavour",
        "Flavor",
        "Flavouring",
        "Flavoring"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Reaction/process flavours are manufactured flavour systems used to create cooked, roasted, savoury, meaty, or browned taste notes.",
      healthConcernType: "manufactured_flavour_system",
      warningLabel: "MANUFACTURED FLAVOUR SYSTEM FOUND",
      userFacingReason:
        "This product contains reaction or process flavours. Truthlabel flags this because cooked, roasted, savoury, or meat-like taste may be manufactured through flavour technology.",
      matchingNotes:
        "Match reaction flavour/flavor, process flavour/flavor, thermal process flavour/flavor, Maillard reaction flavour/flavor, and roasted flavouring/flavoring.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "seasoning_blends_vague",
      mainName: "Vague Seasoning Blends",
      otherNames: [
        "Seasoning",
        "Seasonings",
        "Seasoning blend",
        "Flavour blend",
        "Flavor blend",
        "Spice blend",
        "Spices",
        "Mixed spices",
        "Herbs and spices",
        "Natural seasoning",
        "Seasoning mix"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Contains seasoning",
        "Contains flavour blend",
        "Contains flavor blend",
        "Spices and flavouring",
        "Spices and flavoring"
      ],
      spellingVariants: ["Flavour", "Flavor"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Broad seasoning terms may hide the exact flavouring components, taste enhancers, carriers, or processing aids used.",
      healthConcernType: "vague_seasoning_label",
      warningLabel: "VAGUE SEASONING FOUND",
      userFacingReason:
        "This product uses a vague seasoning or flavour blend term. Truthlabel flags this because the exact taste-building ingredients are not fully shown on the label.",
      matchingNotes:
        "Match seasoning, seasonings, seasoning blend, flavour/flavor blend, spice blend, spices, mixed spices, herbs and spices, natural seasoning, and seasoning mix. Do not treat simple named spices like garlic or black pepper as this vague marker.",
      scoringImpact: "yellow_flavouring",
      dataStatus: "starter"
    },

    {
      id: "safrole",
      mainName: "Safrole",
      otherNames: [
        "Safrole",
        "Sassafras oil constituent",
        "Sassafras oil",
        "4-Allyl-1,2-methylenedioxybenzene",
        "1,3-Benzodioxole, 5-(2-propenyl)-",
        "5-(2-propenyl)-1,3-benzodioxole"
      ],
      chemicalNames: [
        "4-Allyl-1,2-methylenedioxybenzene"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Safrole flavouring",
        "Safrole flavoring",
        "Sassafras flavouring",
        "Sassafras flavoring"
      ],
      spellingVariants: ["Flavouring", "Flavoring"],
      regionalNames: [],
      severity: "red",
      reason:
        "Safrole is prohibited/restricted for food use in some regions and belongs in Banned / Restricted Items as well.",
      healthConcernType: "banned_restricted_flavouring",
      warningLabel: "BANNED / RESTRICTED FLAVOURING",
      userFacingReason:
        "This product contains safrole or a safrole-related flavouring marker. Truthlabel flags this as a serious regulatory concern because safrole is prohibited/restricted for food use in some regions.",
      matchingNotes:
        "Match safrole, sassafras oil constituent, sassafras oil, and chemical names. Also link to Banned / Restricted Items.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core"
    },

    {
      id: "added_coumarin_tonka",
      mainName: "Added Coumarin / Tonka Bean Extract",
      otherNames: [
        "Coumarin",
        "Added coumarin",
        "Tonka bean",
        "Tonka beans",
        "Tonka bean extract",
        "Tonka extract",
        "1,2-benzopyrone",
        "Benzopyrone"
      ],
      chemicalNames: [
        "1,2-benzopyrone",
        "2H-1-benzopyran-2-one"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Coumarin flavouring",
        "Coumarin flavoring",
        "Tonka flavouring",
        "Tonka flavoring",
        "Tonka extract flavouring",
        "Tonka extract flavoring"
      ],
      spellingVariants: ["Flavouring", "Flavoring"],
      regionalNames: [],
      severity: "red",
      reason:
        "Added coumarin or coumarin from tonka bean extract is prohibited/restricted for food use in some regions and belongs in Banned / Restricted Items as well.",
      healthConcernType: "banned_restricted_flavouring",
      warningLabel: "BANNED / RESTRICTED FLAVOURING",
      userFacingReason:
        "This product contains added coumarin or tonka bean extract, which is prohibited/restricted for food use in some regions. Truthlabel flags this as a serious regulatory concern.",
      matchingNotes:
        "Match coumarin, added coumarin, tonka bean, tonka bean extract, tonka extract, 1,2-benzopyrone, and benzopyrone. Do not confuse normal trace coumarin in cinnamon unless separate rules are added.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core"
    },

    {
      id: "calamus_sweet_flag",
      mainName: "Calamus / Sweet Flag",
      otherNames: [
        "Calamus",
        "Sweet flag",
        "Calamus root",
        "Acorus calamus",
        "Sweet cane",
        "Sweet cinnamon",
        "Sweetroot",
        "Myrtle flag",
        "Flagroot",
        "Sweet grass",
        "Calamus oil",
        "Calamus extract"
      ],
      chemicalNames: ["Acorus calamus"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Calamus flavouring",
        "Calamus flavoring",
        "Sweet flag flavouring",
        "Sweet flag flavoring"
      ],
      spellingVariants: ["Flavouring", "Flavoring"],
      regionalNames: [],
      severity: "red",
      reason:
        "Calamus and its derivatives are prohibited/restricted for food use in some regions and belong in Banned / Restricted Items as well.",
      healthConcernType: "banned_restricted_flavouring",
      warningLabel: "BANNED / RESTRICTED FLAVOURING",
      userFacingReason:
        "This product contains calamus or sweet flag, which is prohibited/restricted for food use in some regions. Truthlabel flags this as a serious regulatory concern.",
      matchingNotes:
        "Match calamus, sweet flag, calamus root, Acorus calamus, calamus oil, and calamus extract. Also link to Banned / Restricted Items.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core"
    },

    {
      id: "cinnamyl_anthranilate",
      mainName: "Cinnamyl Anthranilate",
      otherNames: [
        "Cinnamyl anthranilate",
        "Cinnamyl 2-aminobenzoate",
        "Cinnamyl o-aminobenzoate"
      ],
      chemicalNames: [
        "Cinnamyl 2-aminobenzoate",
        "Cinnamyl o-aminobenzoate"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Cinnamyl anthranilate flavouring",
        "Cinnamyl anthranilate flavoring"
      ],
      spellingVariants: ["Flavouring", "Flavoring"],
      regionalNames: [],
      severity: "red",
      reason:
        "Cinnamyl anthranilate is prohibited/restricted for direct addition to human food in some regions and belongs in Banned / Restricted Items as well.",
      healthConcernType: "banned_restricted_flavouring",
      warningLabel: "BANNED / RESTRICTED FLAVOURING",
      userFacingReason:
        "This product contains cinnamyl anthranilate, a flavouring substance prohibited/restricted for food use in some regions. Truthlabel flags this as a serious regulatory concern.",
      matchingNotes:
        "Match cinnamyl anthranilate, cinnamyl 2-aminobenzoate, and cinnamyl o-aminobenzoate. Also link to Banned / Restricted Items.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core"
    }
  ],

  categoryScoringRules: {
    noFlavouringsFound: {
      severity: "green",
      display: "No",
      scoreImpact: 0
    },
    oneToThreeFlavourSystems: {
      severity: "yellow",
      display: "yellow_count_badge",
      scoreImpact: 8,
      reason:
        "Product contains added flavorings, flavor enhancers, or taste-building systems."
    },
    fourOrMoreFlavourSystems: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: 22,
      reason:
        "Product contains multiple flavoring or flavor-enhancing systems. Truthlabel treats this as a high flavor-system load."
    },
    anyBannedRestrictedFlavouring: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: "automatic_red",
      examples: [
        "safrole",
        "added_coumarin_tonka",
        "calamus_sweet_flag",
        "cinnamyl_anthranilate"
      ],
      reason:
        "Ingredient also appears in Banned / Restricted Items."
    }
  },

  finalVerdictRules: {
    yellow:
      "This product contains flavorings or flavor enhancers. Truthlabel flags this because the product's taste may be built or boosted with added flavor systems.",
    redLoad:
      "This product contains multiple flavoring or flavor-enhancing systems. Truthlabel flags this as a high flavor-system load.",
    redRestricted:
      "This product contains a banned or restricted flavoring ingredient. Truthlabel flags this as a serious regulatory concern."
  },

  matchingNormalizationRules: [
    "lowercase all ingredient text",
    "remove punctuation",
    "remove brackets",
    "collapse extra spaces",
    "normalize flavour and flavor",
    "normalize flavouring and flavoring",
    "normalize flavoured and flavored",
    "normalize savoury and savory",
    "normalize hydrolysed and hydrolyzed",
    "normalize autolysed and autolyzed",
    "normalize E-numbers with and without hyphen",
    "normalize INS numbers",
    "normalize 5'-ribonucleotides, 5 ribonucleotides, and ribonucleotides",
    "do not double count the same flavouring if abbreviation and full name both appear",
    "do not double count if name and E-number both appear"
  ]
} as const;

export type FlavourEnhancersFlavouringsDataPack = typeof flavourEnhancersFlavouringsDataPack;
export type FlavourEnhancersFlavouringsItem = (typeof flavourEnhancersFlavouringsDataPack.items)[number];
