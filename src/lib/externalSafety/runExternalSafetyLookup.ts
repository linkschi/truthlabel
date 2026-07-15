import type {
  ExternalSafetyLookupInput,
  ExternalSafetyLookupResult,
} from "./externalSafetyTypes";
import { toExternalSafetyCacheKey } from "./externalSafetyTypes";
import { publicAppConfig } from "@/lib/appConfig";

type RunExternalSafetyLookupOptions = {
  transport?: "route" | "direct";
  cacheTtlMs?: number;
};

const defaultCacheTtlMs = 10 * 60 * 1000;
const clientLookupCache = new Map<
  string,
  { expiresAt: number; result: ExternalSafetyLookupResult }
>();

function cloneLookupResult(result: ExternalSafetyLookupResult): ExternalSafetyLookupResult {
  return {
    lookupPerformed: result.lookupPerformed,
    signals: result.signals.map((signal) => ({
      ...signal,
      matchedBy: [...signal.matchedBy],
      affectedLots: [...(signal.affectedLots ?? [])],
      affectedDates: [...(signal.affectedDates ?? [])],
      affectedRegions: [...(signal.affectedRegions ?? [])],
    })),
    cleanCheckedSources: [...result.cleanCheckedSources],
    warnings: [...result.warnings],
    errors: [...result.errors],
  };
}

async function runViaInternalRoute(
  input: ExternalSafetyLookupInput,
): Promise<ExternalSafetyLookupResult> {
  const response = await fetch(publicAppConfig.externalSafetyRoutePath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`External safety route failed with ${response.status}.`);
  }

  return (await response.json()) as ExternalSafetyLookupResult;
}

export async function runExternalSafetyLookup(
  input: ExternalSafetyLookupInput,
  options: RunExternalSafetyLookupOptions = {},
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

  const transport =
    options.transport ??
    (typeof window === "undefined" ? "direct" : "route");
  const cacheKey = toExternalSafetyCacheKey(input);
  const ttl = options.cacheTtlMs ?? defaultCacheTtlMs;
  const now = Date.now();
  const cached = cacheKey ? clientLookupCache.get(cacheKey) : undefined;

  if (cached && cached.expiresAt > now) {
    return cloneLookupResult(cached.result);
  }

  try {
    const result =
      transport === "direct"
        ? await (await import("./runExternalSafetyLookupDirect")).runExternalSafetyLookupDirect(
            input,
            { cacheTtlMs: ttl },
          )
        : await runViaInternalRoute(input);

    if (cacheKey) {
      clientLookupCache.set(cacheKey, {
        expiresAt: now + ttl,
        result: cloneLookupResult(result),
      });
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "External safety lookup failed.";

    return {
      lookupPerformed: false,
      signals: [],
      cleanCheckedSources: [],
      warnings: [],
      errors: [message],
    };
  }
}
