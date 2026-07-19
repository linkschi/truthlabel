import { publicAppConfig } from "@/lib/appConfig";
import {
  cleanOcrIngredientText,
  type CleanOcrIngredientTextResult,
} from "@/lib/cleanOcrIngredientText";

export type OcrExtractionResult = CleanOcrIngredientTextResult & {
  rawText: string;
  averageConfidence: number | null;
};

export type OcrProgressUpdate = {
  progress: number;
  status: string;
};

export type OcrExtractionOptions = {
  onProgress?: (update: OcrProgressUpdate) => void;
  timeoutMs?: number;
};

export type IngredientOcrRunner = (
  image: Blob | File,
  options?: OcrExtractionOptions,
) => Promise<OcrExtractionResult>;

type TesseractModule = typeof import("tesseract.js");
type TesseractWorker = Awaited<
  ReturnType<TesseractModule["createWorker"]>
>;
type TesseractResult = Awaited<ReturnType<TesseractWorker["recognize"]>>;
type TesseractPageSegMode = NonNullable<Parameters<
  TesseractWorker["setParameters"]
>[0]["tessedit_pageseg_mode"]>;

const DEFAULT_OCR_TIMEOUT_MS = 65_000;
const WORKER_IDLE_TIMEOUT_MS = 45_000;
const OCR_MIN_SHORT_EDGE = 1_600;
const OCR_MAX_LONG_EDGE = 3_200;
const OCR_MAX_PIXELS = 6_500_000;

type OcrSourceRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type OcrSourceSize = {
  width: number;
  height: number;
};

type PreparedOcrImage = {
  image: Blob | File | HTMLCanvasElement;
  label: string;
};

let workerPromise: Promise<TesseractWorker> | null = null;
let workerLanguage = "";
let workerIdleTimer: ReturnType<typeof setTimeout> | null = null;
let activeProgressListener:
  | ((update: OcrProgressUpdate) => void)
  | undefined;
let ocrQueue: Promise<unknown> = Promise.resolve();

export class IngredientOcrTimeoutError extends Error {
  constructor() {
    super("Ingredient label OCR timed out.");
    this.name = "IngredientOcrTimeoutError";
  }
}

function emitProgress(progress: number, status: string) {
  activeProgressListener?.({
    progress: Math.max(0, Math.min(1, progress)),
    status,
  });
}

function mapWorkerProgress(status: string, progress: number) {
  const normalized = status.toLowerCase();

  if (normalized.includes("loading tesseract core")) {
    return { progress: 0.08 + progress * 0.12, status: "Loading text reader..." };
  }

  if (normalized.includes("loading language")) {
    return { progress: 0.2 + progress * 0.2, status: "Loading label language..." };
  }

  if (normalized.includes("initializing")) {
    return { progress: 0.4 + progress * 0.12, status: "Preparing text recognition..." };
  }

  if (normalized.includes("recognizing text")) {
    return { progress: 0.52 + progress * 0.43, status: "Reading ingredient text..." };
  }

  return { progress: 0.06 + progress * 0.88, status: "Reading ingredient label..." };
}

function clearWorkerIdleTimer() {
  if (workerIdleTimer) {
    clearTimeout(workerIdleTimer);
    workerIdleTimer = null;
  }
}

export async function disposeIngredientOcrWorker() {
  clearWorkerIdleTimer();
  const currentWorker = workerPromise;
  workerPromise = null;
  workerLanguage = "";

  if (!currentWorker) {
    return;
  }

  try {
    const worker = await currentWorker;
    await worker.terminate();
  } catch {
    // A failed worker is already unusable; clearing the cached promise is enough.
  }
}

function scheduleWorkerCleanup() {
  clearWorkerIdleTimer();
  workerIdleTimer = setTimeout(() => {
    void disposeIngredientOcrWorker();
  }, WORKER_IDLE_TIMEOUT_MS);
}

async function getOcrWorker(
  language: string,
  tesseract: TesseractModule,
) {
  clearWorkerIdleTimer();

  if (workerPromise && workerLanguage !== language) {
    await disposeIngredientOcrWorker();
  }

  if (!workerPromise) {
    workerLanguage = language;
    workerPromise = tesseract
      .createWorker(language, tesseract.OEM.LSTM_ONLY, {
        logger(message) {
          const mapped = mapWorkerProgress(message.status, message.progress);
          emitProgress(mapped.progress, mapped.status);
        },
      })
      .then(async (worker) => {
        await worker.setParameters({
          tessedit_pageseg_mode: tesseract.PSM.SINGLE_BLOCK,
          preserve_interword_spaces: "1",
          user_defined_dpi: "300",
          tessedit_char_whitelist:
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:()[]/%&#'\"+- ",
        });
        return worker;
      })
      .catch((error) => {
        workerPromise = null;
        workerLanguage = "";
        throw error;
      });
  }

  return workerPromise;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new IngredientOcrTimeoutError()), timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function enqueueOcr<T>(task: () => Promise<T>) {
  const nextTask = ocrQueue.then(task, task);
  ocrQueue = nextTask.then(
    () => undefined,
    () => undefined,
  );
  return nextTask;
}

