"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import InfoModal from "@/components/InfoModal";
import IssueBadge from "@/components/IssueBadge";
import TestingFeedbackPanel from "@/components/TestingFeedbackPanel";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import type {
  ScanResult,
  ScanResultBrandTrustSafety,
  ScanResultDeepExposureCheck,
  ScanResultIngredientItem,
  ScanResultOverviewRow,
} from "@/lib/buildScanResult";
import { trackTruthlabelEvent } from "@/lib/analytics/analyticsClient";
import { buildScanResultAnalytics } from "@/lib/analytics/analyticsEvents";
import { loadLatestBarcodeScan } from "@/lib/barcodeScanStorage";
import { getDemoScanResult } from "@/lib/getDemoScanResult";
import { loadLatestManualScan } from "@/lib/manualScanStorage";
import {
  deleteScanHistoryRecord,
  getScanHistoryRecord,
} from "@/lib/scanHistory/scanHistoryClient";
import { formatFullScanDate } from "@/lib/scanHistory/scanHistoryDisplay";
import type { ScanHistoryRecord } from "@/lib/scanHistory/scanHistoryTypes";
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
type ProductImageSourceLabel = ScanResult["productHero"]["imageSource"];

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

function getInitialReducedMotionPreference() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    getInitialReducedMotionPreference,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

