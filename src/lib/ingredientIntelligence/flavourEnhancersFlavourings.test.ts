import assert from "node:assert/strict";
import test from "node:test";

import {
  findFlavourSystemMatches,
  summarizeFlavourSystemMatches,
} from "./flavourEnhancersFlavourings";

test("flavour system matching deduplicates name and E-number hits", () => {
  const matches = findFlavourSystemMatches("Monosodium glutamate (E621), MSG");

  assert.deepEqual(matches.map((item) => item.id), ["monosodium_glutamate_msg"]);
});

test("flavour system matching normalizes British and American spelling", () => {
  const britishMatches = findFlavourSystemMatches("natural flavour");
  const americanMatches = findFlavourSystemMatches("natural flavor");

  assert.deepEqual(britishMatches.map((item) => item.id), ["natural_flavourings"]);
  assert.deepEqual(americanMatches.map((item) => item.id), ["natural_flavourings"]);
});

test("flavour system matching keeps vague terms but avoids generic double counting", () => {
  const specificMatches = findFlavourSystemMatches("Artificial flavouring");
  const genericMatches = findFlavourSystemMatches("flavouring");

  assert.deepEqual(specificMatches.map((item) => item.id), [
    "artificial_flavourings",
  ]);
  assert.deepEqual(genericMatches.map((item) => item.id), [
    "generic_flavouring_terms",
  ]);
});

test("flavour system matching deduplicates hydrolysed protein abbreviation aliases", () => {
  const matches = findFlavourSystemMatches("Hydrolysed vegetable protein (HVP)");

  assert.deepEqual(matches.map((item) => item.id), [
    "hydrolyzed_protein_flavourings",
  ]);
});

test("flavour system summary stays green when no markers are found", () => {
  const summary = summarizeFlavourSystemMatches([]);

  assert.equal(summary.totalCount, 0);
  assert.equal(summary.categorySeverity, "green");
  assert.equal(summary.hasAutomaticRed, false);
});

test("flavour system summary stays yellow for one to three systems", () => {
  const matches = findFlavourSystemMatches("Yeast extract, natural flavour, MSG");
  const summary = summarizeFlavourSystemMatches(matches);

  assert.equal(summary.totalCount, 3);
  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasAutomaticRed, false);
});

test("flavour system summary becomes red for four flavour systems", () => {
  const matches = findFlavourSystemMatches(
    "Monosodium glutamate, yeast extract, natural flavour, disodium guanylate",
  );
  const summary = summarizeFlavourSystemMatches(matches);

  assert.equal(summary.totalCount, 4);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, false);
});

test("flavour system summary becomes red for banned or restricted flavouring", () => {
  const matches = findFlavourSystemMatches("Safrole flavouring");
  const summary = summarizeFlavourSystemMatches(matches);

  assert.equal(summary.totalCount, 1);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, true);
  assert.deepEqual(summary.redItems.map((item) => item.id), ["safrole"]);
});
