import type { ConcernLevel, IngredientKey } from "@/data/fakeProduct";

export type IngredientDefinition = {
  key: IngredientKey;
  name: string;
  aliases: string[];
  category: string;
  shortDefinition: string;
  usedFor: string;
  defaultColor: ConcernLevel;
  warningTriggers: string[];
  warningText: string;
  summaryLabel: string;
  whatToDo: string;
};

export const ingredientDefinitions: Record<IngredientKey, IngredientDefinition> = {
  sugar: {
    key: "sugar",
    name: "Sugar",
    aliases: ["sugar", "cane sugar"],
    category: "Sweetener",
    shortDefinition: "A simple sweetener added for taste and quick energy.",
    usedFor: "Boosts sweetness, texture, and shelf appeal in snack bars.",
    defaultColor: "yellow",
    warningTriggers: ["high-sugar-watch"],
    warningText: "Added sugar can stack up fast when a product already tests high in sugar.",
    summaryLabel: "Added sugar",
    whatToDo: "Compare with lower-sugar options or keep the serving size in check.",
  },
  "wheat-flour": {
    key: "wheat-flour",
    name: "Wheat flour",
    aliases: ["wheat flour", "enriched flour"],
    category: "Base grain",
    shortDefinition: "A common flour milled from wheat.",
    usedFor: "Provides structure and chew so the bar holds together.",
    defaultColor: "green",
    warningTriggers: ["gluten-match"],
    warningText: "Only becomes a serious issue when it matches a wheat or gluten concern.",
    summaryLabel: "Refined flour base",
    whatToDo: "If you avoid gluten, confirm the ingredient and any cross-contact notes.",
  },
  "milk-powder": {
    key: "milk-powder",
    name: "Milk powder",
    aliases: ["milk powder", "dry milk", "skim milk powder"],
    category: "Dairy",
    shortDefinition: "Dehydrated milk solids used in packaged foods.",
    usedFor: "Adds dairy flavour, creaminess, and helps bind the bar.",
    defaultColor: "yellow",
    warningTriggers: ["allergy-match"],
    warningText: "This becomes a red alert if the user is watching for milk.",
    summaryLabel: "Milk powder",
    whatToDo: "Avoid this product if you are allergic to milk.",
  },
  "soy-lecithin": {
    key: "soy-lecithin",
    name: "Soy lecithin",
    aliases: ["soy lecithin", "soya lecithin"],
    category: "Emulsifier",
    shortDefinition: "An emulsifier derived from soy that helps ingredients mix smoothly.",
    usedFor: "Prevents separation and improves texture in coated or sticky bars.",
    defaultColor: "yellow",
    warningTriggers: ["soy-match"],
    warningText: "It matters more if the user avoids soy or wants fewer highly processed extras.",
    summaryLabel: "Soy emulsifier",
    whatToDo: "Review it closely if soy is on your saved avoid list.",
  },
  "red-no-3": {
    key: "red-no-3",
    name: "Red No. 3",
    aliases: ["red no. 3", "erythrosine"],
    category: "Artificial colour",
    shortDefinition: "A synthetic red dye used to make processed foods look brighter.",
    usedFor: "Adds a vivid candy-like colour that stands out on shelves.",
    defaultColor: "red",
    warningTriggers: ["regulatory-watch", "artificial-colour-watch"],
    warningText: "This is a flagged ingredient because it is banned or restricted in some regions.",
    summaryLabel: "Flagged synthetic colour",
    whatToDo: "Treat it as a serious warning item and review whether you want it in the product.",
  },
  "natural-flavouring": {
    key: "natural-flavouring",
    name: "Natural flavouring",
    aliases: ["natural flavouring", "natural flavor"],
    category: "Flavour",
    shortDefinition: "A broad label for flavor compounds sourced from natural materials.",
    usedFor: "Rounds out taste without naming every single flavour component.",
    defaultColor: "green",
    warningTriggers: ["general-review"],
    warningText: "It usually stays low concern unless more context suggests otherwise.",
    summaryLabel: "Flavour support",
    whatToDo: "Keep it in context with the full ingredient list instead of treating it alone as a red flag.",
  },
};
