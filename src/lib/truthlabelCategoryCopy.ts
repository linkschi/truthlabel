import type { RedReasonType } from "@/lib/ingredientCategoryRules";

export type CategoryCopy = {
  reason: string;
  title: string;
  message: string;
  action?: string;
};

export type CategoryCopyProfile = {
  green?: CategoryCopy;
  yellow?: Record<string, CategoryCopy>;
  red?: Partial<Record<
    | "banned"
    | "phaseout"
    | "serious"
    | "cancer"
    | "probable"
    | "possible"
    | "recall"
    | "allergen"
    | "confirmed"
    | "contaminated"
    | "transfat"
    | "overload",
    CategoryCopy
  >>;
};

export type CategoryCopyInput = {
  categoryId: string;
  severity: "green" | "yellow" | "red";
  redReasonType?: RedReasonType;
  matchCount?: number;
  matchedItems?: string[];
  regions?: string[];
  regulatoryReason?: string;
};

export const truthlabelCategoryDisplayNames: Record<string, string> = {
  banned_restricted_items: "Banned / Restricted Items",
  artificial_colours: "Artificial Colours",
  artificial_sweeteners_sugar_substitutes:
    "Artificial Sweeteners / Sugar Substitutes",
  preservatives_shelf_life_systems: "Preservatives & Shelf-Life Systems",
  emulsifiers_stabilisers_thickeners_gums:
    "Emulsifiers / Stabilisers / Thickeners / Gums",
  flavour_enhancers_flavourings: "Flavour Enhancers / Flavourings",
  seed_oils_processed_oils: "Seed Oils / Processed Oils",
  hydrogenated_partially_hydrogenated_oils:
    "Hydrogenated / Partially Hydrogenated Oils",
  ultra_processed_indicators: "Ultra-Processed Indicators",
  artificial_engineered_food_construction:
    "Artificial / Engineered Food Construction",
  harmful_additives: "Harmful Additives",
  cancer_linked_watch: "Cancer-linked Watch",
  allergy_risk: "Allergy Risk",
  natural_positive: "Natural / Positive Ingredients",
  unknown_review: "Unknown / Review Ingredients",
  meat_specific_concerns: "Meat / Seafood Concerns",
  fry_oil_fast_food_oil: "Fry Oil / Fast Food Oil",
  heavy_metals: "Heavy Metals",
  microplastics: "Microplastics",
  brand_trust_safety: "Brand Trust / Safety / Recalls / Lawsuits",
  total_ingredients: "Ingredient Count",
  natural_vs_processed: "Natural vs Processed",
  additives_and_preservatives: "Additives & Preservatives",
};

