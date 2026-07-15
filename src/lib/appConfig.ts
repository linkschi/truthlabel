const truthyPattern = /^(1|true|yes|on)$/i;
const falsyPattern = /^(0|false|no|off)$/i;

function readStringEnv(name: string, fallback = "") {
  const value = process.env[name]?.trim();
  return value || fallback;
}

function readBooleanEnv(name: string, fallback: boolean) {
  const value = process.env[name]?.trim();

  if (!value) {
    return fallback;
  }

  if (truthyPattern.test(value)) {
    return true;
  }

  if (falsyPattern.test(value)) {
    return false;
  }

  return fallback;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const publicAppConfig = {
  deploymentUrl: trimTrailingSlash(
    readStringEnv("NEXT_PUBLIC_DEPLOYMENT_URL", ""),
  ),
  appVersion: readStringEnv("NEXT_PUBLIC_APP_VERSION", "0.1.0"),
  buildDate: readStringEnv("NEXT_PUBLIC_BUILD_DATE", ""),
  defaultRegion: readStringEnv("NEXT_PUBLIC_DEFAULT_REGION", "UNKNOWN"),
  ocrLanguage: readStringEnv("NEXT_PUBLIC_OCR_LANGUAGE", "eng"),
  openFoodFactsApiBaseUrl: trimTrailingSlash(
    readStringEnv(
      "NEXT_PUBLIC_OPEN_FOOD_FACTS_API_BASE_URL",
      "https://world.openfoodfacts.net/api/v2",
    ),
  ),
  externalSafetyRoutePath: readStringEnv(
    "NEXT_PUBLIC_EXTERNAL_SAFETY_ROUTE_PATH",
    "/api/external-safety",
  ),
  flags: {
    enableBarcodeLookup: readBooleanEnv(
      "NEXT_PUBLIC_ENABLE_BARCODE_LOOKUP",
      true,
    ),
    enableCameraBarcodeScan: readBooleanEnv(
      "NEXT_PUBLIC_ENABLE_CAMERA_BARCODE_SCAN",
      true,
    ),
    enableOcrScan: readBooleanEnv("NEXT_PUBLIC_ENABLE_OCR_SCAN", true),
    enableExternalSafetyLookup: readBooleanEnv(
      "NEXT_PUBLIC_ENABLE_EXTERNAL_SAFETY_LOOKUP",
      true,
    ),
    enableDemoProducts: readBooleanEnv("NEXT_PUBLIC_ENABLE_DEMO_PRODUCTS", true),
    enableTestFeedback: readBooleanEnv(
      "NEXT_PUBLIC_ENABLE_TEST_FEEDBACK",
      true,
    ),
    enableDebugOutput: readBooleanEnv("NEXT_PUBLIC_ENABLE_DEBUG_OUTPUT", false),
  },
} as const;

export type PublicFeatureFlags = typeof publicAppConfig.flags;

export function isFeatureEnabled(flag: keyof PublicFeatureFlags) {
  return publicAppConfig.flags[flag];
}
