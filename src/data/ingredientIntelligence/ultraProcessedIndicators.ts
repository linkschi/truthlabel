export const ultraProcessedIndicatorsDataPack = {
  id: "ultra_processed_indicators",
  categoryName: "Ultra-Processed Indicators",
  categoryMeaning:
    "This category detects ingredients and label terms that suggest a food is industrially built, reconstructed, shelf-stabilised, flavour-built, texture-built, or made from processed ingredient systems rather than simple whole ingredients.",
  dataStatus: "starter_needs_expansion",
  defaultCategorySeverity: "yellow",

  items: [
    {
      id: "maltodextrin",
      mainName: "Maltodextrin",
      otherNames: [
        "Maltodextrin",
        "Corn maltodextrin",
        "Maize maltodextrin",
        "Wheat maltodextrin",
        "Potato maltodextrin",
        "Rice maltodextrin",
        "Tapioca maltodextrin",
        "Dextrin",
        "Dextrins"
      ],
      chemicalNames: [
        "Glucose polymers",
        "Hydrolysed starch",
        "Hydrolyzed starch"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Maltodextrin",
        "Corn maltodextrin",
        "Maize maltodextrin",
        "Bulking agent maltodextrin",
        "Carrier maltodextrin"
      ],
      spellingVariants: [
        "Hydrolysed",
        "Hydrolyzed"
      ],
      regionalNames: [
        "Maize maltodextrin"
      ],
      severity: "yellow",
      reason:
        "Highly processed starch-derived ingredient used as a bulking agent, carrier, texture modifier, or sweetness/body builder.",
      healthConcernType: "ultra_processed_starch_marker",
      warningLabel: "ULTRA-PROCESSED MARKER FOUND",
      userFacingReason:
        "This product contains maltodextrin, a processed starch-derived ingredient used to build body, texture, or carry flavours. Truthlabel flags this as an ultra-processed marker.",
      matchingNotes:
        "Match maltodextrin, corn/maize/wheat/potato/rice/tapioca maltodextrin, dextrin, and dextrins. Do not double count source-specific and generic maltodextrin if they refer to the same ingredient.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "glucose_syrup_corn_syrup_solids",
      mainName: "Glucose Syrup / Corn Syrup Solids",
      otherNames: [
        "Glucose syrup",
        "Corn syrup",
        "Corn syrup solids",
        "Dried glucose syrup",
        "Dried corn syrup",
        "Maize syrup",
        "Glucose-fructose syrup",
        "Glucose fructose syrup",
        "Fructose-glucose syrup",
        "Fructose glucose syrup",
        "High fructose corn syrup",
        "HFCS",
        "Invert sugar syrup",
        "Refiners syrup"
      ],
      chemicalNames: [
        "Hydrolysed starch syrup",
        "Hydrolyzed starch syrup",
        "Starch hydrolysate syrup"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [
        "HFCS"
      ],
      labelVariants: [
        "Glucose syrup",
        "Corn syrup solids",
        "Dried glucose syrup",
        "Glucose-fructose syrup",
        "High fructose corn syrup"
      ],
      spellingVariants: [
        "Glucose-fructose",
        "Glucose fructose",
        "Fructose-glucose",
        "Fructose glucose",
        "Hydrolysed",
        "Hydrolyzed"
      ],
      regionalNames: [
        "Maize syrup"
      ],
      severity: "yellow",
      reason:
        "Processed syrup or syrup solid used to build sweetness, body, texture, browning, and shelf stability.",
      healthConcernType: "processed_sweetening_system",
      warningLabel: "PROCESSED SWEETENING SYSTEM FOUND",
      userFacingReason:
        "This product contains a processed syrup or syrup-solid ingredient. Truthlabel flags this because sweetness, body, or texture is being built with an industrial sweetening system.",
      matchingNotes:
        "Match glucose syrup, corn syrup, corn syrup solids, dried glucose syrup, HFCS, glucose-fructose syrup, fructose-glucose syrup, and invert sugar syrup.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "modified_starches",
      mainName: "Modified Starches",
      otherNames: [
        "Modified starch",
        "Modified food starch",
        "Modified corn starch",
        "Modified maize starch",
        "Modified potato starch",
        "Modified tapioca starch",
        "Modified wheat starch",
        "Pregelatinized starch",
        "Pregelatinised starch",
        "Oxidized starch",
        "Oxidised starch",
        "Distarch phosphate",
        "Acetylated distarch phosphate",
        "Hydroxypropyl starch",
        "Hydroxypropyl distarch phosphate",
        "Starch sodium octenyl succinate"
      ],
      chemicalNames: [
        "Chemically modified starch",
        "Oxidised starch",
        "Oxidized starch",
        "Distarch phosphate",
        "Acetylated distarch phosphate",
        "Hydroxypropyl distarch phosphate"
      ],
      brandNames: [],
      eNumbers: [
        "E1404",
        "E-1404",
        "E1410",
        "E-1410",
        "E1412",
        "E-1412",
        "E1413",
        "E-1413",
        "E1414",
        "E-1414",
        "E1420",
        "E-1420",
        "E1422",
        "E-1422",
        "E1440",
        "E-1440",
        "E1442",
        "E-1442",
        "E1450",
        "E-1450",
        "E1451",
        "E-1451"
      ],
      insNumbers: [
        "INS 1404",
        "INS 1410",
        "INS 1412",
        "INS 1413",
        "INS 1414",
        "INS 1420",
        "INS 1422",
        "INS 1440",
        "INS 1442",
        "INS 1450",
        "INS 1451"
      ],
      abbreviations: [],
      labelVariants: [
        "Modified food starch",
        "Modified starch thickener",
        "Thickener modified starch",
        "Stabiliser modified starch",
        "Stabilizer modified starch"
      ],
      spellingVariants: [
        "Pregelatinized",
        "Pregelatinised",
        "Oxidized",
        "Oxidised",
        "Stabiliser",
        "Stabilizer"
      ],
      regionalNames: [
        "Modified maize starch"
      ],
      severity: "yellow",
      reason:
        "Modified starches are industrial texture builders used to thicken, bind water, stabilise, and rebuild processed food structure.",
      healthConcernType: "modified_starch_ultra_processed_marker",
      warningLabel: "MODIFIED STARCH FOUND",
      userFacingReason:
        "This product contains modified starch, used to thicken, bind, or stabilise processed food texture. Truthlabel flags this as an ultra-processed texture marker.",
      matchingNotes:
        "Match modified starch, modified food starch, named modified starches, E1404, E1410, E1412, E1413, E1414, E1420, E1422, E1440, E1442, E1450, E1451, and INS variants.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "protein_isolates_concentrates",
      mainName: "Protein Isolates / Concentrates",
      otherNames: [
        "Protein isolate",
        "Protein isolates",
        "Protein concentrate",
        "Protein concentrates",
        "Soy protein isolate",
        "Soya protein isolate",
        "Pea protein isolate",
        "Whey protein isolate",
        "Milk protein isolate",
        "Wheat protein isolate",
        "Soy protein concentrate",
        "Soya protein concentrate",
        "Pea protein concentrate",
        "Whey protein concentrate",
        "Milk protein concentrate",
        "Textured vegetable protein",
        "Textured soy protein",
        "Textured pea protein",
        "Texturised vegetable protein",
        "Texturised soy protein"
      ],
      chemicalNames: [
        "Isolated plant protein",
        "Isolated milk protein",
        "Concentrated protein fraction"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [
        "TVP",
        "TSP",
        "SPI",
        "WPI",
        "WPC",
        "MPC",
        "MPI"
      ],
      labelVariants: [
        "Soy protein isolate",
        "Pea protein isolate",
        "Whey protein isolate",
        "Milk protein concentrate",
        "Textured vegetable protein",
        "Texturised vegetable protein"
      ],
      spellingVariants: [
        "Textured",
        "Texturised",
        "Soy",
        "Soya"
      ],
      regionalNames: [
        "Soya protein"
      ],
      severity: "yellow",
      reason:
        "Isolated or concentrated protein fractions are often used to rebuild texture, increase protein claims, or create meat/dairy-like structure.",
      healthConcernType: "isolated_protein_ultra_processed_marker",
      warningLabel: "PROTEIN ISOLATE / CONCENTRATE FOUND",
      userFacingReason:
        "This product contains protein isolates, concentrates, or textured proteins. Truthlabel flags this because the food may be built from isolated ingredient fractions rather than simple whole ingredients.",
      matchingNotes:
        "Match protein isolate, protein concentrate, soy/soya/pea/whey/milk/wheat protein isolate or concentrate, TVP, TSP, SPI, WPI, WPC, MPC, and MPI.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "hydrolyzed_proteins",
      mainName: "Hydrolyzed Proteins",
      otherNames: [
        "Hydrolyzed protein",
        "Hydrolysed protein",
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
        "Hydrolyzed collagen",
        "Hydrolysed collagen",
        "Protein hydrolysate"
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
        "HSP"
      ],
      labelVariants: [
        "Hydrolyzed vegetable protein",
        "Hydrolysed vegetable protein",
        "Protein hydrolysate",
        "Flavouring hydrolyzed protein",
        "Flavoring hydrolyzed protein"
      ],
      spellingVariants: [
        "Hydrolyzed",
        "Hydrolysed",
        "Flavor",
        "Flavour"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Processed protein ingredient used to build savoury flavour, texture, or functional performance.",
      healthConcernType: "hydrolyzed_protein_ultra_processed_marker",
      warningLabel: "HYDROLYZED PROTEIN FOUND",
      userFacingReason:
        "This product contains hydrolyzed protein, a processed protein ingredient often used to build flavour or function. Truthlabel flags this as an ultra-processed marker.",
      matchingNotes:
        "Match hydrolyzed/hydrolysed protein, hydrolyzed vegetable/plant/soy/corn/wheat protein, protein hydrolysate, HVP, HPP, and HSP.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "emulsifier_systems",
      mainName: "Emulsifier Systems",
      otherNames: [
        "Emulsifier",
        "Emulsifiers",
        "Lecithin",
        "Soy lecithin",
        "Soya lecithin",
        "Sunflower lecithin",
        "Mono- and diglycerides",
        "Mono and diglycerides",
        "Monoglycerides",
        "Diglycerides",
        "DATEM",
        "Polysorbate",
        "Polysorbate 80",
        "PGPR",
        "Sucrose esters",
        "Polyglycerol esters"
      ],
      chemicalNames: [
        "Glycerol esters of fatty acids",
        "Polysorbates",
        "Polyglycerol polyricinoleate"
      ],
      brandNames: [],
      eNumbers: [
        "E322",
        "E471",
        "E472e",
        "E433",
        "E476",
        "E473",
        "E475"
      ],
      insNumbers: [
        "INS 322",
        "INS 471",
        "INS 472e",
        "INS 433",
        "INS 476",
        "INS 473",
        "INS 475"
      ],
      abbreviations: [
        "DATEM",
        "PGPR"
      ],
      labelVariants: [
        "Emulsifier",
        "Emulsifier E322",
        "Emulsifier E471",
        "Emulsifier E472e",
        "Emulsifier E433",
        "Emulsifier E476"
      ],
      spellingVariants: [
        "Soya",
        "Soy"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Emulsifiers are used to hold processed foods together, stop separation, and create stable industrial textures.",
      healthConcernType: "emulsifier_ultra_processed_marker",
      warningLabel: "EMULSIFIER SYSTEM FOUND",
      userFacingReason:
        "This product contains emulsifiers, used to hold ingredients together and stabilise texture. Truthlabel flags this as an ultra-processed texture marker.",
      matchingNotes:
        "Match generic emulsifier terms and common emulsifiers. Also link to the Emulsifiers / Stabilisers / Thickeners / Gums category. Avoid unfair double scoring in the overall score if the same ingredient is already counted elsewhere.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "gum_thickener_stabiliser_systems",
      mainName: "Gums / Thickeners / Stabilisers",
      otherNames: [
        "Gum",
        "Gums",
        "Thickener",
        "Thickeners",
        "Stabiliser",
        "Stabilizer",
        "Stabilisers",
        "Stabilizers",
        "Xanthan gum",
        "Guar gum",
        "Gellan gum",
        "Locust bean gum",
        "Carob bean gum",
        "Carrageenan",
        "Pectin",
        "Agar",
        "Cellulose gum",
        "Carboxymethyl cellulose",
        "Methylcellulose",
        "Hydroxypropyl methylcellulose"
      ],
      chemicalNames: [
        "Hydrocolloids",
        "Cellulose derivatives",
        "Gelling polysaccharides"
      ],
      brandNames: [],
      eNumbers: [
        "E407",
        "E410",
        "E412",
        "E415",
        "E418",
        "E440",
        "E466",
        "E464"
      ],
      insNumbers: [
        "INS 407",
        "INS 410",
        "INS 412",
        "INS 415",
        "INS 418",
        "INS 440",
        "INS 466",
        "INS 464"
      ],
      abbreviations: [
        "CMC",
        "HPMC"
      ],
      labelVariants: [
        "Thickener",
        "Stabiliser",
        "Stabilizer",
        "Gelling agent",
        "Texture stabiliser",
        "Texture stabilizer"
      ],
      spellingVariants: [
        "Stabiliser",
        "Stabilizer"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gums, thickeners, and stabilisers are used to engineer texture, thickness, suspension, creaminess, or gel structure.",
      healthConcernType: "texture_engineering_ultra_processed_marker",
      warningLabel: "TEXTURE SYSTEM FOUND",
      userFacingReason:
        "This product contains gums, thickeners, or stabilisers. Truthlabel flags this because the product's texture is being engineered or chemically supported.",
      matchingNotes:
        "Match generic gum/thickener/stabiliser terms and common gums. Also link to the Emulsifiers / Stabilisers / Thickeners / Gums category.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "flavouring_systems",
      mainName: "Flavouring Systems",
      otherNames: [
        "Flavour",
        "Flavor",
        "Flavouring",
        "Flavoring",
        "Flavourings",
        "Flavorings",
        "Natural flavour",
        "Natural flavor",
        "Artificial flavour",
        "Artificial flavor",
        "Aroma",
        "Aromas",
        "Smoke flavour",
        "Smoke flavor",
        "Reaction flavour",
        "Reaction flavor",
        "Process flavour",
        "Process flavor"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Natural flavour",
        "Natural flavor",
        "Artificial flavour",
        "Artificial flavor",
        "Flavouring",
        "Flavoring",
        "Aroma",
        "Smoke flavour"
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
        "Flavouring systems can hide the exact taste-building substances used and may show the food's taste is being industrially built.",
      healthConcernType: "flavouring_ultra_processed_marker",
      warningLabel: "FLAVOURING SYSTEM FOUND",
      userFacingReason:
        "This product contains flavouring terms. Truthlabel flags this because the product's taste may be built or boosted with added flavour systems.",
      matchingNotes:
        "Match flavour/flavor terms, natural flavour, artificial flavour, aroma, smoke flavour, reaction flavour, and process flavour. Also link to the Flavour Enhancers / Flavourings category.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "flavour_enhancers",
      mainName: "Flavour Enhancers",
      otherNames: [
        "Flavour enhancer",
        "Flavor enhancer",
        "Monosodium glutamate",
        "MSG",
        "Sodium glutamate",
        "Disodium inosinate",
        "Disodium guanylate",
        "Disodium ribonucleotides",
        "Yeast extract",
        "Autolyzed yeast extract",
        "Autolysed yeast extract"
      ],
      chemicalNames: [
        "Glutamates",
        "Inosinates",
        "Guanylates",
        "Ribonucleotides"
      ],
      brandNames: [
        "Accent",
        "Ajinomoto"
      ],
      eNumbers: [
        "E621",
        "E627",
        "E631",
        "E635"
      ],
      insNumbers: [
        "INS 621",
        "INS 627",
        "INS 631",
        "INS 635"
      ],
      abbreviations: [
        "MSG",
        "I+G"
      ],
      labelVariants: [
        "Flavour enhancer",
        "Flavor enhancer",
        "Flavour enhancer E621",
        "Flavor enhancer E621",
        "Flavour enhancer E635",
        "Flavor enhancer E635"
      ],
      spellingVariants: [
        "Flavour",
        "Flavor",
        "Autolyzed",
        "Autolysed"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Flavour enhancers are used to intensify savoury, sweet, or processed taste impact.",
      healthConcernType: "flavour_enhancer_ultra_processed_marker",
      warningLabel: "FLAVOUR ENHANCER FOUND",
      userFacingReason:
        "This product contains flavour enhancers. Truthlabel flags this because the taste is being boosted with added flavour technology.",
      matchingNotes:
        "Match flavour enhancer terms, MSG, glutamates, inosinates, guanylates, ribonucleotides, yeast extract, E621, E627, E631, E635, and INS variants.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "artificial_colours",
      mainName: "Artificial Colours",
      otherNames: [
        "Artificial colour",
        "Artificial color",
        "Artificial colours",
        "Artificial colors",
        "Colour",
        "Color",
        "Colouring",
        "Coloring",
        "Tartrazine",
        "Sunset Yellow",
        "Allura Red",
        "Brilliant Blue",
        "Red 40",
        "Yellow 5",
        "Yellow 6",
        "Blue 1",
        "Blue 2",
        "Red No. 3"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [
        "E102",
        "E110",
        "E129",
        "E133",
        "E132",
        "E127"
      ],
      insNumbers: [
        "INS 102",
        "INS 110",
        "INS 129",
        "INS 133",
        "INS 132",
        "INS 127"
      ],
      abbreviations: [],
      labelVariants: [
        "Artificial colour",
        "Artificial color",
        "Colouring",
        "Coloring",
        "Added colour",
        "Added color"
      ],
      spellingVariants: [
        "Colour",
        "Color",
        "Colouring",
        "Coloring"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Artificial colours are added appearance systems and are common ultra-processed markers.",
      healthConcernType: "artificial_colour_ultra_processed_marker",
      warningLabel: "ARTIFICIAL COLOUR FOUND",
      userFacingReason:
        "This product contains artificial colours or colourings. Truthlabel flags this because appearance is being built with added colour systems.",
      matchingNotes:
        "Match artificial colour/color terms and known artificial colour names/codes. If a banned/restricted colour appears, the Artificial Colours and Banned/Restricted categories control the red severity.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "artificial_sweeteners",
      mainName: "Artificial Sweeteners / Non-Sugar Sweeteners",
      otherNames: [
        "Artificial sweetener",
        "Artificial sweeteners",
        "Non-sugar sweetener",
        "Non sugar sweetener",
        "Intense sweetener",
        "High intensity sweetener",
        "Aspartame",
        "Acesulfame potassium",
        "Acesulfame K",
        "Ace-K",
        "Sucralose",
        "Saccharin",
        "Cyclamate",
        "Neotame",
        "Advantame",
        "Steviol glycosides",
        "Monk fruit extract"
      ],
      chemicalNames: [],
      brandNames: [
        "NutraSweet",
        "Equal",
        "Splenda",
        "Sweet'N Low",
        "Canderel"
      ],
      eNumbers: [
        "E950",
        "E951",
        "E952",
        "E954",
        "E955",
        "E960",
        "E961",
        "E969"
      ],
      insNumbers: [
        "INS 950",
        "INS 951",
        "INS 952",
        "INS 954",
        "INS 955",
        "INS 960",
        "INS 961",
        "INS 969"
      ],
      abbreviations: [
        "Ace-K",
        "APM"
      ],
      labelVariants: [
        "Artificial sweetener",
        "Non-sugar sweetener",
        "High intensity sweetener",
        "Sweetener E951",
        "Sweetener E955"
      ],
      spellingVariants: [
        "Non-sugar",
        "Non sugar",
        "High-intensity",
        "High intensity"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Artificial and non-sugar sweeteners are added sweetening systems used to create sweetness without normal sugar alone.",
      healthConcernType: "sweetener_ultra_processed_marker",
      warningLabel: "SWEETENER SYSTEM FOUND",
      userFacingReason:
        "This product contains artificial or non-sugar sweeteners. Truthlabel flags this because sweetness is being built with added sweetener systems.",
      matchingNotes:
        "Match artificial sweetener terms and common sweeteners. If cyclamate or another restricted sweetener appears, the Artificial Sweeteners and Banned/Restricted categories control the red severity.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "preservative_systems",
      mainName: "Preservative Systems",
      otherNames: [
        "Preservative",
        "Preservatives",
        "Sodium benzoate",
        "Potassium sorbate",
        "Calcium propionate",
        "Sodium nitrite",
        "Sodium nitrate",
        "Sulfites",
        "Sulphites",
        "BHA",
        "BHT",
        "TBHQ",
        "Natamycin",
        "Nisin",
        "Propylparaben"
      ],
      chemicalNames: [
        "Benzoates",
        "Sorbates",
        "Propionates",
        "Nitrites",
        "Nitrates",
        "Sulfiting agents",
        "Sulphiting agents"
      ],
      brandNames: [],
      eNumbers: [
        "E211",
        "E202",
        "E282",
        "E250",
        "E251",
        "E220",
        "E320",
        "E321",
        "E319"
      ],
      insNumbers: [
        "INS 211",
        "INS 202",
        "INS 282",
        "INS 250",
        "INS 251",
        "INS 220",
        "INS 320",
        "INS 321",
        "INS 319"
      ],
      abbreviations: [
        "BHA",
        "BHT",
        "TBHQ"
      ],
      labelVariants: [
        "Preservative",
        "Preservative E211",
        "Preservative E202",
        "Preservative E250",
        "Contains sulfites",
        "Contains sulphites"
      ],
      spellingVariants: [
        "Sulfite",
        "Sulphite",
        "Sulfites",
        "Sulphites"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Preservatives are used to extend shelf life, control spoilage, protect colour, or stabilise food during storage.",
      healthConcernType: "preservative_ultra_processed_marker",
      warningLabel: "PRESERVATIVE SYSTEM FOUND",
      userFacingReason:
        "This product contains preservatives or shelf-life systems. Truthlabel flags this because the product is chemically supported for longer storage or stability.",
      matchingNotes:
        "Match generic preservative terms and common preservatives. If a banned/restricted preservative appears, the Preservatives and Banned/Restricted categories control the red severity.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "hydrogenated_interesterified_fats",
      mainName: "Hydrogenated / Interesterified Fats",
      otherNames: [
        "Hydrogenated oil",
        "Hydrogenated vegetable oil",
        "Fully hydrogenated oil",
        "Partially hydrogenated oil",
        "Hydrogenated fat",
        "Hydrogenated vegetable fat",
        "Interesterified oil",
        "Interesterified fat",
        "Interesterified vegetable oil",
        "Modified vegetable fat",
        "Structured fat",
        "Shortening",
        "Vegetable shortening"
      ],
      chemicalNames: [
        "Hydrogenated triglycerides",
        "Interesterified triglycerides",
        "Structured triglycerides"
      ],
      brandNames: [
        "Crisco"
      ],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [
        "PHO",
        "PHOs",
        "HVO"
      ],
      labelVariants: [
        "Hydrogenated oil",
        "Partially hydrogenated oil",
        "Interesterified oil",
        "Modified vegetable fat",
        "Vegetable shortening"
      ],
      spellingVariants: [
        "Partially-hydrogenated",
        "Partially hydrogenated",
        "Inter-esterified",
        "Interesterified"
      ],
      regionalNames: [],
      severity: "red",
      reason:
        "Hydrogenated, partially hydrogenated, or engineered fat systems are strong ultra-processed markers. Partially hydrogenated oils should also trigger the dedicated red PHO category.",
      healthConcernType: "engineered_fat_ultra_processed_marker",
      warningLabel: "ENGINEERED FAT SYSTEM FOUND",
      userFacingReason:
        "This product contains hydrogenated, partially hydrogenated, interesterified, or engineered fat systems. Truthlabel flags this as a serious ultra-processed fat marker.",
      matchingNotes:
        "Match hydrogenated oils/fats, partially hydrogenated oils/fats, interesterified oils/fats, modified vegetable fat, structured fat, and shortening. If partially hydrogenated appears, also trigger the Hydrogenated / Partially Hydrogenated Oils red rule.",
      scoringImpact: "automatic_red_if_partially_hydrogenated_else_red_marker",
      dataStatus: "starter"
    },

    {
      id: "refined_processed_oils",
      mainName: "Refined / Processed Oils",
      otherNames: [
        "Refined oil",
        "Refined vegetable oil",
        "Refined seed oil",
        "Vegetable oil",
        "Vegetable oils",
        "Canola oil",
        "Rapeseed oil",
        "Soybean oil",
        "Soya oil",
        "Sunflower oil",
        "Corn oil",
        "Maize oil",
        "Cottonseed oil",
        "Palm oil",
        "Palm kernel oil",
        "RBD oil",
        "Refined bleached deodorized oil",
        "Refined bleached deodorised oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [
        "RBD"
      ],
      labelVariants: [
        "Refined vegetable oil",
        "Vegetable oil",
        "RBD oil",
        "Refined seed oil",
        "Oil blend"
      ],
      spellingVariants: [
        "Deodorized",
        "Deodorised",
        "Soya",
        "Soy"
      ],
      regionalNames: [
        "Rapeseed oil",
        "Maize oil"
      ],
      severity: "yellow",
      reason:
        "Refined oils and generic vegetable oils are processed ingredient systems commonly used in packaged and fried foods.",
      healthConcernType: "processed_oil_ultra_processed_marker",
      warningLabel: "PROCESSED OIL FOUND",
      userFacingReason:
        "This product contains refined or processed oils. Truthlabel flags this because the product uses processed oil systems rather than simple whole-food fats.",
      matchingNotes:
        "Match refined oils, RBD oils, generic vegetable oils, and common seed/processed oils. Also link to Seed Oils / Processed Oils category.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "powdered_reconstituted_ingredients",
      mainName: "Powdered / Reconstituted Ingredients",
      otherNames: [
        "Milk powder",
        "Skim milk powder",
        "Whole milk powder",
        "Whey powder",
        "Buttermilk powder",
        "Cream powder",
        "Cheese powder",
        "Egg powder",
        "Dried egg",
        "Dried milk",
        "Reconstituted milk",
        "Reconstituted juice",
        "Reconstituted fruit puree",
        "Made from concentrate",
        "From concentrate",
        "Juice from concentrate",
        "Tomato paste from concentrate"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Milk powder",
        "Whey powder",
        "Cheese powder",
        "Reconstituted",
        "Made from concentrate",
        "From concentrate"
      ],
      spellingVariants: [
        "Reconstituted",
        "Re-constituted"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Powdered, reconstituted, or concentrate-based ingredients can show the food is built from processed ingredient fractions.",
      healthConcernType: "reconstituted_powdered_ultra_processed_marker",
      warningLabel: "RECONSTITUTED / POWDERED INGREDIENT FOUND",
      userFacingReason:
        "This product contains powdered, reconstituted, or concentrate-based ingredients. Truthlabel flags this because the food may be assembled from processed ingredient fractions.",
      matchingNotes:
        "Match milk/whey/buttermilk/cream/cheese/egg powders, dried milk, dried egg, reconstituted ingredients, made from concentrate, and from concentrate terms.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "non_dairy_creamer_whitener",
      mainName: "Non-Dairy Creamer / Whitener",
      otherNames: [
        "Non-dairy creamer",
        "Non dairy creamer",
        "Coffee creamer",
        "Coffee whitener",
        "Creamer",
        "Vegetable creamer",
        "Dairy whitener",
        "Instant creamer",
        "Powdered creamer",
        "Plant-based creamer",
        "Plant based creamer"
      ],
      chemicalNames: [],
      brandNames: [
        "Coffee-Mate",
        "Coffee Mate"
      ],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Non-dairy creamer",
        "Coffee whitener",
        "Powdered creamer",
        "Instant creamer",
        "Vegetable creamer"
      ],
      spellingVariants: [
        "Non-dairy",
        "Non dairy",
        "Plant-based",
        "Plant based"
      ],
      regionalNames: [
        "Coffee whitener"
      ],
      severity: "yellow",
      reason:
        "Creamers and whiteners are often constructed from oils, emulsifiers, stabilisers, sweeteners, and powders.",
      healthConcernType: "constructed_creamer_ultra_processed_marker",
      warningLabel: "CREAMER / WHITENER SYSTEM FOUND",
      userFacingReason:
        "This product contains creamer or whitener ingredients. Truthlabel flags this because these are often built from processed oils, powders, emulsifiers, and stabilisers.",
      matchingNotes:
        "Match non-dairy creamer, coffee creamer, coffee whitener, dairy whitener, vegetable creamer, powdered creamer, instant creamer, and Coffee-Mate/Coffee Mate.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "humectants_solvents_carriers",
      mainName: "Humectants / Solvents / Carriers",
      otherNames: [
        "Humectant",
        "Humectants",
        "Glycerol",
        "Glycerine",
        "Glycerin",
        "Propylene glycol",
        "Sorbitol",
        "Maltitol syrup",
        "Polydextrose",
        "Triacetin",
        "Carrier",
        "Carriers",
        "Solvent",
        "Solvents"
      ],
      chemicalNames: [
        "Glycerol",
        "Propane-1,2-diol",
        "Triacetin",
        "Polydextrose"
      ],
      brandNames: [],
      eNumbers: [
        "E422",
        "E1520",
        "E420",
        "E965",
        "E1200",
        "E1518"
      ],
      insNumbers: [
        "INS 422",
        "INS 1520",
        "INS 420",
        "INS 965",
        "INS 1200",
        "INS 1518"
      ],
      abbreviations: [
        "PG"
      ],
      labelVariants: [
        "Humectant glycerol",
        "Humectant E422",
        "Carrier propylene glycol",
        "Solvent propylene glycol",
        "Humectant sorbitol"
      ],
      spellingVariants: [
        "Glycerine",
        "Glycerin"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Humectants, carriers, and solvents are used to control moisture, carry flavours/colours, improve texture, or stabilise processed foods.",
      healthConcernType: "carrier_humectant_ultra_processed_marker",
      warningLabel: "HUMECTANT / CARRIER FOUND",
      userFacingReason:
        "This product contains humectants, solvents, or carriers. Truthlabel flags this because the product uses functional processing ingredients to control moisture, texture, or ingredient delivery.",
      matchingNotes:
        "Match humectant terms, glycerol/glycerine/glycerin, propylene glycol, sorbitol, maltitol syrup, polydextrose, triacetin, carrier, and solvent terms.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "anti_caking_flow_agents",
      mainName: "Anti-Caking / Flow Agents",
      otherNames: [
        "Anti-caking agent",
        "Anti caking agent",
        "Anticaking agent",
        "Flow agent",
        "Flow agents",
        "Silicon dioxide",
        "Silica",
        "Calcium silicate",
        "Magnesium silicate",
        "Sodium aluminosilicate",
        "Aluminium sodium silicate",
        "Aluminum sodium silicate",
        "Tricalcium phosphate"
      ],
      chemicalNames: [
        "Silicon dioxide",
        "Calcium silicate",
        "Magnesium silicate",
        "Sodium aluminosilicate",
        "Tricalcium phosphate"
      ],
      brandNames: [],
      eNumbers: [
        "E551",
        "E552",
        "E553a",
        "E554",
        "E341"
      ],
      insNumbers: [
        "INS 551",
        "INS 552",
        "INS 553a",
        "INS 554",
        "INS 341"
      ],
      abbreviations: [],
      labelVariants: [
        "Anti-caking agent",
        "Anticaking agent",
        "Flow agent",
        "Anti-caking agent E551",
        "Anti-caking agent silicon dioxide"
      ],
      spellingVariants: [
        "Anti-caking",
        "Anti caking",
        "Anticaking",
        "Aluminium",
        "Aluminum"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Anti-caking and flow agents are functional additives used to keep powders dry, flowing, and shelf-stable.",
      healthConcernType: "anti_caking_ultra_processed_marker",
      warningLabel: "ANTI-CAKING / FLOW AGENT FOUND",
      userFacingReason:
        "This product contains anti-caking or flow agents. Truthlabel flags this because the product uses functional additives to manage powder flow or shelf stability.",
      matchingNotes:
        "Match anti-caking/anticaking terms, flow agents, silicon dioxide, silica, calcium silicate, magnesium silicate, sodium aluminosilicate, tricalcium phosphate, and E/INS variants.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "glazing_coating_agents",
      mainName: "Glazing / Coating Agents",
      otherNames: [
        "Glazing agent",
        "Glazing agents",
        "Coating agent",
        "Coating agents",
        "Shellac",
        "Confectioner's glaze",
        "Confectioners glaze",
        "Carnauba wax",
        "Beeswax",
        "Candelilla wax",
        "Microcrystalline wax",
        "Paraffin wax"
      ],
      chemicalNames: [
        "Shellac",
        "Carnauba wax",
        "Candelilla wax",
        "Microcrystalline wax",
        "Paraffin wax"
      ],
      brandNames: [],
      eNumbers: [
        "E904",
        "E903",
        "E901",
        "E902",
        "E905"
      ],
      insNumbers: [
        "INS 904",
        "INS 903",
        "INS 901",
        "INS 902",
        "INS 905"
      ],
      abbreviations: [],
      labelVariants: [
        "Glazing agent",
        "Coating agent",
        "Confectioner's glaze",
        "Shellac glaze",
        "Wax coating"
      ],
      spellingVariants: [
        "Confectioner's",
        "Confectioners"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Glazing and coating agents are used to create shine, surface protection, or processed appearance.",
      healthConcernType: "glazing_coating_ultra_processed_marker",
      warningLabel: "GLAZING / COATING AGENT FOUND",
      userFacingReason:
        "This product contains glazing or coating agents. Truthlabel flags this because the product's appearance or surface finish is being supported by added coating systems.",
      matchingNotes:
        "Match glazing agent, coating agent, shellac, confectioner's/confectioners glaze, carnauba wax, beeswax, candelilla wax, microcrystalline wax, paraffin wax, and E/INS variants.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "instantized_extruded_processed_terms",
      mainName: "Instantized / Extruded / Processed Terms",
      otherNames: [
        "Instantized",
        "Instantised",
        "Agglomerated",
        "Extruded",
        "Extrusion cooked",
        "Extrusion-cooked",
        "Textured",
        "Texturised",
        "Puffed",
        "Expanded",
        "Reconstituted",
        "Reformed",
        "Restructured",
        "Mechanically separated",
        "Mechanically recovered"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [
        "MSM",
        "MRM"
      ],
      labelVariants: [
        "Instantized powder",
        "Instantised powder",
        "Extruded snack",
        "Extrusion-cooked",
        "Textured protein",
        "Reformed meat",
        "Restructured meat",
        "Mechanically separated meat"
      ],
      spellingVariants: [
        "Instantized",
        "Instantised",
        "Textured",
        "Texturised",
        "Extrusion-cooked",
        "Extrusion cooked"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Processing terms like instantized, extruded, reformed, or mechanically separated indicate industrial restructuring or food construction.",
      healthConcernType: "processing_method_ultra_processed_marker",
      warningLabel: "PROCESSING METHOD MARKER FOUND",
      userFacingReason:
        "This product uses processing terms such as instantized, extruded, reformed, or mechanically separated. Truthlabel flags this because the food appears industrially processed or reconstructed.",
      matchingNotes:
        "Match instantized/instantised, agglomerated, extruded, extrusion-cooked, textured/texturised, puffed, expanded, reconstituted, reformed, restructured, mechanically separated, mechanically recovered, MSM, and MRM.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "imitation_analogue_substitute_terms",
      mainName: "Imitation / Analogue / Substitute Terms",
      otherNames: [
        "Imitation",
        "Imitation cheese",
        "Imitation cream",
        "Imitation meat",
        "Imitation bacon",
        "Analogue",
        "Analog",
        "Cheese analogue",
        "Cheese analog",
        "Meat analogue",
        "Meat analog",
        "Dairy analogue",
        "Dairy analog",
        "Substitute",
        "Meat substitute",
        "Dairy substitute",
        "Cream substitute",
        "Butter substitute"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Imitation cheese",
        "Cheese analogue",
        "Cheese analog",
        "Meat analogue",
        "Meat analog",
        "Dairy substitute",
        "Cream substitute"
      ],
      spellingVariants: [
        "Analogue",
        "Analog"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Imitation, analogue, and substitute terms suggest the product may be constructed to mimic another food.",
      healthConcernType: "imitation_analogue_ultra_processed_marker",
      warningLabel: "IMITATION / ANALOGUE FOOD MARKER FOUND",
      userFacingReason:
        "This product uses imitation, analogue, or substitute wording. Truthlabel flags this because the food may be constructed to imitate another food rather than being the simple original form.",
      matchingNotes:
        "Match imitation, analogue/analog, substitute terms, imitation cheese/cream/meat, cheese analogue/analog, meat analogue/analog, dairy substitute, cream substitute, and butter substitute.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    },

    {
      id: "synthetic_fortification_systems",
      mainName: "Synthetic Fortification Systems",
      otherNames: [
        "Fortified",
        "Enriched",
        "Vitamin premix",
        "Mineral premix",
        "Nutrient premix",
        "Thiamine mononitrate",
        "Riboflavin",
        "Niacinamide",
        "Folic acid",
        "Ferrous sulfate",
        "Ferrous sulphate",
        "Zinc oxide",
        "Calcium carbonate",
        "Retinyl palmitate",
        "Cyanocobalamin",
        "Cholecalciferol"
      ],
      chemicalNames: [
        "Thiamine mononitrate",
        "Riboflavin",
        "Niacinamide",
        "Folic acid",
        "Ferrous sulfate",
        "Zinc oxide",
        "Retinyl palmitate",
        "Cyanocobalamin",
        "Cholecalciferol"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [
        "B1",
        "B2",
        "B3",
        "B9",
        "B12",
        "D3"
      ],
      labelVariants: [
        "Fortified with vitamins",
        "Enriched with vitamins",
        "Vitamin and mineral premix",
        "Nutrient premix"
      ],
      spellingVariants: [
        "Sulfate",
        "Sulphate"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Fortification and premix systems can show the product is rebuilt or nutritionally adjusted after processing.",
      healthConcernType: "fortification_ultra_processed_marker",
      warningLabel: "FORTIFICATION SYSTEM FOUND",
      userFacingReason:
        "This product contains fortification or nutrient premix markers. Truthlabel flags this because the product may be nutritionally adjusted or rebuilt after processing.",
      matchingNotes:
        "Match fortified/enriched wording, vitamin premix, mineral premix, nutrient premix, and common synthetic vitamin/mineral names. Do not frame fortification as automatically harmful; treat it as an ultra-processing marker only.",
      scoringImpact: "yellow_ultra_processed_marker",
      dataStatus: "starter"
    }
  ],

  categoryScoringRules: {
    noUltraProcessedMarkersFound: {
      severity: "green",
      display: "No",
      scoreImpact: 0
    },

    oneToThreeUltraProcessedMarkers: {
      severity: "yellow",
      display: "yellow_count_badge",
      scoreImpact: 10,
      reason:
        "Product contains one or more ultra-processed ingredient markers."
    },

    fourOrMoreUltraProcessedMarkers: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: 25,
      reason:
        "Product contains multiple ultra-processed markers. Truthlabel treats this as a high ultra-processed load."
    },

    anyAutomaticRedMarker: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: "automatic_red",
      reason:
        "Product contains a marker that is red in another category, such as partially hydrogenated oil or a banned/restricted ingredient."
    }
  },

  finalVerdictRules: {
    green:
      "No ultra-processed markers were found from the available ingredient list.",

    yellow:
      "This product contains ultra-processed markers. Truthlabel flags this because some ingredients suggest the food is processed, stabilised, flavour-built, texture-built, or made from ingredient systems rather than simple whole ingredients.",

    redLoad:
      "This product contains multiple ultra-processed markers. Truthlabel flags this as a high ultra-processed load.",

    redAutomatic:
      "This product contains an ultra-processed marker that also triggers a red rule in another category. Truthlabel flags this as a serious ingredient concern."
  },

  matchingNormalizationRules: [
    "lowercase all ingredient text",
    "remove punctuation",
    "remove brackets",
    "collapse extra spaces",
    "normalize flavour and flavor",
    "normalize colouring and coloring",
    "normalize colour and color",
    "normalize stabiliser and stabilizer",
    "normalize hydrolysed and hydrolyzed",
    "normalize autolysed and autolyzed",
    "normalize sulphite and sulfite",
    "normalize sulphate and sulfate",
    "normalize soya and soy where appropriate",
    "normalize maize and corn where appropriate",
    "normalize instantized and instantised",
    "normalize texturized, texturised, and textured",
    "normalize analogue and analog",
    "normalize partially-hydrogenated and partially hydrogenated",
    "normalize extrusion-cooked and extrusion cooked",
    "normalize E-numbers with and without hyphen",
    "normalize INS numbers",
    "do not double count the same marker if name and code both appear",
    "do not double count the same ingredient across this category and another category in the overall exposure score; category badges may still show the issue in both places",
    "if a marker is red in another category, allow Ultra-Processed Indicators to become red through anyAutomaticRedMarker"
  ]
} as const;

export type UltraProcessedIndicatorsDataPack = typeof ultraProcessedIndicatorsDataPack;
export type UltraProcessedIndicatorsItem = (typeof ultraProcessedIndicatorsDataPack.items)[number];
