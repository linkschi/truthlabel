import { externalSafetySourceRegistry } from "../externalSafetySources";
import {
  createEmptyLookupResult,
  toLookupErrorMessage,
  type ExternalSafetyProvider,
} from "../externalSafetyProvider";
import { matchExternalSafetySignal } from "../matchExternalSafetySignal";
import type {
  ExternalSafetyLookupInput,
  ExternalSafetyLookupResult,
  ExternalSafetySignal,
} from "../externalSafetyTypes";
import {
  normalizeExternalSafetyText,
  uniqueStrings,
} from "../externalSafetyTypes";

type OpenFdaFoodEnforcementRecord = {
  classification?: string;
  code_info?: string;
  distribution_pattern?: string;
  event_id?: string;
  product_description?: string;
  recall_initiation_date?: string;
  reason_for_recall?: string;
  recalling_firm?: string;
  report_date?: string;
  status?: string;
  termination_date?: string;
};

type OpenFdaResponse = {
  results?: OpenFdaFoodEnforcementRecord[];
};

const providerInfo = externalSafetySourceRegistry.openfda;
const defaultLimit = 10;

function escapeQueryValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toIsoDate(rawValue: string | undefined) {
  if (!rawValue || !/^\d{8}$/.test(rawValue)) {
    return undefined;
  }

  return `${rawValue.slice(0, 4)}-${rawValue.slice(4, 6)}-${rawValue.slice(6, 8)}`;
}

function inferSignalType(record: OpenFdaFoodEnforcementRecord) {
  const normalizedReason = normalizeExternalSafetyText(record.reason_for_recall);

  if (
    /(undeclared|allergen|milk|peanut|soy|sesame|tree nut|wheat|egg|fish|shellfish)/.test(
      normalizedReason,
    )
  ) {
    return "allergen_recall" as const;
  }

  if (/(salmonella|listeria|e coli|escherichia coli|botul|pathogen)/.test(normalizedReason)) {
    return "pathogen_contamination" as const;
  }

  if (/(lead|arsenic|cadmium|mercury|methylmercury|heavy metal)/.test(normalizedReason)) {
    return "heavy_metal_warning" as const;
  }

  if (/(glass|metal fragments|metal pieces|plastic pieces|foreign material|rubber|wood pieces)/.test(normalizedReason)) {
    return "foreign_material" as const;
  }

  if (/(misbranding|labeling|labelled|labeled)/.test(normalizedReason)) {
    return "labeling_misbranding" as const;
  }

  if (/(chemical|cleaning solution|cleaner|sanitizer|contamination)/.test(normalizedReason)) {
    return "chemical_contamination" as const;
  }

  return "active_recall" as const;
}

function inferStatus(record: OpenFdaFoodEnforcementRecord): ExternalSafetySignal["status"] {
  const normalizedStatus = normalizeExternalSafetyText(record.status);

  if (normalizedStatus.includes("terminated") || normalizedStatus.includes("completed")) {
    return "historical";
  }

  if (normalizedStatus.includes("ongoing") || normalizedStatus.includes("active")) {
    return "active";
  }

  if (record.termination_date) {
    return "resolved";
  }

  return "unknown";
}

function inferSeverity(
  signalType: ExternalSafetySignal["signalType"],
  status: ExternalSafetySignal["status"],
  matchConfidence: ExternalSafetySignal["matchConfidence"],
) {
  if (
    signalType === "labeling_misbranding" &&
    status === "active" &&
    matchConfidence === "high"
  ) {
    return "yellow" as const;
  }

  if (
    (status === "historical" || status === "resolved") &&
    matchConfidence !== "low"
  ) {
    return "yellow" as const;
  }

  if (status === "active" && matchConfidence === "high") {
    return "red" as const;
  }

  return "yellow" as const;
}

function buildUserFacingMessage(
  signalType: ExternalSafetySignal["signalType"],
  severity: ExternalSafetySignal["severity"],
  matchConfidence: ExternalSafetySignal["matchConfidence"],
) {
  if (severity === "red") {
    return "Official recall or public health alert found for this product or batch. Check the affected lot/date details.";
  }

  if (matchConfidence === "medium") {
    return "Possible safety alert match found. Check product, brand, lot code, date, and region.";
  }

  if (signalType === "historical_recall") {
    return "Historical recall found. This may not apply to the current product or batch.";
  }

  return "Safety review signal found in official recall data. Check the product scope and affected details.";
}

