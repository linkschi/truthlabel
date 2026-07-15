import { allergyRiskDataPack } from "@/data/ingredientIntelligence/allergyRisk";
import type { AllergyConcern } from "@/data/fakeProduct";

function normalizeAlias(value: string) {
  return value.trim().toLowerCase();
}

function uniqueAliases(values: string[]) {
  return [...new Set(values.map(normalizeAlias).filter(Boolean))];
}

const allergyRiskItemsById = Object.fromEntries(
  allergyRiskDataPack.items.map((item) => [item.id, item]),
);

function collectAliases(
  itemIds: string[],
  options: {
    include?: string[];
    exclude?: string[];
  } = {},
) {
  const exclude = new Set((options.exclude ?? []).map(normalizeAlias));
  const values = itemIds.flatMap((itemId) => {
    const item = allergyRiskItemsById[itemId];

    if (!item) {
      return [];
    }

    return [
      ...item.otherNames,
      ...item.chemicalNames,
      ...item.abbreviations,
      ...item.regionalNames,
    ];
  });

  return uniqueAliases([...(options.include ?? []), ...values]).filter(
    (value) => !exclude.has(value),
  );
}

// This remains the current runtime profile alias map used by the app's saved
// allergy-profile matching. It is intentionally narrower than the full
// Allergy Risk data pack to avoid obvious false positives until richer
// context-aware label parsing is added.
export const allergenAliases: Record<AllergyConcern, string[]> = {
  Milk: collectAliases(["milk_dairy"], {
    exclude: [
      "dairy",
      "dairy milk",
      "cream",
      "butter",
      "butterfat",
      "butter oil",
      "ghee",
      "cheese",
      "yogurt",
      "yoghurt",
      "kefir",
    ],
  }),
  Egg: collectAliases(["egg"], {
    exclude: ["mayonnaise", "meringue"],
  }),
  Peanuts: collectAliases(["peanut"]),
  "Tree nuts": collectAliases(["tree_nuts"], {
    include: ["tree nut", "tree nuts"],
    exclude: ["nut flour", "nut paste", "nut butter", "nut oil"],
  }),
  "Wheat / gluten": collectAliases(["wheat_gluten_cereals"], {
    exclude: ["oats", "oat flour"],
  }),
  Soy: collectAliases(["soy_soya"]),
  Fish: collectAliases(["fish"], {
    exclude: ["worcestershire sauce"],
  }),
  Shellfish: collectAliases(["crustacean_shellfish", "molluscs"], {
    include: ["shellfish"],
  }),
  Sesame: collectAliases(["sesame"]),
  Mustard: collectAliases(["mustard"]),
  Celery: collectAliases(["celery"]),
  Lupin: collectAliases(["lupin"]),
  Molluscs: collectAliases(["molluscs"], {
    include: ["mollusc", "molluscs", "mollusk", "mollusks"],
  }),
  Sulphites: collectAliases(["sulphites_sulfites"], {
    include: ["sulphites", "sulfites"],
  }),
};
