import type {
  IngredientClassification,
  IngredientGroup,
  IngredientRecord,
} from "@/types/exposure";

function emptyGroups(): Record<IngredientGroup, IngredientRecord[]> {
  return {
    natural_positive: [],
    processed_artificial: [],
    unknown_review: [],
  };
}

function getPercent(count: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

export function classifyIngredients(
  ingredients: IngredientRecord[],
): IngredientClassification {
  const groups = emptyGroups();
  let naturalCount = 0;
  let processedCount = 0;
  let unknownCount = 0;
  let redCount = 0;
  let yellowCount = 0;

  ingredients.forEach((ingredient) => {
    groups[ingredient.group].push(ingredient);

    if (ingredient.group === "natural_positive") {
      naturalCount += 1;
    } else if (ingredient.group === "processed_artificial") {
      processedCount += 1;
    } else {
      unknownCount += 1;
    }

    if (ingredient.severity === "red") {
      redCount += 1;
    } else if (ingredient.severity === "yellow") {
      yellowCount += 1;
    }
  });

  const totalCount = ingredients.length;
  const naturalPercent = getPercent(naturalCount, totalCount);
  const processedPercent = getPercent(processedCount + unknownCount, totalCount);

  return {
    groups,
    totalCount,
    naturalCount,
    processedCount,
    unknownCount,
    redCount,
    yellowCount,
    naturalPercent,
    processedPercent,
  };
}
