"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import AppBottomNavigation from "@/components/AppBottomNavigation";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { trackTruthlabelEvent } from "@/lib/analytics/analyticsClient";
import type { BetterPicksConfig } from "@/lib/betterPicks/betterPicksConfig";
import {
  formatLaunchDate,
  getCountdownParts,
  type CountdownParts,
} from "@/lib/betterPicks/countdown";
import {
  safeLocalStorageGetItem,
  safeLocalStorageSetItem,
} from "@/lib/browserStorage";

const reminderStorageKey = "better_picks_launch_reminder";

const benefits = [
  {
    title: "Replace higher-concern products",
    copy: "Discover alternatives with fewer serious ingredient findings and a simpler ingredient profile.",
  },
  {
    title: "Understand every recommendation",
    copy: "See which concerns were reduced and why the alternative may be a better match.",
  },
  {
    title: "Shop with your preferences in mind",
    copy: "Recommendations will consider your Watch List, allergens, food preferences, and the type of product you need.",
  },
];

const researchRows = [
  {
    title: "Ingredient comparison",
    copy: "Comparing serious and moderate ingredient concerns.",
  },
  {
    title: "Processing review",
    copy: "Reviewing additive load, processed oils, fillers, and ultra-processing signals.",
  },
  {
    title: "Personal fit",
    copy: "Checking allergens, Watch List settings, and selected food preferences.",
  },
  {
    title: "Product-data confidence",
    copy: "Checking whether the available ingredient and product information is complete enough to support a recommendation.",
  },
];

const categories = [
  "Breakfast cereals",
  "Bread and bakery",
  "Snacks",
  "Drinks",
  "Sauces and condiments",
  "Dairy products",
  "Dairy alternatives",
  "Meat products",
  "Plant-based products",
  "Children's foods",
  "Frozen meals",
  "Pantry essentials",
];

const progressStages = [
  {
    title: "Defining product categories",
    status: "Complete",
    tone: "done" as const,
  },
  {
    title: "Building comparison standards",
    status: "Complete",
    tone: "done" as const,
  },
  {
    title: "Reviewing product information",
    status: "In progress",
    tone: "active" as const,
  },
  {
    title: "Testing recommendation quality",
    status: "Next",
    tone: "next" as const,
  },
  {
    title: "Preparing the first Better Picks",
    status: "Next",
    tone: "next" as const,
  },
];

function BagIllustration() {
  return (
    <div
      className="relative flex h-[138px] w-full items-center justify-center overflow-hidden rounded-[24px] border border-[#DCE5DF] bg-[#E8F6EF]"
      aria-label="Shopping bag illustration"
      role="img"
    >
      <div className="absolute -left-10 top-4 h-24 w-24 rounded-full bg-white/75" />
      <div className="absolute -right-8 bottom-3 h-28 w-28 rounded-full bg-[#CFECDD]" />
      <svg
        aria-hidden="true"
        className="relative h-[98px] w-[98px] text-[#0E5A3F]"
        fill="none"
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M34 43h52l5 53H29l5-53Z"
          fill="white"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="5"
        />
        <path
          d="M45 45V35c0-9 6.7-16 15-16s15 7 15 16v10"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M46 64h28M46 78h18"
          stroke="#F2B83B"
          strokeLinecap="round"
          strokeWidth="5"
        />
      </svg>
    </div>
  );
}

