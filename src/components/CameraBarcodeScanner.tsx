"use client";
/* eslint-disable @next/next/no-img-element */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Ref,
  type ReactNode,
} from "react";
import {
  buildCameraConstraintProfiles,
  chooseBestVideoInputDevice,
  classifyCameraAccessError,
  createNativeBarcodeDetector,
  expandSourceRegion,
  getScannerDiagnostics,
  getSourceRegionFromViewfinder,
  normalizeProductBarcode,
  stopMediaStream,
  type CameraScannerState,
  type CameraTrackCapabilities,
  type CameraTrackSettings,
  type NativeBarcodeDetector,
  type SourceRegion,
  type VideoDeviceCandidate,
} from "@/lib/cameraBarcodeScanner";
import {
  extractIngredientTextFromImage,
  IngredientOcrTimeoutError,
  type IngredientOcrRunner,
  type OcrProgressUpdate,
} from "@/lib/localIngredientOcr";

export type CameraScannerMode = "barcode" | "ingredients";

export type CameraScannerBarcodeOutcome =
  | {
      lookupStatus?: string;
      status?: string;
    }
  | null
  | void;

export type CameraScannerOcrDetails = {
  possibleAllergenStatement?: string;
  confidenceWarnings: string[];
};

type ScannerPhase =
  | "initializing"
  | "requesting_permission"
  | "ready"
  | "detecting"
  | "barcode_detected"
  | "looking_up"
  | "barcode_not_found"
  | "capturing"
  | "capture_review"
  | "ocr_processing"
  | "ocr_review"
  | "submitting"
  | "permission_denied"
  | "camera_unavailable"
  | "unsupported"
  | "error";

type CameraControlTrack = MediaStreamTrack & {
  getCapabilities?: () => CameraTrackCapabilities;
  getSettings?: () => CameraTrackSettings;
  applyConstraints: (
    constraints: MediaTrackConstraints & {
      advanced?: Array<
        MediaTrackConstraintSet & {
          torch?: boolean;
          focusMode?: string;
          zoom?: number;
          pointsOfInterest?: Array<{ x: number; y: number }>;
        }
      >;
    },
  ) => Promise<void>;
};

type ImageCaptureLike = {
  takePhoto?: (settings?: Record<string, unknown>) => Promise<Blob>;
  grabFrame?: () => Promise<ImageBitmap>;
  getPhotoCapabilities?: () => Promise<{
    imageWidth?: { min?: number; max?: number; step?: number };
    imageHeight?: { min?: number; max?: number; step?: number };
  }>;
};

type ImageCaptureConstructorLike = new (
  track: MediaStreamTrack,
) => ImageCaptureLike;

type ZxingReaderLike = {
  possibleFormats?: unknown[];
  decodeFromCanvas: (canvas: HTMLCanvasElement) => {
    getText: () => string;
    getBarcodeFormat?: () => unknown;
  };
  scan?: (
    video: HTMLVideoElement,
    callback: (
      result:
        | {
            getText: () => string;
            getBarcodeFormat?: () => unknown;
          }
        | undefined,
    ) => void,
  ) => { stop: () => void };
};

type BarcodeDecodeResult = {
  rawValue: string;
  format?: string;
};

type CameraBarcodeScannerProps = {
  onBarcodeDetected: (
    barcode: string,
  ) => CameraScannerBarcodeOutcome | Promise<CameraScannerBarcodeOutcome>;
  onTextConfirmed?: (
    ingredientText: string,
    details?: CameraScannerOcrDetails,
  ) => void | Promise<void>;
  onClose: () => void;
  onManualEntry?: () => void;
  initialMode?: CameraScannerMode;
  ocrRunner?: IngredientOcrRunner;
  debugDiagnostics?: boolean;
  barcodeLookupTimeoutMs?: number;
};

const DEFAULT_BARCODE_LOOKUP_TIMEOUT_MS = 20000;

class BarcodeLookupTimeoutError extends Error {
  constructor() {
    super("Barcode lookup timed out.");
    this.name = "BarcodeLookupTimeoutError";
  }
}

function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(
      () => reject(new BarcodeLookupTimeoutError()),
      timeoutMs,
    );

    promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

const zxingFormatNames = [
  "EAN_13",
  "EAN_8",
  "UPC_A",
  "UPC_E",
  "CODE_128",
] as const;

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

function createPreviewUrl(file: Blob | File) {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return "";
  }

  try {
    return URL.createObjectURL(file);
  } catch {
    return "";
  }
}

function revokePreviewUrl(value: string) {
  if (!value || typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") {
    return;
  }

  try {
    URL.revokeObjectURL(value);
  } catch {
    // Ignore preview URL cleanup errors in non-browser test environments.
  }
}

function isCameraUnavailableState(state: CameraScannerState) {
  return state === "no_camera" || state === "scan_error";
}

function scannerPhaseFromAccessState(state: CameraScannerState): ScannerPhase {
  if (state === "permission_denied") {
    return "permission_denied";
  }

  if (isCameraUnavailableState(state)) {
    return "camera_unavailable";
  }

  return "error";
}

function getPrimaryInstruction(mode: CameraScannerMode, phase: ScannerPhase) {
  if (phase === "barcode_detected") {
    return "Barcode found";
  }

  if (phase === "looking_up") {
    return "Finding product...";
  }

  if (mode === "ingredients") {
    return "Photograph the ingredients list";
  }

  return "Align the barcode inside the frame";
}

function getSupportingInstruction(mode: CameraScannerMode, phase: ScannerPhase) {
  if (phase === "looking_up") {
    return "Checking the barcode and preparing the product result.";
  }

  if (phase === "barcode_detected") {
    return "Hold on while Truthlabel checks the product data.";
  }

  if (mode === "ingredients") {
    return "Fill the frame with the full list. Keep the text sharp and avoid glare.";
  }

  return "Scanning automatically";
}

function CameraIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={`h-5 w-5 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 8.5h3l1.4-2h5.2l1.4 2h3A1.8 1.8 0 0 1 20.8 10v7A1.8 1.8 0 0 1 19 18.8H5A1.8 1.8 0 0 1 3.2 17v-7A1.8 1.8 0 0 1 5 8.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path d="M12 16a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function IconButton({
  label,
  onClick,
  children,
  pressed,
  hidden = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  pressed?: boolean;
  hidden?: boolean;
}) {
  if (hidden) {
    return <span className="h-11 w-11" />;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/16 text-white outline-none transition focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] ${
        pressed ? "bg-[#12583D]/88" : "bg-[rgba(8,14,11,0.58)]"
      }`}
    >
      {children}
    </button>
  );
}

function CloseGlyph() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
    </svg>
  );
}

function FlashGlyph() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M13 2 5 13h6l-1 9 8-12h-6l1-8Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function SwitchCameraGlyph() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M8 7h7.5a4 4 0 0 1 0 8H15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="m10 4-3 3 3 3M16 20l3-3-3-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function FocusGlyph() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M4 9V5.8A1.8 1.8 0 0 1 5.8 4H9M15 4h3.2A1.8 1.8 0 0 1 20 5.8V9M20 15v3.2a1.8 1.8 0 0 1-1.8 1.8H15M9 20H5.8A1.8 1.8 0 0 1 4 18.2V15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M12 14.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function TextGlyph() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M5 7h14M5 12h14M5 17h9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function UploadGlyph() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M5 18.5h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none"
    />
  );
}

function ModeSwitch({
  mode,
  onModeChange,
}: {
  mode: CameraScannerMode;
  onModeChange: (mode: CameraScannerMode) => void;
}) {
  return (
    <div className="mx-auto mt-3 grid h-10 w-full max-w-[250px] grid-cols-2 rounded-full bg-[rgba(8,14,11,0.58)] p-1">
      {(["barcode", "ingredients"] as const).map((entry) => {
        const isSelected = mode === entry;

        return (
          <button
            key={entry}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onModeChange(entry)}
            className={`rounded-full px-3 text-[13px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-white ${
              isSelected
                ? "bg-white text-[#12583D]"
                : "bg-transparent text-white"
            }`}
          >
            {entry === "barcode" ? "Barcode" : "Ingredients"}
          </button>
        );
      })}
    </div>
  );
}

