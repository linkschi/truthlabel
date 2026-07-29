"use client";
/* eslint-disable @next/next/no-img-element */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { splitSavedAllergyProfile } from "@/components/manualScanScreenState";
import { SectionLabel } from "@/components/ResultUi";
import { publicAppConfig } from "@/lib/appConfig";
import { saveLatestBarcodeScan } from "@/lib/barcodeScanStorage";
import { saveLatestManualScan } from "@/lib/manualScanStorage";
import type { NormalizedProductForScan } from "@/lib/productDatabase/productDatabaseTypes";
import type { BarcodeScanLookupStatus } from "@/lib/runBarcodeScan";
import type { ManualScanInput } from "@/lib/runManualScan";
import { saveCompletedScanToHistory } from "@/lib/scanHistory/scanHistoryClient";
import {
  getSavedAllergyProfile,
  useUserSettings,
} from "@/lib/userSettings/userSettingsStorage";
import { trackTruthlabelEvent } from "@/lib/analytics/analyticsClient";
import {
  buildScanResultAnalytics,
  normalizeAnalyticsError,
} from "@/lib/analytics/analyticsEvents";
import type { CameraScannerBarcodeDetails } from "./CameraBarcodeScanner";

const CameraBarcodeScanner = dynamic(
  () => import("@/components/CameraBarcodeScanner"),
  {
    ssr: false,
    loading: () => (
      <ScannerOverlayLoading
        title="Opening barcode scanner"
        message="Preparing the camera barcode scanner on this device."
      />
    ),
  },
);

const formFieldClass =
  "mt-2 w-full rounded-[18px] border border-[#ddd6ca] bg-white/86 px-4 py-3 text-[14px] text-[#1f2d26] outline-none transition placeholder:text-[#8b8378] focus:border-[#bba88b] focus:bg-white";

const textAreaClass = `${formFieldClass} min-h-[150px] resize-y leading-6`;

const featureFlags = publicAppConfig.flags;
const barcodeLookupEnabled = featureFlags.enableBarcodeLookup;
const cameraBarcodeEnabled =
  featureFlags.enableBarcodeLookup && featureFlags.enableCameraBarcodeScan;

type RunBarcodeScanModule = typeof import("@/lib/runBarcodeScan");
type RunManualScanModule = typeof import("@/lib/runManualScan");

let barcodeScanModulePromise: Promise<RunBarcodeScanModule> | null = null;
let manualScanModulePromise: Promise<RunManualScanModule> | null = null;

type AnalysisStage = {
  label: string;
  tone: "green" | "yellow" | "red";
};

type AnalysisState = {
  status: "idle" | "running" | "complete" | "failed";
  stageIndex: number;
  imageUrl?: string;
};

const emptyAnalysisState: AnalysisState = {
  status: "idle",
  stageIndex: 0,
};

const analysisStages: AnalysisStage[] = [
  { label: "Reading product information", tone: "green" },
  { label: "Extracting ingredient data", tone: "green" },
  { label: "Matching known ingredients", tone: "green" },
  { label: "Checking the user's Allergy Watch List", tone: "green" },
  { label: "Reviewing concern categories", tone: "yellow" },
  { label: "Preparing the final results", tone: "red" },
];

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function saveHistoryWithoutBlocking(
  input: Parameters<typeof saveCompletedScanToHistory>[0],
) {
  void saveCompletedScanToHistory(input).catch(() => {
    // History should never block the completed scan result.
  });
}

function loadBarcodeScanModule() {
  if (!barcodeScanModulePromise) {
    barcodeScanModulePromise = import("@/lib/runBarcodeScan");
  }

  return barcodeScanModulePromise;
}

function loadManualScanModule() {
  if (!manualScanModulePromise) {
    manualScanModulePromise = import("@/lib/runManualScan");
  }

  return manualScanModulePromise;
}

function hasErrorName(error: unknown, expectedName: string) {
  return error instanceof Error && error.name === expectedName;
}

