import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { isTruthlabelAdminEmail } from "@/lib/auth/adminAccess";
import { publicAppConfig } from "@/lib/appConfig";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

function isPlaceholder(value: string) {
  return !value || value.includes("YOUR-") || value.includes("YOUR_");
}

function getSupabaseServerConfigStatus() {
  return {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
    isConfigured:
      !isPlaceholder(supabaseUrl) && !isPlaceholder(supabasePublishableKey),
  };
}

export async function getServerSupabaseUser(): Promise<User | null> {
  const config = getSupabaseServerConfigStatus();

  if (!config.isConfigured) {
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storageKey: "truthlabel.auth.session",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
    },
  });
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user ?? null;
}

export async function getAuthorizedTruthlabelAdminEmailFromCookies() {
  if (publicAppConfig.flags.enableLocalDevBypass) {
    return "local-dev@truthlabel.test";
  }

  const user = await getServerSupabaseUser();

  if (!isTruthlabelAdminEmail(user?.email)) {
    return null;
  }

  return user?.email?.trim().toLowerCase() ?? null;
}
