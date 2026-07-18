"use client";

import Link from "next/link";
import {
  type ReactNode,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import InfoModal from "@/components/InfoModal";
import IssueBadge from "@/components/IssueBadge";
import TestingFeedbackPanel from "@/components/TestingFeedbackPanel";
import type {
  ScanResult,
  ScanResultBrandTrustSafety,
  ScanResultDeepExposureCheck,
  ScanResultIngredientItem,
  ScanResultOverviewRow,
} from "@/lib/buildScanResult";
import { loadLatestBarcodeScan } from "@/lib/barcodeScanStorage";
import { getDemoScanResult } from "@/lib/getDemoScanResult";
import { loadLatestManualScan } from "@/lib/manualScanStorage";
import {
  getSavedAllergyProfile,
  useUserSettings,
} from "@/lib/userSettings/userSettingsStorage";
import {
  getVisibleDeepExposureChecks,
  shouldShowBrandTrustSafety,
} from "@/lib/userSettings/scanDisplayPreferences";

type RowTone = "green" | "yellow" | "red" | "neutral";

type CategoryIconName =
  | "additive"
  | "allergy"
  | "ban"
  | "barcode"
  | "beaker"
  | "candy"
  | "colour"
  | "drop"
  | "eye"
  | "factory"
  | "flame"
  | "leaf"
  | "list"
  | "meat"
  | "metal"
  | "micro"
  | "oil"
  | "question"
  | "scale"
  | "shield"
  | "spark"
  | "texture";

type BadgeDescriptor = {
  color: RowTone;
  count?: number;
  label?: string;
};

type ResultDetail = {
  title: string;
  tone: "green" | "yellow" | "red";
  status: string;
  sections: Array<{
    label: string;
    text: string;
  }>;
};

type ScanSourceLabel = ScanResult["productHero"]["scanSource"];

type IngredientGroupCard = {
  id: string;
  label: string;
  tone: RowTone;
  items: ScanResultIngredientItem[];
};

const pillToneClasses: Record<RowTone, string> = {
  green:
    "border border-[var(--green-border)] bg-[var(--green-bg)] text-[var(--green-dark)]",
  yellow:
    "border border-[var(--amber-border)] bg-[var(--amber-bg)] text-[var(--amber-dark)]",
  red:
    "border border-[var(--red-border)] bg-[var(--red-bg)] text-[var(--red-dark)]",
  neutral:
    "border border-[var(--border-soft)] bg-[var(--neutral-bg)] text-[var(--neutral-text)]",
};

const iconWrapClasses: Record<RowTone, string> = {
  green: "border border-[var(--green-border)] bg-[var(--green-bg)]",
  yellow: "border border-[var(--amber-border)] bg-[var(--amber-bg)]",
  red: "border border-[var(--red-border)] bg-[var(--red-bg)]",
  neutral: "border border-[var(--border-soft)] bg-[var(--neutral-bg)]",
};

const categoryIconColorClasses: Record<RowTone, string> = {
  green: "text-[var(--green-main)]",
  yellow: "text-[var(--amber-main)]",
  red: "text-[var(--red-main)]",
  neutral: "text-[var(--neutral-text)]",
};

const groupSurfaceClasses: Record<RowTone, string> = {
  green: "border-[var(--green-border)] bg-[var(--green-bg)]",
  yellow: "border-[var(--amber-border)] bg-[var(--amber-bg)]",
  red: "border-[var(--red-border)] bg-[var(--red-bg)]",
  neutral: "border-[var(--border-soft)] bg-[var(--bg-soft)]",
};

const groupTitleClasses: Record<RowTone, string> = {
  green: "text-[var(--green-main)]",
  yellow: "text-[var(--amber-main)]",
  red: "text-[var(--red-main)]",
  neutral: "text-[var(--text-main)]",
};

const chipToneClasses: Record<RowTone, string> = {
  green:
    "border-[var(--green-border)] bg-[var(--bg-surface)] text-[var(--green-dark)]",
  yellow:
    "border-[var(--amber-border)] bg-[var(--bg-surface)] text-[var(--amber-dark)]",
  red: "border-[var(--red-border)] bg-[var(--bg-surface)] text-[var(--red-dark)]",
  neutral:
    "border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--text-secondary)]",
};

const deepDetailCardClasses: Record<RowTone, string> = {
  green:
    "border-[var(--green-border)] bg-[linear-gradient(180deg,var(--bg-surface)_0%,var(--green-bg)_100%)]",
  yellow:
    "border-[var(--amber-border)] bg-[linear-gradient(180deg,var(--bg-surface)_0%,var(--amber-bg)_100%)]",
  red:
    "border-[var(--red-border)] bg-[linear-gradient(180deg,var(--bg-surface)_0%,var(--red-bg)_100%)]",
  neutral:
    "border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--bg-surface)_0%,var(--bg-soft)_100%)]",
};

const deepDetailAccentClasses: Record<RowTone, string> = {
  green: "bg-[var(--green-main)]",
  yellow: "bg-[var(--amber-main)]",
  red: "bg-[var(--red-main)]",
  neutral: "bg-[var(--neutral-text)]",
};

const requiredOverviewCategoryIds = new Set([
  "total_ingredients",
  "ultra_processed_indicators",
]);

const scoreLabelClasses: Record<Exclude<RowTone, "neutral">, string> = {
  green: "text-[var(--green-main)]",
  yellow: "text-[var(--amber-main)]",
  red: "text-[var(--red-main)]",
};

const brandTrustCardClasses: Record<RowTone, string> = {
  green:
    "border-[var(--green-main)] bg-[linear-gradient(180deg,var(--green-main)_0%,var(--green-dark)_100%)] shadow-[0_14px_30px_rgba(21,128,61,0.16)] text-white",
  yellow:
    "border-[var(--amber-main)] bg-[linear-gradient(180deg,var(--amber-main)_0%,var(--amber-dark)_100%)] shadow-[0_14px_30px_rgba(180,83,9,0.16)] text-white",
  red:
    "border-[var(--red-main)] bg-[linear-gradient(180deg,var(--red-main)_0%,var(--red-dark)_100%)] shadow-[0_14px_30px_rgba(200,30,30,0.16)] text-white",
  neutral:
    "border-[var(--border-soft)] bg-[var(--bg-soft)] shadow-[0_10px_24px_rgba(23,20,18,0.05)] text-[var(--text-main)]",
};

const brandTrustIconClasses: Record<RowTone, string> = {
  green: "bg-white/18 text-white",
  yellow: "bg-white/18 text-white",
  red: "bg-white/18 text-white",
  neutral: "bg-[var(--bg-surface)] text-[var(--text-secondary)]",
};

const brandTrustSubtitleClasses: Record<RowTone, string> = {
  green: "text-[var(--green-bg)]",
  yellow: "text-[var(--amber-bg)]",
  red: "text-[var(--red-bg)]",
  neutral: "text-[var(--text-secondary)]",
};

const brandTrustChevronClasses: Record<RowTone, string> = {
  green: "text-[var(--green-bg)]",
  yellow: "text-[var(--amber-bg)]",
  red: "text-[var(--red-bg)]",
  neutral: "text-[var(--text-secondary)]",
};

const finalVerdictCardClasses: Record<Exclude<RowTone, "neutral">, string> = {
  green: "border-[var(--green-border)] bg-[var(--green-bg)]",
  yellow: "border-[var(--amber-border)] bg-[var(--amber-bg)]",
  red: "border-[var(--red-border)] bg-[var(--red-bg)]",
};

function normalizeClearLabel(value: string) {
  if (value.trim().toLowerCase() === "none found") {
    return "No";
  }

  return value;
}

function toRowTone(severity: "green" | "yellow" | "red" | null | undefined): RowTone {
  return severity ?? "neutral";
}

function toModalTone(severity: "green" | "yellow" | "red" | null | undefined) {
  return severity ?? "yellow";
}

function buildIssueBadges({
  redCount,
  yellowCount,
  clearLabel,
  value,
  tone,
  badgeTone,
}: {
  redCount?: number;
  yellowCount?: number;
  clearLabel?: string;
  value?: string;
  tone: RowTone;
  badgeTone?: RowTone;
}): BadgeDescriptor[] {
  const badges: BadgeDescriptor[] = [];

  if ((redCount ?? 0) > 0) {
    badges.push({ color: "red", count: redCount });
  }

  if ((yellowCount ?? 0) > 0) {
    badges.push({ color: "yellow", count: yellowCount });
  }

  if (badges.length > 0) {
    return badges;
  }

  if (clearLabel) {
    return [{ color: tone === "neutral" ? "neutral" : "green", label: clearLabel }];
  }

  if (!value) {
    return [];
  }

  const normalizedValue = value.trim().toLowerCase();
  if (["no", "clear", "none", "0", "none found"].includes(normalizedValue)) {
    return [{ color: "green", label: normalizeClearLabel(value) }];
  }

  return [{ color: badgeTone ?? tone, label: value }];
}

function countSeverity(items: Array<{ severity: "green" | "yellow" | "red" }>) {
  return items.reduce(
    (accumulator, item) => {
      if (item.severity === "red") {
        accumulator.red += 1;
      } else if (item.severity === "yellow") {
        accumulator.yellow += 1;
      } else {
        accumulator.green += 1;
      }

      return accumulator;
    },
    { red: 0, yellow: 0, green: 0 },
  );
}

function getIngredientGroupTone(items: ScanResultIngredientItem[], fallback: RowTone): RowTone {
  if (items.some((item) => item.severity === "red")) {
    return "red";
  }

  if (items.some((item) => item.severity === "yellow")) {
    return fallback === "neutral" ? "neutral" : "yellow";
  }

  return fallback;
}

function getIngredientGroupBadges(group: IngredientGroupCard): BadgeDescriptor[] {
  if (group.tone === "neutral") {
    return group.items.length > 0
      ? [{ color: "yellow", count: group.items.length }]
      : [{ color: "green", label: "No" }];
  }

  const counts = countSeverity(group.items);

  return buildIssueBadges({
    redCount: counts.red,
    yellowCount: counts.yellow,
    tone: group.tone,
    clearLabel:
      counts.red === 0 && counts.yellow === 0 && group.items.length > 0 ? "Clear" : undefined,
  });
}

function getDeepCheckStatusBadges(item: ScanResultDeepExposureCheck): BadgeDescriptor[] {
  const tone = toRowTone(item.severity);
  const statusBadge =
    item.status === "not_checked"
      ? ({ color: "neutral", label: "Not found" } satisfies BadgeDescriptor)
      : item.severity === "red"
        ? ({ color: "red", label: "High" } satisfies BadgeDescriptor)
        : item.severity === "yellow"
          ? ({ color: "yellow", label: "Detected" } satisfies BadgeDescriptor)
          : ({ color: tone, label: "Minimum" } satisfies BadgeDescriptor);

  if (item.status === "not_checked" || item.matchCount <= 1) {
    return [statusBadge];
  }

  return [statusBadge, { color: statusBadge.color, count: item.matchCount }];
}

function BrandMark() {
  return (
    <div className="mt-4 flex flex-col items-center gap-1.5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-[0_10px_24px_rgba(23,20,18,0.06)]">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--red-main)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber-main)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--green-main)]" />
        </span>
      </span>
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-main)]">
          Truthlabel
        </p>
        <p className="mt-1 text-[11px] font-medium text-[var(--text-secondary)]">
          Exposure report
        </p>
      </div>
    </div>
  );
}

