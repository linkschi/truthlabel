"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/auth/supabaseClient";
import type { AnalyticsSummary } from "@/lib/analytics/analyticsSummary";

type AnalyticsSummaryResponse = {
  ok: boolean;
  adminEmail?: string;
  message?: string;
  warnings?: string[];
  summary?: AnalyticsSummary;
};

const toneClasses = {
  green: "border-[#A7DCC2] bg-[#EFFAF3] text-[#0E5A3F]",
  yellow: "border-[#F0D274] bg-[#FFF8D7] text-[#7A4B00]",
  red: "border-[#F0A29A] bg-[#FFF1EF] text-[#8F1D16]",
  neutral: "border-[#E4DED2] bg-white text-[#20342B]",
} as const;

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function MetricCard({
  helper,
  label,
  tone,
  value,
  suffix = "",
}: {
  helper: string;
  label: string;
  tone: keyof typeof toneClasses;
  value: number;
  suffix?: string;
}) {
  return (
    <article className={`rounded-[24px] border px-4 py-4 ${toneClasses[tone]}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] opacity-75">
        {label}
      </p>
      <p className="mt-2 text-[2rem] font-black leading-none tracking-[-0.06em]">
        {value}
        {suffix}
      </p>
      <p className="mt-2 text-[12px] font-semibold leading-5 opacity-82">
        {helper}
      </p>
    </article>
  );
}

function CountList({
  emptyLabel,
  items,
}: {
  emptyLabel: string;
  items: Array<{ label: string; count: number }>;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-[18px] border border-[#E4DED2] bg-white px-4 py-3 text-[13px] font-semibold text-[#6B746D]">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-3 rounded-[18px] border border-[#E4DED2] bg-white px-4 py-3"
        >
          <span className="text-[13px] font-bold text-[#26362F]">
            {item.label}
          </span>
          <span className="rounded-full bg-[#F4F0E6] px-2.5 py-1 text-[11px] font-black text-[#526057]">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function Section({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="rounded-[30px] border border-white/75 bg-[var(--surface-strong)] px-4 py-5 shadow-[var(--shadow)]">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-[1.35rem] font-black tracking-[-0.04em] text-[#111D18]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DashboardBody({
  summary,
  warnings,
}: {
  summary: AnalyticsSummary;
  warnings: string[];
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-[30px] border border-[#CFE8D9] bg-[#F2FBF4] px-4 py-5 shadow-[var(--shadow)]">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
          Internal analytics
        </p>
        <h1 className="mt-1 text-[2rem] font-black leading-none tracking-[-0.06em] text-[#102019]">
          Truthlabel health dashboard
        </h1>
        <p className="mt-3 text-[13px] font-semibold leading-5 text-[#53635A]">
          Last {summary.periodDays} days. Generated {formatDate(summary.generatedAt)}.
        </p>
      </section>

      {warnings.length > 0 ? (
        <section className="rounded-[24px] border border-[#F0D274] bg-[#FFF8D7] px-4 py-4 text-[#7A4B00]">
          <p className="text-[11px] font-black uppercase tracking-[0.16em]">
            Setup warnings
          </p>
          <ul className="mt-2 grid gap-1.5 text-[13px] font-semibold leading-5">
            {warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {summary.alerts.length > 0 ? (
        <Section eyebrow="Alerts" title="Needs attention">
          <div className="grid gap-3">
            {summary.alerts.map((alert) => (
              <article
                key={alert.id}
                className={`rounded-[22px] border px-4 py-4 ${toneClasses[alert.tone]}`}
              >
                <p className="text-[14px] font-black">{alert.title}</p>
                <p className="mt-1 text-[13px] font-semibold leading-5 opacity-85">
                  {alert.message}
                </p>
              </article>
            ))}
          </div>
        </Section>
      ) : (
        <section className="rounded-[24px] border border-[#A7DCC2] bg-[#EFFAF3] px-4 py-4 text-[#0E5A3F]">
          <p className="text-[13px] font-black">No urgent analytics alerts yet.</p>
          <p className="mt-1 text-[12px] font-semibold leading-5 opacity-85">
            Keep watching signup, checkout, activation, scan, barcode, and OCR flows.
          </p>
        </section>
      )}

      <Section eyebrow="Business" title="Business health">
        <div className="grid gap-3 sm:grid-cols-2">
          {summary.business.metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helper={metric.helper}
              tone={metric.tone}
            />
          ))}
        </div>
      </Section>

      <Section eyebrow="Funnel" title="Conversion checkpoints">
        <div className="grid gap-3 sm:grid-cols-2">
          {summary.business.conversionRates.map((rate) => (
            <MetricCard
              key={rate.label}
              label={rate.label}
              value={rate.value}
              suffix="%"
              helper={rate.helper}
              tone={rate.value > 0 ? "green" : "neutral"}
            />
          ))}
        </div>
      </Section>

      <Section eyebrow="Reliability" title="App flow health">
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard
            label="Total events"
            value={summary.reliability.totalEvents}
            helper="All captured app events in this period."
            tone="neutral"
          />
          <MetricCard
            label="Visitors"
            value={summary.reliability.uniqueVisitors}
            helper="Anonymous local browser IDs seen."
            tone="neutral"
          />
          <MetricCard
            label="Signed-in users"
            value={summary.reliability.signedInUsers}
            helper="Distinct authenticated users seen."
            tone="neutral"
          />
          <MetricCard
            label="Results loaded"
            value={summary.reliability.resultPagesLoaded}
            helper="Result pages opened after scans or demos."
            tone="green"
          />
          {summary.reliability.metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              suffix={metric.label.includes("success") ? "%" : ""}
              helper={metric.helper}
              tone={metric.tone}
            />
          ))}
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Section eyebrow="Devices" title="Device mix">
          <CountList
            emptyLabel="No device data yet."
            items={summary.reliability.deviceBreakdown}
          />
        </Section>
        <Section eyebrow="Browsers" title="Browser mix">
          <CountList
            emptyLabel="No browser data yet."
            items={summary.reliability.browserBreakdown}
          />
        </Section>
        <Section eyebrow="Errors" title="Top error types">
          <CountList
            emptyLabel="No tracked errors yet."
            items={summary.reliability.topErrorTypes}
          />
        </Section>
      </div>
    </div>
  );
}

export default function InternalAnalyticsDashboard() {
  const { user } = useTruthlabelAuth();
  const [periodDays, setPeriodDays] = useState(7);
  const [response, setResponse] = useState<AnalyticsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const supabase = getSupabaseBrowserClient();

        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Sign in before opening the analytics dashboard.");
        }

        const result = await fetch(`/api/analytics/summary?periodDays=${periodDays}`, {
          headers: {
            authorization: `Bearer ${session.access_token}`,
          },
        });
        const payload = (await result.json()) as AnalyticsSummaryResponse;

        if (!active) {
          return;
        }

        if (!result.ok || !payload.ok) {
          throw new Error(payload.message || "Analytics summary could not load.");
        }

        setResponse(payload);
      } catch (error) {
        if (!active) {
          return;
        }

        setResponse(null);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Analytics summary could not load.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      active = false;
    };
  }, [periodDays]);

  return (
    <main className="min-h-screen px-4 py-5 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-[980px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/app"
            className="rounded-full border border-[#E4DED2] bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#34443C]"
          >
            Back to app
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-[#E4DED2] bg-white p-1">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setPeriodDays(days)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] ${
                  periodDays === days
                    ? "bg-[#182B22] text-white"
                    : "text-[#53635A]"
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {user?.email ? (
          <p className="px-1 text-[12px] font-semibold text-[#6B746D]">
            Signed in as {user.email}
          </p>
        ) : null}

        {isLoading ? (
          <section className="rounded-[30px] border border-[#E4DED2] bg-white px-5 py-6 text-center shadow-[var(--shadow)]">
            <p className="text-[13px] font-black text-[#53635A]">
              Loading analytics summary...
            </p>
          </section>
        ) : null}

        {errorMessage ? (
          <section className="rounded-[24px] border border-[#F0A29A] bg-[#FFF1EF] px-4 py-4 text-[#8F1D16]">
            <p className="text-[13px] font-black">Analytics could not load.</p>
            <p className="mt-1 text-[12px] font-semibold leading-5">
              {errorMessage}
            </p>
          </section>
        ) : null}

        {response?.summary ? (
          <DashboardBody
            summary={response.summary}
            warnings={response.warnings ?? []}
          />
        ) : null}
      </div>
    </main>
  );
}
