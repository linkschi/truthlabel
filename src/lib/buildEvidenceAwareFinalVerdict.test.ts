import assert from "node:assert/strict";
import test from "node:test";

import type { ExposureRiskMainReason } from "./calculateExposureRisk";
import { buildEvidenceAwareFinalVerdict } from "./buildEvidenceAwareFinalVerdict";
import type { ExternalSafetySignal } from "./externalSafety/externalSafetyTypes";

function reason(
  categoryId: string,
  severity: "yellow" | "red",
  reasonType: ExposureRiskMainReason["reasonType"],
  matchedItems: string[] = [],
): ExposureRiskMainReason {
  return {
    categoryId,
    categoryName: categoryId.replaceAll("_", " "),
    severity,
    reasonType,
    message: "Test reason",
    matchedItems,
  };
}

function safetySignal(
  overrides: Partial<ExternalSafetySignal> = {},
): ExternalSafetySignal {
  return {
    id: "signal-1",
    sourceProvider: "mock",
    sourceName: "Official test source",
    region: "US",
    signalType: "active_recall",
    status: "active",
    severity: "red",
    title: "Active product recall",
    matchedBy: ["barcode"],
    matchConfidence: "high",
    userFacingMessage: "Official recall found.",
    ...overrides,
  };
}

test("green-only results report no major concerns", () => {
  const verdict = buildEvidenceAwareFinalVerdict({ mainReasons: [] });

  assert.equal(verdict.verdictCode, "clear");
  assert.equal(verdict.verdictLabel, "No major concerns");
  assert.equal(verdict.verdictTone, "green");
});

test("yellow-only findings use moderation wording", () => {
  const verdict = buildEvidenceAwareFinalVerdict({
    mainReasons: [reason("preservatives", "yellow", "yellow_category")],
  });

  assert.equal(verdict.verdictCode, "moderate");
  assert.equal(verdict.verdictLabel, "Consume in moderation");
  assert.match(verdict.summary, /consume it in moderation/i);
});

test("several yellow findings use occasional-choice wording", () => {
  const verdict = buildEvidenceAwareFinalVerdict({
    mainReasons: [
      reason("preservatives", "yellow", "yellow_category"),
      reason("seed_oils", "yellow", "yellow_category"),
      reason("processing", "yellow", "yellow_category"),
    ],
  });

  assert.equal(verdict.verdictLabel, "Consume in moderation");
  assert.equal(verdict.yellowCount, 3);
  assert.match(verdict.summary, /occasional choice/i);
});

test("one overload red limits consumption without calling it a serious ingredient", () => {
  const verdict = buildEvidenceAwareFinalVerdict({
    mainReasons: [reason("preservatives", "red", "count_overload")],
  });

  assert.equal(verdict.verdictCode, "limit");
  assert.equal(verdict.verdictLabel, "Limit consumption");
  assert.equal(verdict.overloadRedCount, 1);
  assert.equal(verdict.seriousRedCount, 0);
});

test("two overload reds remain a limit verdict", () => {
  const verdict = buildEvidenceAwareFinalVerdict({
    mainReasons: [
      reason("preservatives", "red", "count_overload"),
      reason("seed_oils", "red", "count_overload"),
    ],
  });

  assert.equal(verdict.verdictCode, "limit");
  assert.equal(verdict.overloadRedCount, 2);
  assert.match(verdict.summary, /consumed occasionally/i);
});

test("one serious red recommends avoiding", () => {
  const verdict = buildEvidenceAwareFinalVerdict({
    mainReasons: [reason("banned_items", "red", "banned_restricted")],
  });

  assert.equal(verdict.verdictCode, "avoid");
  assert.equal(verdict.verdictLabel, "Recommended to avoid");
  assert.equal(verdict.seriousRedCount, 1);
});

test("three overload reds recommend avoiding", () => {
  const verdict = buildEvidenceAwareFinalVerdict({
    mainReasons: [
      reason("preservatives", "red", "count_overload"),
      reason("seed_oils", "red", "count_overload"),
      reason("processing", "red", "high_processed_share"),
    ],
  });

  assert.equal(verdict.verdictCode, "avoid");
  assert.equal(verdict.totalRedCount, 3);
});

test("a selected allergen overrides red counts with a conditional do-not-consume verdict", () => {
  const verdict = buildEvidenceAwareFinalVerdict({
    mainReasons: [
      reason("allergy_risk", "red", "allergy_profile_match", ["Milk"]),
    ],
  });

  assert.equal(verdict.verdictCode, "do_not_consume");
  assert.equal(verdict.immediateStopReason, "selected_allergen");
  assert.match(verdict.opening, /Milk/);
  assert.match(verdict.summary, /if you are allergic to Milk/i);
});

test("a cross-contact allergy warning remains red without claiming direct presence", () => {
  const allergyReason = reason(
    "allergy_risk",
    "red",
    "allergy_profile_match",
    ["May contain milk"],
  );
  allergyReason.message =
    "This label includes a possible cross-contact warning for milk, which matches your allergy profile.";

  const verdict = buildEvidenceAwareFinalVerdict({
    mainReasons: [allergyReason],
  });

  assert.equal(verdict.verdictCode, "avoid");
  assert.equal(verdict.verdictLabel, "Recommended to avoid");
  assert.equal(verdict.immediateStopReason, undefined);
});

test("a high-confidence active recall overrides category counts", () => {
  const verdict = buildEvidenceAwareFinalVerdict({
    mainReasons: [
      reason("brand_trust_safety", "red", "verified_external_signal"),
    ],
    externalSignals: [safetySignal()],
  });

  assert.equal(verdict.verdictCode, "do_not_consume");
  assert.equal(verdict.immediateStopReason, "active_safety_alert");
  assert.match(verdict.summary, /Do not consume/i);
});

test("an undeclared-allergen recall gets specific immediate-stop wording", () => {
  const verdict = buildEvidenceAwareFinalVerdict({
    mainReasons: [
      reason("brand_trust_safety", "red", "verified_external_signal"),
    ],
    externalSignals: [safetySignal({ signalType: "allergen_recall" })],
  });

  assert.equal(verdict.immediateStopReason, "undeclared_allergen_recall");
  assert.match(verdict.opening, /undeclared allergen/i);
  assert.match(verdict.summary, /if the alert applies/i);
});

test("verified current contamination gets immediate-stop wording", () => {
  const verdict = buildEvidenceAwareFinalVerdict({
    mainReasons: [
      reason("heavy_metals", "red", "verified_external_signal"),
    ],
    externalSignals: [safetySignal({ signalType: "heavy_metal_warning" })],
  });

  assert.equal(verdict.immediateStopReason, "confirmed_contamination");
  assert.match(verdict.opening, /contamination warning/i);
});

test("historical and medium-confidence signals do not produce an immediate stop", () => {
  const historical = buildEvidenceAwareFinalVerdict({
    mainReasons: [
      reason("brand_trust_safety", "yellow", "yellow_category"),
    ],
    externalSignals: [
      safetySignal({
        signalType: "historical_recall",
        status: "historical",
        severity: "yellow",
      }),
    ],
  });
  const mediumConfidence = buildEvidenceAwareFinalVerdict({
    mainReasons: [
      reason("brand_trust_safety", "yellow", "yellow_category"),
    ],
    externalSignals: [
      safetySignal({ severity: "yellow", matchConfidence: "medium" }),
    ],
  });

  assert.equal(historical.verdictCode, "moderate");
  assert.equal(mediumConfidence.verdictCode, "moderate");
  assert.equal(historical.immediateStopReason, undefined);
  assert.equal(mediumConfidence.immediateStopReason, undefined);
});
