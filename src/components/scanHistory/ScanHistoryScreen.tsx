"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import AppBottomNavigation from "@/components/AppBottomNavigation";
import ScanHistoryScoreRing from "@/components/scanHistory/ScanHistoryScoreRing";
import {
  buildHistoryScoreLabel,
  formatRelativeScanTime,
  groupScanHistoryByDate,
  getSeverityDotClass,
} from "@/lib/scanHistory/scanHistoryDisplay";
import {
  clearScanHistory,
  listScanHistory,
} from "@/lib/scanHistory/scanHistoryClient";
import type {
  ScanHistoryListFilters,
  ScanHistoryListItem,
  ScanHistoryResultFilter,
  ScanHistoryTimeFilter,
} from "@/lib/scanHistory/scanHistoryTypes";

const PAGE_SIZE = 20;

const resultFilterOptions: Array<{
  value: ScanHistoryResultFilter;
  label: string;
}> = [
  { value: "all", label: "All scans" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "red", label: "Red" },
];

const timeFilterOptions: Array<{
  value: ScanHistoryTimeFilter;
  label: string;
}> = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "all_time", label: "All time" },
];

function ProductImage({
  imageUrl,
  productName,
  sizeClass = "h-[58px] w-[58px]",
}: {
  imageUrl: string | null;
  productName: string;
  sizeClass?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#F7F4EC] text-[#8A958E] ${sizeClass}`}
    >
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt={`${productName} package`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <svg
          aria-hidden="true"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 4.5h10l1.2 4.2v10A1.8 1.8 0 0 1 16.4 20H7.6a1.8 1.8 0 0 1-1.8-1.8v-10L7 4.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M6 8.8h12M9 12h6M9 15.5h4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
      )}
    </span>
  );
}

function HistoryRow({ record }: { record: ScanHistoryListItem }) {
  const scoreLabel = buildHistoryScoreLabel(record);

  return (
    <Link
      href={`/app/results?history=${record.id}`}
      className="grid min-h-[86px] grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3 outline-none transition hover:bg-[#F8FAF8] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-inset active:scale-[0.995]"
    >
      <ProductImage
        imageUrl={record.product.imageUrl}
        productName={record.product.name}
      />
      <span className="min-w-0">
        <span className="line-clamp-2 text-[14px] font-extrabold leading-[1.25] text-[#101613]">
          {record.product.name}
        </span>
        <span className="mt-1 block truncate text-[12px] font-semibold text-[#69756F]">
          {record.product.brand || "Unknown brand"}
        </span>
        <span className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[12px] font-semibold text-[#27332E]">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${getSeverityDotClass(
              record.summary.overallSeverity,
            )}`}
          />
          <span className="truncate">{record.summary.verdictLabel}</span>
        </span>
        <span className="mt-1 block truncate text-[11px] text-[#8A958E]">
          {formatRelativeScanTime(record.scannedAt)}
        </span>
      </span>
      <ScanHistoryScoreRing
        score={record.summary.score}
        severity={record.summary.overallSeverity}
        label={scoreLabel}
      />
      <span className="text-[22px] font-light text-[#9AA39D]" aria-hidden="true">
        &gt;
      </span>
    </Link>
  );
}

function HistorySkeletonRows() {
  return (
    <div className="divide-y divide-[#EDF1EE]">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="grid min-h-[86px] animate-pulse grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
        >
          <div className="h-[58px] w-[58px] rounded-[12px] bg-[#EEF2EF]" />
          <div className="space-y-2">
            <div className="h-3.5 w-4/5 rounded-full bg-[#EEF2EF]" />
            <div className="h-3 w-1/2 rounded-full bg-[#EEF2EF]" />
            <div className="h-3 w-2/3 rounded-full bg-[#EEF2EF]" />
          </div>
          <div className="h-[58px] w-[58px] rounded-full bg-[#EEF2EF]" />
        </div>
      ))}
    </div>
  );
}

function EmptyHistory() {
  return (
    <section className="mt-5 rounded-[24px] border border-[#E2E8E4] bg-white px-5 py-8 text-center shadow-[0_4px_18px_rgba(15,40,28,0.04)]">
      <h2 className="text-[19px] font-extrabold text-[#101613]">No scans yet</h2>
      <p className="mt-2 text-[14px] leading-6 text-[#66716B]">
        Products you check will appear here so you can review them later.
      </p>
      <Link
        href="/app/manual"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#0E5A3F] px-5 text-[13px] font-extrabold text-white"
      >
        Scan your first product
      </Link>
    </section>
  );
}

function FilterChip({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-full border px-4 text-[13px] font-bold transition ${
        selected
          ? "border-[#0E5A3F] bg-[#0E5A3F] text-white"
          : "border-[#DFE7E1] bg-white text-[#3E4B45]"
      }`}
    >
      {children}
    </button>
  );
}

