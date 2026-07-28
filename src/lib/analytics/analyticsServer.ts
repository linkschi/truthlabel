import {
  type AnalyticsEventName,
  type AnalyticsMetadata,
  isAnalyticsEventName,
  sanitizeAnalyticsMetadata,
} from "@/lib/analytics/analyticsEvents";

export type AnalyticsEventRecord = {
  event_name: AnalyticsEventName;
  anonymous_id: string;
  user_id: string | null;
  route_path: string | null;
  referrer_path: string | null;
  app_version: string | null;
  build_date: string | null;
  device_type: string | null;
  os_name: string | null;
  browser_name: string | null;
  viewport_width: number | null;
  viewport_height: number | null;
  metadata: AnalyticsMetadata;
  occurred_at: string;
};

const maxEventsPerRequest = 10;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replace(/\s+/g, " ").trim().slice(0, maxLength);
  return cleaned || null;
}

function cleanPath(value: unknown) {
  const cleaned = cleanString(value, 240);

  if (!cleaned) {
    return null;
  }

  if (cleaned === "external") {
    return cleaned;
  }

  return cleaned.startsWith("/") ? cleaned : null;
}

function cleanUserId(value: unknown) {
  const cleaned = cleanString(value, 80);
  return cleaned && uuidPattern.test(cleaned) ? cleaned : null;
}

function cleanAnonymousId(value: unknown) {
  const cleaned = cleanString(value, 96);
  return cleaned || "unknown";
}

function cleanDate(value: unknown) {
  const cleaned = cleanString(value, 80);
  const fallback = new Date().toISOString();

  if (!cleaned) {
    return fallback;
  }

  const parsed = new Date(cleaned);

  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

function cleanInteger(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(10000, Math.round(value)));
}

function normalizeEvent(input: unknown): AnalyticsEventRecord | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }

  const event = input as Record<string, unknown>;
  const eventName = event.eventName;

  if (!isAnalyticsEventName(eventName)) {
    return null;
  }

  const device =
    event.device && typeof event.device === "object" && !Array.isArray(event.device)
      ? (event.device as Record<string, unknown>)
      : {};

  return {
    event_name: eventName,
    anonymous_id: cleanAnonymousId(event.anonymousId),
    user_id: cleanUserId(event.userId),
    route_path: cleanPath(event.routePath),
    referrer_path: cleanPath(event.referrerPath),
    app_version: cleanString(event.appVersion, 40),
    build_date: cleanString(event.buildDate, 40),
    device_type: cleanString(device.device_type, 30),
    os_name: cleanString(device.os_name, 30),
    browser_name: cleanString(device.browser_name, 30),
    viewport_width: cleanInteger(device.viewport_width),
    viewport_height: cleanInteger(device.viewport_height),
    metadata: sanitizeAnalyticsMetadata(event.metadata),
    occurred_at: cleanDate(event.occurredAt),
  };
}

export function normalizeAnalyticsRequest(input: unknown): AnalyticsEventRecord[] {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return [];
  }

  const payload = input as Record<string, unknown>;
  const rawEvents = Array.isArray(payload.events)
    ? payload.events
    : payload.eventName
      ? [payload]
      : [];

  return rawEvents
    .slice(0, maxEventsPerRequest)
    .map(normalizeEvent)
    .filter((event): event is AnalyticsEventRecord => Boolean(event));
}
