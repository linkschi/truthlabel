import type { NormalizedIngredient, NormalizedNutrient, NormalizedProduct } from "@/types/product";

const OPEN_FOOD_FACTS_FIELDS = [
  "code",
  "product_name",
  "brands",
  "image_front_url",
  "image_url",
  "ingredients_text",
  "ingredients",
  "allergens",
  "allergens_tags",
  "traces",
  "traces_tags",
  "additives_tags",
  "nutriments",
  "nutrition_grades",
  "nova_group",
  "categories",
  "countries_tags",
  "labels_tags",
  "ingredients_analysis_tags",
] as const;

type BarcodeLookupErrorCode =
  | "validation"
  | "not-found"
  | "network"
  | "unknown";

export class BarcodeLookupError extends Error {
  code: BarcodeLookupErrorCode;

  constructor(code: BarcodeLookupErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "BarcodeLookupError";
  }
}

type OpenFoodFactsIngredient = {
  id?: string;
  text?: string;
};

type OpenFoodFactsNutriments = Record<string, unknown>;

type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  ingredients_text?: string;
  ingredients?: OpenFoodFactsIngredient[];
  allergens?: string;
  allergens_tags?: string[];
  additives_tags?: string[];
  nutriments?: OpenFoodFactsNutriments;
  nutrition_grades?: string;
  nova_group?: number | string;
};

type OpenFoodFactsResponse = {
  status?: number;
  code?: string;
  product?: OpenFoodFactsProduct;
  status_verbose?: string;
};

function stripLanguagePrefix(value: string) {
  return value.replace(/^[a-z]{2,3}:/i, "").trim();
}

