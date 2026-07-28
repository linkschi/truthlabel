"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { trackTruthlabelEvent } from "@/lib/analytics/analyticsClient";
import { isAnalyticsEventName } from "@/lib/analytics/analyticsEvents";

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

  return null;
}

export default function AnalyticsPageTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsPageTrackerInner />
    </Suspense>
  );
}