function getScanSourceBadgeLabel(scanSource: ScanSourceLabel) {
  switch (scanSource) {
    case "manual_paste":
      return "Manual";
    case "barcode":
      return "Barcode";
    case "ocr":
      return "OCR";
    case "demo":
    default:
      return "Demo";
  }
}

function ProductVisual({
  productName,
  scanSource,
}: {
  productName: string;
  scanSource: ScanSourceLabel;
}) {
  const sourceLabel = getScanSourceBadgeLabel(scanSource);

  return (
    <div className="relative h-[84px] w-[84px] overflow-hidden rounded-[18px] border border-[var(--border-strong)] bg-[linear-gradient(165deg,var(--bg-page)_0%,var(--bg-soft)_52%,var(--border-strong)_100%)] shadow-[0_14px_28px_rgba(23,20,18,0.08)]">
      <div className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/88 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
        {sourceLabel}
      </div>
      <div className="absolute inset-x-3 bottom-3 rounded-[14px] border border-white/80 bg-white/92 px-2.5 py-2 shadow-[0_10px_18px_rgba(23,20,18,0.08)]">
        <div className="mx-auto h-2 rounded-full bg-[var(--neutral-text)]" />
        <div className="mx-auto mt-1 h-2 rounded-full bg-[var(--amber-main)]" />
        <div className="mx-auto mt-1 h-2 rounded-full bg-[var(--green-main)]" />
        <p className="mt-2 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          {productName}
        </p>
      </div>
    </div>
  );
}

