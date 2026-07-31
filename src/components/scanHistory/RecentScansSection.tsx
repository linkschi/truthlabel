"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ScanHistoryScoreRing from "@/components/scanHistory/ScanHistoryScoreRing";
import {
  buildHistoryScoreLabel,
  formatRelativeScanTime,
  getSeverityDotClass,
} from "@/lib/scanHistory/scanHistoryDisplay";
import { listScanHistory } from "@/lib/scanHistory/scanHistoryClient";
import type { ScanHistoryListItem } from "@/lib/scanHistory/scanHistoryTypes";

function MiniProductImage({
  imageUrl,
  productName,
}: {
  imageUrl: string | null;
  productName: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-[#F7F4EC] text-[#8A958E]">
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
          className="h-6 w-6"
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

function RecentScanSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-[150px] w-[205px] shrink-0 animate-pulse rounded-[18px] border border-[#E2E8E4] bg-white p-3.5"
        >
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-[13px] bg-[#EEF2EF]" />
            <div className="h-[46px] w-[46px] rounded-full bg-[#EEF2EF]" />
          </div>
          <div className="mt-5 h-3.5 w-4/5 rounded-full bg-[#EEF2EF]" />
          <div className="mt-2 h-3 w-1/2 rounded-full bg-[#EEF2EF]" />
          <div className="mt-4 h-3 w-2/3 rounded-full bg-[#EEF2EF]" />
        </div>
      ))}
    </div>
  );
}

function RecentScanCard({ record }: { record: ScanHistoryListItem }) {
  return (
    <Link
      href={`/app/results?history=${record.id}`}
      className="snap-start rounded-[18px] border border-[#E2E8E4] bg-white p-3.5 shadow-[0_4px_16px_rgba(15,40,28,0.045)] outline-none transition hover:border-[#C7DCD0] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99]"
      style={{ minHeight: 150, width: 205 }}
    >
      <span className="flex items-start justify-between gap-3">
        <MiniProductImage
          imageUrl={record.product.imageUrl}
          productName={record.product.name}
        />
        <ScanHistoryScoreRing
          score={record.summary.score}
          severity={record.summary.overallSeverity}
          size={46}
          stroke={4}
          label={buildHistoryScoreLabel(record)}
        />
      </span>
      <span className="mt-4 block line-clamp-2 text-[13.5px] font-extrabold leading-[1.24] text-[#101613]">
        {record.product.name}
      </span>
      <span className="mt-1 block truncate text-[12px] font-semibold text-[#69756F]">
        {record.product.brand || formatRelativeScanTime(record.scannedAt)}
      </span>
      <span className="mt-3 flex items-center gap-1.5 text-[11.5px] font-bold text-[#27332E]">
        <span
          className={`h-2 w-2 rounded-full ${getSeverityDotClass(
            record.summary.overallSeverity,
          )}`}
        />
        <span className="truncate">{record.summary.verdictLabel}</span>
      </span>
      {record.product.brand ? (
        <span className="mt-1 block truncate text-[11px] text-[#8A958E]">
          {formatRelativeScanTime(record.scannedAt)}
        </span>
      ) : null}
    </Link>
  );
}

export default function RecentScansSection({
  onScanProduct,
}: {
  onScanProduct: () => void;
}) {
  const [records, setRecords] = useState<ScanHistoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  async function loadRecentScans() {
    setLoading(true);
    setError("");

    try {
      setRecords(await listScanHistory({ limit: 5 }));
    } catch {
      setError("Recent scans are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadHandle = window.setTimeout(() => {
      void loadRecentScans();
    }, 0);

    return () => window.clearTimeout(loadHandle);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const revealHandle = window.setTimeout(() => {
        setIsVisible(true);
      }, 0);

      return () => window.clearTimeout(revealHandle);
    }

    function revealSoon() {
      window.setTimeout(() => {
        setIsVisible(true);
      }, 0);
    }

    if (!("IntersectionObserver" in window)) {
      revealSoon();
      return;
    }

    const section = sectionRef.current;

    if (!section) {
      revealSoon();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          revealSoon();
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`mt-6 transition duration-[400ms] ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
      aria-labelledby="recent-scans-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="recent-scans-title" className="text-[18px] font-extrabold text-[#101613]">
          Recent scans
        </h2>
        <Link
          href="/app/history"
          className="rounded-full px-2 py-1 text-[12px] font-extrabold text-[#0E5A3F] focus-visible:ring-2 focus-visible:ring-[#0E5A3F]"
        >
          View all
        </Link>
      </div>

      <div className="-mx-[18px] mt-3 overflow-hidden sm:-mx-5">
        {loading ? (
          <div className="px-[18px] sm:px-5">
            <RecentScanSkeleton />
          </div>
        ) : error ? (
          <div className="mx-[18px] rounded-[18px] border border-[#F4C7C9] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(159,29,36,0.06)] sm:mx-5">
            <p className="text-[13px] font-bold text-[#9F1D24]">{error}</p>
            <button
              type="button"
              onClick={() => void loadRecentScans()}
              className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full bg-[#9F1D24] px-4 text-[12px] font-extrabold text-white outline-none transition focus-visible:ring-2 focus-visible:ring-[#9F1D24] focus-visible:ring-offset-2 active:scale-[0.99]"
            >
              Retry
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="mx-[18px] rounded-[18px] border border-[#DCE7E1] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,40,28,0.045)] sm:mx-5">
            <h3 className="text-[14px] font-extrabold text-[#101613]">
              No recent scans yet
            </h3>
            <p className="mt-1.5 text-[13px] leading-5 text-[#66716B]">
              Your latest products will appear here.
            </p>
            <Link
              href="/app/manual"
              onClick={onScanProduct}
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-[#0E5A3F] px-4 text-[12px] font-extrabold text-white outline-none transition focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99]"
            >
              Scan your first product
            </Link>
          </div>
        ) : (
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[18px] pb-2 sm:px-5">
            {records.map((record) => (
              <RecentScanCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