function BarcodeViewfinder({
  detected,
  frameRef,
}: {
  detected: boolean;
  frameRef: Ref<HTMLDivElement>;
}) {
  const cornerColor = detected ? "border-[#1F8A58]" : "border-white";

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5">
      <div
        ref={frameRef}
        className="relative aspect-[3/1] w-[min(84vw,380px)] max-h-[150px] min-h-[120px] rounded-[24px] shadow-[0_0_0_999px_rgba(0,0,0,0.42)]"
      >
        <span className={`absolute left-0 top-0 h-9 w-9 rounded-tl-[24px] border-l-[3px] border-t-[3px] ${cornerColor}`} />
        <span className={`absolute right-0 top-0 h-9 w-9 rounded-tr-[24px] border-r-[3px] border-t-[3px] ${cornerColor}`} />
        <span className={`absolute bottom-0 left-0 h-9 w-9 rounded-bl-[24px] border-b-[3px] border-l-[3px] ${cornerColor}`} />
        <span className={`absolute bottom-0 right-0 h-9 w-9 rounded-br-[24px] border-b-[3px] border-r-[3px] ${cornerColor}`} />
      </div>
    </div>
  );
}

function IngredientViewfinder({
  frameRef,
}: {
  frameRef: Ref<HTMLDivElement>;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 pb-8 pt-28">
      <div
        ref={frameRef}
        className="relative h-[min(56vh,520px)] min-h-[330px] w-[min(88vw,430px)] rounded-[24px] shadow-[0_0_0_999px_rgba(0,0,0,0.42)]"
      >
        <span className="absolute left-0 top-0 h-12 w-12 rounded-tl-[24px] border-l-[3px] border-t-[3px] border-white" />
        <span className="absolute right-0 top-0 h-12 w-12 rounded-tr-[24px] border-r-[3px] border-t-[3px] border-white" />
        <span className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-[24px] border-b-[3px] border-l-[3px] border-white" />
        <span className="absolute bottom-0 right-0 h-12 w-12 rounded-br-[24px] border-b-[3px] border-r-[3px] border-white" />
      </div>
    </div>
  );
}

function BottomAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[rgba(8,14,11,0.58)] px-3 text-[12px] font-semibold text-white outline-none transition focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ErrorRecoveryScreen({
  title,
  message,
  onTryAgain,
  onChoosePhoto,
  onManualEntry,
  onClose,
}: {
  title: string;
  message: string;
  onTryAgain?: () => void;
  onChoosePhoto: () => void;
  onManualEntry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 min-h-[100dvh] bg-white px-5 py-[calc(18px+env(safe-area-inset-top))] text-[#101613]">
      <div className="mx-auto flex min-h-[calc(100dvh-36px)] w-full max-w-[440px] flex-col">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F6F8F7] text-[#101613]"
          >
            <CloseGlyph />
          </button>
          <p className="text-[15px] font-bold">Scan product</p>
          <span className="h-11 w-11" />
        </div>

        <div className="flex flex-1 items-center">
          <section className="w-full rounded-[28px] border border-[#E2E8E4] bg-[#F6F8F7] px-5 py-6 text-center">
            <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#FDEDEE] text-[#C43B3B]">
              <CameraIcon className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-[24px] font-extrabold tracking-[-0.02em]">
              {title}
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-[#66716B]">{message}</p>

            <div className="mt-5 grid gap-2.5">
              {onTryAgain ? (
                <button
                  type="button"
                  onClick={onTryAgain}
                  className="min-h-12 rounded-[16px] bg-[#12583D] px-4 text-[14px] font-bold text-white"
                >
                  Try again
                </button>
              ) : null}
              <button
                type="button"
                onClick={onChoosePhoto}
                className="min-h-12 rounded-[16px] border border-[#D7E7DD] bg-white px-4 text-[14px] font-bold text-[#12583D]"
              >
                Choose a photo
              </button>
              <button
                type="button"
                onClick={onManualEntry}
                className="min-h-12 rounded-[16px] border border-[#E2E8E4] bg-white px-4 text-[14px] font-bold text-[#101613]"
              >
                Use manual scan
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function getOutcomeStatus(outcome: CameraScannerBarcodeOutcome) {
  return outcome?.lookupStatus ?? outcome?.status ?? "";
}

function getFirstVideoTrack(stream: MediaStream | null | undefined) {
  if (!stream) {
    return undefined;
  }

  if (typeof stream.getVideoTracks === "function") {
    return stream.getVideoTracks()[0];
  }

  return stream.getTracks()[0];
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForLoadedMetadata(video: HTMLVideoElement) {
  const deadline = Date.now() + 3_500;

  while (Date.now() < deadline) {
    if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
      return true;
    }

    try {
      await video.play();
    } catch {
      // A later metadata/canplay event may make playback available on mobile Safari.
    }

    await delay(90);
  }

  return video.videoWidth > 0 && video.videoHeight > 0;
}

async function openCameraWithProfiles(
  deviceId?: string | null,
): Promise<{
  stream: MediaStream;
  requestedConstraints: MediaStreamConstraints;
}> {
  let lastError: unknown;

  for (const constraints of buildCameraConstraintProfiles(deviceId)) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      return {
        stream,
        requestedConstraints: constraints,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Camera unavailable");
}

async function enumerateVideoDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return [] as MediaDeviceInfo[];
  }

  try {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => device.kind === "videoinput",
    );
  } catch {
    return [];
  }
}

function getTrackCapabilities(track?: MediaStreamTrack | null) {
  return (
    track as
      | {
          getCapabilities?: () => CameraTrackCapabilities;
        }
      | undefined
  )?.getCapabilities?.() ?? null;
}

function getTrackSettings(track?: MediaStreamTrack | null) {
  return (
    track as
      | {
          getSettings?: () => CameraTrackSettings;
        }
      | undefined
  )?.getSettings?.() ?? null;
}

async function applyContinuousFocus(track?: MediaStreamTrack | null) {
  const controlTrack = track as CameraControlTrack | undefined;
  const capabilities = getTrackCapabilities(track);

  if (!controlTrack || !capabilities?.focusMode?.includes("continuous")) {
    return false;
  }

  try {
    await controlTrack.applyConstraints({
      advanced: [{ focusMode: "continuous" }],
    });
    return true;
  } catch {
    return false;
  }
}

function getZoomRange(capabilities?: CameraTrackCapabilities | null) {
  const zoom = capabilities?.zoom;

  if (!zoom || typeof zoom === "number") {
    return null;
  }

  const min = typeof zoom.min === "number" ? zoom.min : 1;
  const max = typeof zoom.max === "number" ? zoom.max : min;
  const step = typeof zoom.step === "number" && zoom.step > 0 ? zoom.step : 0.1;

  if (max <= min) {
    return null;
  }

  return { min, max, step };
}

function clampZoom(value: number, range: { min: number; max: number; step: number }) {
  const clamped = Math.min(range.max, Math.max(range.min, value));
  const steps = Math.round((clamped - range.min) / range.step);

  return Number((range.min + steps * range.step).toFixed(2));
}

function getImageCaptureConstructor() {
  return (
    window as typeof window & {
      ImageCapture?: ImageCaptureConstructorLike;
    }
  ).ImageCapture;
}

function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.96) {
  return new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    } catch {
      resolve(null);
    }
  });
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  return canvas;
}

function drawVideoRegionToCanvas(video: HTMLVideoElement, region: SourceRegion) {
  const canvas = createCanvas(region.width, region.height);
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    return null;
  }

  try {
    context.imageSmoothingEnabled = false;
    context.drawImage(
      video,
      region.x,
      region.y,
      region.width,
      region.height,
      0,
      0,
      region.width,
      region.height,
    );
    return canvas;
  } catch {
    return null;
  }
}

function drawImageBitmapToCanvas(image: ImageBitmap) {
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    return null;
  }

  context.drawImage(image, 0, 0);
  return canvas;
}

function getDefaultSourceRegion(video: HTMLVideoElement): SourceRegion {
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  const cropHeight = Math.max(220, Math.round(height * 0.34));

  return {
    x: Math.round(width * 0.08),
    y: Math.round((height - cropHeight) / 2),
    width: Math.round(width * 0.84),
    height: cropHeight,
  };
}