function ResultStateView({
  title,
  message,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  message: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <article className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[36px] border border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-[0_28px_60px_rgba(23,20,18,0.1)]">
        <div className="px-5 pb-6 pt-4">
          <header className="grid grid-cols-[1fr_auto_1fr] items-center">
            <Link
              href="/"
              className="justify-self-start text-[15px] font-medium text-[var(--text-secondary)]"
            >
              Done
            </Link>
            <h1 className="text-[15px] font-semibold text-[var(--text-main)]">Results</h1>
            <span />
          </header>

          <BrandMark />

          <section className="mt-6 rounded-[24px] border border-[var(--border-soft)] bg-[var(--bg-soft)] px-4 py-5">
            <h2 className="font-heading text-[1.35rem] font-semibold text-[var(--text-main)]">
              {title}
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">
              {message}
            </p>

            {primaryHref || secondaryHref ? (
              <div className="mt-4 flex flex-wrap gap-2.5">
                {primaryHref && primaryLabel ? (
                  <Link
                    href={primaryHref}
                    className="inline-flex rounded-full border border-transparent bg-[#182b22] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_36px_rgba(24,43,34,0.18)] transition active:scale-[0.99]"
                  >
                    {primaryLabel}
                  </Link>
                ) : null}
                {secondaryHref && secondaryLabel ? (
                  <Link
                    href={secondaryHref}
                    className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-main)] transition active:scale-[0.99]"
                  >
                    {secondaryLabel}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      </article>
    </main>
  );
}

function subscribeToStoredScanStore(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

function getManualScanStoreSnapshot() {
  return loadLatestManualScan();
}

function getBarcodeScanStoreSnapshot() {
  return loadLatestBarcodeScan();
}

function getManualScanStoreServerSnapshot() {
  return null;
}

function getScoreTone(score: number): Exclude<RowTone, "neutral"> {
  if (score >= 65) {
    return "red";
  }

  if (score >= 25) {
    return "yellow";
  }

  return "green";
}

function ScoreRing({
  score,
  scoreLabel,
  riskBand,
}: {
  score: number;
  scoreLabel: string;
  riskBand: string;
}) {
  const tone = getScoreTone(score);
  const progress = Math.max(0, Math.min(1, score / 100));
  const degrees = progress * 360;
  const ringColor =
    tone === "red"
      ? "var(--red-main)"
      : tone === "yellow"
        ? "var(--amber-main)"
        : "var(--green-main)";

  return (
    <div className="relative flex h-[118px] w-[118px] items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-[0_18px_34px_rgba(23,20,18,0.08)]">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${ringColor} ${degrees}deg, var(--border-soft) ${degrees}deg 360deg)`,
        }}
      />
      <div className="absolute inset-[9px] rounded-full bg-[var(--bg-page)]" />
      <div className="relative text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          Exposure
        </p>
        <p className="mt-1 font-heading text-[2.15rem] font-semibold leading-none text-[var(--text-main)]">
          {score}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">/100</p>
        <p
          className={`mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${scoreLabelClasses[tone]}`}
        >
          {scoreLabel}
        </p>
        <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
          {riskBand}
        </p>
      </div>
    </div>
  );
}

function TonePill({
  tone,
  children,
  className = "",
}: {
  tone: RowTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${pillToneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

function getCategoryIconName(categoryId?: string): CategoryIconName {
  switch (categoryId) {
    case "additives_preservatives":
      return "beaker";
    case "allergy_risk":
      return "allergy";
    case "artificial_colours":
      return "colour";
    case "artificial_engineered_food_construction":
      return "factory";
    case "artificial_sweeteners_sugar_substitutes":
      return "candy";
    case "banned_restricted_items":
      return "ban";
    case "brand_trust_safety":
      return "shield";
    case "cancer_linked_watch":
      return "eye";
    case "emulsifiers_stabilisers_thickeners_gums":
      return "texture";
    case "flavour_enhancers_flavourings":
      return "spark";
    case "fry_oil_fast_food_oil":
      return "flame";
    case "harmful_additives":
      return "additive";
    case "heavy_metals":
      return "metal";
    case "hydrogenated_partially_hydrogenated_oils":
      return "oil";
    case "meat_specific_concerns":
      return "meat";
    case "microplastics":
      return "micro";
    case "natural_positive":
      return "leaf";
    case "natural_vs_processed":
      return "scale";
    case "preservatives_shelf_life_systems":
      return "barcode";
    case "seed_oils_processed_oils":
      return "drop";
    case "total_ingredients":
      return "list";
    case "ultra_processed_indicators":
      return "factory";
    case "unknown_review":
      return "question";
    default:
      return "list";
  }
}

function CategoryGlyph({
  name,
  className = "",
}: {
  name: CategoryIconName;
  className?: string;
}) {
  const commonProps = {
    "aria-hidden": true,
    className: `h-3.5 w-3.5 ${className}`,
    fill: "none",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (name) {
    case "additive":
      return (
        <svg {...commonProps}>
          <path d="M9 3v5l-4.5 8.2A3.2 3.2 0 0 0 7.3 21h9.4a3.2 3.2 0 0 0 2.8-4.8L15 8V3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M8 8h8M7 16h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        </svg>
      );
    case "allergy":
      return (
        <svg {...commonProps}>
          <path d="M12 3.5 20 7v5.4c0 4.8-3.3 7.3-8 8.6-4.7-1.3-8-3.8-8-8.6V7l8-3.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M12 8v4.5M12 16h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      );
    case "ban":
      return (
        <svg {...commonProps}>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M6.8 6.8 17.2 17.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "barcode":
      return (
        <svg {...commonProps}>
          <path d="M5 5v14M8 5v14M12 5v14M16 5v14M19 5v14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "beaker":
      return (
        <svg {...commonProps}>
          <path d="M9 3h6M10 3v6.2l-4.1 7.1A3.1 3.1 0 0 0 8.6 21h6.8a3.1 3.1 0 0 0 2.7-4.7L14 9.2V3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M8 15h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        </svg>
      );
    case "candy":
      return (
        <svg {...commonProps}>
          <path d="M8.5 8.5h7v7h-7z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M8.5 10 4 7v10l4.5-3M15.5 10 20 7v10l-4.5-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "colour":
      return (
        <svg {...commonProps}>
          <path d="M12 21a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 9h.01M12 7h.01M16 9h.01M9.5 14h.01M14.5 14h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
        </svg>
      );
    case "drop":
      return (
        <svg {...commonProps}>
          <path d="M12 3.5s6 6.5 6 11A6 6 0 0 1 6 14.5c0-4.5 6-11 6-11Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "eye":
      return (
        <svg {...commonProps}>
          <path d="M3.5 12s3.2-5.2 8.5-5.2 8.5 5.2 8.5 5.2-3.2 5.2-8.5 5.2S3.5 12 3.5 12Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case "factory":
      return (
        <svg {...commonProps}>
          <path d="M4 20V9.5l5 3V9.5l5 3V6h6v14H4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M8 16h.01M12 16h.01M16 16h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
        </svg>
      );
    case "flame":
      return (
        <svg {...commonProps}>
          <path d="M12 21c4 0 6.5-2.6 6.5-6.2 0-3-1.7-5-4.8-8.2-.1 2-1 3.3-2.4 4.4.1-2.9-1.3-5.1-3.1-7C7.9 7 5.5 9.8 5.5 14.8 5.5 18.4 8 21 12 21Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...commonProps}>
          <path d="M5 19c9.5 0 14-5.2 14-14-8.8 0-14 5.1-14 14Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M5 19 15 9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        </svg>
      );
    case "list":
      return (
        <svg {...commonProps}>
          <path d="M8 7h11M8 12h11M8 17h11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
        </svg>
      );
    case "meat":
      return (
        <svg {...commonProps}>
          <path d="M9.5 20c3.6 0 7.5-3.9 7.5-7.5 0-3-2.4-5.5-5.5-5.5C7.9 7 4 10.9 4 14.5 4 17.6 6.4 20 9.5 20Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M16 8 20 4M18 6l2 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        </svg>
      );
    case "metal":
      return (
        <svg {...commonProps}>
          <path d="M12 3.5 19.4 8v8L12 20.5 4.6 16V8L12 3.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M12 8v8M8.5 10l7 4M15.5 10l-7 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      );
    case "micro":
      return (
        <svg {...commonProps}>
          <path d="M8 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM16.5 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9.5 20.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M11 8.5 13.8 9.6M10.8 15l2.8-2.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      );
    case "oil":
      return (
        <svg {...commonProps}>
          <path d="M8 5h8l-1 4.5 3 4.5v3.5A2.5 2.5 0 0 1 15.5 20h-7A2.5 2.5 0 0 1 6 17.5V14l3-4.5L8 5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="M9 10h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        </svg>
      );
    case "question":
      return (
        <svg {...commonProps}>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M9.8 9.2a2.4 2.4 0 0 1 4.6 1.1c0 2.2-2.4 2.1-2.4 4M12 17.5h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "scale":
      return (
        <svg {...commonProps}>
          <path d="M12 4v16M6 7h12M8 7l-4 7h8L8 7ZM16 7l-4 7h8l-4-7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "shield":
      return (
        <svg {...commonProps}>
          <path d="M12 21s7-3.4 7-10.2V5.4L12 3 5 5.4v5.4C5 17.6 12 21 12 21Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
          <path d="m8.8 12 2 2 4.4-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "spark":
      return (
        <svg {...commonProps}>
          <path d="M12 3.5 13.4 9l5.1 1.5-5.1 1.5L12 17.5 10.6 12l-5.1-1.5L10.6 9 12 3.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      );
    case "texture":
      return (
        <svg {...commonProps}>
          <path d="M5 8c2.2-2.2 4.5-2.2 6.8 0s4.6 2.2 7.2 0M5 13c2.2-2.2 4.5-2.2 6.8 0s4.6 2.2 7.2 0M5 18c2.2-2.2 4.5-2.2 6.8 0s4.6 2.2 7.2 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        </svg>
      );
  }
}

function RowIcon({
  tone,
  categoryId,
}: {
  tone: RowTone;
  categoryId?: string;
}) {
  const iconName = getCategoryIconName(categoryId);

  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconWrapClasses[tone]} ${categoryIconColorClasses[tone]}`}
    >
      <CategoryGlyph name={iconName} />
    </span>
  );
}

function SectionHeading({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[1.12rem] font-semibold tracking-[-0.01em] text-[var(--text-main)]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 text-[13px] font-semibold leading-5 text-[var(--text-main)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {extra}
    </div>
  );
}

function IssueBadgeStack({
  badges,
  className = "",
}: {
  badges: BadgeDescriptor[];
  className?: string;
}) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {badges.map((badge, index) => (
        <IssueBadge
          key={`${badge.color}-${badge.count ?? badge.label ?? "badge"}-${index}`}
          color={badge.color}
          count={badge.count}
          label={badge.label}
        />
      ))}
    </div>
  );
}