export const truthlabelCategoryCopyProfiles: Record<string, CategoryCopyProfile> = {
  artificial_colours: {
    green: {
      reason: "Clear",
      title: "No flagged artificial colors",
      message: "No artificial colors of concern were detected.",
    },
    yellow: {
      moderate: {
        reason: "Moderate",
        title: "Artificial color detected",
        message:
          "This product contains an artificial color with a moderate concern. Eat products containing it in moderation, especially when several colors are used together.",
      },
    },
    red: {
      banned: {
        reason: "Banned",
        title: "Banned food color detected",
        message:
          "[Ingredient] is banned or no longer authorized for food use in [regions] because [regulatoryReason].",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Overload",
        title: "High artificial-color load",
        message:
          "This product contains [count] flagged artificial colors.",
        action:
          "Avoid frequent consumption and choose a product with fewer artificial colors.",
      },
      serious: {
        reason: "Serious",
        title: "Serious food color concern",
        message:
          "[Ingredient] has a serious regulatory or safety flag because [regulatoryReason].",
        action: "Avoid this product.",
      },
    },
  },
  allergy_risk: {
    green: {
      reason: "Clear",
      title: "No selected allergens detected",
      message: "None of the allergens on your Watch List were found as direct ingredients.",
    },
    yellow: {
      caution: {
        reason: "Caution",
        title: "Possible allergen exposure",
        message:
          "The label may indicate possible allergen exposure or shared-equipment risk.",
        action:
          "If you have a serious allergy, do not rely on moderation. Check the manufacturer's warning before eating it.",
      },
    },
    red: {
      allergen: {
        reason: "Allergen",
        title: "Your allergen is present",
        message:
          "This product directly contains [Ingredient], which is on your Watch List.",
        action:
          "Do not consume it if you are allergic to [Ingredient].",
      },
      recall: {
        reason: "Recall",
        title: "Undeclared allergen warning",
        message:
          "An official alert says this product may contain [Ingredient] without listing it correctly.",
        action:
          "Do not consume it if the warning applies to your product or batch.",
      },
      overload: {
        reason: "Allergen",
        title: "Your allergen is present",
        message:
          "This product directly contains [Ingredient], which is on your Watch List.",
        action:
          "Do not consume it if you are allergic to [Ingredient].",
      },
    },
  },
  artificial_sweeteners_sugar_substitutes: {
    green: {
      reason: "Clear",
      title: "No flagged sugar substitutes",
      message: "No non-sugar sweeteners of concern were detected.",
    },
    yellow: {
      moderate: {
        reason: "Moderate",
        title: "Sugar substitute detected",
        message:
          "This product contains [Ingredient], a non-sugar sweetener with a moderate or amount-dependent concern. Keep your intake moderate, especially if you consume several sweetened products each day.",
      },
    },
    red: {
      banned: {
        reason: "Banned",
        title: "Banned sweetener detected",
        message:
          "[Ingredient] is banned or not permitted as a food sweetener in [regions] because [regulatoryReason].",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Overload",
        title: "High sweetener load",
        message:
          "This product contains [count] different sweeteners or sugar substitutes.",
        action: "Limit how often you consume it.",
      },
      serious: {
        reason: "Serious",
        title: "Serious sweetener concern",
        message: "[Ingredient] has a serious regulatory or health flag because [regulatoryReason].",
        action: "Avoid this product.",
      },
    },
  },
  banned_restricted_items: {
    green: {
      reason: "Clear",
      title: "No verified banned ingredients",
      message:
        "No ingredients officially banned in Truthlabel's supported regions were detected.",
    },
    yellow: {
      restricted: {
        reason: "Restricted",
        title: "Ingredient use is restricted",
        message:
          "[Ingredient] is restricted in [regions]. Its use is limited because [regulatoryReason].",
      },
      review: {
        reason: "Review",
        title: "Regulatory status needs verification",
        message:
          "This ingredient may be prohibited or restricted, but Truthlabel has not yet confirmed the exact official rule.",
      },
    },
    red: {
      banned: {
        reason: "Banned",
        title: "Banned ingredient detected",
        message:
          "[Ingredient] is banned for food use in [regions] because [regulatoryReason].",
        action: "Avoid this product.",
      },
      phaseout: {
        reason: "Phaseout",
        title: "Ingredient being removed from food use",
        message:
          "[Ingredient] must be removed from foods in [regions] because [regulatoryReason].",
        action: "We recommend choosing an alternative.",
      },
      serious: {
        reason: "Serious",
        title: "Serious ingredient concern",
        message:
          "[Ingredient] has a serious official regulatory or safety flag in [regions] because [regulatoryReason].",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Banned",
        title: "Banned ingredient detected",
        message:
          "Truthlabel found one or more ingredients with serious official regulatory flags in [regions].",
        action: "Avoid this product.",
      },
    },
  },
  brand_trust_safety: {
    green: {
      reason: "Clear",
      title: "No active official alerts",
      message:
        "No active recall, outbreak, or official safety warning was found for this product.",
    },
    yellow: {
      history: {
        reason: "History",
        title: "Past safety issue found",
        message:
          "This product or brand has a previous recall, warning, or enforcement history. The current product is not confirmed to be under an active alert.",
      },
      unverified: {
        reason: "Unverified",
        title: "Unverified concern reported",
        message:
          "A lawsuit, user report, or third-party claim exists, but it does not prove that this product is unsafe.",
      },
    },
    red: {
      recall: {
        reason: "Recall",
        title: "Active safety alert",
        message:
          "This product is under an active official recall.",
        action:
          "Do not consume it. Follow the official recall instructions.",
      },
      confirmed: {
        reason: "Contaminated",
        title: "Confirmed contamination",
        message:
          "An official warning or verified test found dangerous contamination in this product.",
        action: "Do not consume this product.",
      },
    },
  },
  cancer_linked_watch: {
    green: {
      reason: "Clear",
      title: "No cancer-related flags",
      message:
        "No ingredients matched Truthlabel's current cancer-related concern list.",
    },
    yellow: {
      possible: {
        reason: "Possible",
        title: "Possible cancer link",
        message:
          "Research has raised a cancer concern about [Ingredient], but the evidence or risk at normal food exposure is not firmly established. This is a review signal, not proof of harm from one product.",
        action:
          "Eat products containing it in moderation rather than regularly.",
      },
    },
    red: {
      cancer: {
        reason: "Cancer",
        title: "Established cancer concern",
        message:
          "Strong evidence links [Ingredient] or the relevant food exposure to cancer.",
        action:
          "We recommend avoiding this product or consuming it very rarely.",
      },
      probable: {
        reason: "Probable",
        title: "Probable cancer concern",
        message:
          "Evidence shows a probable link between [Ingredient] and cancer.",
        action:
          "Avoid regular consumption and choose an alternative when possible.",
      },
      possible: {
        reason: "Possible",
        title: "Possible cancer concern",
        message:
          "Research has raised a possible cancer link, although the evidence is not conclusive.",
        action:
          "You may want to avoid regular consumption when alternatives are available.",
      },
      banned: {
        reason: "Banned",
        title: "Banned over cancer concerns",
        message:
          "[Ingredient] is banned or being removed from food use in [regions] because of [regulatoryReason].",
        action: "Avoid this product.",
      },
      serious: {
        reason: "Serious",
        title: "Serious cancer-related concern",
        message:
          "[Ingredient] has a serious cancer-related regulatory or scientific concern signal.",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Possible",
        title: "Possible cancer link",
        message:
          "Truthlabel treats possible cancer links as review signals for the MVP unless a separate established concern, ban, or official signal applies.",
        action:
          "You may want to avoid regular consumption when alternatives are available.",
      },
    },
  },
  emulsifiers_stabilisers_thickeners_gums: {
    green: {
      reason: "Clear",
      title: "Low texture-additive concern",
      message:
        "No notable emulsifier, stabilizer, thickener, or gum concerns were detected.",
    },
    yellow: {
      processing: {
        reason: "Processing",
        title: "Texture additives detected",
        message:
          "This product contains [count] emulsifiers, stabilizers, thickeners, or gums that increase its processing load.",
        action:
          "Eat it in moderation, especially if highly processed foods make up a large part of your diet.",
      },
    },
    red: {
      serious: {
        reason: "Serious",
        title: "Serious texture-additive concern",
        message:
          "[Ingredient] has a serious regulatory or health flag because [regulatoryReason].",
        action: "Avoid this product.",
      },
      banned: {
        reason: "Banned",
        title: "Banned texture-additive concern",
        message:
          "[Ingredient] is banned or not permitted in [regions] because [regulatoryReason].",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Overload",
        title: "High texture-additive load",
        message:
          "This product contains several emulsifiers, stabilizers, thickeners, or gums.",
        action:
          "Limit frequent consumption and choose a less processed alternative.",
      },
    },
  },
  flavour_enhancers_flavourings: {
    green: {
      reason: "Clear",
      title: "No flagged flavor-system concerns",
      message:
        "No notable flavor additive or flavor-transparency concerns were detected.",
    },
    yellow: {
      processing: {
        reason: "Processing",
        title: "Flavor additives detected",
        message:
          "This product uses flavorings or flavor enhancers that increase its processing load.",
        action:
          "Eat it in moderation, particularly if several flavor systems are present.",
      },
      unclear: {
        reason: "Unclear",
        title: "Flavor details are unclear",
        message:
          "The label uses a broad term such as natural flavors or flavoring without identifying the exact substances.",
      },
    },
    red: {
      banned: {
        reason: "Banned",
        title: "Banned flavoring ingredient",
        message:
          "[Ingredient] is banned for food use in [regions] because [regulatoryReason].",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Overload",
        title: "High flavor-system load",
        message:
          "This product contains several added flavor systems or unclear flavor ingredients.",
        action: "Limit how often you consume it.",
      },
      serious: {
        reason: "Serious",
        title: "Serious flavoring concern",
        message:
          "[Ingredient] has a serious regulatory or health flag because [regulatoryReason].",
        action: "Avoid this product.",
      },
    },
  },
  fry_oil_fast_food_oil: {
    green: {
      reason: "Clear",
      title: "Low frying concern",
      message: "No notable deep-frying or processed frying-fat concerns were detected.",
    },
    yellow: {
      fried: {
        reason: "Fried",
        title: "Frying-oil concern",
        message: "This product is fried or uses processed frying fats.",
        action: "Eat it occasionally rather than as an everyday food.",
      },
    },
    red: {
      transfat: {
        reason: "Trans fat",
        title: "Industrial trans fat detected",
        message:
          "This product contains partially hydrogenated frying oil, a source of industrial trans fat.",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Overload",
        title: "High frying-system load",
        message:
          "This product contains several frying, coating, and processed-fat concerns.",
        action:
          "Keep it as an occasional food rather than a regular choice.",
      },
    },
  },
  additives_and_preservatives: {
    green: {
      reason: "Clear",
      title: "Low additive concern",
      message: "Few or no notable additive concerns were detected.",
    },
    yellow: {
      moderate: {
        reason: "Moderate",
        title: "Additives to review",
        message:
          "This product contains one or more additives with moderate, amount-dependent, or processing-related concerns.",
        action: "Eat it in moderation and review the highlighted ingredients.",
      },
    },
    red: {
      serious: {
        reason: "Serious",
        title: "Serious additive concern",
        message:
          "This product contains [Ingredient], which has a serious regulatory or health concern because [regulatoryReason].",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Overload",
        title: "High additive load",
        message:
          "This product contains [count] different moderate additive concerns.",
        action:
          "Limit how often you consume it and choose a product with a simpler ingredient list.",
      },
      banned: {
        reason: "Banned",
        title: "Banned additive concern",
        message:
          "[Ingredient] is banned or restricted in [regions] because [regulatoryReason].",
        action: "Avoid this product.",
      },
    },
  },
  harmful_additives: {
    green: {
      reason: "Clear",
      title: "Low additive concern",
      message: "Few or no notable additive concerns were detected.",
    },
    yellow: {
      moderate: {
        reason: "Moderate",
        title: "Additives to review",
        message:
          "This product contains additive concerns with moderate, amount-dependent, or processing-related signals.",
        action: "Eat it in moderation and review the highlighted ingredients.",
      },
    },
    red: {
      serious: {
        reason: "Serious",
        title: "Serious additive concern",
        message:
          "This product contains [Ingredient], which has a serious regulatory or health concern because [regulatoryReason].",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Overload",
        title: "High additive load",
        message:
          "This product contains [count] different moderate additive concerns.",
        action:
          "Limit how often you consume it and choose a product with a simpler ingredient list.",
      },
      banned: {
        reason: "Banned",
        title: "Banned additive concern",
        message:
          "[Ingredient] is banned or restricted in [regions] because [regulatoryReason].",
        action: "Avoid this product.",
      },
    },
  },
  heavy_metals: {
    green: {
      reason: "Clear",
      title: "No verified heavy-metal warning",
      message:
        "No product-specific heavy-metal test failure, official warning, or recall was found.",
    },
    yellow: {
      review: {
        reason: "Review",
        title: "Heavy-metal review recommended",
        message:
          "This type of product has a known heavy-metal testing concern, but unsafe levels have not been confirmed for this exact product.",
        action:
          "For products eaten frequently, especially baby food, consider brands that publish reliable testing.",
      },
    },
    red: {
      confirmed: {
        reason: "Confirmed",
        title: "Heavy-metal level above safety limit",
        message:
          "A verified test or official alert found a heavy-metal warning above the applicable safety limit.",
        action: "Do not consume this product.",
      },
      recall: {
        reason: "Recall",
        title: "Heavy-metal recall warning",
        message:
          "An official recall or public-health alert reported a heavy-metal concern for this product.",
        action: "Do not consume it. Follow the official recall instructions.",
      },
    },
  },
  hydrogenated_partially_hydrogenated_oils: {
    green: {
      reason: "Clear",
      title: "No flagged hydrogenated fats",
      message: "No hydrogenated-fat concern was detected.",
    },
    yellow: {
      processed: {
        reason: "Processed",
        title: "Processed fat detected",
        message:
          "This product contains fully hydrogenated or another processed fat. It is not treated the same as partially hydrogenated oil, but it adds to the product's processed-fat load.",
        action: "Eat it in moderation.",
      },
    },
    red: {
      transfat: {
        reason: "Trans fat",
        title: "Industrial trans fat detected",
        message:
          "This product contains partially hydrogenated oil, an industrial trans-fat source.",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Overload",
        title: "High processed-fat load",
        message:
          "This product contains [count] processed oils or fats, crossing Truthlabel's threshold.",
        action: "Limit or avoid frequent consumption.",
      },
    },
  },
  meat_specific_concerns: {
    green: {
      reason: "Clear",
      title: "Low meat-processing concern",
      message:
        "No notable curing, filler, restructuring, or processed-meat markers were detected.",
    },
    yellow: {
      processed: {
        reason: "Processed",
        title: "Processed-meat markers detected",
        message:
          "This product uses curing agents, fillers, smoke flavor, added water, binders, or restructured meat.",
        action: "Eat it occasionally rather than as an everyday food.",
      },
    },
    red: {
      serious: {
        reason: "Cancer",
        title: "Established processed-meat concern",
        message:
          "Regular consumption of this type of processed meat is linked to an increased risk of colorectal cancer.",
        action:
          "Avoid making this a regular food and choose unprocessed alternatives more often.",
      },
      overload: {
        reason: "Overload",
        title: "High processed-meat load",
        message:
          "This product contains several curing, smoke, filler, binder, or restructuring concerns.",
        action:
          "Avoid frequent consumption and choose fresh, unprocessed meat more often.",
      },
    },
  },
  microplastics: {
    green: {
      reason: "Clear",
      title: "No verified microplastic warning",
      message:
        "No product-specific microplastic warning or confirmed harmful contamination was found.",
    },
    yellow: {
      uncertain: {
        reason: "Uncertain",
        title: "Microplastic evidence is uncertain",
        message:
          "This product, packaging type, or external test has a microplastic exposure signal, but harmful levels have not been confirmed for this exact product.",
        action:
          "Treat this as a research warning, not proof that the product is dangerous.",
      },
    },
    red: {
      confirmed: {
        reason: "Confirmed",
        title: "Confirmed contamination warning",
        message:
          "A verified test or official warning found contamination at a level considered harmful under the applicable standard.",
        action: "Do not consume this product.",
      },
    },
  },
  natural_positive: {
    green: {
      reason: "Simple",
      title: "Mostly simple ingredients",
      message:
        "This product contains familiar foods and basic cooking ingredients with no standalone ingredient concern.",
    },
  },
  preservatives_shelf_life_systems: {
    green: {
      reason: "Clear",
      title: "Low preservative concern",
      message: "No notable preservative concerns were detected.",
    },
    yellow: {
      moderate: {
        reason: "Moderate",
        title: "Preservatives detected",
        message:
          "This product contains [count] preservatives with moderate, sensitivity-related, or exposure-dependent concerns.",
        action:
          "Eat it in moderation, especially if you consume many packaged foods.",
      },
    },
    red: {
      banned: {
        reason: "Serious",
        title: "Serious preservative concern",
        message:
          "[Ingredient] has a serious regulatory or health concern because [regulatoryReason].",
        action: "Avoid this product.",
      },
      serious: {
        reason: "Serious",
        title: "Serious preservative concern",
        message:
          "[Ingredient] has a serious regulatory or health concern because [regulatoryReason].",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Overload",
        title: "High preservative load",
        message:
          "This product contains [count] moderate preservative concerns.",
        action:
          "Limit regular consumption and choose products with fewer preservatives.",
      },
    },
  },
  seed_oils_processed_oils: {
    green: {
      reason: "Clear",
      title: "Low processed-oil concern",
      message:
        "No notable modified, hydrogenated, or repeatedly heated oil concerns were detected.",
    },
    yellow: {
      processed: {
        reason: "Processed",
        title: "Processed oil detected",
        message:
          "This product uses a refined, modified, or heavily processed oil that adds to its processing load.",
        action:
          "Keep intake moderate, especially when the product is fried or highly processed.",
      },
    },
    red: {
      transfat: {
        reason: "Trans fat",
        title: "Industrial trans fat detected",
        message:
          "This product contains partially hydrogenated oil, an industrial trans-fat source.",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Overload",
        title: "High processed-oil load",
        message:
          "This product contains [count] processed oils or fats, crossing Truthlabel's threshold.",
        action: "Limit or avoid frequent consumption.",
      },
    },
  },
  ultra_processed_indicators: {
    green: {
      reason: "Simple",
      title: "Lower processing level",
      message: "Few industrial processing markers were detected.",
    },
    yellow: {
      processed: {
        reason: "Processed",
        title: "Ultra-processing markers detected",
        message:
          "This product contains ingredients commonly used to construct highly processed foods.",
        action: "Eat it in moderation and choose simpler foods more often.",
      },
    },
    red: {
      overload: {
        reason: "Overload",
        title: "Very high processing load",
        message:
          "This product contains [count] different ultra-processing markers.",
        action:
          "Truthlabel recommends limiting or avoiding it as a regular food.",
      },
      serious: {
        reason: "Serious",
        title: "Serious processing concern",
        message:
          "A serious banned, restricted, or direct-risk ingredient should be explained under its real category, not described merely as ultra-processed.",
        action: "Avoid this product.",
      },
    },
  },
  artificial_engineered_food_construction: {
    green: {
      reason: "Clear",
      title: "No engineered-food markers detected",
      message: "No artificial or engineered food-construction markers were found.",
    },
    yellow: {
      preference: {
        reason: "Engineered",
        title: "Engineered food methods detected",
        message:
          "This product uses biotechnology, bioengineered disclosure, cell-grown ingredients, precision fermentation, or added fortification. This does not automatically mean it is harmful.",
        action:
          "You may want to avoid this if you prefer food that is not genetically modified, cell-grown, or made using biotechnology.",
      },
      processing: {
        reason: "Engineered",
        title: "Engineered food methods detected",
        message:
          "This product uses reconstructed ingredients, isolated proteins, texture systems, modified carbohydrates, or industrial food-building methods.",
        action:
          "You may want to limit or avoid this if you prefer simpler, less processed food.",
      },
      unclear: {
        reason: "Unclear",
        title: "Food-construction details are unclear",
        message:
          "The label does not clearly explain some ingredients or processes used to make this product.",
        action:
          "You may want to choose a product with a clearer ingredient list if knowing exactly how your food was made matters to you.",
      },
    },
    red: {
      banned: {
        reason: "Banned",
        title: "Banned engineered ingredient",
        message:
          "[Ingredient] is banned or restricted in [regions] because [regulatoryReason].",
        action: "Avoid this product.",
      },
      serious: {
        reason: "Serious",
        title: "Serious engineered-ingredient concern",
        message:
          "This product contains [Ingredient], which has a serious health or regulatory flag because [regulatoryReason].",
        action: "Avoid this product.",
      },
      overload: {
        reason: "Overload",
        title: "High engineered-food load",
        message:
          "This product contains several reconstructed, isolated, textured, or heavily modified ingredients.",
        action:
          "Limit how often you consume it if you prefer simpler, less engineered food.",
      },
      recall: {
        reason: "Recall",
        title: "Active safety alert",
        message:
          "This product is connected to an active official recall or safety warning.",
        action: "Do not consume it. Follow the official recall instructions.",
      },
      allergen: {
        reason: "Allergen",
        title: "Your allergen is present",
        message:
          "This product contains [Ingredient], which is on your allergy Watch List.",
        action: "Do not consume it if you are allergic to [Ingredient].",
      },
    },
  },
  unknown_review: {
    green: {
      reason: "Clear",
      title: "Ingredient list is clear",
      message:
        "The label gives enough detail for Truthlabel to identify and assess the ingredients.",
    },
    yellow: {
      unclear: {
        reason: "Unclear",
        title: "Ingredient details are unclear",
        message:
          "The label uses vague terms such as [Ingredient], so Truthlabel cannot fully identify what the product contains.",
        action: "Choose a product with a clearer ingredient list when possible.",
      },
    },
    red: {
      overload: {
        reason: "Unclear",
        title: "Ingredient details are unclear",
        message:
          "Vague wording is a transparency concern, but it does not prove that hidden ingredients are dangerous.",
        action:
          "Choose a product with a clearer ingredient list when possible.",
      },
    },
  },
  total_ingredients: {
    green: {
      reason: "Short",
      title: "Short ingredient list",
      message: "This product has a shorter ingredient list based on the available label data.",
    },
    yellow: {
      longer: {
        reason: "Longer",
        title: "Longer ingredient list",
        message:
          "This product has [count] listed ingredients. Truthlabel flags longer ingredient lists for review because they can be harder to assess quickly.",
      },
    },
    red: {
      overload: {
        reason: "Long",
        title: "Very long ingredient list",
        message:
          "This product has [count] listed ingredients, which crosses Truthlabel's high ingredient-count threshold.",
        action:
          "Limit frequent consumption if you prefer simpler products with shorter ingredient lists.",
      },
    },
  },
  natural_vs_processed: {
    green: {
      reason: "Simple",
      title: "Mostly simple",
      message:
        "This product appears mostly simple based on the available ingredient list.",
    },
    yellow: {
      mixed: {
        reason: "Mixed",
        title: "Mixed ingredient profile",
        message:
          "This product appears mixed, with both simple ingredients and processed/artificial markers.",
      },
    },
    red: {
      overload: {
        reason: "Processed",
        title: "High processed share",
        message:
          "This product appears heavily processed based on the available ingredient list.",
        action:
          "Limit how often you consume it and choose simpler foods more often.",
      },
      serious: {
        reason: "Processed",
        title: "High processed share",
        message:
          "This product appears heavily processed based on the available ingredient list.",
        action:
          "Limit how often you consume it and choose simpler foods more often.",
      },
    },
  },
};