function useCountUp(targetValue: number, enabled: boolean, durationMs = 650) {
  const [displayValue, setDisplayValue] = useState(() =>
    enabled && targetValue > 0 ? 0 : targetValue,
  );

  useEffect(() => {
    if (!enabled || targetValue <= 0) {
      const frame = window.requestAnimationFrame(() => {
        setDisplayValue(targetValue);
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    let frame = 0;
    const startTime = window.performance.now();
    const easedOut = (progress: number) => 1 - Math.pow(1 - progress, 3);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      setDisplayValue(Math.round(targetValue * easedOut(progress)));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [durationMs, enabled, targetValue]);

  return displayValue;
}

function buildResultMotionKey(args: {
  barcodeScanKey?: string;
  manualScanKey?: string;
  historyScanId?: string;
  demoProductId?: string;
  category?: string;
  latestBarcodeSavedAt?: string;
  latestManualSavedAt?: string;
  historyScannedAt?: string;
  scanResult: ScanResult;
}) {
  const sourceKey = args.barcodeScanKey
    ? `barcode:${args.latestBarcodeSavedAt ?? args.barcodeScanKey}`
    : args.manualScanKey
      ? `manual:${args.latestManualSavedAt ?? args.manualScanKey}`
      : args.historyScanId
        ? `history:${args.historyScannedAt ?? args.historyScanId}`
        : `demo:${args.demoProductId ?? args.category ?? "sample"}`;

  return [
    sourceKey,
    args.scanResult.productHero.productName,
    args.scanResult.ingredientLoad.score,
  ].join("|");
}

function useFreshResultMotion(resultMotionKey: string, freshResult: boolean) {
  const [freshMotionKey] = useState(() => {
    if (!freshResult || typeof window === "undefined") {
      return "";
    }

    const storageKey = `truthlabel.result-viewed.${resultMotionKey}`;

    try {
      if (window.sessionStorage.getItem(storageKey)) {
        return "";
      }

      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      return resultMotionKey;
    }

    return resultMotionKey;
  });

  return freshMotionKey === resultMotionKey;
}

function getRevealStyle(index: number) {
  return { animationDelay: `${index * 80}ms` };
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
          Ingredient report
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
      return "Sample";
  }
}

function getProductImageSourceLabel(imageSource?: ProductImageSourceLabel) {
  switch (imageSource) {
    case "product_database":
      return "Open Food Facts";
    case "captured_scan":
      return "Scan photo";
    case "sample_scan":
      return "Sample scan";
    default:
      return "Product";
  }
}

function getProductVisualAltText({
  imageSource,
  productName,
}: {
  imageSource?: ProductImageSourceLabel;
  productName: string;
}) {
  switch (imageSource) {
    case "sample_scan":
      return `${productName} sample scan preview`;
    case "captured_scan":
      return `${productName} scan photo`;
    case "product_database":
      return `${productName} product database image`;
    default:
      return `${productName} product image`;
  }
}

function ProductVisual({
  productName,
  scanSource,
  imageUrl,
  imageSource,
  variant = "compact",
}: {
  productName: string;
  scanSource: ScanSourceLabel;
  imageUrl: string;
  imageSource?: ProductImageSourceLabel;
  variant?: "compact" | "wide";
}) {
  const sourceLabel = getScanSourceBadgeLabel(scanSource);
  const imageSourceLabel = getProductImageSourceLabel(imageSource);
  const [failedImageUrl, setFailedImageUrl] = useState("");
  const hasImage = Boolean(imageUrl && failedImageUrl !== imageUrl);
  const showScanSourceBadge = scanSource !== "demo";
  const visualSizeClass =
    variant === "wide"
      ? "h-[158px] w-full rounded-[26px]"
      : "h-[96px] w-[96px] rounded-[20px]";

  return (
    <div
      className={`relative overflow-hidden border border-[var(--border-strong)] bg-[linear-gradient(165deg,var(--bg-page)_0%,var(--bg-soft)_52%,var(--border-strong)_100%)] shadow-[0_14px_28px_rgba(23,20,18,0.08)] ${visualSizeClass}`}
    >
      {hasImage ? (
        <img
          src={imageUrl}
          alt={getProductVisualAltText({ imageSource, productName })}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : (
        <div
          className={`absolute inset-x-3 rounded-[14px] border border-white/80 bg-white/92 px-2.5 py-2 shadow-[0_10px_18px_rgba(23,20,18,0.08)] ${
            variant === "wide" ? "bottom-4" : "bottom-3"
          }`}
        >
          <div className="mx-auto h-2 rounded-full bg-[var(--neutral-text)]" />
          <div className="mx-auto mt-1 h-2 rounded-full bg-[var(--amber-main)]" />
          <div className="mx-auto mt-1 h-2 rounded-full bg-[var(--green-main)]" />
          <p className="mt-2 line-clamp-2 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            {productName}
          </p>
        </div>
      )}
      <div className="absolute left-2 top-2 rounded-full border border-white/80 bg-white/90 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] shadow-[0_8px_18px_rgba(23,20,18,0.08)]">
        {hasImage ? imageSourceLabel : sourceLabel}
      </div>
      {showScanSourceBadge ? (
        <div className="absolute bottom-2 right-2 rounded-full border border-white/80 bg-white/90 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] shadow-[0_8px_18px_rgba(23,20,18,0.08)]">
          {sourceLabel}
        </div>
      ) : null}
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
              href="/app"
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

function ScoreRing({
  score,
  scoreLabel,
  tone,
  animate = false,
}: {
  score: number;
  scoreLabel: string;
  tone: Exclude<RowTone, "neutral">;
  animate?: boolean;
}) {
  const displayedScore = useCountUp(score, animate, 700);
  const progress = Math.max(0, Math.min(1, displayedScore / 100));
  const degrees = progress * 360;
  const ringColor =
    tone === "red"
      ? "var(--red-main)"
      : tone === "yellow"
        ? "var(--amber-main)"
        : "var(--green-main)";
  const shortScoreLabel = scoreLabel.replace(" Ingredient Score", "");

  return (
    <div className="flex w-[124px] flex-col items-center">
      <div className="relative flex h-[112px] w-[112px] items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-[0_18px_34px_rgba(23,20,18,0.08)]">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${ringColor} ${degrees}deg, var(--border-soft) ${degrees}deg 360deg)`,
          }}
        />
        <div className="absolute inset-[9px] rounded-full bg-[var(--bg-page)] shadow-[inset_0_1px_6px_rgba(23,20,18,0.06)]" />
        <div className="relative text-center">
          <p className="font-heading text-[2.35rem] font-semibold leading-none text-[var(--text-main)]">
            {displayedScore}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
            /100
          </p>
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
        Ingredient Score
      </p>
      <p
        className={`mt-1 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] ${scoreLabelClasses[tone]}`}
      >
        {shortScoreLabel}
      </p>
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
  animate = false,
}: {
  badges: BadgeDescriptor[];
  className?: string;
  animate?: boolean;
}) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {badges.map((badge, index) => (
        <AnimatedIssueBadge
          key={`${badge.color}-${badge.count ?? badge.label ?? "badge"}-${index}`}
          badge={badge}
          animate={animate}
        />
      ))}
    </div>
  );
}

function AnimatedIssueBadge({
  badge,
  animate,
}: {
  badge: BadgeDescriptor;
  animate: boolean;
}) {
  const displayedCount = useCountUp(
    badge.count ?? 0,
    animate && badge.count !== undefined,
    580,
  );

  return (
    <IssueBadge
      color={badge.color}
      count={badge.count === undefined ? undefined : displayedCount}
      label={badge.label}
    />
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

function getWhatThisMeansForYou(args: {
  categoryId?: string;
  tone: "green" | "yellow" | "red";
  reason?: string;
  title?: string;
  message?: string;
  action?: string;
  redReasonType?: string;
  matchedItemsPreview?: string[];
}) {
  const existingAction = args.action?.trim();
  if (existingAction) {
    return existingAction;
  }

  const context = [
    args.categoryId,
    args.reason,
    args.title,
    args.message,
    ...(args.matchedItemsPreview ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    args.tone === "red" &&
    args.redReasonType === "allergy_profile_match"
  ) {
    return "Do not consume it if you are allergic to the matched allergen.";
  }

  if (
    args.tone === "red" &&
    (args.redReasonType === "verified_external_signal" ||
      /active safety|active recall|confirmed contamination|confirmed safety|personal allergen|your allergen/.test(
        context,
      ))
  ) {
    return "Do not consume this product.";
  }

  if (args.tone === "red") {
    if (args.redReasonType === "count_overload") {
      return "You may want to limit how often you consume this product.";
    }

    return "Avoid this product.";
  }

  if (args.tone === "yellow") {
    if (
      /bioengineered|gmo|genetic|cell-grown|cell grown|cell-cultured|cultivated|precision-fermented|fermentation-derived|molecular farming|plant-made|biotechnology/.test(
        context,
      )
    ) {
      return "You may want to avoid this if you prefer food that is not genetically modified, cell-grown, or made using biotechnology.";
    }

    if (
      /processed|processing|reconstructed|isolated|textured|modified|imitation|ultra|preservative|additive|fried|oil|emulsifier|stabilizer|stabiliser|binder|filler|flavor|flavour|concentrate|powder|structured/.test(
        context,
      )
    ) {
      return "You may want to limit or avoid this if you prefer simpler, less processed food.";
    }

    return "Review this finding in context with the full label before deciding how often to consume it.";
  }

  return "Keep this in context with the full product label.";
}

function getWhyRedExplanation(redReasonType?: string) {
  switch (redReasonType) {
    case "allergy_profile_match":
      return "This red warning is immediate because the product matches your allergy Watch List.";
    case "verified_external_signal":
      return "This red warning is immediate because an official or verified external safety signal was found.";
    case "banned_restricted":
      return "This red warning is serious because the ingredient is banned, restricted, revoked, or not permitted in at least one region.";
    case "direct_red_ingredient":
      return "This red warning is serious because a directly flagged ingredient was detected.";
    case "count_overload":
      return "This red warning comes from too many moderate findings in the same category. It is an overload warning, not automatically a ban.";
    case "long_ingredient_list":
      return "This red warning comes from a very long ingredient list crossing Truthlabel's ingredient-count threshold.";
    case "high_processed_share":
      return "This red warning comes from a high processed/artificial share in the ingredient list.";
    case "category_combo_trigger":
      return "This red warning comes from a category-specific combination of concern signals.";
    default:
      return "This red warning means Truthlabel found a serious concern or a category threshold was crossed.";
  }
}

function buildCategoryDetail(args: {
  categoryId?: string;
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
    {
      label: "Action",
      text: getWhatThisMeansForYou({
        categoryId: args.categoryId,
        tone: args.tone,
        message: args.shortMessage,
        redReasonType: args.redReasonType,
        matchedItemsPreview: args.matchedItemsPreview,
      }),
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
      label: "Why this is red",
      text: getWhyRedExplanation(args.redReasonType),
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
        label: "Action",
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
  return scanResult.finalVerdict.opening;
}

function formatFinalReasonCount(reason: ScanResult["finalVerdict"]["mainReasons"][number]) {
  const count = reason.matchedItems.length;

  return count > 0 ? ` (${count})` : "";
}

function getFinalReasonPrimaryItem(
  reason: ScanResult["finalVerdict"]["mainReasons"][number],
) {
  return reason.matchedItems[0]?.trim();
}

function getFinalWarningReasonLabel(reason: ScanResult["finalVerdict"]["mainReasons"][number]) {
  const primaryItem = getFinalReasonPrimaryItem(reason);
  const countLabel = formatFinalReasonCount(reason);

  if (reason.reasonType === "allergy_profile_match") {
    return primaryItem
      ? `${primaryItem} matches your allergy profile`
      : "A listed allergen matches your allergy profile";
  }

  if (reason.reasonType === "banned_restricted") {
    return primaryItem
      ? `${primaryItem} is banned, restricted, or not permitted in at least one region`
      : "Banned, restricted, or not-permitted ingredient found";
  }

  if (reason.reasonType === "verified_external_signal") {
    return "Official safety or recall signal found";
  }

  if (reason.reasonType === "count_overload") {
    const overloadLabels: Record<string, string> = {
      additives_and_preservatives: `High additive/preservative load${countLabel}`,
      artificial_colours: `Multiple artificial colours found${countLabel}`,
      artificial_engineered_food_construction: `High engineered-food load${countLabel}`,
      artificial_sweeteners_sugar_substitutes: `Multiple sweeteners or sugar substitutes found${countLabel}`,
      emulsifiers_stabilisers_thickeners_gums: `High texture-additive load${countLabel}`,
      flavour_enhancers_flavourings: `High flavour-system load${countLabel}`,
      fry_oil_fast_food_oil: `High frying-oil processing load${countLabel}`,
      harmful_additives: `High additive concern load${countLabel}`,
      meat_specific_concerns: `High meat or seafood processing-marker load${countLabel}`,
      preservatives_shelf_life_systems: `High preservative load${countLabel}`,
      seed_oils_processed_oils: `Multiple processed oils or fats found${countLabel}`,
      ultra_processed_indicators: `Very high ultra-processing marker load${countLabel}`,
      unknown_review: `Multiple unclear label terms found${countLabel}`,
    };

    return overloadLabels[reason.categoryId] ?? `High concern load${countLabel}`;
  }

  if (reason.reasonType === "long_ingredient_list") {
    return "Very long ingredient list";
  }

  if (reason.reasonType === "high_processed_share") {
    return "High processed ingredient share";
  }

  if (reason.reasonType === "category_combo_trigger") {
    return `Combined issue pattern found in ${reason.categoryName}`;
  }

  if (reason.reasonType === "direct_red_ingredient") {
    return primaryItem
      ? `${primaryItem} has a serious red flag`
      : "A serious red-flag ingredient was found";
  }

  if (reason.categoryId === "cancer_linked_watch") {
    return primaryItem
      ? `Cancer-linked review signal: ${primaryItem}`
      : "Cancer-linked review signal found";
  }

  if (reason.categoryId === "ultra_processed_indicators") {
    return `Ultra-processed markers found${countLabel}`;
  }

  if (reason.categoryId === "unknown_review") {
    return `Low-transparency label terms found${countLabel}`;
  }

  if (reason.categoryId === "preservatives_shelf_life_systems") {
    return primaryItem
      ? `Preservative or shelf-life additive found: ${primaryItem}`
      : `Preservatives or shelf-life additives found${countLabel}`;
  }

  if (reason.categoryId === "artificial_sweeteners_sugar_substitutes") {
    return primaryItem
      ? `Sweetener system found: ${primaryItem}`
      : `Artificial or non-sugar sweeteners found${countLabel}`;
  }

  if (reason.categoryId === "artificial_colours") {
    return primaryItem
      ? `Artificial colour found: ${primaryItem}`
      : `Artificial colours found${countLabel}`;
  }

  if (reason.categoryId === "seed_oils_processed_oils") {
    return primaryItem
      ? `Processed oil found: ${primaryItem}`
      : `Processed oils found${countLabel}`;
  }

  if (reason.categoryId === "hydrogenated_partially_hydrogenated_oils") {
    return primaryItem
      ? `Hydrogenated or partially hydrogenated fat found: ${primaryItem}`
      : "Hydrogenated or partially hydrogenated fat found";
  }

  if (reason.categoryId === "artificial_engineered_food_construction") {
    return primaryItem
      ? `Engineered-food marker found: ${primaryItem}`
      : `Engineered-food markers found${countLabel}`;
  }

  if (reason.categoryId === "meat_specific_concerns") {
    return primaryItem
      ? `Meat or seafood processing marker found: ${primaryItem}`
      : `Meat or seafood processing markers found${countLabel}`;
  }

  if (reason.categoryId === "fry_oil_fast_food_oil") {
    return primaryItem
      ? `Frying-oil marker found: ${primaryItem}`
      : `Frying-oil markers found${countLabel}`;
  }

  if (reason.categoryId === "heavy_metals") {
    return "Heavy-metal review or warning signal found";
  }

  if (reason.categoryId === "microplastics") {
    return "Microplastic review or warning signal found";
  }

  if (reason.categoryId === "natural_vs_processed") {
    return "High processed/artificial ingredient share";
  }

  if (reason.categoryId === "total_ingredients") {
    return "Ingredient list is unusually long";
  }

  return primaryItem
    ? `${reason.categoryName}: ${primaryItem}`
    : reason.message || reason.categoryName;
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
  return scanResult.finalVerdict.summary;
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
  animate,
  index,
}: {
  item: ScanResultOverviewRow;
  animate: boolean;
  index: number;
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
      className={`grid min-h-[48px] w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-2.5 ${
        animate ? "truthlabel-category-enter" : ""
      }`}
      style={animate ? getRevealStyle(index) : undefined}
    >
      <RowIcon tone={tone} categoryId={item.categoryId} />
      <div className="min-w-0">
        <p className="truncate text-[15px] font-medium text-[var(--text-main)]">
          {item.label}
        </p>
      </div>
      <IssueBadgeStack
        badges={badges}
        className="justify-self-end"
        animate={animate}
      />
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

function formatReasonPhrase(value: string) {
  const normalized = value.trim().replace(/_/g, " ").replace(/\s+/g, " ");

  if (!normalized) {
    return "";
  }

  return normalized.charAt(0).toLowerCase() + normalized.slice(1);
}

function getDeepCheckReasonStatement(item: ScanResultDeepExposureCheck) {
  const title = item.title.trim();
  const reason = formatReasonPhrase(item.reason);

  if (!reason || title.toLowerCase().includes(reason.toLowerCase())) {
    return title;
  }

  return `${title}: ${reason}`;
}

function DeepCheckRow({
  item,
  isExpanded,
  onToggle,
  animate,
  index,
}: {
  item: ScanResultDeepExposureCheck;
  isExpanded: boolean;
  onToggle: (categoryId: string) => void;
  animate: boolean;
  index: number;
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
  const reasonStatement = getDeepCheckReasonStatement(item);
  const whatThisMeansForYou = getWhatThisMeansForYou({
    categoryId: item.categoryId,
    tone: item.severity ?? "green",
    reason: item.reason,
    title: item.title,
    message: item.message,
    action: item.action,
    redReasonType: item.redReasonType,
    matchedItemsPreview: item.matchedItemsPreview,
  });

  return (
    <div
      className={animate ? "truthlabel-category-enter" : ""}
      style={animate ? getRevealStyle(index) : undefined}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={detailId}
        onClick={() => onToggle(item.categoryId)}
        className={`grid min-h-[52px] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 py-3 text-left transition-colors active:bg-[var(--bg-soft)] ${
          animate && tone === "red"
            ? "truthlabel-pulse-red"
            : animate && tone === "yellow"
              ? "truthlabel-pulse-yellow"
              : ""
        }`}
      >
        <div>
          <RowIcon tone={tone} categoryId={item.categoryId} />
        </div>
        <div className="min-w-0">
          <span className="block truncate text-[15px] font-medium text-[var(--text-main)]">
            {item.label}
          </span>
        </div>
        <IssueBadgeStack
          badges={badges}
          className="justify-self-end"
          animate={animate}
        />
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
            className={`relative overflow-hidden rounded-[18px] border px-3 py-3 shadow-[0_12px_22px_rgba(23,20,18,0.055)] ${deepDetailCardClasses[tone]}`}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${deepDetailAccentClasses[tone]}`}
            />
            <div className="pl-1.5">
              {isBannedRestrictedRow && matchedItems.length > 0 ? (
                <div className="mb-2.5 rounded-[14px] border border-[var(--red-border)] bg-white/72 px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--red-dark)]">
                    Flagged banned/restricted item
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {matchedItems.map((matchedItem) => (
                      <span
                        key={`${item.categoryId}-flagged-${matchedItem}`}
                        className="rounded-full border border-[var(--red-border)] bg-[var(--red-main)] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_8px_16px_rgba(200,30,30,0.14)]"
                      >
                        {matchedItem}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[15px] border border-white/70 bg-white/70 px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <div className={`rounded-[13px] border px-2.5 py-2 ${chipToneClasses[tone]}`}>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] opacity-80">
                    Reason
                  </p>
                  <p className="mt-1 text-[12px] font-semibold leading-5">
                    {reasonStatement}
                  </p>
                </div>
                <p className="mt-2 text-[12px] leading-[1.45] text-[var(--text-main)]">
                  {item.message}
                </p>
                <p className="mt-1.5 rounded-[12px] border border-[var(--border-soft)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-[12px] leading-[1.45] text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-main)]">
                    Action:{" "}
                  </span>
                  {whatThisMeansForYou}
                </p>
              </div>

              <div className="mt-2.5 rounded-[14px] border border-white/70 bg-white/62 px-2.5 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--text-secondary)]">
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
  freshResult = false,
  historyScanId,
  manualScanKey,
}: {
  barcodeScanKey?: string;
  category?: string;
  demoProductId?: string;
  freshResult?: boolean;
  historyScanId?: string;
  manualScanKey?: string;
}) {
  const router = useRouter();
  const { user } = useTruthlabelAuth();
  const userSettings = useUserSettings();
  const [saved, setSaved] = useState(false);
  const [historyRecord, setHistoryRecord] = useState<ScanHistoryRecord | null>(
    null,
  );
  const [historyStatus, setHistoryStatus] = useState<
    "idle" | "loading" | "loaded" | "not_found" | "error"
  >(historyScanId ? "loading" : "idle");
  const [historyActionError, setHistoryActionError] = useState("");
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [isDeepChecksExpanded, setIsDeepChecksExpanded] = useState(false);
  const [expandedDeepCheckId, setExpandedDeepCheckId] = useState<string | null>(
    null,
  );
  const [activeDetail, setActiveDetail] = useState<ResultDetail | null>(null);
  const ingredientSectionRef = useRef<HTMLElement | null>(null);
  const trackedResultRef = useRef("");
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
  const historyScanResult = historyRecord?.resultSnapshot.scanResult ?? null;
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
  const scanResult =
    historyScanResult ?? barcodeScanResult ?? manualScanResult ?? fallbackScanResult;

  useEffect(() => {
    if (!historyScanId) {
      return;
    }

    let active = true;

    void Promise.resolve()
      .then(() => {
        if (!active) {
          return null;
        }

        setHistoryStatus("loading");
        setHistoryActionError("");
        return getScanHistoryRecord(historyScanId);
      })
      .then((record) => {
        if (!active) {
          return;
        }

        setHistoryRecord(record);
        setHistoryStatus(record ? "loaded" : "not_found");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setHistoryRecord(null);
        setHistoryStatus("error");
      });

    return () => {
      active = false;
    };
  }, [historyScanId]);

  const prefersReducedMotion = usePrefersReducedMotion();
  const resultMotionKey = buildResultMotionKey({
    barcodeScanKey,
    manualScanKey,
    historyScanId,
    demoProductId,
    category,
    latestBarcodeSavedAt: latestBarcodeScan?.savedAt,
    latestManualSavedAt: latestManualScan?.savedAt,
    historyScannedAt: historyRecord?.scannedAt,
    scanResult,
  });
  useEffect(() => {
    if (historyScanId && historyStatus === "loading") {
      return;
    }

    if (trackedResultRef.current === resultMotionKey) {
      return;
    }

    trackedResultRef.current = resultMotionKey;
    trackTruthlabelEvent(
      "result_page_loaded",
      {
        result_source: historyScanId
          ? "history"
          : barcodeScanKey
            ? "barcode"
            : manualScanKey
              ? "manual"
              : demoProductId || category
                ? "demo"
                : "fallback_demo",
        fresh_result: freshResult,
        history_status: historyStatus,
        ...buildScanResultAnalytics(scanResult),
      },
      { userId: user?.id },
    );
  }, [
    barcodeScanKey,
    category,
    demoProductId,
    freshResult,
    historyScanId,
    historyStatus,
    manualScanKey,
    resultMotionKey,
    scanResult,
    user?.id,
  ]);
  const freshMotionEnabled = useFreshResultMotion(resultMotionKey, freshResult);
  const shouldAnimateFreshResult = freshMotionEnabled && !prefersReducedMotion;

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

    return [...withRequiredRows]
      .filter(
        (row) =>
          row.categoryId !== "allergy_risk" ||
          savedAllergyProfile.length > 0 ||
          row.severity !== "green",
      )
      .sort((left, right) => left.sortOrder - right.sortOrder);
  }, [savedAllergyProfile.length, scanResult.quickOverview]);

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
  const hasProductHeroImage = Boolean(scanResult.productHero.imageUrl);
  const doneHref =
    historyScanId
      ? "/app/history"
      : scanResult.productHero.scanSource === "manual_paste" ||
          scanResult.productHero.scanSource === "barcode"
      ? "/app/manual"
      : "/app";
  const feedbackIngredientText =
    historyRecord?.resultSnapshot.ingredientsText ??
    latestManualScan?.input.ingredientText ??
    latestBarcodeScan?.productData.ingredientText ??
    "";

  async function handleDeleteHistoryScan() {
    if (!historyScanId) {
      return;
    }

    setHistoryActionError("");

    try {
      await deleteScanHistoryRecord(historyScanId);
      router.push("/app/history");
    } catch {
      setHistoryActionError("We couldn't delete this saved scan.");
    }
  }

  if (historyScanId && historyStatus === "loading") {
    return (
      <ResultStateView
        title="Opening saved scan"
        message="Loading the saved scan snapshot from your history."
      />
    );
  }

  if (historyScanId && historyStatus === "not_found") {
    return (
      <ResultStateView
        title="Saved scan not found"
        message="We could not find that saved scan in this account."
        primaryHref="/app/history"
        primaryLabel="Open history"
        secondaryHref="/app/manual"
        secondaryLabel="Start a new scan"
      />
    );
  }

  if (historyScanId && historyStatus === "error") {
    return (
      <ResultStateView
        title="History unavailable"
        message="We couldn't load this saved scan. Try again, or start a new scan."
        primaryHref="/app/history"
        primaryLabel="Open history"
        secondaryHref="/app/manual"
        secondaryLabel="Start a new scan"
      />
    );
  }

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
        primaryHref="/app/manual"
        primaryLabel="Open scan page"
        secondaryHref="/app/results"
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
        primaryHref="/app/manual"
        primaryLabel="Open manual scan"
        secondaryHref="/app/results"
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
            {historyScanId ? (
              <button
                type="button"
                onClick={() => void handleDeleteHistoryScan()}
                className="justify-self-end rounded-full border border-[var(--red-border)] bg-[var(--red-bg)] px-3 py-2 text-[12px] font-bold text-[var(--red-dark)] transition-colors"
              >
                Delete
              </button>
            ) : (
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
            )}
          </header>

          <BrandMark />

          {historyRecord ? (
            <section className="mt-4 rounded-[22px] border border-[#D7E7DD] bg-[#F6FBF8] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0E5A3F]">
                Saved scan
              </p>
              <p className="mt-1 text-[13px] leading-5 text-[#4F5D56]">
                Scanned {formatFullScanDate(historyRecord.scannedAt)}.
              </p>
              <p className="mt-2 text-[12px] leading-5 text-[#66716B]">
                This is the original saved snapshot. Truthlabel will not silently recalculate it.
              </p>
              {historyActionError ? (
                <p className="mt-2 text-[12px] font-bold text-[var(--red-dark)]">
                  {historyActionError}
                </p>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/app/manual"
                  className="flex min-h-10 items-center justify-center rounded-full border border-[#D7E7DD] bg-white px-3 text-center text-[12px] font-extrabold text-[#0E5A3F]"
                >
                  Scan again
                </Link>
                <Link
                  href="/app/manual"
                  className="flex min-h-10 items-center justify-center rounded-full bg-[#0E5A3F] px-3 text-center text-[12px] font-extrabold text-white"
                >
                  Check for updated information
                </Link>
              </div>
            </section>
          ) : null}

          <section
            className={`mt-6 ${shouldAnimateFreshResult ? "truthlabel-reveal" : ""}`}
            style={shouldAnimateFreshResult ? getRevealStyle(0) : undefined}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-4">
              {hasProductHeroImage ? (
                <div className="col-span-2">
                  <ProductVisual
                    productName={scanResult.productHero.productName}
                    scanSource={scanResult.productHero.scanSource}
                    imageUrl={scanResult.productHero.imageUrl ?? ""}
                    imageSource={scanResult.productHero.imageSource}
                    variant="wide"
                  />
                </div>
              ) : null}

              <div className="min-w-0">
                {!hasProductHeroImage ? (
                  <ProductVisual
                    productName={scanResult.productHero.productName}
                    scanSource={scanResult.productHero.scanSource}
                    imageUrl={scanResult.productHero.imageUrl ?? ""}
                    imageSource={scanResult.productHero.imageSource}
                  />
                ) : null}
                <h2
                  className={`font-heading text-[1.34rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-[var(--text-main)] ${
                    hasProductHeroImage ? "" : "mt-4"
                  }`}
                >
                  {scanResult.productHero.productName}
                </h2>
                <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                  Brand name: {scanResult.productHero.brandName}
                </p>
              </div>
              <ScoreRing
                score={scanResult.ingredientLoad.score}
                scoreLabel={scanResult.ingredientLoad.level}
                tone={scanResult.ingredientLoad.tone}
                animate={shouldAnimateFreshResult}
              />
            </div>
          </section>

          <section
            className={`mt-6 border-t border-[var(--border-soft)] pt-5 ${
              shouldAnimateFreshResult ? "truthlabel-reveal" : ""
            }`}
            style={shouldAnimateFreshResult ? getRevealStyle(4) : undefined}
          >
            <SectionHeading
              title="Closer look"
              subtitle="A clean checklist of what Truthlabel found on this product."
            />
            <div className="mt-3 divide-y divide-[var(--border-soft)]">
              {overviewRows.map((item, index) => (
                <OverviewRow
                  key={item.categoryId}
                  item={item}
                  animate={shouldAnimateFreshResult}
                  index={index}
                />
              ))}
            </div>
          </section>

          <section
            className={`mt-6 border-t border-[var(--border-soft)] pt-5 ${
              shouldAnimateFreshResult ? "truthlabel-reveal" : ""
            }`}
            style={shouldAnimateFreshResult ? getRevealStyle(5) : undefined}
          >
            <SectionHeading
              title="Flagged items"
              subtitle="Deep analysis of yellow and red findings."
              extra={
                <IssueBadgeStack
                  badges={deepCheckSectionBadges}
                  animate={shouldAnimateFreshResult}
                />
              }
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
                    {deepCheckRows.map((item, index) => (
                      <DeepCheckRow
                        key={item.categoryId}
                        item={item}
                        isExpanded={expandedDeepCheckId === item.categoryId}
                        animate={shouldAnimateFreshResult}
                        index={index}
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
            className={`mt-6 border-t border-[var(--border-soft)] pt-5 ${
              shouldAnimateFreshResult ? "truthlabel-reveal" : ""
            }`}
            style={shouldAnimateFreshResult ? getRevealStyle(7) : undefined}
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
                            <IssueBadgeStack
                              badges={getIngredientGroupBadges(group)}
                              animate={shouldAnimateFreshResult}
                            />
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

          <section
            className={`mt-6 border-t border-[var(--border-soft)] pt-5 ${
              shouldAnimateFreshResult ? "truthlabel-reveal" : ""
            }`}
            style={shouldAnimateFreshResult ? getRevealStyle(2) : undefined}
          >
            <SectionHeading
              title="Final Verdict"
            />
            <div
              className={`mt-3 rounded-[24px] border px-4 py-4 ${finalVerdictCardClasses[scanResult.finalVerdict.verdictTone]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    Ingredient Score
                  </p>
                  <h3 className="mt-1 font-heading text-[1.45rem] font-semibold leading-none text-[var(--text-main)]">
                    {scanResult.ingredientLoad.score} / 100
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
                    {scanResult.ingredientLoad.score} / 100 • {scanResult.ingredientLoad.level}
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
                            categoryId: reason.categoryId,
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
