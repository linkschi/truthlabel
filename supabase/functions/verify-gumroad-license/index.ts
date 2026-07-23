// Supabase Edge Function: verifies a Gumroad license and activates paid access.
// Secrets required in Supabase:
// - GUMROAD_PRODUCT_ID, or GUMROAD_PRODUCT_PERMALINK for older/custom products
// - LICENSE_HASH_SECRET
// - SUPABASE_SERVICE_ROLE_KEY
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type GumroadVerifyResponse = {
  success?: boolean;
  message?: string;
  uses?: number;
  purchase?: {
    id?: string;
    email?: string;
    product_id?: string;
    product_name?: string;
    permalink?: string;
    custom_permalink?: string;
    subscription_id?: string;
    refunded?: boolean;
    disputed?: boolean;
    dispute_won?: boolean;
    chargebacked?: boolean;
    subscription_cancelled_at?: string | null;
    subscription_ended_at?: string | null;
    subscription_failed_at?: string | null;
    ended_at?: string | null;
    variants?: string;
    test?: boolean;
  };
};

type SubscriptionStatus =
  | "inactive"
  | "active"
  | "active_until_end"
  | "payment_failed"
  | "expired"
  | "refunded"
  | "disputed"
  | "chargebacked";

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

function cleanLicenseKey(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

async function hashLicenseKey(licenseKey: string) {
  const secret = env("LICENSE_HASH_SECRET");

  if (!secret || secret.includes("replace-with")) {
    throw new Error("LICENSE_HASH_SECRET is not configured.");
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

function inferSubscriptionStatus(
  purchase: NonNullable<GumroadVerifyResponse["purchase"]>,
): {
  status: SubscriptionStatus;
  accessEndsAt: string | null;
} {
  if (purchase.chargebacked) {
    return { status: "chargebacked", accessEndsAt: null };
  }

  if (purchase.refunded) {
    return { status: "refunded", accessEndsAt: null };
  }

  if (purchase.disputed && !purchase.dispute_won) {
    return { status: "disputed", accessEndsAt: null };
  }

  const endedAt = purchase.subscription_ended_at || purchase.ended_at || null;

  if (endedAt) {
    return { status: "expired", accessEndsAt: endedAt };
  }

  if (purchase.subscription_failed_at) {
    return { status: "payment_failed", accessEndsAt: null };
  }

  if (purchase.subscription_cancelled_at) {
    return {
      status: "active_until_end",
      accessEndsAt: purchase.subscription_ended_at || null,
    };
  }

  return { status: "active", accessEndsAt: null };
}

async function verifyGumroadLicense(licenseKey: string) {
  const productId = env("GUMROAD_PRODUCT_ID");
  const productPermalink = env("GUMROAD_PRODUCT_PERMALINK");

  if (!productId && !productPermalink) {
    throw new Error("Gumroad product identifier is not configured.");
  }

  const body = new URLSearchParams();
  body.set("license_key", licenseKey);
  body.set("increment_uses_count", "false");

  if (productId) {
    body.set("product_id", productId);
  } else {
    body.set("product_permalink", productPermalink);
  }

  const response = await fetch("https://api.gumroad.com/v2/licenses/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  let payload: GumroadVerifyResponse;

  try {
    payload = (await response.json()) as GumroadVerifyResponse;
  } catch {
    throw new Error("Gumroad returned an unreadable response.");
  }

  if (!response.ok) {
    throw new Error(payload.message || "Gumroad license verification failed.");
  }

  return payload;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ activated: false, message: "Method not allowed." }, 405);
  }

  const supabaseUrl = env("SUPABASE_URL");
  const supabaseAnonKey = env("SUPABASE_ANON_KEY");
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = request.headers.get("Authorization") ?? "";

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return json(
      {
        activated: false,
        message: "License activation is not configured yet.",
      },
      500,
    );
  }

  if (!authHeader) {
    return json(
      {
        activated: false,
        message: "Sign in before activating a Gumroad license.",
      },
      401,
    );
  }

  let licenseKey = "";

  try {
    const body = await request.json();
    licenseKey = cleanLicenseKey(body?.licenseKey);
  } catch {
    return json(
      {
        activated: false,
        message: "License activation request was not valid JSON.",
      },
      400,
    );
  }

  if (licenseKey.length < 8) {
    return json(
      {
        activated: false,
        message: "Enter the Gumroad license key from your purchase email.",
      },
      400,
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
          activated: false,
          message: "Your sign-in session expired. Sign in and try again.",
        },
        401,
      );
    }

    const gumroad = await verifyGumroadLicense(licenseKey);

    if (!gumroad.success || !gumroad.purchase) {
      return json(
        {
          activated: false,
          message:
            gumroad.message ||
            "Gumroad could not verify this license key for Truthlabel.",
        },
        400,
      );
    }

    const purchaseEmail = normalizeEmail(gumroad.purchase.email);
    const userEmail = normalizeEmail(user.email);

    if (purchaseEmail && userEmail && purchaseEmail !== userEmail) {
      return json(
        {
          activated: false,
          message:
            "This Gumroad license belongs to a different email. Sign in with the purchase email or contact support.",
        },
        403,
      );
    }

    const licenseKeyHash = await hashLicenseKey(licenseKey);
    const { status, accessEndsAt } = inferSubscriptionStatus(gumroad.purchase);

    if (
      status === "refunded" ||
      status === "disputed" ||
      status === "chargebacked" ||
      status === "expired" ||
      status === "payment_failed"
    ) {
      return json(
        {
          activated: false,
          status,
          message:
            "This Gumroad license was found, but it is not currently eligible for paid Truthlabel access.",
        },
        402,
      );
    }

    const { data: existingClaim, error: claimReadError } = await serviceClient
      .from("subscriptions")
      .select("user_id")
      .eq("license_key_hash", licenseKeyHash)
      .maybeSingle();

    if (claimReadError) {
      throw claimReadError;
    }

    if (existingClaim && existingClaim.user_id !== user.id) {
      return json(
        {
          activated: false,
          message:
            "This Gumroad license has already been linked to another Truthlabel account.",
        },
        409,
      );
    }

    const productId =
      gumroad.purchase.product_id ||
      env("GUMROAD_PRODUCT_ID") ||
      gumroad.purchase.custom_permalink ||
      gumroad.purchase.permalink ||
      env("GUMROAD_PRODUCT_PERMALINK");

    const { error: writeError } = await serviceClient
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          provider: "gumroad",
          gumroad_product_id: productId,
          gumroad_sale_id: gumroad.purchase.id ?? null,
          gumroad_subscription_id: gumroad.purchase.subscription_id ?? null,
          gumroad_email: purchaseEmail || userEmail || null,
          license_key_hash: licenseKeyHash,
          status,
          access_ends_at: accessEndsAt,
          last_verified_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (writeError) {
      throw writeError;
    }

    return json({
      activated: true,
      status,
      message: "Paid Truthlabel access is active on this account.",
    });
  } catch (error) {
    return json(
      {
        activated: false,
        message:
          error instanceof Error
            ? error.message
            : "Truthlabel could not verify this Gumroad license.",
      },
      500,
    );
  }
});
