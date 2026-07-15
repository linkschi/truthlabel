"use client";
/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  classifyCameraAccessError,
  stopMediaStream,
} from "@/lib/cameraBarcodeScanner";
import {
  extractIngredientTextFromImage,
  type OcrExtractionResult,
} from "@/lib/localIngredientOcr";

type OcrCameraState =
  | "idle"
  | "requesting_permission"
  | "ready"
  | "permission_denied"
  | "no_camera"
  | "error";

export type OcrConfirmedDetails = {
  possibleAllergenStatement?: string;
  confidenceWarnings: string[];
};

type OcrIngredientScannerProps = {
  onTextConfirmed: (
    ingredientText: string,
    details?: OcrConfirmedDetails,
  ) => void | Promise<void>;
  onClose: () => void;
  ocrRunner?: (image: Blob | File) => Promise<OcrExtractionResult>;
  mediaDevices?: Pick<MediaDevices, "getUserMedia">;
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

function getOcrCameraMessage(state: OcrCameraState) {
  switch (state) {
    case "requesting_permission":
      return "Allow camera access to capture the ingredient label.";
    case "permission_denied":
      return "Camera access was blocked. You can upload a photo or paste the ingredients manually.";
    case "no_camera":
      return "No camera was found on this device. You can upload a photo or paste the ingredients manually.";
    case "error":
      return "The camera could not start. Try uploading a photo instead.";
    case "ready":
      return "Fill the frame with the ingredient label, then capture the photo.";
    case "idle":
    default:
      return "Use the camera or upload a photo of the ingredient label.";
  }
}

function createPreviewUrl(file: Blob | File) {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return "";
  }

  return URL.createObjectURL(file);
}

function revokePreviewUrl(value: string) {
  if (!value || typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") {
    return;
  }

  URL.revokeObjectURL(value);
}