export function getOcrTargetDimensions(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    return { width: 1, height: 1, scale: 1 };
  }

  const shortEdge = Math.min(width, height);
  const longEdge = Math.max(width, height);
  const upscale = shortEdge < OCR_MIN_SHORT_EDGE
    ? OCR_MIN_SHORT_EDGE / shortEdge
    : 1;
  const longEdgeLimit = OCR_MAX_LONG_EDGE / longEdge;
  const pixelLimit = Math.sqrt(OCR_MAX_PIXELS / (width * height));
  const scale = Math.min(upscale, longEdgeLimit, pixelLimit);
  let targetWidth = Math.max(1, Math.round(width * scale));
  let targetHeight = Math.max(1, Math.round(height * scale));

  if (targetWidth * targetHeight > OCR_MAX_PIXELS) {
    const roundedPixelScale = Math.sqrt(
      OCR_MAX_PIXELS / (targetWidth * targetHeight),
    );
    targetWidth = Math.max(1, Math.floor(targetWidth * roundedPixelScale));
    targetHeight = Math.max(1, Math.floor(targetHeight * roundedPixelScale));
  }

  return {
    width: targetWidth,
    height: targetHeight,
    scale,
  };
}

async function loadImageElement(image: Blob | File) {
  const previewUrl = URL.createObjectURL(image);
  const element = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      element.onload = () => resolve();
      element.onerror = () => reject(new Error("Image could not be decoded."));
      element.src = previewUrl;
    });
    return {
      source: element as CanvasImageSource,
      width: element.naturalWidth,
      height: element.naturalHeight,
      close() {
        URL.revokeObjectURL(previewUrl);
      },
    };
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
}

async function loadOcrDrawable(image: Blob | File) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(image, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap as CanvasImageSource,
        width: bitmap.width,
        height: bitmap.height,
        close() {
          bitmap.close();
        },
      };
    } catch {
      // Safari may reject ImageBitmap options for some camera formats.
    }
  }

  return loadImageElement(image);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.96,
) {
  return new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    } catch {
      resolve(null);
    }
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export async function cropImageBlobToSourceRegion(
  image: Blob | File,
  region: OcrSourceRegion,
  sourceSize: OcrSourceSize,
) {
  if (
    typeof document === "undefined" ||
    typeof Image === "undefined" ||
    typeof URL === "undefined" ||
    sourceSize.width <= 0 ||
    sourceSize.height <= 0 ||
    region.width <= 0 ||
    region.height <= 0
  ) {
    return image;
  }

  const drawable = await loadOcrDrawable(image);

  try {
    const scaleX = drawable.width / sourceSize.width;
    const scaleY = drawable.height / sourceSize.height;
    const cropX = clamp(Math.round(region.x * scaleX), 0, drawable.width - 1);
    const cropY = clamp(Math.round(region.y * scaleY), 0, drawable.height - 1);
    const cropWidth = clamp(
      Math.round(region.width * scaleX),
      1,
      drawable.width - cropX,
    );
    const cropHeight = clamp(
      Math.round(region.height * scaleY),
      1,
      drawable.height - cropY,
    );

    const canvas = document.createElement("canvas");
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      return image;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      drawable.source,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    return (await canvasToBlob(canvas)) ?? image;
  } catch {
    return image;
  } finally {
    drawable.close();
  }
}

function getHistogramPercentile(histogram: number[], percentile: number) {
  const total = histogram.reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return 128;
  }

  const target = total * percentile;
  let seen = 0;

  for (let index = 0; index < histogram.length; index += 1) {
    seen += histogram[index] ?? 0;
    if (seen >= target) {
      return index;
    }
  }

  return 255;
}