function getSourceRegionFromDom(
  video: HTMLVideoElement,
  viewfinder: HTMLDivElement | null,
) {
  const videoWidth = video.videoWidth || 0;
  const videoHeight = video.videoHeight || 0;

  if (!videoWidth || !videoHeight || !viewfinder) {
    return getDefaultSourceRegion(video);
  }

  const videoRect = video.getBoundingClientRect();
  const frameRect = viewfinder.getBoundingClientRect();

  if (!videoRect.width || !videoRect.height || !frameRect.width || !frameRect.height) {
    return getDefaultSourceRegion(video);
  }

  return getSourceRegionFromViewfinder({
    videoWidth,
    videoHeight,
    renderedWidth: videoRect.width,
    renderedHeight: videoRect.height,
    objectFit: "cover",
    viewfinderRect: {
      x: frameRect.left - videoRect.left,
      y: frameRect.top - videoRect.top,
      width: frameRect.width,
      height: frameRect.height,
    },
  });
}

function estimateCanvasQuality(canvas: HTMLCanvasElement) {
  const warnings: string[] = [];
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return warnings;
  }

  if (canvas.width < 1000 || canvas.height < 700) {
    warnings.push("The captured label image may be low resolution. Retake closer if the text looks soft.");
  }

  try {
    const sampleWidth = Math.min(160, canvas.width);
    const sampleHeight = Math.min(160, canvas.height);
    const sample = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
    let brightness = 0;

    for (let index = 0; index < sample.length; index += 4) {
      brightness += (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
    }

    brightness /= sample.length / 4;

    if (brightness < 45) {
      warnings.push("More light may help OCR read the label.");
    } else if (brightness > 235) {
      warnings.push("The label may have glare. Retake at a slight angle if text is washed out.");
    }
  } catch {
    // Canvas pixel reads can be unavailable for some image sources. Keep the photo usable.
  }

  return warnings;
}

async function estimateBlobQuality(blob: Blob) {
  if (typeof createImageBitmap !== "function") {
    return [] as string[];
  }

  try {
    const bitmap = await createImageBitmap(blob);
    const canvas = drawImageBitmapToCanvas(bitmap);
    bitmap.close?.();

    return canvas ? estimateCanvasQuality(canvas) : [];
  } catch {
    return [];
  }
}

