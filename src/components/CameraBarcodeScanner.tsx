"use client";
/* eslint-disable @next/next/no-img-element */

import type { IScannerControls } from "@zxing/browser";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  classifyCameraAccessError,
  createNativeBarcodeDetector,
  normalizeDetectedBarcode,
  stopMediaStream,
  type CameraScannerState,
  type NativeBarcodeDetector,
} from "@/lib/cameraBarcodeScanner";
import {
  extractIngredientTextFromImage,
  type OcrExtractionResult,
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

type TorchCapableTrack = MediaStreamTrack & {
  getCapabilities?: () => MediaTrackCapabilities & { torch?: boolean };
  applyConstraints: (
    constraints: MediaTrackConstraints & {
      advanced?: Array<MediaTrackConstraintSet & { torch?: boolean }>;
    },
  ) => Promise<void>;
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
  ocrRunner?: (image: Blob | File) => Promise<OcrExtractionResult>;
};

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

function BarcodeViewfinder({ detected }: { detected: boolean }) {
  const cornerColor = detected ? "border-[#1F8A58]" : "border-white";

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5">
      <div className="relative aspect-[3/1] w-[min(84vw,380px)] max-h-[150px] min-h-[120px] rounded-[24px] shadow-[0_0_0_999px_rgba(0,0,0,0.42)]">
        <span className={`absolute left-0 top-0 h-9 w-9 rounded-tl-[24px] border-l-[3px] border-t-[3px] ${cornerColor}`} />
        <span className={`absolute right-0 top-0 h-9 w-9 rounded-tr-[24px] border-r-[3px] border-t-[3px] ${cornerColor}`} />
        <span className={`absolute bottom-0 left-0 h-9 w-9 rounded-bl-[24px] border-b-[3px] border-l-[3px] ${cornerColor}`} />
        <span className={`absolute bottom-0 right-0 h-9 w-9 rounded-br-[24px] border-b-[3px] border-r-[3px] ${cornerColor}`} />
      </div>
    </div>
  );
}

function IngredientViewfinder() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 pb-8 pt-28">
      <div className="relative h-[min(56vh,520px)] min-h-[330px] w-[min(88vw,430px)] rounded-[24px] shadow-[0_0_0_999px_rgba(0,0,0,0.42)]">
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