function formatMatchSummary(matchCount: number, matchedItemsPreview: string[]) {
  if (matchCount <= 0 && matchedItemsPreview.length === 0) {
    return "";
  }

  const countLabel = `${matchCount} match${matchCount === 1 ? "" : "es"}`;
  if (matchedItemsPreview.length === 0) {
    return countLabel;
  }

  return `${countLabel} • ${matchedItemsPreview.join(", ")}`;
}

function buildCategoryDetail(args: {
  title: string;
  tone: "green" | "yellow" | "red";
  status: string;
  shortMessage: string;
  matchedItemsPreview: string[];
  matchCount: number;
  redReasonType?: string;
}) {
  const sections = [
    {
      label: "What this means",
      text: args.shortMessage,
    },
  ];

  const matchSummary = formatMatchSummary(args.matchCount, args.matchedItemsPreview);
  if (matchSummary) {
    sections.push({
      label: "Matched items",
      text: matchSummary,
    });
  }

  if (args.redReasonType) {
    sections.push({
      label: "Why this went red",
      text: `This row reached a red state because of ${args.redReasonType.replace(/_/g, " ")}.`,
    });
  }

  return {
    title: args.title,
    tone: args.tone,
    status: args.status,
    sections,
  } satisfies ResultDetail;
}

function buildIngredientDetail(item: ScanResultIngredientItem) {
  const tone = item.severity === "green" ? "green" : item.severity;
  const matchedCategories = item.matchedCategories.length
    ? item.matchedCategories.join(", ")
    : "No matched category";

  return {
    title: item.displayName,
    tone,
    status:
      item.group === "unmatched"
        ? "Unmatched"
        : item.severity === "red"
          ? "Red flag"
          : item.severity === "yellow"
            ? "Worth reviewing"
            : "Recognizable ingredient",
    sections: [
      {
        label: item.severity === "green" ? "What this means" : "Why this was flagged",
        text: item.userFacingReason,
      },
      {
        label: "Matched categories",
        text: matchedCategories,
      },
      {
        label: "What to do",
        text:
          item.group === "unmatched"
            ? "Review the physical label and ingredient context. Unmatched does not mean safe."
            : item.severity === "green"
              ? "Keep it in context with the full label."
              : "Review it in context with the rest of the label before buying or eating.",
      },
    ],
  } satisfies ResultDetail;
}

function buildBrandTrustDetail(brandTrust: ScanResultBrandTrustSafety) {
  return {
    title: "Brand Trust / Safety",
    tone: toModalTone(brandTrust.severity),
    status:
      brandTrust.status === "not_checked"
        ? "Not found"
        : brandTrust.status === "clear_checked"
          ? "Clear checked"
          : brandTrust.status === "yellow_review"
            ? "Review signal"
            : "Warning",
    sections: [
      {
        label: "What this means",
        text: brandTrust.message,
      },
      {
        label: "Signals",
        text:
          brandTrust.signals.length > 0
            ? brandTrust.signals.join(", ")
            : "No live brand-safety or recall signal list was attached here.",
      },
      {
        label: "What to do",
        text:
          brandTrust.status === "red_warning"
            ? "Check lot, batch, date, and region details before buying or consuming."
            : "Use official recall and public-health sources when you need live verification.",
      },
    ],
  } satisfies ResultDetail;
}

function uniqueLabels(values: Array<string | undefined | null>) {
  const labels = values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return [...new Set(labels)];
}

function getFinalVerdictOpening(scanResult: ScanResult) {
  const hasAllergyMatch = scanResult.finalVerdict.mainReasons.some(
    (reason) => reason.reasonType === "allergy_profile_match",
  );
  const hasExternalSafetySignal = scanResult.finalVerdict.mainReasons.some(
    (reason) => reason.reasonType === "verified_external_signal",
  );

  if (hasAllergyMatch) {
    return "This product matches your allergy profile.";
  }

  if (hasExternalSafetySignal) {
    return "This product has an external safety warning.";
  }

  if (scanResult.finalVerdict.verdictTone === "red") {
    return "This product has strong warning signals.";
  }

  if (scanResult.finalVerdict.verdictTone === "yellow") {
    return "This product has ingredients worth reviewing.";
  }

  return "This product looks simple from the available label data.";
}

function getFinalWarningReasonLabel(reason: ScanResult["finalVerdict"]["mainReasons"][number]) {
  if (reason.reasonType === "allergy_profile_match") {
    return `Matches your allergy profile: ${reason.matchedItems[0] ?? reason.categoryName}`;
  }

  if (reason.reasonType === "banned_restricted") {
    return "Banned, restricted, or not-permitted ingredient found";
  }

  if (reason.reasonType === "verified_external_signal") {
    return "Official safety or recall signal found";
  }

  if (reason.reasonType === "count_overload") {
    return `High ${reason.categoryName.toLowerCase()} load`;
  }

  if (reason.reasonType === "long_ingredient_list") {
    return "Very long ingredient list";
  }

  if (reason.reasonType === "high_processed_share") {
    return "High processed ingredient share";
  }

  if (reason.reasonType === "category_combo_trigger") {
    return `${reason.categoryName} combination trigger`;
  }

  if (reason.categoryId === "cancer_linked_watch") {
    return "Cancer-related review signal found";
  }

  if (reason.categoryId === "ultra_processed_indicators") {
    return "Ultra-processed markers found";
  }

  if (reason.categoryId === "unknown_review") {
    return "Low-transparency label terms found";
  }

  if (reason.categoryId === "preservatives_shelf_life_systems") {
    return "Preservatives or shelf-life additives found";
  }

  if (reason.categoryId === "artificial_sweeteners_sugar_substitutes") {
    return "Artificial or non-sugar sweeteners found";
  }

  return reason.categoryName;
}

