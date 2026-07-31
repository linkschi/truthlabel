"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { publicAppConfig } from "@/lib/appConfig";
import { trackTruthlabelEvent } from "@/lib/analytics/analyticsClient";
import { hasMvpActivationAccess } from "@/lib/auth/mvpActivationAccess";
import { getSupabaseBrowserClient } from "@/lib/auth/supabaseClient";
import {
  isThiislincornOnboardingTestAccount,
  markThiislincornOnboardingReplaySeen,
} from "@/lib/onboarding/onboardingTestMode";
import {
  completeOnboarding,
  loadOnboardingState,
  saveOnboardingState,
  startOnboarding,
  type OnboardingAppInstallStatus,
  type OnboardingInstallPromptOutcome,
  type TruthlabelOnboardingState,
} from "@/lib/onboarding/truthlabelOnboardingState";
import {
  getUserSettings,
  updateAllergyProfile,
} from "@/lib/userSettings/userSettingsStorage";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

type AllergyChip = {
  id: string;
  label: string;
  values: string[];
};

type SetupTaskStatus = "complete" | "active" | "waiting" | "warning";
type InstallDeviceKind =
  | "android_prompt"
  | "android_fallback"
  | "iphone_safari"
  | "iphone_other"
  | "desktop"
  | "installed";

const totalSteps = 4;
const setupTaskCount = 5;
const countSequence = ["0", "500K", "1.4M", "2.6M", "3.8M", "4.3M+"];

const primaryAllergenChips: AllergyChip[] = [
  { id: "milk", label: "Milk", values: ["milk"] },
  { id: "peanut", label: "Peanuts", values: ["peanut"] },
  { id: "tree_nuts", label: "Tree nuts", values: ["tree nuts"] },
  { id: "egg", label: "Eggs", values: ["egg"] },
  { id: "wheat_gluten", label: "Wheat / gluten", values: ["wheat", "gluten"] },
  { id: "soy", label: "Soy", values: ["soy"] },
  { id: "fish", label: "Fish", values: ["fish"] },
  {
    id: "shellfish",
    label: "Shellfish",
    values: ["crustacean shellfish"],
  },
  { id: "sesame", label: "Sesame", values: ["sesame"] },
];

const expandedAllergenChips: AllergyChip[] = [
  { id: "celery", label: "Celery", values: ["celery"] },
  { id: "mustard", label: "Mustard", values: ["mustard"] },
  { id: "lupin", label: "Lupin", values: ["lupin"] },
  { id: "molluscs", label: "Molluscs", values: ["molluscs"] },
  { id: "sulphites", label: "Sulphites", values: ["sulphites"] },
];

const demoFindings = [
  {
    tone: "red",
    label: "Red - Banned",
    title: "Red No. 3 detected",
    message:
      "This color is no longer authorized for food use in some supported regions.",
  },
  {
    tone: "yellow",
    label: "Yellow - Additive load",
    title: "Several additive concerns found",
    message: "Several moderate additive concerns were found.",
  },
  {
    tone: "yellow",
    label: "Yellow - Ultra-processing",
    title: "Processing markers detected",
    message: "Truthlabel found markers of a more heavily processed formula.",
  },
] as const;

function uniqueStrings(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = value?.trim();

    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

function toggleChipValues(currentValues: string[], chip: AllergyChip) {
  const selected = chip.values.some((value) => currentValues.includes(value));

  if (selected) {
    return currentValues.filter((value) => !chip.values.includes(value));
  }

  return uniqueStrings([...currentValues, ...chip.values]);
}

function chipSelected(values: string[], chip: AllergyChip) {
  return chip.values.some((value) => values.includes(value));
}

function parseCustomItems(value: string) {
  return uniqueStrings(
    value
      .split(/[,\n]/)
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

function getInitialPrefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    getInitialPrefersReducedMotion,
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as NavigatorWithStandalone).standalone)
  );
}

function isAppleMobileDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const touchMac =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return /iPad|iPhone|iPod/i.test(navigator.userAgent) || touchMac;
}

function isAndroidDevice() {
  return (
    typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)
  );
}

function isSafariBrowser() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;

  return /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(userAgent);
}

function getInstallDeviceKind(
  deferredPrompt: BeforeInstallPromptEvent | null,
): InstallDeviceKind {
  if (isStandaloneMode()) {
    return "installed";
  }

  if (isAppleMobileDevice()) {
    return isSafariBrowser() ? "iphone_safari" : "iphone_other";
  }

  if (isAndroidDevice()) {
    return deferredPrompt ? "android_prompt" : "android_fallback";
  }

  return "desktop";
}

