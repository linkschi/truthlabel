export const seedOilsProcessedOilsDataPack = {
  id: "seed_oils_processed_oils",
  categoryName: "Seed Oils / Processed Oils",
  categoryMeaning:
    "This category detects seed oils, generic vegetable oils, refined oils, frying oils, oil blends, shortenings, margarines, hydrogenated oils, and highly processed fat systems. Truthlabel flags these because the product uses processed oil systems rather than simple whole-food fats.",
  dataStatus: "starter_needs_expansion",
  defaultCategorySeverity: "yellow",

  items: [
    {
      id: "generic_vegetable_oil",
      mainName: "Vegetable Oil",
      otherNames: [
        "Vegetable oil",
        "Vegetable oils",
        "Vegetable fat",
        "Vegetable fats",
        "Edible vegetable oil",
        "Edible vegetable oils",
        "Refined vegetable oil",
        "Refined vegetable oils",
        "Vegetable oil blend",
        "Vegetable oil blends",
        "Blend of vegetable oils",
        "Mixed vegetable oils",
        "Non-hydrogenated vegetable oil",
        "Non hydrogenated vegetable oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Vegetable oil",
        "Vegetable oils",
        "Vegetable oil blend",
        "Refined vegetable oil",
        "Edible vegetable oil",
        "Vegetable fat",
        "Vegetable fats",
        "Oil blend",
        "Blend of oils",
        "May contain vegetable oils"
      ],
      spellingVariants: [
        "Non-hydrogenated",
        "Non hydrogenated"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Generic vegetable oil labels may hide the exact oil source and usually indicate a processed oil system.",
      healthConcernType: "generic_processed_oil",
      warningLabel: "PROCESSED OIL FOUND",
      userFacingReason:
        "This product contains vegetable oil or a vegetable oil blend. Truthlabel flags this because the exact oil source may not be clearly shown and the product uses a processed oil system.",
      matchingNotes:
        "Match vegetable oil, vegetable oils, vegetable fat, edible vegetable oil, refined vegetable oil, oil blend, and mixed vegetable oils. If a specific oil is also listed, count the specific oil separately only if it appears as a separate ingredient.",
      scoringImpact: "yellow_processed_oil",
      dataStatus: "starter"
    },

    {
      id: "canola_oil_rapeseed_oil",
      mainName: "Canola Oil / Rapeseed Oil",
      otherNames: [
        "Canola oil",
        "Rapeseed oil",
        "Rapeseed vegetable oil",
        "Low erucic acid rapeseed oil",
        "LEAR oil",
        "Refined canola oil",
        "Refined rapeseed oil",
        "Expeller pressed canola oil",
        "Cold pressed canola oil",
        "High oleic canola oil",
        "Canola seed oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [
        "LEAR"
      ],
      labelVariants: [
        "Canola oil",
        "Rapeseed oil",
        "Refined canola oil",
        "Refined rapeseed oil",
        "High oleic canola oil",
        "Expeller pressed canola oil",
        "Cold pressed canola oil"
      ],
      spellingVariants: [
        "Cold-pressed",
        "Cold pressed",
        "Expeller-pressed",
        "Expeller pressed",
        "High-oleic",
        "High oleic"
      ],
      regionalNames: [
        "Rapeseed oil"
      ],
      severity: "green",
      reason:
        "Seed oil commonly used in processed foods, frying, snacks, sauces, and baked goods.",
      healthConcernType: "seed_oil",
      warningLabel: "SEED OIL FOUND",
      userFacingReason:
        "This product contains canola/rapeseed oil, a seed oil commonly used in processed foods. Truthlabel flags this as a processed oil marker.",
      matchingNotes:
        "Match canola oil, rapeseed oil, LEAR oil, high oleic canola oil, refined canola oil, and refined rapeseed oil.",
      scoringImpact: "yellow_seed_oil",
      dataStatus: "starter"
    },

    {
      id: "soybean_oil",
      mainName: "Soybean Oil",
      otherNames: [
        "Soybean oil",
        "Soya oil",
        "Soy oil",
        "Refined soybean oil",
        "Refined soya oil",
        "Fully refined soybean oil",
        "High oleic soybean oil",
        "Soybean vegetable oil",
        "Soyabean oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Soybean oil",
        "Soya oil",
        "Soy oil",
        "Refined soybean oil",
        "High oleic soybean oil"
      ],
      spellingVariants: [
        "Soybean",
        "Soya bean",
        "Soyabean",
        "High-oleic",
        "High oleic"
      ],
      regionalNames: [
        "Soya oil"
      ],
      severity: "green",
      reason:
        "Seed/bean oil commonly used in processed foods, dressings, sauces, snacks, and frying.",
      healthConcernType: "seed_oil_processed_oil",
      warningLabel: "SEED OIL FOUND",
      userFacingReason:
        "This product contains soybean/soya oil, a processed seed/bean oil commonly used in packaged foods. Truthlabel flags this as a processed oil marker.",
      matchingNotes:
        "Match soybean oil, soya oil, soy oil, soyabean oil, refined soybean oil, and high oleic soybean oil.",
      scoringImpact: "yellow_seed_oil",
      dataStatus: "starter"
    },

    {
      id: "sunflower_oil",
      mainName: "Sunflower Oil",
      otherNames: [
        "Sunflower oil",
        "Sunflower seed oil",
        "Refined sunflower oil",
        "High oleic sunflower oil",
        "Mid oleic sunflower oil",
        "Linoleic sunflower oil",
        "Expeller pressed sunflower oil",
        "Cold pressed sunflower oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Sunflower oil",
        "Sunflower seed oil",
        "Refined sunflower oil",
        "High oleic sunflower oil",
        "Cold pressed sunflower oil",
        "Expeller pressed sunflower oil"
      ],
      spellingVariants: [
        "High-oleic",
        "High oleic",
        "Mid-oleic",
        "Mid oleic",
        "Cold-pressed",
        "Cold pressed",
        "Expeller-pressed",
        "Expeller pressed"
      ],
      regionalNames: [],
      severity: "green",
      reason:
        "Seed oil commonly used in snacks, fried foods, sauces, spreads, and packaged foods.",
      healthConcernType: "seed_oil",
      warningLabel: "SEED OIL FOUND",
      userFacingReason:
        "This product contains sunflower oil, a seed oil commonly used in processed foods. Truthlabel flags this as a processed oil marker.",
      matchingNotes:
        "Match sunflower oil, sunflower seed oil, refined sunflower oil, high oleic sunflower oil, mid oleic sunflower oil, and linoleic sunflower oil.",
      scoringImpact: "yellow_seed_oil",
      dataStatus: "starter"
    },

    {
      id: "corn_oil",
      mainName: "Corn Oil / Maize Oil",
      otherNames: [
        "Corn oil",
        "Maize oil",
        "Refined corn oil",
        "Refined maize oil",
        "Corn germ oil",
        "Maize germ oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Corn oil",
        "Maize oil",
        "Refined corn oil",
        "Refined maize oil",
        "Corn germ oil",
        "Maize germ oil"
      ],
      spellingVariants: [],
      regionalNames: [
        "Maize oil"
      ],
      severity: "green",
      reason:
        "Processed seed/grain oil used in packaged foods, frying, snacks, and sauces.",
      healthConcernType: "seed_oil_processed_oil",
      warningLabel: "SEED OIL FOUND",
      userFacingReason:
        "This product contains corn/maize oil, a processed oil commonly used in packaged foods and frying. Truthlabel flags this as a processed oil marker.",
      matchingNotes:
        "Match corn oil, maize oil, corn germ oil, maize germ oil, refined corn oil, and refined maize oil.",
      scoringImpact: "yellow_seed_oil",
      dataStatus: "starter"
    },

    {
      id: "cottonseed_oil",
      mainName: "Cottonseed Oil",
      otherNames: [
        "Cottonseed oil",
        "Cotton seed oil",
        "Refined cottonseed oil",
        "Cottonseed vegetable oil",
        "Fully refined cottonseed oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Cottonseed oil",
        "Cotton seed oil",
        "Refined cottonseed oil",
        "Fully refined cottonseed oil"
      ],
      spellingVariants: [
        "Cottonseed",
        "Cotton seed"
      ],
      regionalNames: [],
      severity: "green",
      reason:
        "Seed oil used in processed foods, frying, shortenings, snacks, and baked goods.",
      healthConcernType: "seed_oil_processed_oil",
      warningLabel: "SEED OIL FOUND",
      userFacingReason:
        "This product contains cottonseed oil, a processed seed oil. Truthlabel flags this as a processed oil marker.",
      matchingNotes:
        "Match cottonseed oil, cotton seed oil, refined cottonseed oil, and fully refined cottonseed oil.",
      scoringImpact: "yellow_seed_oil",
      dataStatus: "starter"
    },

    {
      id: "safflower_oil",
      mainName: "Safflower Oil",
      otherNames: [
        "Safflower oil",
        "Safflower seed oil",
        "Refined safflower oil",
        "High oleic safflower oil",
        "Linoleic safflower oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Safflower oil",
        "Safflower seed oil",
        "Refined safflower oil",
        "High oleic safflower oil"
      ],
      spellingVariants: [
        "High-oleic",
        "High oleic"
      ],
      regionalNames: [],
      severity: "green",
      reason:
        "Seed oil used in processed foods, dressings, sauces, and snacks.",
      healthConcernType: "seed_oil",
      warningLabel: "SEED OIL FOUND",
      userFacingReason:
        "This product contains safflower oil, a seed oil used in processed foods. Truthlabel flags this as a processed oil marker.",
      matchingNotes:
        "Match safflower oil, safflower seed oil, refined safflower oil, high oleic safflower oil, and linoleic safflower oil.",
      scoringImpact: "yellow_seed_oil",
      dataStatus: "starter"
    },

    {
      id: "grapeseed_oil",
      mainName: "Grapeseed Oil",
      otherNames: [
        "Grapeseed oil",
        "Grape seed oil",
        "Refined grapeseed oil",
        "Refined grape seed oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Grapeseed oil",
        "Grape seed oil",
        "Refined grapeseed oil"
      ],
      spellingVariants: [
        "Grapeseed",
        "Grape seed"
      ],
      regionalNames: [],
      severity: "green",
      reason:
        "Seed oil used in processed foods, sauces, dressings, and frying.",
      healthConcernType: "seed_oil",
      warningLabel: "SEED OIL FOUND",
      userFacingReason:
        "This product contains grapeseed oil, a seed oil. Truthlabel flags this as a processed oil marker.",
      matchingNotes:
        "Match grapeseed oil, grape seed oil, refined grapeseed oil, and refined grape seed oil.",
      scoringImpact: "yellow_seed_oil",
      dataStatus: "starter"
    },

    {
      id: "rice_bran_oil",
      mainName: "Rice Bran Oil",
      otherNames: [
        "Rice bran oil",
        "Refined rice bran oil",
        "Rice oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["RBO"],
      labelVariants: [
        "Rice bran oil",
        "Refined rice bran oil",
        "Rice oil"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "green",
      reason:
        "Processed grain/bran oil used in packaged foods, frying, and snacks.",
      healthConcernType: "processed_oil",
      warningLabel: "PROCESSED OIL FOUND",
      userFacingReason:
        "This product contains rice bran oil, a processed oil used in packaged foods and frying. Truthlabel flags this as a processed oil marker.",
      matchingNotes:
        "Match rice bran oil, refined rice bran oil, rice oil, and RBO when oil context is clear.",
      scoringImpact: "yellow_processed_oil",
      dataStatus: "starter"
    },

    {
      id: "peanut_oil_groundnut_oil",
      mainName: "Peanut Oil / Groundnut Oil",
      otherNames: [
        "Peanut oil",
        "Groundnut oil",
        "Arachis oil",
        "Refined peanut oil",
        "Refined groundnut oil",
        "Cold pressed peanut oil",
        "Expeller pressed peanut oil"
      ],
      chemicalNames: [
        "Arachis oil"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Peanut oil",
        "Groundnut oil",
        "Arachis oil",
        "Refined peanut oil",
        "Refined groundnut oil"
      ],
      spellingVariants: [
        "Groundnut",
        "Ground nut",
        "Cold-pressed",
        "Cold pressed",
        "Expeller-pressed",
        "Expeller pressed"
      ],
      regionalNames: [
        "Groundnut oil",
        "Arachis oil"
      ],
      severity: "green",
      reason:
        "Processed legume oil used in frying, sauces, snacks, and packaged foods.",
      healthConcernType: "processed_oil_allergen_relevant",
      warningLabel: "PROCESSED OIL FOUND",
      userFacingReason:
        "This product contains peanut/groundnut oil, a processed oil. Truthlabel flags this as a processed oil marker. This may also be relevant for peanut allergy checks depending on the product and region.",
      matchingNotes:
        "Match peanut oil, groundnut oil, arachis oil, refined peanut oil, and refined groundnut oil. Also link to Allergy Risk where appropriate.",
      scoringImpact: "yellow_processed_oil",
      dataStatus: "starter"
    },

    {
      id: "sesame_oil",
      mainName: "Sesame Oil",
      otherNames: [
        "Sesame oil",
        "Sesame seed oil",
        "Refined sesame oil",
        "Toasted sesame oil",
        "Roasted sesame oil",
        "Gingelly oil",
        "Til oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Sesame oil",
        "Sesame seed oil",
        "Refined sesame oil",
        "Toasted sesame oil",
        "Roasted sesame oil"
      ],
      spellingVariants: [],
      regionalNames: [
        "Gingelly oil",
        "Til oil"
      ],
      severity: "green",
      reason:
        "Seed oil used as an ingredient or flavour oil. It may also be relevant for sesame allergy checks.",
      healthConcernType: "seed_oil_allergen_relevant",
      warningLabel: "SEED OIL FOUND",
      userFacingReason:
        "This product contains sesame oil, a seed oil. Truthlabel flags this as a processed oil marker and may also check it under allergy risk where relevant.",
      matchingNotes:
        "Match sesame oil, sesame seed oil, refined sesame oil, toasted sesame oil, roasted sesame oil, gingelly oil, and til oil. Also link to Allergy Risk where appropriate.",
      scoringImpact: "yellow_seed_oil",
      dataStatus: "starter"
    },

    {
      id: "palm_oil",
      mainName: "Palm Oil",
      otherNames: [
        "Palm oil",
        "Refined palm oil",
        "Palm olein",
        "Palm stearin",
        "Red palm oil",
        "Palm fruit oil",
        "Sustainable palm oil",
        "RSPO palm oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["RSPO"],
      labelVariants: [
        "Palm oil",
        "Refined palm oil",
        "Palm olein",
        "Palm stearin",
        "Palm fruit oil",
        "RSPO palm oil"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "green",
      reason:
        "Processed vegetable oil/fat commonly used in packaged foods, baked goods, spreads, and snacks.",
      healthConcernType: "processed_oil",
      warningLabel: "PROCESSED OIL FOUND",
      userFacingReason:
        "This product contains palm oil or palm fat fractions. Truthlabel flags this as a processed oil/fat marker.",
      matchingNotes:
        "Match palm oil, refined palm oil, palm olein, palm stearin, palm fruit oil, sustainable palm oil, and RSPO palm oil.",
      scoringImpact: "yellow_processed_oil",
      dataStatus: "starter"
    },

    {
      id: "palm_kernel_oil",
      mainName: "Palm Kernel Oil",
      otherNames: [
        "Palm kernel oil",
        "Palmkernal oil",
        "Palm kernel fat",
        "Refined palm kernel oil",
        "Palm kernel olein",
        "Palm kernel stearin",
        "Hydrogenated palm kernel oil",
        "Partially hydrogenated palm kernel oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["PKO"],
      labelVariants: [
        "Palm kernel oil",
        "Palm kernel fat",
        "Refined palm kernel oil",
        "Palm kernel olein",
        "Palm kernel stearin"
      ],
      spellingVariants: [
        "Palm kernel",
        "Palmkernel",
        "Palm kernal"
      ],
      regionalNames: [],
      severity: "green",
      reason:
        "Processed kernel oil/fat commonly used in confectionery, coatings, spreads, and packaged foods.",
      healthConcernType: "processed_kernel_oil",
      warningLabel: "PROCESSED OIL FOUND",
      userFacingReason:
        "This product contains palm kernel oil, a processed kernel oil used in packaged foods. Truthlabel flags this as a processed oil/fat marker.",
      matchingNotes:
        "Match palm kernel oil, palmkernel oil, palm kernel fat, refined palm kernel oil, palm kernel olein, palm kernel stearin, and PKO. If hydrogenated or partially hydrogenated appears, also trigger hydrogenated oil red rule.",
      scoringImpact: "yellow_processed_oil",
      dataStatus: "starter"
    },

    {
      id: "coconut_oil_processed",
      mainName: "Coconut Oil",
      otherNames: [
        "Coconut oil",
        "Refined coconut oil",
        "Virgin coconut oil",
        "Extra virgin coconut oil",
        "Coconut fat",
        "Hydrogenated coconut oil",
        "Partially hydrogenated coconut oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Coconut oil",
        "Refined coconut oil",
        "Virgin coconut oil",
        "Coconut fat"
      ],
      spellingVariants: [
        "Extra-virgin",
        "Extra virgin"
      ],
      regionalNames: [],
      severity: "green",
      reason:
        "Processed or added isolated oil/fat ingredient. It is not a seed oil, but it belongs in the processed oils check when used as an added oil.",
      healthConcernType: "processed_added_oil",
      warningLabel: "ADDED OIL FOUND",
      userFacingReason:
        "This product contains coconut oil, an added isolated oil/fat. Truthlabel flags this under processed oils because the product uses added oil rather than whole-food fat alone.",
      matchingNotes:
        "Match coconut oil, refined coconut oil, virgin coconut oil, extra virgin coconut oil, and coconut fat. If hydrogenated or partially hydrogenated appears, also trigger hydrogenated oil red rule.",
      scoringImpact: "yellow_processed_oil",
      dataStatus: "starter"
    },

    {
      id: "vegetable_shortening",
      mainName: "Vegetable Shortening",
      otherNames: [
        "Vegetable shortening",
        "Shortening",
        "Baking shortening",
        "Frying shortening",
        "All-purpose shortening",
        "All purpose shortening",
        "Non-hydrogenated shortening",
        "Hydrogenated shortening",
        "Partially hydrogenated shortening",
        "Vegetable fat shortening",
        "Palm shortening"
      ],
      chemicalNames: [],
      brandNames: [
        "Crisco"
      ],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Vegetable shortening",
        "Shortening",
        "Baking shortening",
        "Frying shortening",
        "All-purpose shortening",
        "Palm shortening"
      ],
      spellingVariants: [
        "All-purpose",
        "All purpose",
        "Non-hydrogenated",
        "Non hydrogenated"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Processed fat system used for baking texture, frying, crispness, and shelf stability.",
      healthConcernType: "processed_fat_system",
      warningLabel: "PROCESSED FAT SYSTEM FOUND",
      userFacingReason:
        "This product contains shortening, a processed fat system used to build texture, crispness, or shelf stability. Truthlabel flags this as a processed oil/fat marker.",
      matchingNotes:
        "Match shortening, vegetable shortening, baking shortening, frying shortening, palm shortening, and Crisco. If hydrogenated or partially hydrogenated appears, also trigger hydrogenated oil red rule.",
      scoringImpact: "yellow_processed_fat",
      dataStatus: "starter"
    },

    {
      id: "margarine_spreads",
      mainName: "Margarine / Vegetable Fat Spread",
      otherNames: [
        "Margarine",
        "Margarine spread",
        "Vegetable fat spread",
        "Vegetable oil spread",
        "Spreadable vegetable fat",
        "Table spread",
        "Baking margarine",
        "Cooking margarine",
        "Reduced fat spread",
        "Dairy-free spread",
        "Plant-based spread"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Margarine",
        "Vegetable fat spread",
        "Vegetable oil spread",
        "Table spread",
        "Baking margarine",
        "Plant-based spread"
      ],
      spellingVariants: [
        "Plant-based",
        "Plant based",
        "Dairy-free",
        "Dairy free"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Processed fat spread usually built from vegetable oils, emulsifiers, water, flavours, colours, and stabilisers.",
      healthConcernType: "processed_fat_spread",
      warningLabel: "PROCESSED FAT SPREAD FOUND",
      userFacingReason:
        "This product contains margarine or vegetable fat spread. Truthlabel flags this because it is a processed fat system, often built from oils, emulsifiers, colours, flavours, and stabilisers.",
      matchingNotes:
        "Match margarine, vegetable fat spread, vegetable oil spread, table spread, baking margarine, reduced fat spread, dairy-free spread, and plant-based spread.",
      scoringImpact: "yellow_processed_fat",
      dataStatus: "starter"
    },

    {
      id: "frying_oil",
      mainName: "Frying Oil",
      otherNames: [
        "Frying oil",
        "Deep frying oil",
        "Deep-frying oil",
        "Fryer oil",
        "Fry oil",
        "Cooking oil",
        "Refined cooking oil",
        "High heat frying oil",
        "Restaurant frying oil"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Frying oil",
        "Deep frying oil",
        "Deep-frying oil",
        "Fryer oil",
        "Fry oil",
        "Cooking oil",
        "High heat frying oil"
      ],
      spellingVariants: [
        "Deep-frying",
        "Deep frying",
        "High-heat",
        "High heat"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Generic frying oil term may hide the exact oil source and usually indicates processed oil use.",
      healthConcernType: "generic_frying_oil",
      warningLabel: "FRYING OIL FOUND",
      userFacingReason:
        "This product lists frying oil or cooking oil without clearly showing the exact oil source. Truthlabel flags this as a processed oil marker.",
      matchingNotes:
        "Match frying oil, deep frying oil, deep-frying oil, fryer oil, fry oil, cooking oil, refined cooking oil, and high heat frying oil.",
      scoringImpact: "yellow_processed_oil",
      dataStatus: "starter"
    },

    {
      id: "interesterified_oils",
      mainName: "Interesterified Oils",
      otherNames: [
        "Interesterified oil",
        "Interesterified oils",
        "Interesterified vegetable oil",
        "Interesterified vegetable fat",
        "Interesterified fat",
        "Enzymatically interesterified oil",
        "Chemically interesterified oil",
        "Rearranged fat",
        "Modified vegetable fat",
        "Structured fat"
      ],
      chemicalNames: [
        "Interesterified triglycerides",
        "Structured triglycerides"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["IE oil", "IE fat"],
      labelVariants: [
        "Interesterified oil",
        "Interesterified vegetable oil",
        "Interesterified vegetable fat",
        "Modified vegetable fat",
        "Structured fat"
      ],
      spellingVariants: [
        "Inter-esterified",
        "Interesterified"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Engineered fat system used to modify melting point, texture, spreadability, and stability.",
      healthConcernType: "engineered_fat_system",
      warningLabel: "ENGINEERED FAT SYSTEM FOUND",
      userFacingReason:
        "This product contains interesterified oil or fat, an engineered fat system used to change texture, melting point, or stability. Truthlabel flags this as a processed fat marker.",
      matchingNotes:
        "Match interesterified oil, interesterified vegetable fat, enzymatically interesterified oil, chemically interesterified oil, modified vegetable fat, structured fat, and rearranged fat.",
      scoringImpact: "yellow_processed_fat",
      dataStatus: "starter"
    },

    {
      id: "hydrogenated_oils",
      mainName: "Hydrogenated Oils",
      otherNames: [
        "Hydrogenated oil",
        "Hydrogenated oils",
        "Hydrogenated vegetable oil",
        "Hydrogenated vegetable oils",
        "Fully hydrogenated oil",
        "Fully hydrogenated vegetable oil",
        "Hydrogenated fat",
        "Hydrogenated vegetable fat",
        "Hydrogenated soybean oil",
        "Hydrogenated soya oil",
        "Hydrogenated canola oil",
        "Hydrogenated rapeseed oil",
        "Hydrogenated cottonseed oil",
        "Hydrogenated palm oil",
        "Hydrogenated palm kernel oil",
        "Hydrogenated coconut oil",
        "Hydrogenated sunflower oil"
      ],
      chemicalNames: [
        "Hydrogenated triglycerides",
        "Hydrogenated vegetable triglycerides"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: ["HVO"],
      labelVariants: [
        "Hydrogenated oil",
        "Hydrogenated vegetable oil",
        "Fully hydrogenated oil",
        "Hydrogenated fat",
        "Hydrogenated vegetable fat"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Hydrogenated oil is a processed fat marker. Partially hydrogenated oils remain a separate red PHO concern.",
      healthConcernType: "hydrogenated_processed_fat",
      warningLabel: "HYDROGENATED OIL FOUND",
      userFacingReason:
        "This product contains hydrogenated oil or fat. Truthlabel flags this as a processed-fat review marker unless the label says partially hydrogenated oil.",
      matchingNotes:
        "Match hydrogenated oil, hydrogenated vegetable oil, fully hydrogenated oil, hydrogenated fat, hydrogenated soybean/soya/canola/rapeseed/cottonseed/palm/palm kernel/coconut/sunflower oil, and HVO.",
      scoringImpact: "yellow_processed_fat",
      dataStatus: "starter"
    },

    {
      id: "partially_hydrogenated_oils",
      mainName: "Partially Hydrogenated Oils",
      otherNames: [
        "Partially hydrogenated oil",
        "Partially hydrogenated oils",
        "Partially hydrogenated vegetable oil",
        "Partially hydrogenated vegetable oils",
        "Partially hydrogenated fat",
        "Partially hydrogenated vegetable fat",
        "Partially hydrogenated soybean oil",
        "Partially hydrogenated soya oil",
        "Partially hydrogenated canola oil",
        "Partially hydrogenated rapeseed oil",
        "Partially hydrogenated cottonseed oil",
        "Partially hydrogenated palm oil",
        "Partially hydrogenated palm kernel oil",
        "Partially hydrogenated coconut oil",
        "Partially hydrogenated sunflower oil"
      ],
      chemicalNames: [
        "Partially hydrogenated triglycerides",
        "Partially hydrogenated vegetable triglycerides"
      ],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [
        "PHO",
        "PHOs"
      ],
      labelVariants: [
        "Partially hydrogenated oil",
        "Partially hydrogenated vegetable oil",
        "Partially hydrogenated fat",
        "Partially hydrogenated vegetable fat",
        "PHO"
      ],
      spellingVariants: [
        "Partially-hydrogenated",
        "Partially hydrogenated"
      ],
      regionalNames: [],
      severity: "red",
      reason:
        "Partially hydrogenated oils are treated by Truthlabel as an automatic red processed-oil concern and should also connect to the Hydrogenated / Partially Hydrogenated Oils category.",
      healthConcernType: "partially_hydrogenated_oil_trans_fat_marker",
      warningLabel: "PARTIALLY HYDROGENATED OIL FOUND",
      userFacingReason:
        "This product contains partially hydrogenated oil, a serious processed-oil marker. Truthlabel flags this as red immediately and links it to the hydrogenated oils check.",
      matchingNotes:
        "Match partially hydrogenated oil, partially hydrogenated vegetable oil, partially hydrogenated fat, partially hydrogenated soybean/soya/canola/rapeseed/cottonseed/palm/palm kernel/coconut/sunflower oil, PHO, and PHOs.",
      scoringImpact: "automatic_red",
      dataStatus: "starter"
    },

    {
      id: "refined_oil_marker",
      mainName: "Refined Oil Marker",
      otherNames: [
        "Refined oil",
        "Refined oils",
        "Refined vegetable oil",
        "Refined seed oil",
        "Refined cooking oil",
        "Refined edible oil",
        "Refined bleached deodorized oil",
        "Refined bleached deodorised oil",
        "Bleached oil",
        "Deodorized oil",
        "Deodorised oil",
        "RBD oil",
        "RBD vegetable oil",
        "RBD palm oil",
        "RBD palm olein"
      ],
      chemicalNames: [],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [
        "RBD"
      ],
      labelVariants: [
        "Refined oil",
        "Refined vegetable oil",
        "Refined seed oil",
        "Refined cooking oil",
        "RBD oil",
        "Refined bleached deodorized oil",
        "Refined bleached deodorised oil"
      ],
      spellingVariants: [
        "Deodorized",
        "Deodorised",
        "Bleached and deodorized",
        "Bleached and deodorised"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Refined oil wording indicates processed oil treatment or an industrial oil system.",
      healthConcernType: "refined_processed_oil_marker",
      warningLabel: "REFINED OIL FOUND",
      userFacingReason:
        "This product contains refined oil or RBD oil. Truthlabel flags this because the oil has been industrially processed for stability, appearance, taste, or performance.",
      matchingNotes:
        "Match refined oil, refined vegetable oil, refined seed oil, refined cooking oil, RBD oil, refined bleached deodorized/deodorised oil, bleached oil, and deodorized/deodorised oil.",
      scoringImpact: "yellow_processed_oil",
      dataStatus: "starter"
    }
  ],

  categoryScoringRules: {
    noSeedOrProcessedOilsFound: {
      severity: "green",
      display: "No",
      scoreImpact: 0
    },
    oneSeedOrProcessedOil: {
      severity: "yellow",
      display: "yellow_count_badge",
      scoreImpact: 8,
      reason:
        "Product contains a seed oil, processed oil, frying oil, refined oil, shortening, or processed fat marker."
    },
    threeOrMoreSeedOrProcessedOils: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: 18,
      reason:
        "Product contains multiple seed/processed oil systems. Truthlabel treats this as a high processed-oil load."
    },
    anyHydrogenatedOrPartiallyHydrogenatedOil: {
      severity: "yellow",
      display: "yellow_count_badge",
      scoreImpact: 12,
      examples: [
        "hydrogenated_oils",
        "partially_hydrogenated_oils"
      ],
      reason:
        "Product contains a hydrogenated or partially hydrogenated oil/fat marker. Partially hydrogenated oil should trigger red through the dedicated PHO rule."
    }
  },

  finalVerdictRules: {
    yellow:
      "This product contains a seed oil, processed oil, refined oil, frying oil, or processed fat marker. Truthlabel flags this because the product uses processed oil systems rather than simple whole-food fats.",
    redLoad:
      "This product contains multiple seed oils, processed oils, refined oils, or processed fat systems. Truthlabel flags this as a high processed-oil load.",
    redHydrogenated:
      "This product contains hydrogenated oil. Truthlabel flags this as a processed-fat review marker unless partially hydrogenated oil is confirmed."
  },

  matchingNormalizationRules: [
    "lowercase all ingredient text",
    "remove punctuation",
    "remove brackets",
    "collapse extra spaces",
    "normalize cold-pressed and cold pressed",
    "normalize expeller-pressed and expeller pressed",
    "normalize high-oleic and high oleic",
    "normalize non-hydrogenated and non hydrogenated",
    "normalize partially-hydrogenated and partially hydrogenated",
    "normalize deodorized and deodorised",
    "normalize soybean, soya bean, and soyabean where appropriate",
    "normalize cottonseed and cotton seed",
    "normalize grapeseed and grape seed",
    "do not double count the same oil if the name appears twice",
    "do not double count generic vegetable oil and a specific oil if the label clearly says 'vegetable oil (sunflower oil)' unless the parser treats the generic and specific as separate listed ingredients",
    "if partially hydrogenated oil appears, trigger red even if the base oil is also detected",
    "if hydrogenated oil appears, trigger red even if the base oil is also detected"
  ]
} as const;

export type SeedOilsProcessedOilsDataPack = typeof seedOilsProcessedOilsDataPack;
export type SeedOilsProcessedOilsItem = (typeof seedOilsProcessedOilsDataPack.items)[number];