function normalizeSpacing(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (/^e\d+[a-z]*$/i.test(word)) {
        return word.toUpperCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function cleanTagValue(value: string) {
  const stripped = stripLanguagePrefix(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return stripped ? titleCase(stripped) : "";
}

function cleanIngredientText(value: string) {
  return normalizeSpacing(
    value
      .replace(/[()[\]{}]/g, "")
      .replace(/\.$/, "")
      .replace(/;/g, ","),
  );
}

function normalizeIngredientEntry(entry: OpenFoodFactsIngredient): NormalizedIngredient | null {
  const canonicalName =
    typeof entry.id === "string" && entry.id.trim()
      ? cleanTagValue(entry.id)
      : "";
  const labelText =
    typeof entry.text === "string" && entry.text.trim()
      ? cleanIngredientText(entry.text)
      : "";
  const name = canonicalName || labelText;

  if (!name) {
    return null;
  }

  return {
    name,
    text: labelText || undefined,
    source: "openfoodfacts",
  };
}

function isNormalizedIngredient(
  ingredient: NormalizedIngredient | null,
): ingredient is NormalizedIngredient {
  return ingredient !== null;
}

function parseIngredientsText(ingredientsText?: string) {
  if (!ingredientsText) {
    return [];
  }

  return ingredientsText
    .split(",")
    .map((entry) => cleanIngredientText(entry))
    .filter(Boolean)
    .map<NormalizedIngredient>((name) => ({
      name,
      text: name,
      source: "openfoodfacts",
    }));
}

function normalizeTagList(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map(cleanTagValue)
    .filter(Boolean);
}

function normalizeAllergens(allergenTags: unknown, allergensText: unknown) {
  const tagValues = normalizeTagList(allergenTags);

  if (tagValues.length > 0) {
    return Array.from(new Set(tagValues));
  }

  if (typeof allergensText !== "string" || !allergensText.trim()) {
    return [];
  }

  return Array.from(
    new Set(
      allergensText
        .split(/[,:;]/)
        .map((entry) => cleanTagValue(entry))
        .filter(Boolean),
    ),
  );
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function readString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function pushNutrient(
  items: NormalizedNutrient[],
  seenNames: Set<string>,
  nutrient: NormalizedNutrient,
) {
  if (!nutrient.name || seenNames.has(nutrient.name)) {
    return;
  }

  seenNames.add(nutrient.name);
  items.push(nutrient);
}

function normalizeNutrients(nutriments: OpenFoodFactsNutriments | undefined) {
  if (!nutriments) {
    return [];
  }

  const items: NormalizedNutrient[] = [];
  const seenNames = new Set<string>();

  const sugarValue =
    readNumber(nutriments["sugars_100g"]) ??
    readNumber(nutriments.sugars) ??
    readNumber(nutriments["sugars_value"]);
  if (sugarValue !== undefined) {
    pushNutrient(items, seenNames, {
      name: "Sugar",
      value: sugarValue,
      unit: readString(nutriments["sugars_unit"]) ?? "g",
      per: "100g",
    });
  }

  const saltValue =
    readNumber(nutriments["salt_100g"]) ??
    readNumber(nutriments.salt) ??
    readNumber(nutriments["salt_value"]);
  const sodiumValue =
    readNumber(nutriments["sodium_100g"]) ??
    readNumber(nutriments.sodium) ??
    readNumber(nutriments["sodium_value"]);
  if (saltValue !== undefined) {
    pushNutrient(items, seenNames, {
      name: "Salt",
      value: saltValue,
      unit: readString(nutriments["salt_unit"]) ?? "g",
      per: "100g",
    });
  } else if (sodiumValue !== undefined) {
    pushNutrient(items, seenNames, {
      name: "Sodium",
      value: sodiumValue,
      unit: readString(nutriments["sodium_unit"]) ?? "g",
      per: "100g",
    });
  }

  const saturatedFatValue =
    readNumber(nutriments["saturated-fat_100g"]) ??
    readNumber(nutriments["saturated-fat"]) ??
    readNumber(nutriments["saturated-fat_value"]);
  if (saturatedFatValue !== undefined) {
    pushNutrient(items, seenNames, {
      name: "Saturated fat",
      value: saturatedFatValue,
      unit: readString(nutriments["saturated-fat_unit"]) ?? "g",
      per: "100g",
    });
  }

  const fatValue =
    readNumber(nutriments["fat_100g"]) ??
    readNumber(nutriments.fat) ??
    readNumber(nutriments["fat_value"]);
  if (fatValue !== undefined) {
    pushNutrient(items, seenNames, {
      name: "Fat",
      value: fatValue,
      unit: readString(nutriments["fat_unit"]) ?? "g",
      per: "100g",
    });
  }

  const proteinValue =
    readNumber(nutriments["proteins_100g"]) ??
    readNumber(nutriments.proteins) ??
    readNumber(nutriments["proteins_value"]);
  if (proteinValue !== undefined) {
    pushNutrient(items, seenNames, {
      name: "Protein",
      value: proteinValue,
      unit: readString(nutriments["proteins_unit"]) ?? "g",
      per: "100g",
    });
  }

  const fibreValue =
    readNumber(nutriments["fiber_100g"]) ??
    readNumber(nutriments.fiber) ??
    readNumber(nutriments["fiber_value"]) ??
    readNumber(nutriments["fibers_100g"]) ??
    readNumber(nutriments.fibers) ??
    readNumber(nutriments["fibers_value"]);
  if (fibreValue !== undefined) {
    pushNutrient(items, seenNames, {
      name: "Fibre",
      value: fibreValue,
      unit: readString(nutriments["fiber_unit"]) ?? readString(nutriments["fibers_unit"]) ?? "g",
      per: "100g",
    });
  }

  const caloriesValue =
    readNumber(nutriments["energy-kcal_100g"]) ??
    readNumber(nutriments["energy-kcal"]) ??
    readNumber(nutriments["energy-kcal_value"]);
  if (caloriesValue !== undefined) {
    pushNutrient(items, seenNames, {
      name: "Calories",
      value: caloriesValue,
      unit: readString(nutriments["energy-kcal_unit"]) ?? "kcal",
      per: "100g",
    });
  }

  return items;
}

function normalizeProduct(product: OpenFoodFactsProduct): NormalizedProduct {
  const ingredientEntries = Array.isArray(product.ingredients)
    ? product.ingredients.map(normalizeIngredientEntry).filter(isNormalizedIngredient)
    : [];
  const parsedIngredients =
    ingredientEntries.length > 0
      ? ingredientEntries
      : parseIngredientsText(product.ingredients_text);

  return {
    barcode: readString(product.code) ?? "Unknown barcode",
    name: readString(product.product_name) ?? "Unnamed product",
    brand: readString(product.brands),
    imageUrl: readString(product.image_front_url) ?? readString(product.image_url),
    ingredientsText: readString(product.ingredients_text),
    ingredients: parsedIngredients,
    nutrients: normalizeNutrients(product.nutriments),
    allergens: normalizeAllergens(product.allergens_tags, product.allergens),
    additives: normalizeTagList(product.additives_tags),
    novaGroup: readNumber(product.nova_group),
    nutritionGrade: readString(product.nutrition_grades)?.toUpperCase(),
    rawSource: "openfoodfacts",
  };
}

export async function fetchProductByBarcode(barcode: string) {
  const trimmedBarcode = barcode.trim();

  if (!trimmedBarcode) {
    throw new BarcodeLookupError("validation", "Enter a barcode to scan the label.");
  }

  if (!/^\d+$/.test(trimmedBarcode)) {
    throw new BarcodeLookupError("validation", "Use digits only for now.");
  }

  const url = `https://world.openfoodfacts.org/api/v2/product/${trimmedBarcode}.json?fields=${OPEN_FOOD_FACTS_FIELDS.join(",")}`;

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    throw new BarcodeLookupError("network", "Check your connection and try again.");
  }

  if (!response.ok) {
    throw new BarcodeLookupError("network", "Check your connection and try again.");
  }

  let payload: OpenFoodFactsResponse;

  try {
    payload = (await response.json()) as OpenFoodFactsResponse;
  } catch {
    throw new BarcodeLookupError("unknown", "We could not read the product data.");
  }

  if (payload.status !== 1 || !payload.product) {
    throw new BarcodeLookupError(
      "not-found",
      payload.status_verbose || "We couldn't find this barcode in the product database yet.",
    );
  }

  return normalizeProduct({
    ...payload.product,
    code: payload.product.code ?? payload.code ?? trimmedBarcode,
  });
}
