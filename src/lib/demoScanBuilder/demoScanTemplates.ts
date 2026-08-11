import {
  createDemoId,
  type DemoCategoryIconName,
  type DemoScanCategory,
  type DemoScanFinding,
  type DemoSeverity,
} from "@/lib/demoScanBuilder/demoScanTypes";

export const demoTemplateStateOptions = ["good", "bad", "very_bad"] as const;

export type DemoTemplateState = (typeof demoTemplateStateOptions)[number];

export const demoIngredientProductTypeOptions = [
  "breakfast_cereal",
  "snack_chips",
  "sweet_drink",
  "sauce_condiment",
  "frozen_meal",
] as const;

export type DemoIngredientProductType =
  (typeof demoIngredientProductTypeOptions)[number];

export type DemoCategoryTemplateId =
  | "cancer_linked"
  | "heavy_processing"
  | "harmful_additives"
  | "banned_restricted"
  | "allergy_watchlist"
  | "bioengineered_lab_made"
  | "seed_oils"
  | "brand_trust"
  | "heavy_metals"
  | "simple_ingredients";

type DemoFindingTemplate = {
  name: string;
  severity: DemoSeverity;
  explanation: string;
};

type DemoCategoryTemplateState = {
  statusLabel: string;
  severity: DemoSeverity;
  count: number;
  reason: string;
  message: string;
  action: string;
  findings: DemoFindingTemplate[];
};

type DemoCategoryTemplate = {
  id: DemoCategoryTemplateId;
  label: string;
  iconName: DemoCategoryIconName;
  states: Record<DemoTemplateState, DemoCategoryTemplateState>;
};

const stateToSeverity: Record<DemoTemplateState, DemoSeverity> = {
  good: "green",
  bad: "yellow",
  very_bad: "red",
};

