import assert from "node:assert/strict";
import test from "node:test";

import { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";

import PwaInstallPrompt from "./PwaInstallPrompt";

async function renderInstallPrompt({ standalone = false } = {}) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://truthlabel.example",
  });
  const container = dom.window.document.createElement("div");
  dom.window.document.body.appendChild(container);

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: dom.window.navigator,
  });
  Object.defineProperty(dom.window.navigator, "userAgent", {
    configurable: true,
    value: "Mozilla/5.0 (Linux; Android 15; Mobile) AppleWebKit/537.36",
  });
  Object.defineProperty(dom.window.navigator, "platform", {
    configurable: true,
    value: "Linux armv8l",
  });
  Object.defineProperty(dom.window, "matchMedia", {
    configurable: true,
    value(query: string) {
      return {
        matches: query.includes("display-mode") ? standalone : true,
        media: query,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent() {
          return true;
        },
      };
    },
  });

  const root = createRoot(container);
  await act(async () => {
    root.render(<PwaInstallPrompt />);
  });

  return {
    container,
    dom,
    async cleanup() {
      await act(async () => root.unmount());
      dom.window.close();
    },
  };
}

test("PwaInstallPrompt shows mobile installation guidance", async () => {
  const rendered = await renderInstallPrompt();

  try {
    assert.match(rendered.container.textContent ?? "", /Install TruthLabel/i);
    const button = rendered.container.querySelector("button");
    assert.ok(button);
    assert.match(button.textContent ?? "", /Show installation steps/i);

    await act(async () => {
      button.dispatchEvent(
        new rendered.dom.window.MouseEvent("click", { bubbles: true }),
      );
    });

    assert.match(
      rendered.container.textContent ?? "",
      /browser menu.*Install app.*Add to Home screen/i,
    );
  } finally {
    await rendered.cleanup();
  }
});

test("PwaInstallPrompt stays hidden in standalone mode", async () => {
  const rendered = await renderInstallPrompt({ standalone: true });

  try {
    assert.equal(rendered.container.textContent, "");
  } finally {
    await rendered.cleanup();
  }
});
