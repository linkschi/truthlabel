export const warningTemplates = {
  immediate: {
    allergy: {
      title: "Allergy risk",
      action: "Do not consume it if you are allergic to the flagged ingredient.",
    },
    regulatory: {
      title: "Banned/restricted item",
      action: "Review the highlighted ingredient before buying or eating.",
    },
    highSugar: {
      title: "Too much sugar",
      action: "This is not a clean pass. Review it before buying or eating.",
    },
  },
  checklist: {
    allergyMatch: {
      yes: "An ingredient matched your saved allergy.",
      no: "No saved allergy was matched in this product.",
    },
    highContentConcern: {
      yes: "A nutrient crosses into the serious red range.",
      no: "No nutrient crossed into the serious red range.",
    },
    restrictedIngredient: {
      yes: "A banned or restricted item was found.",
      no: "No banned or restricted watch ingredient was found.",
    },
    highRiskIngredients: {
      yes: "Several ingredients are worth questioning.",
      no: "The ingredient list is mostly calm in this sample.",
    },
    nutritionConcern: {
      yes: "The nutrition panel triggered warning signs.",
      no: "The nutrition panel stays in the calm range.",
    },
  },
  summary: {
    low: "Based on available label data, this product looks low concern.",
    medium:
      "Based on available label data, this product has a few review items worth checking.",
    high: "Based on available label data, this product has multiple concerns.",
    strong:
      "Based on available label data, this product stacks several serious warnings together.",
  },
} as const;