function getHistogramMode(histogram: number[]) {
  let bestIndex = 128;
  let bestValue = -1;

  histogram.forEach((value, index) => {
    if (value > bestValue) {
      bestValue = value;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function getOtsuThreshold(histogram: number[]) {
  const total = histogram.reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return 150;
  }

  let sum = 0;
  histogram.forEach((count, index) => {
    sum += index * count;
  });

  let backgroundWeight = 0;
  let backgroundSum = 0;
  let bestVariance = 0;
  let bestThreshold = 150;

  for (let threshold = 0; threshold < histogram.length; threshold += 1) {
    backgroundWeight += histogram[threshold] ?? 0;

    if (backgroundWeight === 0) {
      continue;
    }

    const foregroundWeight = total - backgroundWeight;
    if (foregroundWeight === 0) {
      break;
    }

    backgroundSum += threshold * (histogram[threshold] ?? 0);
    const backgroundMean = backgroundSum / backgroundWeight;
    const foregroundMean = (sum - backgroundSum) / foregroundWeight;
    const betweenVariance =
      backgroundWeight *
      foregroundWeight *
      (backgroundMean - foregroundMean) *
      (backgroundMean - foregroundMean);

    if (betweenVariance > bestVariance) {
      bestVariance = betweenVariance;
      bestThreshold = threshold;
    }
  }

  return bestThreshold;
}

function createPreparedCanvas(
  drawable: Awaited<ReturnType<typeof loadOcrDrawable>>,
  mode: "enhanced" | "binary",
) {
  const target = getOcrTargetDimensions(drawable.width, drawable.height);
  const padding = 36;
  const canvas = document.createElement("canvas");
  canvas.width = target.width + padding * 2;
  canvas.height = target.height + padding * 2;
  const context = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: true,
  });

  if (!context) {
    return null;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    drawable.source,
    padding,
    padding,
    target.width,
    target.height,
  );

  try {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const histogram = Array.from({ length: 256 }, () => 0);

    for (let index = 0; index < pixels.length; index += 4) {
      const grey = Math.round(
        pixels[index] * 0.299 +
          pixels[index + 1] * 0.587 +
          pixels[index + 2] * 0.114,
      );
      histogram[grey] += 1;
    }

    const low = getHistogramPercentile(histogram, 0.06);
    const high = getHistogramPercentile(histogram, 0.94);
    const modeBrightness = getHistogramMode(histogram);
    const shouldInvert = modeBrightness < 105 && high > 145;
    const span = Math.max(40, high - low);
    const threshold = getOtsuThreshold(histogram);

    for (let index = 0; index < pixels.length; index += 4) {
      const grey =
        pixels[index] * 0.299 +
        pixels[index + 1] * 0.587 +
        pixels[index + 2] * 0.114;
      const normalized = clamp(((grey - low) / span) * 255, 0, 255);
      const textOnWhite = shouldInvert ? 255 - normalized : normalized;
      const value =
        mode === "binary"
          ? textOnWhite < threshold
            ? 0
            : 255
          : clamp((textOnWhite - 128) * 1.35 + 150, 0, 255);

      pixels[index] = value;
      pixels[index + 1] = value;
      pixels[index + 2] = value;
      pixels[index + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);
  } catch {
    // The resized photo is still useful if pixel processing is unavailable.
  }

  return canvas;
}

async function prepareImagesForOcr(image: Blob | File) {
  if (
    typeof document === "undefined" ||
    typeof Image === "undefined" ||
    typeof URL === "undefined"
  ) {
    return [{ image, label: "original" }] satisfies PreparedOcrImage[];
  }

  emitProgress(0.02, "Preparing photo...");
  const drawable = await loadOcrDrawable(image);

  try {
    const enhanced = createPreparedCanvas(drawable, "enhanced");
    const binary = createPreparedCanvas(drawable, "binary");
    const preparedImages: PreparedOcrImage[] = [];

    if (enhanced) {
      preparedImages.push({ image: enhanced, label: "enhanced label crop" });
    }

    if (binary) {
      preparedImages.push({ image: binary, label: "high contrast label crop" });
    }

    emitProgress(0.05, "Photo prepared. Starting text reader...");
    return preparedImages.length
      ? preparedImages
      : ([{ image, label: "original" }] satisfies PreparedOcrImage[]);
  } finally {
    drawable.close();
  }
}

export function scoreOcrTextForIngredientLabel(text: string, confidence = 0) {
  const normalized = text.toLowerCase();
  const letters = normalized.match(/[a-z]/g)?.length ?? 0;
  const digits = normalized.match(/\d/g)?.length ?? 0;
  const punctuationSignals = (normalized.match(/[,;:()]/g) ?? []).length;
  const ingredientCueCount = (
    normalized.match(
      /\b(?:ingredients?|water|sugar|salt|flour|oil|milk|wheat|cocoa|cacao|oats?|rice|starch|syrup|acid|sodium|potassium|lecithin|flavou?r|colou?r|preservative|emulsifier|spices?|contains|allergen)\b/g,
    ) ?? []
  ).length;
  const nutritionNoiseCount = (
    normalized.match(
      /\b(?:nutrition|energy|calories|kcal|kj|serving|protein|carbohydrate|sugars?|fat|saturates?|sodium\s+\d|daily value|barcode|recycle|www|customer|manufactured|distributed|best before|net weight)\b/g,
    ) ?? []
  ).length;
  const hasIngredientHeading = /\bingredients?\b/i.test(text);
  const digitRatio = digits / Math.max(1, letters + digits);
  const noisePenalty =
    nutritionNoiseCount * 70 + (digitRatio > 0.28 ? 160 : 0) + (letters < 8 ? 120 : 0);

  return (
    Math.min(text.length, 900) +
    confidence * 3 +
    Math.min(punctuationSignals, 35) * 5 +
    ingredientCueCount * 36 +
    (hasIngredientHeading ? 110 : 0) -
    noisePenalty
  );
}

function shouldRunAnotherPass(result: TesseractResult) {
  const text = result.data?.text?.trim() ?? "";
  const confidence = result.data?.confidence ?? 0;
  const score = scoreOcrTextForIngredientLabel(text, confidence);

  return text.length < 55 || confidence < 62 || score < 280;
}

function scoreOcrResult(result: TesseractResult) {
  const text = result.data?.text?.trim() ?? "";
  const confidence = result.data?.confidence ?? 0;
  return scoreOcrTextForIngredientLabel(text, confidence);
}

async function recognizePreparedImage(
  images: PreparedOcrImage[],
  tesseract: TesseractModule,
) {
  const worker = await getOcrWorker(publicAppConfig.ocrLanguage, tesseract);
  const attempts = [
    { image: images[0]?.image, psm: tesseract.PSM.SINGLE_BLOCK, label: images[0]?.label },
    { image: images[0]?.image, psm: tesseract.PSM.SPARSE_TEXT, label: images[0]?.label },
    { image: images[1]?.image, psm: tesseract.PSM.SINGLE_BLOCK, label: images[1]?.label },
  ].filter(
    (
      attempt,
    ): attempt is {
      image: Blob | File | HTMLCanvasElement;
      psm: TesseractPageSegMode;
      label: string;
    } => Boolean(attempt.image && attempt.label),
  );

  let bestResult: TesseractResult | null = null;

  for (let index = 0; index < attempts.length; index += 1) {
    const attempt = attempts[index]!;

    if (index > 0) {
      emitProgress(
        0.72 + index * 0.07,
        `Trying another OCR pass on the ${attempt.label}...`,
      );
    }

    await worker.setParameters({
      tessedit_pageseg_mode: attempt.psm,
    });

    const result = await worker.recognize(attempt.image, { rotateAuto: true });

    if (!bestResult || scoreOcrResult(result) > scoreOcrResult(bestResult)) {
      bestResult = result;
    }

    if (!shouldRunAnotherPass(bestResult)) {
      break;
    }
  }

  await worker.setParameters({
    tessedit_pageseg_mode: tesseract.PSM.SINGLE_BLOCK,
  });

  if (!bestResult) {
    throw new Error("OCR did not return a result.");
  }

  return bestResult;
}

export async function extractIngredientTextFromImage(
  image: Blob | File,
  options?: OcrExtractionOptions,
): Promise<OcrExtractionResult> {
  return enqueueOcr(async () => {
    activeProgressListener = options?.onProgress;

    try {
      const preparedImages = await prepareImagesForOcr(image);
      const tesseract = await import("tesseract.js");
      const result = await withTimeout(
        recognizePreparedImage(preparedImages, tesseract),
        options?.timeoutMs ?? DEFAULT_OCR_TIMEOUT_MS,
      );
      const rawText = result.data?.text ?? "";
      const averageConfidence =
        typeof result.data?.confidence === "number"
          ? result.data.confidence
          : null;
      const cleaned = cleanOcrIngredientText(rawText, {
        averageConfidence,
      });

      emitProgress(1, "Ingredient text ready for review.");
      scheduleWorkerCleanup();

      return {
        rawText,
        averageConfidence,
        ...cleaned,
      };
    } catch (error) {
      if (error instanceof IngredientOcrTimeoutError) {
        await disposeIngredientOcrWorker();
      }
      throw error;
    } finally {
      activeProgressListener = undefined;
    }
  });
}
