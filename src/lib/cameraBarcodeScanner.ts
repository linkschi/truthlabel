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

export type CameraTrackCapabilities = MediaTrackCapabilities & {
  focusMode?: string[];
  zoom?:
    | number
    | {
        min?: number;
        max?: number;
        step?: number;
      };
  torch?: boolean;
};

export type CameraTrackSettings = MediaTrackSettings & {
  focusMode?: string;
  zoom?: number;
  torch?: boolean;
};

export type VideoDeviceCandidate = {
  deviceId: string;
  label: string;
  score: number;
  isLikelyRear: boolean;
  isLikelyFront: boolean;
  reasons: string[];
};

export type SourceRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ViewfinderSourceRegionInput = {
  videoWidth: number;
  videoHeight: number;
  renderedWidth: number;
  renderedHeight: number;
  viewfinderRect: SourceRegion;
  objectFit?: "cover" | "contain";
};

export type ScannerDiagnosticsInput = {
  browser?: {
    userAgent?: string;
    platform?: string;
  };
  devices?: VideoDeviceCandidate[];
  selectedDeviceId?: string;
  selectedDeviceLabel?: string;
  trackLabel?: string;
  requestedConstraints?: MediaStreamConstraints | null;
  settings?: CameraTrackSettings | null;
  capabilities?: CameraTrackCapabilities | null;
  video?: {
    videoWidth: number;
    videoHeight: number;
  };
  decoder?: {
    inputWidth?: number;
    inputHeight?: number;
    region?: SourceRegion | null;
    averageDecodeDurationMs?: number;
    attempts?: number;
    successes?: number;
    lastFormat?: string;
    activeLoops?: number;
  };
};

const positiveRearCameraIndicators = [
  "back",
  "rear",
  "environment",
  "main",
  "primary",
  "camera 0",
];

const negativeRearCameraIndicators = [
  "front",
  "user",
  "selfie",
  "ultra wide",
  "ultrawide",
  "0.5x",
  "macro",
  "depth",
  "telephoto",
  "tele",
  "virtual",
];

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

export function normalizeProductBarcode(value: string | undefined) {
  const normalized = normalizeDetectedBarcode(value).replace(/[-_]/g, "");

  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(normalized)) {
    return "";
  }

  return normalized;
}

export function hasValidGtinCheckDigit(value: string) {
  const barcode = normalizeProductBarcode(value);

  if (!barcode) {
    return false;
  }

  const digits = barcode.split("").map(Number);
  const checkDigit = digits.pop();

  if (checkDigit === undefined) {
    return false;
  }

  const weightedSum = digits
    .reverse()
    .reduce(
      (sum, digit, index) => sum + digit * (index % 2 === 0 ? 3 : 1),
      0,
    );

  return (10 - (weightedSum % 10)) % 10 === checkDigit;
}

function normalizeDeviceLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreVideoInputDevice(
  device: Pick<MediaDeviceInfo, "deviceId" | "kind" | "label">,
): VideoDeviceCandidate {
  const label = device.label ?? "";
  const normalizedLabel = normalizeDeviceLabel(label);
  const reasons: string[] = [];
  let score = 0;

  if (device.kind === "videoinput") {
    score += 1;
  }

  positiveRearCameraIndicators.forEach((indicator) => {
    if (normalizedLabel.includes(indicator)) {
      score += indicator === "main" || indicator === "primary" ? 4 : 3;
      reasons.push(`positive:${indicator}`);
    }
  });

  if (/\bwide\b/.test(normalizedLabel) && !normalizedLabel.includes("ultra wide")) {
    score += 1;
    reasons.push("positive:wide");
  }

  negativeRearCameraIndicators.forEach((indicator) => {
    if (normalizedLabel.includes(indicator)) {
      score -= indicator === "front" || indicator === "selfie" ? 8 : 5;
      reasons.push(`negative:${indicator}`);
    }
  });

  const isLikelyFront = reasons.some((reason) =>
    ["negative:front", "negative:user", "negative:selfie"].includes(reason),
  );
  const isLikelyRear =
    !isLikelyFront &&
    (reasons.some((reason) => reason.startsWith("positive:")) || score > 1);

  return {
    deviceId: device.deviceId,
    label,
    score,
    isLikelyRear,
    isLikelyFront,
    reasons,
  };
}

export function getRankedVideoInputDevices(devices: MediaDeviceInfo[]) {
  return devices
    .filter((device) => device.kind === "videoinput")
    .map(scoreVideoInputDevice)
    .sort((left, right) => right.score - left.score);
}

export function chooseBestVideoInputDevice(devices: MediaDeviceInfo[]) {
  const rankedDevices = getRankedVideoInputDevices(devices);

  if (rankedDevices.length === 0) {
    return {
      selected: null,
      candidates: rankedDevices,
    };
  }

  const rearCandidates = rankedDevices.filter((device) => device.isLikelyRear);
  const nonFrontCandidates = rankedDevices.filter((device) => !device.isLikelyFront);
  const candidatePool =
    rearCandidates.length > 0
      ? rearCandidates
      : nonFrontCandidates.length > 0
        ? nonFrontCandidates
        : rankedDevices;

  return {
    selected: candidatePool[0] ?? null,
    candidates: rankedDevices,
  };
}

function withVideoDevice(
  video: MediaTrackConstraints,
  deviceId?: string | null,
): MediaTrackConstraints {
  if (!deviceId) {
    return {
      ...video,
      facingMode: { ideal: "environment" },
    };
  }

  return {
    ...video,
    deviceId: { exact: deviceId },
  };
}

