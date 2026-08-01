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
import { WelcomeOnboarding } from "./WelcomeOnboarding";

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
  | "ios_in_app"
  | "android_in_app"
  | "android_prompt"
  | "android_fallback"
  | "iphone_safari"
  | "iphone_other"
  | "browser_fallback"
  | "desktop"
  | "installed";

type InstallGuideStep = {
  id: string;
  progress: string;
  title: string;
  imageKey: string;
  imageSrc?: string;
  imageAlt: string;
  placeholderLabel: string;
  imageAspectRatio?: string;
  imageWidth?: number;
  imageHeight?: number;
  tip?: string;
};

type InstallationImagePlaceholderProps = {
  imageKey: string;
  src?: string;
  alt: string;
  label: string;
  aspectRatio?: string;
  imageWidth?: number;
  imageHeight?: number;
};

const totalSteps = 4;
const setupTaskCount = 5;
const countSequence = ["0", "500K", "1.4M", "2.6M", "3.8M", "4.3M+"];

const iosInstallSteps: InstallGuideStep[] = [
  {
    id: "share",
    progress: "Step 1 of 3",
    title: "Tap Safari's Share button",
    imageKey: "ios-share-button",
    imageSrc: "/onboarding-ios-safari-share-button.jpeg",
    imageAlt: "Safari showing the TruthLabel page and Share button",
    placeholderLabel: "Safari Share button image slot",
    imageAspectRatio: "3 / 4",
    imageWidth: 1080,
    imageHeight: 1440,
  },
  {
    id: "add-home-screen",
    progress: "Step 2 of 3",
    title: 'Choose "Add to Home Screen"',
    imageKey: "ios-add-to-home-screen",
    imageSrc: "/onboarding-ios-add-home-screen.jpeg",
    imageAlt: "Safari Share menu showing Add to Home Screen",
    placeholderLabel: "Add to Home Screen image slot",
    imageAspectRatio: "3 / 4",
    imageWidth: 1080,
    imageHeight: 1440,
    tip: 'If you do not see "Add to Home Screen" right away, keep scrolling down in the Share menu.',
  },
  {
    id: "confirm",
    progress: "Step 3 of 3",
    title: "Finish adding TruthLabel",
    imageKey: "ios-confirm-install",
    imageSrc: "/onboarding-ios-confirm-home-screen.jpeg",
    imageAlt: "iPhone Add to Home Screen confirmation",
    placeholderLabel: "Install confirmation image slot",
    imageAspectRatio: "3 / 4",
    imageWidth: 1080,
    imageHeight: 1440,
    tip: 'Keep "Open as Web App" turned on, then tap Add.',
  },
];

const androidInstallSteps: InstallGuideStep[] = [
  {
    id: "browser-menu",
    progress: "Step 1 of 4",
    title: "Open your browser menu",
    imageKey: "android-browser-menu",
    imageSrc: "/onboarding-android-browser-menu.jpeg",
    imageAlt: "Android browser showing its menu button",
    placeholderLabel: "Android browser menu image slot",
    imageAspectRatio: "2 / 3",
    imageWidth: 1024,
    imageHeight: 1536,
  },
  {
    id: "install-app",
    progress: "Step 2 of 4",
    title: 'Choose "Install app" or "Add to Home screen"',
    imageKey: "android-install-app",
    imageSrc: "/onboarding-android-install-menu.jpeg",
    imageAlt: "Android browser menu showing the install app option",
    placeholderLabel: "Android install option image slot",
    imageAspectRatio: "2 / 3",
    imageWidth: 1024,
    imageHeight: 1536,
    tip: "If Install is lower in the menu, scroll down until you see it.",
  },
  {
    id: "confirm-install",
    progress: "Step 3 of 4",
    title: "Confirm the TruthLabel installation",
    imageKey: "android-confirm-install",
    imageSrc: "/onboarding-android-confirm-install.jpeg",
    imageAlt: "Android installation confirmation for TruthLabel",
    placeholderLabel: "Android confirmation image slot",
    imageAspectRatio: "2 / 3",
    imageWidth: 1024,
    imageHeight: 1536,
  },
  {
    id: "install-choice",
    progress: "Step 4 of 4",
    title: "Tap Install",
    imageKey: "android-install-choice",
    imageSrc: "/onboarding-android-install-choice.jpeg",
    imageAlt: "Android install and create shortcut prompt with Install selected",
    placeholderLabel: "Android install choice image slot",
    imageAspectRatio: "2 / 3",
    imageWidth: 1024,
    imageHeight: 1536,
    tip: "If Android gives you a choice, choose Install instead of Create shortcut.",
  },
];

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

