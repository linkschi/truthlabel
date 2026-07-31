import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultOnboardingState,
  normalizeOnboardingState,
} from "./truthlabelOnboardingState";

test("normalizeOnboardingState returns the default state for empty input", () => {
  assert.deepEqual(normalizeOnboardingState(null), defaultOnboardingState);
});

test("normalizeOnboardingState accepts Supabase snake_case fields", () => {
  const state = normalizeOnboardingState({
    current_onboarding_step: 3,
    onboarding_started_at: "2026-07-30T08:00:00.000Z",
    onboarding_completed_at: null,
    allergy_setup_completed: true,
    install_prompt_seen: true,
    install_prompt_outcome: "dismissed",
    app_install_status: "not_installed",
  });

  assert.equal(state.currentOnboardingStep, 3);
  assert.equal(state.onboardingStartedAt, "2026-07-30T08:00:00.000Z");
  assert.equal(state.onboardingCompletedAt, null);
  assert.equal(state.allergySetupCompleted, true);
  assert.equal(state.installPromptSeen, true);
  assert.equal(state.installPromptOutcome, "dismissed");
  assert.equal(state.appInstallStatus, "not_installed");
});

test("normalizeOnboardingState clamps steps and removes invalid install values", () => {
  const state = normalizeOnboardingState({
    currentOnboardingStep: 99,
    onboardingStartedAt: " 2026-07-30T08:00:00.000Z ",
    installPromptOutcome: "forced",
    appInstallStatus: "definitely_installed",
  });

  assert.equal(state.currentOnboardingStep, 4);
  assert.equal(state.onboardingStartedAt, "2026-07-30T08:00:00.000Z");
  assert.equal(state.installPromptOutcome, null);
  assert.equal(state.appInstallStatus, "unknown");
});