function getFinalWarningReasons(scanResult: ScanResult) {
  const reasons = scanResult.finalVerdict.mainReasons.map(getFinalWarningReasonLabel);

  if (reasons.length > 0) {
    return uniqueLabels(reasons).slice(0, 5);
  }

  if (scanResult.finalVerdict.verdictTone === "green") {
    return ["No major warning categories found from available label data"];
  }

  return ["Review signals found in the ingredient scan"];
}

function getFinalReasonHeading(scanResult: ScanResult) {
  if (scanResult.finalVerdict.verdictTone === "green") {
    return "What Truthlabel found";
  }

  if (scanResult.finalVerdict.verdictTone === "yellow") {
    return "This product has review notes because";
  }

  return "This product has warnings because";
}

function getFinalVerdictClosing(scanResult: ScanResult) {
  const reasonTypes = new Set(
    scanResult.finalVerdict.mainReasons.map((reason) => reason.reasonType),
  );
  const categoryIds = new Set(
    scanResult.finalVerdict.mainReasons.map((reason) => reason.categoryId),
  );

  if (reasonTypes.has("allergy_profile_match")) {
    return "Avoid this product if you are allergic to the matched ingredient. Always check the package label and follow medical advice for known allergies.";
  }

  if (reasonTypes.has("verified_external_signal")) {
    return "Truthlabel flags this as a serious external safety concern. Check the affected lot, date, region, and official source before buying or consuming.";
  }

  if (categoryIds.has("cancer_linked_watch")) {
    return "Truthlabel flags this for review because cancer-related or regulatory concern signals were found. This is not proof of harm from one product.";
  }

  if (scanResult.finalVerdict.verdictTone === "red") {
    return "Truthlabel flags this product strongly because serious warning categories or high-load patterns were found. This does not mean every ingredient is automatically dangerous.";
  }

  if (scanResult.finalVerdict.verdictTone === "yellow") {
    return "Truthlabel flags this product for review because some label signals need a closer look, but no automatic serious warning was found from the available data.";
  }

  return "Truthlabel did not find major label-based warning signals, but missing data is not proof of absence. Always check the package label.";
}

function getSimpleIngredientSummary(scanResult: ScanResult) {
  const simpleIngredients = uniqueLabels(
    scanResult.ingredientBreakdown.naturalPositive.map((item) => item.displayName),
  );

  return {
    count: simpleIngredients.length,
    preview: simpleIngredients.slice(0, 5),
  };
}

function OverviewRow({
  item,
}: {
  item: ScanResultOverviewRow;
}) {
  const tone = toRowTone(item.severity);
  const overviewValue =
    item.categoryId === "total_ingredients"
      ? item.displayValue
      : item.matchCount > 0
        ? String(item.matchCount)
        : item.severity === "green"
          ? "No"
          : item.displayValue;
  const badges = buildIssueBadges({
    value: overviewValue,
    tone,
    badgeTone: tone,
  });

  return (
    <div
      className="grid min-h-[48px] w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-2.5"
    >
      <RowIcon tone={tone} categoryId={item.categoryId} />
      <div className="min-w-0">
        <p className="truncate text-[15px] font-medium text-[var(--text-main)]">
          {item.label}
        </p>
      </div>
      <IssueBadgeStack badges={badges} className="justify-self-end" />
    </div>
  );
}

function IngredientChip({
  item,
  groupTone,
  onOpen,
}: {
  item: ScanResultIngredientItem;
  groupTone: RowTone;
  onOpen: (detail: ResultDetail) => void;
}) {
  const isInteractive = item.severity !== "green" || item.group === "unmatched";

  const content = (
    <span
      className={`inline-flex min-h-[32px] items-center rounded-[10px] border px-2.5 py-1 text-[12px] font-medium leading-5 transition-colors ${chipToneClasses[groupTone]}`}
    >
      <span>{item.displayName}</span>
    </span>
  );

  if (!isInteractive) {
    return content;
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(buildIngredientDetail(item))}
      className="inline-flex rounded-[10px] transition-transform active:scale-[0.985]"
    >
      {content}
    </button>
  );
}

