"use client";

import type { IScannerControls } from "@zxing/browser";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  classifyCameraAccessError,
  createNativeBarcodeDetector,
  getCameraScannerMessage,
  normalizeDetectedBarcode,
  productBarcodeFormats,
  stopMediaStream,
  type CameraScannerState,
  type NativeBarcodeDetector,
} from "@/lib/cameraBarcodeScanner";

type CameraBarcodeScannerProps = {
  onBarcodeDetected: (barcode: string) => void | Promise<void>;
  onClose: () => void;
};

const zxingFormatNames = [
  "EAN_13",
  "EAN_8",
  "UPC_A",
  "UPC_E",
  "CODE_128",
] as const;

export default function CameraBarcodeScanner({
  onBarcodeDetected,
  onClose,
}: CameraBarcodeScannerProps) {
  const [scannerState, setScannerState] =
    useState<CameraScannerState>("requesting_permission");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const isStoppedRef = useRef(false);
  const hasDetectedRef = useRef(false);

  const stopScannerResources = useCallback(() => {
    isStoppedRef.current = true;

    if (scanTimerRef.current !== null) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    stopMediaStream(streamRef.current);
    streamRef.current = null;

    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
      } catch {
        // Ignore pause errors during cleanup.
      }

      (
        video as HTMLVideoElement & {
          srcObject: MediaStream | null;
        }
      ).srcObject = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    stopScannerResources();
    onClose();
  }, [onClose, stopScannerResources]);

  const reportDetectedBarcode = useCallback(
    (rawValue: string | undefined) => {
      const barcode = normalizeDetectedBarcode(rawValue);

      if (!barcode || hasDetectedRef.current) {
        return;
      }

      hasDetectedRef.current = true;
      stopScannerResources();
      void Promise.resolve(onBarcodeDetected(barcode));
    },
    [onBarcodeDetected, stopScannerResources],
  );

  const startNativeScanner = useCallback(
    (video: HTMLVideoElement, detector: NativeBarcodeDetector) => {
      const detectLoop = async () => {
        if (isStoppedRef.current || hasDetectedRef.current) {
          return;
        }

        try {
          if (video.readyState >= 2) {
            const barcodes = await detector.detect(video);
            const detected = barcodes.find((result) =>
              Boolean(normalizeDetectedBarcode(result.rawValue)),
            );

            if (detected?.rawValue) {
              reportDetectedBarcode(detected.rawValue);
              return;
            }
          }
        } catch {
          if (!isStoppedRef.current) {
            setScannerState("scan_error");
            stopScannerResources();
          }
          return;
        }

        scanTimerRef.current = window.setTimeout(detectLoop, 180);
      };

      void detectLoop();
    },
    [reportDetectedBarcode, stopScannerResources],
  );

  const startZxingScanner = useCallback(
    async (video: HTMLVideoElement) => {
      try {
        const { BarcodeFormat, BrowserMultiFormatReader } = await import(
          "@zxing/browser"
        );

        if (isStoppedRef.current || hasDetectedRef.current) {
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

            if (result?.getText()) {
              reportDetectedBarcode(result.getText());
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

            if (!isStoppedRef.current) {
              setScannerState("scan_error");
              stopScannerResources();
            }
          },
        );

        scannerControlsRef.current = controls;
      } catch {
        if (!isStoppedRef.current) {
          setScannerState("scan_error");
          stopScannerResources();
        }
      }
    },
    [reportDetectedBarcode, stopScannerResources],
  );

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      hasDetectedRef.current = false;
      isStoppedRef.current = false;
      setScannerState("requesting_permission");

      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerState("no_camera");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: {
              ideal: "environment",
            },
          },
        });

        if (!isMounted || isStoppedRef.current) {
          stopMediaStream(stream);
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;

        if (!video) {
          stopMediaStream(stream);
          setScannerState("scan_error");
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
          // Keep going. Some browsers resolve preview after metadata loads.
        }

        const nativeDetector = await createNativeBarcodeDetector();

        if (!isMounted || isStoppedRef.current) {
          return;
        }

        setScannerState("ready");

        if (nativeDetector) {
          startNativeScanner(video, nativeDetector.detector);
          return;
        }

        await startZxingScanner(video);
      } catch (error) {
        if (!isMounted || isStoppedRef.current) {
          return;
        }

        setScannerState(classifyCameraAccessError(error));
      }
    };

    void startScanner();

    return () => {
      isMounted = false;
      stopScannerResources();
    };
  }, [startNativeScanner, startZxingScanner, stopScannerResources]);

  const showPreview = scannerState === "ready";
  const statusMessage = getCameraScannerMessage(scannerState);

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(18,24,21,0.74)] px-4 py-5 backdrop-blur-sm sm:px-5 sm:py-6">
      <div
        className="mx-auto flex h-full w-full max-w-[440px] flex-col rounded-[30px] border border-white/14 bg-[#102019] p-4 text-white shadow-[0_28px_60px_rgba(0,0,0,0.38)]"
        data-testid="camera-scanner"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/66">
              inside it
            </p>
            <h2 className="mt-1 font-heading text-[1.45rem] font-semibold text-white">
              Scan Barcode
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/14"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex-1 rounded-[26px] border border-white/14 bg-[rgba(255,255,255,0.06)] p-3">
          <div className="relative flex h-full min-h-[360px] items-center justify-center overflow-hidden rounded-[22px] bg-[#08100c]">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`h-full w-full object-cover ${showPreview ? "opacity-100" : "opacity-0"}`}
            />

            {showPreview ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[120px] w-[78%] max-w-[280px] rounded-[24px] border-2 border-white/88 shadow-[0_0_0_999px_rgba(8,16,12,0.18)]" />
              </div>
            ) : null}

            {!showPreview ? (
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <div className="max-w-[280px] rounded-[24px] border border-white/14 bg-[rgba(7,12,9,0.72)] px-5 py-5">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/74">
                    Camera status
                  </p>
                  <p className="mt-2 text-[14px] leading-6 text-white/88">
                    {statusMessage}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-[22px] border border-white/14 bg-white/8 px-4 py-3.5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/64">
            Scanner
          </p>
          <p className="mt-1.5 text-[14px] leading-6 text-white/88">
            {statusMessage}
          </p>
          <p className="mt-2 text-[12px] leading-5 text-white/60">
            Supported formats: {productBarcodeFormats.join(", ").replace(/_/g, "-").toUpperCase()}
          </p>
        </div>

        <div className="mt-4 rounded-[20px] border border-white/12 bg-white/6 px-4 py-3">
          <p className="text-[12px] leading-5 text-white/70">
            Camera access is only used to read the barcode.
          </p>
        </div>
      </div>
    </div>
  );
}