export const demoCategoryTemplates: DemoCategoryTemplate[] = [
  {
    id: "cancer_linked",
    label: "Cancer-linked",
    iconName: "flame",
    states: {
      good: {
        statusLabel: "No",
        severity: "green",
        count: 0,
        reason: "No cancer-linked demo markers selected.",
        message:
          "This demo state shows a product without selected cancer-linked ingredient warnings.",
        action: "Keep this as a clean comparison category.",
        findings: [
          {
            name: "No flagged cancer-linked demo item",
            severity: "green",
            explanation:
              "The demo category is set to show no selected cancer-linked concern.",
          },
        ],
      },
      bad: {
        statusLabel: "Review",
        severity: "yellow",
        count: 1,
        reason: "One ingredient is being shown as a long-term review item.",
        message:
          "This demo state can represent a product with one ingredient customers may want to look at more carefully.",
        action: "Use this for a cautionary but not extreme example.",
        findings: [
          {
            name: "Preservative review marker",
            severity: "yellow",
            explanation:
              "Example finding for an ingredient that raises a long-term review question in this demo.",
          },
        ],
      },
      very_bad: {
        statusLabel: "Yes",
        severity: "red",
        count: 3,
        reason: "Multiple serious long-term warning examples are selected.",
        message:
          "This demo state shows how a product can look when serious cancer-linked warnings are placed front and center.",
        action: "Use this when the demo should clearly feel high-risk.",
        findings: [
          {
            name: "Processed meat style warning",
            severity: "red",
            explanation:
              "Example serious finding used to show a stronger long-term warning.",
          },
          {
            name: "Artificial color concern",
            severity: "red",
            explanation:
              "Example red finding for a color or additive customers may want to avoid.",
          },
          {
            name: "High heat processing signal",
            severity: "yellow",
            explanation:
              "Example supporting finding that makes the overall category feel heavier.",
          },
        ],
      },
    },
  },
  {
    id: "heavy_processing",
    label: "Heavy processing",
    iconName: "factory",
    states: {
      good: {
        statusLabel: "Low",
        severity: "green",
        count: 0,
        reason: "The demo product is presented as simple and minimally processed.",
        message:
          "This state shows a short, familiar ingredient profile without heavy processing signals.",
        action: "Use this for clean product examples.",
        findings: [
          {
            name: "Short ingredient profile",
            severity: "green",
            explanation:
              "The demo product uses a simple list instead of a long processing system.",
          },
        ],
      },
      bad: {
        statusLabel: "Heavy",
        severity: "yellow",
        count: 4,
        reason: "Several processing markers are shown in the demo label.",
        message:
          "This state represents products with added starches, gums, refined oils, or flavor systems.",
        action: "Use this for products that should feel processed but not the worst case.",
        findings: [
          {
            name: "Modified starch",
            severity: "yellow",
            explanation:
              "Example processing marker used for texture or product structure.",
          },
          {
            name: "Flavor system",
            severity: "yellow",
            explanation:
              "Example wording showing flavor has been built with helper ingredients.",
          },
          {
            name: "Stabilizer blend",
            severity: "yellow",
            explanation:
              "Example gum or stabilizer system that makes the formula less simple.",
          },
        ],
      },
      very_bad: {
        statusLabel: "Very heavy",
        severity: "red",
        count: 8,
        reason: "The demo product is packed with industrial processing markers.",
        message:
          "This state shows a product that feels heavily engineered, with many texture, flavor, color, and shelf-life systems.",
        action: "Use this for a strong warning-style demo.",
        findings: [
          {
            name: "Industrial texture system",
            severity: "red",
            explanation:
              "Example finding for multiple gums, emulsifiers, and modified starches.",
          },
          {
            name: "Artificial flavor system",
            severity: "red",
            explanation:
              "Example finding showing flavor built through additives rather than simple ingredients.",
          },
          {
            name: "Long formula overload",
            severity: "red",
            explanation:
              "Example finding for a long label with many processing aids.",
          },
        ],
      },
    },
  },
  {
    id: "harmful_additives",
    label: "Harmful additives",
    iconName: "additive",
    states: {
      good: {
        statusLabel: "No",
        severity: "green",
        count: 0,
        reason: "No selected additive warning is included in this demo state.",
        message:
          "This state helps you show a cleaner product without additive-heavy concerns.",
        action: "Use this for cleaner comparison scans.",
        findings: [
          {
            name: "No selected additive warning",
            severity: "green",
            explanation:
              "The demo category is set to show no additive warning for this example.",
          },
        ],
      },
      bad: {
        statusLabel: "Yes",
        severity: "yellow",
        count: 2,
        reason: "A few additive review items are present in the demo.",
        message:
          "This state can represent a product with preservatives, gums, or helper ingredients.",
        action: "Use this for a product that deserves a closer look.",
        findings: [
          {
            name: "Preservative system",
            severity: "yellow",
            explanation:
              "Example finding for an ingredient used to extend shelf life.",
          },
          {
            name: "Gum or stabilizer",
            severity: "yellow",
            explanation:
              "Example finding for texture support in a processed formula.",
          },
        ],
      },
      very_bad: {
        statusLabel: "Yes",
        severity: "red",
        count: 5,
        reason: "Several stronger additive warnings are included in the demo.",
        message:
          "This state shows how multiple additives can make a product look more concerning.",
        action: "Use this for a high-impact demo result.",
        findings: [
          {
            name: "Artificial color",
            severity: "red",
            explanation:
              "Example red additive finding for a color customers may avoid.",
          },
          {
            name: "Chemical preservative",
            severity: "red",
            explanation:
              "Example stronger shelf-life additive finding.",
          },
          {
            name: "Multiple stabilizers",
            severity: "yellow",
            explanation:
              "Example supporting finding showing additive load.",
          },
        ],
      },
    },
  },
  {
    id: "banned_restricted",
    label: "Banned or restricted",
    iconName: "ban",
    states: {
      good: {
        statusLabel: "No",
        severity: "green",
        count: 0,
        reason: "No banned or restricted demo item is selected.",
        message:
          "This state shows a product with no selected banned or restricted ingredient warning.",
        action: "Use this for a clean product example.",
        findings: [
          {
            name: "No selected restricted item",
            severity: "green",
            explanation:
              "The demo category is set to show no restricted item for this example.",
          },
        ],
      },
      bad: {
        statusLabel: "Review",
        severity: "yellow",
        count: 1,
        reason: "One region-specific restriction example is included.",
        message:
          "This state can show how an ingredient may be allowed in one place while raising questions somewhere else.",
        action: "Use this when you want a caution without making it the main red alert.",
        findings: [
          {
            name: "Region-specific restriction example",
            severity: "yellow",
            explanation:
              "Example finding for an ingredient that may be restricted or reviewed in some markets.",
          },
        ],
      },
      very_bad: {
        statusLabel: "Yes",
        severity: "red",
        count: 2,
        reason: "Selected restricted ingredient examples are included.",
        message:
          "This state shows the kind of result where a restricted or banned-style item becomes a major warning.",
        action: "Use this for a serious demo alert.",
        findings: [
          {
            name: "Banned color example",
            severity: "red",
            explanation:
              "Example red finding for an ingredient presented as banned or being removed in some places.",
          },
          {
            name: "Restricted additive example",
            severity: "red",
            explanation:
              "Example finding for a second restriction-style warning.",
          },
        ],
      },
    },
  },
  {
    id: "allergy_watchlist",
    label: "Allergy / Watch List",
    iconName: "allergy",
    states: {
      good: {
        statusLabel: "No match",
        severity: "green",
        count: 0,
        reason: "No selected allergy or watch-list match is shown.",
        message:
          "This state shows how a product can appear when it does not match a user's selected watch list.",
        action: "Use this for safer personal-preference demos.",
        findings: [
          {
            name: "No selected watch-list match",
            severity: "green",
            explanation:
              "The demo category is set to show no selected personal match.",
          },
        ],
      },
      bad: {
        statusLabel: "Check",
        severity: "yellow",
        count: 1,
        reason: "A possible personal watch-list item is included.",
        message:
          "This state can represent unclear labeling or a preference item the user may want to review.",
        action: "Use this when the demo should feel personalized but not severe.",
        findings: [
          {
            name: "Possible watch-list match",
            severity: "yellow",
            explanation:
              "Example finding for a preference or possible allergen-related review item.",
          },
        ],
      },
      very_bad: {
        statusLabel: "Match",
        severity: "red",
        count: 2,
        reason: "A personal allergy or avoid-list match is highlighted.",
        message:
          "This state shows how urgent a product can feel when it matches something the user personally avoids.",
        action: "Use this for a strong personal-protection demo.",
        findings: [
          {
            name: "User avoid-list match",
            severity: "red",
            explanation:
              "Example red finding for an ingredient the user has chosen to avoid.",
          },
          {
            name: "Contains statement review",
            severity: "yellow",
            explanation:
              "Example supporting finding from a contains or may-contain style label.",
          },
        ],
      },
    },
  },
  {
    id: "bioengineered_lab_made",
    label: "Bioengineered / lab-made",
    iconName: "beaker",
    states: {
      good: {
        statusLabel: "No",
        severity: "green",
        count: 0,
        reason: "No selected bioengineered or lab-made marker is shown.",
        message:
          "This state helps demonstrate a product with no selected engineered-food marker.",
        action: "Use this for cleaner comparison examples.",
        findings: [
          {
            name: "No selected engineered marker",
            severity: "green",
            explanation:
              "The demo category is set to show no selected engineered-food marker.",
          },
        ],
      },
      bad: {
        statusLabel: "Likely",
        severity: "yellow",
        count: 1,
        reason: "A possible engineered-food marker is included.",
        message:
          "This state can represent products that use bioengineered disclosure or ingredients commonly tied to engineered crops.",
        action: "Use this for a review-style engineered-food demo.",
        findings: [
          {
            name: "Bioengineered disclosure",
            severity: "yellow",
            explanation:
              "Example finding for a product with a bioengineered-food style disclosure.",
          },
        ],
      },
      very_bad: {
        statusLabel: "Yes",
        severity: "red",
        count: 3,
        reason: "Several engineered or lab-made markers are included.",
        message:
          "This state shows a stronger engineered-food result with multiple markers in the same product.",
        action: "Use this when the demo should clearly call attention to engineered-food signals.",
        findings: [
          {
            name: "Bioengineered ingredient marker",
            severity: "red",
            explanation:
              "Example red finding for an engineered-food marker in the label.",
          },
          {
            name: "Lab-made flavor or protein marker",
            severity: "red",
            explanation:
              "Example finding for a lab-made style ingredient signal.",
          },
          {
            name: "Hidden source concern",
            severity: "yellow",
            explanation:
              "Example supporting finding for unclear ingredient source disclosure.",
          },
        ],
      },
    },
  },
  {
    id: "seed_oils",
    label: "Seed oils",
    iconName: "oil",
    states: {
      good: {
        statusLabel: "No",
        severity: "green",
        count: 0,
        reason: "No selected seed-oil marker is shown.",
        message:
          "This state can show a product using a simpler fat source or no added oil.",
        action: "Use this for cleaner oil-profile examples.",
        findings: [
          {
            name: "No selected seed oil",
            severity: "green",
            explanation:
              "The demo category is set to show no selected seed-oil marker.",
          },
        ],
      },
      bad: {
        statusLabel: "Yes",
        severity: "yellow",
        count: 1,
        reason: "A refined seed oil example is included.",
        message:
          "This state can represent a product using common refined oils in the ingredient list.",
        action: "Use this for everyday review examples.",
        findings: [
          {
            name: "Refined seed oil",
            severity: "yellow",
            explanation:
              "Example finding for soybean, canola, sunflower, or similar oil wording.",
          },
        ],
      },
      very_bad: {
        statusLabel: "Heavy",
        severity: "red",
        count: 3,
        reason: "Multiple refined oil or fried-oil markers are shown.",
        message:
          "This state shows a heavier oil profile where seed oils are part of the product's main formula.",
        action: "Use this for stronger snack or fried-food demos.",
        findings: [
          {
            name: "Multiple refined oils",
            severity: "red",
            explanation:
              "Example red finding for a product using several refined oils.",
          },
          {
            name: "Fried-oil marker",
            severity: "red",
            explanation:
              "Example finding for a product where the oil is central to processing.",
          },
        ],
      },
    },
  },
  {
    id: "brand_trust",
    label: "Brand trust",
    iconName: "shield",
    states: {
      good: {
        statusLabel: "Clear",
        severity: "green",
        count: 0,
        reason: "No selected brand-trust warning is shown.",
        message:
          "This state represents a demo product without selected recall, lawsuit, or warning-letter style signals.",
        action: "Use this for clean brand examples.",
        findings: [
          {
            name: "No selected brand warning",
            severity: "green",
            explanation:
              "The demo category is set to show no selected brand-trust warning.",
          },
        ],
      },
      bad: {
        statusLabel: "Review",
        severity: "yellow",
        count: 1,
        reason: "One documented-record style warning is included.",
        message:
          "This state can represent a brand with a recall, warning letter, lawsuit, or labeling review item.",
        action: "Use this when the brand record should be noticed.",
        findings: [
          {
            name: "Documented company record",
            severity: "yellow",
            explanation:
              "Example finding for a warning-letter, recall, or label-claim review item.",
          },
        ],
      },
      very_bad: {
        statusLabel: "Warning",
        severity: "red",
        count: 3,
        reason: "Multiple serious brand-trust examples are included.",
        message:
          "This state shows how a product can look when the brand history itself becomes part of the warning.",
        action: "Use this for demos about company behavior or safety records.",
        findings: [
          {
            name: "Recall history example",
            severity: "red",
            explanation:
              "Example red finding for a documented recall or safety action.",
          },
          {
            name: "Mislabeling record example",
            severity: "red",
            explanation:
              "Example finding for undeclared allergen, misbranding, or misleading label history.",
          },
          {
            name: "Repeated safety concern example",
            severity: "yellow",
            explanation:
              "Example supporting finding for repeated public safety concerns.",
          },
        ],
      },
    },
  },
  {
    id: "heavy_metals",
    label: "Heavy metals",
    iconName: "metal",
    states: {
      good: {
        statusLabel: "Low",
        severity: "green",
        count: 0,
        reason: "No selected heavy-metal concern is shown.",
        message:
          "This state can show a product where no selected heavy-metal warning is part of the demo.",
        action: "Use this for clean comparison examples.",
        findings: [
          {
            name: "No selected heavy-metal warning",
            severity: "green",
            explanation:
              "The demo category is set to show no selected heavy-metal concern.",
          },
        ],
      },
      bad: {
        statusLabel: "Possible",
        severity: "yellow",
        count: 1,
        reason: "A possible heavy-metal exposure marker is included.",
        message:
          "This state can represent products where the category or ingredient source deserves review.",
        action: "Use this for chocolate, seafood, rice, or similar demos.",
        findings: [
          {
            name: "Possible lead or cadmium concern",
            severity: "yellow",
            explanation:
              "Example finding for a category where heavy-metal exposure may deserve attention.",
          },
        ],
      },
      very_bad: {
        statusLabel: "Warning",
        severity: "red",
        count: 2,
        reason: "Stronger heavy-metal warning examples are selected.",
        message:
          "This state shows a demo result where heavy-metal concerns become one of the main reasons to avoid or limit the product.",
        action: "Use this for a serious chocolate, seafood, rice, or supplement-style demo.",
        findings: [
          {
            name: "Lead warning example",
            severity: "red",
            explanation:
              "Example red finding for a serious lead-related warning.",
          },
          {
            name: "Cadmium warning example",
            severity: "red",
            explanation:
              "Example red finding for a serious cadmium-related warning.",
          },
        ],
      },
    },
  },
  {
    id: "simple_ingredients",
    label: "Better / simple ingredients",
    iconName: "leaf",
    states: {
      good: {
        statusLabel: "Strong",
        severity: "green",
        count: 5,
        reason: "Simple recognizable ingredients are emphasized.",
        message:
          "This state helps show the positive side of a cleaner ingredient profile.",
        action: "Use this for products that should look like better choices.",
        findings: [
          {
            name: "Recognizable base ingredients",
            severity: "green",
            explanation:
              "Example finding for ingredients that look simple and familiar.",
          },
          {
            name: "No long additive system",
            severity: "green",
            explanation:
              "Example finding showing the product does not rely on many helper additives.",
          },
        ],
      },
      bad: {
        statusLabel: "Mixed",
        severity: "yellow",
        count: 2,
        reason: "Some simple ingredients are present, but the formula is mixed.",
        message:
          "This state represents products with a few good base ingredients plus some processing markers.",
        action: "Use this for an in-between demo without using a moderate state label.",
        findings: [
          {
            name: "Good base ingredient",
            severity: "green",
            explanation:
              "Example positive finding for the main ingredient.",
          },
          {
            name: "Processed helper ingredient",
            severity: "yellow",
            explanation:
              "Example finding showing the simple ingredient profile is not fully clean.",
          },
        ],
      },
      very_bad: {
        statusLabel: "Weak",
        severity: "red",
        count: 1,
        reason: "Very little simple-food value is shown in this demo.",
        message:
          "This state shows a product where the ingredient profile looks mostly built from refined or industrial components.",
        action: "Use this when you want the product to look weak on ingredient quality.",
        findings: [
          {
            name: "Mostly refined formula",
            severity: "red",
            explanation:
              "Example finding showing the product does not present as a simple whole-food style option.",
          },
        ],
      },
    },
  },
];

