import type {
  ExternalProductLookupInput,
  ExternalProductLookupResult,
} from "@/lib/productDatabase/productDatabaseTypes";

import {
  enrichWithUsMeatProductResearch,
  lookupUsMeatProductResearch,
} from "./usMeatProductResearch";
import {
  enrichWithUsSeafoodProductResearch,
  lookupUsSeafoodProductResearch,
} from "./usSeafoodProductResearch";

export function lookupLocalProductResearch(
  input: ExternalProductLookupInput,
): ExternalProductLookupResult | null {
  return (
    lookupUsMeatProductResearch(input) ?? lookupUsSeafoodProductResearch(input)
  );
}

export function enrichWithLocalProductResearch(
  result: ExternalProductLookupResult,
): ExternalProductLookupResult {
  if (!result.found) {
    return lookupLocalProductResearch({ barcode: result.barcode }) ?? result;
  }

  return enrichWithUsSeafoodProductResearch(
    enrichWithUsMeatProductResearch(result),
  );
}
