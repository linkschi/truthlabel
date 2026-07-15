import assert from "node:assert/strict";
import test from "node:test";

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";

import { runManualScan, type ManualScanInput } from "@/lib/runManualScan";

import OcrIngredientScanner from "./OcrIngredientScanner";

type RenderedScanner = {
  container: HTMLDivElement;
  dom: JSDOM;
  root: Root;
  cleanup: () => Promise<void>;
};

function createMockStream() {
  let stopCount = 0;
  const track = {
    stop() {
      stopCount += 1;
    },
  } as MediaStreamTrack;
  const stream = {
    getTracks() {
      return [track];
    },
  } as MediaStream;

  return {
    stream,
    getStopCount() {
      return stopCount;
    },
  };
}

function createDom() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
  });

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: dom.window.navigator,
  });
  Object.defineProperty(globalThis, "HTMLElement", {
    configurable: true,
    value: dom.window.HTMLElement,
  });
  Object.defineProperty(globalThis, "HTMLVideoElement", {
    configurable: true,
    value: dom.window.HTMLVideoElement,
  });
  Object.defineProperty(globalThis, "HTMLCanvasElement", {
    configurable: true,
    value: dom.window.HTMLCanvasElement,
  });
  Object.defineProperty(globalThis, "File", {
    configurable: true,
    value: dom.window.File,
  });
  Object.defineProperty(globalThis, "MouseEvent", {
    configurable: true,
    value: dom.window.MouseEvent,
  });
  Object.defineProperty(globalThis, "Event", {
    configurable: true,
    value: dom.window.Event,
  });
  Object.defineProperty(globalThis, "URL", {
    configurable: true,
    value: {
      createObjectURL() {
        return "blob:mock-preview";
      },
      revokeObjectURL() {
        return undefined;
      },
    },
  });
  Object.defineProperty(dom.window.HTMLMediaElement.prototype, "play", {
    configurable: true,
    value() {
      return Promise.resolve();
    },
  });
  Object.defineProperty(dom.window.HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value() {
      return undefined;
    },
  });
  Object.defineProperty(dom.window.HTMLVideoElement.prototype, "videoWidth", {
    configurable: true,
    get() {
      return 1200;
    },
  });
  Object.defineProperty(dom.window.HTMLVideoElement.prototype, "videoHeight", {
    configurable: true,
    get() {
      return 800;
    },
  });
  Object.defineProperty(dom.window.HTMLVideoElement.prototype, "srcObject", {
    configurable: true,
    get() {
      return (this as HTMLVideoElement & { __srcObject?: MediaStream | null })
        .__srcObject;
    },
    set(value: MediaStream | null) {
      (
        this as HTMLVideoElement & {
          __srcObject?: MediaStream | null;
        }
      ).__srcObject = value;
    },
  });
  Object.defineProperty(dom.window.HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value() {
      return {
        drawImage() {
          return undefined;
        },
      };
    },
  });
  Object.defineProperty(dom.window.HTMLCanvasElement.prototype, "toBlob", {
    configurable: true,
    value(callback: (blob: Blob | null) => void) {
      callback(new Blob(["mock-image"], { type: "image/jpeg" }));
    },
  });

  return dom;
}

async function renderScanner(
  props?: Partial<Parameters<typeof OcrIngredientScanner>[0]>,
) {
  const dom = createDom();
  const container = dom.window.document.createElement("div");
  dom.window.document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <OcrIngredientScanner
        onTextConfirmed={props?.onTextConfirmed ?? (() => undefined)}
        onClose={props?.onClose ?? (() => undefined)}
        ocrRunner={props?.ocrRunner}
        mediaDevices={props?.mediaDevices}
      />,
    );
  });

  return {
    container,
    dom,
    root,
    async cleanup() {
      await act(async () => {
        root.unmount();
      });
      dom.window.close();
    },
  } satisfies RenderedScanner;
}