const demoIngredientPresets: Record<
  DemoIngredientProductType,
  Record<DemoTemplateState, string[][]>
> = {
  breakfast_cereal: {
    good: [
      ["Whole grain oats", "Almonds", "Pumpkin seeds", "Cinnamon", "Sea salt"],
      ["Organic rolled oats", "Dates", "Coconut flakes", "Chia seeds", "Vanilla"],
    ],
    bad: [
      [
        "Whole grain corn",
        "Cane sugar",
        "Rice flour",
        "Sunflower oil",
        "Natural flavor",
        "Mixed tocopherols",
      ],
      [
        "Wheat flour",
        "Sugar",
        "Corn syrup",
        "Canola oil",
        "Calcium carbonate",
        "Natural flavor",
      ],
    ],
    very_bad: [
      [
        "Corn flour",
        "Sugar",
        "High fructose corn syrup",
        "Hydrogenated soybean oil",
        "Artificial flavor",
        "Red 40",
        "Yellow 5",
        "BHT",
      ],
      [
        "Enriched wheat flour",
        "Sugar",
        "Corn syrup solids",
        "Maltodextrin",
        "Palm oil",
        "Artificial color",
        "Artificial flavor",
        "TBHQ",
      ],
    ],
  },
  snack_chips: {
    good: [
      ["Potatoes", "Avocado oil", "Sea salt"],
      ["Organic corn", "Olive oil", "Sea salt", "Lime"],
    ],
    bad: [
      [
        "Potatoes",
        "Sunflower oil",
        "Salt",
        "Yeast extract",
        "Natural flavor",
        "Citric acid",
      ],
      [
        "Corn masa flour",
        "Vegetable oil",
        "Salt",
        "Spices",
        "Maltodextrin",
        "Natural flavor",
      ],
    ],
    very_bad: [
      [
        "Corn flour",
        "Vegetable oil",
        "Maltodextrin",
        "Monosodium glutamate",
        "Artificial flavor",
        "Yellow 6",
        "Red 40",
        "Disodium inosinate",
      ],
      [
        "Potato flakes",
        "Corn starch",
        "Soybean oil",
        "Modified food starch",
        "Artificial flavor",
        "Sodium benzoate",
        "Blue 1",
      ],
    ],
  },
  sweet_drink: {
    good: [
      ["Sparkling water", "Lemon juice", "Organic cane sugar"],
      ["Filtered water", "Green tea", "Honey", "Lemon extract"],
    ],
    bad: [
      [
        "Carbonated water",
        "Cane sugar",
        "Citric acid",
        "Natural flavor",
        "Sodium citrate",
      ],
      [
        "Filtered water",
        "Sugar",
        "Fruit juice concentrate",
        "Natural flavor",
        "Ascorbic acid",
      ],
    ],
    very_bad: [
      [
        "Carbonated water",
        "High fructose corn syrup",
        "Caramel color",
        "Phosphoric acid",
        "Artificial flavor",
        "Sodium benzoate",
        "Red 40",
      ],
      [
        "Water",
        "Corn syrup",
        "Sucralose",
        "Acesulfame potassium",
        "Artificial color",
        "Potassium sorbate",
        "Artificial flavor",
      ],
    ],
  },
  sauce_condiment: {
    good: [
      ["Tomatoes", "Apple cider vinegar", "Dates", "Sea salt", "Onion powder"],
      ["Tomatoes", "Olive oil", "Garlic", "Basil", "Sea salt"],
    ],
    bad: [
      [
        "Tomato concentrate",
        "Sugar",
        "Distilled vinegar",
        "Salt",
        "Natural flavor",
        "Onion powder",
      ],
      [
        "Water",
        "Tomato paste",
        "Cane sugar",
        "Canola oil",
        "Spices",
        "Citric acid",
      ],
    ],
    very_bad: [
      [
        "Tomato concentrate",
        "High fructose corn syrup",
        "Corn syrup",
        "Distilled vinegar",
        "Modified corn starch",
        "Natural flavor",
        "Potassium sorbate",
        "Red 40",
      ],
      [
        "Water",
        "Soybean oil",
        "Sugar",
        "Modified food starch",
        "Polysorbate 60",
        "Artificial flavor",
        "Sodium benzoate",
        "Yellow 5",
      ],
    ],
  },
  frozen_meal: {
    good: [
      ["Chicken breast", "Brown rice", "Broccoli", "Olive oil", "Sea salt"],
      ["Beef", "Sweet potatoes", "Green beans", "Garlic", "Sea salt"],
    ],
    bad: [
      [
        "Cooked pasta",
        "Chicken",
        "Cream sauce",
        "Canola oil",
        "Modified corn starch",
        "Natural flavor",
        "Sodium phosphate",
      ],
      [
        "Rice",
        "Beef",
        "Vegetable oil",
        "Soy sauce",
        "Sugar",
        "Xanthan gum",
        "Natural flavor",
      ],
    ],
    very_bad: [
      [
        "Mechanically separated chicken",
        "Enriched wheat flour",
        "Soybean oil",
        "Modified food starch",
        "Maltodextrin",
        "Artificial flavor",
        "Sodium phosphate",
        "Carrageenan",
        "Yellow 5",
      ],
      [
        "Beef patty pieces",
        "Water",
        "Textured soy protein",
        "Hydrogenated oil",
        "Modified corn starch",
        "Disodium inosinate",
        "Artificial smoke flavor",
        "Potassium sorbate",
      ],
    ],
  },
};

