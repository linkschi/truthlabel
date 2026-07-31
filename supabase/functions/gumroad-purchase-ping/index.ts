// Supabase Edge Function: receives Gumroad purchase pings and activates
// matching Truthlabel accounts automatically.
//
// Required Supabase secrets:
// - SUPABASE_SERVICE_ROLE_KEY
// - GUMROAD_WEBHOOK_SECRET
// - GUMROAD_PRODUCT_ID, or GUMROAD_PRODUCT_PERMALINK
// - LICENSE_HASH_SECRET, only needed when Gumroad sends a license key
//
// Configure Gumroad's notification URL with:
// https://YOUR-PROJECT.functions.supabase.co/gumroad-purchase-ping?secret=YOUR_SECRET
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SubscriptionStatus =
  | "active"
  | "active_until_end"
  | "payment_failed"
  | "expired"
  | "refunded"
  | "disputed"
  | "chargebacked";

type GumroadEventType =
  | "purchase"
  | "renewal"
  | "cancellation"
  | "expiration"
  | "payment_failed"
  | "refund"
  | "dispute"
  | "chargeback"
  | "unknown";

type ParsedGumroadPayload = Record<string, string>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

function booleanValue(value: string | undefined) {
  if (!value) {
    return false;
  }

  return /^(1|true|yes|on)$/i.test(value.trim());
}

function firstValue(payload: ParsedGumroadPayload, names: string[]) {
  for (const name of names) {
    const value = cleanString(payload[name]);

    if (value) {
      return value;
    }
  }

  return "";
}

function toIsoTimestamp(value: string | null | undefined) {
  const timestamp = value ? Date.parse(value) : NaN;

  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function firstTimestamp(payload: ParsedGumroadPayload, names: string[]) {
  for (const name of names) {
    const timestamp = toIsoTimestamp(cleanString(payload[name]));

    if (timestamp) {
      return timestamp;
    }
  }

  return null;
}

async function parsePayload(request: Request): Promise<ParsedGumroadPayload> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    const payload: ParsedGumroadPayload = {};

    if (body && typeof body === "object") {
      for (const [key, value] of Object.entries(body)) {
        payload[key] =
          typeof value === "string" || typeof value === "number" ||
          typeof value === "boolean"
            ? String(value)
            : "";
      }
    }

    return payload;
  }

  const text = await request.text();
  const params = new URLSearchParams(text);
  const payload: ParsedGumroadPayload = {};

  for (const [key, value] of params.entries()) {
    payload[key] = value;
  }

  return payload;
}

function validateWebhookSecret(request: Request) {
  const expectedSecret = env("GUMROAD_WEBHOOK_SECRET");

  if (!expectedSecret) {
    throw new Error("GUMROAD_WEBHOOK_SECRET is not configured.");
  }

  const url = new URL(request.url);
  const providedSecret =
    url.searchParams.get("secret")?.trim() ||
    request.headers.get("x-truthlabel-gumroad-secret")?.trim() ||
    "";

  if (providedSecret !== expectedSecret) {
    return false;
  }

  return true;
}

