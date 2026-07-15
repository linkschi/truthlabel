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

test("CameraBarcodeScanner renders the scanner shell", async () => {
  const rendered = await renderScanner(undefined, {
    configureDom() {
      Object.defineProperty(globalThis.navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: () => new Promise(() => undefined),
        },
      });
    },
  });

  try {
    assert.match(rendered.container.textContent ?? "", /Scan Barcode/i);
    assert.match(rendered.container.textContent ?? "", /Allow camera access/i);
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
    await waitFor(() => {
      assert.match(rendered.container.textContent ?? "", /No camera was found/i);
    });
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
    await waitFor(() => {
      assert.deepEqual(detectedBarcodes, ["0123456789012"]);
      assert.equal(getStopCount(), 1);
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
