import assert from "node:assert/strict";
import test from "node:test";

import {
  findArtificialSweetenerMatches,
  summarizeArtificialSweetenerMatches,
} from "./artificialSweeteners";

test("artificial sweetener matching deduplicates name and E-number hits", () => {
  const matches = findArtificialSweetenerMatches("Aspartame (E951)");

  assert.deepEqual(matches.map((item) => item.id), ["aspartame"]);
});

test("artificial sweetener matching deduplicates Ace-K and acesulfame K variants", () => {
  const matches = findArtificialSweetenerMatches("Acesulfame K / Ace-K");

  assert.deepEqual(matches.map((item) => item.id), ["acesulfame_potassium"]);
});

test("artificial sweetener matching catches added brand and label variants", () => {
  const matches = findArtificialSweetenerMatches(
    "AminoSweet, Sweet Twin, artificial sweetener E950",
  );

  assert.deepEqual(
    matches.map((item) => item.id).sort(),
    ["acesulfame_potassium", "aspartame", "saccharin"],
  );
});

test("artificial sweetener summary stays yellow for one or two sweeteners", () => {
  const matches = findArtificialSweetenerMatches("Sucralose, Acesulfame potassium");
  const summary = summarizeArtificialSweetenerMatches(matches);

  assert.equal(summary.totalCount, 2);
  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasAutomaticRed, false);
});

test("artificial sweetener summary becomes red for three sweeteners", () => {
  const matches = findArtificialSweetenerMatches(
    "Sucralose, Saccharin, Acesulfame potassium",
  );
  const summary = summarizeArtificialSweetenerMatches(matches);

  assert.equal(summary.totalCount, 3);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, false);
});

test("artificial sweetener summary becomes red for one banned or restricted sweetener", () => {
  const matches = findArtificialSweetenerMatches("Cyclamate (E952)");
  const summary = summarizeArtificialSweetenerMatches(matches);

  assert.equal(summary.totalCount, 1);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, true);
  assert.deepEqual(summary.redItems.map((item) => item.id), ["cyclamates"]);
});

test("artificial sweetener matching finds not-permitted crude stevia wording", () => {
  const matches = findArtificialSweetenerMatches("Whole-leaf stevia extract");
  const summary = summarizeArtificialSweetenerMatches(matches);

  assert.deepEqual(matches.map((item) => item.id), ["crude_stevia_whole_leaf"]);
  assert.equal(summary.categorySeverity, "red");
});
