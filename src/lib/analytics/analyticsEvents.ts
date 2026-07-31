import type { ScanResult } from "@/lib/buildScanResult";

export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "trial_cta_clicked",
  "signup_started",
  "signup_success",
  "signup_failed",
  "checkout_started",
  "checkout_returned",
  "checkout_handoff_shown",
  "activation_viewed",
  "activation_success",
  "activation_failed",
  "login_started",
  "login_success",
  "login_failed",
  "forgot_password_started",
  "password_reset_requested",
  "password_reset_failed",
  "password_update_success",
  "password_update_failed",
  "onboarding_started",
  "demo_viewed",
  "demo_skipped",
  "allergens_saved",
  "no_allergens_selected",
  "setup_completed",
  "install_instructions_viewed",
  "install_prompt_shown",
  "install_accepted",
  "install_dismissed",
  "install_deferred",
  "onboarding_completed",
  "manual_scan_started",
  "manual_scan_success",
  "manual_scan_failed",
  "barcode_scan_started",
  "barcode_detected",
  "barcode_lookup_success",
  "barcode_lookup_failed",
  "barcode_no_product_found",
  "barcode_missing_ingredients",
  "ocr_scan_started",
  "ocr_text_extracted",
  "ocr_review_confirmed",
  "ocr_no_text_detected",
  "ocr_scan_failed",
  "result_page_loaded",
  "app_error",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export type AnalyticsPrimitive = string | number | boolean | null;
export type AnalyticsValue =
  | AnalyticsPrimitive
  | AnalyticsPrimitive[]
  | { [key: string]: AnalyticsValue };
export type AnalyticsMetadata = Record<string, AnalyticsValue>;

const eventNameSet = new Set<string>(ANALYTICS_EVENT_NAMES);
const sensitiveMetadataKeyPattern =
  /(?:password|token|secret|license(?:_?key)?|card|payment|ingredient_?text|ocr_?text|image_?data|photo|allergy_?profile|selected_?allerg)/i;

export function isAnalyticsEventName(value: unknown): value is AnalyticsEventName {
  return typeof value === "string" && eventNameSet.has(value);
}

function cleanMetadataKey(key: string) {
  return key.replace(/[^a-zA-Z0-9_:-]/g, "_").slice(0, 64);
}

function cleanMetadataString(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 240);
}

function cleanMetadataValue(value: unknown, depth: number): AnalyticsValue | undefined {
  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    return cleanMetadataString(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    if (depth >= 2) {
      return undefined;
    }

    return value
      .slice(0, 12)
      .map((item) => cleanMetadataValue(item, depth + 1))
      .filter((item): item is AnalyticsPrimitive => {
        return (
          item === null ||
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean"
        );
      });
  }

  if (typeof value === "object" && depth < 2) {
    return sanitizeAnalyticsMetadata(value, depth + 1);
  }

  return undefined;
}

export function sanitizeAnalyticsMetadata(
  value: unknown,
  depth = 0,
): AnalyticsMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const output: AnalyticsMetadata = {};

  Object.entries(value as Record<string, unknown>)
    .slice(0, 40)
    .forEach(([rawKey, rawValue]) => {
      if (sensitiveMetadataKeyPattern.test(rawKey)) {
        return;
      }

      const key = cleanMetadataKey(rawKey);

      if (!key) {
        return;
      }

      const cleanedValue = cleanMetadataValue(rawValue, depth);

      if (cleanedValue !== undefined) {
        output[key] = cleanedValue;
      }
    });

  return output;
}

export function normalizeAnalyticsError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  const normalized = message.toLowerCase();

  if (!message) {
    return "unknown_error";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "rate_limited";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "network_error";
  }

  if (normalized.includes("password") || normalized.includes("credential")) {
    return "auth_credentials_error";
  }

  if (normalized.includes("not configured")) {
    return "configuration_error";
  }

  if (normalized.includes("barcode")) {
    return "barcode_error";
  }

  if (normalized.includes("ingredient") || normalized.includes("label")) {
    return "ingredient_input_error";
  }

  return "app_error";
}

function scoreBucket(score: number | null | undefined) {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return "unknown";
  }

  if (score <= 24) {
    return "0_24";
  }

  if (score <= 49) {
    return "25_49";
  }

  if (score <= 74) {
    return "50_74";
  }

  return "75_100";
}

export function buildScanResultAnalytics(scanResult: ScanResult): AnalyticsMetadata {
  const finalVerdict = scanResult.finalVerdict;

  return {
    scan_source: scanResult.productHero.scanSource || "unknown",
    product_category: scanResult.productHero.productCategory || "unknown",
    has_barcode: Boolean(scanResult.productHero.barcode),
    has_product_image: Boolean(scanResult.productHero.imageUrl),
    verdict_tone: finalVerdict.verdictTone,
    verdict_code: finalVerdict.verdictCode,
    verdict_label: finalVerdict.verdictLabel,
    immediate_stop_reason: finalVerdict.immediateStopReason || "",
    ingredient_load_score: scanResult.ingredientLoad.score,
    ingredient_load_bucket: scoreBucket(scanResult.ingredientLoad.score),
    ingredient_load_level: scanResult.ingredientLoad.level,
    quick_overview_count: scanResult.quickOverview.length,
    deep_exposure_count: scanResult.deepExposureChecks.length,
    red_count: finalVerdict.totalRedCount,
    serious_red_count: finalVerdict.seriousRedCount,
    overload_red_count: finalVerdict.overloadRedCount,
    yellow_count: finalVerdict.yellowCount,
    confidence_note_count: scanResult.confidenceNotes.length,
    brand_trust_status: scanResult.brandTrustSafety.status,
    brand_trust_severity: scanResult.brandTrustSafety.severity || "none",
  };
}