function isInAppBrowser() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Instagram|FBAN|FBAV|FB_IAB|FBIOS|FB4A|TikTok|Bytedance|Line\/|MicroMessenger|Snapchat|Pinterest|LinkedInApp/i.test(
    navigator.userAgent,
  );
}

function getInstallDeviceKind(
  deferredPrompt: BeforeInstallPromptEvent | null,
  override?: InstallDeviceKind | null,
): InstallDeviceKind {
  if (override) {
    return override;
  }

  if (isStandaloneMode()) {
    return "installed";
  }

  if (isInAppBrowser()) {
    if (isAppleMobileDevice()) {
      return "ios_in_app";
    }

    if (isAndroidDevice()) {
      return "android_in_app";
    }

    return "browser_fallback";
  }

  if (isAppleMobileDevice()) {
    return isSafariBrowser() ? "iphone_safari" : "iphone_other";
  }

  if (isAndroidDevice()) {
    return deferredPrompt ? "android_prompt" : "android_fallback";
  }

  return "desktop";
}

function getInstallDeviceKindOverride(
  value: string | null,
): InstallDeviceKind | null {
  switch (value) {
    case "ios-in-app":
      return "ios_in_app";
    case "android-in-app":
      return "android_in_app";
    case "iphone":
      return "iphone_safari";
    case "iphone-other":
      return "iphone_other";
    case "android-manual":
      return "android_fallback";
    case "desktop":
      return "desktop";
    case "installed":
      return "installed";
    default:
      return null;
  }
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

function ImageIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-5 w-5 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.75 7A2.25 2.25 0 0 1 7 4.75h10A2.25 2.25 0 0 1 19.25 7v10A2.25 2.25 0 0 1 17 19.25H7A2.25 2.25 0 0 1 4.75 17V7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m6.75 16.25 3.15-3.15a1.4 1.4 0 0 1 1.98 0l1.05 1.05 1.8-1.8a1.4 1.4 0 0 1 1.98 0l.54.54"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9 8.9h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
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
        <button
          type="button"
          onClick={onNoAllergens}
          disabled={saving}
          className="mt-3 inline-flex min-h-10 items-center rounded-full border border-[#D7E7DD] bg-white px-4 text-[13px] font-extrabold text-[#0E5A3F] outline-none transition hover:bg-[#F3FAF6] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
        >
          No allergies
        </button>
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
  countLabel,
  setupComplete,
  onContinue,
}: {
  completedTasks: number;
  countLabel: string;
  setupComplete: boolean;
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
          const status: SetupTaskStatus =
            index < completedTasks
              ? "complete"
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

      {setupComplete ? (
        <div className="mt-auto pt-6">
          <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
        </div>
      ) : null}
    </section>
  );
}

function InstallationEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
      {children}
    </p>
  );
}

function InstallationImagePlaceholder({
  imageKey,
  src,
  alt,
  label,
  aspectRatio = "16 / 9",
  imageWidth = 390,
  imageHeight = 220,
}: InstallationImagePlaceholderProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={imageWidth}
        height={imageHeight}
        className="mx-auto block max-h-[500px] w-auto max-w-full rounded-[18px] object-contain shadow-[0_12px_24px_rgba(15,40,28,0.07)]"
        data-image-key={imageKey}
      />
    );
  }

  return (
    <div
      className="mx-auto grid w-full place-content-center gap-1.5 overflow-hidden rounded-[18px] border border-dashed border-[rgba(7,79,59,0.24)] bg-[linear-gradient(145deg,rgba(235,246,240,0.9),rgba(250,249,244,0.95))] px-3 py-3 text-center text-[#668078]"
      style={{ aspectRatio }}
      data-image-key={imageKey}
      aria-label={label}
    >
      <ImageIcon className="mx-auto" />
      <span className="text-[10.5px] font-extrabold leading-4">
        {label}
      </span>
      <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#8A9B94]">
        {imageKey}
      </span>
    </div>
  );
}

function InstallCard({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`mt-5 rounded-[28px] border border-[#D7E7DD] bg-white shadow-[0_14px_36px_rgba(15,40,28,0.07)] ${
        compact ? "px-4 py-4" : "px-5 py-5"
      }`}
    >
      {children}
    </div>
  );
}

