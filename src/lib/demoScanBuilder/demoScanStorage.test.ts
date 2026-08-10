import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";

import {
  deleteDemoScan,
  listDemoScans,
  saveDemoScan,
} from "@/lib/demoScanBuilder/demoScanStorage";
import { createStarterDemoScan } from "@/lib/demoScanBuilder/demoScanTypes";

function withNoWindow(callback: () => void) {
  const hadWindow = "window" in globalThis;
  const originalWindow = hadWindow ? globalThis.window : undefined;

  Reflect.deleteProperty(globalThis, "window");

  try {
    callback();
  } finally {
    if (hadWindow) {
      Object.defineProperty(globalThis, "window", {
        value: originalWindow,
        configurable: true,
      });
    }
  }
}

function createDom() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://truthlabel.test",
  });

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
  });

  return dom;
}

test("demo scan storage keeps an in-memory fallback when localStorage is unavailable", () => {
  withNoWindow(() => {
    const record = createStarterDemoScan();
    const savedRecord = saveDemoScan(record);

    assert.equal(savedRecord.id, record.id);
    assert.ok(listDemoScans().some((entry) => entry.id === record.id));

    deleteDemoScan(record.id);
    assert.equal(listDemoScans().length, 0);
  });
});

test("demo scan storage reuses its parsed snapshot while localStorage is unchanged", () => {
  const dom = createDom();

  try {
    const firstRecord = createStarterDemoScan();
    const secondRecord = createStarterDemoScan();
    secondRecord.updatedAt = "2026-08-10T00:00:00.000Z";
    firstRecord.updatedAt = "2026-08-09T00:00:00.000Z";

    dom.window.localStorage.setItem(
      "truthlabel.admin.demoScans.v1",
      JSON.stringify([firstRecord, secondRecord]),
    );

    const firstSnapshot = listDemoScans();
    const secondSnapshot = listDemoScans();

    assert.strictEqual(secondSnapshot, firstSnapshot);
    assert.equal(firstSnapshot[0]?.id, secondRecord.id);
  } finally {
    dom.window.close();
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");
  }
});
