import assert from "node:assert/strict";
import test from "node:test";

import { brandTrustSafetyRecallsLawsuitsDataPack } from "./brandTrustSafetyRecallsLawsuits";

test("brandTrustSafetyRecallsLawsuitsDataPack stores the requested starter dataset", () => {
  assert.equal(brandTrustSafetyRecallsLawsuitsDataPack.id, "brand_trust_safety");
  assert.equal(
    brandTrustSafetyRecallsLawsuitsDataPack.categoryName,
    "Brand Trust / Safety / Recalls / Lawsuits",
  );
  assert.equal(brandTrustSafetyRecallsLawsuitsDataPack.items.length, 20);
});

test("brandTrustSafetyRecallsLawsuitsDataPack keeps green yellow and red paths", () => {
  const severities = new Set(
    brandTrustSafetyRecallsLawsuitsDataPack.items.map(
      (item) => item.basicSeveritySuggestion,
    ),
  );

  assert.deepEqual([...severities].sort(), ["green", "red", "yellow"]);
});

test("brandTrustSafetyRecallsLawsuitsDataPack keeps signal metadata", () => {
  brandTrustSafetyRecallsLawsuitsDataPack.items.forEach((item) => {
    assert.deepEqual(item.categoryTags, ["brand_trust_safety"]);
    assert.equal(item.redOnlyWhenVerified, true);
    assert.ok(Array.isArray(item.linkedExistingPackIds));
    assert.ok(item.matchingNotes.length > 0);
  });
});

test("brandTrustSafetyRecallsLawsuitsDataPack preserves recall and trust logic", () => {
  const redIds = brandTrustSafetyRecallsLawsuitsDataPack.items
    .filter((item) => item.basicSeveritySuggestion === "red")
    .map((item) => item.id)
    .sort();
  const greenIds = brandTrustSafetyRecallsLawsuitsDataPack.items
    .filter((item) => item.basicSeveritySuggestion === "green")
    .map((item) => item.id);

  assert.deepEqual(redIds, [
    "active_official_recall",
    "active_outbreak_investigation",
    "chemical_contamination_recall",
    "foreign_material_recall",
    "heavy_metal_recall_warning",
    "pathogen_contamination_recall",
    "public_health_alert",
    "undeclared_allergen_recall",
  ]);
  assert.deepEqual(greenIds, ["clean_official_recall_check"]);
  assert.equal(
    brandTrustSafetyRecallsLawsuitsDataPack.displayRulesForLater.noSignalFound.severity,
    "green",
  );
  assert.equal(
    brandTrustSafetyRecallsLawsuitsDataPack.displayRulesForLater.activeOfficialSignal.severity,
    "red",
  );
  assert.ok(
    brandTrustSafetyRecallsLawsuitsDataPack.classificationRules.includes(
      "This category should add external trust and safety context only. It should not override ingredient-based warnings.",
    ),
  );
});
