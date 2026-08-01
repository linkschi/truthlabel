import assert from "node:assert/strict";
import test from "node:test";

import { buildAnalyticsSummary, type AnalyticsEventRow } from "./analyticsSummary";

function event(
  eventName: string,
  overrides: Partial<AnalyticsEventRow> = {},
): AnalyticsEventRow {
  return {
    event_name: eventName,
    anonymous_id: "anon-1",
    user_id: "11111111-1111-4111-8111-111111111111",
    route_path: "/",
    device_type: "mobile",
    os_name: "ios",
    browser_name: "safari",
    metadata: {},
    created_at: "2026-07-28T10:00:00.000Z",
    ...overrides,
  };
}

test("analytics summary builds the core business funnel", () => {
  const summary = buildAnalyticsSummary({
    periodDays: 7,
    generatedAt: "2026-07-28T12:00:00.000Z",
    events: [
      event("page_view", { route_path: "/" }),
      event("trial_cta_clicked"),
      event("signup_started"),
      event("signup_success"),
      event("checkout_started"),
      event("activation_success"),
      event("result_page_loaded", {
        metadata: { verdict_tone: "green" },
      }),
    ],
    purchases: [
      {
        status: "active",
        matched_user_id: "11111111-1111-4111-8111-111111111111",
        created_at: "2026-07-28T10:05:00.000Z",
      },
    ],
    subscriptions: [
      {
        status: "active",
        created_at: "2026-07-28T10:06:00.000Z",
      },
    ],
  });

  assert.equal(summary.business.landingVisitors, 1);
  assert.equal(summary.business.trialClicks, 1);
  assert.equal(summary.business.checkoutStarted, 1);
  assert.equal(summary.business.activationSuccess, 1);
  assert.equal(summary.business.purchaseEvents, 1);
  assert.equal(summary.business.activeSubscriptions, 1);
  assert.equal(summary.reliability.resultPagesLoaded, 1);
});

test("analytics summary raises an alert for unmatched purchases", () => {
  const summary = buildAnalyticsSummary({
    periodDays: 7,
    events: [event("checkout_started")],
    purchases: [
      {
        status: "active",
        matched_user_id: null,
        created_at: "2026-07-28T10:05:00.000Z",
      },
    ],
    subscriptions: [],
  });

  assert.equal(summary.business.unmatchedPurchases, 1);
  assert.ok(summary.alerts.some((alert) => alert.id === "paid_not_matched"));
});

test("analytics summary counts safe error types for reliability review", () => {
  const summary = buildAnalyticsSummary({
    periodDays: 7,
    events: [
      event("barcode_lookup_failed", {
        metadata: { error_type: "network_error" },
      }),
      event("barcode_lookup_failed", {
        metadata: { error_type: "network_error" },
      }),
      event("ocr_scan_failed", {
        metadata: { error_type: "ocr_timeout" },
      }),
      event("access_check_failed", {
        metadata: { error_type: "database_error" },
      }),
      event("client_error_captured", {
        metadata: { error_type: "app_error" },
      }),
    ],
    purchases: [],
    subscriptions: [],
  });

  assert.deepEqual(summary.reliability.topErrorTypes.slice(0, 4), [
    { label: "network_error", count: 2 },
    { label: "app_error", count: 1 },
    { label: "database_error", count: 1 },
    { label: "ocr_timeout", count: 1 },
  ]);
  assert.ok(summary.alerts.some((alert) => alert.id === "access_check_failures"));
  assert.ok(summary.alerts.some((alert) => alert.id === "client_errors"));
});
