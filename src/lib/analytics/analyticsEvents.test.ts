import assert from "node:assert/strict";
import test from "node:test";

import {
  isAnalyticsEventName,
  normalizeAnalyticsError,
  sanitizeAnalyticsMetadata,
} from "./analyticsEvents";

test("analytics metadata removes sensitive fields but keeps safe context", () => {
  const result = sanitizeAnalyticsMetadata({
    password: "do-not-store",
    licenseKey: "do-not-store",
    ingredientText: "water, sugar",
    scan_source: "manual_paste",
    nested: {
      token: "do-not-store",
      lookup_status: "not_found",
    },
  });

  assert.equal(result.password, undefined);
  assert.equal(result.licenseKey, undefined);
  assert.equal(result.ingredientText, undefined);
  assert.equal(result.scan_source, "manual_paste");
  assert.deepEqual(result.nested, {
    lookup_status: "not_found",
  });
});

test("analytics event names are allow-listed", () => {
  assert.equal(isAnalyticsEventName("page_view"), true);
  assert.equal(isAnalyticsEventName("barcode_lookup_failed"), true);
  assert.equal(isAnalyticsEventName("totally_random_event"), false);
});

test("analytics errors are normalized into safe categories", () => {
  assert.equal(
    normalizeAnalyticsError(new Error("Too many reset emails")),
    "rate_limited",
  );
  assert.equal(
    normalizeAnalyticsError(new Error("Account access is not configured yet.")),
    "configuration_error",
  );
});