function DeepCheckRow({
  item,
  isExpanded,
  onToggle,
}: {
  item: ScanResultDeepExposureCheck;
  isExpanded: boolean;
  onToggle: (categoryId: string) => void;
}) {
  const tone = toRowTone(item.severity);
  const badges = getDeepCheckStatusBadges(item);
  const detailId = `deep-check-detail-${item.categoryId}`;
  const isBannedRestrictedRow = item.categoryId === "banned_restricted_items";
  const matchedItems = uniqueLabels(
    item.matchedItemDetails.map((detail) => detail.displayName),
  ).slice(0, 6);
  const matchedItemsText =
    item.matchCount > 0
      ? `${item.matchCount} match${item.matchCount === 1 ? "" : "es"} found`
      : "No matched item shown";

  return (
    <div>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={detailId}
        onClick={() => onToggle(item.categoryId)}
        className="grid min-h-[52px] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 py-3 text-left transition-colors active:bg-[var(--bg-soft)]"
      >
        <div>
          <RowIcon tone={tone} categoryId={item.categoryId} />
        </div>
        <div className="min-w-0">
          <span className="block truncate text-[15px] font-medium text-[var(--text-main)]">
            {item.label}
          </span>
        </div>
        <IssueBadgeStack badges={badges} className="justify-self-end" />
        <ChevronIcon
          className={`text-[var(--text-secondary)] transition-transform ${
            isExpanded ? "-rotate-90" : "rotate-90"
          }`}
        />
      </button>

      <div
        id={detailId}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity,padding] duration-300 ease-out ${
          isExpanded ? "grid-rows-[1fr] pb-3 opacity-100" : "grid-rows-[0fr] pb-0 opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`relative overflow-hidden rounded-[20px] border px-3.5 py-3.5 shadow-[0_14px_26px_rgba(23,20,18,0.06)] ${deepDetailCardClasses[tone]}`}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${deepDetailAccentClasses[tone]}`}
            />
            <div className="pl-2">
              {isBannedRestrictedRow && matchedItems.length > 0 ? (
                <div className="mb-3 rounded-[16px] border border-[var(--red-border)] bg-white/72 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--red-dark)]">
                    Flagged banned/restricted item
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {matchedItems.map((matchedItem) => (
                      <span
                        key={`${item.categoryId}-flagged-${matchedItem}`}
                        className="rounded-full border border-[var(--red-border)] bg-[var(--red-main)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_8px_16px_rgba(200,30,30,0.14)]"
                      >
                        {matchedItem}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[17px] border border-white/70 bg-white/70 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${chipToneClasses[tone]}`}>
                    Reason: {item.reason}
                  </span>
                  <p className="text-[13px] font-semibold leading-5 text-[var(--text-main)]">
                    {item.title}
                  </p>
                </div>
                <p className="mt-2 text-[12px] leading-5 text-[var(--text-main)]">
                  {item.message}
                </p>
                {item.action ? (
                  <p className="mt-2 rounded-[14px] border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3 py-2 text-[12px] leading-5 text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-main)]">Action: </span>
                    {item.action}
                  </p>
                ) : null}
              </div>

              <div className="mt-3 rounded-[16px] border border-white/70 bg-white/62 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    Matched items
                  </p>
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                    {matchedItemsText}
                  </span>
                </div>

                {matchedItems.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {matchedItems.map((matchedItem) => (
                      <span
                        key={`${item.categoryId}-${matchedItem}`}
                        className={`rounded-full border px-2 py-1 text-[11px] font-medium ${chipToneClasses[tone]}`}
                      >
                        {matchedItem}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalBody({ detail }: { detail: ResultDetail }) {
  return (
    <>
      <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-soft)] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Status
        </p>
        <p className="mt-1 text-[13px] font-medium text-[var(--text-main)]">{detail.status}</p>
      </div>
      {detail.sections.map((section) => (
        <div
          key={section.label}
          className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-soft)] px-4 py-3"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            {section.label}
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[var(--text-main)]">{section.text}</p>
        </div>
      ))}
    </>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`h-4 w-4 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 4.5L9.5 8L6 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 20.4L10.55 19.08C5.4 14.41 2 11.34 2 7.58C2 4.52 4.42 2.1 7.48 2.1C9.21 2.1 10.87 2.91 12 4.18C13.13 2.91 14.79 2.1 16.52 2.1C19.58 2.1 22 4.52 22 7.58C22 11.34 18.6 14.41 13.45 19.09L12 20.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProductResult({
  barcodeScanKey,
  category,
  demoProductId,
  manualScanKey,
}: {
  barcodeScanKey?: string;
  category?: string;
  demoProductId?: string;
  manualScanKey?: string;
}) {
  const userSettings = useUserSettings();
  const [saved, setSaved] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [isDeepChecksExpanded, setIsDeepChecksExpanded] = useState(false);
  const [expandedDeepCheckId, setExpandedDeepCheckId] = useState<string | null>(
    null,
  );
  const [activeDetail, setActiveDetail] = useState<ResultDetail | null>(null);
  const ingredientSectionRef = useRef<HTMLElement | null>(null);
  const latestBarcodeScan = useSyncExternalStore(
    subscribeToStoredScanStore,
    getBarcodeScanStoreSnapshot,
    getManualScanStoreServerSnapshot,
  );
  const latestManualScan = useSyncExternalStore(
    subscribeToStoredScanStore,
    getManualScanStoreSnapshot,
    getManualScanStoreServerSnapshot,
  );
  const barcodeScanResult: ScanResult | null = barcodeScanKey
    ? latestBarcodeScan?.result ?? null
    : null;
  const manualScanResult: ScanResult | null = manualScanKey
    ? latestManualScan?.result ?? null
    : null;
  const barcodeScanResolved = !barcodeScanKey || typeof window !== "undefined";
  const manualScanResolved = !manualScanKey || typeof window !== "undefined";
  const savedAllergyProfile = useMemo(
    () => getSavedAllergyProfile(userSettings),
    [userSettings],
  );

  const fallbackScanResult = useMemo(
    () => getDemoScanResult(category, savedAllergyProfile, demoProductId),
    [category, demoProductId, savedAllergyProfile],
  );
  const scanResult = barcodeScanResult ?? manualScanResult ?? fallbackScanResult;

  const overviewRows = useMemo(() => {
    const byCategoryId = new Map(
      scanResult.quickOverview.map((row) => [row.categoryId, row]),
    );
    const withRequiredRows = [
      ...scanResult.quickOverview,
      ...[...requiredOverviewCategoryIds]
        .map((categoryId) => byCategoryId.get(categoryId))
        .filter(
          (row): row is ScanResultOverviewRow =>
            row !== undefined &&
            !scanResult.quickOverview.some(
              (baseRow) => baseRow.categoryId === row.categoryId,
            ),
        ),
    ];

    return [...withRequiredRows].sort((left, right) => left.sortOrder - right.sortOrder);
  }, [scanResult.quickOverview]);

  const ingredientGroups = useMemo<IngredientGroupCard[]>(
    () => [
      {
        id: "natural",
        label: "Natural",
        tone: getIngredientGroupTone(scanResult.ingredientBreakdown.naturalPositive, "green"),
        items: scanResult.ingredientBreakdown.naturalPositive,
      },
      {
        id: "processed",
        label: "Processed",
        tone: getIngredientGroupTone(
          scanResult.ingredientBreakdown.processedArtificial,
          "yellow",
        ),
        items: scanResult.ingredientBreakdown.processedArtificial,
      },
    ].filter((group) => group.items.length > 0),
    [scanResult.ingredientBreakdown],
  );

  const deepCheckRows = useMemo(
    () => getVisibleDeepExposureChecks(scanResult),
    [scanResult],
  );
  const hasDeepCheckOverflow = deepCheckRows.length > 10;
  const deepCheckPreviewHeightClass =
    hasDeepCheckOverflow && !isDeepChecksExpanded
      ? expandedDeepCheckId
        ? "max-h-[900px]"
        : "max-h-[760px]"
      : "max-h-[1400px]";

  const deepCheckSectionBadges = useMemo(() => {
    const redCount = deepCheckRows.filter((row) => row.severity === "red").length;
    const yellowCount = deepCheckRows.filter((row) => row.severity === "yellow").length;
    const hasNeutral = deepCheckRows.some((row) => row.status === "not_checked");

    return buildIssueBadges({
      redCount,
      yellowCount,
      tone: redCount > 0 ? "red" : yellowCount > 0 ? "yellow" : hasNeutral ? "neutral" : "green",
      clearLabel:
        redCount === 0 && yellowCount === 0 && !hasNeutral ? "Clear" : undefined,
      value:
        redCount === 0 && yellowCount === 0 && hasNeutral ? "Not found" : undefined,
      badgeTone: hasNeutral ? "neutral" : undefined,
    });
  }, [deepCheckRows]);

  const brandTrustBadges = useMemo(() => {
    const severity = scanResult.brandTrustSafety.severity;

    if (scanResult.brandTrustSafety.status === "not_checked") {
      return [{ color: "neutral", label: "Not found" }] satisfies BadgeDescriptor[];
    }

    return buildIssueBadges({
      clearLabel: severity === "green" ? "Clear" : undefined,
      value:
        severity === "yellow"
          ? "Review"
          : severity === "red"
            ? "Warning"
            : undefined,
      tone: toRowTone(severity),
      badgeTone: toRowTone(severity),
    });
  }, [scanResult.brandTrustSafety]);

  const naturalProcessed = useMemo(() => {
    const naturalCount = scanResult.ingredientBreakdown.naturalPositive.length;
    const processedCount = scanResult.ingredientBreakdown.processedArtificial.length;
    const total = naturalCount + processedCount;

    if (total === 0) {
      return { naturalPercent: 0, processedPercent: 0 };
    }

    const naturalPercent = Math.round((naturalCount / total) * 100);
    return {
      naturalPercent,
      processedPercent: 100 - naturalPercent,
    };
  }, [scanResult.ingredientBreakdown]);

  const finalWarningReasons = useMemo(
    () => getFinalWarningReasons(scanResult),
    [scanResult],
  );
  const finalReasonHeading = useMemo(
    () => getFinalReasonHeading(scanResult),
    [scanResult],
  );
  const finalVerdictOpening = useMemo(
    () => getFinalVerdictOpening(scanResult),
    [scanResult],
  );
  const finalVerdictClosing = useMemo(
    () => getFinalVerdictClosing(scanResult),
    [scanResult],
  );
  const simpleIngredientSummary = useMemo(
    () => getSimpleIngredientSummary(scanResult),
    [scanResult],
  );
  const finalVerdictBadgeLabel =
    scanResult.finalVerdict.verdictTone === "red"
      ? "Warning"
      : scanResult.finalVerdict.verdictTone === "yellow"
        ? "Review"
        : "Clear";

  function handleViewIngredients() {
    const nextOpenState = !isIngredientsOpen;
    setIsIngredientsOpen(nextOpenState);

    if (!nextOpenState) {
      return;
    }

    window.setTimeout(() => {
      ingredientSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 140);
  }

  const heroTone = toRowTone(scanResult.productHero.verdictTone);
  const brandTrustTone = toRowTone(scanResult.brandTrustSafety.severity);
  const showBrandTrustSafety = shouldShowBrandTrustSafety(scanResult, userSettings);
  const doneHref =
    scanResult.productHero.scanSource === "manual_paste" ||
    scanResult.productHero.scanSource === "barcode"
      ? "/manual"
      : "/";
  const feedbackIngredientText =
    latestManualScan?.input.ingredientText ??
    latestBarcodeScan?.productData.ingredientText ??
    "";

  if (barcodeScanKey && !barcodeScanResolved) {
    return (
      <ResultStateView
        title="Opening barcode scan"
        message="Loading the saved barcode scan on this device."
      />
    );
  }

  if (barcodeScanKey && !barcodeScanResult) {
    return (
      <ResultStateView
        title="Barcode scan not found"
        message="We could not find a saved barcode scan on this device yet. Run a new barcode lookup or open the sample result instead."
        primaryHref="/manual"
        primaryLabel="Open scan page"
        secondaryHref="/product"
        secondaryLabel="Open sample result"
      />
    );
  }

  if (manualScanKey && !manualScanResolved) {
    return (
      <ResultStateView
        title="Opening manual scan"
        message="Loading the saved label scan on this device."
      />
    );
  }

  if (manualScanKey && !manualScanResult) {
    return (
      <ResultStateView
        title="Manual scan not found"
        message="We could not find a saved manual scan on this device yet. Run a new manual scan or open the sample result instead."
        primaryHref="/manual"
        primaryLabel="Open manual scan"
        secondaryHref="/product"
        secondaryLabel="Open sample result"
      />
    );
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <article className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[36px] border border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-[0_28px_60px_rgba(23,20,18,0.1)]">
        <div className="px-5 pb-6 pt-4">
          <header className="grid grid-cols-[1fr_auto_1fr] items-center">
            <Link
              href={doneHref}
              className="justify-self-start text-[15px] font-medium text-[var(--text-secondary)]"
            >
              Done
            </Link>
            <h1 className="text-[15px] font-semibold text-[var(--text-main)]">Results</h1>
            <button
              type="button"
              onClick={() => setSaved((current) => !current)}
              className={`justify-self-end rounded-full border p-2.5 transition-colors ${
                saved
                  ? "border-[var(--red-border)] bg-[var(--red-bg)] text-[var(--red-dark)]"
                  : "border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
              }`}
              aria-label={saved ? "Remove saved result" : "Save result"}
            >
              <HeartIcon filled={saved} />
            </button>
          </header>

          <BrandMark />

          <section className="mt-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div>
                <ProductVisual
                  productName={scanResult.productHero.productName}
                  scanSource={scanResult.productHero.scanSource}
                />
                <h2 className="mt-4 font-heading text-[1.45rem] font-semibold leading-tight text-[var(--text-main)]">
                  {scanResult.productHero.productName}
                </h2>
                <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                  {scanResult.productHero.brandName}
                </p>
              </div>
              <ScoreRing
                score={scanResult.productHero.exposureRisk}
                scoreLabel={scanResult.productHero.verdictLabel}
                riskBand={scanResult.productHero.riskBand}
              />
            </div>
          </section>

          <section className="mt-6 border-t border-[var(--border-soft)] pt-5">
            <SectionHeading
              title="Quick Overview"
              subtitle="Compact checklist of the checks applied to this product."
            />
            <div className="mt-3 divide-y divide-[var(--border-soft)]">
              {overviewRows.map((item) => (
                <OverviewRow key={item.categoryId} item={item} />
              ))}
            </div>
          </section>

          <section className="mt-6 border-t border-[var(--border-soft)] pt-5">
            <SectionHeading
              title="Deep Exposure Checks"
              subtitle="Deep analysis of flagged items."
              extra={<IssueBadgeStack badges={deepCheckSectionBadges} />}
            />

            <div className="mt-4">
              <div
                className={`relative border-y border-[var(--border-soft)] py-1 transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  hasDeepCheckOverflow && !isDeepChecksExpanded
                    ? `${deepCheckPreviewHeightClass} overflow-hidden`
                    : `${deepCheckPreviewHeightClass} overflow-hidden`
                }`}
              >
                {deepCheckRows.length > 0 ? (
                  <div className="divide-y divide-[var(--border-soft)]">
                    {deepCheckRows.map((item) => (
                      <DeepCheckRow
                        key={item.categoryId}
                        item={item}
                        isExpanded={expandedDeepCheckId === item.categoryId}
                        onToggle={(categoryId) =>
                          setExpandedDeepCheckId((current) =>
                            current === categoryId ? null : categoryId,
                          )
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[18px] bg-[var(--bg-soft)] px-4 py-3.5">
                    <p className="text-[13px] font-semibold text-[var(--text-main)]">
                      No yellow or red issue categories found.
                    </p>
                    <p className="mt-1.5 text-[13px] leading-5 text-[var(--text-secondary)]">
                      This does not guarantee the product is risk-free; it only reflects the current label data.
                    </p>
                  </div>
                )}
                {hasDeepCheckOverflow && !isDeepChecksExpanded ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,var(--bg-surface)_82%)]" />
                ) : null}
              </div>

              {hasDeepCheckOverflow ? (
                <button
                  type="button"
                  onClick={() => setIsDeepChecksExpanded((current) => !current)}
                  className="mx-auto mt-3 flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] px-4 py-2 text-[12px] font-semibold text-[var(--text-main)] shadow-[0_12px_24px_rgba(23,20,18,0.06)] transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--bg-soft)] hover:shadow-[0_16px_30px_rgba(23,20,18,0.08)] active:scale-[0.98]"
                >
                  {isDeepChecksExpanded ? "Show less" : "Show more"}
                  <ChevronIcon
                    className={`text-[var(--text-secondary)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isDeepChecksExpanded ? "-rotate-90" : "rotate-90"
                    }`}
                  />
                </button>
              ) : null}
              </div>
          </section>

          <section
            ref={ingredientSectionRef}
            className="mt-6 border-t border-[var(--border-soft)] pt-5"
          >
            <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-soft)] px-3.5 py-3">
              <p className="mb-3 text-[13px] font-semibold text-[var(--text-main)]">
                Natural vs Processed
              </p>
              <div className="overflow-hidden rounded-full bg-[var(--border-soft)]">
                <div className="flex h-2">
                  <div
                    className="bg-[var(--green-main)]"
                    style={{ width: `${naturalProcessed.naturalPercent}%` }}
                  />
                  <div
                    className="bg-[var(--red-main)]"
                    style={{ width: `${naturalProcessed.processedPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-[11px] font-medium text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--green-main)]" />
                    Natural {naturalProcessed.naturalPercent}%
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--red-main)]" />
                    Processed {naturalProcessed.processedPercent}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleViewIngredients}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--green-border)] bg-[var(--green-bg)] px-3 py-1.5 text-[11px] font-semibold text-[var(--green-dark)] shadow-[0_10px_20px_rgba(21,128,61,0.08)] transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_14px_26px_rgba(21,128,61,0.12)] active:scale-[0.98]"
                >
                  {isIngredientsOpen ? "Hide ingredients" : "View ingredients"}
                  <ChevronIcon
                    className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isIngredientsOpen ? "-rotate-90" : "rotate-90"
                    }`}
                  />
                </button>
              </div>

              <div
                className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isIngredientsOpen
                    ? "mt-4 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  {ingredientGroups.length > 0 ? (
                    <div className="space-y-3">
                      {ingredientGroups.map((group) => (
                        <div
                          key={group.id}
                          className={`rounded-[22px] border px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] ${groupSurfaceClasses[group.tone]}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p
                                className={`text-[14px] font-semibold tracking-[-0.01em] ${groupTitleClasses[group.tone]}`}
                              >
                                {group.label}
                              </p>
                            </div>
                            <IssueBadgeStack badges={getIngredientGroupBadges(group)} />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
                            {group.items.map((item) => (
                              <IngredientChip
                                key={`${group.id}-${item.canonicalIngredientId}-${item.originalText}`}
                                item={item}
                                groupTone={group.tone}
                                onOpen={setActiveDetail}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-surface)] px-4 py-3.5">
                      <p className="text-[13px] font-semibold text-[var(--text-main)]">
                        Ingredient data missing
                      </p>
                      <p className="mt-1.5 text-[13px] leading-5 text-[var(--text-secondary)]">
                        Ingredient-based warnings require a readable ingredient list.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {showBrandTrustSafety ? (
          <section className="mt-6">
            <button
              type="button"
              onClick={() =>
                setActiveDetail(buildBrandTrustDetail(scanResult.brandTrustSafety))
              }
              className={`w-full rounded-[24px] border px-4 py-4 text-left transition-transform active:scale-[0.99] ${brandTrustCardClasses[brandTrustTone]}`}
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${brandTrustIconClasses[brandTrustTone]}`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="h-4 w-4"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.5 8.25L6.25 11L12.5 4.75"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-[15px] font-semibold">
                    Brand Trust / Safety
                  </p>
                  <p className={`mt-1 text-[13px] ${brandTrustSubtitleClasses[brandTrustTone]}`}>
                    {scanResult.brandTrustSafety.message}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <IssueBadgeStack badges={brandTrustBadges} />
                  <ChevronIcon className={brandTrustChevronClasses[brandTrustTone]} />
                </div>
              </div>
            </button>
          </section>
          ) : null}

          <section className="mt-6 border-t border-[var(--border-soft)] pt-5">
            <SectionHeading
              title="Final Verdict"
            />
            <div
              className={`mt-3 rounded-[24px] border px-4 py-4 ${finalVerdictCardClasses[scanResult.finalVerdict.verdictTone]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    Final score
                  </p>
                  <h3 className="mt-1 font-heading text-[1.45rem] font-semibold leading-none text-[var(--text-main)]">
                    {scanResult.finalVerdict.exposureRisk} / 100
                  </h3>
                  <p className="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">
                    {scanResult.finalVerdict.headline}
                  </p>
                </div>
                <TonePill tone={heroTone}>{finalVerdictBadgeLabel}</TonePill>
              </div>

              <p className="mt-3 text-[14px] font-medium leading-6 text-[var(--text-main)]">
                {finalVerdictOpening}
              </p>

              <div className="mt-4 rounded-[18px] border border-white/60 bg-white/65 px-3.5 py-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                  {finalReasonHeading}
                </p>
                <ul className="mt-2.5 space-y-2">
                  {finalWarningReasons.map((reason) => (
                    <li
                      key={reason}
                      className="flex gap-2 text-[13px] leading-5 text-[var(--text-main)]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-55" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-3 rounded-[18px] border border-white/60 bg-white/65 px-3.5 py-3 text-[13px] leading-6 text-[var(--text-secondary)]">
                {finalVerdictClosing}
              </p>

              <div className="mt-3 rounded-[18px] border border-white/60 bg-white/65 px-3.5 py-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                  Good / simple ingredients found
                </p>
                <p className="mt-2 text-[13px] leading-5 text-[var(--text-main)]">
                  Simple recognizable ingredients found: {simpleIngredientSummary.count}
                </p>
                {simpleIngredientSummary.preview.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {simpleIngredientSummary.preview.map((ingredient) => (
                      <span
                        key={ingredient}
                        className="rounded-full border border-white/70 bg-white/70 px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)]"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="hidden">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-[1.3rem] font-semibold text-[var(--text-main)]">
                    {scanResult.finalVerdict.headline}
                  </h3>
                  <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    {scanResult.finalVerdict.exposureRisk} / 100 • {scanResult.finalVerdict.riskBand}
                  </p>
                </div>
                <TonePill tone={heroTone}>{finalVerdictBadgeLabel}</TonePill>
              </div>
              <p className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">
                {scanResult.finalVerdict.summary}
              </p>

              {scanResult.finalVerdict.mainReasons.length > 0 ? (
                <div className="mt-4 space-y-2.5">
                  {scanResult.finalVerdict.mainReasons.map((reason) => (
                    <button
                      key={`${reason.categoryId}-${reason.reasonType}`}
                      type="button"
                      onClick={() =>
                        setActiveDetail(
                          buildCategoryDetail({
                            title: reason.categoryName,
                            tone: reason.severity,
                            status: reason.reasonType.replace(/_/g, " "),
                            shortMessage: reason.message,
                            matchedItemsPreview: reason.matchedItems.slice(0, 3),
                            matchCount: reason.matchedItems.length,
                            redReasonType: reason.reasonType,
                          }),
                        )
                      }
                      className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-[18px] border border-white/60 bg-white/65 px-3.5 py-3 text-left transition active:scale-[0.99]"
                    >
                      <div className="pt-0.5">
                        <RowIcon
                          tone={toRowTone(reason.severity)}
                          categoryId={reason.categoryId}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--text-main)]">
                          {reason.categoryName}
                        </p>
                        <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
                          {reason.message}
                        </p>
                      </div>
                      <ChevronIcon className="mt-1 text-[var(--text-secondary)]" />
                    </button>
                  ))}
                </div>
              ) : null}
              </div>

              <p className="mt-4 text-[11px] leading-5 text-[var(--text-secondary)]">
                Truthlabel helps explain ingredient labels and safety signals. It is not medical advice. Always check the package label, especially for allergies.
              </p>
            </div>

            <TestingFeedbackPanel
              scanResult={scanResult}
              ingredientText={feedbackIngredientText}
              initialProductName={scanResult.productHero.productName}
              initialBrandName={scanResult.productHero.brandName}
              initialBarcode={scanResult.productHero.barcode}
            />
          </section>
        </div>
      </article>

      <InfoModal
        isOpen={activeDetail !== null}
        onClose={() => setActiveDetail(null)}
        title={activeDetail?.title ?? ""}
        tone={activeDetail?.tone ?? "green"}
      >
        {activeDetail ? <ModalBody detail={activeDetail} /> : null}
      </InfoModal>
    </main>
  );
}
