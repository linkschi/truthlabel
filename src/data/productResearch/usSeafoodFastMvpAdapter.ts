import type {
  SeafoodResearchMarkerValue,
  UsSeafoodResearchRecord,
} from "./usSeafoodProducts";

type FastMvpMarkerValue =
  | "yes"
  | "no"
  | "hidden"
  | "not_listed"
  | "not_applicable"
  | "context_only"
  | string
  | null;

type FastMvpSeafoodProduct = {
  productName: string;
  brand: string;
  retailer?: string | null;
  barcode?: string | null;
  category?: string | null;
  productUrl?: string | null;
  imageUrl?: string | null;
  ingredientsText?: string | null;
  ingredientsStatus?: string | null;
  keyMarkers?: Record<string, FastMvpMarkerValue>;
  markerDetails?: Record<string, string>;
};

type FastMvpSeafoodBatch =
  | FastMvpSeafoodProduct[]
  | {
      products: FastMvpSeafoodProduct[];
    };

type MarkerFactKey = keyof UsSeafoodResearchRecord["markerFacts"];

const seafoodDataWarning =
  "Truthlabel used local US seafood research for this product. Product formulas and claims can change, so verify the current package label.";

const missingIngredientWarning =
  "Ingredient text was not exposed in the researched retailer listing.";

const markerKeyMap: Partial<Record<string, MarkerFactKey>> = {
  bannedOrRestrictedIngredient: "bannedOrRestrictedIngredient",
  harmfulAdditives: "harmfulAdditives",
  ultraProcessed: "ultraProcessed",
  seedOils: "seedOils",
  cancerLinked: "cancerLinked",
  gmoOrBioengineered: "gmoOrBioengineered",
  labGrownOrCellCultured: "labGrownOrCellCultured",
  wildCaught: "wildCaught",
  farmed: "farmed",
  phosphates: "phosphates",
  colorAdded: "colorAdded",
  sulfites: "sulfites",
  antibiotics: "antibiotics",
  countryOrSource: "countryOrSource",
};

const readableMarkerNames: Record<string, string> = {
  bannedOrRestrictedIngredient: "Banned or restricted ingredient",
  harmfulAdditives: "Harmful additives",
  ultraProcessed: "Ultra-processed",
  seedOils: "Seed oils",
  cancerLinked: "Cancer-linked marker",
  gmoOrBioengineered: "GMO or bioengineered",
  labGrownOrCellCultured: "Lab-grown or cell-cultured",
  wildCaught: "Wild-caught",
  farmed: "Farmed",
  phosphates: "Phosphates",
  colorAdded: "Added color or color treatment",
  sulfites: "Sulfites",
  antibiotics: "Antibiotics",
  countryOrSource: "Country or source claim",
};

function uniqueStrings(values: Array<string | undefined | null>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const trimmed = value?.trim();
    if (!trimmed || seen.has(trimmed)) {
      return;
    }

    seen.add(trimmed);
    result.push(trimmed);
  });

  return result;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function toMarkerValue(value: FastMvpMarkerValue | undefined) {
  if (!value) {
    return undefined;
  }

  const normalized = String(value).trim().toLowerCase().replace(/\s+/g, "_");
  const allowed = new Set<SeafoodResearchMarkerValue>([
    "yes",
    "no",
    "hidden",
    "not_listed",
    "not_applicable",
    "context_only",
  ]);

  if (allowed.has(normalized as SeafoodResearchMarkerValue)) {
    return normalized as SeafoodResearchMarkerValue;
  }

  return undefined;
}

function toIngredientDisclosure(
  ingredientsStatus: string | null | undefined,
): UsSeafoodResearchRecord["ingredientDisclosure"] {
  const normalized = ingredientsStatus?.toLowerCase().trim();

  if (normalized === "confirmed") {
    return "available";
  }

  if (normalized === "unclear") {
    return "inconsistent";
  }

  return "not_exposed";
}

function splitTopLevelCommas(value: string) {
  const result: string[] = [];
  let current = "";
  let depth = 0;

  for (const char of value) {
    if (char === "(" || char === "[") {
      depth += 1;
    }

    if (char === ")" || char === "]") {
      depth = Math.max(0, depth - 1);
    }

    if (char === "," && depth === 0) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseIngredients(product: FastMvpSeafoodProduct) {
  const text = product.ingredientsText?.trim();
  if (!text) {
    return [];
  }

  return uniqueStrings(
    splitTopLevelCommas(text.replace(/\s+/g, " "))
      .map((part) => part.trim().replace(/\.$/, ""))
      .filter((part) => part.length > 0),
  );
}

function buildCategoryPath(product: FastMvpSeafoodProduct) {
  return uniqueStrings([
    "Seafood",
    ...(product.category ?? "")
      .split(/[/>]/g)
      .map((part) => part.trim())
      .filter(Boolean),
  ]);
}

function buildAliases(product: FastMvpSeafoodProduct) {
  const escapedBrand = product.brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const productWithoutBrand = product.productName
    .replace(new RegExp(`^${escapedBrand}\\s+`, "i"), "")
    .trim();

  return uniqueStrings([
    product.productName,
    productWithoutBrand,
    `${product.brand} ${productWithoutBrand}`,
    `${product.retailer ?? ""} ${productWithoutBrand}`.trim(),
  ]);
}

function buildPackageClaims(product: FastMvpSeafoodProduct) {
  const markers = product.keyMarkers ?? {};
  const claims: string[] = [];

  if (markers.wildCaught === "yes") {
    claims.push("Wild-caught");
  }

  if (markers.farmed === "yes") {
    claims.push("Farmed");
  }

  if (markers.antibiotics === "no") {
    claims.push("No antibiotic marker found");
  }

  if (markers.gmoOrBioengineered === "no") {
    claims.push("No GMO or bioengineered marker found");
  }

  if (markers.labGrownOrCellCultured === "no") {
    claims.push("No lab-grown or cell-cultured marker found");
  }

  if (markers.countryOrSource === "yes") {
    claims.push("Source or origin claim found");
  }

  return uniqueStrings([product.category ?? undefined, ...claims]);
}

function buildProductSpecificChecks(product: FastMvpSeafoodProduct) {
  const checks: Record<string, string> = {};

  Object.entries(product.keyMarkers ?? {}).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    checks[key] = String(value);
  });

  Object.entries(product.markerDetails ?? {}).forEach(([key, value]) => {
    checks[`${key}Detail`] = value;
  });

  return checks;
}