function ProgressRing({
  value,
  size = 36,
  stroke = 4,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clampedValue / 100);

  return (
    <span className="relative inline-flex items-center justify-center" aria-label={label}>
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#D7E7DD"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0E5A3F"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={stroke}
          className="transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute text-[9px] font-black text-[#0E5A3F]">
        {Math.round(clampedValue)}
      </span>
    </span>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m5 12.5 4.2 4.2L19 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-4 w-4 animate-spin rounded-full border-2 border-[#BFDCCB] border-t-[#0E5A3F] motion-reduce:animate-none ${className}`}
    />
  );
}

function OnboardingShell({
  step,
  children,
  onBack,
}: {
  step: number;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <main className="min-h-screen bg-[#FBFDFB] px-5 py-[calc(16px+env(safe-area-inset-top))] text-[#101613] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-32px)] w-full max-w-[480px] flex-col">
        <header className="flex min-h-11 items-center justify-between gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 items-center rounded-full border border-[#D7E7DD] bg-white px-3 text-[12px] font-bold text-[#0E5A3F] outline-none transition focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Back
            </button>
          ) : (
            <span className="h-10 w-[64px]" />
          )}
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#66716B]">
            Step {step} of {totalSteps}
          </p>
          <ProgressRing
            value={progress}
            label={`Onboarding progress ${progress}%`}
          />
        </header>
        {children}
      </div>
    </main>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-[54px] w-full rounded-[16px] bg-[#0E5A3F] px-5 text-[15px] font-extrabold text-white shadow-[0_14px_30px_rgba(14,90,63,0.16)] outline-none transition hover:bg-[#0B4732] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function TextButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto mt-3 block min-h-11 px-3 text-[13px] font-bold text-[#66716B] underline-offset-4 outline-none transition hover:text-[#0E5A3F] focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
    >
      {children}
    </button>
  );
}

function DemoScoreRing({ score }: { score: number }) {
  return (
    <div className="relative inline-flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white shadow-[0_12px_28px_rgba(15,40,28,0.08)]">
      <ProgressRing value={score} size={76} stroke={8} label={`Demo score ${score} out of 100`} />
      <span className="absolute text-center">
        <span className="block text-[18px] font-black text-[#101613]">
          {score}
        </span>
        <span className="block text-[9px] font-black uppercase tracking-[0.1em] text-[#66716B]">
          /100
        </span>
      </span>
    </div>
  );
}

function DemoFindingCard({
  finding,
}: {
  finding: (typeof demoFindings)[number];
}) {
  const isRed = finding.tone === "red";

  return (
    <article
      className={`rounded-[18px] border px-3.5 py-3 ${
        isRed
          ? "border-[#F3D2D4] bg-[#FFF6F6]"
          : "border-[#F1DDAD] bg-[#FFFBEC]"
      }`}
    >
      <p
        className={`text-[10px] font-black uppercase tracking-[0.14em] ${
          isRed ? "text-[#A33A3F]" : "text-[#8A6500]"
        }`}
      >
        {finding.label}
      </p>
      <h3 className="mt-1 text-[14px] font-black text-[#101613]">
        {finding.title}
      </h3>
      <p className="mt-1 text-[12.5px] leading-5 text-[#66716B]">
        {finding.message}
      </p>
    </article>
  );
}

