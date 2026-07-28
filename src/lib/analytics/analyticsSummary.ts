import type { AnalyticsEventName, AnalyticsMetadata } from "./analyticsEvents";

export type AnalyticsEventRow = {
  event_name: string;
  anonymous_id: string | null;
  user_id: string | null;
  route_path: string | null;
  device_type: string | null;
  os_name: string | null;
  browser_name: string | null;
  metadata: AnalyticsMetadata | null;
  created_at: string;
};

export type GumroadPurchaseAnalyticsRow = {
  status: string;
  matched_user_id: string | null;
  created_at: string;
};

export type SubscriptionAnalyticsRow = {
  status: string;
  created_at: string;
};

export type AnalyticsMetric = {
  label: string;
  value: number;
  tone: "green" | "yellow" | "red" | "neutral";
  helper: string;
};

export type AnalyticsAlert = {
  id: string;
  tone: "yellow" | "red";
  title: string;
  message: string;
};

export type AnalyticsSummary = {
  generatedAt: string;
  periodDays: number;
  reliability: {
    totalEvents: number;
    uniqueVisitors: number;
    signedInUsers: number;
    resultPagesLoaded: number;
    metrics: AnalyticsMetric[];
    topErrorTypes: Array<{ label: string; count: number }>;
    deviceBreakdown: Array<{ label: string; count: number }>;
    browserBreakdown: Array<{ label: string; count: number }>;
    osBreakdown: Array<{ label: string; count: number }>;
  };
  business: {
    landingVisitors: number;
    trialClicks: number;
    signupStarted: number;
    signupSuccess: number;
    checkoutStarted: number;
    activationSuccess: number;
    purchaseEvents: number;
    activeSubscriptions: number;
    unmatchedPurchases: number;
    conversionRates: Array<{ label: string; value: number; helper: string }>;
    metrics: AnalyticsMetric[];
  };
  alerts: AnalyticsAlert[];
};

const seriousFailureEvents = new Set<string>([
  "signup_failed",
  "activation_failed",
  "manual_scan_failed",
  "barcode_lookup_failed",
  "ocr_scan_failed",
  "password_reset_failed",
  "app_error",
]);

function countBy<T extends string | null | undefined>(
  values: T[],
): Map<NonNullable<T>, number> {
  const counts = new Map<NonNullable<T>, number>();

  values.forEach((value) => {
    if (!value) {
      return;
    }

    counts.set(value as NonNullable<T>, (counts.get(value as NonNullable<T>) ?? 0) + 1);
  });

  return counts;
}

function topCounts(counts: Map<string, number>, limit = 5) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function percentage(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
}

function metric(
  label: string,
  value: number,
  helper: string,
  tone: AnalyticsMetric["tone"] = "neutral",
): AnalyticsMetric {
  return { label, value, helper, tone };
}

function getEventCount(counts: Map<string, number>, eventName: AnalyticsEventName) {
  return counts.get(eventName) ?? 0;
}

function getEventErrorType(event: AnalyticsEventRow) {
  const errorType = event.metadata?.error_type;
  return typeof errorType === "string" && errorType ? errorType : null;
}

function buildAlerts(args: {
  signupFailed: number;
  signupStarted: number;
  activationFailed: number;
  activationSuccess: number;
  checkoutStarted: number;
  unmatchedPurchases: number;
  barcodeFailures: number;
  ocrFailures: number;
  manualScanFailures: number;
}) {
  const alerts: AnalyticsAlert[] = [];

  if (args.signupFailed > 0 && percentage(args.signupFailed, args.signupStarted) >= 20) {
    alerts.push({
      id: "signup_failures",
      tone: "red",
      title: "Signup failures are high",
      message: "A noticeable share of users are failing before checkout.",
    });
  }

  if (args.checkoutStarted > 0 && args.activationSuccess === 0) {
    alerts.push({
      id: "checkout_no_activation",
      tone: "yellow",
      title: "Checkout started but no activation yet",
      message: "Check whether users are returning from checkout and activating access.",
    });
  }

  if (args.unmatchedPurchases > 0) {
    alerts.push({
      id: "paid_not_matched",
      tone: "red",
      title: "Paid users may not be matched",
      message: "At least one purchase event has no matching Truthlabel account.",
    });
  }

  if (args.activationFailed > args.activationSuccess && args.activationFailed > 0) {
    alerts.push({
      id: "activation_failures",
      tone: "red",
      title: "Activation failures need review",
      message: "More activation attempts are failing than succeeding.",
    });
  }

  if (args.barcodeFailures >= 5) {
    alerts.push({
      id: "barcode_failures",
      tone: "yellow",
      title: "Barcode lookup failures are recurring",
      message: "Users may need clearer fallback guidance or better product coverage.",
    });
  }

  if (args.ocrFailures >= 5) {
    alerts.push({
      id: "ocr_failures",
      tone: "yellow",
      title: "OCR failures are recurring",
      message: "Ingredient-photo scanning may need image guidance or OCR tuning.",
    });
  }

  if (args.manualScanFailures >= 3) {
    alerts.push({
      id: "manual_scan_failures",
      tone: "red",
      title: "Manual scan failures need review",
      message: "The core scan flow is failing for some users.",
    });
  }

  return alerts;
}

