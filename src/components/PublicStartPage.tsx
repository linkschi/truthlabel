"use client";

import Link from "next/link";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";

function BrandMark() {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#0E4C37] shadow-[0_10px_24px_rgba(14,76,55,0.18)]">
      <span className="grid gap-[3px]">
        <span className="h-[3px] w-[20px] rounded-full bg-[#E64B4F]" />
        <span className="h-[3px] w-[20px] rounded-full bg-[#F5C542]" />
        <span className="h-[3px] w-[20px] rounded-full bg-[#32A66A]" />
      </span>
    </span>
  );
}

function MenuButton() {
  return (
    <details className="group relative">
      <summary
        aria-label="Open menu"
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-[#D7E7DD] bg-white text-[#0E5A3F] shadow-[0_8px_20px_rgba(15,40,28,0.06)] [&::-webkit-details-marker]:hidden"
      >
        <span className="grid gap-1.5">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </summary>
      <div className="absolute right-0 top-13 z-30 w-[220px] rounded-[22px] border border-[#D7E7DD] bg-white p-2 shadow-[0_18px_44px_rgba(15,40,28,0.16)]">
        <Link
          href="/sign-in"
          className="block rounded-[16px] px-4 py-3 text-[14px] font-bold text-[#17251f] hover:bg-[#F3FAF6]"
        >
          Sign in
        </Link>
        <Link
          href="/landing"
          className="block rounded-[16px] px-4 py-3 text-[14px] font-bold text-[#17251f] hover:bg-[#F3FAF6]"
        >
          Full landing page
        </Link>
        <Link
          href="/privacy"
          className="block rounded-[16px] px-4 py-3 text-[14px] font-bold text-[#17251f] hover:bg-[#F3FAF6]"
        >
          Privacy
        </Link>
      </div>
    </details>
  );
}

function FeatureCard({
  title,
  copy,
  tone,
}: {
  title: string;
  copy: string;
  tone: "red" | "yellow" | "green";
}) {
  const toneClass =
    tone === "red"
      ? "border-[#F0C7C8] bg-[#FFF5F4] text-[#B91C1C]"
      : tone === "yellow"
        ? "border-[#F4E2A6] bg-[#FFF9E8] text-[#9A5C05]"
        : "border-[#CFE5D8] bg-[#F3FAF6] text-[#0E5A3F]";

  return (
    <article className={`rounded-[22px] border px-4 py-4 ${toneClass}`}>
      <p className="text-[13px] font-black">{title}</p>
      <p className="mt-1.5 text-[12.5px] leading-5 text-[#526158]">{copy}</p>
    </article>
  );
}

export default function PublicStartPage() {
  const { accessState, isConfigured } = useTruthlabelAuth();
  const isActive = accessState === "active";
  const isChecking = accessState === "loading";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(14,90,63,0.12),transparent_22rem),linear-gradient(180deg,#FFFFFF_0%,#F8F5EC_100%)] px-5 py-[calc(16px+env(safe-area-inset-top))] text-[#101613]">
      <div className="mx-auto flex min-h-[calc(100vh-32px)] w-full max-w-[520px] flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-[16px] outline-none focus-visible:ring-2 focus-visible:ring-[#E64B4F] focus-visible:ring-offset-2"
            aria-label="Truthlabel home"
          >
            <BrandMark />
            <span className="text-[22px] font-black tracking-[-0.03em]">
              Truth<span className="text-[#0E5A3F]">label</span>
            </span>
          </Link>
          <MenuButton />
        </header>

        <section className="flex flex-1 flex-col justify-center py-10">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0E5A3F]">
            Scan before you trust it
          </p>
          <h1 className="mt-3 max-w-[460px] text-[42px] font-black leading-[0.98] tracking-[-0.06em] text-[#101613] min-[420px]:text-[50px]">
            Understand food labels faster.
          </h1>
          <p className="mt-5 max-w-[430px] text-[16px] leading-7 text-[#526158]">
            Truthlabel helps you scan barcodes or ingredient lists and see the
            main warnings in plain English.
          </p>

          <div className="mt-7 grid gap-3">
            {isActive ? (
              <Link
                href="/app"
                className="flex min-h-[54px] items-center justify-center rounded-full bg-[#0E5A3F] px-6 text-[15px] font-black text-white shadow-[0_18px_38px_rgba(14,90,63,0.2)]"
              >
                Open Truthlabel
              </Link>
            ) : (
              <Link
                href="/create-account"
                className="flex min-h-[54px] items-center justify-center rounded-full bg-[#0E5A3F] px-6 text-[15px] font-black text-white shadow-[0_18px_38px_rgba(14,90,63,0.2)]"
              >
                Start my 7-day free trial
              </Link>
            )}
            <p className="text-center text-[12px] font-bold text-[#6B766F]">
              {isChecking
                ? "Checking your saved session..."
                : isConfigured
                  ? "7 days free - Cancel anytime"
                  : "Account setup is still being configured"}
            </p>
          </div>

          <div className="mt-8 grid gap-2.5">
            <FeatureCard
              tone="red"
              title="Serious warnings"
              copy="Banned, restricted, allergen, and safety signals are brought forward."
            />
            <FeatureCard
              tone="yellow"
              title="Ingredient review"
              copy="Additives, sweeteners, preservatives, processed oils, and overload patterns are explained."
            />
            <FeatureCard
              tone="green"
              title="Simple result"
              copy="See what was found, why it was flagged, and what action may make sense."
            />
          </div>
        </section>

        <footer className="pb-[env(safe-area-inset-bottom)] text-center text-[12px] leading-5 text-[#6B766F]">
          <p>Already have access? Open the menu and sign in.</p>
        </footer>
      </div>
    </main>
  );
}