function getFirstMatchedItem(input: CategoryCopyInput) {
  return input.matchedItems?.[0] ?? "the flagged ingredient";
}

function formatCount(input: CategoryCopyInput) {
  return String(input.matchCount ?? input.matchedItems?.length ?? 0);
}

function formatRegions(input: CategoryCopyInput) {
  if (!input.regions?.length) {
    return "supported regions";
  }

  if (input.regions.length === 1) {
    return input.regions[0];
  }

  if (input.regions.length === 2) {
    return `${input.regions[0]} and ${input.regions[1]}`;
  }

  return `${input.regions.slice(0, -1).join(", ")}, and ${input.regions.at(-1)}`;
}

function getRegulatoryReason(input: CategoryCopyInput) {
  return input.regulatoryReason ?? "an official regulatory or safety concern";
}

function fillCopyTemplate(copy: CategoryCopy, input: CategoryCopyInput): CategoryCopy {
  const replacements: Record<string, string> = {
    "[Ingredient]": getFirstMatchedItem(input),
    "[ingredient]": getFirstMatchedItem(input),
    "[count]": formatCount(input),
    "[regions]": formatRegions(input),
    "[regulatoryReason]": getRegulatoryReason(input),
  };

  const replace = (value: string) =>
    Object.entries(replacements).reduce(
      (current, [token, replacement]) => current.replaceAll(token, replacement),
      value,
    );

  return {
    reason: replace(copy.reason),
    title: replace(copy.title),
    message: replace(copy.message),
    action: copy.action ? replace(copy.action) : undefined,
  };
}

