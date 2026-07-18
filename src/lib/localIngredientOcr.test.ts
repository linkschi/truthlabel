import assert from "node:assert/strict";
import test from "node:test";

import {
  getOcrTargetDimensions,
  IngredientOcrTimeoutError,
} from "./localIngredientOcr";

test("getOcrTargetDimensions upscales a small mobile label crop for OCR", () => {
  const result = getOcrTargetDimensions(500, 700);

  assert.equal(result.width, 1400);
  assert.equal(result.height, 1960);
  assert.ok(result.scale > 2);
});

test("getOcrTargetDimensions limits large phone photos to a mobile-safe pixel budget", () => {
  const result = getOcrTargetDimensions(4032, 3024);

  assert.ok(result.width <= 2600);
  assert.ok(result.width * result.height <= 5_000_000);
  assert.ok(result.scale < 1);
});

test("IngredientOcrTimeoutError has a stable error name for scanner recovery", () => {
  const error = new IngredientOcrTimeoutError();

  assert.equal(error.name, "IngredientOcrTimeoutError");
});
