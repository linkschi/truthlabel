"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { trackTruthlabelEvent } from "@/lib/analytics/analyticsClient";
import {
  type AnalyticsEventName,
  type AnalyticsMetadata,
  isAnalyticsEventName,
  normalizeAnalyticsError,
} from "@/lib/analytics/analyticsEvents";

function getSourceKind(value: string | null | undefined) {
  if (!value) {
    return "unknown";
  }

  try {
    const url = new URL(value, window.location.href);

    if (url.origin === window.location.origin) {
      return "same_origin";
    }

    return "external";
  } catch {
    return "unknown";
  }
}

function getResourceSource(target: HTMLElement) {
  if (target instanceof HTMLImageElement) {
    return target.currentSrc || target.src;
  }

  if (target instanceof HTMLScriptElement) {
    return target.src;
  }

  if (target instanceof HTMLLinkElement) {
    return target.href;
  }

  if (target instanceof HTMLVideoElement) {
    return target.currentSrc || target.src;
  }

  if (target instanceof HTMLSourceElement) {
    return target.src;
  }

  return "";
}

function getReasonName(reason: unknown) {
  if (reason instanceof Error) {
    return reason.name || "Error";
  }

  if (reason && typeof reason === "object") {
    return "object";
  }

  return typeof reason || "unknown";
}

function AnalyticsPageTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { accessState, user } = useTruthlabelAuth();
  const lastTrackedRouteRef = useRef("");
  const routeKey = `${pathname || "/"}?${searchParams.toString()}`;

  useEffect(() => {
    if (!pathname || lastTrackedRouteRef.current === routeKey) {
      return;
    }

    lastTrackedRouteRef.current = routeKey;

    trackTruthlabelEvent(
      "page_view",
      {
        page_path: pathname,
        has_query: searchParams.toString().length > 0,
        access_state: accessState,
      },
      { routePath: pathname, userId: user?.id },
    );
  }, [accessState, pathname, routeKey, searchParams, user?.id]);

  useEffect(() => {
    function handleAnalyticsClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const analyticsElement = target.closest<HTMLElement>(
        "[data-analytics-event]",
      );
      const eventName = analyticsElement?.dataset.analyticsEvent;

      if (!analyticsElement || !isAnalyticsEventName(eventName)) {
        return;
      }

      trackTruthlabelEvent(
        eventName,
        {
          source: analyticsElement.dataset.analyticsSource || "unknown",
          label: analyticsElement.dataset.analyticsLabel || analyticsElement.textContent || "",
        },
        { routePath: pathname || "/", userId: user?.id },
      );
    }

    document.addEventListener("click", handleAnalyticsClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleAnalyticsClick, {
        capture: true,
      });
    };
  }, [pathname, user?.id]);

  useEffect(() => {
    const seenErrors = new Set<string>();
    let trackedCount = 0;

    function trackOnce(
      eventName: AnalyticsEventName,
      metadata: AnalyticsMetadata,
    ) {
      if (trackedCount >= 20) {
        return;
      }

      const key = JSON.stringify({
        eventName,
        errorType: metadata.error_type,
        sourceKind: metadata.source_kind,
        resourceTag: metadata.resource_tag,
        routePath: pathname || "/",
        lineNumber: metadata.line_number,
      });

      if (seenErrors.has(key)) {
        return;
      }

      seenErrors.add(key);
      trackedCount += 1;
      trackTruthlabelEvent(eventName, metadata, {
        routePath: pathname || "/",
        userId: user?.id,
      });
    }

    function handleWindowError(event: ErrorEvent) {
      if (event.target && event.target !== window) {
        return;
      }

      trackOnce("client_error_captured", {
        error_type: normalizeAnalyticsError(event.error || event.message),
        error_name:
          event.error instanceof Error ? event.error.name || "Error" : "unknown",
        source_kind: getSourceKind(event.filename),
        line_number: Number.isFinite(event.lineno) ? event.lineno : 0,
        column_number: Number.isFinite(event.colno) ? event.colno : 0,
      });
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      trackOnce("unhandled_rejection", {
        error_type: normalizeAnalyticsError(event.reason),
        reason_kind: getReasonName(event.reason),
      });
    }

    function handleResourceError(event: Event) {
      const target = event.target;

      if (!(target instanceof HTMLElement) || target === document.documentElement) {
        return;
      }

      const resourceTag = target.tagName.toLowerCase();

      if (!["img", "script", "link", "video", "source"].includes(resourceTag)) {
        return;
      }

      trackOnce("resource_load_failed", {
        error_type: "resource_load_failed",
        resource_tag: resourceTag,
        source_kind: getSourceKind(getResourceSource(target)),
      });
    }

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    document.addEventListener("error", handleResourceError, true);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      document.removeEventListener("error", handleResourceError, true);
    };
  }, [pathname, user?.id]);

  return null;
}

export default function AnalyticsPageTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsPageTrackerInner />
    </Suspense>
  );
}
