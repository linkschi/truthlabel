import { createClient } from "@supabase/supabase-js";
import { normalizeAnalyticsRequest } from "@/lib/analytics/analyticsServer";

export const runtime = "nodejs";

function getSupabaseAnalyticsClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        accepted: false,
        stored: false,
        message: "Invalid analytics payload.",
      },
      { status: 400 },
    );
  }

  const events = normalizeAnalyticsRequest(payload);

  if (events.length === 0) {
    return Response.json(
      {
        accepted: false,
        stored: false,
        message: "No valid analytics events.",
      },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAnalyticsClient();

  if (!supabase) {
    return Response.json(
      {
        accepted: true,
        stored: false,
        eventCount: events.length,
        message: "Analytics storage is not configured.",
      },
      { status: 202 },
    );
  }

  const { error } = await supabase.from("analytics_events").insert(events);

  if (error) {
    console.error("Truthlabel analytics insert failed", {
      code: error.code,
      message: error.message,
    });

    return Response.json(
      {
        accepted: true,
        stored: false,
        eventCount: events.length,
        message: "Analytics event accepted but not stored.",
      },
      { status: 202 },
    );
  }

  return Response.json({
    accepted: true,
    stored: true,
    eventCount: events.length,
  });
}
