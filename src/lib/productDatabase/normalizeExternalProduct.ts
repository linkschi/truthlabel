import type {
  ExternalProductLookupResult,
  NormalizedProductForScan,
} from "@/lib/productDatabase/productDatabaseTypes";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/^[a-z]{2,3}:/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAnyTerm(text: string, terms: string[]) {
  return terms.some((term) => ` ${text} `.includes(` ${normalizeText(term)} `));
}

function uniqueStrings(values: Array<string | undefined>) {
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

function splitIngredientText(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const drinkTerms = [
  "beverages",
  "beverage",
  "drink",
  "drinks",
  "soda",
  "colas",
  "juice",
  "juices",
  "smoothie",
  "tea",
  "coffee",
  "water",
  "milk drink",
];

const babyTerms = [
  "baby foods",
  "baby food",
  "infant foods",
  "infant food",
  "toddler",
  "kids food",
  "children",
  "baby cereal",
];

const meatTerms = [
  "meat",
  "poultry",
  "sausage",
  "sausages",
  "burger",
  "burgers",
  "nugget",
  "nuggets",
  "ham",
  "bacon",
  "deli meat",
  "chicken",
  "beef",
  "pork",
  "turkey",
  "fast food",
];

const seafoodTerms = [
  "seafood",
  "fish",
  "shellfish",
  "salmon",
  "tuna",
  "shrimp",
  "prawn",
  "lobster",
  "crab",
];

const dairyEggTerms = [
  "dairy",
  "milk",
  "cheese",
  "yogurt",
  "yoghurt",
  "cream",
  "butter",
  "egg",
  "eggs",
  "custard",
];

const freshSimpleTerms = [
  "oats",
  "rice",
  "beans",
  "lentils",
  "fruit",
  "fruits",
  "vegetable",
  "vegetables",
  "apple",
  "banana",
  "carrot",
  "broccoli",
  "simple foods",
  "simple food",
];

const packagedTerms = [
  "snack",
  "snacks",
  "biscuits",
  "cookies",
  "candy",
  "confectionery",
  "cereal bar",
  "breakfast cereal",
  "breakfast cereals",
  "chocolate spread",
  "spreads",
  "sauce",
  "sauces",
  "frozen meal",
  "frozen meals",
  "dessert",
  "desserts",
  "chips",
  "crisps",
  "bars",
];

export function mapExternalProductCategory(result: ExternalProductLookupResult) {
  const searchableText = normalizeText(
    [
      result.productCategory,
      ...(result.rawCategories ?? []),
      result.productName,
      ...(result.ingredients ?? []),
    ]
      .filter(Boolean)
      .join(", "),
  );

  if (containsAnyTerm(searchableText, babyTerms)) {
    return "Baby / Kids Food";
  }

  if (containsAnyTerm(searchableText, seafoodTerms)) {
    return "Seafood";
  }

  if (containsAnyTerm(searchableText, meatTerms)) {
    return "Meat / Fast Food";
  }

  if (containsAnyTerm(searchableText, drinkTerms)) {
    return "Drinks / Beverages";
  }

  if (containsAnyTerm(searchableText, dairyEggTerms)) {
    return "Dairy / Egg Products";
  }

  if (containsAnyTerm(searchableText, freshSimpleTerms)) {
    return "Fresh / Simple Foods";
  }

  if (containsAnyTerm(searchableText, packagedTerms)) {
    return "Packaged / Processed Foods";
  }

  return "General / Unknown";
}

function buildAllergenStatement(result: ExternalProductLookupResult) {
  if (result.allergenStatement?.trim()) {
    return result.allergenStatement.trim();
  }

  const allergens = uniqueStrings(result.rawAllergens ?? []);
  const traces = uniqueStrings(result.rawTraces ?? []);
  const parts: string[] = [];

  if (allergens.length > 0) {
    parts.push(`Contains: ${allergens.join(", ")}`);
  }

  if (traces.length > 0) {
    parts.push(`May contain: ${traces.join(", ")}`);
  }

  return parts.join(". ");
}

export function normalizeExternalProduct(
  result: ExternalProductLookupResult,
): NormalizedProductForScan {
  const warnings = new Set<string>(result.dataQualityWarnings);
  const ingredientsFromList = uniqueStrings(result.ingredients ?? []);
  const ingredientText =
    result.ingredientsText?.trim() ||
    ingredientsFromList.join(", ");
  const ingredients = ingredientText
    ? splitIngredientText(ingredientText)
    : ingredientsFromList;
  const productName = result.productName?.trim() || "Unknown product";
  const brandName = result.brandName?.trim() || "Unknown brand";
  const productCategory = mapExternalProductCategory(result);
  const allergenStatement = buildAllergenStatement(result);
  const packagingText = result.packagingText?.trim() || "";

  warnings.add(
    "Product database data may be incomplete or user-submitted. Check the product label if something looks missing.",
  );

  if (!result.productName?.trim()) {
    warnings.add("Product name was missing from the product database.");
  }

  if (!result.brandName?.trim()) {
    warnings.add("Brand data was missing from the product database.");
  }

  if (productCategory === "General / Unknown") {
    warnings.add("Product category was missing or unclear in the product database.");
  }

  if (!result.ingredientsText?.trim() && ingredients.length > 0) {
    warnings.add(
      "Ingredient text was missing, so Truthlabel used the available ingredient name list instead.",
    );
  }

  if (!ingredientText.trim()) {
    warnings.add("Product found, but ingredient text was missing.");
  }

  if (!allergenStatement.trim()) {
    warnings.add(
      "Allergen data was missing or incomplete from the product database.",
    );
  }

  if (!packagingText.trim()) {
    warnings.add(
      "Packaging data was missing, so microplastic review may be limited.",
    );
  }

  if (!result.raw || typeof result.raw !== "object") {
    warnings.add("External product data may be incomplete.");
  }

  return {
    productName,
    brandName,
    barcode: result.barcode.trim(),
    productCategory,
    ingredientText,
    ingredients,
    allergenStatement,
    packagingText,
    imageUrl: result.imageUrl?.trim() || undefined,
    scanSource: "barcode",
    externalSignals: result.externalSignals ?? [],
    dataQualityWarnings: [...warnings],
  };
}