export function getDemoTemplateStateLabel(state: DemoTemplateState) {
  if (state === "very_bad") {
    return "Very bad";
  }

  return state === "good" ? "Good" : "Bad";
}

export function getDemoIngredientProductTypeLabel(
  productType: DemoIngredientProductType,
) {
  switch (productType) {
    case "breakfast_cereal":
      return "Breakfast cereal";
    case "snack_chips":
      return "Snack / chips";
    case "sweet_drink":
      return "Sweet drink";
    case "sauce_condiment":
      return "Sauce / condiment";
    case "frozen_meal":
      return "Frozen meal";
  }
}

function cloneFindingTemplate(finding: DemoFindingTemplate): DemoScanFinding {
  return {
    ...finding,
    id: createDemoId("finding"),
  };
}

export function createDemoCategoryFromTemplate(
  templateId: DemoCategoryTemplateId,
  state: DemoTemplateState,
): DemoScanCategory {
  const template =
    demoCategoryTemplates.find((entry) => entry.id === templateId) ??
    demoCategoryTemplates[0];
  const selectedState = template.states[state];

  return {
    id: createDemoId("category"),
    iconName: template.iconName,
    name: template.label,
    statusLabel: selectedState.statusLabel,
    severity: selectedState.severity,
    count: selectedState.count,
    reason: selectedState.reason,
    message: selectedState.message,
    action: selectedState.action,
    findings: selectedState.findings.map(cloneFindingTemplate),
  };
}