function getYellowReasonKey(categoryId: string, matchedItems: string[]) {
  if (categoryId === "artificial_engineered_food_construction") {
    const matchedText = matchedItems.join(" ");

    if (/unclear|proprietary|unspecified|not clearly|label transparency/i.test(matchedText)) {
      return "unclear";
    }

    if (
      /imitation|analog|analogue|reformed|reconstructed|mechanically|separated|recovered|isolate|isolated|textured|filler|extender|binder|modified|starch|methylcellulose|emulsifier|stabilizer|stabiliser|flavor|flavour|powder|concentrate|fiber|fibre|leghemoglobin|heme|extrud|printed|structured|surimi/i.test(
        matchedText,
      )
    ) {
      return "processing";
    }

    return "preference";
  }

  if (
    categoryId === "flavour_enhancers_flavourings" &&
    matchedItems.some((item) => /natural flavor|natural flavour|flavoring|flavouring/i.test(item))
  ) {
    return "unclear";
  }

  const keyByCategory: Record<string, string> = {
    allergy_risk: "caution",
    artificial_colours: "moderate",
    artificial_sweeteners_sugar_substitutes: "moderate",
    banned_restricted_items: "restricted",
    brand_trust_safety: "history",
    cancer_linked_watch: "possible",
    emulsifiers_stabilisers_thickeners_gums: "processing",
    flavour_enhancers_flavourings: "processing",
    fry_oil_fast_food_oil: "fried",
    additives_and_preservatives: "moderate",
    harmful_additives: "moderate",
    heavy_metals: "review",
    hydrogenated_partially_hydrogenated_oils: "processed",
    meat_specific_concerns: "processed",
    microplastics: "uncertain",
    preservatives_shelf_life_systems: "moderate",
    seed_oils_processed_oils: "processed",
    ultra_processed_indicators: "processed",
    unknown_review: "unclear",
  };

  return keyByCategory[categoryId] ?? "moderate";
}

