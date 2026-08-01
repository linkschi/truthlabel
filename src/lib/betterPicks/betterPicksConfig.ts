const truthyPattern = /^(1|true|yes|on)$/i;
const falsyPattern = /^(0|false|no|off)$/i;

function readStringEnv(names: string[], fallback = "") {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return fallback;
}

function readBooleanEnv(names: string[], fallback: boolean) {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (!value) {
      continue;
    }

    if (truthyPattern.test(value)) {
      return true;
    }

    if (falsyPattern.test(value)) {
      return false;
    }
  }

  return fallback;
}

export type BetterPicksConfig = {
  featureName: "Better Picks";
  launchAt: string;
  enabled: boolean;
  reminderEnabled: boolean;
};

export const betterPicksConfig: BetterPicksConfig = {
  featureName: "Better Picks",
  launchAt: readStringEnv(
    ["NEXT_PUBLIC_BETTER_PICKS_LAUNCH_AT", "BETTER_PICKS_LAUNCH_AT"],
    "2026-08-08T14:30:00+02:00",
  ),
  enabled: readBooleanEnv(
    ["NEXT_PUBLIC_BETTER_PICKS_ENABLED", "BETTER_PICKS_ENABLED"],
    false,
  ),
  reminderEnabled: readBooleanEnv(
    ["NEXT_PUBLIC_BETTER_PICKS_REMINDER_ENABLED", "BETTER_PICKS_REMINDER_ENABLED"],
    true,
  ),
};
