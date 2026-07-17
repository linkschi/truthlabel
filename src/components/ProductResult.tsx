"use client";

import Link from "next/link";
import {
  type ReactNode,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import ConcernDot from "@/components/ConcernDot";
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
  getVisibleConfidenceNotes,
  getVisibleDeepExposureChecks,
  shouldShowBrandTrustSafety,
} from "@/lib/userSettings/scanDisplayPreferences";

type RowTone = "green" | "yellow" | "red" | "neutral";

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
  helperText: string;
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

const requiredOverviewCategoryIds = new Set([
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
          Inside It
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

function getScanCategoryLabel(scanSource: ScanSourceLabel) {
  return scanSource === "demo" ? "Demo category" : "Product category";
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

function RowIcon({ tone }: { tone: RowTone }) {
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconWrapClasses[tone]}`}
    >
      {tone === "neutral" ? (
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--neutral-text)]" />
      ) : (
        <ConcernDot level={tone} className="h-2 w-2" />
      )}
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
          <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
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
        ? "Not checked"
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

function OverviewRow({
  item,
  onOpen,
}: {
  item: ScanResultOverviewRow;
  onOpen: (detail: ResultDetail) => void;
}) {
  const tone = toRowTone(item.severity);
  const badges = buildIssueBadges({
    clearLabel: item.severity === "green" ? item.displayValue : undefined,
    value: item.severity !== "green" ? item.displayValue : undefined,
    tone,
    badgeTone: tone,
  });
  const previewText =
    formatMatchSummary(item.matchCount, item.matchedItemsPreview) || item.shortMessage;

  return (
    <button
      type="button"
      onClick={() =>
        onOpen(
          buildCategoryDetail({
            title: item.label,
            tone: toModalTone(item.severity),
            status: item.displayValue,
            shortMessage: item.shortMessage,
            matchedItemsPreview: item.matchedItemsPreview,
            matchCount: item.matchCount,
            redReasonType: item.redReasonType,
          }),
        )
      }
      className="grid min-h-[56px] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-3 py-3 text-left transition-colors active:bg-[var(--bg-soft)]"
    >
      <div className="pt-0.5">
        <RowIcon tone={tone} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-medium text-[var(--text-main)]">
          {item.label}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
          {previewText}
        </p>
      </div>
      <IssueBadgeStack badges={badges} className="justify-self-end pt-0.5" />
      <ChevronIcon className="mt-1 text-[var(--text-secondary)]" />
    </button>
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
  onOpen,
}: {
  item: ScanResultDeepExposureCheck;
  onOpen: (detail: ResultDetail) => void;
}) {
  const tone = toRowTone(item.severity);
  const badges = buildIssueBadges({
    clearLabel:
      item.status === "checked" && item.severity === "green" ? item.displayValue : undefined,
    value: item.status === "not_checked" ? "Not checked" : item.displayValue,
    tone,
    badgeTone: tone,
  });
  const previewText =
    item.status === "not_checked"
      ? "External lookup was not attached here."
      : formatMatchSummary(item.matchCount, item.matchedItemsPreview) || item.shortMessage;

  return (
    <button
      type="button"
      onClick={() =>
        onOpen(
          buildCategoryDetail({
            title: item.label,
            tone: toModalTone(item.severity),
            status: item.status === "not_checked" ? "Not checked" : item.displayValue,
            shortMessage:
              item.status === "not_checked"
                ? "Missing data is not proof of absence."
                : item.shortMessage,
            matchedItemsPreview: item.matchedItemsPreview,
            matchCount: item.matchCount,
            redReasonType: item.redReasonType,
          }),
        )
      }
      className="grid min-h-[56px] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-3 py-3 text-left transition-colors active:bg-[var(--bg-soft)]"
    >
      <div className="pt-0.5">
        <RowIcon tone={tone} />
      </div>
      <div className="min-w-0">
        <span className="truncate text-[15px] font-medium text-[var(--text-main)]">
          {item.label}
        </span>
        <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
          {previewText}
        </p>
      </div>
      <IssueBadgeStack badges={badges} className="justify-self-end pt-0.5" />
      <ChevronIcon className="mt-1 text-[var(--text-secondary)]" />
    </button>
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
  const [isDeepChecksOpen, setIsDeepChecksOpen] = useState(false);
  const [isConfidenceOpen, setIsConfidenceOpen] = useState(false);
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
    const urgentRows = scanResult.quickOverview.filter(
      (row) => row.severity !== "green" || row.isInformational,
    );
    const calmRows = scanResult.quickOverview.filter(
      (row) => row.severity === "green" && !row.isInformational,
    );
    const baseRows =
      urgentRows.length >= 6
        ? urgentRows.slice(0, 6)
        : urgentRows.concat(calmRows.slice(0, Math.max(3, 6 - urgentRows.length)));
    const byCategoryId = new Map(
      scanResult.quickOverview.map((row) => [row.categoryId, row]),
    );
    const withRequiredRows = [
      ...baseRows,
      ...[...requiredOverviewCategoryIds]
        .map((categoryId) => byCategoryId.get(categoryId))
        .filter(
          (row): row is ScanResultOverviewRow =>
            row !== undefined &&
            !baseRows.some((baseRow) => baseRow.categoryId === row.categoryId),
        ),
    ];

    return [...withRequiredRows].sort((left, right) => left.sortOrder - right.sortOrder);
  }, [scanResult.quickOverview]);

  const ingredientGroups = useMemo<IngredientGroupCard[]>(
    () => [
      {
        id: "processed",
        label: "Processed / Artificial",
        tone: getIngredientGroupTone(
          scanResult.ingredientBreakdown.processedArtificial,
          "yellow",
        ),
        helperText:
          "These ingredients are carrying most of the formulation, additive, or warning pressure.",
        items: scanResult.ingredientBreakdown.processedArtificial,
      },
      {
        id: "unknown",
        label: "Unknown / Review",
        tone: getIngredientGroupTone(scanResult.ingredientBreakdown.unknownReview, "neutral"),
        helperText:
          "These label terms are vague, broad, or not fully transparent.",
        items: scanResult.ingredientBreakdown.unknownReview,
      },
      {
        id: "natural",
        label: "Natural / Positive",
        tone: getIngredientGroupTone(scanResult.ingredientBreakdown.naturalPositive, "green"),
        helperText:
          "Recognizable ingredients stay visible here, but they do not cancel warnings elsewhere.",
        items: scanResult.ingredientBreakdown.naturalPositive,
      },
      {
        id: "unmatched",
        label: "Unmatched",
        tone: getIngredientGroupTone(scanResult.ingredientBreakdown.unmatchedIngredients, "neutral"),
        helperText:
          "Unmatched ingredients were not found in the current Truthlabel database.",
        items: scanResult.ingredientBreakdown.unmatchedIngredients,
      },
    ].filter((group) => group.items.length > 0),
    [scanResult.ingredientBreakdown],
  );

  const ingredientSummary = useMemo(
    () =>
      ingredientGroups
        .map((group) => `${group.label.split(" / ")[0]} ${group.items.length}`)
        .join(" | "),
    [ingredientGroups],
  );

  const ingredientSectionBadges = useMemo(() => {
    const allItems = ingredientGroups.flatMap((group) => group.items);
    const counts = countSeverity(allItems);

    return buildIssueBadges({
      redCount: counts.red,
      yellowCount: counts.yellow,
      tone: counts.red > 0 ? "red" : counts.yellow > 0 ? "yellow" : "green",
      clearLabel:
        counts.red === 0 && counts.yellow === 0 && allItems.length > 0 ? "Clear" : undefined,
    });
  }, [ingredientGroups]);

  const deepCheckRows = useMemo(
    () => getVisibleDeepExposureChecks(scanResult, userSettings),
    [scanResult, userSettings],
  );

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
        redCount === 0 && yellowCount === 0 && hasNeutral ? "Not checked" : undefined,
      badgeTone: hasNeutral ? "neutral" : undefined,
    });
  }, [deepCheckRows]);

  const brandTrustBadges = useMemo(() => {
    const severity = scanResult.brandTrustSafety.severity;

    if (scanResult.brandTrustSafety.status === "not_checked") {
      return [{ color: "neutral", label: "Not checked" }] satisfies BadgeDescriptor[];
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

  const confidenceNotes = useMemo(
    () => getVisibleConfidenceNotes(scanResult, userSettings),
    [scanResult, userSettings],
  );
  const finalVerdictBadgeLabel =
    scanResult.finalVerdict.verdictTone === "red"
      ? "Warning"
      : scanResult.finalVerdict.verdictTone === "yellow"
        ? "Review"
        : "Clear";

  function handleViewIngredients() {
    setIsIngredientsOpen(true);

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
  const scanSourceBadgeLabel = getScanSourceBadgeLabel(scanResult.productHero.scanSource);
  const scanCategoryLabel = getScanCategoryLabel(scanResult.productHero.scanSource);
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
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <TonePill tone={heroTone}>{scanResult.productHero.verdictLabel}</TonePill>
                  <TonePill tone="neutral">{scanSourceBadgeLabel}</TonePill>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {scanResult.productHero.productCategory ? (
                    <>
                      <TonePill tone="neutral">{scanCategoryLabel}</TonePill>
                      <span className="text-[12px] font-medium text-[var(--text-secondary)]">
                        {scanResult.productHero.productCategory}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
              <ScoreRing
                score={scanResult.productHero.exposureRisk}
                scoreLabel={scanResult.productHero.verdictLabel}
                riskBand={scanResult.productHero.riskBand}
              />
            </div>
          </section>

          <section className="mt-6 border-t border-[var(--border-soft)] pt-5">
            <button
              type="button"
              onClick={() => setIsDeepChecksOpen((current) => !current)}
              className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-left"
            >
              <div>
                <h2 className="text-[1.12rem] font-semibold tracking-[-0.01em] text-[var(--text-main)]">
                  Deep Exposure Checks
                </h2>
                <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
                  Label-based checks can clear green. External-data checks stay clearly marked when they were not checked.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <IssueBadgeStack badges={deepCheckSectionBadges} />
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className={`h-4 w-4 transition-transform ${isDeepChecksOpen ? "rotate-180" : ""}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 6.5L8 10L12 6.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </button>

            <div
              className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                isDeepChecksOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 divide-y divide-[var(--border-soft)] border-y border-[var(--border-soft)] py-1">
                {deepCheckRows.map((item) => (
                  <DeepCheckRow key={item.categoryId} item={item} onOpen={setActiveDetail} />
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 border-t border-[var(--border-soft)] pt-5">
            <SectionHeading
              title="Quick Overview"
              subtitle="The strongest category signals rise to the top so the warning story stays clear on mobile."
            />
            <div className="mt-3 divide-y divide-[var(--border-soft)]">
              {overviewRows.map((item) => (
                <OverviewRow key={item.categoryId} item={item} onOpen={setActiveDetail} />
              ))}
            </div>

            <div className="mt-4 rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-soft)] px-3.5 py-3">
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
                  className="text-[12px] font-semibold text-[var(--text-main)]"
                >
                  View ingredients
                </button>
              </div>
            </div>
          </section>

          <section
            ref={ingredientSectionRef}
            className="mt-6 border-t border-[var(--border-soft)] pt-5"
          >
            <button
              type="button"
              onClick={() => setIsIngredientsOpen((current) => !current)}
              className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-left"
            >
              <div>
                <h2 className="text-[1.12rem] font-semibold tracking-[-0.01em] text-[var(--text-main)]">
                  Ingredient Breakdown
                </h2>
                <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
                  {ingredientSummary || "Ingredient-based warnings require a readable ingredient list."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <IssueBadgeStack badges={ingredientSectionBadges} />
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className={`h-4 w-4 transition-transform ${isIngredientsOpen ? "rotate-180" : ""}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 6.5L8 10L12 6.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </button>

            <div
              className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                isIngredientsOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0 border-y border-[var(--border-soft)] py-3">
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
                            <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
                              {group.helperText}
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
                  <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-soft)] px-4 py-3.5">
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
              subtitle="The closing view combines the score, strongest reasons, and confidence notes without overstating certainty."
            />
            <div
              className={`mt-3 rounded-[24px] border px-4 py-4 ${finalVerdictCardClasses[scanResult.finalVerdict.verdictTone]}`}
            >
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
                        <RowIcon tone={toRowTone(reason.severity)} />
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

              {confidenceNotes.length > 0 ? (
                <div className="mt-4 rounded-[18px] border border-white/60 bg-white/65 px-3.5 py-3">
                  <button
                    type="button"
                    onClick={() => setIsConfidenceOpen((current) => !current)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                        Confidence notes
                      </p>
                      <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
                        Keep these notes in view before treating missing data as a clear pass.
                      </p>
                    </div>
                    <ChevronIcon
                      className={`text-[var(--text-secondary)] transition-transform ${isConfidenceOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                  <div
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                      isConfidenceOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <ul className="space-y-2">
                        {confidenceNotes.map((note) => (
                          <li
                            key={note}
                            className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3 py-2.5 text-[12px] leading-5 text-[var(--text-secondary)]"
                          >
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}

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