function ScannerOverlayLoading({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[rgba(18,24,21,0.74)] px-4 py-5 backdrop-blur-sm sm:px-5 sm:py-6">
      <div className="mx-auto flex h-full w-full max-w-[440px] flex-col justify-center rounded-[30px] border border-white/14 bg-[#102019] p-5 text-white shadow-[0_28px_60px_rgba(0,0,0,0.38)]">
        <div className="rounded-[24px] border border-white/14 bg-[rgba(255,255,255,0.06)] px-5 py-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/66">
            Truthlabel
          </p>
          <h2 className="mt-2 font-heading text-[1.3rem] font-semibold text-white">
            {title}
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-white/78">{message}</p>
        </div>
      </div>
    </div>
  );
}

function TruthlabelAnalysisLoader({ state }: { state: AnalysisState }) {
  const currentStage = analysisStages[state.stageIndex] ?? analysisStages[0];
  const isComplete = state.status === "complete";
  const isFailed = state.status === "failed";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 bg-[rgba(12,22,18,0.76)] px-4 py-5 backdrop-blur-sm sm:px-5 sm:py-6"
    >
      <div className="mx-auto flex h-full w-full max-w-[440px] flex-col justify-center rounded-[30px] border border-white/14 bg-[#102019] p-5 text-white shadow-[0_28px_60px_rgba(0,0,0,0.38)]">
        <div className="overflow-hidden rounded-[28px] border border-white/14 bg-[radial-gradient(circle_at_top,rgba(30,145,120,0.22),rgba(255,255,255,0.045)_46%,rgba(255,255,255,0.03)_100%)] px-5 py-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a7f3d0]">
            Truthlabel
          </p>
          <h2 className="mt-2 font-heading text-[1.45rem] font-semibold text-white">
            {isFailed ? "Analysis paused" : "Analyzing this product"}
          </h2>
          <p className="mx-auto mt-2 max-w-[300px] text-[14px] leading-6 text-white/78">
            {isFailed
              ? "The scan could not finish. You can review the label text and try again."
              : "Reading the product data and checking what is inside."}
          </p>

          <div className="relative mx-auto mt-6 h-[190px] w-full max-w-[320px]">
            <div className="truthlabel-analysis-ring absolute left-1/2 top-1/2 h-[154px] w-[154px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6ee7b7]/30" />
            <div className="truthlabel-analysis-data absolute left-4 top-8 rounded-full border border-[#6ee7b7]/26 bg-[#12372d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a7f3d0]">
              ingredients
            </div>
            <div className="truthlabel-analysis-data truthlabel-analysis-data-delayed absolute right-2 top-16 rounded-full border border-[#fcd34d]/28 bg-[#342a12] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#fde68a]">
              categories
            </div>
            <div className="truthlabel-analysis-data truthlabel-analysis-data-slow absolute bottom-8 left-8 rounded-full border border-[#6ee7b7]/22 bg-[#12372d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#bbf7d0]">
              labels
            </div>

            <div className="absolute left-1/2 top-1/2 h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[26px] border border-white/18 bg-[#0d241c] shadow-[0_24px_60px_rgba(16,185,129,0.16)]">
              {state.imageUrl ? (
                <img
                  src={state.imageUrl}
                  alt="Product or ingredient label preview"
                  className="h-full w-full object-cover opacity-88"
                />
              ) : (
                <div className="absolute inset-4 rounded-[18px] border border-white/18 bg-white/10 px-3 py-4">
                  <div className="h-2 rounded-full bg-white/62" />
                  <div className="mt-2 h-2 rounded-full bg-[#fcd34d]/82" />
                  <div className="mt-2 h-2 rounded-full bg-[#6ee7b7]/82" />
                  <div className="mt-4 h-8 rounded-[12px] border border-white/14 bg-white/8" />
                </div>
              )}
              <div className="truthlabel-analysis-scanline absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,#6ee7b7,transparent)] shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
            </div>

            {isComplete ? (
              <div className="truthlabel-complete-pop absolute bottom-4 right-9 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#86efac] bg-[#16a34a] text-white shadow-[0_0_24px_rgba(34,197,94,0.32)]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="h-5 w-5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.5 8.1 6.5 11 12.5 4.8"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.9"
                  />
                </svg>
              </div>
            ) : null}
          </div>

          <div className="mt-5 space-y-2 text-left">
            {analysisStages.map((stage, index) => {
              const isCurrent = index === state.stageIndex && state.status === "running";
              const isDone = isComplete || index < state.stageIndex;
              const isWarm = stage.tone === "yellow";
              const isHot = stage.tone === "red";

              return (
                <div
                  key={stage.label}
                  className={`grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[16px] border px-3 py-2.5 transition-colors ${
                    isCurrent
                      ? "border-[#6ee7b7]/42 bg-white/10"
                      : "border-white/10 bg-white/[0.045]"
                  }`}
                >
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                      isDone
                        ? "bg-[#16a34a] text-white"
                        : isCurrent && isHot
                          ? "bg-[#dc2626] text-white"
                          : isCurrent && isWarm
                            ? "bg-[#d97706] text-white"
                            : isCurrent
                              ? "truthlabel-current-dot bg-[#10b981] text-white"
                              : "bg-white/12 text-white/54"
                    }`}
                  >
                    {isDone ? "OK" : index + 1}
                  </span>
                  <span
                    className={`text-[13px] font-semibold ${
                      isDone || isCurrent ? "text-white" : "text-white/54"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-[11px] leading-5 text-white/56">
            This checks the product label data; it is not searching every scientific database.
          </p>
          <p className="mt-1 text-[11px] font-medium text-white/62">
            Current stage: {isComplete ? "Completed" : currentStage.label}
          </p>
        </div>
      </div>
    </div>
  );
}

type BarcodeFeedbackState = {
  status: BarcodeScanLookupStatus | "validation";
  message: string;
  dataQualityWarnings: string[];
  productData: NormalizedProductForScan | null;
};

function parseTypedAllergies(value: string) {
  return value
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildManualScanInput(args: {
  productName: string;
  brandName: string;
  productCategory: string;
  ingredientText: string;
  allergenStatement: string;
  packagingText: string;
  selectedAllergies: string[];
  customAllergiesText: string;
}): ManualScanInput {
  const combinedAllergies = [
    ...args.selectedAllergies,
    ...parseTypedAllergies(args.customAllergiesText),
  ];

  return {
    productName: args.productName,
    brandName: args.brandName,
    productCategory: args.productCategory,
    ingredientText: args.ingredientText,
    allergenStatement: args.allergenStatement,
    packagingText: args.packagingText,
    userAllergyProfile: Array.from(new Set(combinedAllergies)),
  };
}

function normalizeInitialScanMode(initialScanMode?: string) {
  return initialScanMode?.trim().toLowerCase() ?? "";
}

function isBarcodeCameraRequest(initialScanMode?: string) {
  const requestedMode = normalizeInitialScanMode(initialScanMode);

  return (
    requestedMode === "camera" ||
    requestedMode === "barcode-camera"
  );
}

function isIngredientsCameraRequest(initialScanMode?: string) {
  const requestedMode = normalizeInitialScanMode(initialScanMode);

  return (
    requestedMode === "ingredients" ||
    requestedMode === "ingredient" ||
    requestedMode === "ocr" ||
    requestedMode === "label"
  );
}

function shouldAutoOpenCameraScanner(initialScanMode?: string) {
  return isBarcodeCameraRequest(initialScanMode) && cameraBarcodeEnabled;
}

function buildInitialBarcodeFeedback(
  initialScanMode?: string,
): BarcodeFeedbackState | null {
  if (isBarcodeCameraRequest(initialScanMode) && !cameraBarcodeEnabled) {
    return {
      status: "error",
      message:
        "Camera barcode scanning is not available on this device. Type the barcode or paste the ingredient list manually.",
      dataQualityWarnings: [],
      productData: null,
    };
  }

  return null;
}

function buildInitialErrorMessage(initialScanMode?: string) {
  if (isIngredientsCameraRequest(initialScanMode)) {
    return "Ingredient photo scanning is not available yet. Type a barcode or paste the ingredient list manually.";
  }

  return "";
}

export default function ManualScanScreen({
  initialScanMode,
}: {
  initialScanMode?: string;
}) {
  const router = useRouter();
  const { user } = useTruthlabelAuth();
  const userSettings = useUserSettings();
  const [isPending, startTransition] = useTransition();
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(
    () => shouldAutoOpenCameraScanner(initialScanMode),
  );
  const [isLookingUpBarcode, setIsLookingUpBarcode] = useState(false);
  const [analysisState, setAnalysisState] =
    useState<AnalysisState>(emptyAnalysisState);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeFeedback, setBarcodeFeedback] =
    useState<BarcodeFeedbackState | null>(() =>
      buildInitialBarcodeFeedback(initialScanMode),
    );
  const [productName, setProductName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [productCategoryOverride, setProductCategoryOverride] =
    useState<string | null>(null);
  const [ingredientText, setIngredientText] = useState("");
  const [allergenStatement, setAllergenStatement] = useState("");
  const [packagingText, setPackagingText] = useState("");
  const [errorMessage, setErrorMessage] = useState(() =>
    buildInitialErrorMessage(initialScanMode),
  );
  const savedAllergyDefaults = useMemo(
    () => splitSavedAllergyProfile(getSavedAllergyProfile(userSettings)),
    [userSettings],
  );
  const productCategory =
    productCategoryOverride ??
    userSettings.scanPreferences.defaultProductCategory ??
    "General / Unknown";

  const selectedAllergySummary = useMemo(
    () =>
      Array.from(
        new Set([
          ...savedAllergyDefaults.selectedAllergies,
          ...parseTypedAllergies(savedAllergyDefaults.customAllergiesText),
        ]),
      ),
    [savedAllergyDefaults],
  );

  const barcodeDraftProduct =
    barcodeFeedback?.status === "found_missing_ingredients"
      ? barcodeFeedback.productData
      : null;
  const isAnalyzingProduct = analysisState.status !== "idle";

  async function lookupBarcodeValue(
    barcodeValue: string,
    options?: { capturedImageUrl?: string },
  ) {
    const barcodeSource = options?.capturedImageUrl ? "camera" : "typed";

    if (!barcodeLookupEnabled) {
      trackTruthlabelEvent(
        "barcode_lookup_failed",
        {
          source: barcodeSource,
          error_type: "feature_disabled",
        },
        { userId: user?.id },
      );
      setBarcodeFeedback({
        status: "error",
        message:
          "Barcode lookup is unavailable in this build. Paste the ingredient list manually instead.",
        dataQualityWarnings: [],
        productData: null,
      });
      return null;
    }

    setErrorMessage("");
    setIsLookingUpBarcode(true);
    setBarcodeFeedback(null);
    trackTruthlabelEvent(
      "barcode_scan_started",
      {
        source: barcodeSource,
        barcode_length: barcodeValue.replace(/\D/g, "").length,
      },
      { userId: user?.id },
    );

    try {
      const { runBarcodeScan } = await loadBarcodeScanModule();
      const result = await runBarcodeScan({
        barcode: barcodeValue,
        userAllergyProfile: selectedAllergySummary,
        capturedImageUrl: options?.capturedImageUrl,
      });

      if (result.lookupStatus === "found" && result.productData && result.scanResult) {
        trackTruthlabelEvent(
          "barcode_lookup_success",
          {
            source: barcodeSource,
            lookup_status: result.lookupStatus,
            warning_count: result.dataQualityWarnings.length,
            ...buildScanResultAnalytics(result.scanResult),
          },
          { userId: user?.id },
        );
        saveLatestBarcodeScan({
          input: {
            barcode: result.productData.barcode,
            userAllergyProfile: selectedAllergySummary,
          },
          lookupStatus: result.lookupStatus,
          productData: result.productData,
          result: result.scanResult,
          message: result.message,
          dataQualityWarnings: result.dataQualityWarnings,
          savedAt: new Date().toISOString(),
        });

        saveHistoryWithoutBlocking({
          scanResult: result.scanResult,
          ingredientText: result.productData.ingredientText,
          parsedIngredients: result.productData.ingredients,
          source: "product_database",
        });

        startTransition(() => {
          router.push("/app/results?barcode=latest&fresh=1");
        });
        return result;
      }

      setBarcodeFeedback({
        status: result.lookupStatus,
        message: result.message,
        dataQualityWarnings: result.dataQualityWarnings,
        productData: result.productData,
      });

      if (result.lookupStatus === "found_missing_ingredients" && result.productData) {
        trackTruthlabelEvent(
          "barcode_missing_ingredients",
          {
            source: barcodeSource,
            lookup_status: result.lookupStatus,
            warning_count: result.dataQualityWarnings.length,
            product_category: result.productData.productCategory || "unknown",
          },
          { userId: user?.id },
        );
        setProductName(result.productData.productName);
        setBrandName(result.productData.brandName);
        setProductCategoryOverride(result.productData.productCategory);
        setIngredientText("");
        setAllergenStatement(result.productData.allergenStatement);
        setPackagingText(result.productData.packagingText);
      } else if (result.lookupStatus === "not_found") {
        trackTruthlabelEvent(
          "barcode_no_product_found",
          {
            source: barcodeSource,
            lookup_status: result.lookupStatus,
          },
          { userId: user?.id },
        );
      } else if (result.lookupStatus === "error") {
        trackTruthlabelEvent(
          "barcode_lookup_failed",
          {
            source: barcodeSource,
            lookup_status: result.lookupStatus,
          },
          { userId: user?.id },
        );
      }

      return result;
    } catch (error) {
      trackTruthlabelEvent(
        "barcode_lookup_failed",
        {
          source: barcodeSource,
          error_type: normalizeAnalyticsError(error),
        },
        { userId: user?.id },
      );
      if (hasErrorName(error, "BarcodeValidationError")) {
        setBarcodeFeedback({
          status: "validation",
          message:
            error instanceof Error ? error.message : "Enter a valid product barcode.",
          dataQualityWarnings: [],
          productData: null,
        });
        return null;
      }

      setBarcodeFeedback({
        status: "error",
        message:
          "Product lookup failed. Check your connection or paste the ingredient list manually.",
        dataQualityWarnings: [],
        productData: null,
      });
      return null;
    } finally {
      setIsLookingUpBarcode(false);
    }
  }

  async function handleBarcodeLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await lookupBarcodeValue(barcodeInput);
  }

  async function handleCameraBarcodeDetected(
    barcode: string,
    details?: CameraScannerBarcodeDetails,
  ) {
    setBarcodeInput(barcode);
    trackTruthlabelEvent(
      "barcode_detected",
      {
        source: "camera",
        barcode_length: barcode.replace(/\D/g, "").length,
        has_captured_image: Boolean(details?.capturedImageUrl),
      },
      { userId: user?.id },
    );

    const result = await lookupBarcodeValue(barcode, {
      capturedImageUrl: details?.capturedImageUrl,
    });

    if (result?.lookupStatus === "found") {
      setIsCameraScannerOpen(false);
    }

    return result;
  }

  async function moveAnalysisToStage(stageIndex: number, imageUrl?: string) {
    setAnalysisState((current) => ({
      status: "running",
      stageIndex,
      imageUrl: imageUrl ?? current.imageUrl,
    }));
    await wait(85);
  }

  async function completeAnalysis(startedAt: number, imageUrl?: string) {
    setAnalysisState((current) => ({
      status: "running",
      stageIndex: analysisStages.length - 1,
      imageUrl: imageUrl ?? current.imageUrl,
    }));

    const elapsed = window.performance.now() - startedAt;
    const remainingMinimum = Math.max(0, 900 - elapsed);

    if (remainingMinimum > 0) {
      await wait(remainingMinimum);
    }

    setAnalysisState((current) => ({
      status: "complete",
      stageIndex: analysisStages.length - 1,
      imageUrl: imageUrl ?? current.imageUrl,
    }));
    await wait(240);
  }

  async function failAnalysis(imageUrl?: string) {
    setAnalysisState((current) => ({
      status: "failed",
      stageIndex: current.stageIndex,
      imageUrl: imageUrl ?? current.imageUrl,
    }));
    await wait(520);
    setAnalysisState(emptyAnalysisState);
  }

  async function runConfirmedIngredientScan(options?: {
    ingredientTextOverride?: string;
    allergenStatementOverride?: string;
    scanSource?: "manual_paste" | "barcode" | "ocr";
    capturedImageUrl?: string;
    additionalConfidenceNotes?: string[];
  }) {
    setErrorMessage("");
    const scanSource =
      options?.scanSource ?? (barcodeDraftProduct ? "barcode" : "manual_paste");
    trackTruthlabelEvent(
      "manual_scan_started",
      {
        scan_source: scanSource,
        has_product_name: Boolean(productName.trim()),
        has_brand_name: Boolean(brandName.trim()),
        has_barcode_draft: Boolean(barcodeDraftProduct),
      },
      { userId: user?.id },
    );

    const input = buildManualScanInput({
      productName,
      brandName,
      productCategory,
      ingredientText: options?.ingredientTextOverride ?? ingredientText,
      allergenStatement:
        options?.allergenStatementOverride ?? allergenStatement,
      packagingText,
      selectedAllergies: savedAllergyDefaults.selectedAllergies,
      customAllergiesText: savedAllergyDefaults.customAllergiesText,
    });

    const productImageUrl =
      barcodeDraftProduct?.imageUrl || options?.capturedImageUrl || undefined;
    const startedAt = window.performance.now();
    setAnalysisState({
      status: "running",
      stageIndex: 0,
      imageUrl: productImageUrl,
    });

    try {
      await moveAnalysisToStage(1, productImageUrl);

      const [{ runManualScan }, barcodeScanModule] = await Promise.all([
        loadManualScanModule(),
        barcodeDraftProduct ? loadBarcodeScanModule() : Promise.resolve(null),
      ]);

      await moveAnalysisToStage(2, productImageUrl);
      await moveAnalysisToStage(3, productImageUrl);

      const result = runManualScan({
        ...input,
        barcode: barcodeDraftProduct?.barcode,
        packagingText: barcodeDraftProduct?.packagingText || input.packagingText,
        allergenStatement:
          options?.allergenStatementOverride ||
          barcodeDraftProduct?.allergenStatement ||
          input.allergenStatement,
        externalSignals: barcodeDraftProduct?.externalSignals,
        scanSource,
        productImageUrl,
        productImageSource: barcodeDraftProduct?.imageUrl
          ? "product_database"
          : options?.capturedImageUrl
            ? "captured_scan"
            : undefined,
        additionalConfidenceNotes: options?.additionalConfidenceNotes ?? [],
      });

      await moveAnalysisToStage(4, productImageUrl);

      const finalResult =
        barcodeDraftProduct && barcodeScanModule
          ? barcodeScanModule.applyBarcodeConfidenceNotes(result, barcodeDraftProduct)
          : result;

      await completeAnalysis(startedAt, productImageUrl);

      if (
        barcodeDraftProduct &&
        scanSource === "barcode"
      ) {
        trackTruthlabelEvent(
          "manual_scan_success",
          {
            ...buildScanResultAnalytics(finalResult),
            completed_from: "barcode_missing_ingredients",
          },
          { userId: user?.id },
        );
        saveLatestBarcodeScan({
          input: {
            barcode: barcodeDraftProduct.barcode,
            userAllergyProfile: input.userAllergyProfile,
          },
          lookupStatus: "found",
          productData: barcodeDraftProduct,
          result: finalResult,
          message: "Product found. Truthlabel scanned the available ingredient data.",
          dataQualityWarnings: barcodeDraftProduct.dataQualityWarnings,
          savedAt: new Date().toISOString(),
        });

        saveHistoryWithoutBlocking({
          scanResult: finalResult,
          ingredientText: barcodeDraftProduct.ingredientText,
          parsedIngredients: barcodeDraftProduct.ingredients,
          source: "product_database",
        });

        startTransition(() => {
          router.push("/app/results?barcode=latest&fresh=1");
        });
        return;
      }

      saveLatestManualScan({
        input: {
          ...input,
          barcode: barcodeDraftProduct?.barcode,
          packagingText: barcodeDraftProduct?.packagingText || input.packagingText,
          allergenStatement:
            options?.allergenStatementOverride ||
            barcodeDraftProduct?.allergenStatement ||
            input.allergenStatement,
          externalSignals: barcodeDraftProduct?.externalSignals,
          scanSource,
          productImageUrl,
          productImageSource: barcodeDraftProduct?.imageUrl
            ? "product_database"
            : options?.capturedImageUrl
              ? "captured_scan"
              : undefined,
          additionalConfidenceNotes: options?.additionalConfidenceNotes ?? [],
        },
        result: finalResult,
        savedAt: new Date().toISOString(),
      });

      trackTruthlabelEvent(
        "manual_scan_success",
        buildScanResultAnalytics(finalResult),
        { userId: user?.id },
      );
      saveHistoryWithoutBlocking({
        scanResult: finalResult,
        ingredientText: input.ingredientText,
        source: scanSource,
      });

      startTransition(() => {
        router.push("/app/results?manual=latest&fresh=1");
      });
    } catch (error) {
      trackTruthlabelEvent(
        "manual_scan_failed",
        {
          scan_source: scanSource,
          error_type: normalizeAnalyticsError(error),
        },
        { userId: user?.id },
      );
      await failAnalysis(productImageUrl);
      throw error;
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await runConfirmedIngredientScan();
    } catch (error) {
      if (hasErrorName(error, "ManualScanValidationError")) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Please paste the ingredient list so Truthlabel can scan the product.",
        );
        return;
      }

      setErrorMessage("We could not read this label yet. Please review the pasted text and try again.");
    }
  }

  function handleOpenCameraScanner() {
    setErrorMessage("");

    if (!cameraBarcodeEnabled) {
      setBarcodeFeedback({
        status: "error",
        message:
          "Camera barcode scanning is not available on this device. Type the barcode instead.",
        dataQualityWarnings: [],
        productData: null,
      });
      return;
    }

    setIsCameraScannerOpen(true);
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-5 sm:py-6">
      {isCameraScannerOpen ? (
        <CameraBarcodeScanner
          initialMode="barcode"
          onBarcodeDetected={handleCameraBarcodeDetected}
          onManualEntry={() => setIsCameraScannerOpen(false)}
          onClose={() => setIsCameraScannerOpen(false)}
        />
      ) : null}
      {analysisState.status !== "idle" ? (
        <TruthlabelAnalysisLoader state={analysisState} />
      ) : null}

      <div className="mx-auto max-w-[440px] space-y-4">
        <header className="flex items-center justify-between gap-4 px-1 py-1">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6d4f]">
              Truthlabel
            </p>
            <h1 className="mt-1 font-heading text-[1.75rem] font-semibold text-[#17251f]">
              Scan product
            </h1>
            <p className="mt-1 text-[14px] leading-5 text-[#58665e]">
              Barcode or ingredients. That&apos;s it.
            </p>
          </div>
          <Link
            href="/app/account"
            className="rounded-full border border-[#dbe8df] bg-white px-4 py-2 text-[12px] font-bold text-[#0e5a3f] shadow-[0_8px_20px_rgba(15,40,28,0.06)]"
          >
            Account
          </Link>
        </header>

        <section className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleOpenCameraScanner}
            className="group min-h-[118px] rounded-[24px] border border-[#0e5a3f] bg-[#0e5a3f] px-3.5 py-4 text-left text-white shadow-[0_16px_34px_rgba(14,90,63,0.18)] transition active:scale-[0.99]"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[15px] bg-white/14">
              <span className="text-[19px]" aria-hidden>
                ||
              </span>
            </span>
            <span className="mt-3 block text-[15px] font-black leading-tight">
              Scan barcode
            </span>
            <span className="mt-1 block text-[12px] font-medium text-white/76">
              Use camera
            </span>
          </button>

          <a
            href="#manual-ingredients"
            className="min-h-[118px] rounded-[24px] border border-[#d9e8df] bg-white px-3.5 py-4 text-left text-[#17251f] shadow-[0_10px_26px_rgba(15,40,28,0.07)] transition active:scale-[0.99]"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[15px] bg-[#eef7f1] text-[#0e5a3f]">
              <span className="text-[18px]" aria-hidden>
                TXT
              </span>
            </span>
            <span className="mt-3 block text-[15px] font-black leading-tight">
              Manual ingredients
            </span>
            <span className="mt-1 block text-[12px] font-medium text-[#68756d]">
              Paste label text
            </span>
          </a>
        </section>

        {barcodeLookupEnabled ? (
          <section className="rounded-[28px] border border-[#d9e8df] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,40,28,0.07)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <SectionLabel>Barcode</SectionLabel>
                <h2 className="mt-1 text-[19px] font-black text-[#17251f]">
                  Scan or type the barcode
                </h2>
              </div>
              <button
                type="button"
                onClick={handleOpenCameraScanner}
                className="rounded-full bg-[#0e5a3f] px-4 py-2 text-[12px] font-bold text-white"
              >
                Camera
              </button>
            </div>

            <form onSubmit={handleBarcodeLookup} className="mt-4">
              <label className="block">
                <span className="sr-only">Product barcode</span>
                <input
                  value={barcodeInput}
                  onChange={(event) => setBarcodeInput(event.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  className={formFieldClass}
                  placeholder="Enter barcode number"
                />
              </label>
              <button
                type="submit"
                disabled={isLookingUpBarcode || isPending || isAnalyzingProduct}
                className="mt-3 min-h-12 w-full rounded-[18px] bg-[#182b22] px-4 text-[13px] font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(24,43,34,0.16)] disabled:cursor-wait disabled:opacity-70"
              >
                {isLookingUpBarcode ? "Looking up..." : "Lookup barcode"}
              </button>
            </form>

            {barcodeFeedback ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-4 rounded-[20px] border border-[#e7decf] bg-[#fbf8f1] px-4 py-3"
              >
                <p className="text-[12px] font-black text-[#17251f]">
                  {barcodeFeedback.status === "found_missing_ingredients"
                    ? "Product found"
                    : barcodeFeedback.status === "not_found"
                      ? "Product not found"
                      : barcodeFeedback.status === "validation"
                        ? "Check barcode"
                        : "Lookup failed"}
                </p>
                <p className="mt-1 text-[13px] leading-5 text-[#55645c]">
                  {barcodeFeedback.message}
                </p>

                {barcodeFeedback.productData ? (
                  <p className="mt-2 text-[12px] font-semibold text-[#33443c]">
                    {barcodeFeedback.productData.brandName
                      ? `${barcodeFeedback.productData.brandName} - `
                      : ""}
                    {barcodeFeedback.productData.productName}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        <form
          id="manual-ingredients"
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-[#d9e8df] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,40,28,0.07)]"
        >
          <div>
            <SectionLabel>Manual ingredients</SectionLabel>
            <h2 className="mt-1 text-[19px] font-black text-[#17251f]">
              Paste the ingredient list
            </h2>
          </div>

          {barcodeDraftProduct ? (
            <div className="mt-4 rounded-[18px] border border-[#d9e8df] bg-[#eef7f1] px-4 py-3">
              <p className="text-[13px] font-bold text-[#0e5a3f]">
                Product found. Paste ingredients to finish.
              </p>
              <p className="mt-1 text-[12px] text-[#55645c]">
                Barcode: {barcodeDraftProduct.barcode}
              </p>
            </div>
          ) : null}

          {errorMessage ? (
            <div
              role="alert"
              className="mt-4 rounded-[18px] border border-[#e7d7d4] bg-[#f7ecea] px-4 py-3 text-[13px] leading-5 text-[#6b4d49]"
            >
              {errorMessage}
            </div>
          ) : null}

          <label className="mt-4 block">
            <span className="sr-only">Ingredient list</span>
            <textarea
              value={ingredientText}
              onChange={(event) => setIngredientText(event.target.value)}
              className={textAreaClass}
              placeholder="Paste ingredients here..."
            />
          </label>

          <button
            type="submit"
            disabled={isPending || isAnalyzingProduct}
            className="mt-3 min-h-12 w-full rounded-[18px] bg-[#182b22] px-4 text-[13px] font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(24,43,34,0.16)] disabled:cursor-wait disabled:opacity-70"
          >
            {isAnalyzingProduct
              ? "Analyzing..."
              : isPending
                ? "Scanning..."
                : "Scan ingredients"}
          </button>
        </form>
      </div>
    </main>
  );
}
