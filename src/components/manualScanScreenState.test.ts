import assert from "node:assert/strict";
import test from "node:test";

import {
  getNextSelectedAllergiesOverride,
  splitSavedAllergyProfile,
} from "./manualScanScreenState";

test("splitSavedAllergyProfile maps saved allergy ids into the manual scan labels", () => {
  const result = splitSavedAllergyProfile([
    "milk",
    "mustard",
    "sulfites",
    "custom allergen",
  ]);

  assert.deepEqual(result.selectedAllergies, [
    "Milk",
    "Mustard",
    "Sulphites",
  ]);
  assert.equal(result.customAllergiesText, "custom allergen");
});

test("getNextSelectedAllergiesOverride preserves saved selections on the first toggle", () => {
  const result = getNextSelectedAllergiesOverride(
    null,
    ["Milk", "Egg"],
    "Soy",
  );

  assert.deepEqual(result, ["Milk", "Egg", "Soy"]);
});

test("getNextSelectedAllergiesOverride can remove an existing saved selection", () => {
  const result = getNextSelectedAllergiesOverride(
    null,
    ["Milk", "Egg"],
    "Milk",
  );

  assert.deepEqual(result, ["Egg"]);
});
