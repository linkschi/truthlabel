import type { IngredientKey } from "@/data/fakeProduct";

export type RestrictedIngredient = {
  name: string;
  aliases: string[];
  regionNote: string;
  whyFlagged: string;
  whatToDo: string;
};

export const bannedRestricted: Partial<Record<IngredientKey, RestrictedIngredient>> = {
  "red-no-3": {
    name: "Red No. 3",
    aliases: ["red no. 3", "erythrosine", "e127"],
    regionNote: "Banned or restricted in some regions.",
    whyFlagged:
      "This synthetic dye is under stronger scrutiny than routine colour additives.",
    whatToDo:
      "Treat it as a serious watch item and double-check whether it fits your comfort level.",
  },
};
