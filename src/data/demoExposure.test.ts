import assert from "node:assert/strict";
import test from "node:test";

import {
  getDemoExposureReport,
  type DemoExposureOptions,
} from "./demoExposure";
import type { UserProfile } from "./fakeProduct";

const neutralProfile: UserProfile = {
  allergies: [],
  avoid: [],
};

const quietAutomaticOverrides: NonNullable<DemoExposureOptions["checkOverrides"]> = {
  allergy_risk: {
    value: "No",
    severity: "green",
    redCount: 0,
    yellowCount: 0,
    clearLabel: "No",
  },
  banned_restricted_items: {
    value: "No",
    severity: "green",
    redCount: 0,
    yellowCount: 0,
    clearLabel: "No",
  },
  cancer_linked_watch: {
    value: "No",
    severity: "green",
    redCount: 0,
    yellowCount: 0,
    clearLabel: "No",
  },
};

function getQuickOverviewIds(
  report: ReturnType<typeof getDemoExposureReport>,
) {
  return report.quickOverviewRows.map((row) => row.id);
}

function getDeepCheckIds(
  report: ReturnType<typeof getDemoExposureReport>,
) {
  return report.deepCheckRows.map((row) => row.id);
}

test("Microplastics detected appears in Quick Overview for packaged processed foods", () => {
  const report = getDemoExposureReport("packaged-processed-foods", neutralProfile, {
    checkOverrides: {
      microplastics: {
        value: "Detected",
        severity: "red",
        redCount: 1,
        yellowCount: 0,
      },
    },
  });

  assert.ok(getQuickOverviewIds(report).includes("microplastics"));
});

test("Artificial / Engineered Food Construction appears in Quick Overview with a red count for the demo product", () => {
  const report = getDemoExposureReport("packaged-processed-foods", neutralProfile, {
    checkOverrides: quietAutomaticOverrides,
  });
  const row = report.quickOverviewRows.find(
    (item) => item.id === "artificial_engineered_food_construction",
  );

  assert.ok(row);
  assert.equal(row?.tone, "red");
  assert.ok((row?.redCount ?? 0) >= 4);
});

test("Heavy Metals likely appears in Quick Overview for drinks beverages", () => {
  const report = getDemoExposureReport("drinks-beverages", neutralProfile, {
    checkOverrides: {
      heavy_metals: {
        value: "Likely",
        severity: "red",
        redCount: 1,
        yellowCount: 0,
      },
    },
  });

  assert.ok(getQuickOverviewIds(report).includes("heavy_metals"));
});

test("Recall Warning appears in Quick Overview for any category when found", () => {
  const report = getDemoExposureReport("fresh-simple-foods", neutralProfile, {
    checkOverrides: {
      lawsuits_recalls: {
        value: "Found",
        severity: "red",
        redCount: 1,
        yellowCount: 0,
        clearLabel: undefined,
      },
    },
  });

  assert.ok(getQuickOverviewIds(report).includes("lawsuits_recalls"));
});

test("Brand safety warning updates the Brand Trust / Safety card and raises the score", () => {
  const baseReport = getDemoExposureReport("packaged-processed-foods", neutralProfile, {
    checkOverrides: quietAutomaticOverrides,
  });
  const warningReport = getDemoExposureReport(
    "packaged-processed-foods",
    neutralProfile,
    {
      checkOverrides: {
        ...quietAutomaticOverrides,
        brand_trust_safety: {
          value: "Warning",
          severity: "red",
          redCount: 1,
          yellowCount: 0,
          clearLabel: undefined,
        },
      },
    },
  );

  assert.equal(baseReport.brandTrustRow.status, "Clear");
  assert.equal(warningReport.brandTrustRow.title, "Brand Trust / Safety");
  assert.equal(warningReport.brandTrustRow.status, "Warning");
  assert.equal(warningReport.brandTrustRow.tone, "red");
  assert.ok(getQuickOverviewIds(warningReport).includes("brand_trust_safety"));
  assert.ok(warningReport.product.score >= baseReport.product.score);
  assert.ok(warningReport.product.score >= 80);
});

test("Unknown automatic override values stay hidden even when the category normally shows them", () => {
  const report = getDemoExposureReport("drinks-beverages", neutralProfile);

  assert.ok(!getQuickOverviewIds(report).includes("microplastics"));
});

test("Clear automatic override values do not appear as random off-category rows", () => {
  const report = getDemoExposureReport("packaged-processed-foods", neutralProfile, {
    checkOverrides: {
      microplastics: {
        value: "Clear",
        severity: "green",
        redCount: 0,
        yellowCount: 0,
        clearLabel: "Clear",
      },
    },
  });

  assert.ok(!getQuickOverviewIds(report).includes("microplastics"));
  assert.ok(!getDeepCheckIds(report).includes("microplastics"));
});
