import assert from "node:assert/strict";
import test from "node:test";

import {
  buildHistoryScoreLabel,
  formatRelativeScanTime,
  getHistoryDateGroupLabel,
  groupScanHistoryByDate,
} from "@/lib/scanHistory/scanHistoryDisplay";
import type { ScanHistoryListItem } from "@/lib/scanHistory/scanHistoryTypes";

function historyItem(
  id: string,
  scannedAt: string,
  severity: "green" | "yellow" | "red" = "green",
): ScanHistoryListItem {
  return {
    id,
    userId: "user-1",
    barcode: id,
    scannedAt,
    product: {
      name: `Product ${id}`,
      brand: "Brand",
      quantity: null,
      imageUrl: null,
      category: null,
    },
    summary: {
      score: severity === "red" ? 70 : 18,
      overallSeverity: severity,
      verdictKey: severity,
      verdictLabel: severity === "red" ? "Do not consume" : "No major concerns",
      greenCount: 1,
      yellowCount: 0,
      redCount: severity === "red" ? 1 : 0,
      seriousRedCount: severity === "red" ? 1 : 0,
      overloadRedCount: 0,
      allergenRedCount: 0,
    },
    createdAt: scannedAt,
  };
}

test("history date grouping uses the requested labels", () => {
  const now = new Date("2026-07-23T12:00:00.000Z");

  assert.equal(getHistoryDateGroupLabel("2026-07-23T08:00:00.000Z", now), "Today");
  assert.equal(
    getHistoryDateGroupLabel("2026-07-22T08:00:00.000Z", now),
    "Yesterday",
  );
  assert.equal(
    getHistoryDateGroupLabel("2026-07-20T08:00:00.000Z", now),
    "Earlier this week",
  );
  assert.equal(getHistoryDateGroupLabel("2026-07-10T08:00:00.000Z", now), "Older");
});

test("history records are grouped in display order", () => {
  const now = new Date("2026-07-23T12:00:00.000Z");
  const groups = groupScanHistoryByDate(
    [
      historyItem("old", "2026-07-01T08:00:00.000Z"),
      historyItem("today", "2026-07-23T08:00:00.000Z"),
      historyItem("yesterday", "2026-07-22T08:00:00.000Z"),
    ],
    now,
  );

  assert.deepEqual(
    groups.map((group) => group.label),
    ["Today", "Yesterday", "Older"],
  );
});

test("history score label uses saved verdict, not only score threshold", () => {
  const record = historyItem("red", "2026-07-23T08:00:00.000Z", "red");

  assert.match(buildHistoryScoreLabel(record), /70 out of 100/);
  assert.match(buildHistoryScoreLabel(record), /Do not consume/);
});

test("relative scan time stays compact", () => {
  assert.equal(
    formatRelativeScanTime(
      "2026-07-23T11:30:00.000Z",
      new Date("2026-07-23T12:00:00.000Z"),
    ),
    "Scanned 30 minutes ago",
  );
});
