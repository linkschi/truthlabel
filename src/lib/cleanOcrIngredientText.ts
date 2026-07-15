export type CleanOcrIngredientTextResult = {
  ingredientText: string;
  possibleAllergenStatement: string;
  confidenceWarnings: string[];
};

type CleanOcrIngredientTextOptions = {
  averageConfidence?: number | null;
};

const allergenLinePattern =
  /\b(?:contains|may contain|allergen(?: statement| information| advice)?|made in a facility|processed on shared equipment|shared equipment)\b/i;

const headingOnlyPattern =
  /^(?:ingredients?|ingredient list|allergen(?: statement| information| advice)?|contains|may contain|trace allergens?)[:\s-]*$/i;

const nonIngredientHeadingPattern =
  /^(?:nutrition(?: facts?)?|serving size|per\s*\d+\s*(?:g|ml)|energy|calories|storage|directions|instructions|best before|manufactured by|distributed by|keep refrigerated|net weight|warning|caution)[:\s-]*$/i;

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

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripOuterPunctuation(value: string) {
  return value.replace(/^[\s,.;:|-]+/, "").replace(/[\s,.;:|-]+$/g, "");
}

function dedupeObviousRepeats(value: string) {
  return value.replace(/\b([a-z]{3,})\s+\1\b/gi, "$1");
}

function looksMostlyUppercase(value: string) {
  const letters = value.match(/[a-z]/gi) ?? [];

  if (letters.length < 10) {
    return false;
  }

  const uppercaseCount = letters.filter(
    (letter) => letter === letter.toUpperCase(),
  ).length;
  return uppercaseCount / letters.length >= 0.72;
}

function softenExcessiveUppercase(value: string) {
  if (!looksMostlyUppercase(value)) {
    return value;
  }

  const lowered = value.toLowerCase();
  return lowered.charAt(0).toUpperCase() + lowered.slice(1);
}

function normalizeRawText(value: string) {
  return value
    .replace(/\r/g, "\n")
    .replace(/[|]/g, " ")
    .replace(/[\u2022\u00b7\u25cf\u25aa\u25e6]/g, "\n")
    .replace(/[;\u2022]/g, ",")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function cleanIngredientLine(value: string) {
  return collapseWhitespace(
    stripOuterPunctuation(
      dedupeObviousRepeats(
        value
          .replace(/^ingredients?(?: list)?\s*[:.-]?\s*/i, "")
          .replace(/^ingredient list\s*[:.-]?\s*/i, "")
          .replace(/\s*,\s*/g, ", ")
          .replace(/\s*\.\s*$/g, "")
          .replace(/\s{2,}/g, " "),
      ),
    ),
  );
}

function cleanAllergenLine(value: string) {
  return collapseWhitespace(
    stripOuterPunctuation(
      value
        .replace(/\s*\.\s*$/g, "")
        .replace(/\s*,\s*/g, ", ")
        .replace(/\s{2,}/g, " "),
    ),
  );
}

function buildIngredientText(lines: string[]) {
  const joined = lines.join(", ");

  return collapseWhitespace(
    stripOuterPunctuation(
      dedupeObviousRepeats(
        softenExcessiveUppercase(
          joined
            .replace(/\s*,\s*,+/g, ", ")
            .replace(/,+/g, ",")
            .replace(/\s*,\s*/g, ", ")
            .replace(/\s*\.\s*$/g, ""),
        ),
      ),
    ),
  );
}

export function cleanOcrIngredientText(
  rawText: string,
  options?: CleanOcrIngredientTextOptions,
): CleanOcrIngredientTextResult {
  const normalized = normalizeRawText(rawText);
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const ingredientLines: string[] = [];
  const allergenLines: string[] = [];

  lines.forEach((line) => {
    if (headingOnlyPattern.test(line)) {
      return;
    }

    if (nonIngredientHeadingPattern.test(line)) {
      return;
    }

    if (allergenLinePattern.test(line)) {
      const cleanedAllergenLine = cleanAllergenLine(line);
      if (cleanedAllergenLine) {
        allergenLines.push(cleanedAllergenLine);
      }

      return;
    }

    const cleanedIngredientLine = cleanIngredientLine(line);
    if (cleanedIngredientLine) {
      ingredientLines.push(cleanedIngredientLine);
    }
  });

  const ingredientText = buildIngredientText(ingredientLines);
  const possibleAllergenStatement = cleanAllergenLine(allergenLines.join(" "));
  const confidenceWarnings = uniqueStrings([
    "OCR may have misread some words. Please review before scanning.",
    possibleAllergenStatement
      ? "Allergen statements may need manual checking."
      : null,
    options?.averageConfidence !== null &&
    options?.averageConfidence !== undefined &&
    options.averageConfidence < 70
      ? "OCR confidence was low, so some ingredient warnings may be incomplete."
      : null,
    ingredientText && ingredientText.split(",").length < 2
      ? "Ingredient text was extracted from an image and may be incomplete."
      : null,
  ]);

  return {
    ingredientText,
    possibleAllergenStatement,
    confidenceWarnings,
  };
}