export function buildAnalyticsSummary({
  events,
  purchases,
  subscriptions,
  periodDays,
  generatedAt = new Date().toISOString(),
}: {
  events: AnalyticsEventRow[];
  purchases: GumroadPurchaseAnalyticsRow[];
  subscriptions: SubscriptionAnalyticsRow[];
  periodDays: number;
  generatedAt?: string;
}): AnalyticsSummary {
  const eventCounts = countBy(events.map((event) => event.event_name));
  const uniqueVisitors = new Set(
    events.map((event) => event.anonymous_id).filter(Boolean),
  ).size;
  const signedInUsers = new Set(
    events.map((event) => event.user_id).filter(Boolean),
  ).size;
  const errorCounts = countBy(
    events
      .filter((event) => seriousFailureEvents.has(event.event_name))
      .map(getEventErrorType),
  );

  const landingVisitors = events.filter(
    (event) => event.event_name === "page_view" && event.route_path === "/",
  ).length;
  const trialClicks = getEventCount(eventCounts, "trial_cta_clicked");
  const signupStarted = getEventCount(eventCounts, "signup_started");
  const signupSuccess = getEventCount(eventCounts, "signup_success");
  const signupFailed = getEventCount(eventCounts, "signup_failed");
  const checkoutStarted = getEventCount(eventCounts, "checkout_started");
  const activationSuccess = getEventCount(eventCounts, "activation_success");
  const activationFailed = getEventCount(eventCounts, "activation_failed");
  const barcodeFailures = getEventCount(eventCounts, "barcode_lookup_failed");
  const ocrFailures =
    getEventCount(eventCounts, "ocr_scan_failed") +
    getEventCount(eventCounts, "ocr_no_text_detected");
  const manualScanFailures = getEventCount(eventCounts, "manual_scan_failed");
  const resultPagesLoaded = getEventCount(eventCounts, "result_page_loaded");

  const activeSubscriptions = subscriptions.filter((subscription) =>
    ["active", "active_until_end"].includes(subscription.status),
  ).length;
  const unmatchedPurchases = purchases.filter(
    (purchase) => !purchase.matched_user_id,
  ).length;
  const purchaseEvents = purchases.length;

  const reliabilityMetrics = [
    metric(
      "Signup success",
      percentage(signupSuccess, signupStarted),
      "Share of signup attempts that created an account.",
      signupStarted === 0 || signupFailed === 0 ? "green" : "yellow",
    ),
    metric(
      "Activation success",
      percentage(activationSuccess, activationSuccess + activationFailed),
      "Share of activation attempts that succeeded.",
      activationFailed === 0 ? "green" : "red",
    ),
    metric(
      "Barcode failures",
      barcodeFailures,
      "Barcode lookups that failed before a usable result.",
      barcodeFailures >= 5 ? "yellow" : "green",
    ),
    metric(
      "OCR failures",
      ocrFailures,
      "OCR failures or no-text detections.",
      ocrFailures >= 5 ? "yellow" : "green",
    ),
    metric(
      "Manual scan failures",
      manualScanFailures,
      "Core manual scan failures.",
      manualScanFailures > 0 ? "red" : "green",
    ),
  ];

  const businessMetrics = [
    metric(
      "Trial clicks",
      trialClicks,
      "People who clicked a trial CTA.",
      trialClicks > 0 ? "green" : "neutral",
    ),
    metric(
      "Checkout starts",
      checkoutStarted,
      "Checkout handoffs opened from account or activation pages.",
      checkoutStarted > 0 ? "green" : "neutral",
    ),
    metric(
      "Purchase events",
      purchaseEvents,
      "Purchase/subscription events received from checkout.",
      purchaseEvents > 0 ? "green" : "neutral",
    ),
    metric(
      "Active subscriptions",
      activeSubscriptions,
      "Accounts with active or active-until-end subscription access.",
      activeSubscriptions > 0 ? "green" : "neutral",
    ),
    metric(
      "Paid not matched",
      unmatchedPurchases,
      "Purchase events that did not match a Truthlabel account.",
      unmatchedPurchases > 0 ? "red" : "green",
    ),
  ];

  return {
    generatedAt,
    periodDays,
    reliability: {
      totalEvents: events.length,
      uniqueVisitors,
      signedInUsers,
      resultPagesLoaded,
      metrics: reliabilityMetrics,
      topErrorTypes: topCounts(errorCounts),
      deviceBreakdown: topCounts(countBy(events.map((event) => event.device_type))),
      browserBreakdown: topCounts(countBy(events.map((event) => event.browser_name))),
      osBreakdown: topCounts(countBy(events.map((event) => event.os_name))),
    },
    business: {
      landingVisitors,
      trialClicks,
      signupStarted,
      signupSuccess,
      checkoutStarted,
      activationSuccess,
      purchaseEvents,
      activeSubscriptions,
      unmatchedPurchases,
      conversionRates: [
        {
          label: "Landing to trial click",
          value: percentage(trialClicks, landingVisitors),
          helper: "Trial CTA clicks divided by landing page visits.",
        },
        {
          label: "Trial click to signup",
          value: percentage(signupStarted, trialClicks),
          helper: "Signup starts divided by trial CTA clicks.",
        },
        {
          label: "Signup to checkout",
          value: percentage(checkoutStarted, signupSuccess),
          helper: "Checkout starts divided by successful account creations.",
        },
        {
          label: "Checkout to activation",
          value: percentage(activationSuccess, checkoutStarted),
          helper: "Activations divided by checkout starts.",
        },
      ],
      metrics: businessMetrics,
    },
    alerts: buildAlerts({
      signupFailed,
      signupStarted,
      activationFailed,
      activationSuccess,
      checkoutStarted,
      unmatchedPurchases,
      barcodeFailures,
      ocrFailures,
      manualScanFailures,
    }),
  };
}
