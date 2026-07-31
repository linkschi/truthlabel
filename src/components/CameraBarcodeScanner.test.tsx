import assert from "node:assert/strict";
import test from "node:test";

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";

import CameraBarcodeScanner from "./CameraBarcodeScanner";

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
  Object.defineProperty(globalThis, "MouseEvent", {
    configurable: true,
    value: dom.window.MouseEvent,
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
  Object.defineProperty(dom.window.HTMLVideoElement.prototype, "readyState", {
    configurable: true,
    get() {
      return 4;
    },
  });
  Object.defineProperty(dom.window.HTMLVideoElement.prototype, "videoWidth", {
    configurable: true,
    get() {
      return 1280;
    },
  });
  Object.defineProperty(dom.window.HTMLVideoElement.prototype, "videoHeight", {
    configurable: true,
    get() {
      return 720;
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

  return dom;
}

async function renderScanner(
  props?: Partial<Parameters<typeof CameraBarcodeScanner>[0]>,
  options?: {
    configureDom?: (dom: JSDOM) => void;
  },
) {
  const dom = createDom();
  options?.configureDom?.(dom);
  const container = dom.window.document.createElement("div");
  dom.window.document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <CameraBarcodeScanner
        {...props}
        onBarcodeDetected={props?.onBarcodeDetected ?? (() => undefined)}
        onClose={props?.onClose ?? (() => undefined)}
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
      delete (
        globalThis as typeof globalThis & {
          BarcodeDetector?: unknown;
        }
      ).BarcodeDetector;
    },
  } satisfies RenderedScanner;
}

async function waitFor<T>(assertion: () => T, timeoutMs = 2000): Promise<T> {
  const start = Date.now();
  let lastError: unknown;

  while (Date.now() - start < timeoutMs) {
    try {
      return assertion();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  throw lastError ?? new Error("Timed out while waiting for assertion.");
}

async function clickButton(rendered: RenderedScanner, label: RegExp) {
  const button = Array.from(
    rendered.container.querySelectorAll("button"),
  ).find((candidate) => label.test(candidate.textContent ?? ""));
  assert.ok(button, `Expected button matching ${label}`);

  await act(async () => {
    button.dispatchEvent(
      new rendered.dom.window.MouseEvent("click", { bubbles: true }),
    );
  });
}

async function allowCamera(rendered: RenderedScanner) {
  await clickButton(rendered, /Allow camera/i);
}

test("CameraBarcodeScanner renders the scanner shell", async () => {
  let cameraRequested = false;
  const rendered = await renderScanner(undefined, {
    configureDom() {
      Object.defineProperty(globalThis.navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: () => {
            cameraRequested = true;
            return new Promise(() => undefined);
          },
        },
      });
    },
  });

  try {
    assert.match(rendered.container.textContent ?? "", /Camera permission/i);
    assert.match(rendered.container.textContent ?? "", /Truthlabel needs your camera/i);
    assert.match(rendered.container.textContent ?? "", /Allow camera/i);
    assert.equal(cameraRequested, false);
  } finally {
    await rendered.cleanup();
  }
});

test("CameraBarcodeScanner shows permission denied message", async () => {
  const rendered = await renderScanner(undefined, {
    configureDom() {
      Object.defineProperty(globalThis.navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () => {
            const error = new Error("Permission denied");
            error.name = "NotAllowedError";
            throw error;
          },
        },
      });
    },
  });

  try {
    await allowCamera(rendered);
    await waitFor(() => {
      assert.match(
        rendered.container.textContent ?? "",
        /Camera access was blocked/i,
      );
    });
  } finally {
    await rendered.cleanup();
  }
});

test("CameraBarcodeScanner shows no camera message", async () => {
  const rendered = await renderScanner(undefined, {
    configureDom() {
      Object.defineProperty(globalThis.navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () => {
            const error = new Error("No camera");
            error.name = "NotFoundError";
            throw error;
          },
        },
      });
    },
  });

  try {
    await allowCamera(rendered);
    await waitFor(() => {
      assert.match(rendered.container.textContent ?? "", /No camera was found/i);
    });
  } finally {
    await rendered.cleanup();
  }
});

test("CameraBarcodeScanner supports ingredient photo upload and editable OCR review", async () => {
  const confirmedTexts: string[] = [];
  const rendered = await renderScanner(
    {
      initialMode: "ingredients",
      ocrRunner: async () => ({
        rawText: "Ingredients: Water, Red No. 3",
        ingredientText: "Water, Red No. 3",
        possibleAllergenStatement: "Contains milk",
        averageConfidence: 88,
        confidenceWarnings: [
          "OCR may have misread some words. Please review before scanning.",
        ],
      }),
      onTextConfirmed(ingredientText) {
        confirmedTexts.push(ingredientText);
      },
    },
    {
      configureDom() {
        Object.defineProperty(globalThis.navigator, "mediaDevices", {
          configurable: true,
          value: {
            getUserMedia: () => new Promise(() => undefined),
          },
        });
      },
    },
  );

  try {
    const fileInput = rendered.container.querySelector<HTMLInputElement>(
      '[data-testid="camera-ingredient-upload-input"]',
    );
    assert.ok(fileInput);

    Object.defineProperty(fileInput, "files", {
      configurable: true,
      value: [
        new rendered.dom.window.File(["label"], "label.jpg", {
          type: "image/jpeg",
        }),
      ],
    });

    await act(async () => {
      fileInput.dispatchEvent(
        new rendered.dom.window.Event("change", { bubbles: true }),
      );
    });

    const textarea = await waitFor(() => {
      const node = rendered.container.querySelector<HTMLTextAreaElement>(
        '[data-testid="camera-ingredient-textarea"]',
      );
      assert.ok(node);
      assert.equal(node.value, "Water, Red No. 3");
      return node;
    });

    assert.equal(textarea.disabled, false);
    assert.equal(textarea.readOnly, false);

    const analyseButton = Array.from(
      rendered.container.querySelectorAll("button"),
    ).find((button) => /Analyse ingredients/i.test(button.textContent ?? ""));
    assert.ok(analyseButton);

    await act(async () => {
      analyseButton.dispatchEvent(
        new rendered.dom.window.MouseEvent("click", { bubbles: true }),
      );
    });

    assert.deepEqual(confirmedTexts, ["Water, Red No. 3"]);
  } finally {
    await rendered.cleanup();
  }
});

