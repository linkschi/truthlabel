// Supabase Edge Function: links a signed-in Truthlabel user to a pending
// checkout purchase event that arrived from Gumroad.
//
// This is used when the user returns from checkout before the client has seen
// an active subscription row. It keeps purchase data server-side and only links
// events whose checkout email matches the signed-in account email.
//
// Required Supabase secrets:
// - SUPABASE_SERVICE_ROLE_KEY
// Optional:
// - LICENSE_HASH_SECRET, only needed when Gumroad sends a license key
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SubscriptionStatus =
  | "active"
  | "active_until_end"
  | "payment_failed"
  | "expired"
  | "refunded"
  | "disputed"
  | "chargebacked";

type PendingPurchaseEvent = {
  id: string;
  gumroad_sale_id: string | null;
  gumroad_subscription_id: string | null;
  gumroad_email: string;
  gumroad_product_id: string | null;
  gumroad_permalink: string | null;
  status: SubscriptionStatus;
  matched_user_id: string | null;
  raw_payload: Record<string, unknown> | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function env(name: string) {
  return Deno.env.get(name)?.trim() ?? "";
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function firstRawValue(
  payload: Record<string, unknown> | null | undefined,
  names: string[],
) {
  if (!payload) {
    return "";
  }

  for (const name of names) {
    const value = cleanString(payload[name]);

    if (value) {
      return value;
    }
  }

  return "";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = cleanString((error as { message?: unknown }).message);

    if (message) {
      return message;
    }
  }

  return fallback;
}

function getAccessEndsAt(event: PendingPurchaseEvent) {
  const rawDate = firstRawValue(event.raw_payload, [
    "subscription_ended_at",
    "access_ends_at",
    "ended_at",
  ]);

  if (!rawDate) {
    return null;
  }

  const timestamp = Date.parse(rawDate);

  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

async function hashLicenseKey(licenseKey: string) {
  const secret = env("LICENSE_HASH_SECRET");

  if (!secret || secret.includes("replace-with")) {
    return null;
  }

  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(licenseKey),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function purchaseAlreadyBelongsToAnotherUser(
  serviceClient: ReturnType<typeof createClient>,
  event: PendingPurchaseEvent,
  userId: string,
) {
  if (event.gumroad_sale_id) {
    const { data, error } = await serviceClient
      .from("subscriptions")
      .select("user_id")
      .eq("gumroad_sale_id", event.gumroad_sale_id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.user_id && data.user_id !== userId) {
      return true;
    }
  }

  if (event.gumroad_subscription_id) {
    const { data, error } = await serviceClient
      .from("subscriptions")
      .select("user_id")
      .eq("gumroad_subscription_id", event.gumroad_subscription_id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.user_id && data.user_id !== userId) {
      return true;
    }
  }

  return false;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ linked: false, message: "Method not allowed." }, 405);
  }

  const supabaseUrl = env("SUPABASE_URL");
  const supabaseAnonKey = env("SUPABASE_ANON_KEY");
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = request.headers.get("Authorization") ?? "";

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return json(
      {
        linked: false,
        message: "Checkout activation is not configured yet.",
      },
      500,
    );
  }

  if (!authHeader) {
    return json(
      {
        linked: false,
        message: "Sign in before checking checkout access.",
      },
      401,
    );
  }

  try {
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return json(
        {
          linked: false,
          message: "Your sign-in session expired. Sign in and try again.",
        },
        401,
      );
    }

    const userEmail = normalizeEmail(user.email);

    if (!userEmail) {
      return json({
        linked: false,
        message: "This account does not have an email address to match.",
      });
    }

    const { data: existingSubscription, error: subscriptionReadError } =
      await serviceClient
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

    if (subscriptionReadError) {
      throw subscriptionReadError;
    }

    if (
      existingSubscription?.status === "active" ||
      existingSubscription?.status === "active_until_end"
    ) {
      return json({
        linked: true,
        alreadyActive: true,
        status: existingSubscription.status,
        message: "Truthlabel access is already active.",
      });
    }

    const { data: events, error: eventReadError } = await serviceClient
      .from("gumroad_purchase_events")
      .select(
        "id, gumroad_sale_id, gumroad_subscription_id, gumroad_email, gumroad_product_id, gumroad_permalink, status, matched_user_id, raw_payload",
      )
      .eq("gumroad_email", userEmail)
      .in("status", ["active", "active_until_end"])
      .order("processed_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .limit(5);

    if (eventReadError) {
      throw eventReadError;
    }

    const pendingEvent = (events as PendingPurchaseEvent[] | null)?.find(
      (event) =>
        event.gumroad_product_id &&
        (!event.matched_user_id || event.matched_user_id === user.id),
    );

    if (!pendingEvent) {
      return json({
        linked: false,
        message:
          "No completed checkout was found for this signed-in email yet.",
      });
    }

    if (
      await purchaseAlreadyBelongsToAnotherUser(
        serviceClient,
        pendingEvent,
        user.id,
      )
    ) {
      return json(
        {
          linked: false,
          message:
            "This checkout is already linked to another Truthlabel account.",
        },
        409,
      );
    }

    const licenseKey = firstRawValue(pendingEvent.raw_payload, [
      "license_key",
      "licenseKey",
    ]);
    const licenseKeyHash = licenseKey ? await hashLicenseKey(licenseKey) : null;
    const subscriptionPayload: Record<string, string | null> = {
      user_id: user.id,
      provider: "gumroad",
      gumroad_product_id: pendingEvent.gumroad_product_id,
      gumroad_sale_id: pendingEvent.gumroad_sale_id,
      gumroad_subscription_id: pendingEvent.gumroad_subscription_id,
      gumroad_email: pendingEvent.gumroad_email,
      status: pendingEvent.status,
      access_ends_at: getAccessEndsAt(pendingEvent),
      last_verified_at: new Date().toISOString(),
    };

    if (licenseKeyHash) {
      subscriptionPayload.license_key_hash = licenseKeyHash;
    }

    const { error: writeError } = await serviceClient
      .from("subscriptions")
      .upsert(subscriptionPayload, { onConflict: "user_id" });

    if (writeError) {
      throw writeError;
    }

    const { error: eventWriteError } = await serviceClient
      .from("gumroad_purchase_events")
      .update({
        matched_user_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pendingEvent.id);

    if (eventWriteError) {
      throw eventWriteError;
    }

    return json({
      linked: true,
      status: pendingEvent.status,
      message: "Checkout found. Truthlabel access is active.",
    });
  } catch (error) {
    return json(
      {
        linked: false,
        message: getErrorMessage(
          error,
          "Truthlabel could not link checkout access.",
        ),
      },
      500,
    );
  }
});