export function createDemoIngredientsText(
  productType: DemoIngredientProductType,
  state: DemoTemplateState,
) {
  const variants = demoIngredientPresets[productType][state];
  const selectedVariant =
    variants[Math.floor(Math.random() * variants.length)] ?? variants[0] ?? [];

  return selectedVariant.join(", ");
}

export function getSuggestedDemoProductSetup(state: DemoTemplateState) {
  const severity = stateToSeverity[state];

  if (state === "good") {
    return {
      ingredientScore: 91,
      productQuality: "Excellent" as const,
      verdictSeverity: severity,
      finalHeadline: "Clean demo product",
      finalSummary:
        "This demo product is set up to show a cleaner ingredient profile with fewer warning categories.",
    };
  }

  if (state === "very_bad") {
    return {
      ingredientScore: 18,
      productQuality: "Poor" as const,
      verdictSeverity: severity,
      finalHeadline: "High-warning demo product",
      finalSummary:
        "This demo product is set up to show a serious result with multiple warnings brought forward.",
    };
  }

  return {
    ingredientScore: 54,
    productQuality: "Poor" as const,
    verdictSeverity: severity,
    finalHeadline: "Review this demo product",
    finalSummary:
      "This demo product is set up to show a product with several concerns worth reviewing.",
  };
}
