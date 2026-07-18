import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_OPEN_FOOD_FACTS_API_BASE_URL } from "./appConfig";

test("the default Open Food Facts endpoint uses the public production service", () => {
  assert.equal(
    DEFAULT_OPEN_FOOD_FACTS_API_BASE_URL,
    "https://world.openfoodfacts.org/api/v2",
  );
  assert.doesNotMatch(DEFAULT_OPEN_FOOD_FACTS_API_BASE_URL, /\.net\b/);
});
