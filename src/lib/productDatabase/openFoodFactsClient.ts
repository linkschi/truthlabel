import type {
  ExternalProductLookupInput,
  ExternalProductLookupResult,
} from "@/lib/productDatabase/productDatabaseTypes";
import { publicAppConfig } from "@/lib/appConfig";

export const OPEN_FOOD_FACTS_FIELDS = [
  "code",
  "product_name",
  "product_name_en",
  "brands",
  "categories",
  "categories_tags",
  "ingredients_text",
  "ingredients_text_en",
  "ingredients",
  "allergens",
  "allergens_tags",
  "traces",
  "traces_tags",
  "packaging",
  "packaging_tags",
  "labels",
  "labels_tags",
  "image_front_url",
  "image_ingredients_url",
] as const;

const OPEN_FOOD_FACTS_TIMEOUT_MS = 20000;
const OPEN_FOOD_FACTS_CACHE_TTL_MS = 10 * 60 * 1000;
const PRODUCT_LOOKUP_PROXY_PATH = "/api/product-lookup";
const openFoodFactsCache = new Map<
  string,
  { expiresAt: number; result: ExternalProductLookupResult }
>();

type OpenFoodFactsIngredient = {
  id?: string;
  text?: string;
};

type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  categories?: string;
  categories_tags?: string[];
  ingredients_text?: string;
  ingredients_text_en?: string;
  ingredients?: OpenFoodFactsIngredient[];
  allergens?: string;
  allergens_tags?: string[];
  traces?: string;
  traces_tags?: string[];
  packaging?: string;
  packaging_tags?: string[];
  labels?: string;
  labels_tags?: string[];
  image_front_url?: string;
  image_ingredients_url?: string;
};

type OpenFoodFactsResponse = {
  code?: string;
  product?: OpenFoodFactsProduct;
  status?: number;
  status_verbose?: string;
};

export type ProductDatabaseLookupErrorCode = "network" | "timeout" | "unknown";

export class ProductDatabaseLookupError extends Error {
  code: ProductDatabaseLookupErrorCode;

  constructor(code: ProductDatabaseLookupErrorCode, message: string) {
    super(message);
    this.name = "ProductDatabaseLookupError";
    this.code = code;
  }
}

function isBrowserRuntime() {
  return typeof window !== "undefined";
}

export function buildOpenFoodFactsProductUrl(baseUrl: string, barcode: string) {
  return `${baseUrl}/product/${encodeURIComponent(barcode)}.json`;
}

function buildProductLookupProxyUrl(barcode: string) {
  const url = new URL(PRODUCT_LOOKUP_PROXY_PATH, window.location.origin);
  url.searchParams.set("barcode", barcode);
  return url.toString();
}

function readString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function stripLanguagePrefix(value: string) {
  return value.replace(/^[a-z]{2,3}:/i, "").trim();
}

function normalizeHumanLabel(value: string) {
  return stripLanguagePrefix(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function splitCommaList(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => normalizeHumanLabel(entry))
    .filter(Boolean);
}

function normalizeIngredients(
  ingredients: OpenFoodFactsIngredient[] | undefined,
) {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return uniqueStrings(
    ingredients.flatMap((ingredient) => [
      readString(ingredient.text),
      readString(ingredient.id) ? normalizeHumanLabel(ingredient.id!) : undefined,
    ]),
  );
}

function buildAllergenStatement(product: OpenFoodFactsProduct) {
  const allergens = uniqueStrings([
    ...toStringArray(product.allergens_tags).map(normalizeHumanLabel),
    ...splitCommaList(readString(product.allergens)),
  ]);
  const traces = uniqueStrings([
    ...toStringArray(product.traces_tags).map(normalizeHumanLabel),
    ...splitCommaList(readString(product.traces)),
  ]);
  const parts: string[] = [];

  if (allergens.length > 0) {
    parts.push(`Contains: ${allergens.join(", ")}`);
  }

  if (traces.length > 0) {
    parts.push(`May contain: ${traces.join(", ")}`);
  }

  return parts.join(". ");
}

function buildPackagingText(product: OpenFoodFactsProduct) {
  return uniqueStrings([
    readString(product.packaging),
    ...toStringArray(product.packaging_tags).map(normalizeHumanLabel),
    readString(product.labels),
    ...toStringArray(product.labels_tags).map(normalizeHumanLabel),
  ]).join(", ");
}

function cloneLookupResult(
  result: ExternalProductLookupResult,
): ExternalProductLookupResult {
  return {
    ...result,
    ingredients: [...(result.ingredients ?? [])],
    rawCategories: [...(result.rawCategories ?? [])],
    rawLabels: [...(result.rawLabels ?? [])],
    rawAllergens: [...(result.rawAllergens ?? [])],
    rawTraces: [...(result.rawTraces ?? [])],
    dataQualityWarnings: [...result.dataQualityWarnings],
  };
}

async function readOpenFoodFactsPayload(
  url: string,
  signal: AbortSignal,
): Promise<OpenFoodFactsResponse> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
    signal,
  });

  if (response.status === 404) {
    try {
      return (await response.json()) as OpenFoodFactsResponse;
    } catch {
      return {
        status: 0,
        status_verbose: "Product was not found in Open Food Facts.",
      };
    }
  }

  if (!response.ok) {
    throw new ProductDatabaseLookupError(
      "network",
      "Product lookup failed. Check your connection and try again.",
    );
  }

  try {
    return (await response.json()) as OpenFoodFactsResponse;
  } catch {
    throw new ProductDatabaseLookupError(
      "unknown",
      "Product lookup returned unreadable data.",
    );
  }
}