test("CameraBarcodeScanner detects a barcode and stops the stream", async () => {
  const { stream, getStopCount } = createMockStream();
  const detectedBarcodes: string[] = [];
  const rendered = await renderScanner(
    {
      onBarcodeDetected(barcode) {
        detectedBarcodes.push(barcode);
      },
    },
    {
      configureDom() {
      Object.defineProperty(globalThis.navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () => stream,
        },
      });
      Object.defineProperty(globalThis, "BarcodeDetector", {
        configurable: true,
        value: class MockBarcodeDetector {
          static async getSupportedFormats() {
            return ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"];
          }

          async detect() {
            return [{ rawValue: "0123456789012" }];
          }
        },
      });
    },
    },
  );

  try {
    await allowCamera(rendered);
    await waitFor(() => {
      assert.deepEqual(detectedBarcodes, ["0123456789012"]);
      assert.equal(getStopCount(), 1);
    });
  } finally {
    await rendered.cleanup();
  }
});

test("CameraBarcodeScanner keeps a pending lookup alive when its parent callback changes", async () => {
  const { stream } = createMockStream();
  let resolveLookup!: (value: { lookupStatus: string }) => void;
  const pendingLookup = new Promise<{ lookupStatus: string }>((resolve) => {
    resolveLookup = resolve;
  });
  const rendered = await renderScanner(
    {
      onBarcodeDetected() {
        return pendingLookup;
      },
    },
    {
      configureDom() {
        Object.defineProperty(globalThis.navigator, "mediaDevices", {
          configurable: true,
          value: {
            getUserMedia: async () => stream,
          },
        });
        Object.defineProperty(globalThis, "BarcodeDetector", {
          configurable: true,
          value: class MockBarcodeDetector {
            static async getSupportedFormats() {
              return ["ean_13"];
            }

            async detect() {
              return [{ rawValue: "0123456789012" }];
            }
          },
        });
      },
    },
  );

  try {
    await allowCamera(rendered);
    await waitFor(() => {
      assert.match(rendered.container.textContent ?? "", /Finding product/i);
    });

    await act(async () => {
      rendered.root.render(
        <CameraBarcodeScanner
          onBarcodeDetected={() => ({ lookupStatus: "found" })}
          onClose={() => undefined}
        />,
      );
    });

    await act(async () => {
      resolveLookup({ lookupStatus: "not_found" });
      await pendingLookup;
    });

    await waitFor(() => {
      assert.match(rendered.container.textContent ?? "", /Product not found/i);
    });
  } finally {
    await rendered.cleanup();
  }
});

test("CameraBarcodeScanner recovers when product lookup times out", async () => {
  const { stream } = createMockStream();
  const rendered = await renderScanner(
    {
      barcodeLookupTimeoutMs: 25,
      onBarcodeDetected() {
        return new Promise(() => undefined);
      },
    },
    {
      configureDom() {
        Object.defineProperty(globalThis.navigator, "mediaDevices", {
          configurable: true,
          value: {
            getUserMedia: async () => stream,
          },
        });
        Object.defineProperty(globalThis, "BarcodeDetector", {
          configurable: true,
          value: class MockBarcodeDetector {
            static async getSupportedFormats() {
              return ["ean_13"];
            }

            async detect() {
              return [{ rawValue: "0123456789012" }];
            }
          },
        });
      },
    },
  );

  try {
    await allowCamera(rendered);
    await waitFor(() => {
      assert.match(rendered.container.textContent ?? "", /Lookup took too long/i);
      assert.match(rendered.container.textContent ?? "", /enter the details manually/i);
    });
  } finally {
    await rendered.cleanup();
  }
});

test("CameraBarcodeScanner close button cleans up the stream", async () => {
  const { stream, getStopCount } = createMockStream();
  let closeCount = 0;
  const rendered = await renderScanner(
    {
      onClose() {
        closeCount += 1;
      },
    },
    {
      configureDom() {
      Object.defineProperty(globalThis.navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () => stream,
        },
      });
      Object.defineProperty(globalThis, "BarcodeDetector", {
        configurable: true,
        value: class MockBarcodeDetector {
          static async getSupportedFormats() {
            return ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"];
          }

          async detect() {
            return [];
          }
        },
      });
    },
    },
  );

  try {
    await allowCamera(rendered);
    await waitFor(() => {
      assert.match(rendered.container.textContent ?? "", /Align the barcode/i);
    });

    const closeButton = rendered.container.querySelector("button");
    assert.ok(closeButton);

    await act(async () => {
      closeButton.dispatchEvent(
        new rendered.dom.window.MouseEvent("click", { bubbles: true }),
      );
    });

    assert.equal(closeCount, 1);
    assert.equal(getStopCount(), 1);
  } finally {
    await rendered.cleanup();
  }
});
