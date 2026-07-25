import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";

import { runManualScan } from "@/lib/runManualScan";
import {
  __resetScanHistoryClientForTests,
  __setScanHistorySupabaseClientForTests,
  clearScanHistory,
  deleteScanHistoryRecord,
  getScanHistoryRecord,
  listScanHistory,
  saveCompletedScanToHistory,
} from "@/lib/scanHistory/scanHistoryClient";
import { buildScanHistorySnapshot } from "@/lib/scanHistory/scanHistorySnapshot";

type MockRow = Record<string, unknown>;
type MockFilter = {
  kind: "eq" | "gt" | "gte" | "lt";
  column: string;
  value: unknown;
};
type MockOperation = {
  table: string;
  action: "select" | "insert" | "delete";
  selectColumns?: string;
  payload?: unknown;
  filters: MockFilter[];
  search?: string;
  limit?: number;
  order?: {
    column: string;
    ascending: boolean;
  };
};

function makeScanResult(ingredientText = "Rolled oats") {
  return runManualScan({
    productName: "Organic Oats",
    brandName: "Truthlabel Test",
    productCategory: "Fresh / Simple Foods",
    ingredientText,
  });
}

function makeHistoryRow(overrides: Partial<MockRow> = {}): MockRow {
  const scanResult = makeScanResult();
  const scannedAt = String(overrides.scanned_at ?? "2026-07-23T12:00:00.000Z");

  return {
    id: "history-1",
    user_id: "user-1",
    barcode: "1234567890123",
    product_name: "Organic Oats",
    brand: "Truthlabel Test",
    product_image_url: null,
    score: 10,
    overall_severity: "green",
    verdict_key: "clear",
    verdict_label: "No major concerns",
    green_count: 3,
    yellow_count: 0,
    red_count: 0,
    serious_red_count: 0,
    overload_red_count: 0,
    allergen_red_count: 0,
    high_processing_load: false,
    scanned_at: scannedAt,
    created_at: scannedAt,
    result_snapshot: buildScanHistorySnapshot({
      scanResult,
      ingredientText: "Rolled oats",
      scannedAt,
    }),
    ...overrides,
  };
}

function includesText(value: unknown, term: string) {
  return String(value ?? "").toLowerCase().includes(term.toLowerCase());
}

class MockQuery {
  operation: MockOperation;

  constructor(
    private readonly state: {
      rows: MockRow[];
      operations: MockOperation[];
      insertId: string;
      error: Error | null;
    },
    table: string,
  ) {
    this.operation = {
      table,
      action: "select",
      filters: [],
    };
    this.state.operations.push(this.operation);
  }

  select(columns: string) {
    this.operation.selectColumns = columns;
    return this;
  }

  insert(payload: unknown) {
    this.operation.action = "insert";
    this.operation.payload = Array.isArray(payload) ? payload[0] : payload;
    return this;
  }

  delete() {
    this.operation.action = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.operation.filters.push({ kind: "eq", column, value });
    return this;
  }

  gt(column: string, value: unknown) {
    this.operation.filters.push({ kind: "gt", column, value });
    return this;
  }

  gte(column: string, value: unknown) {
    this.operation.filters.push({ kind: "gte", column, value });
    return this;
  }

  lt(column: string, value: unknown) {
    this.operation.filters.push({ kind: "lt", column, value });
    return this;
  }

  order(column: string, options: { ascending: boolean }) {
    this.operation.order = { column, ascending: options.ascending };
    return this;
  }

  limit(value: number) {
    this.operation.limit = value;
    return this;
  }

  or(value: string) {
    this.operation.search = value;
    return this;
  }

  single() {
    return Promise.resolve(
      this.state.error
        ? { data: null, error: this.state.error }
        : { data: { id: this.state.insertId }, error: null },
    );
  }

  maybeSingle() {
    const result = this.resolveSelect();
    return Promise.resolve({
      data: Array.isArray(result.data) ? (result.data[0] ?? null) : result.data,
      error: result.error,
    });
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve(
      this.operation.action === "delete"
        ? { error: this.state.error }
        : this.resolveSelect(),
    ).then(onfulfilled, onrejected);
  }

  private resolveSelect() {
    if (this.state.error) {
      return { data: null, error: this.state.error };
    }

    let rows = [...this.state.rows];

    for (const filter of this.operation.filters) {
      rows = rows.filter((row) => {
        const value = row[filter.column];

        if (filter.kind === "eq") {
          return value === filter.value;
        }

        if (filter.kind === "gt") {
          return Number(value) > Number(filter.value);
        }

        if (filter.kind === "gte") {
          return String(value ?? "") >= String(filter.value ?? "");
        }

        return String(value ?? "") < String(filter.value ?? "");
      });
    }

    if (this.operation.search) {
      const firstPercent = this.operation.search.indexOf("%");
      const secondPercent = this.operation.search.indexOf("%", firstPercent + 1);
      const term =
        firstPercent >= 0 && secondPercent > firstPercent
          ? this.operation.search.slice(firstPercent + 1, secondPercent)
          : "";

      if (term) {
        rows = rows.filter(
          (row) =>
            includesText(row.product_name, term) ||
            includesText(row.brand, term) ||
            includesText(row.barcode, term),
        );
      }
    }

    if (this.operation.order) {
      const { column, ascending } = this.operation.order;
      rows.sort((a, b) => {
        const left = String(a[column] ?? "");
        const right = String(b[column] ?? "");
        return ascending ? left.localeCompare(right) : right.localeCompare(left);
      });
    }

    if (typeof this.operation.limit === "number") {
      rows = rows.slice(0, this.operation.limit);
    }

    return { data: rows, error: null };
  }
}

