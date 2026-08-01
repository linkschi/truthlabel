export type CountdownStatus = "counting" | "elapsed" | "invalid";

export type CountdownParts = {
  status: CountdownStatus;
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const secondMs = 1000;
const minuteMs = 60 * secondMs;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;

export function getCountdownParts(
  launchAt: string,
  now: Date | number = new Date(),
): CountdownParts {
  const launchTime = new Date(launchAt).getTime();
  const nowTime = typeof now === "number" ? now : now.getTime();

  if (!launchAt || !Number.isFinite(launchTime) || !Number.isFinite(nowTime)) {
    return {
      status: "invalid",
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalMs = Math.max(0, launchTime - nowTime);

  return {
    status: totalMs > 0 ? "counting" : "elapsed",
    totalMs,
    days: Math.floor(totalMs / dayMs),
    hours: Math.floor((totalMs % dayMs) / hourMs),
    minutes: Math.floor((totalMs % hourMs) / minuteMs),
    seconds: Math.floor((totalMs % minuteMs) / secondMs),
  };
}

export function formatLaunchDate(launchAt: string, locale?: string) {
  const launchDate = new Date(launchAt);

  if (!Number.isFinite(launchDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(launchDate);
}
