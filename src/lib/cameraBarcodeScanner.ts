export const productBarcodeFormats = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
] as const;

export type ProductBarcodeFormat = (typeof productBarcodeFormats)[number];

export type CameraScannerState =
  | "requesting_permission"
  | "ready"
  | "permission_denied"
  | "no_camera"
  | "scan_error";

export type NativeBarcodeDetectorResult = {
  rawValue?: string;
};

export type NativeBarcodeDetector = {
  detect: (
    source: HTMLVideoElement | ImageBitmapSource,
  ) => Promise<NativeBarcodeDetectorResult[]>;
};

export type NativeBarcodeDetectorConstructor = {
  new (options?: { formats?: string[] }): NativeBarcodeDetector;
  getSupportedFormats?: () => Promise<string[]>;
};

export function getCameraScannerMessage(state: CameraScannerState) {
  switch (state) {
    case "requesting_permission":
      return "Allow camera access to scan the product barcode.";
    case "permission_denied":
      return "Camera access was blocked. You can type the barcode manually instead.";
    case "no_camera":
      return "No camera was found on this device. You can type the barcode manually.";
    case "scan_error":
      return "Barcode scan failed. Try again or type the barcode manually.";
    case "ready":
    default:
      return "Point your camera at the product barcode.";
  }
}

export function classifyCameraAccessError(error: unknown): Exclude<
  CameraScannerState,
  "requesting_permission" | "ready"
> {
  const name =
    error instanceof Error ? error.name : typeof error === "object" && error
      ? String((error as { name?: unknown }).name ?? "")
      : "";
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const normalized = `${name} ${message}`.toLowerCase();

  if (
    normalized.includes("notallowederror") ||
    normalized.includes("permission") ||
    normalized.includes("securityerror") ||
    normalized.includes("denied")
  ) {
    return "permission_denied";
  }

  if (
    normalized.includes("notfounderror") ||
    normalized.includes("devicesnotfounderror") ||
    normalized.includes("overconstrainederror") ||
    normalized.includes("trackstarterror") ||
    normalized.includes("no camera")
  ) {
    return "no_camera";
  }

  return "scan_error";
}

export function normalizeDetectedBarcode(value: string | undefined) {
  return value?.replace(/\s+/g, "").trim() || "";
}

export function stopMediaStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      // Ignore browser-level stop errors during cleanup.
    }
  });
}

export function getGlobalBarcodeDetector() {
  return (
    globalThis as typeof globalThis & {
      BarcodeDetector?: NativeBarcodeDetectorConstructor;
    }
  ).BarcodeDetector;
}

export async function createNativeBarcodeDetector() {
  const BarcodeDetectorCtor = getGlobalBarcodeDetector();

  if (!BarcodeDetectorCtor) {
    return null;
  }

  try {
    const supportedFormats = BarcodeDetectorCtor.getSupportedFormats
      ? await BarcodeDetectorCtor.getSupportedFormats()
      : [...productBarcodeFormats];
    const preferredFormats = productBarcodeFormats.filter((format) =>
      supportedFormats.includes(format),
    );

    if (preferredFormats.length === 0) {
      return null;
    }

    return {
      detector: new BarcodeDetectorCtor({
        formats: preferredFormats,
      }),
      formats: preferredFormats,
    };
  } catch {
    return null;
  }
}
