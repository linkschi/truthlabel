import assert from "node:assert/strict";
import test from "node:test";

import { normalizeAnalyticsRequest } from "./analyticsServer";

test("analytics server normalizes a valid client payload", () => {
  const records = normalizeAnalyticsRequest({
    events: [
      {
        eventName: "result_page_loaded",
        anonymousId: "visitor-123",
        userId: "11111111-1111-4111-8111-111111111111",
        routePath: "/app/results",
        referrerPath: "/app/scan",
        appVersion: "0.1.0",
        buildDate: "2026-07-28",
        occurredAt: "2026-07-28T10:00:00.000Z",
        device: {
          device_type: "mobile",
          os_name: "ios",
          browser_name: "safari",
          viewport_width: 390,
          viewport_height: 844,
        },
        metadata: {
          verdict_tone: "red",
          password: "do-not-store",
        },
      },
    ],
  });

  assert.equal(records.length, 1);
  assert.equal(records[0]?.event_name, "result_page_loaded");
  assert.equal(records[0]?.route_path, "/app/results");
  assert.equal(records[0]?.device_type, "mobile");
  assert.equal(records[0]?.metadata.verdict_tone, "red");
  assert.equal(records[0]?.metadata.password, undefined);
});

test("analytics server rejects unknown event names", () => {
  const records = normalizeAnalyticsRequest({
    events: [
      {
        eventName: "unknown_event",
        anonymousId: "visitor-123",
      },
    ],
  });

  assert.deepEqual(records, []);
});

test("analytics server caps events per request", () => {
  const records = normalizeAnalyticsRequest({
    events: Array.from({ length: 20 }, (_, index) => ({
      eventName: "page_view",
      anonymousId: `visitor-${index}`,
      routePath: "/",
    })),
  });

  assert.equal(records.length, 10);
});