function inferSubscriptionStatus(payload: ParsedGumroadPayload): {
  status: SubscriptionStatus;
  accessEndsAt: string | null;
  eventType: GumroadEventType;
  gumroadEventAt: string | null;
  cancellationDetectedAt: string | null;
} {
  if (booleanValue(payload.chargebacked)) {
    const eventAt = firstTimestamp(payload, [
      "chargebacked_at",
      "chargeback_at",
      "chargeback_date",
      "updated_at",
    ]);

    return {
      status: "chargebacked",
      accessEndsAt: null,
      eventType: "chargeback",
      gumroadEventAt: eventAt,
      cancellationDetectedAt: eventAt,
    };
  }

  if (booleanValue(payload.refunded)) {
    const eventAt = firstTimestamp(payload, [
      "refunded_at",
      "refund_at",
      "refund_date",
      "updated_at",
    ]);

    return {
      status: "refunded",
      accessEndsAt: null,
      eventType: "refund",
      gumroadEventAt: eventAt,
      cancellationDetectedAt: eventAt,
    };
  }

  if (booleanValue(payload.disputed) && !booleanValue(payload.dispute_won)) {
    const eventAt = firstTimestamp(payload, [
      "disputed_at",
      "dispute_at",
      "dispute_created_at",
      "updated_at",
    ]);

    return {
      status: "disputed",
      accessEndsAt: null,
      eventType: "dispute",
      gumroadEventAt: eventAt,
      cancellationDetectedAt: eventAt,
    };
  }

  const cancelledAt = firstTimestamp(payload, [
    "subscription_cancelled_at",
    "cancelled_at",
    "canceled_at",
  ]);

  if (cancelledAt) {
    const accessEndsAt = firstTimestamp(payload, [
      "subscription_ended_at",
      "subscription_ends_at",
      "access_ends_at",
      "ended_at",
      "ends_at",
      "current_period_end",
      "paid_until",
    ]);

    return {
      status: "active_until_end",
      accessEndsAt,
      eventType: "cancellation",
      gumroadEventAt: cancelledAt,
      cancellationDetectedAt: cancelledAt,
    };
  }

  const paymentFailedAt = firstTimestamp(payload, [
    "subscription_failed_at",
    "failed_at",
    "payment_failed_at",
    "updated_at",
  ]);

  if (paymentFailedAt) {
    return {
      status: "payment_failed",
      accessEndsAt: null,
      eventType: "payment_failed",
      gumroadEventAt: paymentFailedAt,
      cancellationDetectedAt: paymentFailedAt,
    };
  }

  const endedAt = firstValue(payload, [
    "subscription_ended_at",
    "ended_at",
  ]);
  const endedAtTimestamp = toIsoTimestamp(endedAt);

  if (endedAtTimestamp) {
    return {
      status: "expired",
      accessEndsAt: endedAtTimestamp,
      eventType: "expiration",
      gumroadEventAt: endedAtTimestamp,
      cancellationDetectedAt: endedAtTimestamp,
    };
  }

  const eventAt = firstTimestamp(payload, [
    "purchase_created_at",
    "sale_created_at",
    "created_at",
    "sale_timestamp",
    "timestamp",
    "updated_at",
  ]);

  return {
    status: "active",
    accessEndsAt: null,
    eventType: "purchase",
    gumroadEventAt: eventAt,
    cancellationDetectedAt: null,
  };
}

