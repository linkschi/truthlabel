import type { ExternalSafetySignal } from "@/lib/externalSafety/externalSafetyTypes";

import { usSeafoodBatch01Records } from "./usSeafoodBatch01";
import { usSeafoodBatch02Records } from "./usSeafoodBatch02";
import { usSeafoodBatch03Records } from "./usSeafoodBatch03";
import { usSeafoodBatch04Records } from "./usSeafoodBatch04";
import { usSeafoodBatch05Records } from "./usSeafoodBatch05";
import { usSeafoodBatch06Records } from "./usSeafoodBatch06";
import { usSeafoodBatch07Records } from "./usSeafoodBatch07";
import { usSeafoodBatch08Records } from "./usSeafoodBatch08";

export type SeafoodResearchMarkerValue =
  | "yes"
  | "no"
  | "hidden"
  | "not_listed"
  | "not_applicable"
  | "context_only";

export type UsSeafoodResearchRecord = {
  id: string;
  productName: string;
  productNameAliases: string[];
  brandName: string;
  retailer?: string;
  barcodes: string[];
  barcodeStatus?: string;
  categoryPath: string[];
  productUrl?: string;
  mainImageUrl?: string;
  ingredients: string[];
  exactIngredientText?: string;
  ingredientDisclosure: "available" | "not_exposed" | "inconsistent";
  ingredientInvestigationStatus?: string;
  packageClaims: string[];
  productSpecificChecks?: Record<string, string>;
  markerFacts: Partial<
    Record<
      | "bannedOrRestrictedIngredient"
      | "harmfulAdditives"
      | "ultraProcessed"
      | "seedOils"
      | "cancerLinked"
      | "gmoOrBioengineered"
      | "labGrownOrCellCultured"
      | "wildCaught"
      | "farmed"
      | "phosphates"
      | "colorAdded"
      | "sulfites"
      | "antibiotics"
      | "countryOrSource",
      SeafoodResearchMarkerValue
    >
  >;
  reviewNotes: string[];
  localWarnings: string[];
  externalSignals: ExternalSafetySignal[];
};

function uniqueById(records: UsSeafoodResearchRecord[]) {
  const byId = new Map<string, UsSeafoodResearchRecord>();

  records.forEach((record) => {
    const current = byId.get(record.id);

    if (!current) {
      byId.set(record.id, record);
      return;
    }

    byId.set(record.id, mergeDuplicateRecord(current, record));
  });

  return [...byId.values()];
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function markerPriority(value: SeafoodResearchMarkerValue | undefined) {
  switch (value) {
    case "yes":
      return 5;
    case "no":
    case "not_listed":
    case "not_applicable":
      return 4;
    case "hidden":
      return 3;
    case "context_only":
      return 2;
    default:
      return 0;
  }
}

function mergeMarkerFacts(
  current: UsSeafoodResearchRecord["markerFacts"],
  incoming: UsSeafoodResearchRecord["markerFacts"],
) {
  const merged = { ...current };

  Object.entries(incoming).forEach(([key, value]) => {
    const markerKey = key as keyof UsSeafoodResearchRecord["markerFacts"];
    if (markerPriority(value) > markerPriority(merged[markerKey])) {
      merged[markerKey] = value;
    }
  });

  return merged;
}

function mergeDuplicateRecord(
  current: UsSeafoodResearchRecord,
  incoming: UsSeafoodResearchRecord,
): UsSeafoodResearchRecord {
  const useIncomingIngredients =
    current.ingredients.length === 0 && incoming.ingredients.length > 0;

  return {
    ...current,
    productNameAliases: uniqueStrings([
      ...current.productNameAliases,
      ...incoming.productNameAliases,
    ]),
    barcodes: uniqueStrings([...current.barcodes, ...incoming.barcodes]),
    productUrl: current.productUrl ?? incoming.productUrl,
    mainImageUrl: current.mainImageUrl ?? incoming.mainImageUrl,
    ingredients: useIncomingIngredients ? incoming.ingredients : current.ingredients,
    exactIngredientText: useIncomingIngredients
      ? incoming.exactIngredientText
      : current.exactIngredientText ?? incoming.exactIngredientText,
    ingredientDisclosure: useIncomingIngredients
      ? incoming.ingredientDisclosure
      : current.ingredientDisclosure,
    ingredientInvestigationStatus: useIncomingIngredients
      ? incoming.ingredientInvestigationStatus
      : current.ingredientInvestigationStatus ?? incoming.ingredientInvestigationStatus,
    packageClaims: uniqueStrings([
      ...current.packageClaims,
      ...incoming.packageClaims,
    ]),
    productSpecificChecks: {
      ...incoming.productSpecificChecks,
      ...current.productSpecificChecks,
    },
    markerFacts: mergeMarkerFacts(current.markerFacts, incoming.markerFacts),
    reviewNotes: uniqueStrings([...current.reviewNotes, ...incoming.reviewNotes]),
    localWarnings: uniqueStrings([
      ...current.localWarnings,
      ...incoming.localWarnings,
    ]),
    externalSignals: [
      ...new Map(
        [...current.externalSignals, ...incoming.externalSignals].map((signal) => [
          signal.id,
          signal,
        ]),
      ).values(),
    ],
  };
}

export const usSeafoodProductResearchRecords = uniqueById([
  ...usSeafoodBatch01Records,
  ...usSeafoodBatch02Records,
  ...usSeafoodBatch03Records,
  ...usSeafoodBatch04Records,
  ...usSeafoodBatch05Records,
  ...usSeafoodBatch06Records,
  ...usSeafoodBatch07Records,
  ...usSeafoodBatch08Records,
]);
