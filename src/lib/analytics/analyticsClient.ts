"use client";

import { publicAppConfig } from "@/lib/appConfig";
import {
  type AnalyticsEventName,
  type AnalyticsMetadata,
  sanitizeAnalyticsMetadata,
} from "@/lib/analytics/analyticsEvents";

const ANALYTICS_ANONYMOUS_ID_KEY = "truthlabel.analytics.anonymousId";

type TrackEventOptions = {
  routePath?: string;
  userId?: string | null;
};

function createAnonymousId() {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  return `tl_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

export function getTruthlabelAnonymousId() {
  if (typeof window === "undefined") {
    return "server";
  }

  try {
    const existing = window.localStorage.getItem(ANALYTICS_ANONYMOUS_ID_KEY);

    if (existing) {
      return existing;
    }

    const nextId = createAnonymousId();
    window.localStorage.setItem(ANALYTICS_ANONYMOUS_ID_KEY, nextId);
    return nextId;
  } catch {
    return createAnonymousId();
  }
}

function getBrowserName(userAgent: string) {
  if (/edg\//i.test(userAgent)) {
    return "edge";
  }

  if (/firefox\//i.test(userAgent)) {
    return "firefox";
  }

  if (/crios\//i.test(userAgent)) {
    return "chrome_ios";
  }

  if (/chrome\//i.test(userAgent)) {
    return "chrome";
  }

  if (/safari\//i.test(userAgent)) {
    return "safari";
  }

  return "unknown";
}

function getOsName(userAgent: string) {
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return "ios";
  }

  if (/android/i.test(userAgent)) {
    return "android";
  }

  if (/windows/i.test(userAgent)) {
    return "windows";
  }

  if (/mac os|macintosh/i.test(userAgent)) {
    return "macos";
  }

  if (/linux/i.test(userAgent)) {
    return "linux";
  }

  return "unknown";
}

function getDeviceType(userAgent: string, width: number) {
  if (/ipad|tablet/i.test(userAgent)) {
    return "tablet";
  }

  if (/mobi|iphone|android/i.test(userAgent) || width < 768) {
    return "mobile";
  }

  return "desktop";
}

function getCurrentRoutePath() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.pathname || "/";
}

function getReferrerPath() {
  if (typeof document === "undefined" || !document.referrer) {
    return "";
  }

  try {
    const referrer = new URL(document.referrer);

    if (referrer.origin !== window.location.origin) {
      return "external";
    }

    return referrer.pathname || "/";
  } catch {
    return "";
  }
}

function buildDeviceContext() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {};
  }

  const userAgent = navigator.userAgent || "";
  const viewportWidth = window.innerWidth || 0;
  const viewportHeight = window.innerHeight || 0;

  return {
    browser_name: getBrowserName(userAgent),
    os_name: getOsName(userAgent),
    device_type: getDeviceType(userAgent, viewportWidth),
    viewport_width: viewportWidth,
    viewport_height: viewportHeight,
  };
}

export function trackTruthlabelEvent(
  eventName: AnalyticsEventName,
  metadata: AnalyticsMetadata = {},
  options: TrackEventOptions = {},
) {
  if (
    typeof window === "undefined" ||
    !publicAppConfig.flags.enableAnalytics
  ) {
    return;
  }

  const endpoint = publicAppConfig.analyticsRoutePath;
  const payload = {
    eventName,
    anonymousId: getTruthlabelAnonymousId(),
    userId: options.userId || undefined,
    occurredAt: new Date().toISOString(),
    routePath: options.routePath || getCurrentRoutePath(),
    referrerPath: getReferrerPath(),
    appVersion: publicAppConfig.appVersion,
    buildDate: publicAppConfig.buildDate,
    device: buildDeviceContext(),
    metadata: sanitizeAnalyticsMetadata(metadata),
  };
  const body = JSON.stringify({ events: [payload] });

  try {
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });

      if (navigator.sendBeacon(endpoint, blob)) {
        return;
      }
    }

    void fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body,
      credentials: "same-origin",
      keepalive: true,
    }).catch(() => {
      // Analytics must never interrupt the app.
    });
  } catch {
    // Analytics must never interrupt the app.
  }
}
