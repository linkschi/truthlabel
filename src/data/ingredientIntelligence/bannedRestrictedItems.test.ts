import assert from "node:assert/strict";
import test from "node:test";

import { bannedRestrictedItems } from "./bannedRestrictedItems";
import { bannedRestrictedItemsById } from "./bannedRestrictedItemsIndex";

test("bannedRestrictedItems stores the full starter restricted dataset", () => {
  assert.equal(bannedRestrictedItems.length, 31);
  assert.equal(
    new Set(bannedRestrictedItems.map((item) => item.id)).size,
    bannedRestrictedItems.length,
  );
  assert.equal(
    Object.keys(bannedRestrictedItemsById).length,
    bannedRestrictedItems.length,
  );
});

test("bannedRestrictedItems separates automatic red from regional review rules", () => {
  const yellowReviewIds = new Set([
    "orange_b",
    "citrus_red_no_2",
    "petrolatum",
    "paraffin_wax",
  ]);

  bannedRestrictedItems.forEach((item) => {
    if (yellowReviewIds.has(item.id)) {
      assert.equal(item.severity, "yellow");
      assert.equal(item.scoreImpact, "yellow_review");
    } else {
      assert.equal(item.severity, "red");
      assert.equal(item.scoreImpact, "automatic_red");
    }

    assert.ok(item.warningLabel.length > 0);
    assert.ok(item.userFacingReason.length > 0);
    assert.ok(item.countriesRestrictedOrBannedIn.length > 0);
  });
});
