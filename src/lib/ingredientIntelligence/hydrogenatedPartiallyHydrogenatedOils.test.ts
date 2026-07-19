import assert from "node:assert/strict";
import test from "node:test";

import {
  findHydrogenatedPartiallyHydrogenatedOilMatches,
  summarizeHydrogenatedPartiallyHydrogenatedOilMatches,
} from "./hydrogenatedPartiallyHydrogenatedOils";

test("hydrogenated oil summary stays green when no markers are found", () => {
  const summary = summarizeHydrogenatedPartiallyHydrogenatedOilMatches([]);

  assert.equal(summary.totalCount, 0);
  assert.equal(summary.categorySeverity, "green");
  assert.equal(summary.hasHydrogenatedOil, false);
  assert.equal(summary.hasAutomaticRed, false);
});

test("hydrogenated oil triggers yellow processed-fat review but not regulatory automatic red", () => {
  const matches = findHydrogenatedPartiallyHydrogenatedOilMatches(
    "Hydrogenated vegetable oil",
  );
  const summary = summarizeHydrogenatedPartiallyHydrogenatedOilMatches(matches);

  assert.deepEqual(matches.map((item) => item.id), ["hydrogenated_oil_general"]);
  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasHydrogenatedOil, true);
  assert.equal(summary.hasPartiallyHydrogenatedOil, false);
  assert.equal(summary.hasAutomaticRed, false);
});

test("specific hydrogenated base oil still triggers the generic hydrogenated rule", () => {
  const matches = findHydrogenatedPartiallyHydrogenatedOilMatches(
    "Hydrogenated soybean oil",
  );
  const summary = summarizeHydrogenatedPartiallyHydrogenatedOilMatches(matches);

  assert.deepEqual(matches.map((item) => item.id), ["hydrogenated_oil_general"]);
  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasHydrogenatedOil, true);
});

test("fully hydrogenated oil triggers yellow processed-fat review", () => {
  const matches = findHydrogenatedPartiallyHydrogenatedOilMatches(
    "Fully hydrogenated soybean oil",
  );
  const summary = summarizeHydrogenatedPartiallyHydrogenatedOilMatches(matches);

  assert.deepEqual(matches.map((item) => item.id), ["fully_hydrogenated_oil"]);
  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasFullyHydrogenatedOil, true);
  assert.equal(summary.hasPartiallyHydrogenatedOil, false);
});

test("partially hydrogenated oil uses the specific PHO automatic-red rule", () => {
  const matches = findHydrogenatedPartiallyHydrogenatedOilMatches(
    "Partially hydrogenated soybean oil",
  );
  const summary = summarizeHydrogenatedPartiallyHydrogenatedOilMatches(matches);

  assert.deepEqual(matches.map((item) => item.id), [
    "partially_hydrogenated_soybean_oil",
  ]);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasPartiallyHydrogenatedOil, true);
  assert.equal(summary.hasAutomaticRed, true);
});

test("PHO abbreviation deduplicates to the general partially hydrogenated rule", () => {
  const matches = findHydrogenatedPartiallyHydrogenatedOilMatches("PHO");
  const summary = summarizeHydrogenatedPartiallyHydrogenatedOilMatches(matches);

  assert.deepEqual(matches.map((item) => item.id), [
    "partially_hydrogenated_oil_general",
  ]);
  assert.equal(summary.hasPartiallyHydrogenatedOil, true);
  assert.equal(summary.hasAutomaticRed, true);
});

test("positive trans fat marker triggers yellow review unless PHO is confirmed", () => {
  const matches = findHydrogenatedPartiallyHydrogenatedOilMatches(
    "Contains trans fat",
  );
  const summary = summarizeHydrogenatedPartiallyHydrogenatedOilMatches(matches);

  assert.deepEqual(matches.map((item) => item.id), ["trans_fat_marker"]);
  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasTransFatMarker, true);
  assert.equal(summary.hasAutomaticRed, false);
});

test("negative trans fat claims do not trigger red by themselves", () => {
  ["0g trans fat", "0 g trans fat", "zero trans fat", "no trans fat", "trans fat free"].forEach(
    (labelText) => {
      const matches = findHydrogenatedPartiallyHydrogenatedOilMatches(labelText);
      const summary = summarizeHydrogenatedPartiallyHydrogenatedOilMatches(matches);

      assert.deepEqual(matches.map((item) => item.id), []);
      assert.equal(summary.categorySeverity, "green");
    },
  );
});

test("non-hydrogenated oil and hydrogenated starch hydrolysate do not trigger the oil rule", () => {
  [
    "Non-hydrogenated vegetable oil",
    "Hydrogenated starch hydrolysate",
  ].forEach((labelText) => {
    const matches = findHydrogenatedPartiallyHydrogenatedOilMatches(labelText);
    const summary = summarizeHydrogenatedPartiallyHydrogenatedOilMatches(matches);

    assert.deepEqual(matches.map((item) => item.id), []);
    assert.equal(summary.categorySeverity, "green");
  });
});

test("negative trans fat claim does not block a real PHO ingredient", () => {
  const matches = findHydrogenatedPartiallyHydrogenatedOilMatches(
    "0g trans fat, partially hydrogenated oil",
  );
  const summary = summarizeHydrogenatedPartiallyHydrogenatedOilMatches(matches);

  assert.deepEqual(matches.map((item) => item.id), [
    "partially_hydrogenated_oil_general",
  ]);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasPartiallyHydrogenatedOil, true);
  assert.equal(summary.hasAutomaticRed, true);
});
