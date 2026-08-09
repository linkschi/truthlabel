import type {
  ScanResult,
  ScanResultDeepExposureCheck,
  ScanResultMatchedItemDetail,
} from "@/lib/buildScanResult";
import {
  INGREDIENT_LOAD_REFERENCE,
  type IngredientLoadLevel,
} from "@/lib/calculateIngredientLoad";
import type { TruthlabelFinalVerdictCode } from "@/lib/buildEvidenceAwareFinalVerdict";
import type {
  DemoProductQuality,
  DemoScanCategory,
  DemoScanFinding,
  DemoScanRecord,
  DemoSeverity,
} from "@/lib/demoScanBuilder/demoScanTypes";

const qualityToIngredientLoadLevel: Record<DemoProductQuality, IngredientLoadLevel> = {
  Excellent: "Excellent Ingredient Score",
  Good: "Good Ingredient Score",
  Moderate: "Moderate Ingredient Score",
  Poor: "Poor Ingredient Score",
};

const severityToVerdictCode: Record<DemoSeverity, TruthlabelFinalVerdictCode> = {
  green: "clear",
  yellow: "moderate",
  red: "avoid",
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeDemoId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
}

function getVerdictLabel(severity: DemoSeverity) {
  if (severity === "green") {
    return "No major concerns";
  }

  if (severity === "yellow") {
    return "Consume in moderation";
  }

  return "Recommended to avoid";
}

function getRiskBand(severity: DemoSeverity) {
  if (severity === "green") {
    return "Low Risk / Clean Pass";
  }

  if (severity === "yellow") {
    return "Worth Reviewing";
  }

  return "Poor";
}

function buildMatchedItemDetail(
  finding: DemoScanFinding,
): ScanResultMatchedItemDetail {
  return {
    displayName: finding.name || "Demo finding",
    canonicalIngredientId: normalizeDemoId(finding.id || finding.name) || finding.id,
    severity: finding.severity,
    explanation: finding.explanation,
    userFacingReason:
      finding.explanation ||
      "Manual demo finding entered in the admin Demo Scan Builder.",
    restrictionRegions: [],
    restrictionReasons: [],
  };
}

function buildDeepExposureCheck(
  category: DemoScanCategory,
  index: number,
): ScanResultDeepExposureCheck {
  const categoryId =
    normalizeDemoId(category.id || category.name) || `demo_category_${index + 1}`;
  const matchedItemDetails = category.findings.map(buildMatchedItemDetail);
  const matchedItemsPreview = category.findings
    .map((finding) => finding.name.trim())
    .filter(Boolean)
    .slice(0, 5);
  const count =
    Number.isFinite(category.count) && category.count >= 0
      ? Math.round(category.count)
      : matchedItemDetails.length;

  return {
    categoryId: `demo_${categoryId}`,
    iconName: category.iconName,
    label: category.name || "Demo category",
    severity: category.severity,
    displayValue: category.statusLabel || "Yes",
    manualStatusLabel: category.statusLabel || "Yes",
    manualStatusTone: category.severity,
    reason: category.reason || category.message || "Manual demo category.",
    title: category.name || "Demo category",
    message:
      category.message ||
      category.reason ||
      "Manual demo category entered in the admin Demo Scan Builder.",
    action: category.action,
    shortMessage:
      category.reason ||
      category.message ||
      "Manual demo category entered in the admin Demo Scan Builder.",
    matchCount: count,
    matchedItemsPreview,
    matchedItemDetails,
    displayAllowed: true,
    status: "checked",
  };
}

