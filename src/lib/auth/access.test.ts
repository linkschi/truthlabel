import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getAccessKind,
  getAccessState,
  getTrialDaysRemaining,
  hasTrialAccess,
  type TruthlabelSubscription,
  type TruthlabelTrialAccess,
} from "./access";

const now = new Date("2026-07-20T12:00:00.000Z").getTime();

function trial(daysFromNow: number): TruthlabelTrialAccess {
  return {
    trial_started_at: new Date(now - 86_400_000).toISOString(),
    trial_ends_at: new Date(now + daysFromNow * 86_400_000).toISOString(),
  };
}

function subscription(status: TruthlabelSubscription["status"]) {
  return {
    status,
    access_ends_at: null,
  } satisfies TruthlabelSubscription;
}

test("account-created trial rows do not grant app access without Gumroad access", () => {
  const activeTrial = trial(7);

  assert.equal(hasTrialAccess(activeTrial), false);
  assert.equal(
    getAccessState({
      authLoading: false,
      userPresent: true,
      subscription: null,
      trialAccess: activeTrial,
    }),
    "inactive",
  );
});

test("expired trial without paid access is inactive", () => {
  const expiredTrial = {
    trial_started_at: new Date(now - 9 * 86_400_000).toISOString(),
    trial_ends_at: new Date(now - 2 * 86_400_000).toISOString(),
  };

  assert.equal(hasTrialAccess(expiredTrial), false);
  assert.equal(
    getAccessState({
      authLoading: false,
      userPresent: true,
      subscription: null,
      trialAccess: expiredTrial,
    }),
    "inactive",
  );
});

test("paid access grants access even when an account trial row is expired", () => {
  assert.equal(
    getAccessKind({
      subscription: subscription("active"),
      trialAccess: {
        trial_started_at: "2026-07-01T00:00:00.000Z",
        trial_ends_at: "2026-07-08T00:00:00.000Z",
      },
    }),
    "paid",
  );
});

test("trial days remaining rounds up for clear account wording", () => {
  assert.equal(getTrialDaysRemaining(trial(2), now), 2);
  assert.equal(
    getTrialDaysRemaining(
      {
        trial_started_at: new Date(now).toISOString(),
        trial_ends_at: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
      },
      now,
    ),
    1,
  );
});
