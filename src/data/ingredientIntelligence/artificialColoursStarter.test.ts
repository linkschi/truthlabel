import assert from "node:assert/strict";
import test from "node:test";

import { artificialColoursStarter } from "./artificialColoursStarter";

test("artificialColoursStarter keeps a single unique record per colour", () => {
  const ids = artificialColoursStarter.map((item) => item.id);
  const duplicateGroupIds = artificialColoursStarter.map((item) => item.duplicateGroupId);

  assert.equal(artificialColoursStarter.length, 24);
  assert.equal(new Set(ids).size, artificialColoursStarter.length);
  assert.equal(new Set(duplicateGroupIds).size, artificialColoursStarter.length);
});

test("artificialColoursStarter stays in provisional region-verification mode", () => {
  artificialColoursStarter.forEach((item) => {
    assert.equal(item.evidenceStatus, "needs_region_verification");

    Object.values(item.regionStatus).forEach((status) => {
      assert.ok(status === "needs_verification" || status === "unknown");
    });
  });
});

test("artificialColoursStarter preserves the current red watch items", () => {
  const redIds = artificialColoursStarter
    .filter((item) => item.severity === "red")
    .map((item) => item.id)
    .sort();

  assert.deepEqual(redIds, [
    "citrus_red_no_2",
    "erythrosine",
    "orange_b",
    "titanium_dioxide",
  ]);
});