async function fetchOpenFoodFactsPayload(
  barcode: string,
  signal: AbortSignal,
): Promise<OpenFoodFactsResponse> {
  const directUrl = new URL(
    buildOpenFoodFactsProductUrl(
      publicAppConfig.openFoodFactsApiBaseUrl,
      barcode,
    ),
  );
  directUrl.searchParams.set("fields", OPEN_FOOD_FACTS_FIELDS.join(","));

  if (isBrowserRuntime()) {
    try {
      return await readOpenFoodFactsPayload(
        buildProductLookupProxyUrl(barcode),
        signal,
      );
    } catch {
      return readOpenFoodFactsPayload(directUrl.toString(), signal);
    }
  }

  return readOpenFoodFactsPayload(directUrl.toString(), signal);
}

export async function lookupOpenFoodFactsProduct(
  input: ExternalProductLookupInput,
): Promise<ExternalProductLookupResult> {
  const barcode = input.barcode.trim();
  const cacheKey = `${barcode}::${input.country?.trim() ?? ""}::${input.language?.trim() ?? ""}`;
  const now = Date.now();
  const cached = openFoodFactsCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cloneLookupResult(cached.result);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort("timeout"),
    OPEN_FOOD_FACTS_TIMEOUT_MS,
  );
  let payload: OpenFoodFactsResponse;

  try {
    payload = await fetchOpenFoodFactsPayload(barcode, controller.signal);
  } catch (error) {
    clearTimeout(timeoutId);

    if (
      error instanceof Error &&
      (error.name === "AbortError" || String(error.message).includes("timeout"))
    ) {
      throw new ProductDatabaseLookupError(
        "timeout",
        "Product lookup timed out. Please try again.",
      );
    }

    throw new ProductDatabaseLookupError(
      "network",
      "Product lookup failed. Check your connection and try again.",
    );
  }

  clearTimeout(timeoutId);

  if (payload.status !== 1 || !payload.product) {
    const result: ExternalProductLookupResult = {
      found: false,
      provider: "open_food_facts",
      barcode,
      dataQualityWarnings: [
        payload.status_verbose || "Product was not found in Open Food Facts.",
      ],
      raw: payload,
    };

    openFoodFactsCache.set(cacheKey, {
      expiresAt: now + OPEN_FOOD_FACTS_CACHE_TTL_MS,
      result: cloneLookupResult(result),
    });

    return result;
  }

  const product = payload.product;

  const result: ExternalProductLookupResult = {
    found: true,
    provider: "open_food_facts",
    barcode: readString(product.code) ?? barcode,
    productName:
      readString(product.product_name_en) ?? readString(product.product_name),
    brandName: readString(product.brands),
    productCategory: readString(product.categories),
    ingredientsText:
      readString(product.ingredients_text_en) ??
      readString(product.ingredients_text),
    ingredients: normalizeIngredients(product.ingredients),
    allergenStatement: buildAllergenStatement(product),
    packagingText: buildPackagingText(product),
    imageUrl:
      readString(product.image_front_url) ??
      readString(product.image_ingredients_url),
    rawCategories: uniqueStrings([
      readString(product.categories),
      ...toStringArray(product.categories_tags).map(normalizeHumanLabel),
    ]),
    rawLabels: uniqueStrings([
      readString(product.labels),
      ...toStringArray(product.labels_tags).map(normalizeHumanLabel),
      readString(product.packaging),
      ...toStringArray(product.packaging_tags).map(normalizeHumanLabel),
    ]),
    rawAllergens: uniqueStrings([
      ...toStringArray(product.allergens_tags).map(normalizeHumanLabel),
      ...splitCommaList(readString(product.allergens)),
    ]),
    rawTraces: uniqueStrings([
      ...toStringArray(product.traces_tags).map(normalizeHumanLabel),
      ...splitCommaList(readString(product.traces)),
    ]),
    dataQualityWarnings: [],
    raw: payload,
  };

  openFoodFactsCache.set(cacheKey, {
    expiresAt: now + OPEN_FOOD_FACTS_CACHE_TTL_MS,
    result: cloneLookupResult(result),
  });

  return result;
}
