function uniqueStrings(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

const savedAllergyDisplayMap: Record<string, string> = {
  milk: "Milk",
  egg: "Egg",
  peanut: "Peanut",
  peanuts: "Peanut",
  "tree nuts": "Tree nuts",
  wheat: "Wheat / gluten",
  gluten: "Wheat / gluten",
  soy: "Soy",
  fish: "Fish",
  "crustacean shellfish": "Crustacean shellfish",
  shellfish: "Crustacean shellfish",
  sesame: "Sesame",
  mustard: "Mustard",
  celery: "Celery",
  lupin: "Lupin",
  molluscs: "Molluscs",
  sulfites: "Sulphites",
  sulphites: "Sulphites",
};

export function splitSavedAllergyProfile(savedAllergies: string[]) {
  const selectedAllergies = new Set<string>();
  const customAllergies: string[] = [];

  savedAllergies.forEach((entry) => {
    const trimmed = entry.trim();
    if (!trimmed) {
      return;
    }

    const mappedLabel = savedAllergyDisplayMap[trimmed.toLowerCase()];
    if (mappedLabel) {
      selectedAllergies.add(mappedLabel);
      return;
    }

    customAllergies.push(trimmed);
  });

  return {
    selectedAllergies: [...selectedAllergies],
    customAllergiesText: uniqueStrings(customAllergies).join(", "),
  };
}

export function toggleManualScanSelection(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

export function getNextSelectedAllergiesOverride(
  currentOverride: string[] | null,
  visibleSelectedAllergies: string[],
  value: string,
) {
  return toggleManualScanSelection(
    currentOverride ?? visibleSelectedAllergies,
    value,
  );
}
