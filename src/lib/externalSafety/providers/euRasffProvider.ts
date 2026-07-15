import { externalSafetySourceRegistry } from "../externalSafetySources";
import {
  createEmptyLookupResult,
  type ExternalSafetyProvider,
} from "../externalSafetyProvider";

const providerInfo = externalSafetySourceRegistry.eu_rasff;

export const euRasffProvider: ExternalSafetyProvider = {
  providerId: providerInfo.providerId,
  providerName: providerInfo.providerName,
  async lookup() {
    return createEmptyLookupResult({
      warnings: [
        "EU RASFF provider is not enabled because a stable official API/access method was not configured.",
      ],
    });
  },
};
