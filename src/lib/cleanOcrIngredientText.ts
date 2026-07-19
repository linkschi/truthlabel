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
  /^(?:ingredients?|ingredient list|ingredlent[s]?|ingredi[e3]nt[s]?|allergen(?: statement| information| advice)?|contains|may contain|trace allergens?)[:\s-]*$/i;

const nonIngredientHeadingPattern =
  /^(?:nutrition(?: facts?| information)?|serving size|per\s*\d+\s*(?:g|ml)|energy|calories|storage|directions|instructions|best before|manufactured by|distributed by|keep refrigerated|net weight|warning|caution|barcode|recycling|customer care)[:\s-]*$/i;

const ingredientHeadingPattern =
  /\b(?:ingredients?|ingredient list|ingredlent[s]?|ingredi[e3]nt[s]?|ingre(?:d|cl|ol)ients?|lngredients?)\b/i;

const sectionStopPattern =
  /\b(?:nutrition(?: facts?| information)?|typical values|serving size|per\s*\d+\s*(?:g|ml)|energy|calories|kcal|kilojoules?|kj|storage|directions|instructions|best before|expiry|manufactured by|distributed by|packed by|customer care|www\.|barcode|net weight|recycling)\b/i;

const nutritionLinePattern =
  /\b(?:energy|calories|kcal|kj|protein|carbohydrate|sugars?|total fat|saturated fat|saturates?|trans fat|fibre|fiber|sodium|daily value|serving|per\s*\d+\s*(?:g|ml))\b/i;

const ingredientCuePattern =
  /\b(?:water|sugar|salt|flour|oil|milk|wheat|oats?|rice|starch|syrup|cocoa|cacao|yeast|spice|spices|flavou?r|colou?r|acid|sodium|potassium|calcium|lecithin|preservative|emulsifier|stabili[sz]er|thickener|gum|extract|contains)\b/i;

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
    .replace(/\r\n?/g, "\n")
    .replace(/\bINGREDIENT[5S]\b/gi, "INGREDIENTS")
    .replace(/\bINGREDI[E3]NTS\b/gi, "INGREDIENTS")
    .replace(
      /[.;]\s*(?=(?:contains|may contain|allergen(?: statement| information| advice)?)\s*:)/gi,
      "\n",
    )
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

function stripIngredientHeading(value: string) {
  return value.replace(
    /^.*?\b(?:ingredients?|ingredient list|ingredlent[s]?|ingredi[e3]nt[s]?|ingre(?:d|cl|ol)ients?|lngredients?)\b\s*[:.-]?\s*/i,
    "",
  );
}

function hasTooManyDigits(value: string) {
  const letters = value.match(/[a-z]/gi)?.length ?? 0;
  const digits = value.match(/\d/g)?.length ?? 0;

  return digits > 5 && digits / Math.max(1, letters + digits) > 0.35;
}

function isNutritionLikeLine(value: string) {
  if (nonIngredientHeadingPattern.test(value)) {
    return true;
  }

  return nutritionLinePattern.test(value) && /(?:\d|%|per\b|serving\b)/i.test(value);
}

function isPackagingOrContactLine(value: string) {
  return (
    sectionStopPattern.test(value) ||
    /\b(?:tel|phone|email|website|www|http|consumer|customer|recycle|recyclable|dispose|batch|lot no|date code)\b/i.test(
      value,
    )
  );
}

function isMostlySymbols(value: string) {
  const letters = value.match(/[a-z]/gi)?.length ?? 0;
  const usefulSeparators = value.match(/[,;:()/%&+-]/g)?.length ?? 0;
  const otherSymbols = value.match(/[^a-z0-9\s,;:()/%&+'.#-]/gi)?.length ?? 0;

  return letters < 4 && otherSymbols > usefulSeparators;
}

function isLikelyIngredientLine(value: string, hasIngredientContext: boolean) {
  const cleaned = stripOuterPunctuation(value);

  if (!cleaned || isNutritionLikeLine(cleaned) || isPackagingOrContactLine(cleaned)) {
    return false;
  }

  if (hasTooManyDigits(cleaned) || isMostlySymbols(cleaned)) {
    return false;
  }

  if (hasIngredientContext) {
    return /[a-z]/i.test(cleaned);
  }

  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  const separatorCount = (cleaned.match(/[,;]/g) ?? []).length;

  return (
    ingredientCuePattern.test(cleaned) ||
    separatorCount >= 1 ||
    (wordCount >= 2 && wordCount <= 18 && !hasTooManyDigits(cleaned))
  );
}

function splitIngredientAndAllergenText(value: string) {
  const match = value.match(
    /\b(?:contains|may contain|allergen(?: statement| information| advice)?)\s*:/i,
  );

  if (!match?.index || match.index <= 0) {
    return {
      ingredientPart: value,
      allergenPart: "",
    };
  }

  return {
    ingredientPart: value.slice(0, match.index),
    allergenPart: value.slice(match.index),
  };
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
  let insideIngredientSection = false;
  let foundIngredientHeading = false;
  let stoppedIngredientSection = false;

  lines.forEach((line) => {
    if (headingOnlyPattern.test(line)) {
      if (ingredientHeadingPattern.test(line)) {
        insideIngredientSection = true;
        foundIngredientHeading = true;
      }
      return;
    }

    if (insideIngredientSection && sectionStopPattern.test(line)) {
      insideIngredientSection = false;
      stoppedIngredientSection = true;
      return;
    }

    if (!insideIngredientSection && foundIngredientHeading && stoppedIngredientSection) {
      return;
    }

    const hasIngredientHeading = ingredientHeadingPattern.test(line);
    const lineWithoutHeading = hasIngredientHeading ? stripIngredientHeading(line) : line;
    const splitLine = splitIngredientAndAllergenText(lineWithoutHeading);

    if (hasIngredientHeading) {
      insideIngredientSection = true;
      foundIngredientHeading = true;
    }

    if (splitLine.allergenPart || allergenLinePattern.test(line)) {
      const cleanedAllergenLine = cleanAllergenLine(splitLine.allergenPart || line);
      if (cleanedAllergenLine) {
        allergenLines.push(cleanedAllergenLine);
      }

      if (!splitLine.allergenPart && !hasIngredientHeading) {
        return;
      }
    }

    const candidateLine = splitLine.ingredientPart.trim();
    if (
      !candidateLine ||
      !isLikelyIngredientLine(candidateLine, insideIngredientSection || foundIngredientHeading)
    ) {
      return;
    }

    const cleanedIngredientLine = cleanIngredientLine(candidateLine);
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
