import assert from "node:assert/strict";
import test from "node:test";

import { getDemoScanResult } from "./getDemoScanResult";

function buildAllergyProfile(overrides?: string[]) {
  return overrides ?? ["milk"];
}

test("default demo result preserves the approved red-warning sample feel", () => {
  const result = getDemoScanResult(
    "packaged-processed-foods",
    buildAllergyProfile(),
  );

  assert.equal(result.productHero.productName, "Chocolate Cereal Bar");
  assert.equal(result.productHero.verdictTone, "red");
  assert.equal(result.finalVerdict.headline, "Strong Warning");
  assert.ok(
    result.quickOverview.some(
      (row) => row.categoryId === "allergy_risk" && row.severity === "red",
    ),
  );
});

test("explicit demo product selection loads the requested realistic demo label", () => {
  const result = getDemoScanResult(
    undefined,
    buildAllergyProfile([]),
    "simple-rolled-oats",
  );

  assert.equal(result.productHero.productName, "Simple Rolled Oats");
  assert.equal(result.productHero.productCategory, "Fresh / Simple Foods");
  assert.equal(result.productHero.verdictTone, "green");
  assert.equal(result.finalVerdict.headline, "Clean Pass");
});

test("baby category demo surfaces heavy-metals review markers", () => {
  const result = getDemoScanResult("baby-kids-food", buildAllergyProfile());
  const heavyMetalsRow = result.deepExposureChecks.find(
    (row) => row.categoryId === "heavy_metals",
  );

  assert.equal(result.productHero.productCategory, "Baby / Kids Food");
  assert.equal(heavyMetalsRow?.severity, "yellow");
  assert.equal(heavyMetalsRow?.status, "checked");
});

test("drinks category demo surfaces microplastic review markers", () => {
  const result = getDemoScanResult("drinks-beverages", buildAllergyProfile());
  const microplasticsRow = result.deepExposureChecks.find(
    (row) => row.categoryId === "microplastics",
  );

  assert.equal(result.productHero.productCategory, "Drinks / Beverages");
  assert.equal(microplasticsRow?.severity, "yellow");
  assert.equal(microplasticsRow?.status, "checked");
});

test("demo result keeps external brand-trust lookup clearly not checked without live data", () => {
  const result = getDemoScanResult("general-unknown", buildAllergyProfile());

  assert.equal(result.brandTrustSafety.status, "not_checked");
  assert.equal(result.brandTrustSafety.severity, null);
  assert.ok(
    result.confidenceNotes.includes(
      "Heavy metals, microplastics, and recall status require external data. Missing data is not proof of absence.",
    ),
  );
});