export function buildCameraConstraintProfiles(deviceId?: string | null) {
  return [
    {
      audio: false,
      video: withVideoDevice(
        {
          width: { ideal: 1920 },
          height: { ideal: 1440 },
          frameRate: { ideal: 30, max: 30 },
          aspectRatio: { ideal: 4 / 3 },
        },
        deviceId,
      ),
    },
    {
      audio: false,
      video: withVideoDevice(
        {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 30 },
        },
        deviceId,
      ),
    },
    {
      audio: false,
      video: withVideoDevice(
        {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24, max: 30 },
        },
        deviceId,
      ),
    },
    {
      audio: false,
      video: withVideoDevice(
        {
          frameRate: { ideal: 24, max: 30 },
        },
        deviceId,
      ),
    },
  ] satisfies MediaStreamConstraints[];
}

export function summarizeTrackCapabilities(
  capabilities?: CameraTrackCapabilities | null,
) {
  if (!capabilities) {
    return null;
  }

  return {
    width: capabilities.width,
    height: capabilities.height,
    aspectRatio: capabilities.aspectRatio,
    frameRate: capabilities.frameRate,
    facingMode: capabilities.facingMode,
    focusMode: capabilities.focusMode,
    zoom: capabilities.zoom,
    torch: Boolean(capabilities.torch),
  };
}

export function summarizeTrackSettings(settings?: CameraTrackSettings | null) {
  if (!settings) {
    return null;
  }

  return {
    deviceId: settings.deviceId,
    width: settings.width,
    height: settings.height,
    aspectRatio: settings.aspectRatio,
    frameRate: settings.frameRate,
    facingMode: settings.facingMode,
    focusMode: settings.focusMode,
    zoom: settings.zoom,
    torch: settings.torch,
  };
}

function clampRegion(region: SourceRegion, width: number, height: number): SourceRegion {
  const x = Math.max(0, Math.min(region.x, width - 1));
  const y = Math.max(0, Math.min(region.y, height - 1));
  const maxWidth = Math.max(1, width - x);
  const maxHeight = Math.max(1, height - y);

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(Math.max(1, Math.min(region.width, maxWidth))),
    height: Math.round(Math.max(1, Math.min(region.height, maxHeight))),
  };
}

export function expandSourceRegion(
  region: SourceRegion,
  scale: number,
  videoWidth: number,
  videoHeight: number,
) {
  const nextWidth = region.width * scale;
  const nextHeight = region.height * scale;
  const x = region.x - (nextWidth - region.width) / 2;
  const y = region.y - (nextHeight - region.height) / 2;

  return clampRegion(
    {
      x,
      y,
      width: nextWidth,
      height: nextHeight,
    },
    videoWidth,
    videoHeight,
  );
}

export function getSourceRegionFromViewfinder({
  videoWidth,
  videoHeight,
  renderedWidth,
  renderedHeight,
  viewfinderRect,
  objectFit = "cover",
}: ViewfinderSourceRegionInput): SourceRegion {
  if (
    videoWidth <= 0 ||
    videoHeight <= 0 ||
    renderedWidth <= 0 ||
    renderedHeight <= 0
  ) {
    return {
      x: 0,
      y: 0,
      width: Math.max(1, videoWidth),
      height: Math.max(1, videoHeight),
    };
  }

  const sourceAspect = videoWidth / videoHeight;
  const renderedAspect = renderedWidth / renderedHeight;
  const isCoverWidthLimited =
    objectFit === "cover"
      ? renderedAspect > sourceAspect
      : renderedAspect <= sourceAspect;
  const scale = isCoverWidthLimited
    ? renderedWidth / videoWidth
    : renderedHeight / videoHeight;
  const displayedWidth = videoWidth * scale;
  const displayedHeight = videoHeight * scale;
  const hiddenX = Math.max(0, (displayedWidth - renderedWidth) / 2);
  const hiddenY = Math.max(0, (displayedHeight - renderedHeight) / 2);

  return clampRegion(
    {
      x: (viewfinderRect.x + hiddenX) / scale,
      y: (viewfinderRect.y + hiddenY) / scale,
      width: viewfinderRect.width / scale,
      height: viewfinderRect.height / scale,
    },
    videoWidth,
    videoHeight,
  );
}

export function getScannerDiagnostics(input: ScannerDiagnosticsInput) {
  return {
    generatedAt: new Date().toISOString(),
    browser: {
      userAgent: input.browser?.userAgent ?? "",
      platform: input.browser?.platform ?? "",
    },
    devices: input.devices ?? [],
    selectedDeviceId: input.selectedDeviceId,
    selectedDeviceLabel: input.selectedDeviceLabel,
    trackLabel: input.trackLabel,
    requestedConstraints: input.requestedConstraints ?? null,
    settings: summarizeTrackSettings(input.settings),
    capabilities: summarizeTrackCapabilities(input.capabilities),
    video: input.video ?? null,
    decoder: {
      inputWidth: input.decoder?.inputWidth,
      inputHeight: input.decoder?.inputHeight,
      region: input.decoder?.region ?? null,
      averageDecodeDurationMs: input.decoder?.averageDecodeDurationMs,
      attempts: input.decoder?.attempts ?? 0,
      successes: input.decoder?.successes ?? 0,
      lastFormat: input.decoder?.lastFormat,
      activeLoops: input.decoder?.activeLoops ?? 0,
    },
  };
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