function SmallIcon({ type = "bag" }: { type?: "bag" | "swap" | "check" | "spark" }) {
  const commonProps = {
    "aria-hidden": true,
    className: "h-5 w-5",
    fill: "none",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (type === "swap") {
    return (
      <svg {...commonProps}>
        <path
          d="M7 7h10l-2.2-2.2M17 17H7l2.2 2.2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (type === "check") {
    return (
      <svg {...commonProps}>
        <path
          d="m5 12.5 4.1 4.1L19 7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.9"
        />
      </svg>
    );
  }

  if (type === "spark") {
    return (
      <svg {...commonProps}>
        <path
          d="M12 3.5 13.9 9l5.6 2-5.6 2L12 18.5 10.1 13l-5.6-2 5.6-2L12 3.5Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path
        d="M7.2 8.5h9.6l1 11H6.2l1-11Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M9 9V7.8a3 3 0 0 1 6 0V9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function formatNumber(value: number) {
  return String(value).padStart(2, "0");
}

function CountdownBlock({
  label,
  value,
  hideOnTiny = false,
}: {
  label: string;
  value: number;
  hideOnTiny?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border border-[#DCE5DF] bg-white px-2.5 py-3 text-center shadow-[0_10px_24px_rgba(15,40,28,0.055)] ${
        hideOnTiny ? "max-[360px]:hidden" : ""
      }`}
    >
      <p className="font-mono text-[1.8rem] font-black leading-none tracking-[-0.05em] text-[#0E5A3F] [font-variant-numeric:tabular-nums]">
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#56635C]">
        {label}
      </p>
    </div>
  );
}

function CountdownCard({
  config,
  countdown,
}: {
  config: BetterPicksConfig;
  countdown: CountdownParts;
}) {
  const launchDateLabel = useMemo(() => formatLaunchDate(config.launchAt), [config.launchAt]);
  const accessibleCountdown = `${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, and ${countdown.seconds} seconds until launch.`;

  if (config.enabled) {
    return (
      <section className="rounded-[26px] border border-[#DCE5DF] bg-white px-4 py-5 shadow-[0_12px_30px_rgba(15,40,28,0.065)]">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
          Better Picks
        </p>
        <h2 className="mt-2 text-[1.4rem] font-black leading-tight text-[#101613]">
          Final checks are underway
        </h2>
        <p className="mt-2 text-[14px] font-semibold leading-6 text-[#56635C]">
          We&apos;re completing the final product reviews before Better Picks becomes available.
        </p>
      </section>
    );
  }

  if (countdown.status !== "counting") {
    return (
      <section
        aria-live="polite"
        className="rounded-[26px] border border-[#DCE5DF] bg-white px-4 py-5 shadow-[0_12px_30px_rgba(15,40,28,0.065)]"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
          Better Picks
        </p>
        <h2 className="mt-2 text-[1.4rem] font-black leading-tight text-[#101613]">
          Final checks are underway
        </h2>
        <p className="mt-2 text-[14px] font-semibold leading-6 text-[#56635C]">
          We&apos;re completing the final product reviews before Better Picks becomes available.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label={accessibleCountdown}
      className="rounded-[26px] border border-[#DCE5DF] bg-[#F2FBF5] px-4 py-5 shadow-[0_12px_30px_rgba(15,40,28,0.065)]"
    >
      <p className="text-center text-[12px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
        Launching in
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 min-[361px]:grid-cols-4">
        <CountdownBlock label="Days" value={countdown.days} />
        <CountdownBlock label="Hours" value={countdown.hours} />
        <CountdownBlock label="Minutes" value={countdown.minutes} />
        <CountdownBlock label="Seconds" value={countdown.seconds} hideOnTiny />
      </div>
      {launchDateLabel ? (
        <p className="mt-4 text-center text-[13px] font-bold text-[#56635C]">
          {launchDateLabel}
        </p>
      ) : null}
    </section>
  );
}

function Section({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[26px] border border-[#DCE5DF] bg-white px-4 py-5 shadow-[0_12px_30px_rgba(15,40,28,0.055)]">
      <h2 className="text-[1.25rem] font-black leading-tight text-[#101613]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BenefitCards() {
  return (
    <div className="grid gap-3">
      {benefits.map((benefit, index) => (
        <article
          key={benefit.title}
          className="rounded-[20px] border border-[#DCE5DF] bg-[#F7F9F7] p-4"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#E8F6EF] text-[#0E5A3F]">
            <SmallIcon type={index === 1 ? "check" : index === 2 ? "spark" : "swap"} />
          </span>
          <h3 className="mt-3 text-[15px] font-black text-[#101613]">
            {benefit.title}
          </h3>
          <p className="mt-1 text-[13px] font-semibold leading-5 text-[#56635C]">
            {benefit.copy}
          </p>
        </article>
      ))}
    </div>
  );
}

function ResearchRows() {
  return (
    <div>
      <p className="text-[14px] font-semibold leading-6 text-[#56635C]">
        We&apos;re reviewing a growing catalogue of products across everyday food
        categories, comparing ingredients, processing signals, allergens,
        product-data quality, and serious Truthlabel findings.
      </p>
      <p className="mt-3 text-[14px] font-semibold leading-6 text-[#56635C]">
        We will only surface products when enough information is available to
        explain why they were selected.
      </p>
      <div className="mt-4 divide-y divide-[#E7EEE9]">
        {researchRows.map((row) => (
          <div
            key={row.title}
            className="grid min-h-[58px] grid-cols-[auto_minmax(0,1fr)] gap-3 py-3"
          >
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#E8F6EF] text-[#0E5A3F]">
              <SmallIcon type="check" />
            </span>
            <span>
              <span className="block text-[14px] font-black text-[#101613]">
                {row.title}
              </span>
              <span className="mt-0.5 block text-[12.5px] font-semibold leading-5 text-[#56635C]">
                {row.copy}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryPreview() {
  return (
    <div>
      <div className="-mx-1 grid grid-flow-col auto-cols-[minmax(128px,1fr)] gap-2 overflow-x-auto px-1 pb-2 sm:grid-flow-row sm:grid-cols-3 sm:overflow-visible">
        {categories.map((category) => (
          <article
            key={category}
            className="min-h-[96px] rounded-[18px] border border-[#DCE5DF] bg-white p-3 shadow-[0_8px_20px_rgba(15,40,28,0.04)]"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#F2FBF5] text-[#0E5A3F]">
              <SmallIcon />
            </span>
            <p className="mt-3 text-[13px] font-black leading-4 text-[#101613]">
              {category}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-[13px] font-semibold leading-5 text-[#56635C]">
        More categories will be added as the database grows.
      </p>
    </div>
  );
}

function ComparisonPreview() {
  return (
    <article className="rounded-[24px] border border-[#DCE5DF] bg-[#F7F9F7] p-3">
      <p className="inline-flex rounded-full border border-[#DCE5DF] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#56635C]">
        Example comparison
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] border border-[#E5DFD7] bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7C6D4F]">
            Current product
          </p>
          <h3 className="mt-2 text-[16px] font-black text-[#101613]">
            Example Chocolate Cereal
          </h3>
          <ul className="mt-3 grid gap-1.5 text-[13px] font-semibold leading-5 text-[#56635C]">
            <li>- 2 serious concerns</li>
            <li>- High additive load</li>
            <li>- Ultra-processed</li>
          </ul>
        </div>
        <div className="rounded-[20px] border border-[#BDE3CD] bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0E5A3F]">
            Better pick
          </p>
          <h3 className="mt-2 text-[16px] font-black text-[#101613]">
            Simpler Chocolate Cereal
          </h3>
          <ul className="mt-3 grid gap-1.5 text-[13px] font-semibold leading-5 text-[#56635C]">
            <li>- No serious findings detected</li>
            <li>- Fewer additives</li>
            <li>- Simpler ingredient profile</li>
          </ul>
        </div>
      </div>
      <span className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-[#0E5A3F] px-4 text-[12px] font-black text-white">
        Why this is a better pick
      </span>
    </article>
  );
}

function DevelopmentProgress() {
  return (
    <ol className="grid gap-2">
      {progressStages.map((stage) => (
        <li
          key={stage.title}
          className="grid min-h-[54px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[#DCE5DF] bg-[#F7F9F7] px-3 py-2.5"
        >
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
              stage.tone === "done"
                ? "border-[#BDE3CD] bg-[#E8F6EF] text-[#0E5A3F]"
                : stage.tone === "active"
                  ? "border-[#E3C766] bg-[#FFF8D7] text-[#7A4B00]"
                  : "border-[#DCE5DF] bg-white text-[#77837C]"
            }`}
          >
            <SmallIcon type={stage.tone === "done" ? "check" : "spark"} />
          </span>
          <span className="text-[13px] font-black leading-4 text-[#101613]">
            {stage.title}
          </span>
          <span className="rounded-full border border-[#DCE5DF] bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#56635C]">
            {stage.status}
          </span>
        </li>
      ))}
    </ol>
  );
}

function ReminderCard({
  enabled,
  reminded,
  onRemind,
}: {
  enabled: boolean;
  reminded: boolean;
  onRemind: () => void;
}) {
  return (
    <section className="rounded-[26px] border border-[#BDE3CD] bg-[#E8F6EF] px-4 py-5">
      <h2 className="text-[1.2rem] font-black leading-tight text-[#101613]">
        Be the first to try Better Picks
      </h2>
      {reminded ? (
        <div role="status" className="mt-3 rounded-[18px] border border-[#BDE3CD] bg-white p-4">
          <p className="text-[14px] font-black text-[#0E5A3F]">
            You&apos;re on the list
          </p>
          <p className="mt-1 text-[13px] font-semibold leading-5 text-[#56635C]">
            You&apos;ll see an in-app announcement when Better Picks launches.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[14px] font-semibold leading-6 text-[#56635C]">
            We&apos;ll let you know inside Truthlabel when the first
            recommendations are ready.
          </p>
          <button
            type="button"
            disabled={!enabled}
            onClick={onRemind}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#0E5A3F] px-4 text-[13px] font-black text-white transition hover:bg-[#0B4A34] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
          >
            Notify me at launch
          </button>
        </>
      )}
    </section>
  );
}

export default function BetterPicksComingSoonScreen({
  config,
}: {
  config: BetterPicksConfig;
}) {
  const { user } = useTruthlabelAuth();
  const [now, setNow] = useState(() => Date.now());
  const [reminded, setReminded] = useState(false);
  const countdown = useMemo(
    () => getCountdownParts(config.launchAt, now),
    [config.launchAt, now],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setReminded(safeLocalStorageGetItem(reminderStorageKey) === "true");
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    if (countdown.status !== "counting") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [countdown.status]);

  function handleReminder() {
    safeLocalStorageSetItem(reminderStorageKey, "true");
    setReminded(true);
    trackTruthlabelEvent(
      "better_picks_reminder_enabled",
      {
        launch_status: countdown.status,
      },
      { userId: user?.id },
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9F7] px-4 pt-[calc(12px+env(safe-area-inset-top))] text-[#101613] sm:px-5">
      <div className="mx-auto w-full max-w-[520px] pb-[calc(104px+env(safe-area-inset-bottom))]">
        <header className="flex items-center justify-between gap-3 px-1 py-2">
          <Link
            href="/app"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#DCE5DF] bg-white px-4 text-[13px] font-extrabold text-[#0E5A3F] shadow-[0_8px_20px_rgba(15,40,28,0.05)] transition hover:bg-[#E8F6EF] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
          >
            Back
          </Link>
          <div className="min-w-0 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
              Truthlabel
            </p>
            <h1 className="truncate text-[1.35rem] font-black tracking-[-0.04em]">
              Better Picks
            </h1>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DCE5DF] bg-white text-[#0E5A3F] shadow-[0_8px_20px_rgba(15,40,28,0.05)]">
            <SmallIcon />
          </span>
        </header>

        <div className="mt-3 space-y-4">
          <section className="overflow-hidden rounded-[30px] border border-[#DCE5DF] bg-white p-4 shadow-[0_18px_45px_rgba(15,40,28,0.075)]">
            <BagIllustration />
            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#0E5A3F]">
              Coming soon
            </p>
            <h2 className="mt-2 text-[2rem] font-black leading-[1.02] tracking-[-0.07em] text-[#101613]">
              Find better alternatives for everyday products
            </h2>
            <p className="mt-3 text-[15px] font-semibold leading-6 text-[#56635C]">
              We&apos;re building a carefully reviewed collection of lower-concern
              products to help you replace foods with serious ingredient
              concerns, heavy processing, or unclear product information.
            </p>
            <p className="mt-3 rounded-[18px] border border-[#DCE5DF] bg-[#F7F9F7] px-4 py-3 text-[13px] font-black leading-5 text-[#0E5A3F]">
              Every recommendation will explain why it may be a better option.
            </p>
          </section>

          <CountdownCard config={config} countdown={countdown} />

          <Section title="What Better Picks will help you do">
            <BenefitCards />
          </Section>

          <Section title="Built through careful product research">
            <ResearchRows />
          </Section>

          <Section title="Everyday categories we're reviewing">
            <CategoryPreview />
          </Section>

          <Section title="How a comparison may look">
            <ComparisonPreview />
          </Section>

          <Section title="What we're working on">
            <DevelopmentProgress />
          </Section>

          <ReminderCard
            enabled={config.reminderEnabled}
            reminded={reminded}
            onRemind={handleReminder}
          />

          <Link
            href="/app/manual?mode=camera"
            className="flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#0E5A3F] px-5 text-[14px] font-black text-white shadow-[0_16px_34px_rgba(14,90,63,0.18)] transition hover:bg-[#0B4A34] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99]"
          >
            Return to scanning
          </Link>
        </div>
      </div>
      <AppBottomNavigation />
    </main>
  );
}