async function waitFor(assertion: () => void, timeoutMs = 2000) {
  const start = Date.now();
  let lastError: unknown;

  while (Date.now() - start < timeoutMs) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  throw lastError ?? new Error("Timed out while waiting for assertion.");
}

function setInputFiles(
  input: HTMLInputElement,
  files: File[],
) {
  Object.defineProperty(input, "files", {
    configurable: true,
    value: files,
  });
}

async function uploadImage(rendered: RenderedScanner, fileName = "label.jpg") {
  const uploadInput = rendered.container.querySelector(
    '[data-testid="ocr-upload-input"]',
  ) as HTMLInputElement | null;
  assert.ok(uploadInput);

  const file = new rendered.dom.window.File(["image"], fileName, {
    type: "image/jpeg",
  });
  setInputFiles(uploadInput, [file]);

  await act(async () => {
    uploadInput.dispatchEvent(
      new rendered.dom.window.Event("change", { bubbles: true }),
    );
  });
}

function requireScanInput(value: ManualScanInput | null) {
  assert.ok(value);
  return value;
}

test("OcrIngredientScanner renders the OCR instructions", async () => {
  const rendered = await renderScanner();

  try {
    assert.match(rendered.container.textContent ?? "", /Scan Ingredient Label/i);
    assert.match(
      rendered.container.textContent ?? "",
      /Scan or upload the ingredient label/i,
    );
  } finally {
    await rendered.cleanup();
  }
});

test("OcrIngredientScanner upload flow shows extracted text in an editable review box", async () => {
  const rendered = await renderScanner({
    ocrRunner: async () => ({
      rawText: "Ingredients: sugar, Red No. 3",
      averageConfidence: 83,
      ingredientText: "Sugar, Red No. 3",
      possibleAllergenStatement: "Contains: milk",
      confidenceWarnings: [
        "OCR may have misread some words. Please review before scanning.",
      ],
    }),
  });

  try {
    await uploadImage(rendered);

    await waitFor(() => {
      const textarea = rendered.container.querySelector(
        '[data-testid="ocr-ingredient-textarea"]',
      ) as HTMLTextAreaElement | null;

      assert.ok(textarea);
      assert.equal(textarea.value, "Sugar, Red No. 3");
      assert.match(rendered.container.textContent ?? "", /Contains: milk/i);
    });
  } finally {
    await rendered.cleanup();
  }
});

test("OcrIngredientScanner camera capture can trigger the OCR flow when camera support exists", async () => {
  const { stream, getStopCount } = createMockStream();
  const rendered = await renderScanner({
    mediaDevices: {
      getUserMedia: async () => stream,
    },
    ocrRunner: async () => ({
      rawText: "Ingredients: water, sugar",
      averageConfidence: 81,
      ingredientText: "Water, sugar",
      possibleAllergenStatement: "",
      confidenceWarnings: [],
    }),
  });

  try {
    const useCameraButton = Array.from(
      rendered.container.querySelectorAll("button"),
    ).find((button) => /use camera/i.test(button.textContent ?? ""));
    assert.ok(useCameraButton);

    await act(async () => {
      useCameraButton.dispatchEvent(
        new rendered.dom.window.MouseEvent("click", { bubbles: true }),
      );
    });

    await waitFor(() => {
      assert.match(rendered.container.textContent ?? "", /Capture Label/i);
    });

    const captureButton = Array.from(
      rendered.container.querySelectorAll("button"),
    ).find((button) => /capture label/i.test(button.textContent ?? ""));
    assert.ok(captureButton);

    await act(async () => {
      captureButton.dispatchEvent(
        new rendered.dom.window.MouseEvent("click", { bubbles: true }),
      );
    });

    await waitFor(() => {
      const textarea = rendered.container.querySelector(
        '[data-testid="ocr-ingredient-textarea"]',
      ) as HTMLTextAreaElement | null;
      assert.ok(textarea);
      assert.equal(textarea.value, "Water, sugar");
      assert.equal(getStopCount(), 1);
    });
  } finally {
    await rendered.cleanup();
  }
});