export default function CameraBarcodeScanner({
  onBarcodeDetected,
  onTextConfirmed,
  onClose,
  onManualEntry,
  initialMode = "barcode",
  ocrRunner = extractIngredientTextFromImage,
  debugDiagnostics = false,
  barcodeLookupTimeoutMs = DEFAULT_BARCODE_LOOKUP_TIMEOUT_MS,
}: CameraBarcodeScannerProps) {
  const [mode, setMode] = useState<CameraScannerMode>(initialMode);
  const [phase, setPhase] = useState<ScannerPhase>("initializing");
  const [hintVisible, setHintVisible] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [cameraCandidates, setCameraCandidates] = useState<VideoDeviceCandidate[]>([]);
  const [selectedCameraLabel, setSelectedCameraLabel] = useState("");
  const [focusNotice, setFocusNotice] = useState("");
  const [zoomRange, setZoomRange] = useState<{
    min: number;
    max: number;
    step: number;
  } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);
  const [diagnosticsText, setDiagnosticsText] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [editableIngredientText, setEditableIngredientText] = useState("");
  const [editableAllergenStatement, setEditableAllergenStatement] = useState("");
  const [confidenceWarnings, setConfidenceWarnings] = useState<string[]>([]);
  const [ocrErrorMessage, setOcrErrorMessage] = useState("");
  const [barcodeLookupStatus, setBarcodeLookupStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgressUpdate>({
    progress: 0,
    status: "Preparing photo...",
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const barcodeFrameRef = useRef<HTMLDivElement | null>(null);
  const ingredientFrameRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const scanHintTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef("");
  const isStoppedRef = useRef(false);
  const hasLockedBarcodeRef = useRef(false);
  const processingFrameRef = useRef(false);
  const nativeDetectorRef = useRef<NativeBarcodeDetector | null>(null);
  const zxingReaderRef = useRef<ZxingReaderLike | null>(null);
  const zxingControlsRef = useRef<{ stop: () => void } | null>(null);
  const zxingFallbackTimerRef = useRef<number | null>(null);
  const selectedDeviceIdRef = useRef<string | null>(null);
  const cameraCandidatesRef = useRef<VideoDeviceCandidate[]>([]);
  const selectedCameraLabelRef = useRef("");
  const requestedConstraintsRef = useRef<MediaStreamConstraints | null>(null);
  const trackCapabilitiesRef = useRef<CameraTrackCapabilities | null>(null);
  const trackSettingsRef = useRef<CameraTrackSettings | null>(null);
  const imageQualityWarningsRef = useRef<string[]>([]);
  const decodeStatsRef = useRef({
    attempts: 0,
    successes: 0,
    totalDurationMs: 0,
    inputWidth: 0,
    inputHeight: 0,
    region: null as SourceRegion | null,
    lastFormat: "",
    activeLoops: 0,
    lastBroadScanAt: 0,
    lastHighQualityScanAt: 0,
  });
  const sessionTokenRef = useRef(0);
  const ocrSessionTokenRef = useRef(0);
  const modeRef = useRef<CameraScannerMode>(initialMode);
  const phaseRef = useRef<ScannerPhase>("initializing");
  const resumeCameraOnVisibleRef = useRef(false);
  const barcodeCandidateRef = useRef<{
    value: string;
    firstSeenAt: number;
    count: number;
  } | null>(null);
  const onBarcodeDetectedRef = useRef(onBarcodeDetected);
  const barcodeLookupTimeoutMsRef = useRef(barcodeLookupTimeoutMs);

  useEffect(() => {
    // Parent loading state must not restart the active camera session.
    onBarcodeDetectedRef.current = onBarcodeDetected;
    barcodeLookupTimeoutMsRef.current = barcodeLookupTimeoutMs;
  }, [barcodeLookupTimeoutMs, onBarcodeDetected]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const replacePreviewUrl = useCallback((nextUrl: string) => {
    revokePreviewUrl(previewUrlRef.current);
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }, []);

  const stopActiveCameraStream = useCallback(() => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    setTorchSupported(false);
    setTorchEnabled(false);
    setZoomRange(null);
    setCurrentZoom(null);
    trackCapabilitiesRef.current = null;
    trackSettingsRef.current = null;

    const video = videoRef.current;

    if (!video) {
      return;
    }

    try {
      video.pause();
    } catch {
      // Ignore browser pause errors during cleanup.
    }

    (
      video as HTMLVideoElement & {
        srcObject: MediaStream | null;
      }
    ).srcObject = null;
  }, []);

  const stopBarcodeScanner = useCallback(() => {
    if (scanTimerRef.current !== null) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    if (scanHintTimerRef.current !== null) {
      window.clearTimeout(scanHintTimerRef.current);
      scanHintTimerRef.current = null;
    }

    if (zxingFallbackTimerRef.current !== null) {
      window.clearTimeout(zxingFallbackTimerRef.current);
      zxingFallbackTimerRef.current = null;
    }

    try {
      zxingControlsRef.current?.stop();
    } catch {
      // ZXing cleanup is best effort when a browser has already stopped video.
    }
    zxingControlsRef.current = null;

    processingFrameRef.current = false;
    decodeStatsRef.current.activeLoops = 0;
  }, []);

  const stopScannerResources = useCallback(() => {
    isStoppedRef.current = true;
    sessionTokenRef.current += 1;
    stopBarcodeScanner();
    stopActiveCameraStream();
  }, [stopActiveCameraStream, stopBarcodeScanner]);

  const handleClose = useCallback(() => {
    ocrSessionTokenRef.current += 1;
    stopScannerResources();
    replacePreviewUrl("");
    onClose();
  }, [onClose, replacePreviewUrl, stopScannerResources]);

  const handleManualEntry = useCallback(() => {
    ocrSessionTokenRef.current += 1;
    stopScannerResources();
    replacePreviewUrl("");
    if (onManualEntry) {
      onManualEntry();
      return;
    }

    onClose();
  }, [onClose, onManualEntry, replacePreviewUrl, stopScannerResources]);

  const resetBarcodeSession = useCallback(() => {
    sessionTokenRef.current += 1;
    hasLockedBarcodeRef.current = false;
    barcodeCandidateRef.current = null;
    setHintVisible(false);
    setBarcodeLookupStatus("");
    setPhase(streamRef.current ? "detecting" : "initializing");
  }, []);

  const acceptBarcode = useCallback(
    async (barcode: string, sessionToken: number) => {
      if (
        hasLockedBarcodeRef.current ||
        isStoppedRef.current ||
        sessionToken !== sessionTokenRef.current ||
        modeRef.current !== "barcode"
      ) {
        return;
      }

      hasLockedBarcodeRef.current = true;
      stopBarcodeScanner();
      stopActiveCameraStream();
      setPhase("barcode_detected");

      try {
        navigator.vibrate?.(35);
      } catch {
        // Vibration is best-effort feedback only.
      }

      setPhase("looking_up");

      try {
        const outcome = await runWithTimeout(
          Promise.resolve(onBarcodeDetectedRef.current(barcode)),
          barcodeLookupTimeoutMsRef.current,
        );
        const status = getOutcomeStatus(outcome);

        if (
          isStoppedRef.current ||
          sessionToken !== sessionTokenRef.current ||
          modeRef.current !== "barcode"
        ) {
          return;
        }

        if (status && status !== "found") {
          setBarcodeLookupStatus(status);
          setPhase("barcode_not_found");
          return;
        }

        if (!status) {
          setBarcodeLookupStatus("unknown");
          setPhase("barcode_not_found");
          return;
        }
      } catch (error) {
        if (!isStoppedRef.current && sessionToken === sessionTokenRef.current) {
          setBarcodeLookupStatus(
            error instanceof BarcodeLookupTimeoutError ? "timeout" : "error",
          );
          setPhase("barcode_not_found");
        }
      }
    },
    [stopActiveCameraStream, stopBarcodeScanner],
  );

  const reportDetectedBarcode = useCallback(
    (rawValue: string | undefined, sessionToken: number) => {
      const barcode = normalizeProductBarcode(rawValue);

      if (
        !barcode ||
        hasLockedBarcodeRef.current ||
        isStoppedRef.current ||
        sessionToken !== sessionTokenRef.current ||
        modeRef.current !== "barcode"
      ) {
        return;
      }

      const now = Date.now();
      const previous = barcodeCandidateRef.current;

      if (previous?.value === barcode && now - previous.firstSeenAt <= 1_200) {
        const nextCandidate = {
          value: barcode,
          firstSeenAt: previous.firstSeenAt,
          count: previous.count + 1,
        };
        barcodeCandidateRef.current = nextCandidate;

        if (nextCandidate.count >= 2) {
          void acceptBarcode(barcode, sessionToken);
        }
        return;
      }

      barcodeCandidateRef.current = {
        value: barcode,
        firstSeenAt: now,
        count: 1,
      };
    },
    [acceptBarcode],
  );

  const loadZxingReader = useCallback(async () => {
    if (zxingReaderRef.current) {
      return zxingReaderRef.current;
    }

    try {
      const { BarcodeFormat, BrowserMultiFormatReader } = await import(
        "@zxing/browser"
      );
      const reader = new BrowserMultiFormatReader(undefined, {
        delayBetweenScanAttempts: 120,
        delayBetweenScanSuccess: 500,
        tryPlayVideoTimeout: 3_000,
      }) as ZxingReaderLike;
      reader.possibleFormats = zxingFormatNames.map(
        (formatName) => BarcodeFormat[formatName],
      );
      zxingReaderRef.current = reader;
      return reader;
    } catch {
      return null;
    }
  }, []);

  const recordDecodeAttempt = useCallback(
    (startedAt: number, region: SourceRegion | null, result?: BarcodeDecodeResult | null) => {
      const duration = performance.now() - startedAt;
      const stats = decodeStatsRef.current;
      stats.attempts += 1;
      stats.totalDurationMs += duration;
      stats.region = region;
      stats.inputWidth = region?.width ?? stats.inputWidth;
      stats.inputHeight = region?.height ?? stats.inputHeight;

      if (result?.rawValue) {
        stats.successes += 1;
        stats.lastFormat = result.format ?? stats.lastFormat;
      }

      if (debugDiagnostics) {
        setDiagnosticsText(
          JSON.stringify(
            getScannerDiagnostics({
              browser: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
              },
              devices: cameraCandidatesRef.current,
              selectedDeviceId: selectedDeviceIdRef.current ?? undefined,
              selectedDeviceLabel: selectedCameraLabelRef.current,
              trackLabel: getFirstVideoTrack(streamRef.current)?.label,
              requestedConstraints: requestedConstraintsRef.current,
              settings: trackSettingsRef.current,
              capabilities: trackCapabilitiesRef.current,
              video: {
                videoWidth: videoRef.current?.videoWidth ?? 0,
                videoHeight: videoRef.current?.videoHeight ?? 0,
              },
              decoder: {
                inputWidth: stats.inputWidth,
                inputHeight: stats.inputHeight,
                region: stats.region,
                attempts: stats.attempts,
                successes: stats.successes,
                averageDecodeDurationMs:
                  stats.attempts > 0
                    ? Math.round(stats.totalDurationMs / stats.attempts)
                    : 0,
                lastFormat: stats.lastFormat,
                activeLoops: stats.activeLoops,
              },
            }),
            null,
            2,
          ),
        );
      }
    },
    [debugDiagnostics],
  );

  const startZxingContinuousDetection = useCallback(
    async (video: HTMLVideoElement, sessionToken: number) => {
      if (zxingControlsRef.current) {
        return true;
      }

      const reader = await loadZxingReader();

      if (
        !reader?.scan ||
        isStoppedRef.current ||
        hasLockedBarcodeRef.current ||
        modeRef.current !== "barcode" ||
        sessionToken !== sessionTokenRef.current
      ) {
        return false;
      }

      try {
        zxingControlsRef.current = reader.scan(video, (result) => {
          if (
            isStoppedRef.current ||
            hasLockedBarcodeRef.current ||
            modeRef.current !== "barcode" ||
            sessionToken !== sessionTokenRef.current
          ) {
            return;
          }

          const decoded = result?.getText()
            ? {
                rawValue: result.getText(),
                format: String(result.getBarcodeFormat?.() ?? ""),
              }
            : null;
          const width = video.videoWidth || 0;
          const height = video.videoHeight || 0;
          recordDecodeAttempt(
            performance.now(),
            width && height ? { x: 0, y: 0, width, height } : null,
            decoded,
          );

          if (decoded?.rawValue) {
            reportDetectedBarcode(decoded.rawValue, sessionToken);
          }
        });
        return true;
      } catch {
        zxingControlsRef.current = null;
        return false;
      }
    },
    [loadZxingReader, recordDecodeAttempt, reportDetectedBarcode],
  );

  const startBarcodeDetection = useCallback(async () => {
    const video = videoRef.current;

    if (!video || modeRef.current !== "barcode" || hasLockedBarcodeRef.current) {
      return;
    }

    stopBarcodeScanner();
    barcodeCandidateRef.current = null;
    const sessionToken = sessionTokenRef.current;
    setPhase("detecting");
    const nativeDetector = await createNativeBarcodeDetector();
    nativeDetectorRef.current = nativeDetector?.detector ?? null;
    decodeStatsRef.current = {
      attempts: 0,
      successes: 0,
      totalDurationMs: 0,
      inputWidth: 0,
      inputHeight: 0,
      region: null,
      lastFormat: "",
      activeLoops: 0,
      lastBroadScanAt: Date.now(),
      lastHighQualityScanAt: Date.now(),
    };

    if (
      isStoppedRef.current ||
      sessionToken !== sessionTokenRef.current ||
      modeRef.current !== "barcode"
    ) {
      return;
    }

    if (!nativeDetector) {
      await startZxingContinuousDetection(video, sessionToken);
      return;
    }

    zxingFallbackTimerRef.current = window.setTimeout(() => {
      zxingFallbackTimerRef.current = null;
      void startZxingContinuousDetection(video, sessionToken);
    }, 1_300);

    const detectLoop = async () => {
      if (
        isStoppedRef.current ||
        hasLockedBarcodeRef.current ||
        modeRef.current !== "barcode" ||
        sessionToken !== sessionTokenRef.current
      ) {
        return;
      }

      if (processingFrameRef.current) {
        scanTimerRef.current = window.setTimeout(detectLoop, 120);
        return;
      }

      const sourceWidth = video.videoWidth || 0;
      const sourceHeight = video.videoHeight || 0;

      if (!sourceWidth || !sourceHeight) {
        scanTimerRef.current = window.setTimeout(detectLoop, 160);
        return;
      }

      processingFrameRef.current = true;
      decodeStatsRef.current.activeLoops = 1;

      try {
        const startedAt = performance.now();
        const barcodes = await nativeDetectorRef.current?.detect(video);
        const detected = barcodes?.find((entry) =>
          Boolean(normalizeProductBarcode(entry.rawValue)),
        );
        const result = detected?.rawValue
          ? {
              rawValue: detected.rawValue,
              format: (detected as { format?: string }).format,
            }
          : null;
        const fullRegion = {
          x: 0,
          y: 0,
          width: sourceWidth,
          height: sourceHeight,
        };
        recordDecodeAttempt(startedAt, fullRegion, result);

        if (result?.rawValue) {
          reportDetectedBarcode(result.rawValue, sessionToken);
        }
      } catch {
        void startZxingContinuousDetection(video, sessionToken);
      } finally {
        processingFrameRef.current = false;
        decodeStatsRef.current.activeLoops = 0;
      }

      scanTimerRef.current = window.setTimeout(detectLoop, 140);
    };

    void detectLoop();
  }, [
    recordDecodeAttempt,
    reportDetectedBarcode,
    startZxingContinuousDetection,
    stopBarcodeScanner,
  ]);

  const updateCameraCapabilities = useCallback(async (stream: MediaStream) => {
    const track = getFirstVideoTrack(stream) as CameraControlTrack | undefined;
    const capabilities = getTrackCapabilities(track);
    const settings = getTrackSettings(track);
    const nextZoomRange = getZoomRange(capabilities);

    trackCapabilitiesRef.current = capabilities;
    trackSettingsRef.current = settings;
    setTorchSupported(Boolean(capabilities?.torch));
    setZoomRange(nextZoomRange);
    setCurrentZoom(
      typeof settings?.zoom === "number"
        ? settings.zoom
        : nextZoomRange
          ? clampZoom(1, nextZoomRange)
          : null,
    );

    const focused = await applyContinuousFocus(track);
    setFocusNotice(
      focused
        ? "Continuous focus active"
        : "Move the phone slightly away, then closer to refocus.",
    );
  }, []);

  const startCamera = useCallback(async () => {
    isStoppedRef.current = false;
    sessionTokenRef.current += 1;
    setPhase("requesting_permission");
    setTorchEnabled(false);
    setTorchSupported(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setPhase("unsupported");
      return;
    }

    try {
      stopBarcodeScanner();
      stopActiveCameraStream();
      const exactDeviceId = selectedDeviceIdRef.current;
      let opened = await openCameraWithProfiles(exactDeviceId);
      let stream = opened.stream;
      let requestedConstraints = opened.requestedConstraints;

      if (isStoppedRef.current) {
        stopMediaStream(stream);
        return;
      }

      const devices = await enumerateVideoDevices();
      const { selected, candidates } = chooseBestVideoInputDevice(devices);
      cameraCandidatesRef.current = candidates;
      setCameraCandidates(candidates);

      if (
        !exactDeviceId &&
        selected?.deviceId &&
        selected.deviceId !== getTrackSettings(getFirstVideoTrack(stream))?.deviceId
      ) {
        stopMediaStream(stream);
        selectedDeviceIdRef.current = selected.deviceId;
        opened = await openCameraWithProfiles(selected.deviceId);
        stream = opened.stream;
        requestedConstraints = opened.requestedConstraints;
      } else if (!exactDeviceId && selected?.deviceId) {
        selectedDeviceIdRef.current = selected.deviceId;
      }

      requestedConstraintsRef.current = requestedConstraints;
      streamRef.current = stream;
      const cameraLabel =
        selected?.label || getFirstVideoTrack(stream)?.label || "Selected camera";
      selectedCameraLabelRef.current = cameraLabel;
      setSelectedCameraLabel(cameraLabel);

      const video = videoRef.current;

      if (!video) {
        stopMediaStream(stream);
        setPhase("error");
        return;
      }

      (
        video as HTMLVideoElement & {
          srcObject: MediaStream | null;
        }
      ).srcObject = stream;
      video.setAttribute("playsinline", "true");

      try {
        await video.play();
      } catch {
        // Some browsers start playback after metadata is ready.
      }

      const videoReady = await waitForLoadedMetadata(video);

      if (!videoReady || isStoppedRef.current) {
        stopMediaStream(stream);
        if (!isStoppedRef.current) {
          setPhase("error");
        }
        return;
      }

      await updateCameraCapabilities(stream);
      setPhase(modeRef.current === "barcode" ? "detecting" : "ready");

      if (modeRef.current === "barcode") {
        await startBarcodeDetection();
      }
    } catch (error) {
      setPhase(scannerPhaseFromAccessState(classifyCameraAccessError(error)));
    }
  }, [
    startBarcodeDetection,
    stopActiveCameraStream,
    stopBarcodeScanner,
    updateCameraCapabilities,
  ]);

  const toggleTorch = useCallback(async () => {
    const track = getFirstVideoTrack(streamRef.current) as
      | CameraControlTrack
      | undefined;

    if (!track || !torchSupported) {
      return;
    }

    const nextValue = !torchEnabled;

    try {
      await track.applyConstraints({
        advanced: [{ torch: nextValue }],
      });
      setTorchEnabled(nextValue);
    } catch {
      setTorchSupported(false);
      setTorchEnabled(false);
    }
  }, [torchEnabled, torchSupported]);

  const handleSwitchCamera = useCallback(() => {
    const switchableCameras = cameraCandidates.filter(
      (candidate) => !candidate.isLikelyFront && candidate.deviceId,
    );

    if (switchableCameras.length < 2) {
      return;
    }

    const currentIndex = switchableCameras.findIndex(
      (candidate) => candidate.deviceId === selectedDeviceIdRef.current,
    );
    const nextCamera =
      switchableCameras[(currentIndex + 1) % switchableCameras.length] ??
      switchableCameras[0];

    selectedDeviceIdRef.current = nextCamera.deviceId;
    selectedCameraLabelRef.current = nextCamera.label || "Next camera";
    setSelectedCameraLabel(nextCamera.label || "Next camera");
    resetBarcodeSession();
    void startCamera();
  }, [cameraCandidates, resetBarcodeSession, startCamera]);

  const applyZoom = useCallback(
    async (value: number) => {
      const track = getFirstVideoTrack(streamRef.current) as
        | CameraControlTrack
        | undefined;

      if (!track || !zoomRange) {
        return;
      }

      const nextZoom = clampZoom(value, zoomRange);

      try {
        await track.applyConstraints({
          advanced: [{ zoom: nextZoom }],
        });
        setCurrentZoom(nextZoom);
        trackSettingsRef.current = getTrackSettings(track);
      } catch {
        setZoomRange(null);
        setCurrentZoom(null);
      }
    },
    [zoomRange],
  );

  const handleRefocus = useCallback(async () => {
    barcodeCandidateRef.current = null;
    setHintVisible(false);
    const track = getFirstVideoTrack(streamRef.current) as
      | CameraControlTrack
      | undefined;
    const focused = await applyContinuousFocus(track);

    setFocusNotice(
      focused
        ? "Refocus requested"
        : "Move the phone slightly away, then closer to refocus.",
    );

    if (modeRef.current === "barcode" && !hasLockedBarcodeRef.current) {
      void startBarcodeDetection();
    }
  }, [startBarcodeDetection]);

  const handleModeChange = useCallback(
    (nextMode: CameraScannerMode) => {
      if (nextMode === modeRef.current) {
        return;
      }

      stopBarcodeScanner();
      sessionTokenRef.current += 1;
      hasLockedBarcodeRef.current = false;
      barcodeCandidateRef.current = null;
      modeRef.current = nextMode;
      setMode(nextMode);
      setHintVisible(false);
      setBarcodeLookupStatus("");
      setPhase(streamRef.current ? (nextMode === "barcode" ? "detecting" : "ready") : "initializing");
      setOcrErrorMessage("");

      if (!streamRef.current) {
        void startCamera();
        return;
      }

      if (nextMode === "barcode") {
        void startBarcodeDetection();
      }
    },
    [startBarcodeDetection, startCamera, stopBarcodeScanner],
  );

  const handleTryAgain = useCallback(() => {
    ocrSessionTokenRef.current += 1;
    stopScannerResources();
    replacePreviewUrl("");
    setEditableIngredientText("");
    setEditableAllergenStatement("");
    setConfidenceWarnings([]);
    imageQualityWarningsRef.current = [];
    setOcrErrorMessage("");
    void startCamera();
  }, [replacePreviewUrl, startCamera, stopScannerResources]);

  const handleTryBarcodeAgain = useCallback(() => {
    resetBarcodeSession();
    if (streamRef.current) {
      void startBarcodeDetection();
      return;
    }

    void startCamera();
  }, [resetBarcodeSession, startBarcodeDetection, startCamera]);

  const processImage = useCallback(
    async (image: Blob | File) => {
      const ocrSessionToken = ocrSessionTokenRef.current + 1;
      ocrSessionTokenRef.current = ocrSessionToken;
      setPhase("ocr_processing");
      setOcrProgress({ progress: 0, status: "Preparing photo..." });
      setOcrErrorMessage("");
      setEditableIngredientText("");
      setEditableAllergenStatement("");
      setConfidenceWarnings([]);

      try {
        const result = await ocrRunner(image, {
          onProgress(update) {
            if (ocrSessionToken === ocrSessionTokenRef.current) {
              setOcrProgress(update);
            }
          },
        });

        if (ocrSessionToken !== ocrSessionTokenRef.current) {
          return;
        }

        if (!result.ingredientText.trim()) {
          setOcrErrorMessage(
            "We couldn't read the ingredients. Try another photo with the label closer, flatter and better lit.",
          );
          setConfidenceWarnings(
            uniqueStrings([
              ...imageQualityWarningsRef.current,
              ...result.confidenceWarnings,
              "Ingredient text was extracted from an image and may be incomplete.",
            ]),
          );
          setPhase("capture_review");
          return;
        }

        setEditableIngredientText(result.ingredientText);
        setEditableAllergenStatement(result.possibleAllergenStatement);
        setConfidenceWarnings(
          uniqueStrings([
            ...imageQualityWarningsRef.current,
            ...result.confidenceWarnings,
          ]),
        );
        setPhase("ocr_review");
      } catch (error) {
        if (ocrSessionToken !== ocrSessionTokenRef.current) {
          return;
        }

        setOcrErrorMessage(
          error instanceof IngredientOcrTimeoutError
            ? "Reading the label took too long on this device. Retake a closer photo or enter the ingredients manually."
            : "Ingredient label scan failed. You can paste the ingredient list manually.",
        );
        setPhase("capture_review");
      }
    },
    [ocrRunner],
  );

  const captureIngredients = useCallback(async () => {
    const video = videoRef.current;

    if (!video) {
      setOcrErrorMessage("Ingredient label scan failed. You can paste the ingredient list manually.");
      return;
    }

    setPhase("capturing");
    const track = getFirstVideoTrack(streamRef.current) as
      | CameraControlTrack
      | undefined;
    await applyContinuousFocus(track);
    await delay(180);

    let capturedImage: Blob | null = null;
    const ImageCaptureCtor = getImageCaptureConstructor();

    if (track && ImageCaptureCtor) {
      try {
        const imageCapture = new ImageCaptureCtor(track);
        const photoCapabilities = await imageCapture.getPhotoCapabilities?.();
        const photoSettings: Record<string, unknown> = {};

        if (photoCapabilities?.imageWidth?.max) {
          photoSettings.imageWidth = photoCapabilities.imageWidth.max;
        }

        if (photoCapabilities?.imageHeight?.max) {
          photoSettings.imageHeight = photoCapabilities.imageHeight.max;
        }

        capturedImage = await imageCapture.takePhoto?.(photoSettings);
      } catch {
        capturedImage = null;
      }
    }

    if (capturedImage) {
      imageQualityWarningsRef.current = await estimateBlobQuality(capturedImage);
      stopScannerResources();
      replacePreviewUrl(createPreviewUrl(capturedImage));
      await processImage(capturedImage);
      return;
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const labelRegion = expandSourceRegion(
      getSourceRegionFromDom(video, ingredientFrameRef.current),
      1.08,
      width,
      height,
    );
    const canvas = drawVideoRegionToCanvas(video, labelRegion);

    if (!canvas) {
      setOcrErrorMessage("Ingredient label scan failed. You can paste the ingredient list manually.");
      setPhase("ready");
      return;
    }

    imageQualityWarningsRef.current = estimateCanvasQuality(canvas);
    stopScannerResources();

    capturedImage = await canvasToBlob(canvas, "image/jpeg", 0.96);

    if (!capturedImage) {
      setOcrErrorMessage("Ingredient label scan failed. You can paste the ingredient list manually.");
      setPhase("capture_review");
      return;
    }

    replacePreviewUrl(createPreviewUrl(capturedImage));
    await processImage(capturedImage);
  }, [processImage, replacePreviewUrl, stopScannerResources]);

  const handleChoosePhoto = useCallback(() => {
    ocrSessionTokenRef.current += 1;
    stopScannerResources();
    setMode("ingredients");
    modeRef.current = "ingredients";
    fileInputRef.current?.click();
  }, [stopScannerResources]);

  const handleFileSelected = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      event.currentTarget.value = "";

      if (!selectedFile) {
        return;
      }

      if (!selectedFile.type.startsWith("image/")) {
        setOcrErrorMessage("Image upload failed. Try another image or paste the ingredients manually.");
        setPhase("capture_review");
        return;
      }

      stopScannerResources();
      imageQualityWarningsRef.current = await estimateBlobQuality(selectedFile);
      replacePreviewUrl(createPreviewUrl(selectedFile));
      await processImage(selectedFile);
    },
    [processImage, replacePreviewUrl, stopScannerResources],
  );

  const handleRetake = useCallback(() => {
    ocrSessionTokenRef.current += 1;
    replacePreviewUrl("");
    setEditableIngredientText("");
    setEditableAllergenStatement("");
    setConfidenceWarnings([]);
    imageQualityWarningsRef.current = [];
    setOcrErrorMessage("");
    setMode("ingredients");
    modeRef.current = "ingredients";
    void startCamera();
  }, [replacePreviewUrl, startCamera]);

  const handleAnalyseIngredients = useCallback(async () => {
    const ingredientText = editableIngredientText.trim();

    if (!ingredientText) {
      setOcrErrorMessage(
        "We couldn't read the ingredients. Try another photo with the label closer, flatter and better lit.",
      );
      return;
    }

    setIsSubmitting(true);
    setPhase("submitting");

    try {
      if (onTextConfirmed) {
        await Promise.resolve(
          onTextConfirmed(ingredientText, {
            possibleAllergenStatement:
              editableAllergenStatement.trim() || undefined,
            confidenceWarnings,
          }),
        );
      } else {
        handleManualEntry();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    confidenceWarnings,
    editableAllergenStatement,
    editableIngredientText,
    handleManualEntry,
    onTextConfirmed,
  ]);

  useEffect(() => {
    const startupTimer = window.setTimeout(() => {
      void startCamera();
    }, 0);

    return () => {
      window.clearTimeout(startupTimer);
      stopScannerResources();
      revokePreviewUrl(previewUrlRef.current);
    };
  }, [startCamera, stopScannerResources]);

  useEffect(() => {
    if (mode !== "barcode" || phase !== "detecting") {
      return;
    }

    const hintTimer = window.setTimeout(() => {
      setHintVisible(true);
    }, 5200);

    return () => {
      window.clearTimeout(hintTimer);
    };
  }, [mode, phase]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        resumeCameraOnVisibleRef.current =
          Boolean(streamRef.current) &&
          ["ready", "detecting", "capturing"].includes(phaseRef.current);
        stopScannerResources();
        return;
      }

      if (resumeCameraOnVisibleRef.current) {
        resumeCameraOnVisibleRef.current = false;
        setPhase("initializing");
        void startCamera();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startCamera, stopScannerResources]);

  const isReviewPhase = [
    "capture_review",
    "ocr_processing",
    "ocr_review",
    "submitting",
  ].includes(phase);

  if (phase === "permission_denied") {
    return (
      <ErrorRecoveryScreen
        title="Camera access is off"
        message="Camera access was blocked. Allow camera access in your browser settings, then try again. You can also enter the barcode or ingredients manually."
        onTryAgain={handleTryAgain}
        onChoosePhoto={handleChoosePhoto}
        onManualEntry={handleManualEntry}
        onClose={handleClose}
      />
    );
  }

  if (phase === "camera_unavailable") {
    return (
      <ErrorRecoveryScreen
        title="No camera found"
        message="No camera was found on this device. Choose a label photo or enter the product information manually."
        onChoosePhoto={handleChoosePhoto}
        onManualEntry={handleManualEntry}
        onClose={handleClose}
      />
    );
  }

  if (phase === "unsupported" || phase === "error") {
    return (
      <ErrorRecoveryScreen
        title="Camera scanning isn't supported here"
        message="Choose a label photo or enter the product information manually."
        onTryAgain={handleTryAgain}
        onChoosePhoto={handleChoosePhoto}
        onManualEntry={handleManualEntry}
        onClose={handleClose}
      />
    );
  }

  if (isReviewPhase) {
    return (
      <div className="fixed inset-0 z-50 min-h-[100dvh] overflow-y-auto bg-white text-[#101613]">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col px-4 pb-[calc(18px+env(safe-area-inset-bottom))] pt-[calc(14px+env(safe-area-inset-top))]">
          <header className="grid min-h-12 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <button
              type="button"
              onClick={handleRetake}
              className="min-h-11 rounded-full bg-[#F6F8F7] px-4 text-[13px] font-bold text-[#12583D]"
            >
              Retake
            </button>
            <h1 className="text-center text-[16px] font-bold">Review ingredients</h1>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close scanner"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F6F8F7]"
            >
              <CloseGlyph />
            </button>
          </header>

          <main className="flex-1 py-4">
            <div className="overflow-hidden rounded-[22px] border border-[#E2E8E4] bg-[#F6F8F7]">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Captured ingredient label"
                  className="max-h-[330px] w-full object-contain"
                />
              ) : (
                <div className="flex h-[240px] items-center justify-center px-5 text-center text-[13px] text-[#66716B]">
                  Captured image preview unavailable.
                </div>
              )}
            </div>

            <section className="mt-5">
              <h2 className="text-[20px] font-extrabold tracking-[-0.01em]">
                {phase === "capture_review" && ocrErrorMessage
                  ? "We couldn't read the ingredients"
                  : "Check the extracted text"}
              </h2>
              <p className="mt-1.5 text-[14px] leading-6 text-[#66716B]">
                {phase === "capture_review" && ocrErrorMessage
                  ? "Try another photo with the label closer, flatter and better lit."
                  : "Correct anything the camera missed before analysis."}
              </p>
            </section>

            {phase === "ocr_processing" ? (
              <div
                className="mt-5 rounded-[20px] border border-[#E2E8E4] bg-[#F6F8F7] px-4 py-5 text-center"
                role="status"
                aria-live="polite"
              >
                <span className="mx-auto inline-flex h-9 w-9 animate-spin rounded-full border-2 border-[#12583D]/25 border-t-[#12583D] motion-reduce:animate-none" />
                <p className="mt-3 text-[14px] font-bold">Reading the label...</p>
                <p className="mt-1.5 text-[12px] leading-5 text-[#66716B]">
                  {ocrProgress.status}
                </p>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-[#DDE8E1]"
                  aria-label="Ingredient text extraction progress"
                >
                  <span
                    className="block h-full rounded-full bg-[#12583D] transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.max(4, Math.round(ocrProgress.progress * 100))}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-4 text-[#78827D]">
                  The first scan may take longer while the on-device reader loads.
                </p>
              </div>
            ) : null}

            {ocrErrorMessage ? (
              <div className="mt-4 rounded-[18px] border border-[#F3D2D4] bg-[#FDEDEE] px-4 py-3 text-[#7A262A]">
                <p className="text-[13px] leading-5">{ocrErrorMessage}</p>
              </div>
            ) : null}

            {phase === "ocr_review" || phase === "submitting" ? (
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-[13px] font-bold text-[#101613]">
                    Ingredients
                  </span>
                  <textarea
                    value={editableIngredientText}
                    onInput={(event) =>
                      setEditableIngredientText(event.currentTarget.value)
                    }
                    className="mt-2 min-h-[190px] w-full resize-y rounded-[18px] border border-[#D6DED9] bg-white px-4 py-3 text-[14px] leading-6 text-[#101613] outline-none focus:border-[#12583D] focus:ring-2 focus:ring-[#E8F6EF]"
                    data-testid="camera-ingredient-textarea"
                  />
                </label>

                {editableAllergenStatement ? (
                  <label className="block">
                    <span className="text-[13px] font-bold text-[#101613]">
                      Possible allergen statement
                    </span>
                    <input
                      value={editableAllergenStatement}
                      onInput={(event) =>
                        setEditableAllergenStatement(event.currentTarget.value)
                      }
                      className="mt-2 w-full rounded-[18px] border border-[#D6DED9] bg-white px-4 py-3 text-[14px] text-[#101613] outline-none focus:border-[#12583D] focus:ring-2 focus:ring-[#E8F6EF]"
                    />
                  </label>
                ) : null}

                {confidenceWarnings.length > 0 ? (
                  <div className="rounded-[18px] border border-[#F3E4A9] bg-[#FFFBEA] px-4 py-3">
                    <p className="text-[12px] font-bold text-[#8A6500]">
                      OCR notes
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[12px] leading-5 text-[#66716B]">
                      {confidenceWarnings.map((warning) => (
                        <li key={warning}>- {warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </main>

          <footer className="sticky bottom-0 -mx-4 border-t border-[#E2E8E4] bg-white/95 px-4 py-3 backdrop-blur">
            {phase === "ocr_review" || phase === "submitting" ? (
              <button
                type="button"
                onClick={handleAnalyseIngredients}
                disabled={isSubmitting || !editableIngredientText.trim()}
                className="min-h-[52px] w-full rounded-[16px] bg-[#12583D] px-4 text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSubmitting ? "Analysing..." : "Analyse ingredients"}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="min-h-12 rounded-[16px] bg-[#12583D] px-4 text-[14px] font-bold text-white"
                >
                  Retake photo
                </button>
                <button
                  type="button"
                  onClick={handleChoosePhoto}
                  className="min-h-12 rounded-[16px] border border-[#D7E7DD] bg-white px-4 text-[14px] font-bold text-[#12583D]"
                >
                  Choose another photo
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={handleManualEntry}
              className="mt-2 min-h-11 w-full rounded-[16px] border border-[#E2E8E4] bg-[#F6F8F7] px-4 text-[13px] font-bold text-[#101613]"
            >
              Enter ingredients manually
            </button>
          </footer>
        </div>
      </div>
    );
  }

  const showVideo = ["ready", "detecting", "barcode_detected", "looking_up", "capturing"].includes(
    phase,
  );
  const isBarcodeDetected =
    phase === "barcode_detected" || phase === "looking_up";
  const primaryInstruction = getPrimaryInstruction(mode, phase);
  const supportingInstruction = getSupportingInstruction(mode, phase);
  const barcodeNotFoundTitle =
    barcodeLookupStatus === "found_missing_ingredients"
      ? "Ingredients needed"
      : barcodeLookupStatus === "timeout"
        ? "Lookup took too long"
      : barcodeLookupStatus === "error"
        ? "Lookup failed"
        : "Product not found";
  const barcodeNotFoundMessage =
    barcodeLookupStatus === "found_missing_ingredients"
      ? "Truthlabel found the product, but the product data does not include ingredients yet. Scan the ingredients to analyse it."
      : barcodeLookupStatus === "timeout"
        ? "The product lookup took too long. Check your connection, try again, or scan the ingredients instead."
      : barcodeLookupStatus === "error"
        ? "The product lookup did not complete. You can try again, scan the ingredients, or enter the details manually."
        : "This barcode is not in the product data yet. Scan the ingredients to analyse the product another way.";
  const switchableCameraCount = cameraCandidates.filter(
    (candidate) => !candidate.isLikelyFront && candidate.deviceId,
  ).length;
  const zoomPresets = zoomRange
    ? uniqueStrings(
        [1, 1.5, 2]
          .map((value) => clampZoom(value, zoomRange))
          .filter((value) => value >= zoomRange.min && value <= zoomRange.max)
          .map((value) => String(value)),
      ).map(Number)
    : [];
  const showCameraControlStrip =
    switchableCameraCount > 1 || zoomPresets.length > 0 || Boolean(focusNotice);

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] min-h-[100dvh] overflow-hidden bg-black text-white">
      <span className="sr-only">Scan Barcode</span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
        data-testid="camera-ingredient-upload-input"
      />

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
          showVideo ? "opacity-100" : "opacity-0"
        }`}
      />

      {!showVideo ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#08100c] px-6 text-center">
          <div className="max-w-[280px] rounded-[24px] bg-[rgba(8,14,11,0.78)] px-5 py-5">
            <Spinner />
            <p className="mt-3 text-[14px] font-semibold">Starting camera...</p>
            <p className="mt-1.5 text-[12px] leading-5 text-white/72">
              Allow camera access to scan product barcodes and ingredient labels.
            </p>
          </div>
        </div>
      ) : null}

      {mode === "barcode" ? (
        <BarcodeViewfinder detected={isBarcodeDetected} frameRef={barcodeFrameRef} />
      ) : (
        <IngredientViewfinder frameRef={ingredientFrameRef} />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/72 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/72 to-transparent" />

      <header className="absolute inset-x-0 top-0 px-4 pt-[calc(10px+env(safe-area-inset-top))]">
        <div className="grid min-h-11 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3">
          <IconButton label="Close scanner" onClick={handleClose}>
            <CloseGlyph />
          </IconButton>
          <h1 className="text-center text-[16px] font-bold">Scan product</h1>
          <IconButton
            label="Toggle flashlight"
            onClick={toggleTorch}
            pressed={torchEnabled}
            hidden={!torchSupported}
          >
            <FlashGlyph />
          </IconButton>
        </div>
        <ModeSwitch mode={mode} onModeChange={handleModeChange} />
        {showCameraControlStrip ? (
          <div className="mx-auto mt-2 flex max-w-[430px] flex-wrap items-center justify-center gap-2 rounded-full bg-[rgba(8,14,11,0.52)] px-2 py-2 backdrop-blur-[6px]">
            {switchableCameraCount > 1 ? (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/16 bg-white/10 px-3 text-[11px] font-bold text-white"
              >
                <SwitchCameraGlyph />
                Switch
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleRefocus}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/16 bg-white/10 px-3 text-[11px] font-bold text-white"
            >
              <FocusGlyph />
              Refocus
            </button>
            {zoomPresets.length > 0 ? (
              <div className="flex items-center gap-1 rounded-full border border-white/16 bg-white/10 px-1 py-1">
                {zoomPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => void applyZoom(preset)}
                    aria-pressed={currentZoom === preset}
                    className={`min-h-7 rounded-full px-2.5 text-[11px] font-bold ${
                      currentZoom === preset
                        ? "bg-white text-[#12583D]"
                        : "text-white"
                    }`}
                  >
                    {preset}x
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <section className="absolute inset-x-0 bottom-[calc(98px+env(safe-area-inset-bottom))] px-5 text-center">
        <div
          role="status"
          aria-live="polite"
          className="mx-auto max-w-[340px] rounded-[22px] bg-[rgba(8,14,11,0.58)] px-4 py-3 backdrop-blur-[6px]"
        >
          <p className="text-[16px] font-bold">{primaryInstruction}</p>
          <p className="mt-1 text-[13px] leading-5 text-white/78">
            {supportingInstruction}
          </p>
          {hintVisible && mode === "barcode" && phase === "detecting" ? (
            <p className="mt-2 text-[12px] leading-5 text-white/70">
              Move closer and keep the barcode sharp.
            </p>
          ) : null}
        </div>
      </section>

      {debugDiagnostics && process.env.NODE_ENV !== "production" ? (
        <aside className="absolute right-3 top-[calc(132px+env(safe-area-inset-top))] z-20 w-[min(92vw,360px)] rounded-[18px] border border-white/16 bg-black/70 p-3 text-left text-white shadow-[0_18px_36px_rgba(0,0,0,0.28)] backdrop-blur-[8px]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/64">
                Dev only
              </p>
              <h2 className="text-[14px] font-bold">Scanner Diagnostics</h2>
              {selectedCameraLabel ? (
                <p className="mt-0.5 max-w-[210px] truncate text-[11px] text-white/58">
                  {selectedCameraLabel}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() =>
                navigator.clipboard?.writeText(
                  diagnosticsText || "Scanner diagnostics not ready yet.",
                )
              }
              className="rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-[11px] font-bold"
            >
              Copy
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={handleSwitchCamera}
              disabled={switchableCameraCount < 2}
              className="rounded-full border border-white/16 bg-white/10 px-2 py-1.5 text-[11px] font-bold disabled:opacity-45"
            >
              Test next rear camera
            </button>
            <button
              type="button"
              onClick={() => {
                selectedDeviceIdRef.current = null;
                void startCamera();
              }}
              className="rounded-full border border-white/16 bg-white/10 px-2 py-1.5 text-[11px] font-bold"
            >
              Reset preferred camera
            </button>
            <button
              type="button"
              onClick={handleTryBarcodeAgain}
              className="rounded-full border border-white/16 bg-white/10 px-2 py-1.5 text-[11px] font-bold"
            >
              Run barcode test
            </button>
            <button
              type="button"
              onClick={captureIngredients}
              className="rounded-full border border-white/16 bg-white/10 px-2 py-1.5 text-[11px] font-bold"
            >
              Capture test image
            </button>
          </div>
          <pre className="mt-2 max-h-44 overflow-auto rounded-[12px] bg-black/50 p-2 text-[10px] leading-4 text-white/76">
            {diagnosticsText || "Diagnostics will appear after the camera starts."}
          </pre>
        </aside>
      ) : null}

      {phase === "looking_up" ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/42 px-6">
          <div className="rounded-[24px] bg-[rgba(8,14,11,0.78)] px-5 py-5 text-center backdrop-blur-[6px]">
            <Spinner />
            <p className="mt-3 text-[15px] font-bold">Finding product...</p>
            <p className="mt-1.5 text-[13px] leading-5 text-white/74">
              Checking the barcode and preparing the product result.
            </p>
          </div>
        </div>
      ) : null}

      {phase === "barcode_not_found" ? (
        <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-[28px] bg-white px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-5 text-[#101613] shadow-[0_-18px_36px_rgba(0,0,0,0.18)]">
          <h2 className="text-[20px] font-extrabold">{barcodeNotFoundTitle}</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#66716B]">
            {barcodeNotFoundMessage}
          </p>
          <div className="mt-4 grid gap-2.5">
            <button
              type="button"
              onClick={() => handleModeChange("ingredients")}
              className="min-h-12 rounded-[16px] bg-[#12583D] px-4 text-[14px] font-bold text-white"
            >
              Scan ingredients
            </button>
            <button
              type="button"
              onClick={handleManualEntry}
              className="min-h-12 rounded-[16px] border border-[#D7E7DD] bg-white px-4 text-[14px] font-bold text-[#12583D]"
            >
              Enter manually
            </button>
            <button
              type="button"
              onClick={handleTryBarcodeAgain}
              className="min-h-12 rounded-[16px] border border-[#E2E8E4] bg-[#F6F8F7] px-4 text-[14px] font-bold text-[#101613]"
            >
              Try barcode again
            </button>
          </div>
        </div>
      ) : null}

      {phase !== "barcode_not_found" ? (
        <footer className="absolute inset-x-0 bottom-0 px-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
          {mode === "barcode" ? (
            <div className="mx-auto flex max-w-[430px] gap-2.5">
              <BottomAction label="Enter code" icon={<TextGlyph />} onClick={handleManualEntry} />
              <BottomAction
                label="Scan ingredients"
                icon={<CameraIcon />}
                onClick={() => handleModeChange("ingredients")}
              />
            </div>
          ) : (
            <div className="mx-auto grid max-w-[430px] grid-cols-[1fr_84px_1fr] items-center gap-3">
              <BottomAction label="Photos" icon={<UploadGlyph />} onClick={handleChoosePhoto} />
              <button
                type="button"
                onClick={captureIngredients}
                disabled={phase === "capturing"}
                aria-label="Photograph ingredients"
                className="mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-full border-4 border-white bg-white/28 outline-none transition focus-visible:ring-2 focus-visible:ring-white active:scale-[0.96] disabled:cursor-wait disabled:opacity-70"
              >
                <span className="h-[52px] w-[52px] rounded-full bg-white shadow-[inset_0_0_0_6px_#12583D]" />
              </button>
              <BottomAction label="Manual" icon={<TextGlyph />} onClick={handleManualEntry} />
            </div>
          )}
        </footer>
      ) : null}
    </div>
  );
}
