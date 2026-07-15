import assert from "node:assert/strict";
import test from "node:test";

import {
  findArtificialColourMatches,
  mergedArtificialColours,
  summarizeArtificialColourMatches,
} from "./artificialColours";

test("artificial colour overlay coverage matches the starter dataset", () => {
  assert.equal(mergedArtificialColours.length, 24);
});

test("artificial colour matching deduplicates name and E-number matches", () => {
  const matches = findArtificialColourMatches("Tartrazine (E102)");

  assert.deepEqual(matches.map((item) => item.id), ["tartrazine"]);
});

test("artificial colour matching finds multiple distinct colours in one label", () => {
  const matches = findArtificialColourMatches(
    "Tartrazine (E102), Brilliant Blue FCF, Red No. 3",
  );

  assert.deepEqual(
    matches.map((item) => item.id).sort(),
    ["brilliant_blue_fcf", "erythrosine", "tartrazine"],
  );
});

test("artificial colour summary stays yellow for one or two yellow colours", () => {
  const matches = findArtificialColourMatches("Tartrazine, Allura Red AC");
  const summary = summarizeArtificialColourMatches(matches);

  assert.equal(summary.totalCount, 2);
  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasAutomaticRed, false);
});

test("artificial colour summary becomes red for three yellow colours", () => {
  const matches = findArtificialColourMatches(
    "Tartrazine, Allura Red AC, Brilliant Blue FCF",
  );
  const summary = summarizeArtificialColourMatches(matches);

  assert.equal(summary.totalCount, 3);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, false);
});

test("artificial colour summary becomes red for one serious restricted colour", () => {
  const matches = findArtificialColourMatches("Erythrosine (E127)");
  const summary = summarizeArtificialColourMatches(matches);

  assert.equal(summary.totalCount, 1);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, true);
  assert.deepEqual(summary.redItems.map((item) => item.id), ["erythrosine"]);
});
