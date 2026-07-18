import assert from "node:assert/strict";
import test from "node:test";

import {
  findSeedOilProcessedOilMatches,
  summarizeSeedOilProcessedOilMatches,
} from "./seedOilsProcessedOils";

test("seed oil matching deduplicates generic vegetable oil with a specific oil in one ingredient", () => {
  const matches = findSeedOilProcessedOilMatches("Vegetable oil (sunflower oil)");

  assert.deepEqual(matches.map((item) => item.id), ["sunflower_oil"]);
});

test("seed oil matching catches spelling and label variants", () => {
  const matches = findSeedOilProcessedOilMatches(
    "High-oleic sunflower oil, grape seed oil",
  );

  assert.deepEqual(matches.map((item) => item.id), [
    "sunflower_oil",
    "grapeseed_oil",
  ]);
});

test("seed oil summary stays green when no oil markers are found", () => {
  const summary = summarizeSeedOilProcessedOilMatches([]);

  assert.equal(summary.totalCount, 0);
  assert.equal(summary.categorySeverity, "green");
  assert.equal(summary.hasAutomaticRed, false);
});

test("seed oil summary stays yellow for one processed oil", () => {
  const matches = findSeedOilProcessedOilMatches("Canola oil");
  const summary = summarizeSeedOilProcessedOilMatches(matches);

  assert.equal(summary.totalCount, 1);
  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasAutomaticRed, false);
});

test("seed oil summary becomes red for three seed or processed oils", () => {
  const matches = findSeedOilProcessedOilMatches(
    "Canola oil, soybean oil, sunflower oil",
  );
  const summary = summarizeSeedOilProcessedOilMatches(matches);

  assert.equal(summary.totalCount, 3);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, false);
});

test("hydrogenated oil triggers automatic red and does not double count the base oil", () => {
  const matches = findSeedOilProcessedOilMatches("Hydrogenated soybean oil");
  const summary = summarizeSeedOilProcessedOilMatches(matches);

  assert.deepEqual(matches.map((item) => item.id), ["hydrogenated_oils"]);
  assert.equal(summary.totalCount, 1);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasHydrogenatedOil, true);
  assert.equal(summary.hasAutomaticRed, true);
});

test("partially hydrogenated oil triggers automatic red without duplicating hydrogenated oil", () => {
  const matches = findSeedOilProcessedOilMatches(
    "Partially hydrogenated vegetable oil",
  );
  const summary = summarizeSeedOilProcessedOilMatches(matches);

  assert.deepEqual(matches.map((item) => item.id), [
    "partially_hydrogenated_oils",
  ]);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasHydrogenatedOil, true);
  assert.equal(summary.hasAutomaticRed, true);
});

test("non-hydrogenated vegetable oil does not falsely trigger hydrogenated red", () => {
  const matches = findSeedOilProcessedOilMatches("Non-hydrogenated vegetable oil");
  const summary = summarizeSeedOilProcessedOilMatches(matches);

  assert.deepEqual(matches.map((item) => item.id), ["generic_vegetable_oil"]);
  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasHydrogenatedOil, false);
  assert.equal(summary.hasAutomaticRed, false);
});