export function buildDemoScanResult(record: DemoScanRecord): ScanResult {
  const ingredientScore = clampScore(record.ingredientScore);
  const verdictLabel = getVerdictLabel(record.verdictSeverity);
  const riskBand = getRiskBand(record.verdictSeverity);
  const deepExposureChecks = record.categories.map(buildDeepExposureCheck);
  const redChecks = deepExposureChecks.filter((check) => check.severity === "red");
  const yellowChecks = deepExposureChecks.filter(
    (check) => check.severity === "yellow",
  );
  const totalFindings = record.categories.reduce(
    (total, category) => total + category.findings.length,
    0,
  );
  const mainReasons = [...redChecks, ...yellowChecks].slice(0, 5).map((check) => ({
    categoryId: check.categoryId,
    categoryName: check.label,
    severity: check.severity ?? "yellow",
    reasonType:
      check.severity === "red" ? ("direct_red_ingredient" as const) : ("yellow_category" as const),
    message: check.reason || check.message,
    matchedItems: check.matchedItemsPreview,
  }));

  return {
    productHero: {
      productName: record.productName || "Demo product",
      brandName: record.brandName || "Demo brand",
      barcode: `DEMO-${record.id.slice(0, 8).toUpperCase()}`,
      productCategory: "Manual demo",
      exposureRisk: ingredientScore,
      riskBand,
      verdictLabel,
      verdictTone: record.verdictSeverity,
      scanSource: "demo",
      imageUrl: record.productImageDataUrl,
      imageSource: record.productImageDataUrl ? "sample_scan" : undefined,
      ingredientCount: totalFindings,
      ingredientLoadScore: ingredientScore,
      ingredientLoadLevel: qualityToIngredientLoadLevel[record.productQuality],
      ingredientLoadTone: record.verdictSeverity,
      ingredientLoadRawPoints: 0,
    },
    ingredientLoad: {
      rawLoad: 0,
      score: ingredientScore,
      referenceLoad: INGREDIENT_LOAD_REFERENCE,
      level: qualityToIngredientLoadLevel[record.productQuality],
      tone: record.verdictSeverity,
      message:
        "Manual admin demo score. No automatic ingredient scoring was run.",
      scoredIngredients: [],
    },
    quickOverview: [],
    ingredientBreakdown: {
      totalIngredients: totalFindings,
      naturalPositive: [],
      processedArtificial: [],
      unknownReview: [],
      matchedIngredients: [],
      unmatchedIngredients: [],
    },
    deepExposureChecks,
    additivesAndPreservatives: {
      overallSeverity: record.verdictSeverity,
      totalAdditiveMatches: totalFindings,
      groups: [],
      summaryMessage:
        "Manual demo data. Additive groups were not automatically calculated.",
    },
    brandTrustSafety: {
      status: "not_checked",
      severity: null,
      message: "Brand trust is controlled through manual demo categories here.",
      signals: [],
      lookupPerformed: false,
    },
    finalVerdict: {
      exposureRisk: ingredientScore,
      riskBand,
      verdictLabel,
      verdictTone: record.verdictSeverity,
      verdictCode: severityToVerdictCode[record.verdictSeverity],
      headline: record.finalHeadline || verdictLabel,
      opening: record.finalHeadline || verdictLabel,
      summary:
        record.finalSummary ||
        "Manual demo result created by an authorized Truthlabel admin.",
      totalRedCount: redChecks.length,
      seriousRedCount: redChecks.length,
      overloadRedCount: 0,
      yellowCount: yellowChecks.length,
      mainReasons,
      avoidWording:
        record.verdictSeverity === "red"
          ? ["This demo has been manually set to a red verdict."]
          : [],
      confidenceNotes: [
        "Internal demo data.",
        "Manual admin-created scan example.",
        "No real scanner, automatic detection, or product database update was used.",
      ],
    },
    confidenceNotes: [
      "Internal demo data.",
      "Manual admin-created scan example.",
      "No real scanner, automatic detection, or product database update was used.",
    ],
    debug: {
      sourceCount: 0,
      rawMatchCount: 0,
      categoryCount: record.categories.length,
      matchedIngredientCount: totalFindings,
      quickOverviewCount: 0,
      deepExposureCheckCount: deepExposureChecks.length,
      hiddenDeepExposureCheckCount: 0,
      uncheckedExternalChecks: [],
    },
  };
}