export default function ScanHistoryScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<ScanHistoryListItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] =
    useState<ScanHistoryResultFilter>("all");
  const [timeFilter, setTimeFilter] =
    useState<ScanHistoryTimeFilter>("all_time");
  const [allergenWarnings, setAllergenWarnings] = useState(false);
  const [seriousFindings, setSeriousFindings] = useState(false);
  const [highProcessingLoad, setHighProcessingLoad] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeFilters = useMemo<ScanHistoryListFilters>(
    () => ({
      search,
      result: resultFilter,
      time: timeFilter,
      allergenWarnings,
      seriousFindings,
      highProcessingLoad,
      limit: PAGE_SIZE,
    }),
    [
      allergenWarnings,
      highProcessingLoad,
      resultFilter,
      search,
      seriousFindings,
      timeFilter,
    ],
  );

  async function loadHistory(nextFilters = activeFilters) {
    setLoading(true);
    setError("");

    try {
      const nextRecords = await listScanHistory(nextFilters);
      setRecords(nextRecords);
      setHasMore(nextRecords.length === PAGE_SIZE);
    } catch {
      setError("We couldn't load your scan history.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    const lastRecord = records[records.length - 1];

    if (!lastRecord || loadingMore) {
      return;
    }

    setLoadingMore(true);
    setError("");

    try {
      const nextRecords = await listScanHistory({
        ...activeFilters,
        beforeScannedAt: lastRecord.scannedAt,
      });
      setRecords((current) => [...current, ...nextRecords]);
      setHasMore(nextRecords.length === PAGE_SIZE);
    } catch {
      setError("We couldn't load more scan history.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleClearHistory() {
    setError("");
    try {
      await clearScanHistory();
      setRecords([]);
      setHasMore(false);
      setConfirmClearOpen(false);
      setMenuOpen(false);
    } catch {
      setError("We couldn't clear your scan history.");
    }
  }

  function handleResetFilters() {
    setResultFilter("all");
    setTimeFilter("all_time");
    setAllergenWarnings(false);
    setSeriousFindings(false);
    setHighProcessingLoad(false);
  }

  useEffect(() => {
    const loadHandle = window.setTimeout(() => {
      void loadHistory(activeFilters);
    }, 0);

    return () => window.clearTimeout(loadHandle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  const groups = useMemo(() => groupScanHistoryByDate(records), [records]);

  return (
    <main className="min-h-screen bg-white px-0 pb-[calc(88px+env(safe-area-inset-bottom))] pt-[calc(12px+env(safe-area-inset-top))] text-[#101613]">
      <div className="mx-auto w-full max-w-[480px]">
        <header className="px-4">
          <div className="grid min-h-[52px] grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-full text-[14px] font-bold text-[#3E4B45] focus-visible:ring-2 focus-visible:ring-[#0E5A3F]"
              aria-label="Go back"
            >
              Back
            </button>
            <div className="min-w-0 text-center">
              <h1 className="truncate text-[20px] font-black tracking-[-0.02em] text-[#101613]">
                Scan History
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DFE7E1] bg-white text-[#0E5A3F] focus-visible:ring-2 focus-visible:ring-[#0E5A3F]"
              aria-label="Search scan history"
            >
              <span aria-hidden="true">Search</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DFE7E1] bg-white text-[#0E5A3F] focus-visible:ring-2 focus-visible:ring-[#0E5A3F]"
              aria-label="Filter scan history"
            >
              <span aria-hidden="true">Filter</span>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DFE7E1] bg-white text-[18px] font-black text-[#0E5A3F] focus-visible:ring-2 focus-visible:ring-[#0E5A3F]"
                aria-label="Open history menu"
              >
                ...
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-12 z-20 w-56 rounded-[18px] border border-[#E2E8E4] bg-white p-2 shadow-[0_14px_32px_rgba(15,40,28,0.12)]">
                  <button
                    type="button"
                    onClick={() => {
                      setAboutOpen(true);
                      setMenuOpen(false);
                    }}
                    className="w-full rounded-[12px] px-3 py-2.5 text-left text-[13px] font-bold text-[#27332E] hover:bg-[#F6F8F7]"
                  >
                    History information
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClearOpen(true);
                      setMenuOpen(false);
                    }}
                    className="w-full rounded-[12px] px-3 py-2.5 text-left text-[13px] font-bold text-[#B91C1C] hover:bg-[#FEF2F2]"
                  >
                    Clear scan history
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <p className="mt-1 px-1 text-[14px] leading-6 text-[#66716B]">
            Review products you have previously checked.
          </p>

          {searchOpen ? (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                startTransition(() => {
                  void loadHistory(activeFilters);
                });
              }}
            >
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products or brands"
                className="min-h-11 flex-1 rounded-full border border-[#DDE6E0] bg-[#F8FAF8] px-4 text-[14px] outline-none focus:border-[#0E5A3F] focus:ring-2 focus:ring-[#D7F0E4]"
              />
              <button
                type="submit"
                className="min-h-11 rounded-full bg-[#0E5A3F] px-4 text-[13px] font-extrabold text-white disabled:opacity-60"
                disabled={isPending}
              >
                Search
              </button>
            </form>
          ) : null}
        </header>

        {error ? (
          <section className="mx-4 mt-4 rounded-[18px] border border-[#F4C7C9] bg-[#FEF2F2] px-4 py-3">
            <p className="text-[14px] font-bold text-[#9F1D24]">{error}</p>
            <button
              type="button"
              onClick={() => void loadHistory(activeFilters)}
              className="mt-2 text-[13px] font-extrabold text-[#9F1D24] underline"
            >
              Retry
            </button>
          </section>
        ) : null}

        <section className="mt-5">
          {loading ? (
            <HistorySkeletonRows />
          ) : records.length === 0 ? (
            <div className="px-4">
              <EmptyHistory />
            </div>
          ) : (
            <div>
              {groups.map((group) => (
                <section key={group.label} className="mt-5">
                  <h2 className="px-4 text-[11px] font-black uppercase tracking-[0.18em] text-[#8A958E]">
                    {group.label}
                  </h2>
                  <div className="mt-2 divide-y divide-[#EDF1EE] border-y border-[#EDF1EE] bg-white">
                    {group.records.map((record) => (
                      <HistoryRow key={record.id} record={record} />
                    ))}
                  </div>
                </section>
              ))}

              {hasMore ? (
                <div className="px-4 pt-5">
                  <button
                    type="button"
                    onClick={() => void loadMore()}
                    disabled={loadingMore}
                    className="min-h-11 w-full rounded-full border border-[#D7E7DD] bg-[#F6FBF8] px-4 text-[13px] font-extrabold text-[#0E5A3F] disabled:opacity-60"
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>

      {filterOpen ? (
        <div className="fixed inset-0 z-50 bg-[#16221C]/42" role="presentation">
          <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-4 shadow-[0_-18px_44px_rgba(15,40,28,0.18)]">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#D9E3DD]" />
            <div className="mx-auto mt-5 max-w-[440px]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[20px] font-black text-[#101613]">Filters</h2>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="h-10 rounded-full px-3 text-[13px] font-bold text-[#66716B]"
                >
                  Close
                </button>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8A958E]">
                  Result
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {resultFilterOptions.map((option) => (
                    <FilterChip
                      key={option.value}
                      selected={resultFilter === option.value}
                      onClick={() => setResultFilter(option.value)}
                    >
                      {option.label}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8A958E]">
                  Time
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {timeFilterOptions.map((option) => (
                    <FilterChip
                      key={option.value}
                      selected={timeFilter === option.value}
                      onClick={() => setTimeFilter(option.value)}
                    >
                      {option.label}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8A958E]">
                  Other
                </p>
                <div className="mt-2 grid gap-2">
                  {[
                    {
                      checked: allergenWarnings,
                      label: "Personal allergen warnings",
                      onChange: setAllergenWarnings,
                    },
                    {
                      checked: seriousFindings,
                      label: "Serious red findings",
                      onChange: setSeriousFindings,
                    },
                    {
                      checked: highProcessingLoad,
                      label: "High processing load",
                      onChange: setHighProcessingLoad,
                    },
                  ].map((item) => (
                    <label
                      key={item.label}
                      className="flex min-h-11 items-center justify-between gap-4 rounded-[14px] border border-[#E2E8E4] px-3.5 py-2"
                    >
                      <span className="text-[13px] font-bold text-[#27332E]">
                        {item.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(event) => item.onChange(event.target.checked)}
                        className="h-4 w-4 rounded border-[#C8D6CE] text-[#0E5A3F] focus:ring-[#0E5A3F]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="min-h-11 rounded-full border border-[#DDE6E0] text-[13px] font-extrabold text-[#3E4B45]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterOpen(false);
                    void loadHistory(activeFilters);
                  }}
                  className="min-h-11 rounded-full bg-[#0E5A3F] text-[13px] font-extrabold text-white"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {confirmClearOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-[#16221C]/46 p-4 sm:items-center">
          <section className="mx-auto w-full max-w-[390px] rounded-[24px] bg-white px-5 py-5 shadow-[0_22px_58px_rgba(15,40,28,0.22)]">
            <h2 className="text-[20px] font-black text-[#101613]">
              Clear all scan history?
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#66716B]">
              This will permanently remove all saved scans from your account.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="min-h-11 rounded-full border border-[#DDE6E0] text-[13px] font-extrabold text-[#3E4B45]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleClearHistory()}
                className="min-h-11 rounded-full bg-[#B91C1C] text-[13px] font-extrabold text-white"
              >
                Clear history
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {aboutOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-[#16221C]/46 p-4 sm:items-center">
          <section className="mx-auto w-full max-w-[390px] rounded-[24px] bg-white px-5 py-5 shadow-[0_22px_58px_rgba(15,40,28,0.22)]">
            <h2 className="text-[20px] font-black text-[#101613]">
              About scan history
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#66716B]">
              Truthlabel saves completed scan snapshots for your account so you can reopen the exact result later. Old scans are not silently recalculated.
            </p>
            <button
              type="button"
              onClick={() => setAboutOpen(false)}
              className="mt-5 min-h-11 w-full rounded-full bg-[#0E5A3F] text-[13px] font-extrabold text-white"
            >
              Got it
            </button>
          </section>
        </div>
      ) : null}

      <AppBottomNavigation />
    </main>
  );
}
