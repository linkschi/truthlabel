"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function readEnvValue(name: string) {
  return process.env[name]?.trim() ?? "";
}

function isPlaceholder(value: string) {
  return !value || value.includes("YOUR-") || value.includes("YOUR_");
}

export function getSupabaseConfigStatus() {
  const url = readEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = readEnvValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  return {
    url,
    publishableKey,
    isConfigured: !isPlaceholder(url) && !isPlaceholder(publishableKey),
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
