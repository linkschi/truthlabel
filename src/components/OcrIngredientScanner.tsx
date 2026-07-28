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
  expandSourceRegion,
  getSourceRegionFromViewfinder,
  stopMediaStream,
} from "@/lib/cameraBarcodeScanner";
import {
  cropImageBlobToSourceRegion,
  extractIngredientTextFromImage,
  IngredientOcrTimeoutError,
  type IngredientOcrRunner,
  type OcrProgressUpdate,
} from "@/lib/localIngredientOcr";
import { createCapturedImageThumbnail } from "@/lib/createCapturedImageThumbnail";
import { trackTruthlabelEvent } from "@/lib/analytics/analyticsClient";
import { normalizeAnalyticsError } from "@/lib/analytics/analyticsEvents";

type OcrCameraState =
  | "idle"
  | "requesting_permission"
  | "ready"
  | "permission_denied"
  | "no_camera"
  | "error";

type OcrImageCaptureLike = {
  getPhotoCapabilities?: () => Promise<{
    imageWidth?: { max?: number };
    imageHeight?: { max?: number };
  }>;
  takePhoto?: (settings?: Record<string, unknown>) => Promise<Blob>;
};

type OcrImageCaptureConstructor = new (
  track: MediaStreamTrack,
) => OcrImageCaptureLike;

export type OcrConfirmedDetails = {
  possibleAllergenStatement?: string;
  confidenceWarnings: string[];
  capturedImageUrl?: string;
};

