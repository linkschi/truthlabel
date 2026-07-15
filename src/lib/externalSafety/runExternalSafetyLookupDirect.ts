import { mergeLookupResults, type ExternalSafetyProvider } from "./externalSafetyProvider";
import { euRasffProvider } from "./providers/euRasffProvider";
import { openFdaFoodEnforcementProvider } from "./providers/openFdaFoodEnforcementProvider";
import { ukFsaFoodAlertsProvider } from "./providers/ukFsaFoodAlertsProvider";
import { usdaFsisRecallProvider } from "./providers/usdaFsisRecallProvider";
import { publicAppConfig } from "@/lib/appConfig";
import type {
  ExternalSafetyLookupInput,
  ExternalSafetyLookupResult,
  ExternalSafetySignal,
} from "./externalSafetyTypes";
import {
  isMicroplasticSafetySignal,
  isHeavyMetalSafetySignal,
  toExternalSafetyCacheKey,
  uniqueStrings,
} from "./externalSafetyTypes";

type DirectLookupOptions = {
  providers?: ExternalSafetyProvider[];
  cacheTtlMs?: number;
};

const defaultCacheTtlMs = 10 * 60 * 1000;
const directLookupCache = new Map<
  string,
  { expiresAt: number; result: ExternalSafetyLookupResult }
>();

function cloneLookupResult(result: ExternalSafetyLookupResult): ExternalSafetyLookupResult {
  return {
    lookupPerformed: result.lookupPerformed,
    signals: result.signals.map((signal) => ({
      ...signal,
      affectedLots: [...(signal.affectedLots ?? [])],
      affectedDates: [...(signal.affectedDates ?? [])],
      affectedRegions: [...(signal.affectedRegions ?? [])],
      matchedBy: [...signal.matchedBy],
    })),
    cleanCheckedSources: [...result.cleanCheckedSources],
    warnings: [...result.warnings],
    errors: [...result.errors],
  };
}

function isMeatLikeCategory(productCategory: string | undefined) {
  return /meat|fast food|poultry|chicken|beef|pork|sausage|deli|nugget|burger|egg/i.test(
    productCategory ?? "",
  );
}

function isUkLocale(input: ExternalSafetyLookupInput) {
  return /\buk\b|\bgb\b|\bunited kingdom\b|\bgreat britain\b/i.test(
    `${input.country ?? ""} ${input.region ?? ""}`,
  );
}

function isEuLocale(input: ExternalSafetyLookupInput) {
  return /\beu\b|\beurope\b|\beuropean union\b/i.test(
    `${input.country ?? ""} ${input.region ?? ""}`,
  );
}

function selectProviders(
  input: ExternalSafetyLookupInput,
  overrides?: ExternalSafetyProvider[],
) {
  if (overrides?.length) {
    return overrides;
  }

  const providers: ExternalSafetyProvider[] = [openFdaFoodEnforcementProvider];

  if (isMeatLikeCategory(input.productCategory)) {
    providers.push(usdaFsisRecallProvider);
  }

  if (isUkLocale(input)) {
    providers.push(ukFsaFoodAlertsProvider);
  }

  if (isEuLocale(input)) {
    providers.push(euRasffProvider);
  }

  return providers;
}

function dedupeSignals(signals: ExternalSafetySignal[]) {
  const byKey = new Map<string, ExternalSafetySignal>();

  signals.forEach((signal) => {
    const key = [
      signal.sourceProvider,
      signal.signalType,
      signal.productName,
      signal.brandName,
      signal.title,
      signal.publishedDate,
    ]
      .filter(Boolean)
      .join("::")
      .toLowerCase();
    const current = byKey.get(key);

    if (!current) {
      byKey.set(key, signal);
      return;
    }

    if (current.severity === "yellow" && signal.severity === "red") {
      byKey.set(key, signal);
      return;
    }

    if (current.matchConfidence === "medium" && signal.matchConfidence === "high") {
      byKey.set(key, signal);
    }
  });

  return [...byKey.values()];
}

export async function runExternalSafetyLookupDirect(
  input: ExternalSafetyLookupInput,
  options: DirectLookupOptions = {},
): Promise<ExternalSafetyLookupResult> {
  if (!publicAppConfig.flags.enableExternalSafetyLookup) {
    return {
      lookupPerformed: false,
      signals: [],
      cleanCheckedSources: [],
      warnings: ["External safety lookup is disabled in this build."],
      errors: [],
    };
  }

  const cacheKey = toExternalSafetyCacheKey(input);
  const ttl = options.cacheTtlMs ?? defaultCacheTtlMs;
  const now = Date.now();
  const cached = cacheKey ? directLookupCache.get(cacheKey) : undefined;

  if (cached && cached.expiresAt > now) {
    return cloneLookupResult(cached.result);
  }

  const providers = selectProviders(input, options.providers);
  const results = await Promise.all(
    providers.map(async (provider) => provider.lookup(input)),
  );

  const merged = mergeLookupResults(results);
  const dedupedSignals = dedupeSignals(merged.signals);
  const filteredSignals: ExternalSafetySignal[] = [];
  const discardedLowConfidence = dedupedSignals.filter(
    (signal) => signal.matchConfidence === "low",
  );

  dedupedSignals.forEach((signal) => {
    if (signal.matchConfidence === "low") {
      return;
    }

    if (
      signal.signalType === "active_recall" &&
      signal.matchConfidence === "medium" &&
      signal.severity === "red"
    ) {
      filteredSignals.push({
        ...signal,
        severity: "yellow",
        userFacingMessage:
          "Possible safety alert match found. Check product, brand, lot code, date, and region.",
      });
      return;
    }

    filteredSignals.push(signal);
  });

  const warnings = uniqueStrings([
    ...merged.warnings,
    ...(discardedLowConfidence.length > 0
      ? [
          "Low-confidence external safety matches were excluded until product or lot details can be confirmed.",
        ]
      : []),
  ]);

  const result: ExternalSafetyLookupResult = {
    lookupPerformed: merged.lookupPerformed,
    signals: filteredSignals.sort((left, right) => {
      const severityRank = { red: 2, yellow: 1 } as const;
      if (severityRank[left.severity] !== severityRank[right.severity]) {
        return severityRank[right.severity] - severityRank[left.severity];
      }

      const confidenceRank = { high: 2, medium: 1, low: 0 } as const;
      return confidenceRank[right.matchConfidence] - confidenceRank[left.matchConfidence];
    }),
    cleanCheckedSources: uniqueStrings(merged.cleanCheckedSources),
    warnings,
    errors: uniqueStrings(merged.errors),
  };

  if (cacheKey) {
    directLookupCache.set(cacheKey, {
      expiresAt: now + ttl,
      result: cloneLookupResult(result),
    });
  }

  return result;
}

export function summarizeExternalSafetySignals(signals: ExternalSafetySignal[]) {
  return {
    heavyMetals: signals.filter(isHeavyMetalSafetySignal),
    microplastics: signals.filter(isMicroplasticSafetySignal),
  };
}
