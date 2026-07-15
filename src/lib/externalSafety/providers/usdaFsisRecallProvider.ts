import { externalSafetySourceRegistry } from "../externalSafetySources";
import {
  createEmptyLookupResult,
  type ExternalSafetyProvider,
} from "../externalSafetyProvider";
import type { ExternalSafetyLookupInput } from "../externalSafetyTypes";

const providerInfo = externalSafetySourceRegistry.usda_fsis;

function isFsisRelevantCategory(productCategory: string | undefined) {
  return /meat|fast food|poultry|chicken|beef|pork|sausage|deli|nugget|burger|egg/i.test(
    productCategory ?? "",
  );
}

export const usdaFsisRecallProvider: ExternalSafetyProvider = {
  providerId: providerInfo.providerId,
  providerName: providerInfo.providerName,
  async lookup(input: ExternalSafetyLookupInput) {
    if (!isFsisRelevantCategory(input.productCategory)) {
      return createEmptyLookupResult();
    }

    return createEmptyLookupResult({
      warnings: [
        "USDA FSIS provider was not completed for live parsing in this environment. Use the official FSIS recall API or alert pages if enabled later.",
      ],
    });
  },
};