export default function CameraBarcodeScanner({
  onBarcodeDetected,
  onTextConfirmed,
  onClose,
  onManualEntry,
  initialMode = "barcode",
  ocrRunner = extractIngredientTextFromImage,
}: CameraBarcodeScannerProps) {
  const [mode, setMode] = useState<CameraScannerMode>(initialMode);
  const [phase, setPhase] = useState<ScannerPhase>("initializing");
  const [hintVisible, setHintVisible] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [editableIngredientText, setEditableIngredientText] = useState("");
  const [editableAllergenStatement, setEditableAllergenStatement] = useState("");
  const [confidenceWarnings, setConfidenceWarnings] = useState<string[]>([]);
  const [ocrErrorMessage, setOcrErrorMessage] = useState("");
  const [barcodeLookupStatus, setBarcodeLookupStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const candidateAcceptTimerRef = useRef<number | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef("");
  const isStoppedRef = useRef(false);
  const hasLockedBarcodeRef = useRef(false);
  const processingFrameRef = useRef(false);
  const sessionTokenRef = useRef(0);
  const modeRef = useRef<CameraScannerMode>(initialMode);
  const barcodeCandidateRef = useRef<{
    value: string;
    firstSeenAt: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

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

    if (candidateAcceptTimerRef.current !== null) {
      window.clearTimeout(candidateAcceptTimerRef.current);
      candidateAcceptTimerRef.current = null;
    }

    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    processingFrameRef.current = false;
  }, []);

  const stopScannerResources = useCallback(() => {
    isStoppedRef.current = true;
    sessionTokenRef.current += 1;
    stopBarcodeScanner();
    stopActiveCameraStream();
  }, [stopActiveCameraStream, stopBarcodeScanner]);

  const handleClose = useCallback(() => {
    stopScannerResources();
    replacePreviewUrl("");
    onClose();
  }, [onClose, replacePreviewUrl, stopScannerResources]);

  const handleManualEntry = useCallback(() => {
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
    if (candidateAcceptTimerRef.current !== null) {
      window.clearTimeout(candidateAcceptTimerRef.current);
      candidateAcceptTimerRef.current = null;
    }
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
        const outcome = await Promise.resolve(onBarcodeDetected(barcode));
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
      } catch {
        if (!isStoppedRef.current && sessionToken === sessionTokenRef.current) {
          setBarcodeLookupStatus("error");
          setPhase("barcode_not_found");
        }
      }
    },
    [onBarcodeDetected, stopActiveCameraStream, stopBarcodeScanner],
  );

  const reportDetectedBarcode = useCallback(
    (rawValue: string | undefined, sessionToken: number) => {
      const barcode = normalizeDetectedBarcode(rawValue);

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

      if (previous?.value === barcode && now - previous.firstSeenAt <= 900) {
        const nextCandidate = {
          value: barcode,
          firstSeenAt: previous.firstSeenAt,
          count: previous.count + 1,
        };
        barcodeCandidateRef.current = nextCandidate;

        if (nextCandidate.count >= 2 || now - nextCandidate.firstSeenAt >= 240) {
          void acceptBarcode(barcode, sessionToken);
        }
        return;
      }

      barcodeCandidateRef.current = {
        value: barcode,
        firstSeenAt: now,
        count: 1,
      };
      if (candidateAcceptTimerRef.current !== null) {
        window.clearTimeout(candidateAcceptTimerRef.current);
      }
      candidateAcceptTimerRef.current = window.setTimeout(() => {
        const candidate = barcodeCandidateRef.current;

        if (
          candidate?.value === barcode &&
          !hasLockedBarcodeRef.current &&
          !isStoppedRef.current &&
          sessionToken === sessionTokenRef.current &&
          modeRef.current === "barcode"
        ) {
          void acceptBarcode(barcode, sessionToken);
        }
      }, 280);
    },
    [acceptBarcode],
  );

  const startNativeScanner = useCallback(
    (video: HTMLVideoElement, detector: NativeBarcodeDetector, sessionToken: number) => {
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

        processingFrameRef.current = true;

        try {
          const hasAttachedStream = Boolean(
            (
              video as HTMLVideoElement & {
                srcObject?: MediaStream | null;
              }
            ).srcObject,
          );

          if (video.readyState >= 2 || hasAttachedStream) {
            const barcodes = await detector.detect(video);
            const detected = barcodes.find((result) =>
              Boolean(normalizeDetectedBarcode(result.rawValue)),
            );

            if (detected?.rawValue) {
              reportDetectedBarcode(detected.rawValue, sessionToken);
            }
          }
        } catch {
          if (!isStoppedRef.current && sessionToken === sessionTokenRef.current) {
            setPhase("error");
          }
          return;
        } finally {
          processingFrameRef.current = false;
        }

        scanTimerRef.current = window.setTimeout(detectLoop, 160);
      };

      void detectLoop();
    },
    [reportDetectedBarcode],
  );

  const startZxingScanner = useCallback(
    async (video: HTMLVideoElement, sessionToken: number) => {
      try {
        const { BarcodeFormat, BrowserMultiFormatReader } = await import(
          "@zxing/browser"
        );

        if (
          isStoppedRef.current ||
          hasLockedBarcodeRef.current ||
          modeRef.current !== "barcode" ||
          sessionToken !== sessionTokenRef.current
        ) {
          return;
        }

        const reader = new BrowserMultiFormatReader();
        reader.possibleFormats = zxingFormatNames.map(
          (formatName) => BarcodeFormat[formatName],
        );

        const controls = await reader.decodeFromVideoElement(
          video,
          (result, error, callbackControls) => {
            scannerControlsRef.current = callbackControls;

            if (
              isStoppedRef.current ||
              hasLockedBarcodeRef.current ||
              modeRef.current !== "barcode" ||
              sessionToken !== sessionTokenRef.current
            ) {
              return;
            }

            if (result?.getText()) {
              reportDetectedBarcode(result.getText(), sessionToken);
              return;
            }

            if (!error) {
              return;
            }

            if (
              ["NotFoundException", "ChecksumException", "FormatException"].includes(
                error.name,
              )
            ) {
              return;
            }

            setPhase("error");
          },
        );

        scannerControlsRef.current = controls;
      } catch {
        if (!isStoppedRef.current && sessionToken === sessionTokenRef.current) {
          setPhase("error");
        }
      }
    },
    [reportDetectedBarcode],
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

    if (
      isStoppedRef.current ||
      sessionToken !== sessionTokenRef.current ||
      modeRef.current !== "barcode"
    ) {
      return;
    }

    if (nativeDetector) {
      startNativeScanner(video, nativeDetector.detector, sessionToken);
      return;
    }

    await startZxingScanner(video, sessionToken);
  }, [startNativeScanner, startZxingScanner, stopBarcodeScanner]);

  const updateTorchSupport = useCallback((stream: MediaStream) => {
    const track = getFirstVideoTrack(stream) as TorchCapableTrack | undefined;
    const capabilities = track?.getCapabilities?.() as
      | (MediaTrackCapabilities & { torch?: boolean })
      | undefined;
    setTorchSupported(Boolean(capabilities?.torch));
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (isStoppedRef.current) {
        stopMediaStream(stream);
        return;
      }

      streamRef.current = stream;
      updateTorchSupport(stream);

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

      setPhase(modeRef.current === "barcode" ? "detecting" : "ready");

      if (modeRef.current === "barcode") {
        await startBarcodeDetection();
      }
    } catch (error) {
      setPhase(scannerPhaseFromAccessState(classifyCameraAccessError(error)));
    }
  }, [startBarcodeDetection, updateTorchSupport]);

  const toggleTorch = useCallback(async () => {
    const track = getFirstVideoTrack(streamRef.current) as
      | TorchCapableTrack
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
    stopScannerResources();
    replacePreviewUrl("");
    setEditableIngredientText("");
    setEditableAllergenStatement("");
    setConfidenceWarnings([]);
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
      setPhase("ocr_processing");
      setOcrErrorMessage("");
      setEditableIngredientText("");
      setEditableAllergenStatement("");
      setConfidenceWarnings([]);

      try {
        const result = await ocrRunner(image);

        if (!result.ingredientText.trim()) {
          setOcrErrorMessage(
            "We couldn't read the ingredients. Try another photo with the label closer, flatter and better lit.",
          );
          setConfidenceWarnings(
            uniqueStrings([
              ...result.confidenceWarnings,
              "Ingredient text was extracted from an image and may be incomplete.",
            ]),
          );
          setPhase("capture_review");
          return;
        }

        setEditableIngredientText(result.ingredientText);
        setEditableAllergenStatement(result.possibleAllergenStatement);
        setConfidenceWarnings(result.confidenceWarnings);
        setPhase("ocr_review");
      } catch {
        setOcrErrorMessage(
          "Ingredient label scan failed. You can paste the ingredient list manually.",
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
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      setOcrErrorMessage("Ingredient label scan failed. You can paste the ingredient list manually.");
      setPhase("ready");
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    stopScannerResources();

    const capturedImage = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.94);
    });

    if (!capturedImage) {
      setOcrErrorMessage("Ingredient label scan failed. You can paste the ingredient list manually.");
      setPhase("capture_review");
      return;
    }

    replacePreviewUrl(createPreviewUrl(capturedImage));
    await processImage(capturedImage);
  }, [processImage, replacePreviewUrl, stopScannerResources]);

  const handleChoosePhoto = useCallback(() => {
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
      replacePreviewUrl(createPreviewUrl(selectedFile));
      await processImage(selectedFile);
    },
    [processImage, replacePreviewUrl, stopScannerResources],
  );

  const handleRetake = useCallback(() => {
    replacePreviewUrl("");
    setEditableIngredientText("");
    setEditableAllergenStatement("");
    setConfidenceWarnings([]);
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
        stopScannerResources();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [stopScannerResources]);

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
              <div className="mt-5 rounded-[20px] border border-[#E2E8E4] bg-[#F6F8F7] px-4 py-5 text-center">
                <span className="mx-auto inline-flex h-9 w-9 animate-spin rounded-full border-2 border-[#12583D]/25 border-t-[#12583D] motion-reduce:animate-none" />
                <p className="mt-3 text-[14px] font-bold">Reading the label...</p>
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
                    onChange={(event) => setEditableIngredientText(event.target.value)}
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
                      onChange={(event) =>
                        setEditableAllergenStatement(event.target.value)
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
      : barcodeLookupStatus === "error"
        ? "Lookup failed"
        : "Product not found";
  const barcodeNotFoundMessage =
    barcodeLookupStatus === "found_missing_ingredients"
      ? "Truthlabel found the product, but the product data does not include ingredients yet. Scan the ingredients to analyse it."
      : barcodeLookupStatus === "error"
        ? "The product lookup did not complete. You can try again, scan the ingredients, or enter the details manually."
        : "This barcode is not in the product data yet. Scan the ingredients to analyse the product another way.";

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
        <BarcodeViewfinder detected={isBarcodeDetected} />
      ) : (
        <IngredientViewfinder />
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
