import { createClient } from "@supabase/supabase-js";
import {
  type AnalyticsEventRow,
  buildAnalyticsSummary,
  type GumroadPurchaseAnalyticsRow,
  type SubscriptionAnalyticsRow,
} from "@/lib/analytics/analyticsSummary";
import { isTruthlabelAdminEmail } from "@/lib/auth/adminAccess";

export const runtime = "nodejs";

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

function getPublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    ""
  );
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}

async function getAuthorizedAdminEmail(request: Request) {
  const supabaseUrl = getSupabaseUrl();
  const publishableKey = getPublishableKey();
  const token = getBearerToken(request);

  if (!supabaseUrl || !publishableKey || !token) {
    return null;
  }

  const authClient = createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  const { data, error } = await authClient.auth.getUser();

  if (error || !data.user?.email) {
    return null;
  }

  const normalizedEmail = data.user.email.trim().toLowerCase();

  return isTruthlabelAdminEmail(normalizedEmail) ? normalizedEmail : null;
}

function getPeriodDays(request: Request) {
  const url = new URL(request.url);
  const rawValue = Number(url.searchParams.get("periodDays") ?? "7");

  if (!Number.isFinite(rawValue)) {
    return 7;
  }

  return Math.max(1, Math.min(90, Math.round(rawValue)));
}

async function safeSelect<T>(
  query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  label: string,
  warnings: string[],
) {
  const { data, error } = await query;

  if (error) {
    warnings.push(`${label} could not be loaded: ${error.message}`);
    return [];
  }

  return data ?? [];
}

export async function GET(request: Request) {
  const adminEmail = await getAuthorizedAdminEmail(request);

  if (!adminEmail) {
    return Response.json(
      {
        ok: false,
        message:
          "Analytics summary requires a signed-in Truthlabel admin account.",
      },
      { status: 401 },
    );
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      {
        ok: false,
        message: "Analytics summary storage is not configured.",
      },
      { status: 503 },
    );
  }

  const periodDays = getPeriodDays(request);
  const since = new Date(
    Date.now() - periodDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const warnings: string[] = [];

  const [events, purchases, subscriptions] = await Promise.all([
    safeSelect<AnalyticsEventRow>(
      serviceClient
        .from("analytics_events")
        .select(
          "event_name, anonymous_id, user_id, route_path, device_type, os_name, browser_name, metadata, occurred_at, created_at",
        )
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000),
      "App analytics",
      warnings,
    ),
    safeSelect<GumroadPurchaseAnalyticsRow>(
      serviceClient
        .from("gumroad_purchase_events")
        .select("status, matched_user_id, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1000),
      "Purchase events",
      warnings,
    ),
    safeSelect<SubscriptionAnalyticsRow>(
      serviceClient
        .from("subscriptions")
        .select("status, created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
      "Subscriptions",
      warnings,
    ),
  ]);

  if (events.length >= 5000) {
    warnings.push(
      "App analytics reached the 5,000-event dashboard limit for this period. Shorten the period for a more complete view.",
    );
  }

  return Response.json({
    ok: true,
    adminEmail,
    warnings,
    summary: buildAnalyticsSummary({
      events,
      purchases,
      subscriptions,
      periodDays,
    }),
  });
}
