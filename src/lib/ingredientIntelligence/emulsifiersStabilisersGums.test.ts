import assert from "node:assert/strict";
import test from "node:test";

import type { EmulsifiersStabilisersGumsItem } from "@/data/ingredientIntelligence/emulsifiersStabilisersGums";
import { emulsifiersStabilisersGumsItemsById } from "@/data/ingredientIntelligence/emulsifiersStabilisersGumsIndex";

import {
  findTextureAdditiveMatches,
  summarizeTextureAdditiveMatches,
} from "./emulsifiersStabilisersGums";

test("texture additive matching deduplicates name and E-number hits", () => {
  const matches = findTextureAdditiveMatches("Soy lecithin (E322)");

  assert.deepEqual(matches.map((item) => item.id), ["lecithins"]);
});

test("texture additive summary stays green when no markers are found", () => {
  const summary = summarizeTextureAdditiveMatches([]);

  assert.equal(summary.totalCount, 0);
  assert.equal(summary.categorySeverity, "green");
  assert.equal(summary.hasAutomaticRed, false);
});

test("texture additive summary stays yellow for one or two additives", () => {
  const matches = findTextureAdditiveMatches("Xanthan gum, guar gum");
  const summary = summarizeTextureAdditiveMatches(matches);

  assert.equal(summary.totalCount, 2);
  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasAutomaticRed, false);
});

test("texture additive summary becomes red for three texture additives", () => {
  const matches = findTextureAdditiveMatches(
    "Mono- and diglycerides, xanthan gum, carrageenan",
  );
  const summary = summarizeTextureAdditiveMatches(matches);

  assert.equal(summary.totalCount, 3);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, false);
});

test("texture additive summary becomes red for banned or restricted overlap", () => {
  const restrictedTextureAdditive = {
    ...emulsifiersStabilisersGumsItemsById.lecithins,
    id: "brominated_vegetable_oil",
    mainName: "Brominated Vegetable Oil",
    otherNames: ["BVO", "Brominated vegetable oil stabilizer"],
  } as unknown as EmulsifiersStabilisersGumsItem;
  const summary = summarizeTextureAdditiveMatches([restrictedTextureAdditive]);

  assert.equal(summary.totalCount, 1);
  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.hasAutomaticRed, true);
  assert.deepEqual(summary.redItems.map((item) => item.id), [
    "brominated_vegetable_oil",
  ]);
});
