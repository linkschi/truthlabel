import type {
  MeatResearchMarkerValue,
  UsMeatResearchRecord,
} from "./usMeatProducts";

type FastMvpMarkerValue =
  | "yes"
  | "no"
  | "hidden"
  | "not_listed"
  | "not_applicable"
  | "context_only"
  | string
  | null;

type FastMvpProduct = {
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

type FastMvpBatch = {
  batch?: number;
  productRange?: string;
  products: FastMvpProduct[];
};

type MarkerFactKey = keyof UsMeatResearchRecord["markerFacts"];

const meatDataWarning =
  "Truthlabel used local US meat research for this product. Product formulas and claims can change, so verify the current package label.";

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
  addedWater: "addedWater",
  phosphates: "phosphates",
  mechanicallySeparatedMeat: "mechanicallySeparated",
  antibiotics: "antibiotics",
  growthHormones: "growthHormones",
  grassFed: "grassFed",
  organic: "organic",
};

const readableMarkerNames: Record<string, string> = {
  bannedOrRestrictedIngredient: "Banned or restricted ingredient",
  harmfulAdditives: "Harmful additives",
  ultraProcessed: "Ultra-processed",
  seedOils: "Seed oils",
  cancerLinked: "Cancer-linked marker",
  gmoOrBioengineered: "GMO or bioengineered",
  labGrownOrCellCultured: "Lab-grown or cell-cultured",
  addedWater: "Added water",
  phosphates: "Phosphates",
  celeryPowderOrNitrite: "Celery powder or nitrite",
  mechanicallySeparatedMeat: "Mechanically separated meat",
  antibiotics: "Antibiotics",
  growthHormones: "Growth hormones",
  grassFed: "Grass-fed",
  organic: "Organic",
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
  const allowed = new Set<MeatResearchMarkerValue>([
    "yes",
    "no",
    "hidden",
    "not_listed",
    "not_applicable",
    "context_only",
  ]);

  if (allowed.has(normalized as MeatResearchMarkerValue)) {
    return normalized as MeatResearchMarkerValue;
  }

  return undefined;
}

function toIngredientDisclosure(
  ingredientsStatus: string | null | undefined,
): UsMeatResearchRecord["ingredientDisclosure"] {
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

function parseIngredients(product: FastMvpProduct) {
  const text = product.ingredientsText?.trim();
  if (!text) {
    return [];
  }

  const cleaned = text
    .replace(/^Pork chops described as marinated with\s+/i, "Pork chops, ")
    .replace(/\s+/g, " ");

  return uniqueStrings(
    splitTopLevelCommas(cleaned)
      .map((part) =>
        part
          .replace(/^contains\s+2%\s+or\s+less\s+of:\s*/i, "")
          .replace(/^contains\s+less\s+than\s+2%\s+of:\s*/i, "")
          .replace(/^solution ingredients:\s*/i, "")
          .replace(/^oven roasted turkey breast:\s*/i, "")
          .replace(/^honey uncured ham:\s*/i, "")
          .trim()
          .replace(/\.$/, ""),
      )
      .filter((part) => part.length > 0),
  );
}

function buildCategoryPath(product: FastMvpProduct) {
  return uniqueStrings([
    "Meat",
    ...(product.category ?? "")
      .split(/[/>]/g)
      .map((part) => part.trim())
      .filter(Boolean),
  ]);
}

function buildAliases(product: FastMvpProduct) {
  const productWithoutBrand = product.productName
    .replace(new RegExp(`^${product.brand}\\s+`, "i"), "")
    .trim();

  return uniqueStrings([
    product.productName,
    productWithoutBrand,
    `${product.brand} ${productWithoutBrand}`,
    `${product.retailer ?? ""} ${productWithoutBrand}`.trim(),
  ]);
}

function buildPackageClaims(product: FastMvpProduct) {
  const markers = product.keyMarkers ?? {};
  const claims: string[] = [];

  if (markers.organic === "yes") {
    claims.push("Organic");
  }

  if (markers.grassFed === "yes") {
    claims.push("Grass-fed");
  }

  if (markers.antibiotics === "no") {
    claims.push("No antibiotics claim");
  }

  if (markers.gmoOrBioengineered === "no") {
    claims.push("No GMO or bioengineered marker found");
  }

  if (markers.labGrownOrCellCultured === "no") {
    claims.push("No lab-grown or cell-cultured marker found");
  }

  return uniqueStrings([product.category ?? undefined, ...claims]);
}

function buildProductSpecificChecks(product: FastMvpProduct) {
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

function buildMarkerFacts(product: FastMvpProduct) {
  const markerFacts: UsMeatResearchRecord["markerFacts"] = {};
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

  const celeryOrNitrite = toMarkerValue(markers.celeryPowderOrNitrite);
  if (celeryOrNitrite === "yes") {
    markerFacts.celeryPowder = /celery/i.test(ingredientsText) ? "yes" : "hidden";
    markerFacts.sodiumNitrite = /sodium nitrite/i.test(ingredientsText)
      ? "yes"
      : "not_listed";
  } else if (celeryOrNitrite === "no") {
    markerFacts.celeryPowder = "not_listed";
    markerFacts.sodiumNitrite = "not_listed";
  } else if (celeryOrNitrite === "hidden") {
    markerFacts.celeryPowder = "hidden";
    markerFacts.sodiumNitrite = "hidden";
  }

  if (/monosodium glutamate|\bmsg\b/i.test(ingredientsText)) {
    markerFacts.msg = "yes";
  }

  if (/carrageenan/i.test(ingredientsText)) {
    markerFacts.carrageenan = "yes";
  }

  if (/caramel color|annatto|carmine/i.test(ingredientsText)) {
    markerFacts.addedColor = "yes";
  }

  if (/bha/i.test(ingredientsText)) {
    markerFacts.bha = "yes";
  }

  if (/propyl gallate/i.test(ingredientsText)) {
    markerFacts.propylGallate = "yes";
  }

  return markerFacts;
}

function buildReviewNotes(product: FastMvpProduct) {
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
      ? "The retailer wording was not a clean ingredient-panel disclosure, so Truthlabel keeps uncertainty visible."
      : undefined,
  ]);
}

function buildWarnings(product: FastMvpProduct) {
  const warnings = [meatDataWarning];

  if (product.ingredientsStatus !== "confirmed") {
    warnings.push(missingIngredientWarning);
  }

  return warnings;
}

export function recordsFromFastMvpBatch(
  batch: FastMvpBatch,
): UsMeatResearchRecord[] {
  return batch.products.map((product) => {
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
      ingredients: ingredientDisclosure === "not_exposed" ? [] : parseIngredients(product),
      exactIngredientText: product.ingredientsText ?? undefined,
      ingredientDisclosure,
      ingredientInvestigationStatus:
        ingredientDisclosure === "available"
          ? "Fast MVP research imported a confirmed retailer ingredient statement."
          : "Fast MVP research did not expose a clean confirmed ingredient panel; hidden and unclear markers remain visible.",
      packageClaims: buildPackageClaims(product),
      productSpecificChecks: buildProductSpecificChecks(product),
      markerFacts: buildMarkerFacts(product),
      reviewNotes: buildReviewNotes(product),
      localWarnings: buildWarnings(product),
      externalSignals: [],
    };
  });
}
