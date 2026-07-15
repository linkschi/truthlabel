import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";

import { loadProfile } from "./profileStorage";

function createDom() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
  });

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
  });
  Object.defineProperty(globalThis, "StorageEvent", {
    configurable: true,
    value: dom.window.StorageEvent,
  });
  Object.defineProperty(globalThis, "Event", {
    configurable: true,
    value: dom.window.Event,
  });

  return dom;
}

test("loadProfile exposes the newer saved allergy settings in the legacy watch profile", () => {
  const dom = createDom();

  try {
    dom.window.localStorage.setItem(
      "insideit.user-settings",
      JSON.stringify({
        allergyProfile: {
          allergens: ["mustard", "sulfites"],
          customAllergens: [],
          lastUpdated: "2026-07-15T00:00:00.000Z",
        },
        regionSettings: {
          region: "UNKNOWN",
          country: "",
          language: "en",
        },
        scanPreferences: {
          defaultProductCategory: "General / Unknown",
          showNotCheckedExternalSections: true,
          showConfidenceNotes: true,
          autoRunExternalSafetyLookup: true,
        },
        settingsVersion: 1,
        updatedAt: "2026-07-15T00:00:00.000Z",
      }),
    );

    const profile = loadProfile();

    assert.ok(profile.allergies.includes("Mustard"));
    assert.ok(profile.allergies.includes("Sulphites"));
  } finally {
    dom.window.close();
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");
  }
});
