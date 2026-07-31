import assert from "node:assert/strict";
import test from "node:test";

import { isThiislincornOnboardingTestAccount } from "./onboardingTestMode";

test("isThiislincornOnboardingTestAccount matches any thiislincorn email", () => {
  assert.equal(
    isThiislincornOnboardingTestAccount("thiislincorn@gmail.com"),
    true,
  );
  assert.equal(
    isThiislincornOnboardingTestAccount("test+thiislincorn@example.com"),
    true,
  );
});

test("isThiislincornOnboardingTestAccount ignores normal accounts", () => {
  assert.equal(isThiislincornOnboardingTestAccount("shopper@example.com"), false);
  assert.equal(isThiislincornOnboardingTestAccount(null), false);
});
