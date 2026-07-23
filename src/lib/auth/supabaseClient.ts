"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

function isPlaceholder(value: string) {
  return !value || value.includes("YOUR-") || value.includes("YOUR_");
}

export function getSupabaseConfigStatus() {
  return {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
    isConfigured:
      !isPlaceholder(supabaseUrl) && !isPlaceholder(supabasePublishableKey),
  };
}

export function getSupabaseBrowserClient() {
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    return null;
  }

  browserClient ??= createBrowserClient(config.url, config.publishableKey);
  return browserClient;
}