function productMatches(payload: ParsedGumroadPayload) {
  const expectedProductId = env("GUMROAD_PRODUCT_ID");
  const expectedPermalink = env("GUMROAD_PRODUCT_PERMALINK");
  const productId = firstValue(payload, ["product_id", "productID"]);
  const permalink = firstValue(payload, [
    "permalink",
    "custom_permalink",
    "product_permalink",
  ]);
  const idMatches =
    Boolean(expectedProductId) &&
    Boolean(productId) &&
    productId === expectedProductId;
  const permalinkMatches =
    Boolean(expectedPermalink) &&
    Boolean(permalink) &&
    permalink === expectedPermalink;

  return idMatches || permalinkMatches;
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

async function findUserIdByEmail(
  serviceClient: ReturnType<typeof createClient>,
  email: string,
) {
  const { data, error } = await serviceClient
    .from("user_accounts")
    .select("user_id")
    .eq("normalized_email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.user_id ?? null;
}

async function findUserIdByPurchaseId(
  serviceClient: ReturnType<typeof createClient>,
  saleId: string,
  subscriptionId: string,
) {
  if (subscriptionId) {
    const { data, error } = await serviceClient
      .from("subscriptions")
      .select("user_id")
      .eq("gumroad_subscription_id", subscriptionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.user_id) {
      return data.user_id as string;
    }
  }

  if (saleId) {
    const { data, error } = await serviceClient
      .from("subscriptions")
      .select("user_id")
      .eq("gumroad_sale_id", saleId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.user_id) {
      return data.user_id as string;
    }
  }

  return null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ received: false, message: "Method not allowed." }, 405);
  }

  try {
    if (!validateWebhookSecret(request)) {
      return json({ received: false, message: "Invalid webhook secret." }, 401);
    }
  } catch (error) {
    return json(
      {
        received: false,
        message: getErrorMessage(error, "Webhook secret is not configured."),
      },
      500,
    );
  }

  const supabaseUrl = env("SUPABASE_URL");
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json(
      {
        received: false,
        message: "Gumroad purchase activation is not configured yet.",
      },
      500,
    );
  }

  let payload: ParsedGumroadPayload;

  try {
    payload = await parsePayload(request);
  } catch {
    return json(
      {
        received: false,
        message: "Gumroad payload could not be read.",
      },
      400,
    );
  }

  const gumroadEmail = normalizeEmail(
    firstValue(payload, ["email", "purchaser_email", "buyer_email"]),
  );
  const saleId = firstValue(payload, ["sale_id", "saleId", "id"]);
  const subscriptionId = firstValue(payload, [
    "subscription_id",
    "subscriptionId",
  ]);
  const productId =
    firstValue(payload, ["product_id", "productID"]) ||
    env("GUMROAD_PRODUCT_ID") ||
    env("GUMROAD_PRODUCT_PERMALINK");
  const permalink = firstValue(payload, [
    "permalink",
    "custom_permalink",
    "product_permalink",
  ]);
  const licenseKey = firstValue(payload, ["license_key", "licenseKey"]);

  if (!gumroadEmail || (!saleId && !subscriptionId)) {
    return json({
      received: true,
      activated: false,
      setupCheck: true,
      message:
        "Truthlabel Gumroad webhook is reachable. Waiting for a real purchase payload before activating access.",
    });
  }

  try {
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const matchedUserIdByPurchase = await findUserIdByPurchaseId(
      serviceClient,
      saleId,
      subscriptionId,
    );

    if (!productMatches(payload) && !matchedUserIdByPurchase) {
      return json({
        received: true,
        activated: false,
        ignored: true,
        message:
          "Gumroad purchase received, but the product did not match Truthlabel settings.",
      });
    }

    const matchedUserId =
      matchedUserIdByPurchase ||
      (gumroadEmail ? await findUserIdByEmail(serviceClient, gumroadEmail) : null);
    const pingReceivedAt = new Date().toISOString();
    const {
      status,
      accessEndsAt,
      eventType,
      gumroadEventAt,
      cancellationDetectedAt,
    } = inferSubscriptionStatus(payload);
    const endingStatus = [
      "active_until_end",
      "payment_failed",
      "expired",
      "refunded",
      "disputed",
      "chargebacked",
    ].includes(status);
    const effectiveCancellationDetectedAt =
      cancellationDetectedAt || (endingStatus ? pingReceivedAt : null);
    const eventConflictKey = subscriptionId
      ? "gumroad_subscription_id"
      : "gumroad_sale_id";

    const { error: eventWriteError } = await serviceClient
      .from("gumroad_purchase_events")
      .upsert(
        {
          gumroad_sale_id: saleId || null,
          gumroad_subscription_id: subscriptionId || null,
          gumroad_email: gumroadEmail,
          gumroad_product_id: productId || null,
          gumroad_permalink: permalink || null,
          status,
          event_type: eventType,
          gumroad_event_at: gumroadEventAt,
          ping_received_at: pingReceivedAt,
          cancellation_detected_at: effectiveCancellationDetectedAt,
          matched_user_id: matchedUserId,
          processed_at: pingReceivedAt,
          raw_payload: payload,
        },
        { onConflict: eventConflictKey },
      );

    if (eventWriteError) {
      throw eventWriteError;
    }

    if (!matchedUserId) {
      return json({
        received: true,
        activated: false,
        message:
          "Purchase received. No matching Truthlabel account was found for this email yet.",
      });
    }

    const licenseKeyHash = licenseKey ? await hashLicenseKey(licenseKey) : null;
    const subscriptionPayload: Record<string, string | null> = {
      user_id: matchedUserId,
      provider: "gumroad",
      gumroad_product_id: productId,
      gumroad_sale_id: saleId || null,
      gumroad_subscription_id: subscriptionId || null,
      gumroad_email: gumroadEmail,
      status,
      access_ends_at: accessEndsAt,
      last_gumroad_event_at: gumroadEventAt,
      last_gumroad_ping_received_at: pingReceivedAt,
      cancellation_detected_at: effectiveCancellationDetectedAt,
      last_verified_at: pingReceivedAt,
    };

    if (licenseKeyHash) {
      subscriptionPayload.license_key_hash = licenseKeyHash;
    }

    if (
      status === "refunded" ||
      status === "disputed" ||
      status === "chargebacked" ||
      status === "expired" ||
      status === "payment_failed"
    ) {
      const { error: writeInactiveError } = await serviceClient
        .from("subscriptions")
        .upsert(subscriptionPayload, { onConflict: "user_id" });

      if (writeInactiveError) {
        throw writeInactiveError;
      }

      return json({
        received: true,
        activated: false,
        status,
        message: "Purchase status received, but access is not active.",
      });
    }

    const { error: writeError } = await serviceClient
      .from("subscriptions")
      .upsert(subscriptionPayload, { onConflict: "user_id" });

    if (writeError) {
      throw writeError;
    }

    return json({
      received: true,
      activated: true,
      status,
      message: "Gumroad purchase received. Truthlabel access is active.",
    });
  } catch (error) {
    return json(
      {
        received: false,
        message: getErrorMessage(
          error,
          "Truthlabel could not process the Gumroad purchase ping.",
        ),
      },
      500,
    );
  }
});
