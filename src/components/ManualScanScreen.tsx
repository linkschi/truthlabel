"use client";
/* eslint-disable @next/next/no-img-element */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import AppMenu from "@/components/AppMenu";
import {
  getNextSelectedAllergiesOverride,
  splitSavedAllergyProfile,
} from "@/components/manualScanScreenState";
import { SectionLabel } from "@/components/ResultUi";
import { categoryProfiles } from "@/data/categoryProfiles";
import { getDemoProductById } from "@/data/demoProducts";
import { publicAppConfig } from "@/lib/appConfig";
import { saveLatestBarcodeScan } from "@/lib/barcodeScanStorage";
import { saveLatestManualScan } from "@/lib/manualScanStorage";
import type { NormalizedProductForScan } from "@/lib/productDatabase/productDatabaseTypes";
import type { BarcodeScanLookupStatus } from "@/lib/runBarcodeScan";
import type { ManualScanInput } from "@/lib/runManualScan";
import {
  getSavedAllergyProfile,
  useUserSettings,
} from "@/lib/userSettings/userSettingsStorage";
import type { CameraScannerMode } from "./CameraBarcodeScanner";
import type { OcrConfirmedDetails } from "./OcrIngredientScanner";

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

const OcrIngredientScanner = dynamic(
  () => import("@/components/OcrIngredientScanner"),
  {
    ssr: false,
    loading: () => (
      <ScannerOverlayLoading
        title="Opening OCR scanner"
        message="Preparing the ingredient-label scanner on this device."
      />
    ),
  },
);

const manualAllergyOptions = [
  "Milk",
  "Egg",
  "Peanut",
  "Tree nuts",
  "Wheat / gluten",
  "Soy",
  "Fish",
  "Crustacean shellfish",
  "Sesame",
  "Mustard",
  "Celery",
  "Lupin",
  "Molluscs",
  "Sulphites",
] as const;

const manualCategoryOptions = categoryProfiles.map((profile) => profile.label);

const manualExampleIds = [
  "simple-rolled-oats",
  "red-berry-soda",
  "zero-sugar-citrus-drink",
  "shelf-stable-sauce",
  "chocolate-milk-drink",
] as const;

const manualQuickFillExamples = manualExampleIds.map((id) => {
  const product = getDemoProductById(id);

  return {
    id,
    label: product.productName,
    productName: product.productName,
    brandName: product.brandName,
    productCategory: product.productCategory,
    ingredientText:
      id === "simple-rolled-oats" ? "Rolled oats" : product.ingredients.join(", "),
    allergenStatement: product.allergenStatement,
    packagingText: product.packagingText,
    allergyProfile:
      product.id === "chocolate-milk-drink" ? ["Milk"] : ([] as string[]),
  };
});

const formFieldClass =
  "mt-2 w-full rounded-[18px] border border-[#ddd6ca] bg-white/86 px-4 py-3 text-[14px] text-[#1f2d26] outline-none transition placeholder:text-[#8b8378] focus:border-[#bba88b] focus:bg-white";

const textAreaClass = `${formFieldClass} min-h-[120px] resize-y`;

const featureFlags = publicAppConfig.flags;
const barcodeLookupEnabled = featureFlags.enableBarcodeLookup;
const cameraBarcodeEnabled =
  featureFlags.enableBarcodeLookup && featureFlags.enableCameraBarcodeScan;
const ocrEnabled = featureFlags.enableOcrScan;
const demoProductsEnabled = featureFlags.enableDemoProducts;

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

