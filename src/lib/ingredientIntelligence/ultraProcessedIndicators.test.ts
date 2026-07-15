import assert from "node:assert/strict";
import test from "node:test";

import {
  findUltraProcessedAutomaticRedTriggers,
  findUltraProcessedIndicatorMatches,
  summarizeUltraProcessedIndicatorMatches,
} from "./ultraProcessedIndicators";

test("ultra-processed indicator summary stays green when no markers are found", () => {
  const summary = summarizeUltraProcessedIndicatorMatches([]);

  assert.equal(summary.totalCount, 0);
  assert.equal(summary.categorySeverity, "green");
  assert.equal(summary.hasAutomaticRed, false);
});

test("ultra-processed indicator matching deduplicates name and code hits", () => {
  const matches = findUltraProcessedIndicatorMatches(
    "Monosodium glutamate, flavour enhancer E621",
  );

  assert.deepEqual(matches.map((item) => item.id), ["flavour_enhancers"]);
});

test("ultra-processed indicator summary stays yellow for one to three markers", () => {
  const matches = findUltraProcessedIndicatorMatches(
    "Maltodextrin, modified corn starch, artificial flavour",
  );
  const summary = summarizeUltraProcessedIndicatorMatches(matches);

  assert.equal(summary.totalCount, 3);
  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasAutomaticRed, false);
});

test("ultra-processed indicator summary becomes red for four markers", () => {
  const matches = findUltraProcessedIndicatorMatches(
    "Maltodextrin, modified corn starch, artificial flavour, soy lecithin",
  );
  const summary = summarizeUltraProcessedIndicatorMatches(matches);

  assert.equal(summary.totalCount, 4);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, false);
});

test("ultra-processed indicator summary becomes red for automatic red overlap", () => {
  const labelText = "Partially hydrogenated oil";
  const matches = findUltraProcessedIndicatorMatches(labelText);
  const automaticTriggers = findUltraProcessedAutomaticRedTriggers(labelText);
  const summary = summarizeUltraProcessedIndicatorMatches(
    matches,
    automaticTriggers,
  );

  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, true);
  assert.ok(
    summary.automaticRedTriggers.some(
      (trigger) => trigger.source === "hydrogenated_oils",
    ),
  );
});

test("ultra-processed indicator summary becomes red for restricted sweetener overlap", () => {
  const labelText = "Cyclamate";
  const matches = findUltraProcessedIndicatorMatches(labelText);
  const automaticTriggers = findUltraProcessedAutomaticRedTriggers(labelText);
  const summary = summarizeUltraProcessedIndicatorMatches(
    matches,
    automaticTriggers,
  );

  assert.equal(summary.totalCount, 1);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, true);
  assert.ok(
    summary.automaticRedTriggers.some(
      (trigger) => trigger.source === "artificial_sweeteners",
    ),
  );
});

test("ultra-processed indicator matching does not treat trans-fat-free wording as red", () => {
  const labelText = "0g trans fat, trans fat free";
  const matches = findUltraProcessedIndicatorMatches(labelText);
  const automaticTriggers = findUltraProcessedAutomaticRedTriggers(labelText);
  const summary = summarizeUltraProcessedIndicatorMatches(
    matches,
    automaticTriggers,
  );

  assert.equal(summary.totalCount, 0);
  assert.equal(summary.categorySeverity, "green");
  assert.equal(summary.hasAutomaticRed, false);
});
