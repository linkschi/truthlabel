function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function capitalizeFirstLetter(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function stripIngredientPrefix(value: string) {
  return value.replace(/^\s*ingredients?\s*[:\-]\s*/i, "");
}

const inlineAllergenPatterns = [
  /\bcontains\s*:/i,
  /\bmay contain\s*:/i,
  /\ballergen(?:\s+statement|\s+information|\s+advice)?\s*:/i,
] as const;

function splitInlineAllergenSection(value: string) {
  const firstMatch = inlineAllergenPatterns
    .map((pattern) => ({
      index: value.search(pattern),
    }))
    .filter((match) => match.index >= 0)
    .sort((left, right) => left.index - right.index)[0];

  if (!firstMatch) {
    return {
      ingredientSection: value,
      allergenSection: "",
    };
  }

  return {
    ingredientSection: value.slice(0, firstMatch.index),
    allergenSection: value.slice(firstMatch.index).trim(),
  };
}

function normalizeIngredientSection(value: string) {
  return collapseWhitespace(
    stripIngredientPrefix(value)
      .replace(/[\r\n]+/g, ", ")
      .replace(/[([{]/g, ", ")
      .replace(/[)\]}]/g, ", ")
      .replace(/;/g, ", ")
      .replace(/\.(?=\s*$)/g, "")
      .replace(/\s*,\s*/g, ", ")
      .replace(/,+/g, ","),
  );
}

function cleanIngredientToken(value: string) {
  const normalized = collapseWhitespace(
    value.replace(/^[\s\-:.,;]+/, "").replace(/[\s\-:.,;]+$/g, ""),
  );

  if (!normalized) {
    return "";
  }

  if (/^(contains|may contain|allergen information|allergy advice)\b/i.test(normalized)) {
    return "";
  }

  return capitalizeFirstLetter(normalized);
}

export function extractInlineAllergenStatement(input: string) {
  const { allergenSection } = splitInlineAllergenSection(input.trim());
  const cleaned = collapseWhitespace(allergenSection.replace(/\.(?=\s*$)/g, ""));

  return cleaned || undefined;
}

export function parseIngredientInput(input: string) {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return [];
  }

  const { ingredientSection } = splitInlineAllergenSection(trimmedInput);
  const normalizedIngredientSection = normalizeIngredientSection(ingredientSection);

  if (!normalizedIngredientSection) {
    return [];
  }

  const seen = new Set<string>();

  return normalizedIngredientSection
    .split(",")
    .map(cleanIngredientToken)
    .filter(Boolean)
    .filter((entry) => {
      const normalizedEntry = entry.toLowerCase();
      if (seen.has(normalizedEntry)) {
        return false;
      }

      seen.add(normalizedEntry);
      return true;
    });
}
