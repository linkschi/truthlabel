"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/auth/supabaseClient";
import {
  buildScanHistorySaveSignature,
  buildScanHistorySnapshot,
  summarizeScanHistoryResult,
} from "@/lib/scanHistory/scanHistorySnapshot";
import type {
  ScanHistoryListFilters,
  ScanHistoryListItem,
  ScanHistoryRecord,
  ScanHistoryResultSnapshot,
  ScanHistorySaveInput,
  ScanHistorySeverity,
} from "@/lib/scanHistory/scanHistoryTypes";

const SCAN_HISTORY_SUMMARY_SELECT = [
  "id",
  "user_id",
  "barcode",
  "product_name",
  "brand",
  "product_image_url",
  "score",
  "overall_severity",
  "verdict_key",
  "verdict_label",
  "green_count",
  "yellow_count",
  "red_count",
  "serious_red_count",
  "overload_red_count",
  "allergen_red_count",
  "scanned_at",
  "created_at",
].join(",");

const SCAN_HISTORY_RECORD_SELECT = `${SCAN_HISTORY_SUMMARY_SELECT},result_snapshot`;
const DUPLICATE_WINDOW_MS = 8000;

let lastSave:
  | {
      signature: string;
      savedAtMs: number;
    }
  | null = null;

let supabaseClientOverride:
  | {
      getClient: () => SupabaseClient | null;
    }
  | null = null;

type ScanHistorySummaryRow = {
  id: string;
  user_id: string;
  barcode: string | null;
  product_name: string | null;
  brand: string | null;
  product_image_url: string | null;
  score: number | null;
  overall_severity: ScanHistorySeverity;
  verdict_key: string;
  verdict_label: string;
  green_count: number;
  yellow_count: number;
  red_count: number;
  serious_red_count: number;
  overload_red_count: number;
  allergen_red_count: number;
  scanned_at: string;
  created_at: string;
};

type ScanHistoryRecordRow = ScanHistorySummaryRow & {
  result_snapshot: ScanHistoryResultSnapshot;
};

function assertSupabaseConfigured() {
  const supabase =
    supabaseClientOverride?.getClient() ?? getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured for scan history.");
  }

  return supabase;
}

export function __setScanHistorySupabaseClientForTests(
  getClient: (() => SupabaseClient | null) | null,
) {
  supabaseClientOverride = getClient ? { getClient } : null;
}

export function __resetScanHistoryClientForTests() {
  supabaseClientOverride = null;
  lastSave = null;
}

async function getCurrentUserId(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session?.user.id ?? null;
}

function toHistoryListItem(row: ScanHistorySummaryRow): ScanHistoryListItem {
  return {
    id: row.id,
    userId: row.user_id,
    barcode: row.barcode,
    scannedAt: row.scanned_at,
    product: {
      name: row.product_name || "Unknown product",
      brand: row.brand,
      quantity: null,
      imageUrl: row.product_image_url,
      category: null,
    },
    summary: {
      score: row.score,
      overallSeverity: row.overall_severity,
      verdictKey: row.verdict_key,
      verdictLabel: row.verdict_label,
      greenCount: row.green_count,
      yellowCount: row.yellow_count,
      redCount: row.red_count,
      seriousRedCount: row.serious_red_count,
      overloadRedCount: row.overload_red_count,
      allergenRedCount: row.allergen_red_count,
    },
    createdAt: row.created_at,
  };
}

function toHistoryRecord(row: ScanHistoryRecordRow): ScanHistoryRecord {
  return {
    ...toHistoryListItem(row),
    resultSnapshot: row.result_snapshot,
  };
}

function sanitizeSearchTerm(value: string) {
  return value.trim().replace(/[%,()]/g, " ").replace(/\s+/g, " ");
}

function getTimeFilterStart(value: ScanHistoryListFilters["time"]) {
  const now = new Date();

  if (value === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }

  if (value === "last_7_days") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  if (value === "last_30_days") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  return null;
}

