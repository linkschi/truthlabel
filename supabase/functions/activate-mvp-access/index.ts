// Supabase Edge Function: temporary MVP early-access activation.
//
// This is intentionally simple for launch testing:
// - Requires a signed-in Truthlabel user.
// - Requires TRUTHLABEL_MVP_ACCESS_CODE.
// - Grants an active access row so the existing app access check works.
//
// Secrets required in Supabase:
// - SUPABASE_SERVICE_ROLE_KEY
// - TRUTHLABEL_MVP_ACCESS_CODE
// Optional:
// - GUMROAD_PRODUCT_ID or GUMROAD_PRODUCT_PERMALINK
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function cleanCode(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
  const mvpAccessCode = env("TRUTHLABEL_MVP_ACCESS_CODE");
  const authHeader = request.headers.get("Authorization") ?? "";

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !mvpAccessCode) {
    return json(
      {
        activated: false,
        message: "MVP access activation is not configured yet.",
      },
      500,
    );
  }

  if (!authHeader) {
    return json(
      {
        activated: false,
        message: "Sign in before activating access.",
      },
      401,
    );
  }

  let code = "";

  try {
    const body = await request.json();
    code = cleanCode(body?.code);
  } catch {
    return json(
      {
        activated: false,
        message: "Activation request was not valid JSON.",
      },
      400,
    );
  }

  if (!code || code !== mvpAccessCode) {
    return json(
      {
        activated: false,
        message: "This activation link is not valid.",
      },
      403,
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

    const { data: existingSubscription, error: readError } = await serviceClient
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (readError) {
      throw readError;
    }

    if (existingSubscription?.status === "active") {
      return json({
        activated: true,
        status: "active",
        message: "Truthlabel access is already active.",
      });
    }

    const productId =
      env("GUMROAD_PRODUCT_ID") ||
      env("GUMROAD_PRODUCT_PERMALINK") ||
      "truthlabel-mvp-early-access";

    const { error: writeError } = await serviceClient
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          provider: "gumroad",
          gumroad_product_id: productId,
          gumroad_email: user.email?.trim().toLowerCase() ?? null,
          license_key_hash: `mvp_access_${user.id}`,
          status: "active",
          access_ends_at: null,
          last_verified_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (writeError) {
      throw writeError;
    }

    return json({
      activated: true,
      status: "active",
      accessEndsAt: null,
      message: "Truthlabel MVP access is active on this account.",
    });
  } catch (error) {
    return json(
      {
        activated: false,
        message:
          error instanceof Error
            ? error.message
            : "Truthlabel could not activate MVP access.",
      },
      500,
    );
  }
});
