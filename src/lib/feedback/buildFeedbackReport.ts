import { publicAppConfig } from "@/lib/appConfig";
import type { ScanResult } from "@/lib/buildScanResult";

export type FeedbackIssueType =
  | "wrong_ingredient_match"
  | "missed_ingredient"
  | "confusing_warning"
  | "score_feels_wrong"
  | "barcode_data_wrong"
  | "ocr_text_wrong"
  | "allergy_warning_issue"
  | "app_bug"
  | "other_feedback";

export type BuildFeedbackReportInput = {
  issueType: FeedbackIssueType | string;
  productName?: string;
  brandName?: string;
  barcode?: string;
  scanMethod?: string;
  message?: string;
  ingredientText?: string;
  optionalContact?: string;
  topWarnings?: string[];
  exposureRisk?: number | null;
  scanResult?: ScanResult;
  browserDeviceInfo?: string;
  reportCreatedAt?: string;
};

function cleanValue(value?: string | null) {
  return value?.trim() ?? "";
}

function uniqueStrings(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = cleanValue(value);
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

function formatScanMethod(scanMethod?: string) {
  switch (scanMethod) {
    case "manual_paste":
      return "manual";
    case "camera_barcode":
      return "camera_barcode";
    case "barcode":
      return "barcode";
    case "ocr":
      return "ocr";
    case "demo":
      return "demo";
    default:
      return cleanValue(scanMethod) || "unknown";
  }
}

function detectBrowserName(userAgent: string) {
  if (/Edg\//i.test(userAgent)) {
    return "Edge";
  }

  if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)) {
    return "Chrome";
  }

  if (/Firefox\//i.test(userAgent)) {
    return "Firefox";
  }

  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    return "Safari";
  }

  return "Unknown browser";
}

export function getFeedbackEnvironmentSummary() {
  if (typeof navigator === "undefined") {
    return "";
  }

  const extendedNavigator = navigator as Navigator & {
    userAgentData?: {
      platform?: string;
    };
  };
  const browser = detectBrowserName(navigator.userAgent);
  const platform =
    cleanValue(extendedNavigator.userAgentData?.platform) ||
    cleanValue(navigator.platform) ||
    "Unknown device";
  const viewport =
    typeof window === "undefined"
      ? ""
      : `${window.innerWidth}x${window.innerHeight}`;

  return [browser, platform, viewport ? `viewport ${viewport}` : ""]
    .filter(Boolean)
    .join(" | ");
}

export function getFeedbackTopWarnings(scanResult: ScanResult, limit = 5) {
  const quickOverviewWarnings = scanResult.quickOverview
    .filter((row) => row.severity !== "green" && !row.isInformational)
    .slice(0, limit)
    .map(
      (row) =>
        `${row.label}: ${row.displayValue || row.severity} - ${row.shortMessage}`,
    );

  if (quickOverviewWarnings.length > 0) {
    return quickOverviewWarnings;
  }

  return scanResult.finalVerdict.mainReasons.slice(0, limit).map((reason) => {
    return `${reason.categoryName}: ${reason.message}`;
  });
}

export function buildFeedbackReport(input: BuildFeedbackReportInput) {
  const scanResult = input.scanResult;
  const productName =
    cleanValue(input.productName) ||
    cleanValue(scanResult?.productHero.productName) ||
    "Unknown product";
  const brandName =
    cleanValue(input.brandName) ||
    cleanValue(scanResult?.productHero.brandName) ||
    "Unknown brand";
  const barcode =
    cleanValue(input.barcode) || cleanValue(scanResult?.productHero.barcode);
  const scanMethod = formatScanMethod(
    cleanValue(input.scanMethod) || scanResult?.productHero.scanSource,
  );
  const message = cleanValue(input.message) || "No message provided.";
  const ingredientText = cleanValue(input.ingredientText);
  const optionalContact = cleanValue(input.optionalContact);
  const browserDeviceInfo =
    cleanValue(input.browserDeviceInfo) || getFeedbackEnvironmentSummary();
  const reportCreatedAt =
    cleanValue(input.reportCreatedAt) || new Date().toISOString();
  const ingredientLoad =
    typeof input.exposureRisk === "number"
      ? input.exposureRisk
      : scanResult?.ingredientLoad.score;
  const topWarnings = uniqueStrings(
    input.topWarnings && input.topWarnings.length > 0
      ? input.topWarnings
      : scanResult
        ? getFeedbackTopWarnings(scanResult)
        : [],
  );

  const lines = [
    "Truthlabel MVP Feedback Report",
    `Created: ${reportCreatedAt}`,
    "",
    `Issue type: ${cleanValue(input.issueType) || "other_feedback"}`,
    `Product name: ${productName}`,
    `Brand name: ${brandName}`,
    `Barcode: ${barcode || "Not provided"}`,
    `Scan method: ${scanMethod}`,
    `Ingredient Load: ${
      typeof ingredientLoad === "number" ? `${ingredientLoad} / 100` : "Not available"
    }`,
    `App version: ${publicAppConfig.appVersion || "Not set"}`,
    `Build date: ${publicAppConfig.buildDate || "Not set"}`,
    `Browser/device: ${browserDeviceInfo || "Not available"}`,
    "",
    "Tester message:",
    message,
  ];

  if (ingredientText) {
    lines.push("", "Ingredient text:", ingredientText);
  }

  if (topWarnings.length > 0) {
    lines.push("", "Top warnings shown:");
    topWarnings.forEach((warning, index) => {
      lines.push(`${index + 1}. ${warning}`);
    });
  }

  if (optionalContact) {
    lines.push("", `Optional contact: ${optionalContact}`);
  }

  lines.push(
    "",
    "Privacy note: Only share information you are comfortable sending.",
  );

  return lines.join("\n");
}
