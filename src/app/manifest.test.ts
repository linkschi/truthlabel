import assert from "node:assert/strict";
import test from "node:test";

import manifest from "./manifest";

test("Truthlabel manifest has installable PNG and maskable icons", () => {
  const result = manifest();

  assert.equal(result.display, "standalone");
  assert.equal(result.start_url, "/");
  assert.equal(result.scope, "/");
  assert.ok(
    result.icons?.some(
      (icon) => icon.sizes === "192x192" && icon.type === "image/png",
    ),
  );
  assert.ok(
    result.icons?.some(
      (icon) => icon.sizes === "512x512" && icon.type === "image/png",
    ),
  );
  assert.ok(result.icons?.some((icon) => icon.purpose === "maskable"));
});