function StepOneDemo({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState(prefersReducedMotion ? 6 : 0);
  const finalScore = 38;
  const score = phase >= 2 ? finalScore : 0;
  const visibleFindings = phase >= 5 ? 3 : phase >= 4 ? 2 : phase >= 3 ? 1 : 0;
  const importantResultVisible = phase >= 3;

  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = window.setTimeout(() => setPhase(6), 0);
      return () => window.clearTimeout(timer);
    }

    const timers = [450, 950, 1500, 2050, 2650, 3300].map((delayMs, index) =>
      window.setTimeout(() => setPhase(index + 1), delayMs),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [prefersReducedMotion]);

  useEffect(() => {
    trackTruthlabelEvent("demo_viewed", { onboarding_step: 1 });
  }, []);

  return (
    <section className="flex flex-1 flex-col py-6">
      <div>
        <h1 className="text-[30px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
          See what deserves your attention
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-[#66716B]">
          Truthlabel brings the most important findings forward and explains why
          they matter.
        </p>
      </div>

      <div className="mt-6 rounded-[30px] border border-[#D7E7DD] bg-white p-4 shadow-[0_18px_48px_rgba(15,40,28,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/onboarding-chocolate-cereal.svg"
              alt="Example chocolate cereal box"
              width={72}
              height={72}
              priority
              className="h-[72px] w-[72px] rounded-[22px] border border-[#F1DDAD] bg-[#FFF8D7] object-cover"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8A6500]">
                Example scan
              </p>
              <h2 className="mt-1 text-[18px] font-black leading-tight text-[#101613]">
                Example Chocolate Cereal
              </h2>
              <p
                className="mt-1 text-[12.5px] font-bold text-[#66716B]"
                aria-live="polite"
              >
                {phase < 2 ? "Checking ingredients..." : "Findings ready"}
              </p>
            </div>
          </div>
          <DemoScoreRing score={score} />
        </div>

        <div className="mt-4 grid gap-2.5" aria-live="polite">
          {demoFindings.slice(0, visibleFindings).map((finding) => (
            <DemoFindingCard key={finding.title} finding={finding} />
          ))}
        </div>

        {phase >= 6 ? (
          <div className="mt-4 rounded-[22px] border border-[#F3D2D4] bg-[#FFF6F6] px-4 py-4">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#A33A3F]">
              Final verdict
            </p>
            <p className="mt-1 text-[22px] font-black tracking-[-0.03em] text-[#101613]">
              Recommended to avoid
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-auto pt-6">
        <PrimaryButton onClick={onContinue} disabled={!importantResultVisible}>
          Continue
        </PrimaryButton>
        <TextButton onClick={onSkip}>Skip demonstration</TextButton>
      </div>
    </section>
  );
}

function StepTwoAllergies({
  selectedAllergens,
  customInput,
  saving,
  saveError,
  onSelectedAllergensChange,
  onCustomInputChange,
  onSave,
  onNoAllergens,
}: {
  selectedAllergens: string[];
  customInput: string;
  saving: boolean;
  saveError: string;
  onSelectedAllergensChange: (values: string[]) => void;
  onCustomInputChange: (value: string) => void;
  onSave: () => void;
  onNoAllergens: () => void;
}) {
  const [showAllAllergens, setShowAllAllergens] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(Boolean(customInput));
  const visibleChips = showAllAllergens
    ? [...primaryAllergenChips, ...expandedAllergenChips]
    : primaryAllergenChips;

  return (
    <section className="flex flex-1 flex-col py-6">
      <div>
        <h1 className="text-[30px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
          Which allergens should we watch for?
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-[#66716B]">
          We&apos;ll bring selected allergens forward as personal warnings when
          they are found.
        </p>
      </div>

      <fieldset className="mt-6">
        <legend className="sr-only">Select allergens for Truthlabel to watch</legend>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {visibleChips.map((chip) => {
            const selected = chipSelected(selectedAllergens, chip);

            return (
              <label
                key={chip.id}
                className={`flex min-h-12 cursor-pointer items-center justify-center gap-1.5 rounded-[16px] border px-2.5 text-center text-[13px] font-extrabold transition ${
                  selected
                    ? "border-[#0E5A3F] bg-[#0E5A3F] text-white shadow-[0_10px_22px_rgba(14,90,63,0.16)]"
                    : "border-[#D7E7DD] bg-white text-[#101613] hover:bg-[#F3FAF6]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onSelectedAllergensChange(
                      toggleChipValues(selectedAllergens, chip),
                    )
                  }
                  className="sr-only"
                />
                {selected ? <CheckIcon /> : null}
                <span>{chip.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={() => setShowAllAllergens((current) => !current)}
        className="mt-3 min-h-11 rounded-full border border-[#D7E7DD] bg-white px-4 text-[13px] font-bold text-[#0E5A3F] outline-none transition focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99]"
      >
        {showAllAllergens ? "Show fewer allergens" : "Show all allergens"}
      </button>

      <button
        type="button"
        onClick={() => setShowCustomInput((current) => !current)}
        className="mt-2 min-h-11 rounded-full border border-[#D7E7DD] bg-[#F3FAF6] px-4 text-[13px] font-bold text-[#0E5A3F] outline-none transition focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99]"
      >
        + Add a custom Watch List item
      </button>

      {showCustomInput ? (
        <label className="mt-3 block">
          <span className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#66716B]">
            Custom Watch List
          </span>
          <textarea
            value={customInput}
            onChange={(event) => onCustomInputChange(event.target.value)}
            placeholder="Add custom items separated by commas or new lines."
            className="mt-2 min-h-[92px] w-full rounded-[18px] border border-[#D7E7DD] bg-white px-4 py-3 text-[14px] text-[#101613] outline-none transition placeholder:text-[#8A928D] focus:border-[#0E5A3F] focus:ring-2 focus:ring-[#D7E7DD]"
          />
        </label>
      ) : null}

      <p className="mt-4 rounded-[16px] border border-[#F1DDAD] bg-[#FFFBEC] px-3 py-2.5 text-[12px] font-semibold leading-5 text-[#8A6500]">
        Always confirm the original package label when managing allergies.
      </p>

      {saveError ? (
        <p
          role="alert"
          className="mt-3 rounded-[14px] border border-[#F3D2D4] bg-[#FFF6F6] px-3 py-2 text-[12px] font-semibold text-[#A33A3F]"
        >
          {saveError}
        </p>
      ) : null}

      <div className="mt-auto pt-6">
        <PrimaryButton onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save and continue"}
        </PrimaryButton>
        <TextButton onClick={onNoAllergens}>
          I don&apos;t have any selected allergens
        </TextButton>
      </div>
    </section>
  );
}

function SetupTaskRow({
  label,
  status,
}: {
  label: string;
  status: SetupTaskStatus;
}) {
  return (
    <li className="flex min-h-11 items-center gap-3 rounded-[16px] border border-[#E2E8E4] bg-white px-3 py-2.5">
      <span
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          status === "complete"
            ? "bg-[#0E5A3F] text-white"
            : status === "warning"
              ? "bg-[#FFFBEC] text-[#8A6500]"
              : "bg-[#F3FAF6] text-[#0E5A3F]"
        }`}
      >
        {status === "complete" ? (
          <CheckIcon />
        ) : status === "active" ? (
          <Spinner />
        ) : status === "warning" ? (
          "!"
        ) : (
          <span className="h-2.5 w-2.5 rounded-full border border-current" />
        )}
      </span>
      <span className="text-[13.5px] font-bold text-[#101613]">{label}</span>
    </li>
  );
}

function StepThreePreparing({
  completedTasks,
  connectionWarning,
  countLabel,
  setupComplete,
  onRetryProductData,
  onContinue,
}: {
  completedTasks: number;
  connectionWarning: string;
  countLabel: string;
  setupComplete: boolean;
  onRetryProductData: () => void;
  onContinue: () => void;
}) {
  const setupTasks = [
    "Saving your allergy settings",
    "Applying your food preferences",
    "Preparing your personal Watch List",
    "Connecting to global product data",
    "Getting your scanner ready",
  ];
  const progress = Math.round((completedTasks / setupTaskCount) * 100);

  return (
    <section className="flex flex-1 flex-col py-6">
      <div className="text-center">
        <ProgressRing
          value={progress}
          size={100}
          stroke={10}
          label={`Setup progress ${progress}%`}
        />
        <h1 className="mt-5 text-[28px] font-black leading-[1.05] tracking-[-0.04em] text-[#101613]">
          {setupComplete
            ? "Your Truthlabel setup is ready"
            : "Preparing Truthlabel for you"}
        </h1>
        <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-6 text-[#66716B]">
          {setupComplete
            ? "Your personal alerts and scanner settings have been saved."
            : "We're applying your settings and getting your scanner ready."}
        </p>
      </div>

      <ol className="mt-6 grid gap-2.5" aria-live="polite">
        {setupTasks.map((task, index) => {
          const isConnectionTask = index === 3;
          const status: SetupTaskStatus =
            index < completedTasks
              ? isConnectionTask && connectionWarning
                ? "warning"
                : "complete"
              : index === completedTasks
                ? "active"
                : "waiting";

          return <SetupTaskRow key={task} label={task} status={status} />;
        })}
      </ol>

      <div className="mt-4 rounded-[20px] border border-[#D7E7DD] bg-[#F3FAF6] px-4 py-4 text-center">
        <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#0E5A3F]">
          Connecting you to global product data
        </p>
        <p className="mt-2 text-[34px] font-black tracking-[-0.04em] text-[#101613]">
          {countLabel}
        </p>
        <p className="text-[12px] font-bold text-[#66716B]">
          food-product records
        </p>
      </div>

      {connectionWarning ? (
        <div className="mt-3 rounded-[16px] border border-[#F1DDAD] bg-[#FFFBEC] px-3 py-3">
          <p className="text-[12.5px] font-semibold leading-5 text-[#8A6500]">
            {connectionWarning}
          </p>
          <button
            type="button"
            onClick={onRetryProductData}
            className="mt-2 min-h-9 rounded-full border border-[#F1DDAD] bg-white px-3 text-[11px] font-bold text-[#8A6500]"
          >
            Retry connection
          </button>
        </div>
      ) : null}

      {setupComplete ? (
        <div className="mt-auto pt-6">
          <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
        </div>
      ) : null}
    </section>
  );
}

function InstallInstructionVisual({
  kind,
}: {
  kind: InstallDeviceKind;
}) {
  const isIphone = kind === "iphone_safari" || kind === "iphone_other";
  const steps = isIphone
    ? ["Tap Share", "Add to Home Screen", "Tap Add"]
    : ["Open menu", "Choose Install app", "Open Truthlabel"];

  return (
    <div className="mt-5 rounded-[28px] border border-[#D7E7DD] bg-white p-4 shadow-[0_12px_32px_rgba(15,40,28,0.06)]">
      <div className="mx-auto flex h-[230px] max-w-[210px] flex-col rounded-[32px] border-[8px] border-[#101613] bg-[#F3FAF6] p-3 shadow-[0_16px_36px_rgba(16,22,19,0.12)]">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-[#101613]" />
        <div className="mt-4 grid flex-1 grid-cols-3 gap-2">
          {["TL", "Mail", "Maps", "Scan", "Food", "Shop"].map((label, index) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-1 ${
                index === 3 ? "scale-105" : ""
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-[12px] text-[10px] font-black ${
                  index === 3
                    ? "bg-[#0E5A3F] text-white"
                    : "bg-white text-[#66716B]"
                }`}
              >
                {label}
              </span>
              <span className="h-1 w-8 rounded-full bg-[#D7E7DD]" />
            </div>
          ))}
        </div>
      </div>
      <ol className="mt-4 grid grid-cols-3 gap-2 text-center">
        {steps.map((step, index) => (
          <li
            key={step}
            className="rounded-[14px] border border-[#E2E8E4] bg-[#FBFDFB] px-2 py-2"
          >
            <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-[#0E5A3F] text-[11px] font-black text-white">
              {index + 1}
            </span>
            <span className="mt-1 block text-[10.5px] font-bold leading-4 text-[#66716B]">
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function getInstallCopy(kind: InstallDeviceKind) {
  switch (kind) {
    case "installed":
      return {
        title: "Truthlabel is installed",
        copy: "You can now open it directly from your Home Screen.",
        button: "Start scanning",
      };
    case "android_prompt":
      return {
        title: "Install Truthlabel",
        copy: "Add Truthlabel to your Home Screen so it opens and feels like a regular app.",
        button: "Install Truthlabel",
      };
    case "iphone_safari":
      return {
        title: "Add Truthlabel to your iPhone",
        copy: "Use Safari to place Truthlabel on your Home Screen and open it like an app.",
        button: "I've added Truthlabel",
      };
    case "iphone_other":
      return {
        title: "Open this page in Safari",
        copy: "Use Safari to add Truthlabel to your Home Screen. Other iPhone browsers may not show the right install option.",
        button: "I've added Truthlabel",
      };
    case "desktop":
      return {
        title: "Install when you open Truthlabel on your phone",
        copy: "Truthlabel works best from your phone while shopping or checking food at home.",
        button: "Continue",
      };
    case "android_fallback":
    default:
      return {
        title: "Add Truthlabel to your phone",
        copy: "Use your browser menu to install Truthlabel or add it to your Home Screen.",
        button: "I added it",
      };
  }
}

function StepFourInstall({
  deferredPrompt,
  skipVisible,
  installCompleted,
  isSaving,
  onInstallPromptUsed,
  onFinish,
  onDefer,
}: {
  deferredPrompt: BeforeInstallPromptEvent | null;
  skipVisible: boolean;
  installCompleted: boolean;
  isSaving: boolean;
  onInstallPromptUsed: (
    outcome: OnboardingInstallPromptOutcome,
    installStatus: OnboardingAppInstallStatus,
  ) => void;
  onFinish: (
    outcome: OnboardingInstallPromptOutcome,
    installStatus: OnboardingAppInstallStatus,
  ) => void;
  onDefer: () => void;
}) {
  const [promptBusy, setPromptBusy] = useState(false);
  const deviceKind = useMemo(
    () => getInstallDeviceKind(deferredPrompt),
    [deferredPrompt],
  );
  const copy = getInstallCopy(deviceKind);
  const isInstalled = deviceKind === "installed";

  async function handlePrimaryAction() {
    if (deviceKind === "android_prompt" && deferredPrompt) {
      setPromptBusy(true);
      trackTruthlabelEvent("install_prompt_shown", {
        onboarding_step: 4,
        device_kind: deviceKind,
      });

      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        const accepted = choice.outcome === "accepted";
        onInstallPromptUsed(
          accepted ? "accepted" : "dismissed",
          accepted ? "installed" : "not_installed",
        );
        trackTruthlabelEvent(
          accepted ? "install_accepted" : "install_dismissed",
          { onboarding_step: 4, device_kind: deviceKind },
        );
      } finally {
        setPromptBusy(false);
      }
      return;
    }

    if (isInstalled) {
      onFinish("already_installed", "installed");
      return;
    }

    onFinish(
      deviceKind === "desktop" ? "unsupported" : "manual_confirmed",
      deviceKind === "desktop" ? "unsupported" : "manual_confirmed",
    );
  }

  if (installCompleted) {
    return (
      <section className="flex flex-1 flex-col justify-center py-6 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#0E5A3F] text-white">
          <CheckIcon className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-[30px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
          You&apos;re ready to scan
        </h1>
        <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-6 text-[#66716B]">
          Truthlabel is set up with your personal alerts and ready whenever you
          need it.
        </p>
        <p className="mt-4 text-[12.5px] font-semibold text-[#66716B]">
          Your settings can be changed anytime from Account.
        </p>
        <div className="mt-8">
          <PrimaryButton onClick={() => onFinish("manual_confirmed", "manual_confirmed")} disabled={isSaving}>
            {isSaving ? "Opening..." : "Open Truthlabel"}
          </PrimaryButton>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col py-6">
      <div>
        <h1 className="text-[30px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
          Put Truthlabel on your Home Screen
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-[#66716B]">
          Install Truthlabel for faster access whenever you&apos;re shopping or
          checking food at home.
        </p>
      </div>

      <InstallInstructionVisual kind={deviceKind} />

      <div className="mt-5 rounded-[20px] border border-[#D7E7DD] bg-[#F3FAF6] px-4 py-4">
        <h2 className="text-[18px] font-black text-[#101613]">{copy.title}</h2>
        <p className="mt-2 text-[13.5px] leading-6 text-[#66716B]">
          {copy.copy}
        </p>
        {deviceKind === "android_fallback" ? (
          <ol className="mt-3 grid gap-2 text-[13px] font-semibold text-[#101613]">
            <li>1. Open the browser menu</li>
            <li>2. Tap &quot;Install app&quot; or &quot;Add to Home screen&quot;</li>
            <li>3. Confirm &quot;Install&quot;</li>
          </ol>
        ) : null}
        {deviceKind === "iphone_safari" ? (
          <ol className="mt-3 grid gap-2 text-[13px] font-semibold text-[#101613]">
            <li>1. Tap the Share icon</li>
            <li>2. Tap &quot;Add to Home Screen&quot;</li>
            <li>3. Enable &quot;Open as Web App&quot; when available</li>
            <li>4. Tap &quot;Add&quot;</li>
          </ol>
        ) : null}
      </div>

      <div className="mt-auto pt-6">
        <PrimaryButton onClick={handlePrimaryAction} disabled={promptBusy || isSaving}>
          {promptBusy || isSaving ? "Working..." : copy.button}
        </PrimaryButton>
        {skipVisible ? (
          <TextButton onClick={onDefer}>I&apos;ll do this later</TextButton>
        ) : null}
      </div>
    </section>
  );
}

async function saveAllergySettingsToAccount(
  userId: string,
  selectedAllergens: string[],
  customItems: string[],
) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase || !userId) {
    return;
  }

  await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      selected_allergens: uniqueStrings([...selectedAllergens, ...customItems]),
      local_settings_migrated: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

async function checkOpenFoodFactsConnection() {
  const baseUrl = publicAppConfig.openFoodFactsApiBaseUrl;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${baseUrl}/search?page_size=1&fields=code`, {
      signal: controller.signal,
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export default function TruthlabelOnboardingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessState, user } = useTruthlabelAuth();
  const prefersReducedMotion = usePrefersReducedMotion();
  const reviewMode = searchParams.get("review") === "1";
  const restartMode = reviewMode && searchParams.get("restart") === "1";
  const [isPending, startTransition] = useTransition();
  const [hasMvpAccessPass, setHasMvpAccessPass] = useState(
    () => typeof window !== "undefined" && hasMvpActivationAccess(),
  );
  const [step, setStep] = useState(1);
  const [stateLoaded, setStateLoaded] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    () => getUserSettings().allergyProfile.allergens,
  );
  const [customInput, setCustomInput] = useState(() =>
    getUserSettings().allergyProfile.customAllergens.join(", "),
  );
  const [saveError, setSaveError] = useState("");
  const [completedSetupTasks, setCompletedSetupTasks] = useState(0);
  const [connectionWarning, setConnectionWarning] = useState("");
  const [countLabel, setCountLabel] = useState("0");
  const [skipInstallVisible, setSkipInstallVisible] = useState(false);
  const [installCompleted, setInstallCompleted] = useState(false);
  const [installOutcome, setInstallOutcome] =
    useState<OnboardingInstallPromptOutcome>("manual_confirmed");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const trackedStartRef = useRef(false);
  const setupStartedRef = useRef(false);
  const restartAppliedRef = useRef(false);
  const installStatusRef =
    useRef<OnboardingAppInstallStatus>("manual_confirmed");
  const userId = user?.id ?? "";
  const hasEffectiveAppAccess =
    accessState === "active" ||
    publicAppConfig.flags.enableLocalDevBypass ||
    hasMvpAccessPass;

  const goToStep = useCallback(
    async (nextStep: number) => {
      const normalizedStep = Math.max(1, Math.min(4, nextStep));
      setStep(normalizedStep);

      if (userId) {
        await saveOnboardingState(userId, {
          currentOnboardingStep: normalizedStep,
        });
      }
    },
    [userId],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setHasMvpAccessPass(hasMvpActivationAccess());
    }, 0);

    return () => window.clearTimeout(handle);
  }, [accessState]);

  useEffect(() => {
    if (accessState === "signed_out") {
      router.replace(`/sign-in?next=${encodeURIComponent("/app/onboarding")}`);
      return;
    }

    if (accessState === "inactive" && !hasEffectiveAppAccess) {
      router.replace("/activate");
    }
  }, [accessState, hasEffectiveAppAccess, router]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    async function loadState() {
      if (restartMode && !restartAppliedRef.current) {
        restartAppliedRef.current = true;
        const restartedState = await saveOnboardingState(userId, {
          currentOnboardingStep: 1,
          onboardingStartedAt: new Date().toISOString(),
          onboardingCompletedAt: null,
          allergySetupCompleted: false,
          installPromptSeen: false,
          installPromptOutcome: null,
          appInstallStatus: "unknown",
        });

        if (cancelled) {
          return;
        }

        if (isThiislincornOnboardingTestAccount(user?.email)) {
          markThiislincornOnboardingReplaySeen(userId);
        }

        setStep(restartedState.currentOnboardingStep);
        setStateLoaded(true);
        return;
      }

      const savedState: TruthlabelOnboardingState = await startOnboarding(userId);
      const latestState = await loadOnboardingState(userId);

      if (cancelled) {
        return;
      }

      const resolvedState = latestState.onboardingStartedAt
        ? latestState
        : savedState;

      if (resolvedState.onboardingCompletedAt && !reviewMode) {
        router.replace("/app");
        return;
      }

      setStep(resolvedState.currentOnboardingStep);
      setStateLoaded(true);
    }

    void loadState();

    return () => {
      cancelled = true;
    };
  }, [restartMode, reviewMode, router, user?.email, userId]);

  useEffect(() => {
    if (!userId || trackedStartRef.current || !stateLoaded) {
      return;
    }

    trackedStartRef.current = true;
    trackTruthlabelEvent("onboarding_started", { start_step: step }, { userId });
  }, [stateLoaded, step, userId]);

  useEffect(() => {
    function handleInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstallCompleted(true);
      setDeferredPrompt(null);
      if (userId) {
        void saveOnboardingState(userId, {
          installPromptSeen: true,
          installPromptOutcome: "accepted",
          appInstallStatus: "installed",
        });
      }
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [userId]);

  useEffect(() => {
    if (step !== 4) {
      return;
    }

    trackTruthlabelEvent(
      "install_instructions_viewed",
      { onboarding_step: 4 },
      { userId },
    );

    if (isStandaloneMode()) {
      const timer = window.setTimeout(() => setSkipInstallVisible(true), 0);
      return () => window.clearTimeout(timer);
    }

    const delayMs = prefersReducedMotion ? 0 : 8000;
    const timer = window.setTimeout(() => setSkipInstallVisible(true), delayMs);

    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, step, userId]);

  useEffect(() => {
    if (step !== 3 || setupStartedRef.current || !userId) {
      return;
    }

    let cancelled = false;
    setupStartedRef.current = true;

    async function runSetup() {
      setCompletedSetupTasks(0);
      setConnectionWarning("");

      const taskDelay = prefersReducedMotion ? 0 : 360;

      async function completeTask(index: number, action?: () => Promise<void>) {
        if (taskDelay > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, taskDelay));
        }

        if (action) {
          await action();
        }

        if (!cancelled) {
          setCompletedSetupTasks(index);
        }
      }

      try {
        await completeTask(1, async () => {
          const customItems = parseCustomItems(customInput);
          updateAllergyProfile({
            allergens: selectedAllergens,
            customAllergens: customItems,
            lastUpdated: new Date().toISOString(),
          });
          await saveAllergySettingsToAccount(userId, selectedAllergens, customItems);
          await saveOnboardingState(userId, {
            allergySetupCompleted: true,
          });
        });
      } catch {
        if (!cancelled) {
          setSaveError("Settings saved on this device. Account sync will retry later.");
          setCompletedSetupTasks(1);
        }
      }

      await completeTask(2);
      await completeTask(3);

      const connected = await checkOpenFoodFactsConnection();
      if (!connected && !cancelled) {
        setConnectionWarning(
          "Product data could not be reached right now. Truthlabel will try again when you scan.",
        );
      }
      if (!cancelled) {
        setCompletedSetupTasks(4);
      }

      await completeTask(5, async () => {
        await saveOnboardingState(userId, {
          currentOnboardingStep: 3,
        });
      });

      if (!cancelled) {
        trackTruthlabelEvent("setup_completed", { product_data_connected: connected }, { userId });
      }
    }

    const timer = window.setTimeout(() => {
      void runSetup();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    customInput,
    prefersReducedMotion,
    selectedAllergens,
    step,
    userId,
  ]);

  useEffect(() => {
    if (step !== 3) {
      return;
    }

    if (prefersReducedMotion) {
      const timer = window.setTimeout(() => setCountLabel("4.3M+"), 0);
      return () => window.clearTimeout(timer);
    }

    const timers = countSequence.map((label, index) =>
      window.setTimeout(() => setCountLabel(label), index * 360),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [prefersReducedMotion, step]);

  const setupComplete = completedSetupTasks >= setupTaskCount;

  const handleSaveAllergies = useCallback(async () => {
    if (!userId) {
      return;
    }

    setSaveError("");
    const customItems = parseCustomItems(customInput);

    try {
      updateAllergyProfile({
        allergens: selectedAllergens,
        customAllergens: customItems,
        lastUpdated: new Date().toISOString(),
      });
      await saveAllergySettingsToAccount(userId, selectedAllergens, customItems);
      await saveOnboardingState(userId, {
        currentOnboardingStep: 3,
        allergySetupCompleted: true,
      });
      trackTruthlabelEvent("allergens_saved", { selected_count: selectedAllergens.length + customItems.length }, { userId });
      await goToStep(3);
    } catch {
      setSaveError("We could not save this to your account yet. Try again.");
    }
  }, [customInput, goToStep, selectedAllergens, userId]);

  const handleNoAllergens = useCallback(async () => {
    if (!userId) {
      return;
    }

    setSelectedAllergens([]);
    setCustomInput("");
    updateAllergyProfile({
      allergens: [],
      customAllergens: [],
      lastUpdated: new Date().toISOString(),
    });

    try {
      await saveAllergySettingsToAccount(userId, [], []);
    } catch {
      // Local setting already saved; account sync can retry during setup.
    }

    await saveOnboardingState(userId, {
      currentOnboardingStep: 3,
      allergySetupCompleted: true,
    });
    trackTruthlabelEvent("no_allergens_selected", { selected_count: 0 }, { userId });
    await goToStep(3);
  }, [goToStep, userId]);

  const finishInstallStep = useCallback(
    async (
      outcome: OnboardingInstallPromptOutcome,
      installStatus: OnboardingAppInstallStatus,
    ) => {
      if (!userId) {
        return;
      }

      await saveOnboardingState(userId, {
        installPromptSeen: true,
        installPromptOutcome: outcome,
        appInstallStatus: installStatus,
      });
      setInstallOutcome(outcome);
      installStatusRef.current = installStatus;
      setInstallCompleted(true);
    },
    [userId],
  );

  const handleOpenApp = useCallback(
    async (
      outcome: OnboardingInstallPromptOutcome,
      installStatus: OnboardingAppInstallStatus,
    ) => {
      if (!userId) {
        return;
      }

      await completeOnboarding(userId, {
        installPromptSeen: true,
        installPromptOutcome: outcome,
        appInstallStatus: installStatus,
      });
      trackTruthlabelEvent("onboarding_completed", { install_outcome: outcome }, { userId });
      startTransition(() => router.replace("/app"));
    },
    [router, userId],
  );

  const handleDeferInstall = useCallback(async () => {
    if (!userId) {
      return;
    }

    trackTruthlabelEvent("install_deferred", { onboarding_step: 4 }, { userId });
    await completeOnboarding(userId, {
      installPromptSeen: true,
      installPromptOutcome: "deferred",
      appInstallStatus: "not_installed",
    });
    startTransition(() => router.replace("/app"));
  }, [router, userId]);

  const retryProductData = useCallback(async () => {
    const connected = await checkOpenFoodFactsConnection();

    if (connected) {
      setConnectionWarning("");
      setCompletedSetupTasks((current) => Math.max(current, 4));
    } else {
      setConnectionWarning(
        "Product data could not be reached right now. Truthlabel will try again when you scan.",
      );
    }
  }, []);

  const content = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <StepOneDemo
            onContinue={() => void goToStep(2)}
            onSkip={() => {
              trackTruthlabelEvent("demo_skipped", { onboarding_step: 1 }, { userId });
              void goToStep(2);
            }}
          />
        );
      case 2:
        return (
          <StepTwoAllergies
            selectedAllergens={selectedAllergens}
            customInput={customInput}
            saving={isPending}
            saveError={saveError}
            onSelectedAllergensChange={setSelectedAllergens}
            onCustomInputChange={setCustomInput}
            onSave={handleSaveAllergies}
            onNoAllergens={handleNoAllergens}
          />
        );
      case 3:
        return (
          <StepThreePreparing
            completedTasks={completedSetupTasks}
            connectionWarning={connectionWarning}
            countLabel={countLabel}
            setupComplete={setupComplete}
            onRetryProductData={retryProductData}
            onContinue={() => void goToStep(4)}
          />
        );
      case 4:
      default:
        return (
          <StepFourInstall
            deferredPrompt={deferredPrompt}
            skipVisible={skipInstallVisible}
            installCompleted={installCompleted}
            isSaving={isPending}
            onInstallPromptUsed={(outcome, installStatus) => {
              setSkipInstallVisible(true);
              void finishInstallStep(outcome, installStatus);
            }}
            onFinish={(outcome, installStatus) => {
              if (installCompleted) {
                void handleOpenApp(installOutcome, installStatusRef.current);
                return;
              }

              void finishInstallStep(outcome, installStatus);
            }}
            onDefer={handleDeferInstall}
          />
        );
    }
  }, [
    completedSetupTasks,
    connectionWarning,
    countLabel,
    customInput,
    deferredPrompt,
    finishInstallStep,
    goToStep,
    handleDeferInstall,
    handleNoAllergens,
    handleOpenApp,
    handleSaveAllergies,
    installCompleted,
    installOutcome,
    isPending,
    retryProductData,
    saveError,
    selectedAllergens,
    setupComplete,
    skipInstallVisible,
    step,
    userId,
  ]);

  if (!stateLoaded || accessState === "loading") {
    return (
      <main className="min-h-screen bg-[#FBFDFB] px-5 py-6 text-[#101613]">
        <section className="mx-auto flex min-h-[72vh] max-w-[440px] items-center justify-center">
          <div className="w-full rounded-[28px] border border-[#D7E7DD] bg-white px-5 py-6 text-center shadow-[0_18px_44px_rgba(15,40,28,0.08)]">
            <Spinner className="mx-auto h-7 w-7" />
            <h1 className="mt-4 text-[22px] font-black">
              Preparing onboarding
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-[#66716B]">
              Truthlabel is loading your account setup.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <OnboardingShell
      step={step}
      onBack={step > 1 ? () => void goToStep(step - 1) : undefined}
    >
      {content}
    </OnboardingShell>
  );
}