type OcrIngredientScannerProps = {
  onTextConfirmed: (
    ingredientText: string,
    details?: OcrConfirmedDetails,
  ) => void | Promise<void>;
  onClose: () => void;
  ocrRunner?: IngredientOcrRunner;
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

function getOcrImageSource(image: Blob | File) {
  return typeof File !== "undefined" && image instanceof File
    ? "upload"
    : "camera_capture";
}

function getImageSizeBucket(image: Blob | File) {
  if (image.size < 400_000) {
    return "small";
  }

  if (image.size < 1_500_000) {
    return "medium";
  }

  return "large";
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

function cameraDelay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForVideoReady(video: HTMLVideoElement) {
  const deadline = Date.now() + 3_500;

  while (Date.now() < deadline) {
    if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
      return true;
    }

    try {
      await video.play();
    } catch {
      // Mobile Safari may allow playback after its metadata event fires.
    }

    await cameraDelay(90);
  }

  return video.videoWidth > 0 && video.videoHeight > 0;
}

function getLabelSourceRegion(
  video: HTMLVideoElement,
  frame: HTMLDivElement | null,
) {
  const videoWidth = video.videoWidth || 1280;
  const videoHeight = video.videoHeight || 720;
  let region = {
    x: 0,
    y: 0,
    width: videoWidth,
    height: videoHeight,
  };

  if (frame) {
    const videoRect = video.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();

    if (videoRect.width && videoRect.height && frameRect.width && frameRect.height) {
      region = expandSourceRegion(
        getSourceRegionFromViewfinder({
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
        }),
        1.08,
        videoWidth,
        videoHeight,
      );
    }
  }

  return region;
}

function captureLabelRegion(
  video: HTMLVideoElement,
  frame: HTMLDivElement | null,
) {
  const region = getLabelSourceRegion(video, frame);
  const canvas = document.createElement("canvas");
  canvas.width = region.width;
  canvas.height = region.height;
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    return null;
  }

  try {
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

async function captureHighResolutionPhoto(stream: MediaStream | null) {
  const track = stream?.getVideoTracks?.()[0] ?? stream?.getTracks?.()[0];
  const ImageCaptureConstructor = (
    window as typeof window & {
      ImageCapture?: OcrImageCaptureConstructor;
    }
  ).ImageCapture;

  if (!track || !ImageCaptureConstructor) {
    return null;
  }

  try {
    const imageCapture = new ImageCaptureConstructor(track);
    const capabilities = await imageCapture.getPhotoCapabilities?.();
    const settings: Record<string, unknown> = {};

    if (capabilities?.imageWidth?.max) {
      settings.imageWidth = capabilities.imageWidth.max;
    }

    if (capabilities?.imageHeight?.max) {
      settings.imageHeight = capabilities.imageHeight.max;
    }

    return (await imageCapture.takePhoto?.(settings)) ?? null;
  } catch {
    return null;
  }
}

export default function OcrIngredientScanner({
  onTextConfirmed,
  onClose,
  ocrRunner = extractIngredientTextFromImage,
  mediaDevices,
}: OcrIngredientScannerProps) {
  const [cameraState, setCameraState] = useState<OcrCameraState>("idle");
  const [previewUrl, setPreviewUrl] = useState("");
  const [capturedImageUrl, setCapturedImageUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrErrorMessage, setOcrErrorMessage] = useState("");
  const [editableIngredientText, setEditableIngredientText] = useState("");
  const [editableAllergenStatement, setEditableAllergenStatement] = useState("");
  const [confidenceWarnings, setConfidenceWarnings] = useState<string[]>([]);
  const [isReviewReady, setIsReviewReady] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgressUpdate>({
    progress: 0,
    status: "Preparing photo...",
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const labelFrameRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef("");
  const processingTokenRef = useRef(0);
  const cameraStateRef = useRef<OcrCameraState>("idle");
  const resumeCameraOnVisibleRef = useRef(false);

  useEffect(() => {
    cameraStateRef.current = cameraState;
  }, [cameraState]);

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
    setCapturedImageUrl("");
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
    processingTokenRef.current += 1;
    stopCamera();
    replacePreviewUrl("");
    onClose();
  }, [onClose, replacePreviewUrl, stopCamera]);

  const processImage = useCallback(
    async (image: Blob | File) => {
      const processingToken = processingTokenRef.current + 1;
      processingTokenRef.current = processingToken;
      const imageSource = getOcrImageSource(image);
      setIsProcessing(true);
      setOcrProgress({ progress: 0, status: "Preparing photo..." });
      setIsReviewReady(false);
      setOcrErrorMessage("");
      setCapturedImageUrl("");
      trackTruthlabelEvent("ocr_scan_started", {
        source: imageSource,
        image_size_bucket: getImageSizeBucket(image),
      });
      void createCapturedImageThumbnail(image).then((thumbnailUrl) => {
        if (processingToken === processingTokenRef.current && thumbnailUrl) {
          setCapturedImageUrl(thumbnailUrl);
        }
      });

      try {
        const result = await ocrRunner(image, {
          onProgress(update) {
            if (processingToken === processingTokenRef.current) {
              setOcrProgress(update);
            }
          },
        });

        if (processingToken !== processingTokenRef.current) {
          return;
        }

        if (!result.ingredientText.trim()) {
          trackTruthlabelEvent("ocr_no_text_detected", {
            source: imageSource,
            confidence_warning_count: result.confidenceWarnings.length,
          });
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
        trackTruthlabelEvent("ocr_text_extracted", {
          source: imageSource,
          confidence_warning_count: result.confidenceWarnings.length,
          has_allergen_statement: Boolean(result.possibleAllergenStatement),
          extracted_length_bucket:
            result.ingredientText.length < 80
              ? "short"
              : result.ingredientText.length < 400
                ? "medium"
                : "long",
        });
      } catch (error) {
        if (processingToken !== processingTokenRef.current) {
          return;
        }

        trackTruthlabelEvent("ocr_scan_failed", {
          source: imageSource,
          error_type:
            error instanceof IngredientOcrTimeoutError
              ? "ocr_timeout"
              : normalizeAnalyticsError(error),
        });
        setOcrErrorMessage(
          error instanceof IngredientOcrTimeoutError
            ? "Reading the label took too long on this device. Try a closer photo or paste the ingredients manually."
            : "Ingredient label scan failed. You can paste the ingredients manually.",
        );
      } finally {
        if (processingToken === processingTokenRef.current) {
          setIsProcessing(false);
        }
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
          width: { ideal: 1920 },
          height: { ideal: 1440 },
          aspectRatio: { ideal: 4 / 3 },
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

      const videoReady = await waitForVideoReady(video);

      if (!videoReady) {
        stopMediaStream(stream);
        streamRef.current = null;
        setCameraState("error");
        return;
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

    const highResolutionPhoto = await captureHighResolutionPhoto(
      streamRef.current,
    );
    if (highResolutionPhoto) {
      const labelRegion = getLabelSourceRegion(video, labelFrameRef.current);
      const croppedPhoto = await cropImageBlobToSourceRegion(
        highResolutionPhoto,
        labelRegion,
        {
          width: video.videoWidth || 1280,
          height: video.videoHeight || 720,
        },
      );
      stopCamera();
      setCameraState("idle");
      replacePreviewUrl(createPreviewUrl(croppedPhoto));
      await processImage(croppedPhoto);
      return;
    }

    const canvas = captureLabelRegion(video, labelFrameRef.current);
    if (!canvas) {
      setOcrErrorMessage(
        "Ingredient label scan failed. You can paste the ingredient list manually.",
      );
      return;
    }
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
    processingTokenRef.current += 1;
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
          capturedImageUrl,
        }),
      );
    } finally {
      setIsConfirming(false);
    }
  }, [
    confidenceWarnings,
    capturedImageUrl,
    editableAllergenStatement,
    editableIngredientText,
    onTextConfirmed,
  ]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        resumeCameraOnVisibleRef.current =
          cameraStateRef.current === "ready" && Boolean(streamRef.current);
        stopCamera();
        return;
      }

      if (resumeCameraOnVisibleRef.current) {
        resumeCameraOnVisibleRef.current = false;
        void startCamera();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopCamera();
      revokePreviewUrl(previewUrlRef.current);
    };
  }, [startCamera, stopCamera]);

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
              Truthlabel
            </p>
            <h2 className="mt-1 font-heading text-[1.45rem] font-semibold text-white">
              Scan Ingredient Label
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-white/72">
              Scan or upload the ingredient label. You can edit the text before Truthlabel scans it.
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
                  onInput={(event) =>
                    setEditableIngredientText(event.currentTarget.value)
                  }
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
                    onInput={(event) =>
                      setEditableAllergenStatement(event.currentTarget.value)
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
                {!previewUrl ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`h-[340px] w-full object-cover transition-opacity duration-200 ${
                      cameraState === "ready" ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Ingredient label preview"
                    className="h-[340px] w-full object-cover"
                  />
                )}

                {cameraState !== "ready" && !previewUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                    <div className="max-w-[280px] rounded-[24px] border border-white/14 bg-[rgba(7,12,9,0.72)] px-5 py-5">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/74">
                        Ingredient label
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-white/88">
                        {cameraMessage}
                      </p>
                    </div>
                  </div>
                ) : null}

                {cameraState === "ready" ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div
                      ref={labelFrameRef}
                      className="h-[230px] w-[88%] max-w-[340px] rounded-[24px] border-2 border-white/88 shadow-[0_0_0_999px_rgba(8,16,12,0.18)]"
                    />
                  </div>
                ) : null}

                {isProcessing ? (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-[rgba(8,16,12,0.78)] px-6 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="max-w-[280px] rounded-[24px] border border-white/14 bg-[rgba(7,12,9,0.78)] px-5 py-5">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/74">
                        Reading label
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-white/88">
                        {ocrProgress.status}
                      </p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/16">
                        <span
                          className="block h-full rounded-full bg-white transition-[width] duration-300 ease-out"
                          style={{ width: `${Math.max(4, Math.round(ocrProgress.progress * 100))}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-white/64">
                        The first scan may take longer while the on-device reader loads.
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
