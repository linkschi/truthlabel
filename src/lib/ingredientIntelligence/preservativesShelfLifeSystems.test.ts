import assert from "node:assert/strict";
import test from "node:test";

import {
  findPreservativeMatches,
  summarizePreservativeMatches,
} from "./preservativesShelfLifeSystems";

test("preservative matching deduplicates name and E-number hits", () => {
  const matches = findPreservativeMatches("Sodium benzoate (E211)");

  assert.deepEqual(matches.map((item) => item.id), ["sodium_benzoate"]);
});

test("preservative matching normalizes sulphite spelling and E-number variants", () => {
  const matches = findPreservativeMatches("Potassium metabisulphite (E224)");

  assert.deepEqual(matches.map((item) => item.id), ["potassium_metabisulfite"]);
});

test("preservative matching catches curing salt label variants", () => {
  const matches = findPreservativeMatches("Prague powder No. 1");

  assert.deepEqual(matches.map((item) => item.id), ["sodium_nitrite"]);
});

test("preservative matching catches subscript abbreviation variants", () => {
  const matches = findPreservativeMatches("CaNa\u2082EDTA");

  assert.deepEqual(matches.map((item) => item.id), ["calcium_disodium_edta"]);
});

test("preservative summary becomes red for automatic restricted preservative aliases", () => {
  const matches = findPreservativeMatches("Propyl p-hydroxybenzoate (E216)");
  const summary = summarizePreservativeMatches(matches);

  assert.equal(summary.totalCount, 1);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, true);
  assert.deepEqual(summary.redItems.map((item) => item.id), ["propylparaben"]);
});
