import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

function getSupabasePublicKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    ""
  );
}

function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}

export async function POST(request: Request) {
  const supabaseUrl = getSupabaseUrl();
  const publicKey = getSupabasePublicKey();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !publicKey || !serviceRoleKey) {
    return Response.json(
      {
        ok: false,
        message: "Setup handoff is not configured.",
      },
      { status: 503 },
    );
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return Response.json(
      {
        ok: false,
        message: "Sign in before creating a setup link.",
      },
      { status: 401 },
    );
  }

  const authClient = createClient(supabaseUrl, publicKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: userData, error: userError } =
    await authClient.auth.getUser(accessToken);
  const email = userData.user?.email?.trim();

  if (userError || !email) {
    return Response.json(
      {
        ok: false,
        message: "Your setup session could not be verified.",
      },
      { status: 401 },
    );
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const redirectTo = `${new URL(request.url).origin}/continue-setup`;
  const { data, error } = await serviceClient.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo,
    },
  });
  const tokenHash = data?.properties?.hashed_token;

  if (error || !tokenHash) {
    console.error("TruthLabel setup handoff link generation failed", {
      message: error?.message ?? "Missing token hash",
    });

    return Response.json(
      {
        ok: false,
        message: "TruthLabel could not create a setup link.",
      },
      { status: 502 },
    );
  }

  const setupUrl = new URL("/continue-setup", redirectTo);
  setupUrl.hash = new URLSearchParams({
    token_hash: tokenHash,
    type: "email",
    next: "/app/onboarding",
  }).toString();

  return Response.json({
    ok: true,
    setupUrl: setupUrl.toString(),
  });
}