function InstallBenefitList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 grid gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-2 rounded-[14px] border border-[#E2EDE6] bg-[#FBFDFB] px-3 py-2 text-[13px] font-bold text-[#101613]"
        >
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F6EF] text-[#0E5A3F]">
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function InstallStepList({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-4 grid gap-2 text-[13px] font-semibold text-[#101613]">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-2 rounded-[14px] bg-[#F8FBF8] px-3 py-2">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0E5A3F] text-[10px] font-black text-white">
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function SwipeCue() {
  return (
    <div
      className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#66716B]"
      aria-hidden="true"
    >
      <span className="h-px w-10 bg-[#D7E7DD]" />
      <span className="relative inline-flex h-9 w-16 items-center justify-center rounded-full border border-[#D7E7DD] bg-white shadow-[0_8px_20px_rgba(15,40,28,0.06)]">
        <span className="absolute left-3 h-1.5 w-1.5 rounded-full bg-[#CFE2D6]" />
        <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#CFE2D6]" />
        <span className="motion-safe:animate-[truthlabelSwipeCue_1.45s_ease-in-out_infinite]">
          <svg
            className="h-5 w-5 text-[#0E5A3F]"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 12h8m0 0-3-3m3 3-3 3"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </span>
      </span>
      <span>Swipe</span>
      <span className="h-px w-10 bg-[#D7E7DD]" />
    </div>
  );
}

function InstallStepCarousel({ steps }: { steps: InstallGuideStep[] }) {
  return (
    <div className="mt-4">
      <SwipeCue />
      <div
        className="-mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="TruthLabel installation steps"
      >
        {steps.map((step, index) => (
          <article
            key={step.id}
            className="min-w-[90%] snap-center rounded-[22px] border border-[#D7E7DD] bg-white px-2.5 py-3 shadow-[0_12px_28px_rgba(15,40,28,0.06)]"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#0E5A3F]">
              {step.progress}
            </p>
            <h2 className="mt-1.5 text-[20px] font-black leading-tight tracking-[-0.03em] text-[#101613]">
              {step.title}
            </h2>
            <div className="mt-2.5">
              <InstallationImagePlaceholder
                imageKey={step.imageKey}
                src={step.imageSrc}
                alt={step.imageAlt}
                label={step.placeholderLabel}
                aspectRatio={step.imageAspectRatio ?? "16 / 9"}
                imageWidth={step.imageWidth}
                imageHeight={step.imageHeight}
              />
            </div>
            {step.tip ? (
              <details className="mt-2 rounded-full border border-[#F3D27A] bg-[#FFF8DE] px-3 py-2 text-[12px] font-bold text-[#6F4D00]">
                <summary className="cursor-pointer list-none text-center">
                  Tip: can&apos;t see it?
                </summary>
                <p className="mt-1 text-center leading-5 text-[#7A5A10]">
                  {step.tip}
                </p>
              </details>
            ) : null}
            <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
              {steps.map((dotStep, dotIndex) => (
                <span
                  key={dotStep.id}
                  className={`h-1.5 rounded-full ${
                    dotIndex === index ? "w-6 bg-[#0E5A3F]" : "w-1.5 bg-[#D7E7DD]"
                  }`}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function StepFourInstall({
  deferredPrompt,
  installDeviceOverride,
  skipVisible,
  installCompleted,
  isSaving,
  onInstallPromptUsed,
  onFinish,
  onDefer,
}: {
  deferredPrompt: BeforeInstallPromptEvent | null;
  installDeviceOverride?: InstallDeviceKind | null;
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
  const [installStage, setInstallStage] = useState<
    "opening" | "ios_intro"
  >("opening");
  const [copyStatus, setCopyStatus] = useState("");
  const [installCheckStatus, setInstallCheckStatus] = useState("");
  const deviceKind = useMemo(
    () => getInstallDeviceKind(deferredPrompt, installDeviceOverride),
    [deferredPrompt, installDeviceOverride],
  );
  const isInstalled = deviceKind === "installed";
  const isInApp = deviceKind === "ios_in_app" || deviceKind === "android_in_app";
  const isIphoneOtherBrowser = deviceKind === "iphone_other";

  useEffect(() => {
    const resetHandle = window.setTimeout(() => {
      setInstallStage("opening");
      setCopyStatus("");
      setInstallCheckStatus("");
    }, 0);

    return () => window.clearTimeout(resetHandle);
  }, [deviceKind]);

  async function handleCopySetupLink() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setCopyStatus("Setup link unavailable. Open TruthLabel in Safari or Chrome and sign in.");
      return;
    }

    try {
      setCopyStatus("Creating secure setup link...");
      const { data, error } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (error || !accessToken) {
        throw new Error("Missing setup session.");
      }

      const response = await fetch("/api/setup-handoff/create", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      const payload = (await response.json().catch(() => ({}))) as {
        setupUrl?: string;
        message?: string;
      };

      if (!response.ok || !payload.setupUrl) {
        throw new Error(payload.message || "Setup link could not be created.");
      }

      await navigator.clipboard.writeText(payload.setupUrl);
      setCopyStatus(
        deviceKind === "android_in_app"
          ? "Install link copied. Open Chrome, paste the link, then install TruthLabel from there."
          : "Install link copied. Open Safari, paste the link, then install TruthLabel from there.",
      );
    } catch {
      setCopyStatus("Copy failed. Use your browser menu to open this page in Safari or Chrome.");
    }
  }

  async function handleNativeInstall() {
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
  }

  function handlePrimaryAction() {
    if (isInstalled) {
      onFinish("already_installed", "installed");
      return;
    }

    if (deviceKind === "android_prompt") {
      void handleNativeInstall();
      return;
    }

    if (deviceKind === "iphone_safari") {
      setInstallStage("ios_intro");
      return;
    }

    if (deviceKind === "android_fallback") {
      handleCheckInstallation();
      return;
    }

    if (isInApp || isIphoneOtherBrowser) {
      void handleCopySetupLink();
      return;
    }

    onDefer();
  }

  function handleCheckInstallation() {
    if (isStandaloneMode() || installCompleted) {
      onFinish("already_installed", "installed");
      return;
    }

    setInstallCheckStatus(
      "TruthLabel is not opening as the installed app yet. Open it from your Home Screen, or continue in the browser for now.",
    );
  }

  if (installCompleted) {
    return (
      <section className="flex flex-1 flex-col justify-center py-6 text-center">
        <InstallationEyebrow>Setup complete</InstallationEyebrow>
        <div className="relative mx-auto mt-4 flex h-20 w-20 items-center justify-center">
          <span className="absolute h-20 w-20 rounded-[26px] bg-[#E8F6EF] motion-safe:animate-[ping_900ms_ease-out_1]" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#0E5A3F] text-white shadow-[0_16px_36px_rgba(14,90,63,0.24)]">
            <CheckIcon className="h-8 w-8" />
          </span>
        </div>
        <h1 className="mt-5 text-[30px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
          TruthLabel is ready
        </h1>
        <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-6 text-[#66716B]">
          Your app is installed and ready whenever you need to scan a product.
        </p>
        <p className="mt-4 text-[12.5px] font-semibold text-[#66716B]">
          Open TruthLabel now, or launch it from your Home Screen anytime.
        </p>
        <div className="mt-8">
          <PrimaryButton onClick={() => onFinish("manual_confirmed", "manual_confirmed")} disabled={isSaving}>
            {isSaving ? "Opening..." : "Open TruthLabel app"}
          </PrimaryButton>
        </div>
      </section>
    );
  }

  if (isInstalled) {
    return (
      <section className="flex flex-1 flex-col justify-center py-6 text-center">
        <InstallationEyebrow>Installation complete</InstallationEyebrow>
        <span className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#0E5A3F] text-white">
          <CheckIcon className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-[30px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
          TruthLabel is installed
        </h1>
        <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-6 text-[#66716B]">
          TruthLabel is now on your Home Screen and ready whenever you need to scan a product.
        </p>
        <p className="mt-4 text-[12.5px] font-semibold text-[#66716B]">
          Open the app now and start scanning.
        </p>
        <div className="mt-8">
          <PrimaryButton onClick={handlePrimaryAction} disabled={isSaving}>
            {isSaving ? "Opening..." : "Open TruthLabel app"}
          </PrimaryButton>
        </div>
      </section>
    );
  }

  if (isInApp || isIphoneOtherBrowser) {
    const isAndroid = deviceKind === "android_in_app";

    return (
      <section className="flex flex-1 flex-col py-6">
        <div>
          <InstallationEyebrow>
            {isAndroid ? "Install in Chrome" : "Install in Safari"}
          </InstallationEyebrow>
          <h1 className="mt-2 text-[30px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
            {isAndroid
              ? "Open this link in Chrome to install TruthLabel"
              : "Open this link in Safari to install TruthLabel"}
          </h1>
        </div>

        <InstallCard compact>
          <InstallStepList
            steps={
              isAndroid
                ? [
                    "Tap the Instagram or Facebook browser menu",
                    'Choose "Open in Chrome," "Open in browser," or "Open in external browser"',
                    "Install the TruthLabel app there",
                  ]
                : [
                    "Tap the Instagram or Facebook browser menu",
                    'Choose "Open in Safari" or "Open in external browser"',
                    "Install the TruthLabel app from Safari",
                  ]
            }
          />
          <div className="mt-3">
            <InstallationImagePlaceholder
              imageKey={isAndroid ? "in-app-open-chrome" : "in-app-open-safari"}
              src={
                isAndroid
                  ? "/onboarding-android-social-open-chrome.jpeg"
                  : "/onboarding-ios-social-open-safari.jpeg"
              }
              alt={
                isAndroid
                  ? "Android Instagram browser menu showing Open in Chrome"
                  : "iPhone Instagram browser menu showing Open in Safari"
              }
              label={
                isAndroid
                  ? "Chrome install handoff image slot"
                  : "Safari install handoff image slot"
              }
              aspectRatio="9 / 16"
              imageWidth={720}
              imageHeight={1280}
            />
          </div>
        </InstallCard>

        {copyStatus ? (
          <p className="mt-4 rounded-[16px] border border-[#D7E7DD] bg-[#F3FAF6] px-4 py-3 text-[13px] font-bold leading-5 text-[#0E5A3F]">
            {copyStatus}
          </p>
        ) : null}

        <div className="mt-auto pt-6">
          <PrimaryButton onClick={handlePrimaryAction} disabled={isSaving}>
            Copy install link
          </PrimaryButton>
          <TextButton onClick={onDefer}>Continue in browser for now</TextButton>
        </div>
      </section>
    );
  }

  if (deviceKind === "iphone_safari" && installStage === "ios_intro") {
    return (
      <section className="flex flex-1 flex-col py-6">
        <InstallationEyebrow>Install the app</InstallationEyebrow>
        <h1 className="mt-2 text-[30px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
          Install TruthLabel on this iPhone
        </h1>
        <InstallStepCarousel steps={iosInstallSteps} />
        {installCheckStatus ? (
          <p className="mt-4 rounded-[16px] border border-[#F1DDAD] bg-[#FFFBEC] px-4 py-3 text-[13px] font-bold leading-5 text-[#8A6500]">
            {installCheckStatus}
          </p>
        ) : null}
        <div className="mt-auto pt-6">
          <PrimaryButton onClick={handleCheckInstallation} disabled={isSaving}>
            {isSaving ? "Checking..." : "Check if TruthLabel is installed"}
          </PrimaryButton>
          <TextButton onClick={onDefer}>Continue in browser for now</TextButton>
        </div>
      </section>
    );
  }

  if (deviceKind === "android_prompt") {
    return (
      <section className="flex flex-1 flex-col py-6">
        <InstallationEyebrow>Install the app</InstallationEyebrow>
        <h1 className="mt-2 text-[32px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
          Install the TruthLabel app
        </h1>
        <InstallCard compact>
          <InstallBenefitList
            items={[
              "One-tap access",
              "Opens in its own app window",
              "No need to search for the website",
            ]}
          />
          <div className="mt-3">
            <InstallationImagePlaceholder
              imageKey="android-native-install"
              alt="Android install prompt"
              label="Android install prompt image slot"
              aspectRatio="16 / 9"
            />
          </div>
        </InstallCard>
        <div className="mt-auto pt-6">
          <PrimaryButton onClick={handlePrimaryAction} disabled={promptBusy || isSaving}>
            {promptBusy || isSaving ? "Opening installation..." : "Install TruthLabel"}
          </PrimaryButton>
          <TextButton onClick={onDefer}>Continue in browser for now</TextButton>
        </div>
      </section>
    );
  }

  if (deviceKind === "android_fallback") {
    return (
      <section className="flex flex-1 flex-col py-6">
        <InstallationEyebrow>Install the app</InstallationEyebrow>
        <h1 className="mt-2 text-[32px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
          Install TruthLabel manually
        </h1>
        <InstallStepCarousel steps={androidInstallSteps} />
        {installCheckStatus ? (
          <p className="mt-4 rounded-[16px] border border-[#F1DDAD] bg-[#FFFBEC] px-4 py-3 text-[13px] font-bold leading-5 text-[#8A6500]">
            {installCheckStatus}
          </p>
        ) : null}
        <div className="mt-auto pt-6">
          <PrimaryButton onClick={handlePrimaryAction} disabled={isSaving}>
            {isSaving ? "Checking..." : "Check if TruthLabel is installed"}
          </PrimaryButton>
          <TextButton onClick={onDefer}>Continue in browser for now</TextButton>
        </div>
      </section>
    );
  }

  if (deviceKind === "desktop" || deviceKind === "browser_fallback") {
    return (
      <section className="flex flex-1 flex-col justify-center py-6">
        <InstallationEyebrow>Install the app</InstallationEyebrow>
        <h1 className="mt-2 text-[32px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
          Install from your phone
        </h1>
        <div className="mt-6">
          <PrimaryButton onClick={onDefer}>Continue in browser for now</PrimaryButton>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col py-6">
      <div>
        <InstallationEyebrow>Install the app</InstallationEyebrow>
        <h1 className="text-[30px] font-black leading-[1.04] tracking-[-0.04em] text-[#101613]">
          Install TruthLabel to finish setup
        </h1>
      </div>

      <InstallCard compact>
        <InstallBenefitList
          items={[
            "Install TruthLabel on this phone",
            "Open it from your Home Screen",
            "Keep scanning one tap away",
          ]}
        />
        <div className="mt-3">
          <InstallationImagePlaceholder
            imageKey="install-opening"
            src="/onboarding-install-home-screen.jpeg"
            alt="TruthLabel app installation preview"
            label="Install opening image slot"
            aspectRatio="3 / 4"
            imageWidth={1080}
            imageHeight={1440}
          />
        </div>
      </InstallCard>

      <div className="mt-auto pt-6">
        <PrimaryButton onClick={handlePrimaryAction} disabled={promptBusy || isSaving}>
          {promptBusy || isSaving ? "Opening installation..." : "Install this app"}
        </PrimaryButton>
        <TextButton onClick={onDefer}>
          {skipVisible ? "Continue in browser for now" : "Continue in browser for now"}
        </TextButton>
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

export default function TruthlabelOnboardingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessState, user } = useTruthlabelAuth();
  const prefersReducedMotion = usePrefersReducedMotion();
  const reviewMode = searchParams.get("review") === "1";
  const restartMode = reviewMode && searchParams.get("restart") === "1";
  const installReviewMode = reviewMode && searchParams.get("install") === "1";
  const installDeviceOverride = isThiislincornOnboardingTestAccount(user?.email)
    ? getInstallDeviceKindOverride(searchParams.get("installEnv"))
    : null;
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
      if (restartMode && !installReviewMode && !restartAppliedRef.current) {
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

      setStep(installReviewMode ? 4 : resolvedState.currentOnboardingStep);
      setStateLoaded(true);
    }

    void loadState();

    return () => {
      cancelled = true;
    };
  }, [installReviewMode, restartMode, reviewMode, router, user?.email, userId]);

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
      await completeTask(4);

      await completeTask(5, async () => {
        await saveOnboardingState(userId, {
          currentOnboardingStep: 3,
        });
      });

      if (!cancelled) {
        trackTruthlabelEvent("setup_completed", { product_data_ready: true }, { userId });
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
      setInstallCompleted(
        outcome === "accepted" ||
          outcome === "manual_confirmed" ||
          outcome === "already_installed" ||
          installStatus === "installed",
      );
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

  const content = useMemo(() => {
    switch (step) {
      case 1:
        return <WelcomeOnboarding onContinue={() => void goToStep(2)} />;
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
            countLabel={countLabel}
            setupComplete={setupComplete}
            onContinue={() => void goToStep(4)}
          />
        );
      case 4:
      default:
        return (
          <StepFourInstall
            deferredPrompt={deferredPrompt}
            installDeviceOverride={installDeviceOverride}
            skipVisible={skipInstallVisible}
            installCompleted={installCompleted}
            isSaving={isPending}
            onInstallPromptUsed={(outcome, installStatus) => {
              setSkipInstallVisible(true);
              setDeferredPrompt(null);
              void finishInstallStep(outcome, installStatus);
            }}
            onFinish={(outcome, installStatus) => {
              if (outcome === "already_installed") {
                void handleOpenApp(outcome, installStatus);
                return;
              }

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
    countLabel,
    customInput,
    deferredPrompt,
    finishInstallStep,
    goToStep,
    handleDeferInstall,
    handleNoAllergens,
    handleOpenApp,
    handleSaveAllergies,
    installDeviceOverride,
    installCompleted,
    installOutcome,
    isPending,
    saveError,
    selectedAllergens,
    setupComplete,
    skipInstallVisible,
    step,
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

  if (step === 1) {
    return content;
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