test("OcrIngredientScanner lets the user edit OCR text before confirming and can feed runManualScan with scanSource ocr", async () => {
  let capturedScanInput: ManualScanInput | null = null;
  let scanVerdictTone = "";
  let scanSource = "";
  let confidenceNotes: string[] = [];

  const rendered = await renderScanner({
    ocrRunner: async () => ({
      rawText: "Ingredients: water, sugar",
      averageConfidence: 67,
      ingredientText: "Water, sugar",
      possibleAllergenStatement: "Contains: milk",
      confidenceWarnings: [
        "OCR may have misread some words. Please review before scanning.",
        "OCR confidence was low, so some ingredient warnings may be incomplete.",
      ],
    }),
    onTextConfirmed(ingredientText, details) {
      capturedScanInput = {
        ingredientText,
        allergenStatement: details?.possibleAllergenStatement,
        userAllergyProfile: ["Milk"],
        scanSource: "ocr",
        additionalConfidenceNotes: details?.confidenceWarnings,
      };

      const result = runManualScan(capturedScanInput);
      scanVerdictTone = result.finalVerdict.verdictTone;
      scanSource = result.productHero.scanSource;
      confidenceNotes = result.confidenceNotes;
    },
  });

  try {
    await uploadImage(rendered);

    await waitFor(() => {
      const textarea = rendered.container.querySelector(
        '[data-testid="ocr-ingredient-textarea"]',
      ) as HTMLTextAreaElement | null;
      assert.ok(textarea);
    });

    const textarea = rendered.container.querySelector(
      '[data-testid="ocr-ingredient-textarea"]',
    ) as HTMLTextAreaElement;
    await act(async () => {
      textarea.value = "Water, sugar, Red No. 3, milk powder";
      textarea.dispatchEvent(
        new rendered.dom.window.Event("input", { bubbles: true }),
      );
    });

    const confirmButton = Array.from(
      rendered.container.querySelectorAll("button"),
    ).find((button) => /scan this label/i.test(button.textContent ?? ""));
    assert.ok(confirmButton);

    await act(async () => {
      confirmButton.dispatchEvent(
        new rendered.dom.window.MouseEvent("click", { bubbles: true }),
      );
    });

    const confirmedScanInput = requireScanInput(capturedScanInput);
    assert.equal(
      confirmedScanInput.ingredientText,
      "Water, sugar, Red No. 3, milk powder",
    );
    assert.equal(scanSource, "ocr");
    assert.equal(scanVerdictTone, "red");
    assert.ok(
      confidenceNotes.includes(
        "OCR text may contain mistakes. Check the ingredient list against the package label.",
      ),
    );
  } finally {
    await rendered.cleanup();
  }
});

test("OcrIngredientScanner shows a manual fallback message when no OCR text is detected", async () => {
  const rendered = await renderScanner({
    ocrRunner: async () => ({
      rawText: "",
      averageConfidence: 34,
      ingredientText: "",
      possibleAllergenStatement: "",
      confidenceWarnings: [
        "OCR may have misread some words. Please review before scanning.",
      ],
    }),
  });

  try {
    await uploadImage(rendered);

    await waitFor(() => {
      assert.match(
        rendered.container.textContent ?? "",
        /We could not read the ingredient label clearly/i,
      );
      assert.match(
        rendered.container.textContent ?? "",
        /paste the ingredients manually/i,
      );
    });
  } finally {
    await rendered.cleanup();
  }
});

test("OcrIngredientScanner shows a manual fallback message when OCR fails", async () => {
  const rendered = await renderScanner({
    ocrRunner: async () => {
      throw new Error("OCR failed");
    },
  });

  try {
    await uploadImage(rendered);

    await waitFor(() => {
      assert.match(
        rendered.container.textContent ?? "",
        /Ingredient label scan failed/i,
      );
      assert.match(
        rendered.container.textContent ?? "",
        /paste the ingredients manually/i,
      );
    });
  } finally {
    await rendered.cleanup();
  }
});
