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
  occurred_at?: string | null;
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

export type AnalyticsCount = {
  label: string;
  count: number;
};

export type AnalyticsRecentEvent = {
  eventName: string;
  routePath: string;
  occurredAt: string;
  deviceType: string;
  browserName: string;
  osName: string;
  errorType?: string;
  status?: string;
  source?: string;
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
    scanMetrics: AnalyticsMetric[];
    topEvents: AnalyticsCount[];
    topRoutes: AnalyticsCount[];
    topErrorTypes: AnalyticsCount[];
    deviceBreakdown: AnalyticsCount[];
    browserBreakdown: AnalyticsCount[];
    osBreakdown: AnalyticsCount[];
    recentEvents: AnalyticsRecentEvent[];
    recentFailures: AnalyticsRecentEvent[];
  };
  business: {
    landingVisitors: number;
    landingUniqueVisitors: number;
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
    trialClickSources: AnalyticsCount[];
  };
  alerts: AnalyticsAlert[];
};

const seriousFailureEvents = new Set<string>([
  "signup_failed",
  "checkout_open_failed",
  "activation_failed",
  "access_check_failed",
  "manual_scan_failed",
  "barcode_lookup_failed",
  "ocr_scan_failed",
  "password_reset_failed",
  "signout_failed",
  "app_error",
  "client_error_captured",
  "resource_load_failed",
  "unhandled_rejection",
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

function cleanRoutePath(routePath: string | null | undefined) {
  return routePath?.trim() || "unknown";
}

function getMetadataString(
  metadata: AnalyticsMetadata | null | undefined,
  key: string,
) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function toRecentEvent(event: AnalyticsEventRow): AnalyticsRecentEvent {
  const errorType = getEventErrorType(event);
  const status =
    getMetadataString(event.metadata, "status") ||
    getMetadataString(event.metadata, "lookup_status") ||
    getMetadataString(event.metadata, "access_state") ||
    getMetadataString(event.metadata, "install_outcome");
  const source =
    getMetadataString(event.metadata, "source") ||
    getMetadataString(event.metadata, "scan_source") ||
    getMetadataString(event.metadata, "source_kind");

  return {
    eventName: event.event_name,
    routePath: cleanRoutePath(event.route_path),
    occurredAt: event.occurred_at || event.created_at,
    deviceType: event.device_type || "unknown",
    browserName: event.browser_name || "unknown",
    osName: event.os_name || "unknown",
    ...(errorType ? { errorType } : {}),
    ...(status ? { status } : {}),
    ...(source ? { source } : {}),
  };
}

function isLandingPageView(event: AnalyticsEventRow) {
  if (event.event_name !== "page_view") {
    return false;
  }

  const routePath = cleanRoutePath(event.route_path);
  return routePath === "/landing" || routePath === "/";
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
  accessCheckFailures: number;
  clientErrors: number;
  resourceLoadFailures: number;
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

  if (args.accessCheckFailures > 0) {
    alerts.push({
      id: "access_check_failures",
      tone: "red",
      title: "Access checks are failing",
      message: "Users may be seeing inactive access or account-check warnings.",
    });
  }

  if (args.clientErrors > 0) {
    alerts.push({
      id: "client_errors",
      tone: "red",
      title: "Browser errors were captured",
      message: "Review client-side crashes or unhandled promise failures by device and browser.",
    });
  }

  if (args.resourceLoadFailures >= 3) {
    alerts.push({
      id: "resource_load_failures",
      tone: "yellow",
      title: "Resources are failing to load",
      message: "Images, scripts, styles, or videos may be failing for some visitors.",
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

  const landingPageViews = events.filter(isLandingPageView);
  const landingVisitors = landingPageViews.length;
  const landingUniqueVisitors = new Set(
    landingPageViews.map((event) => event.anonymous_id).filter(Boolean),
  ).size;
  const trialClicks = getEventCount(eventCounts, "trial_cta_clicked");
  const trialClickSources = topCounts(
    countBy(
      events
        .filter((event) => event.event_name === "trial_cta_clicked")
        .map((event) => getMetadataString(event.metadata, "source") || "unknown"),
    ),
    8,
  );
  const signupStarted = getEventCount(eventCounts, "signup_started");
  const signupSuccess = getEventCount(eventCounts, "signup_success");
  const signupFailed = getEventCount(eventCounts, "signup_failed");
  const checkoutStarted = getEventCount(eventCounts, "checkout_started");
  const checkoutReturned = getEventCount(eventCounts, "checkout_returned");
  const checkoutOpenFailed = getEventCount(eventCounts, "checkout_open_failed");
  const activationSuccess = getEventCount(eventCounts, "activation_success");
  const activationFailed = getEventCount(eventCounts, "activation_failed");
  const manualScanStarted = getEventCount(eventCounts, "manual_scan_started");
  const manualScanSuccess = getEventCount(eventCounts, "manual_scan_success");
  const barcodeFailures = getEventCount(eventCounts, "barcode_lookup_failed");
  const barcodeScanStarted = getEventCount(eventCounts, "barcode_scan_started");
  const barcodeLookupSuccess = getEventCount(eventCounts, "barcode_lookup_success");
  const barcodeNoProductFound = getEventCount(eventCounts, "barcode_no_product_found");
  const barcodeMissingIngredients = getEventCount(
    eventCounts,
    "barcode_missing_ingredients",
  );
  const ocrScanStarted = getEventCount(eventCounts, "ocr_scan_started");
  const ocrTextExtracted = getEventCount(eventCounts, "ocr_text_extracted");
  const ocrFailures =
    getEventCount(eventCounts, "ocr_scan_failed") +
    getEventCount(eventCounts, "ocr_no_text_detected");
  const manualScanFailures = getEventCount(eventCounts, "manual_scan_failed");
  const resultPagesLoaded = getEventCount(eventCounts, "result_page_loaded");
  const accessCheckFailures = getEventCount(eventCounts, "access_check_failed");
  const accessCachedFallbacks = getEventCount(eventCounts, "access_cached_fallback_used");
  const loginSuccess = getEventCount(eventCounts, "login_success");
  const loginFailed = getEventCount(eventCounts, "login_failed");
  const clientErrors =
    getEventCount(eventCounts, "client_error_captured") +
    getEventCount(eventCounts, "unhandled_rejection");
  const resourceLoadFailures = getEventCount(eventCounts, "resource_load_failed");
  const recentEvents = events.slice(0, 20).map(toRecentEvent);
  const recentFailures = events
    .filter((event) => seriousFailureEvents.has(event.event_name))
    .slice(0, 12)
    .map(toRecentEvent);

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
      "Barcode hidden",
      barcodeNoProductFound,
      "Barcodes that were read but had no product data available.",
      barcodeNoProductFound >= 5 ? "yellow" : "green",
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
    metric(
      "Access check failures",
      accessCheckFailures,
      "Account access checks that failed or fell back to cached access.",
      accessCheckFailures > 0 ? "red" : "green",
    ),
    metric(
      "Browser errors",
      clientErrors,
      "Client crashes or unhandled app promises captured in browsers.",
      clientErrors > 0 ? "red" : "green",
    ),
    metric(
      "Resource load failures",
      resourceLoadFailures,
      "Images, scripts, styles, videos, or source files that failed to load.",
      resourceLoadFailures >= 3 ? "yellow" : "green",
    ),
  ];

  const scanMetrics = [
    metric(
      "Manual started",
      manualScanStarted,
      "Manual ingredient scans started.",
      manualScanStarted > 0 ? "green" : "neutral",
    ),
    metric(
      "Manual success",
      manualScanSuccess,
      "Manual ingredient scans that completed.",
      manualScanSuccess > 0 ? "green" : "neutral",
    ),
    metric(
      "Manual failed",
      manualScanFailures,
      "Manual ingredient scans that failed.",
      manualScanFailures > 0 ? "red" : "green",
    ),
    metric(
      "Barcode started",
      barcodeScanStarted,
      "Camera barcode scan sessions started.",
      barcodeScanStarted > 0 ? "green" : "neutral",
    ),
    metric(
      "Barcode success",
      barcodeLookupSuccess,
      "Barcode lookups that loaded product data.",
      barcodeLookupSuccess > 0 ? "green" : "neutral",
    ),
    metric(
      "Barcode hidden",
      barcodeNoProductFound,
      "Barcode lookups where product data was not available.",
      barcodeNoProductFound > 0 ? "yellow" : "green",
    ),
    metric(
      "Missing ingredients",
      barcodeMissingIngredients,
      "Products found without enough ingredient data.",
      barcodeMissingIngredients > 0 ? "yellow" : "green",
    ),
    metric(
      "OCR started",
      ocrScanStarted,
      "Ingredient photo scans started.",
      ocrScanStarted > 0 ? "green" : "neutral",
    ),
    metric(
      "OCR text found",
      ocrTextExtracted,
      "Ingredient photo scans that extracted text.",
      ocrTextExtracted > 0 ? "green" : "neutral",
    ),
  ];

  const businessMetrics = [
    metric(
      "Landing page visits",
      landingVisitors,
      "Page views on the public landing page.",
      landingVisitors > 0 ? "green" : "neutral",
    ),
    metric(
      "Unique landing visitors",
      landingUniqueVisitors,
      "Distinct browsers that viewed the landing page.",
      landingUniqueVisitors > 0 ? "green" : "neutral",
    ),
    metric(
      "Trial button clicks",
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
      "Checkout returns",
      checkoutReturned,
      "Visitors who returned to Truthlabel from checkout.",
      checkoutReturned > 0 ? "green" : "neutral",
    ),
    metric(
      "Checkout open failed",
      checkoutOpenFailed,
      "Checkout handoffs that failed to open.",
      checkoutOpenFailed > 0 ? "red" : "green",
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
    metric(
      "Login success",
      loginSuccess,
      "Successful sign-ins during this period.",
      loginSuccess > 0 ? "green" : "neutral",
    ),
    metric(
      "Login failed",
      loginFailed,
      "Failed sign-in attempts during this period.",
      loginFailed > 0 ? "yellow" : "green",
    ),
    metric(
      "Cached access used",
      accessCachedFallbacks,
      "Times the app allowed access from trusted cached account state.",
      accessCachedFallbacks > 0 ? "yellow" : "neutral",
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
      scanMetrics,
      topEvents: topCounts(eventCounts, 12),
      topRoutes: topCounts(countBy(events.map((event) => event.route_path)), 12),
      topErrorTypes: topCounts(errorCounts),
      deviceBreakdown: topCounts(countBy(events.map((event) => event.device_type))),
      browserBreakdown: topCounts(countBy(events.map((event) => event.browser_name))),
      osBreakdown: topCounts(countBy(events.map((event) => event.os_name))),
      recentEvents,
      recentFailures,
    },
    business: {
      landingVisitors,
      trialClicks,
      landingUniqueVisitors,
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
      trialClickSources,
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
      accessCheckFailures,
      clientErrors,
      resourceLoadFailures,
    }),
  };
}
