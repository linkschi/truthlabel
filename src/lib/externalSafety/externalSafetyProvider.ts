import type {
  ExternalSafetyLookupInput,
  ExternalSafetyLookupResult,
} from "./externalSafetyTypes";

export type ExternalSafetyProvider = {
  providerId: string;
  providerName: string;
  lookup(input: ExternalSafetyLookupInput): Promise<ExternalSafetyLookupResult>;
};

export function createEmptyLookupResult(
  overrides: Partial<ExternalSafetyLookupResult> = {},
): ExternalSafetyLookupResult {
  return {
    lookupPerformed: false,
    signals: [],
    cleanCheckedSources: [],
    warnings: [],
    errors: [],
    ...overrides,
  };
}

export function mergeLookupResults(
  results: ExternalSafetyLookupResult[],
): ExternalSafetyLookupResult {
  return results.reduce<ExternalSafetyLookupResult>(
    (merged, current) => ({
      lookupPerformed: merged.lookupPerformed || current.lookupPerformed,
      signals: [...merged.signals, ...current.signals],
      cleanCheckedSources: [
        ...merged.cleanCheckedSources,
        ...current.cleanCheckedSources,
      ],
      warnings: [...merged.warnings, ...current.warnings],
      errors: [...merged.errors, ...current.errors],
    }),
    createEmptyLookupResult(),
  );
}

export function toLookupErrorMessage(
  providerName: string,
  error: unknown,
): string {
  if (error instanceof Error && error.message.trim()) {
    return `${providerName}: ${error.message.trim()}`;
  }

  return `${providerName}: lookup failed.`;
}
