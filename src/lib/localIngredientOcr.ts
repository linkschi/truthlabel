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

const DEFAULT_OCR_TIMEOUT_MS = 65_000;
const WORKER_IDLE_TIMEOUT_MS = 45_000;
const OCR_MIN_SHORT_EDGE = 1_400;
const OCR_MAX_LONG_EDGE = 2_600;
const OCR_MAX_PIXELS = 5_000_000;

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

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
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

async function prepareImageForOcr(image: Blob | File) {
  if (
    typeof document === "undefined" ||
    typeof Image === "undefined" ||
    typeof URL === "undefined"
  ) {
    return image as Blob | File | HTMLCanvasElement;
  }

  emitProgress(0.02, "Preparing photo...");
  const drawable = await loadOcrDrawable(image);

  try {
    const target = getOcrTargetDimensions(drawable.width, drawable.height);
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const context = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: true,
    });

    if (!context) {
      return image;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(drawable.source, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let sampledBrightness = 0;
      let sampleCount = 0;

      for (let index = 0; index < pixels.length; index += 64) {
        sampledBrightness +=
          pixels[index] * 0.299 +
          pixels[index + 1] * 0.587 +
          pixels[index + 2] * 0.114;
        sampleCount += 1;
      }

      const midpoint = sampleCount > 0 ? sampledBrightness / sampleCount : 128;
      const contrast = midpoint < 85 || midpoint > 205 ? 1.42 : 1.28;

      for (let index = 0; index < pixels.length; index += 4) {
        const grey =
          pixels[index] * 0.299 +
          pixels[index + 1] * 0.587 +
          pixels[index + 2] * 0.114;
        const adjusted = Math.max(
          0,
          Math.min(255, (grey - midpoint) * contrast + 142),
        );
        pixels[index] = adjusted;
        pixels[index + 1] = adjusted;
        pixels[index + 2] = adjusted;
        pixels[index + 3] = 255;
      }

      context.putImageData(imageData, 0, 0);
    } catch {
      // The resized image is still useful if pixel processing is unavailable.
    }

    emitProgress(0.05, "Photo prepared. Starting text reader...");
    return canvas;
  } finally {
    drawable.close();
  }
}

function shouldRunSecondPass(result: TesseractResult) {
  const text = result.data?.text?.trim() ?? "";
  const confidence = result.data?.confidence ?? 0;
  return text.length < 45 || confidence < 46;
}

function scoreOcrResult(result: TesseractResult) {
  const text = result.data?.text?.trim() ?? "";
  const confidence = result.data?.confidence ?? 0;
  const punctuationSignals = (text.match(/[,;:()]/g) ?? []).length;
  const ingredientHeadingBonus = /\bingredients?\b/i.test(text) ? 80 : 0;

  return (
    Math.min(text.length, 800) +
    confidence * 3 +
    Math.min(punctuationSignals, 30) * 4 +
    ingredientHeadingBonus
  );
}

async function recognizePreparedImage(
  image: Blob | File | HTMLCanvasElement,
  tesseract: TesseractModule,
) {
  const worker = await getOcrWorker(publicAppConfig.ocrLanguage, tesseract);
  let bestResult = await worker.recognize(image, { rotateAuto: true });

  if (shouldRunSecondPass(bestResult)) {
    emitProgress(0.82, "Trying a second reading pass...");
    await worker.setParameters({
      tessedit_pageseg_mode: tesseract.PSM.SPARSE_TEXT,
    });

    try {
      const secondResult = await worker.recognize(image, { rotateAuto: true });
      if (scoreOcrResult(secondResult) > scoreOcrResult(bestResult)) {
        bestResult = secondResult;
      }
    } finally {
      await worker.setParameters({
        tessedit_pageseg_mode: tesseract.PSM.SINGLE_BLOCK,
      });
    }
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
      const preparedImage = await prepareImageForOcr(image);
      const tesseract = await import("tesseract.js");
      const result = await withTimeout(
        recognizePreparedImage(preparedImage, tesseract),
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