function buildMarkerFacts(product: FastMvpSeafoodProduct) {
  const markerFacts: UsSeafoodResearchRecord["markerFacts"] = {};
  const markers = product.keyMarkers ?? {};
  const ingredientsText = product.ingredientsText ?? "";

  Object.entries(markers).forEach(([key, value]) => {
    const mappedKey = markerKeyMap[key];
    const markerValue = toMarkerValue(value);

    if (!mappedKey || !markerValue) {
      return;
    }

    markerFacts[mappedKey] = markerValue;
  });

  if (/sodium tripolyphosphate|phosphate/i.test(ingredientsText)) {
    markerFacts.phosphates = "yes";
  }

  if (/sodium bisulfite|\bsulfite\b|\bsulfites\b/i.test(ingredientsText)) {
    markerFacts.sulfites = "yes";
  }

  if (/carbon monoxide|treated to retain natural color|retain natural color/i.test(ingredientsText)) {
    markerFacts.colorAdded = "yes";
  }

  if (/soybean oil|canola oil|sunflower oil|cottonseed oil|corn oil|vegetable oil/i.test(ingredientsText)) {
    markerFacts.seedOils = "yes";
  }

  return markerFacts;
}

function buildReviewNotes(product: FastMvpSeafoodProduct) {
  const markers = product.keyMarkers ?? {};
  const details = Object.entries(product.markerDetails ?? {}).map(
    ([key, value]) => `${readableMarkerNames[key] ?? key}: ${value}`,
  );

  const visibleYesMarkers = Object.entries(markers)
    .filter(([, value]) => value === "yes")
    .map(([key]) => `${readableMarkerNames[key] ?? key} is marked yes.`);

  return uniqueStrings([
    ...details,
    ...visibleYesMarkers,
    product.ingredientsStatus === "unclear"
      ? "The retailer wording was not a clean ingredient-panel disclosure, so Truthlabel keeps the missing information visible."
      : undefined,
    product.ingredientsStatus === "not_disclosed_online"
      ? "The researched listing did not expose the ingredient statement online."
      : undefined,
  ]);
}

function buildWarnings(product: FastMvpSeafoodProduct) {
  const warnings = [seafoodDataWarning];

  if (product.ingredientsStatus !== "confirmed") {
    warnings.push(missingIngredientWarning);
  }

  return warnings;
}

function getProducts(batch: FastMvpSeafoodBatch) {
  return Array.isArray(batch) ? batch : batch.products;
}

export function recordsFromSeafoodFastMvpBatch(
  batch: FastMvpSeafoodBatch,
): UsSeafoodResearchRecord[] {
  return getProducts(batch).map((product) => {
    const barcode = product.barcode?.trim();
    const ingredientDisclosure = toIngredientDisclosure(product.ingredientsStatus);

    return {
      id: slugify(`${product.brand}_${product.productName}`),
      productName: product.productName,
      productNameAliases: buildAliases(product),
      brandName: product.brand,
      retailer: product.retailer ?? undefined,
      barcodes: barcode ? [barcode] : [],
      barcodeStatus: barcode ? "retailer-provided UPC" : "consumer UPC not exposed",
      categoryPath: buildCategoryPath(product),
      productUrl: product.productUrl ?? undefined,
      mainImageUrl: product.imageUrl ?? undefined,
      ingredients:
        ingredientDisclosure === "not_exposed" ? [] : parseIngredients(product),
      exactIngredientText: product.ingredientsText ?? undefined,
      ingredientDisclosure,
      ingredientInvestigationStatus:
        ingredientDisclosure === "available"
          ? "Fast MVP seafood research imported a confirmed retailer ingredient statement."
          : "Fast MVP seafood research did not expose a clean confirmed ingredient panel; hidden and unclear markers remain visible.",
      packageClaims: buildPackageClaims(product),
      productSpecificChecks: buildProductSpecificChecks(product),
      markerFacts: buildMarkerFacts(product),
      reviewNotes: buildReviewNotes(product),
      localWarnings: buildWarnings(product),
      externalSignals: [],
    };
  });
}