function buildSearchQueries(input: ExternalSafetyLookupInput) {
  const queries: string[] = [];
  const barcode = input.barcode?.trim();
  const productName = input.productName?.trim();

  if (barcode) {
    queries.push(`code_info:"${escapeQueryValue(barcode)}"`);
  }

  if (productName) {
    queries.push(`product_description:"${escapeQueryValue(productName)}"`);
  }

  return uniqueStrings(queries);
}

async function fetchOpenFdaResults(query: string) {
  const url = new URL(providerInfo.searchUrl ?? "https://api.fda.gov/food/enforcement.json");
  url.searchParams.set("search", query);
  url.searchParams.set("limit", String(defaultLimit));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return [] as OpenFdaFoodEnforcementRecord[];
  }

  if (!response.ok) {
    throw new Error(`openFDA request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as OpenFdaResponse;
  return payload.results ?? [];
}

function toSignal(
  input: ExternalSafetyLookupInput,
  record: OpenFdaFoodEnforcementRecord,
): ExternalSafetySignal | null {
  const title =
    record.product_description?.trim() ||
    record.reason_for_recall?.trim() ||
    "FDA food enforcement signal";
  const productName = record.product_description?.trim();
  const brandOrCompany = record.recalling_firm?.trim();
  const searchableText = [
    record.product_description,
    record.reason_for_recall,
    record.recalling_firm,
    record.code_info,
    record.distribution_pattern,
  ]
    .filter(Boolean)
    .join(" ");

  const matched = matchExternalSafetySignal(input, {
    barcodes: [record.code_info ?? ""],
    productNames: [productName ?? ""],
    brandNames: [productName ?? ""],
    companyNames: [brandOrCompany ?? ""],
    lotCodes: [record.code_info ?? ""],
    categoryKeywords: [input.productCategory ?? ""],
    searchableText,
  });

  if (matched.matchConfidence === "low") {
    return null;
  }

  const status = inferStatus(record);
  const signalType = inferSignalType(record);
  const effectiveSignalType =
    status === "historical" || status === "resolved"
      ? ("historical_recall" as const)
      : signalType;
  const severity = inferSeverity(effectiveSignalType, status, matched.matchConfidence);

  return {
    id: `openfda-${record.event_id ?? normalizeExternalSafetyText(title).replace(/\s+/g, "-")}`,
    sourceProvider: "openfda",
    sourceName: providerInfo.providerName,
    sourceUrl:
      record.event_id
        ? `${providerInfo.searchUrl}?search=event_id:${encodeURIComponent(record.event_id)}`
        : providerInfo.docsUrl,
    region: "US",
    signalType: effectiveSignalType,
    status,
    severity,
    title,
    productName,
    brandName: brandOrCompany,
    companyName: brandOrCompany,
    reason: record.reason_for_recall?.trim(),
    affectedLots: record.code_info ? [record.code_info] : [],
    affectedDates: uniqueStrings([
      toIsoDate(record.recall_initiation_date),
      toIsoDate(record.report_date),
    ]),
    affectedRegions: record.distribution_pattern ? [record.distribution_pattern] : [],
    recallClass: record.classification?.trim(),
    publishedDate: toIsoDate(record.report_date) ?? toIsoDate(record.recall_initiation_date),
    lastUpdatedDate: toIsoDate(record.termination_date),
    matchedBy: matched.matchedBy,
    matchConfidence: matched.matchConfidence,
    userFacingMessage: buildUserFacingMessage(
      effectiveSignalType,
      severity,
      matched.matchConfidence,
    ),
    raw: record,
  };
}

export const openFdaFoodEnforcementProvider: ExternalSafetyProvider = {
  providerId: providerInfo.providerId,
  providerName: providerInfo.providerName,
  async lookup(input): Promise<ExternalSafetyLookupResult> {
    const queries = buildSearchQueries(input);

    if (queries.length === 0) {
      return createEmptyLookupResult({
        warnings: [
          "openFDA lookup was skipped because product name or barcode details were missing.",
        ],
      });
    }

    try {
      const collected = new Map<string, ExternalSafetySignal>();

      for (const query of queries) {
        const records = await fetchOpenFdaResults(query);
        records
          .map((record) => toSignal(input, record))
          .filter((signal): signal is ExternalSafetySignal => signal !== null)
          .forEach((signal) => {
            collected.set(signal.id, signal);
          });
      }

      if (collected.size === 0) {
        return createEmptyLookupResult({
          lookupPerformed: true,
          cleanCheckedSources: [providerInfo.providerName],
        });
      }

      return {
        lookupPerformed: true,
        signals: [...collected.values()],
        cleanCheckedSources: [],
        warnings: [],
        errors: [],
      };
    } catch (error) {
      return createEmptyLookupResult({
        errors: [toLookupErrorMessage(providerInfo.providerName, error)],
      });
    }
  },
};
