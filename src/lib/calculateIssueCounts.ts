import type {
  ExposureCheckId,
  IngredientRecord,
  IssueCounts,
} from "@/types/exposure";

type IssueCountEntry = {
  counts: IssueCounts;
  ingredientIds: {
    red: Set<string>;
    yellow: Set<string>;
  };
};

export type CalculatedIssueCounts = {
  byCheck: Partial<Record<ExposureCheckId, IssueCounts>>;
  ingredientIdsByCheck: Partial<
    Record<
      ExposureCheckId,
      {
        red: string[];
        yellow: string[];
      }
    >
  >;
  uniqueRedCauseIds: string[];
  uniqueYellowCauseIds: string[];
};

function getEntry(
  table: Map<ExposureCheckId, IssueCountEntry>,
  id: ExposureCheckId,
) {
  const existing = table.get(id);
  if (existing) {
    return existing;
  }

  const created: IssueCountEntry = {
    counts: { red: 0, yellow: 0 },
    ingredientIds: {
      red: new Set<string>(),
      yellow: new Set<string>(),
    },
  };
  table.set(id, created);
  return created;
}

export function calculateIssueCounts(
  ingredients: IngredientRecord[],
): CalculatedIssueCounts {
  const table = new Map<ExposureCheckId, IssueCountEntry>();
  const uniqueRedCauseIds = new Set<string>();
  const uniqueYellowCauseIds = new Set<string>();

  ingredients.forEach((ingredient) => {
    if (ingredient.severity === "red") {
      uniqueRedCauseIds.add(ingredient.id);
    } else if (ingredient.severity === "yellow") {
      uniqueYellowCauseIds.add(ingredient.id);
    }

    if (ingredient.severity !== "red" && ingredient.severity !== "yellow") {
      return;
    }

    ingredient.issueTags.forEach((tag) => {
      const entry = getEntry(table, tag);

      if (ingredient.severity === "red") {
        entry.counts.red += 1;
        entry.ingredientIds.red.add(ingredient.id);
      } else {
        entry.counts.yellow += 1;
        entry.ingredientIds.yellow.add(ingredient.id);
      }
    });
  });

  const byCheck: Partial<Record<ExposureCheckId, IssueCounts>> = {};
  const ingredientIdsByCheck: Partial<
    Record<ExposureCheckId, { red: string[]; yellow: string[] }>
  > = {};

  table.forEach((entry, id) => {
    byCheck[id] = entry.counts;
    ingredientIdsByCheck[id] = {
      red: [...entry.ingredientIds.red],
      yellow: [...entry.ingredientIds.yellow],
    };
  });

  return {
    byCheck,
    ingredientIdsByCheck,
    uniqueRedCauseIds: [...uniqueRedCauseIds],
    uniqueYellowCauseIds: [...uniqueYellowCauseIds],
  };
}
