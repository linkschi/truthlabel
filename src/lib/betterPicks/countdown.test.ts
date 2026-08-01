import assert from "node:assert/strict";
import test from "node:test";

import { getCountdownParts } from "./countdown";

test("better picks countdown calculates remaining time from the configured timestamp", () => {
  const parts = getCountdownParts(
    "2026-08-08T14:30:00+02:00",
    new Date("2026-08-01T14:30:00+02:00"),
  );

  assert.equal(parts.status, "counting");
  assert.equal(parts.days, 7);
  assert.equal(parts.hours, 0);
  assert.equal(parts.minutes, 0);
  assert.equal(parts.seconds, 0);
});

test("better picks countdown stops at zero after launch time", () => {
  const parts = getCountdownParts(
    "2026-08-08T14:30:00+02:00",
    new Date("2026-08-09T14:30:00+02:00"),
  );

  assert.equal(parts.status, "elapsed");
  assert.equal(parts.totalMs, 0);
  assert.equal(parts.days, 0);
  assert.equal(parts.hours, 0);
  assert.equal(parts.minutes, 0);
  assert.equal(parts.seconds, 0);
});

test("better picks countdown handles invalid launch dates safely", () => {
  const parts = getCountdownParts("not-a-date");

  assert.equal(parts.status, "invalid");
  assert.equal(parts.totalMs, 0);
});
