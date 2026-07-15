export type ExternalSafetyLookupInput = {
  productName?: string;
  brandName?: string;
  barcode?: string;
  productCategory?: string;
  country?: string;
  region?: string;
  lotCode?: string;
  bestBeforeDate?: string;
};

export type ExternalSafetySignal = {
  id: string;
  sourceProvider:
    | "openfda"
    | "usda_fsis"
    | "uk_fsa"
    | "eu_rasff"
    | "mock"
    | "unknown";
  sourceName: string;
  sourceUrl?: string;
  region: string;
  signalType:
    | "active_recall"
    | "public_health_alert"
    | "historical_recall"
    | "allergen_recall"
    | "pathogen_contamination"
    | "foreign_material"
    | "heavy_metal_warning"
    | "chemical_contamination"
    | "labeling_misbranding"
    | "other_safety_signal";
  status: "active" | "resolved" | "historical" | "unknown";
  severity: "yellow" | "red";
  title: string;
  productName?: string;
  brandName?: string;
  companyName?: string;
  reason?: string;
  affectedLots?: string[];
  affectedDates?: string[];
  affectedRegions?: string[];
  recallClass?: string;
  publishedDate?: string;
  lastUpdatedDate?: string;
  matchedBy: Array<
    | "barcode"
    | "product_name"
    | "brand_name"
    | "company_name"
    | "lot_code"
    | "category_keyword"
  >;
  matchConfidence: "high" | "medium" | "low";
  userFacingMessage: string;
  raw?: unknown;
};

export type ExternalSafetyLookupResult = {
  lookupPerformed: boolean;
  signals: ExternalSafetySignal[];
  cleanCheckedSources: string[];
  warnings: string[];
  errors: string[];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isExternalSafetySignal(
  value: unknown,
): value is ExternalSafetySignal {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.sourceProvider === "string" &&
    typeof value.sourceName === "string" &&
    typeof value.signalType === "string" &&
    typeof value.status === "string" &&
    typeof value.severity === "string" &&
    typeof value.title === "string" &&
    Array.isArray(value.matchedBy) &&
    typeof value.matchConfidence === "string" &&
    typeof value.userFacingMessage === "string"
  );
}

export function extractExternalSafetySignals(
  values: unknown[] | undefined,
): ExternalSafetySignal[] {
  return (values ?? []).filter(isExternalSafetySignal);
}

export function uniqueStrings(values: Array<string | null | undefined>) {
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

export function normalizeExternalSafetyText(value: string | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function signalHasKeyword(
  signal: Pick<
    ExternalSafetySignal,
    "title" | "reason" | "userFacingMessage" | "signalType"
  >,
  keywords: string[],
) {
  const haystack = normalizeExternalSafetyText(
    [signal.title, signal.reason, signal.userFacingMessage, signal.signalType]
      .filter(Boolean)
      .join(" "),
  );

  return keywords.some((keyword) => {
    const normalizedKeyword = normalizeExternalSafetyText(keyword);
    return normalizedKeyword.length > 0 && ` ${haystack} `.includes(` ${normalizedKeyword} `);
  });
}

export function isHeavyMetalSafetySignal(signal: ExternalSafetySignal) {
  if (signal.signalType === "heavy_metal_warning") {
    return true;
  }

  return signalHasKeyword(signal, [
    "lead",
    "arsenic",
    "cadmium",
    "mercury",
    "methylmercury",
    "heavy metal",
  ]);
}

export function isMicroplasticSafetySignal(signal: ExternalSafetySignal) {
  return signalHasKeyword(signal, [
    "microplastic",
    "microplastics",
    "nanoplastic",
    "nanoplastics",
  ]);
}

export function isBrandTrustSafetySignal(signal: ExternalSafetySignal) {
  return !isMicroplasticSafetySignal(signal);
}

export function toExternalSafetyCacheKey(input: ExternalSafetyLookupInput) {
  const barcode = input.barcode?.trim();
  if (barcode) {
    return `barcode:${barcode}`;
  }

  const identity = [
    input.productName,
    input.brandName,
    input.productCategory,
    input.country,
    input.region,
  ]
    .map(normalizeExternalSafetyText)
    .filter(Boolean)
    .join("|");

  return identity ? `identity:${identity}` : "";
}