function installMockSupabase(options: {
  userId?: string | null;
  rows?: MockRow[];
  insertId?: string;
  error?: Error | null;
}) {
  const state = {
    rows: options.rows ?? [],
    operations: [] as MockOperation[],
    insertId: options.insertId ?? "saved-history-id",
    error: options.error ?? null,
  };
  const supabase = {
    auth: {
      getSession: async () => ({
        data: options.userId
          ? {
              session: {
                user: {
                  id: options.userId,
                },
              },
            }
          : {
              session: null,
            },
        error: null,
      }),
    },
    from: (table: string) => new MockQuery(state, table),
  } as unknown as SupabaseClient;

  __setScanHistorySupabaseClientForTests(() => supabase);
  return state;
}

afterEach(() => {
  __resetScanHistoryClientForTests();
});

test("saveCompletedScanToHistory saves a completed private scan snapshot", async () => {
  const state = installMockSupabase({ userId: "user-1" });
  const scanResult = makeScanResult();

  const savedId = await saveCompletedScanToHistory({
    scanResult,
    ingredientText: "Rolled oats",
    scannedAt: "2026-07-23T12:00:00.000Z",
  });

  assert.equal(savedId, "saved-history-id");
  assert.equal(state.operations.length, 1);
  const payload = state.operations[0]?.payload as MockRow;

  assert.equal(payload.user_id, "user-1");
  assert.equal(payload.product_name, "Organic Oats");
  assert.equal(payload.result_snapshot != null, true);
});

test("saveCompletedScanToHistory does not save when no user is authenticated", async () => {
  const state = installMockSupabase({ userId: null });

  const savedId = await saveCompletedScanToHistory({
    scanResult: makeScanResult(),
    ingredientText: "Rolled oats",
  });

  assert.equal(savedId, null);
  assert.equal(state.operations.length, 0);
});

test("saveCompletedScanToHistory skips accidental duplicate saves", async () => {
  const state = installMockSupabase({ userId: "user-1" });
  const scanResult = makeScanResult();

  await saveCompletedScanToHistory({ scanResult, ingredientText: "Rolled oats" });
  await saveCompletedScanToHistory({ scanResult, ingredientText: "Rolled oats" });

  assert.equal(state.operations.length, 1);
});

test("listScanHistory searches, filters, scopes to user, and sorts newest first", async () => {
  installMockSupabase({
    userId: "user-1",
    rows: [
      makeHistoryRow({
        id: "older",
        product_name: "Organic Oats",
        scanned_at: "2026-07-20T12:00:00.000Z",
      }),
      makeHistoryRow({
        id: "newer",
        product_name: "Organic Oats",
        scanned_at: "2026-07-23T12:00:00.000Z",
      }),
      makeHistoryRow({
        id: "red",
        product_name: "Red Soda",
        overall_severity: "red",
      }),
      makeHistoryRow({
        id: "other-user",
        user_id: "user-2",
        product_name: "Organic Oats",
      }),
    ],
  });

  const items = await listScanHistory({
    search: "oats",
    result: "green",
    limit: 5,
  });

  assert.deepEqual(
    items.map((item) => item.id),
    ["newer", "older"],
  );
});

test("getScanHistoryRecord cannot return another user's record", async () => {
  installMockSupabase({
    userId: "user-1",
    rows: [
      makeHistoryRow({
        id: "other-user-record",
        user_id: "user-2",
      }),
    ],
  });

  const record = await getScanHistoryRecord("other-user-record");

  assert.equal(record, null);
});

test("deleteScanHistoryRecord scopes deletion by current user and record id", async () => {
  const state = installMockSupabase({ userId: "user-1" });

  await deleteScanHistoryRecord("history-1");

  assert.deepEqual(state.operations[0]?.filters, [
    { kind: "eq", column: "user_id", value: "user-1" },
    { kind: "eq", column: "id", value: "history-1" },
  ]);
});

test("clearScanHistory scopes clearing by current user", async () => {
  const state = installMockSupabase({ userId: "user-1" });

  await clearScanHistory();

  assert.deepEqual(state.operations[0]?.filters, [
    { kind: "eq", column: "user_id", value: "user-1" },
  ]);
});