export default function OcrIngredientScanner({
  onTextConfirmed,
  onClose,
  ocrRunner = extractIngredientTextFromImage,
  mediaDevices,
}: OcrIngredientScannerProps) {
  const [cameraState, setCameraState] = useState<OcrCameraState>("idle");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrErrorMessage, setOcrErrorMessage] = useState("");
  const [editableIngredientText, setEditableIngredientText] = useState("");
  const [editableAllergenStatement, setEditableAllergenStatement] = useState("");
  const [confidenceWarnings, setConfidenceWarnings] = useState<string[]>([]);
  const [isReviewReady, setIsReviewReady] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef("");

  const stopCamera = useCallback(() => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;

    const video = videoRef.current;
    if (video) {
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
    }
  }, []);

  const resetReviewState = useCallback(() => {
    setEditableIngredientText("");
    setEditableAllergenStatement("");
    setConfidenceWarnings([]);
    setIsReviewReady(false);
    setIsProcessing(false);
    setOcrErrorMessage("");
  }, []);

  const replacePreviewUrl = useCallback((nextUrl: string) => {
    revokePreviewUrl(previewUrlRef.current);
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    replacePreviewUrl("");
    onClose();
  }, [onClose, replacePreviewUrl, stopCamera]);

  const processImage = useCallback(
    async (image: Blob | File) => {
      setIsProcessing(true);
      setIsReviewReady(false);
      setOcrErrorMessage("");

      try {
        const result = await ocrRunner(image);

        if (!result.ingredientText.trim()) {
          setOcrErrorMessage(
            "We could not read the ingredient label clearly. Try another photo or paste the ingredients manually.",
          );
          setConfidenceWarnings(
            uniqueStrings([
              ...result.confidenceWarnings,
              "Ingredient text was extracted from an image and may be incomplete.",
            ]),
          );
          return;
        }

        setEditableIngredientText(result.ingredientText);
        setEditableAllergenStatement(result.possibleAllergenStatement);
        setConfidenceWarnings(result.confidenceWarnings);
        setIsReviewReady(true);
      } catch {
        setOcrErrorMessage(
          "Ingredient label scan failed. You can paste the ingredient list manually.",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [ocrRunner],
  );

  const startCamera = useCallback(async () => {
    resetReviewState();
    stopCamera();
    replacePreviewUrl("");

    const resolvedMediaDevices = mediaDevices ?? navigator.mediaDevices;
    if (!resolvedMediaDevices?.getUserMedia) {
      setCameraState("no_camera");
      return;
    }

    setCameraState("requesting_permission");

    try {
      const stream = await resolvedMediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: {
            ideal: "environment",
          },
        },
      });

      streamRef.current = stream;
      const video = videoRef.current;

      if (!video) {
        stopMediaStream(stream);
        setCameraState("error");
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
        // Some browsers resolve preview after metadata is ready.
      }

      setCameraState("ready");
    } catch (error) {
      const reason = classifyCameraAccessError(error);
      setCameraState(reason === "scan_error" ? "error" : reason);
    }
  }, [mediaDevices, replacePreviewUrl, resetReviewState, stopCamera]);

  const handleCaptureLabel = useCallback(async () => {
    const video = videoRef.current;

    if (!video) {
      setOcrErrorMessage(
        "Ingredient label scan failed. You can paste the ingredient list manually.",
      );
      return;
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      setOcrErrorMessage(
        "Ingredient label scan failed. You can paste the ingredient list manually.",
      );
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    stopCamera();
    setCameraState("idle");

    const capturedImage = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
    });

    if (!capturedImage) {
      setOcrErrorMessage(
        "Ingredient label scan failed. You can paste the ingredient list manually.",
      );
      return;
    }

    replacePreviewUrl(createPreviewUrl(capturedImage));
    await processImage(capturedImage);
  }, [processImage, replacePreviewUrl, stopCamera]);

  const handleUploadClick = useCallback(() => {
    resetReviewState();
    stopCamera();
    setCameraState("idle");
    replacePreviewUrl("");
    fileInputRef.current?.click();
  }, [replacePreviewUrl, resetReviewState, stopCamera]);

  const handleFileSelected = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      event.currentTarget.value = "";

      if (!selectedFile) {
        return;
      }

      if (!selectedFile.type.startsWith("image/")) {
        setOcrErrorMessage(
          "Image upload failed. Try another image or paste the ingredients manually.",
        );
        return;
      }

      stopCamera();
      setCameraState("idle");
      replacePreviewUrl(createPreviewUrl(selectedFile));
      await processImage(selectedFile);
    },
    [processImage, replacePreviewUrl, stopCamera],
  );

  const handleRetake = useCallback(() => {
    stopCamera();
    setCameraState("idle");
    replacePreviewUrl("");
    resetReviewState();
  }, [replacePreviewUrl, resetReviewState, stopCamera]);

  const handleConfirm = useCallback(async () => {
    const ingredientText = editableIngredientText.trim();

    if (!ingredientText) {
      setOcrErrorMessage(
        "We could not read the ingredient label clearly. Try another photo or paste the ingredients manually.",
      );
      return;
    }

    setIsConfirming(true);

    try {
      await Promise.resolve(
        onTextConfirmed(ingredientText, {
          possibleAllergenStatement:
            editableAllergenStatement.trim() || undefined,
          confidenceWarnings,
        }),
      );
    } finally {
      setIsConfirming(false);
    }
  }, [
    confidenceWarnings,
    editableAllergenStatement,
    editableIngredientText,
    onTextConfirmed,
  ]);

  useEffect(() => {
    return () => {
      stopCamera();
      revokePreviewUrl(previewUrlRef.current);
    };
  }, [stopCamera]);

  const cameraMessage = getOcrCameraMessage(cameraState);

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(18,24,21,0.74)] px-4 py-5 backdrop-blur-sm sm:px-5 sm:py-6">
      <div
        className="mx-auto flex h-full w-full max-w-[440px] flex-col rounded-[30px] border border-white/14 bg-[#102019] p-4 text-white shadow-[0_28px_60px_rgba(0,0,0,0.38)]"
        data-testid="ocr-scanner"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/66">
              inside it
            </p>
            <h2 className="mt-1 font-heading text-[1.45rem] font-semibold text-white">
              Scan Ingredient Label
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-white/72">
              Scan or upload the ingredient label. You can edit the text before InsideIt scans it.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/14"
          >
            Close
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
          data-testid="ocr-upload-input"
        />

        <div className="mt-4 flex-1 overflow-y-auto rounded-[26px] border border-white/14 bg-[rgba(255,255,255,0.06)] p-3">
          {isReviewReady ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[22px] border border-white/14 bg-[#08100c]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Ingredient label preview"
                    className="h-[220px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[220px] items-center justify-center px-6 text-center text-[13px] text-white/72">
                    Preview unavailable
                  </div>
                )}
              </div>

              <div className="rounded-[20px] border border-[#f0d9b5] bg-[#fef4e3] px-4 py-3 text-[#4f3b22]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Review this text
                </p>
                <p className="mt-1.5 text-[13px] leading-5">
                  OCR can make mistakes. Review the text before scanning.
                </p>
              </div>

              <label className="block">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/74">
                  Extracted ingredient text
                </span>
                <textarea
                  value={editableIngredientText}
                  onChange={(event) => setEditableIngredientText(event.target.value)}
                  className="mt-2 min-h-[150px] w-full resize-y rounded-[18px] border border-white/14 bg-white/92 px-4 py-3 text-[14px] text-[#1f2d26] outline-none transition placeholder:text-[#8b8378] focus:border-[#d6c8af] focus:bg-white"
                  data-testid="ocr-ingredient-textarea"
                />
              </label>

              {editableAllergenStatement ? (
                <label className="block">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/74">
                    Possible allergen statement
                  </span>
                  <input
                    value={editableAllergenStatement}
                    onChange={(event) =>
                      setEditableAllergenStatement(event.target.value)
                    }
                    className="mt-2 w-full rounded-[18px] border border-white/14 bg-white/92 px-4 py-3 text-[14px] text-[#1f2d26] outline-none transition placeholder:text-[#8b8378] focus:border-[#d6c8af] focus:bg-white"
                  />
                </label>
              ) : null}

              {confidenceWarnings.length > 0 ? (
                <div className="rounded-[20px] border border-white/14 bg-white/8 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/64">
                    Confidence notes
                  </p>
                  <ul className="mt-2 space-y-2 text-[12px] leading-5 text-white/80">
                    {confidenceWarnings.map((warning) => (
                      <li key={warning}>- {warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="rounded-full border border-transparent bg-white px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#102019] transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
                >
                  {isConfirming ? "Scanning..." : "Scan this label"}
                </button>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="rounded-full border border-white/18 bg-white/10 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/14"
                >
                  Retake photo
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full border border-white/18 bg-white/10 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/14"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-[22px] border border-white/14 bg-[#08100c]">
                {cameraState === "ready" ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-[280px] w-full object-cover"
                  />
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Ingredient label preview"
                    className="h-[280px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[280px] items-center justify-center px-6 text-center">
                    <div className="max-w-[280px] rounded-[24px] border border-white/14 bg-[rgba(7,12,9,0.72)] px-5 py-5">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/74">
                        Ingredient label
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-white/88">
                        {cameraMessage}
                      </p>
                    </div>
                  </div>
                )}

                {cameraState === "ready" ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-[170px] w-[82%] max-w-[300px] rounded-[24px] border-2 border-white/88 shadow-[0_0_0_999px_rgba(8,16,12,0.18)]" />
                  </div>
                ) : null}

                {isProcessing ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(8,16,12,0.72)] px-6 text-center">
                    <div className="max-w-[280px] rounded-[24px] border border-white/14 bg-[rgba(7,12,9,0.78)] px-5 py-5">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/74">
                        Reading label
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-white/88">
                        Extracting ingredient text from the photo...
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isProcessing}
                  className="rounded-full border border-white/18 bg-white/10 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/14 disabled:cursor-wait disabled:opacity-70"
                >
                  Use Camera
                </button>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={isProcessing}
                  className="rounded-full border border-white/18 bg-white/10 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/14 disabled:cursor-wait disabled:opacity-70"
                >
                  Upload Photo
                </button>
                {cameraState === "ready" ? (
                  <button
                    type="button"
                    onClick={handleCaptureLabel}
                    disabled={isProcessing}
                    className="rounded-full border border-transparent bg-white px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#102019] transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
                  >
                    Capture Label
                  </button>
                ) : null}
              </div>

              {ocrErrorMessage ? (
                <div
                  role="alert"
                  className="rounded-[20px] border border-[#f0c1bd] bg-[#f6dedd] px-4 py-3 text-[#5c322f]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                    OCR status
                  </p>
                  <p className="mt-1.5 text-[13px] leading-5">{ocrErrorMessage}</p>
                </div>
              ) : null}

              <div
                role="status"
                aria-live="polite"
                className="rounded-[22px] border border-white/14 bg-white/8 px-4 py-3.5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/64">
                  Tips
                </p>
                <ul className="mt-2 space-y-1.5 text-[12px] leading-5 text-white/80">
                  <li>- Use good lighting</li>
                  <li>- Keep the label flat</li>
                  <li>- Fill the frame with the ingredients</li>
                  <li>- Avoid glare</li>
                  <li>- Keep the text sharp</li>
                </ul>
              </div>

              <div className="rounded-[20px] border border-white/12 bg-white/6 px-4 py-3">
                <p className="text-[12px] leading-5 text-white/70">
                  Label photos are only used to extract ingredient text.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
