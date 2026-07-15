import { externalSafetySourceRegistry } from "../externalSafetySources";
import {
  createEmptyLookupResult,
  type ExternalSafetyProvider,
} from "../externalSafetyProvider";
import type { ExternalSafetyLookupInput } from "../externalSafetyTypes";

const providerInfo = externalSafetySourceRegistry.uk_fsa;

function isUkRelevant(input: ExternalSafetyLookupInput) {
  const locale = `${input.country ?? ""} ${input.region ?? ""}`;
  return /\buk\b|\bgb\b|\bunited kingdom\b|\bgreat britain\b/i.test(locale);
}

export const ukFsaFoodAlertsProvider: ExternalSafetyProvider = {
  providerId: providerInfo.providerId,
  providerName: providerInfo.providerName,
  async lookup(input: ExternalSafetyLookupInput) {
    if (!isUkRelevant(input)) {
      return createEmptyLookupResult();
    }

    return createEmptyLookupResult({
      warnings: [
        "UK FSA provider was not completed for live parsing in this environment. Use the official UK FSA alerts site if enabled later.",
      ],
    });
  },
};