function shouldSkipDuplicateSave(signature: string) {
  const now = Date.now();

  if (
    lastSave &&
    lastSave.signature === signature &&
    now - lastSave.savedAtMs < DUPLICATE_WINDOW_MS
  ) {
    return true;
  }

  lastSave = { signature, savedAtMs: now };
  return false;
}

export async function saveCompletedScanToHistory(input: ScanHistorySaveInput) {
  const supabase = assertSupabaseConfigured();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return null;
  }

  const signature = buildScanHistorySaveSignature(input);

  if (shouldSkipDuplicateSave(signature)) {
    return null;
  }

  const scanResult = input.scanResult;
  const product = scanResult.productHero;
  const summary = summarizeScanHistoryResult(scanResult);
  const scannedAt = input.scannedAt ?? new Date().toISOString();
  const snapshot = buildScanHistorySnapshot({
    ...input,
    scannedAt,
  });

  const { data, error } = await supabase
    .from("scan_history")
    .insert({
      user_id: userId,
      barcode: product.barcode || null,
      product_name: product.productName || "Unknown product",
      brand:
        product.brandName && product.brandName !== "Unknown brand"
          ? product.brandName
          : null,
      product_image_url: product.imageUrl || null,
      score: scanResult.ingredientLoad.score,
      overall_severity: scanResult.finalVerdict.verdictTone,
      verdict_key: scanResult.finalVerdict.verdictCode,
      verdict_label: scanResult.finalVerdict.verdictLabel,
      green_count: summary.greenCount,
      yellow_count: summary.yellowCount,
      red_count: summary.redCount,
      serious_red_count: summary.seriousRedCount,
      overload_red_count: summary.overloadRedCount,
      allergen_red_count: summary.allergenRedCount,
      high_processing_load: summary.highProcessingLoad,
      scanned_at: scannedAt,
      result_snapshot: snapshot,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data?.id as string | null;
}

export async function listScanHistory(filters: ScanHistoryListFilters = {}) {
  const supabase = assertSupabaseConfigured();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return [];
  }

  let query = supabase
    .from("scan_history")
    .select(SCAN_HISTORY_SUMMARY_SELECT)
    .eq("user_id", userId)
    .order("scanned_at", { ascending: false })
    .limit(filters.limit ?? 20);

  if (filters.beforeScannedAt) {
    query = query.lt("scanned_at", filters.beforeScannedAt);
  }

  if (filters.result && filters.result !== "all") {
    query = query.eq("overall_severity", filters.result);
  }

  const timeStart = getTimeFilterStart(filters.time);

  if (timeStart) {
    query = query.gte("scanned_at", timeStart);
  }

  if (filters.allergenWarnings) {
    query = query.gt("allergen_red_count", 0);
  }

  if (filters.seriousFindings) {
    query = query.gt("serious_red_count", 0);
  }

  if (filters.highProcessingLoad) {
    query = query.eq("high_processing_load", true);
  }

  const searchTerm = sanitizeSearchTerm(filters.search ?? "");

  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    query = query.or(
      `product_name.ilike.${pattern},brand.ilike.${pattern},barcode.ilike.${pattern}`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as ScanHistorySummaryRow[]).map(
    toHistoryListItem,
  );
}

export async function getScanHistoryRecord(id: string) {
  const supabase = assertSupabaseConfigured();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("scan_history")
    .select(SCAN_HISTORY_RECORD_SELECT)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toHistoryRecord(data as unknown as ScanHistoryRecordRow) : null;
}

export async function deleteScanHistoryRecord(id: string) {
  const supabase = assertSupabaseConfigured();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return;
  }

  const { error } = await supabase
    .from("scan_history")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function clearScanHistory() {
  const supabase = assertSupabaseConfigured();
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return;
  }

  const { error } = await supabase
    .from("scan_history")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