function uniqueStrings(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

function parseTypedAllergies(value: string) {
  return value
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildOcrConfidenceNotes(details?: OcrConfirmedDetails) {
  return uniqueStrings([
    "OCR text may contain mistakes. Check the ingredient list against the package label.",
    details?.possibleAllergenStatement
      ? "Allergen statements should be checked manually on the package."
      : null,
    ...(details?.confidenceWarnings ?? []),
  ]);
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
    requestedMode === "barcode" ||
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

function getInitialCameraScannerMode(
  initialScanMode?: string,
): CameraScannerMode {
  return isIngredientsCameraRequest(initialScanMode) ? "ingredients" : "barcode";
}

function shouldAutoOpenCameraScanner(initialScanMode?: string) {
  if (isBarcodeCameraRequest(initialScanMode)) {
    return cameraBarcodeEnabled;
  }

  if (isIngredientsCameraRequest(initialScanMode)) {
    return ocrEnabled;
  }

  return false;
}

function buildInitialBarcodeFeedback(
  initialScanMode?: string,
): BarcodeFeedbackState | null {
  if (isBarcodeCameraRequest(initialScanMode) && !cameraBarcodeEnabled) {
    return {
      status: "error",
      message:
        "Camera barcode scanning is unavailable in this build. Type the barcode or paste the ingredient list manually instead.",
      dataQualityWarnings: [],
      productData: null,
    };
  }

  return null;
}

function buildInitialErrorMessage(initialScanMode?: string) {
  if (isIngredientsCameraRequest(initialScanMode) && !ocrEnabled) {
    return "Ingredient label scanning is unavailable in this build. Paste the ingredient list manually instead.";
  }

  return "";
}

export default function ManualScanScreen({
  initialScanMode,
  scannerDebug = false,
}: {
  initialScanMode?: string;
  scannerDebug?: boolean;
}) {
  const router = useRouter();
  const userSettings = useUserSettings();
  const [isPending, startTransition] = useTransition();
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(
    () => shouldAutoOpenCameraScanner(initialScanMode),
  );
  const [isOcrScannerOpen, setIsOcrScannerOpen] = useState(false);
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
  const [selectedAllergiesOverride, setSelectedAllergiesOverride] =
    useState<string[] | null>(null);
  const [customAllergiesTextOverride, setCustomAllergiesTextOverride] =
    useState<string | null>(null);
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
  const selectedAllergies =
    selectedAllergiesOverride ?? savedAllergyDefaults.selectedAllergies;
  const customAllergiesText =
    customAllergiesTextOverride ?? savedAllergyDefaults.customAllergiesText;

  const selectedAllergySummary = useMemo(
    () =>
      Array.from(
        new Set([
          ...selectedAllergies,
          ...parseTypedAllergies(customAllergiesText),
        ]),
      ),
    [customAllergiesText, selectedAllergies],
  );

  const barcodeDraftProduct =
    barcodeFeedback?.status === "found_missing_ingredients"
      ? barcodeFeedback.productData
      : null;
  const isAnalyzingProduct = analysisState.status !== "idle";

  function applyQuickFill(exampleId: (typeof manualExampleIds)[number]) {
    const example = manualQuickFillExamples.find((entry) => entry.id === exampleId);

    if (!example) {
      return;
    }

    setProductName(example.productName);
    setBrandName(example.brandName);
    setProductCategoryOverride(example.productCategory);
    setIngredientText(example.ingredientText);
    setAllergenStatement(example.allergenStatement);
    setPackagingText(example.packagingText);
    setSelectedAllergiesOverride(example.allergyProfile);
    setCustomAllergiesTextOverride("");
    setErrorMessage("");
    setBarcodeFeedback(null);
    setBarcodeInput("");
  }

  async function lookupBarcodeValue(
    barcodeValue: string,
    options?: { capturedImageUrl?: string },
  ) {
    if (!barcodeLookupEnabled) {
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

    try {
      const { runBarcodeScan } = await loadBarcodeScanModule();
      const result = await runBarcodeScan({
        barcode: barcodeValue,
        userAllergyProfile: selectedAllergySummary,
        capturedImageUrl: options?.capturedImageUrl,
      });

      if (result.lookupStatus === "found" && result.productData && result.scanResult) {
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

        startTransition(() => {
          router.push("/product?barcode=latest&fresh=1");
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
        setProductName(result.productData.productName);
        setBrandName(result.productData.brandName);
        setProductCategoryOverride(result.productData.productCategory);
        setIngredientText("");
        setAllergenStatement(result.productData.allergenStatement);
        setPackagingText(result.productData.packagingText);
      }

      return result;
    } catch (error) {
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
    details?: { capturedImageUrl?: string },
  ) {
    setBarcodeInput(barcode);
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

    const input = buildManualScanInput({
      productName,
      brandName,
      productCategory,
      ingredientText: options?.ingredientTextOverride ?? ingredientText,
      allergenStatement:
        options?.allergenStatementOverride ?? allergenStatement,
      packagingText,
      selectedAllergies,
      customAllergiesText,
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
        scanSource:
          options?.scanSource ?? (barcodeDraftProduct ? "barcode" : "manual_paste"),
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
        (options?.scanSource ?? "barcode") === "barcode"
      ) {
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

        startTransition(() => {
          router.push("/product?barcode=latest&fresh=1");
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
          scanSource:
            options?.scanSource ?? (barcodeDraftProduct ? "barcode" : "manual_paste"),
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

      startTransition(() => {
        router.push("/product?manual=latest&fresh=1");
      });
    } catch (error) {
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

  async function handleOcrTextConfirmed(
    extractedIngredientText: string,
    details?: OcrConfirmedDetails,
  ) {
    setIngredientText(extractedIngredientText);
    if (details?.possibleAllergenStatement) {
      setAllergenStatement(details.possibleAllergenStatement);
    }

    try {
      await runConfirmedIngredientScan({
        ingredientTextOverride: extractedIngredientText,
        allergenStatementOverride: details?.possibleAllergenStatement,
        scanSource: "ocr",
        capturedImageUrl: details?.capturedImageUrl,
        additionalConfidenceNotes: buildOcrConfidenceNotes(details),
      });
      setIsOcrScannerOpen(false);
      setIsCameraScannerOpen(false);
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

  return (
    <main className="min-h-screen px-4 py-5 sm:px-5 sm:py-6">
      {isCameraScannerOpen ? (
        <CameraBarcodeScanner
          initialMode={getInitialCameraScannerMode(initialScanMode)}
          onBarcodeDetected={handleCameraBarcodeDetected}
          onTextConfirmed={ocrEnabled ? handleOcrTextConfirmed : undefined}
          onManualEntry={() => setIsCameraScannerOpen(false)}
          onClose={() => setIsCameraScannerOpen(false)}
          debugDiagnostics={scannerDebug}
        />
      ) : null}
      {isOcrScannerOpen ? (
        <OcrIngredientScanner
          onTextConfirmed={handleOcrTextConfirmed}
          onClose={() => setIsOcrScannerOpen(false)}
        />
      ) : null}
      {analysisState.status !== "idle" ? (
        <TruthlabelAnalysisLoader state={analysisState} />
      ) : null}

      <div className="mx-auto max-w-[440px] space-y-4">
        <header className="flex items-start justify-between gap-4 px-1 py-1">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6d4f]">
              Truthlabel
            </p>
            <h1 className="mt-1 font-heading text-[1.7rem] font-semibold text-[#17251f]">
              Scan
            </h1>
            <p className="mt-2 max-w-sm text-[14px] leading-5 text-[#58665e]">
              {barcodeLookupEnabled
                ? "Type a barcode or paste a real product label and run it through the current Truthlabel engine."
                : "Paste a real product label and run it through the current Truthlabel engine."}
            </p>
            <p className="mt-1 text-[13px] font-medium text-[#7a705c]">
              {barcodeLookupEnabled
                ? "Barcode lookup is live. Ingredient list still gives the strongest result."
                : "Ingredient list still gives the strongest result in this build."}
            </p>
          </div>
          <AppMenu />
        </header>

        <section className="rounded-[24px] border border-white/72 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]">
          <SectionLabel>Trust note</SectionLabel>
          <p className="mt-1.5 text-[13px] leading-5 text-[#55645c]">
            Truthlabel helps explain ingredient labels and safety signals. It is not medical advice. Always check the product label, especially for allergies.
          </p>
        </section>

        {demoProductsEnabled ? (
        <section className="rounded-[28px] border border-white/75 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Quick fill</SectionLabel>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#66756d]">
              Real label tests
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {manualQuickFillExamples.map((example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => applyQuickFill(example.id)}
                className="rounded-full border border-[#ddd6ca] bg-white/78 px-3 py-1.5 text-[12px] font-medium text-[#33443c] transition hover:border-[#c4b493] hover:bg-[#fbf6ed]"
              >
                {example.label}
              </button>
            ))}
          </div>
        </section>
        ) : null}

        {barcodeLookupEnabled ? (
        <section className="rounded-[28px] border border-white/75 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Barcode lookup</SectionLabel>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#66756d]">
              Open Food Facts
            </p>
          </div>
          <p className="mt-1.5 text-[14px] leading-5 text-[#55645c]">
            Type a barcode to fetch product data, then let Truthlabel scan the available ingredient list.
          </p>
          <p className="mt-2 text-[12px] leading-5 text-[#6a776f]">
            Product database data may be incomplete or user-submitted. Check the package label if something looks missing.
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {cameraBarcodeEnabled ? (
              <button
                type="button"
                disabled={isLookingUpBarcode || isPending || isAnalyzingProduct}
                onClick={() => {
                  setBarcodeFeedback(null);
                  setIsCameraScannerOpen(true);
                }}
                className="rounded-full border border-[#ddd4c3] bg-white/82 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#22342c] transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
              >
                {isLookingUpBarcode ? "Looking up..." : "Scan Barcode"}
              </button>
            ) : null}
            <span className="inline-flex items-center rounded-full border border-[#e7decf] bg-[#faf7f0] px-3 py-2 text-[11px] font-medium text-[#6c6a5f]">
              {cameraBarcodeEnabled
                ? "Camera access is only used to read the barcode."
                : "You can still type the barcode manually if camera scan is unavailable."}
            </span>
          </div>

          {isLookingUpBarcode ? (
            <p
              role="status"
              aria-live="polite"
              className="mt-3 text-[12px] leading-5 text-[#6a776f]"
            >
              Looking up the product database and checking the available ingredient data.
            </p>
          ) : null}

          <form onSubmit={handleBarcodeLookup} className="mt-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
              <label className="min-w-0 flex-1">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#445047]">
                  Product barcode
                </span>
                <input
                  value={barcodeInput}
                  onChange={(event) => setBarcodeInput(event.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  className={formFieldClass}
                  placeholder="0123456789012"
                />
              </label>
              <button
                type="submit"
                disabled={isLookingUpBarcode || isPending || isAnalyzingProduct}
                className="rounded-full border border-transparent bg-[#182b22] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_36px_rgba(24,43,34,0.18)] transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
              >
                {isLookingUpBarcode ? "Looking up..." : "Lookup"}
              </button>
            </div>
          </form>

          {barcodeFeedback ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 rounded-[20px] border border-[#e7decf] bg-white/78 px-4 py-3.5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c6d4f]">
                {barcodeFeedback.status === "found_missing_ingredients"
                  ? "Barcode product found"
                  : barcodeFeedback.status === "not_found"
                    ? "Product not found"
                    : barcodeFeedback.status === "validation"
                      ? "Check the barcode"
                      : "Lookup status"}
              </p>
              <p className="mt-1.5 text-[13px] leading-5 text-[#49584f]">
                {barcodeFeedback.message}
              </p>

              {barcodeFeedback.productData ? (
                <div className="mt-3 grid gap-1 text-[12px] leading-5 text-[#5a6960]">
                  <p>
                    <span className="font-semibold text-[#33443c]">Product:</span>{" "}
                    {barcodeFeedback.productData.productName}
                  </p>
                  <p>
                    <span className="font-semibold text-[#33443c]">Brand:</span>{" "}
                    {barcodeFeedback.productData.brandName}
                  </p>
                  <p>
                    <span className="font-semibold text-[#33443c]">Barcode:</span>{" "}
                    {barcodeFeedback.productData.barcode}
                  </p>
                </div>
              ) : null}

              {barcodeFeedback.dataQualityWarnings.length > 0 ? (
                <ul className="mt-3 space-y-1.5 text-[12px] leading-5 text-[#5a6960]">
                  {barcodeFeedback.dataQualityWarnings.map((warning) => (
                    <li key={warning}>- {warning}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-white/75 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]"
        >
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Paste label</SectionLabel>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#66756d]">
              {barcodeDraftProduct ? "Complete barcode scan" : "Manual input"}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {ocrEnabled ? (
              <button
                type="button"
                disabled={isAnalyzingProduct || isPending}
                onClick={() => {
                  setErrorMessage("");
                  setIsOcrScannerOpen(true);
                }}
                className="rounded-full border border-[#ddd4c3] bg-white/82 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#22342c] transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
              >
                Scan Ingredient Label
              </button>
            ) : null}
            <span className="inline-flex items-center rounded-full border border-[#e7decf] bg-[#faf7f0] px-3 py-2 text-[11px] font-medium text-[#6c6a5f]">
              {ocrEnabled
                ? "OCR is review-first. You can edit the text before scanning."
                : "Paste the ingredient list manually when OCR is unavailable in this build."}
            </span>
          </div>

          {barcodeDraftProduct ? (
            <div className="mt-4 rounded-[18px] border border-[#e7decf] bg-white/78 px-4 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7c6d4f]">
                Complete this barcode scan
              </p>
              <p className="mt-1.5 text-[13px] leading-5 text-[#55645c]">
                The product record was found, but the ingredient list was missing. Paste the label below to finish the scan while keeping the saved product details.
              </p>
              <p className="mt-2 text-[12px] leading-5 text-[#5a6960]">
                Barcode: {barcodeDraftProduct.barcode}
              </p>
            </div>
          ) : null}

          {errorMessage ? (
            <div
              role="alert"
              className="mt-4 rounded-[18px] border border-[#e7d7d4] bg-[#f7ecea] px-4 py-3"
            >
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8f615e]">
                Check the input
              </p>
              <p className="mt-1.5 text-[13px] leading-5 text-[#6b4d49]">
                {errorMessage}
              </p>
            </div>
          ) : null}

          <div className="mt-4 grid gap-4">
            {barcodeDraftProduct ? (
              <label className="block">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#445047]">
                  Barcode
                </span>
                <input
                  value={barcodeDraftProduct.barcode}
                  readOnly
                  className={`${formFieldClass} cursor-default bg-[#f8f3ea] text-[#596860]`}
                />
              </label>
            ) : null}

            <label className="block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#445047]">
                Product name
              </span>
              <input
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                className={formFieldClass}
                placeholder="Unknown product"
              />
            </label>

            <label className="block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#445047]">
                Brand name
              </span>
              <input
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                className={formFieldClass}
                placeholder="Unknown brand"
              />
            </label>

            <label className="block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#445047]">
                Product category
              </span>
              <select
                value={productCategory}
                onChange={(event) => setProductCategoryOverride(event.target.value)}
                className={formFieldClass}
              >
                {manualCategoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#445047]">
                Ingredient list
              </span>
              <textarea
                value={ingredientText}
                onChange={(event) => setIngredientText(event.target.value)}
                className={textAreaClass}
                placeholder="Ingredients: Carbonated water, sugar, citric acid, Red No. 3, sodium benzoate, natural flavour."
              />
              <p className="mt-1.5 text-[12px] leading-5 text-[#6a776f]">
                Paste the visible ingredient text. Truthlabel will parse commas, line breaks, semicolons, and common label prefixes.
              </p>
            </label>

            <label className="block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#445047]">
                Allergen statement
              </span>
              <input
                value={allergenStatement}
                onChange={(event) => setAllergenStatement(event.target.value)}
                className={formFieldClass}
                placeholder="Contains milk and soy"
              />
            </label>

            <label className="block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#445047]">
                Packaging text
              </span>
              <input
                value={packagingText}
                onChange={(event) => setPackagingText(event.target.value)}
                className={formFieldClass}
                placeholder="PET bottle, plastic pouch, foil wrapper"
              />
            </label>
          </div>

          <div className="mt-5 rounded-[22px] border border-[#e7decf] bg-white/76 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <SectionLabel>Allergy profile</SectionLabel>
                <p className="mt-1.5 text-[13px] leading-5 text-[#55645c]">
                  Optional. If one of these matches the product, Allergy Risk can turn red.
                </p>
              </div>
              <span className="rounded-full border border-[#e1d8ca] bg-[#faf7f0] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d6a5d]">
                Optional
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {manualAllergyOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selectedAllergies.includes(option)}
                  onClick={() =>
                    setSelectedAllergiesOverride((current) =>
                      getNextSelectedAllergiesOverride(
                        current,
                        selectedAllergies,
                        option,
                      ),
                    )
                  }
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                    selectedAllergies.includes(option)
                      ? "border-[#1c3028] bg-[#1c3028] text-white shadow-[0_10px_24px_rgba(28,48,40,0.14)]"
                      : "border-[#ddd6ca] bg-white/78 text-[#33443c] hover:border-[#c4b493] hover:bg-[#fbf6ed]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#445047]">
                Typed allergies
              </span>
              <input
                value={customAllergiesText}
                onChange={(event) =>
                  setCustomAllergiesTextOverride(event.target.value)
                }
                className={formFieldClass}
                placeholder="milk, sesame, sulphites"
              />
            </label>

            <div className="mt-3 rounded-[18px] border border-[#e7decf] bg-[#faf7f0] px-3.5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c6d4f]">
                Selected profile
              </p>
              {selectedAllergySummary.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedAllergySummary.map((item) => (
                    <span
                      key={item}
                      className="inline-flex rounded-full border border-[#e1d8ca] bg-white px-3 py-1 text-[12px] font-medium text-[#445249]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[13px] leading-5 text-[#49584f]">
                  No allergy profile selected for this scan.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-[20px] border border-[#e7decf] bg-white/76 px-4 py-3.5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7a705c]">
              Data honesty
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-[#55645c]">
              Barcode records can be incomplete or user-submitted. Heavy metals, microplastics, and recall status also require external data. Missing data is not proof of absence.
            </p>
            <p className="mt-2 text-[12px] leading-5 text-[#6a776f]">
              Recall and safety checks depend on available official data. Barcode lookup only sends the barcode or product details needed for product and safety matching.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="text-[13px] font-medium text-[#5f695f] underline-offset-4 hover:underline"
            >
              Back home
            </Link>
            <button
              type="submit"
              disabled={isPending || isAnalyzingProduct}
              className="rounded-full border border-transparent bg-[#182b22] px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_36px_rgba(24,43,34,0.18)] transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
            >
              {isAnalyzingProduct
                ? "Analyzing..."
                : isPending
                ? barcodeDraftProduct
                  ? "Completing scan..."
                  : "Scanning label..."
                : barcodeDraftProduct
                  ? "Complete scan"
                  : "Run manual scan"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