function getRedReasonKey(input: CategoryCopyInput) {
  if (input.redReasonType === "count_overload") {
    return "overload";
  }

  if (input.redReasonType === "allergy_profile_match") {
    return "allergen";
  }

  if (input.redReasonType === "verified_external_signal") {
    if (input.categoryId === "brand_trust_safety") {
      return "recall";
    }

    return "confirmed";
  }

  if (input.redReasonType === "banned_restricted") {
    return "banned";
  }

  if (
    input.categoryId === "hydrogenated_partially_hydrogenated_oils" ||
    input.categoryId === "seed_oils_processed_oils" ||
    input.categoryId === "fry_oil_fast_food_oil"
  ) {
    return "transfat";
  }

  if (input.categoryId === "cancer_linked_watch") {
    return "cancer";
  }

  return "serious";
}

const fallbackCopyBySeverity: Record<"green" | "yellow" | "red", CategoryCopy> = {
  green: {
    reason: "Clear",
    title: "No flagged concern",
    message: "No notable concern was detected from the available label data.",
  },
  yellow: {
    reason: "Review",
    title: "Review item detected",
    message: "Truthlabel flags this item for review based on available label data.",
  },
  red: {
    reason: "Serious",
    title: "Serious concern detected",
    message:
      "Truthlabel flags this red because a serious warning, direct-risk, or overload rule was triggered.",
  },
};

export function getCategoryCopy(input: CategoryCopyInput): CategoryCopy {
  const profile = truthlabelCategoryCopyProfiles[input.categoryId];
  const matchedItems = input.matchedItems ?? [];
  let copy: CategoryCopy | undefined;

  if (input.severity === "green") {
    copy = profile?.green;
  } else if (input.severity === "yellow") {
    const yellowKey = getYellowReasonKey(input.categoryId, matchedItems);
    copy = profile?.yellow?.[yellowKey] ?? Object.values(profile?.yellow ?? {})[0];
  } else {
    const redKey = getRedReasonKey(input);
    copy =
      profile?.red?.[redKey as keyof NonNullable<CategoryCopyProfile["red"]>] ??
      Object.values(profile?.red ?? {})[0];
  }

  return fillCopyTemplate(copy ?? fallbackCopyBySeverity[input.severity], input);
}
