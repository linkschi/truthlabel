"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import AppBottomNavigation from "@/components/AppBottomNavigation";
import {
  defaultDemoProductId,
  demoProducts,
  getDemoProductById,
} from "@/data/demoProducts";
import { publicAppConfig } from "@/lib/appConfig";
import { saveProfile, useStoredProfile } from "@/lib/profileStorage";
import { useUserSettings } from "@/lib/userSettings/userSettingsStorage";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import RecentScansSection from "@/components/scanHistory/RecentScansSection";

type HomeIconName =
  | "activity"
  | "arrow"
  | "barcode"
  | "camera"
  | "chevron"
  | "clipboard"
  | "code"
  | "file"
  | "history"
  | "home"
  | "list"
  | "search"
  | "settings"
  | "shield"
  | "spark"
  | "user";

type AccordionId = "developer";
type Tint = "green" | "yellow" | "red" | "neutral";

const defaultProductHref = `/app/results?category=packaged-processed-foods&demo=${defaultDemoProductId}`;
const defaultDemoProduct = getDemoProductById(defaultDemoProductId);
const featureFlags = publicAppConfig.flags;
const showLocalInternalTools = featureFlags.enableLocalDevBypass;

function Icon({ name, className = "" }: { name: HomeIconName; className?: string }) {
  const commonProps = {
    "aria-hidden": true,
    className: `h-5 w-5 ${className}`,
    fill: "none",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (name) {
    case "activity":
      return (
        <svg {...commonProps}>
          <path
            d="M4 13h3l2-6 4 11 3-8h4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "arrow":
      return (
        <svg {...commonProps}>
          <path
            d="M7 17 17 7M9 7h8v8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "barcode":
      return (
        <svg {...commonProps}>
          <path
            d="M5 6v12M8 6v12M12 6v12M16 6v12M19 6v12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <path
            d="M3 5V3h3M18 3h3v2M21 19v2h-3M6 21H3v-2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "camera":
      return (
        <svg {...commonProps}>
          <path
            d="M5 8.5h3l1.4-2h5.2l1.4 2h3A1.8 1.8 0 0 1 20.8 10v7A1.8 1.8 0 0 1 19 18.8H5A1.8 1.8 0 0 1 3.2 17v-7A1.8 1.8 0 0 1 5 8.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M12 16a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "chevron":
      return (
        <svg {...commonProps}>
          <path
            d="m7.5 9 4.5 4.5L16.5 9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...commonProps}>
          <path
            d="M9 5h6M9 9h6M8 13h8M8 17h5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
          <path
            d="M8.5 3.8h7A2.5 2.5 0 0 1 18 6.3v12.2A2.5 2.5 0 0 1 15.5 21h-7A2.5 2.5 0 0 1 6 18.5V6.3a2.5 2.5 0 0 1 2.5-2.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "code":
      return (
        <svg {...commonProps}>
          <path
            d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "file":
      return (
        <svg {...commonProps}>
          <path
            d="M7 3.5h6l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7.5 3.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M13 3.8V8h4M8.5 12h7M8.5 15.5h5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "home":
      return (
        <svg {...commonProps}>
          <path
            d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1h-4.2v-5.6H9.2V21H5a1 1 0 0 1-1-1v-9.2Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "history":
      return (
        <svg {...commonProps}>
          <path
            d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 8.9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M4.5 5v4h4M12 8v4.3l3 1.7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "list":
      return (
        <svg {...commonProps}>
          <path
            d="M8 7h11M8 12h11M8 17h11"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <path
            d="M4.5 7h.01M4.5 12h.01M4.5 17h.01"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
      );
    case "search":
      return (
        <svg {...commonProps}>
          <path
            d="M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM16 16l3.5 3.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <path
            d="m8.5 11.5 1.7 1.7 3.4-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "settings":
      return (
        <svg {...commonProps}>
          <path
            d="M12 15.3a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M19.2 13.6v-3.2l-2-.5a6.6 6.6 0 0 0-.7-1.6l1.1-1.7-2.2-2.2-1.7 1.1a6.6 6.6 0 0 0-1.6-.7l-.5-2H10.4l-.5 2a6.6 6.6 0 0 0-1.6.7L6.6 4.4 4.4 6.6l1.1 1.7a6.6 6.6 0 0 0-.7 1.6l-2 .5v3.2l2 .5c.2.6.4 1.1.7 1.6l-1.1 1.7 2.2 2.2 1.7-1.1c.5.3 1 .5 1.6.7l.5 2h3.2l.5-2c.6-.2 1.1-.4 1.6-.7l1.7 1.1 2.2-2.2-1.1-1.7c.3-.5.5-1 .7-1.6l2-.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.45"
          />
        </svg>
      );
    case "shield":
      return (
        <svg {...commonProps}>
          <path
            d="M12 21s7-3.4 7-10.2V5.4L12 3 5 5.4v5.4C5 17.6 12 21 12 21Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="m8.8 12 2 2 4.4-4.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "spark":
      return (
        <svg {...commonProps}>
          <path
            d="M12 3.5 13.4 9l5.1 1.5-5.1 1.5L12 17.5 10.6 12l-5.1-1.5L10.6 9 12 3.5ZM18 15l.6 2.1 1.9.6-1.9.6L18 20.5l-.6-2.2-1.9-.6 1.9-.6L18 15Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "user":
      return (
        <svg {...commonProps}>
          <path
            d="M12 12.2a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.8 20.2c.7-3.6 3.4-5.7 7.2-5.7s6.5 2.1 7.2 5.7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
  }
}

function tintClasses(tint: Tint) {
  switch (tint) {
    case "yellow":
      return "bg-[#FFF6D8] text-[#8A6500]";
    case "red":
      return "bg-[#FDEDEE] text-[#A33A3F]";
    case "neutral":
      return "bg-[#F6F8F7] text-[#66716B]";
    case "green":
    default:
      return "bg-[#E8F6EF] text-[#0E5A3F]";
  }
}

function TruthlabelMark() {
  return (
    <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-[#0E4C37] shadow-[0_7px_18px_rgba(14,76,55,0.18)]">
      <span className="grid gap-[3px]">
        <span className="h-[3px] w-[18px] rounded-full bg-[#E64B4F]" />
        <span className="h-[3px] w-[18px] rounded-full bg-[#F5C542]" />
        <span className="h-[3px] w-[18px] rounded-full bg-[#32A66A]" />
      </span>
    </span>
  );
}

function HomeHeader() {
  return (
    <header className="flex min-h-[58px] items-center justify-between gap-4">
      <Link
        href="/app"
        className="flex items-center gap-2.5 rounded-[14px] outline-none transition focus-visible:ring-2 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-2"
        aria-label="Truthlabel home"
      >
        <TruthlabelMark />
        <span className="text-[20px] font-extrabold tracking-[-0.02em] text-[#101613]">
          Truth<span className="text-[#0E5A3F]">label</span>
        </span>
      </Link>

      <Link
        href="/app/account"
        aria-label="Open Truthlabel account"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D7E7DD] bg-[#E8F6EF] text-[#0E5A3F] transition hover:bg-[#DDF0E7] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        <Icon name="user" className="h-[21px] w-[21px]" />
      </Link>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="mt-3">
      <h1 className="max-w-[330px] text-[32px] font-black leading-[1.05] tracking-[-0.025em] text-[#101613] min-[390px]:text-[34px]">
        Scan before you{" "}
        <span className="text-[#0E5A3F]">trust it.</span>
      </h1>
      <p className="mt-3 max-w-[360px] text-[14.5px] leading-[1.5] text-[#66716B]">
        Scan a barcode or paste an ingredient list to see what deserves your attention.
      </p>
    </section>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[14px] font-bold leading-none text-[#101613]">
      {children}
    </h2>
  );
}

function ScanActionCard({
  href,
  icon,
  title,
  description,
  action,
  tone = "light",
  onClick,
}: {
  href: string;
  icon: HomeIconName;
  title: string;
  description: string;
  action: string;
  tone?: "primary" | "light";
  onClick: () => void;
}) {
  const isPrimary = tone === "primary";

  if (isPrimary) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-label="Scan a product"
        className="group flex min-h-[190px] flex-col rounded-[20px] border border-[#0E5A3F] bg-[#0E5A3F] p-5 text-white shadow-[0_12px_28px_rgba(14,90,63,0.18)] outline-none transition duration-200 ease-out hover:-translate-y-px hover:shadow-[0_14px_34px_rgba(14,90,63,0.22)] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.985]"
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-[15px] bg-white/14 text-white">
          <Icon name={icon} className="h-[23px] w-[23px]" />
        </span>
        <span className="mt-auto block pt-10">
          <span className="block text-[20px] font-extrabold tracking-[-0.015em]">
            {title}
          </span>
          <span className="mt-2 block max-w-[310px] text-[13.5px] leading-[1.5] text-white/80">
            {description}
          </span>
          <span className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-[13px] font-extrabold text-[#0E5A3F] transition group-hover:bg-[#F8FAF8]">
            {action}
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="Paste ingredients"
      className="group grid min-h-[108px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[20px] border border-[#DCE7E1] bg-white p-4 text-[#101613] shadow-[0_8px_24px_rgba(15,40,28,0.07)] outline-none transition duration-200 ease-out hover:-translate-y-px hover:border-[#BFD7C9] hover:shadow-[0_12px_28px_rgba(15,40,28,0.1)] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.985]"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#E8F6EF] text-[#0E5A3F]">
        <Icon name={icon} className="h-[22px] w-[22px]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[18px] font-extrabold tracking-[-0.01em]">
          {title}
        </span>
        <span className="mt-1.5 block text-[13px] leading-[1.45] text-[#66716B]">
          {description}
        </span>
        <span className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full border border-[#D7E7DD] bg-[#F8FAF8] px-4 text-[12px] font-extrabold text-[#0E5A3F]">
          {action}
        </span>
      </span>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F8F7] text-[#0E5A3F] transition group-hover:scale-105">
        <Icon name="arrow" className="h-4 w-4" />
      </span>
    </Link>
  );
}

function ScanActionGrid({ onNavigate }: { onNavigate: () => void }) {
  return (
    <section className="mt-6">
      <SectionHeading>Start a scan</SectionHeading>
      <div className="mt-3 grid gap-3">
        <ScanActionCard
          href="/app/manual?mode=camera"
          icon="camera"
          title="Scan a product"
          description="Point your camera at a product barcode for an instant ingredient check."
          action="Start scan"
          tone="primary"
          onClick={onNavigate}
        />
        <ScanActionCard
          href="/app/manual"
          icon="clipboard"
          title="Paste ingredients"
          description="Enter an ingredient list when a barcode is unavailable."
          action="Enter ingredients"
          onClick={onNavigate}
        />
      </div>
    </section>
  );
}

function AccordionCard({
  id,
  icon,
  tint,
  title,
  summary,
  activeAccordion,
  onToggle,
  children,
}: {
  id: AccordionId;
  icon: HomeIconName;
  tint: Tint;
  title: string;
  summary: string;
  activeAccordion: AccordionId | null;
  onToggle: (id: AccordionId) => void;
  children: ReactNode;
}) {
  const isOpen = activeAccordion === id;
  const contentId = `home-accordion-${id}`;

  return (
    <div className="rounded-[16px] border border-[#E2E8E4] bg-white shadow-[0_3px_12px_rgba(15,40,28,0.035)]">
      <button
        type="button"
        aria-controls={contentId}
        aria-expanded={isOpen}
        onClick={() => onToggle(id)}
        className="grid min-h-[62px] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-[16px] px-3.5 py-3 text-left outline-none transition duration-200 hover:bg-[#F6F8F7] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
      >
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-[13px] ${tintClasses(tint)}`}
        >
          <Icon name={icon} className="h-[19px] w-[19px]" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-extrabold text-[#101613]">
            {title}
          </span>
        </span>
        <span className="whitespace-nowrap text-[12px] font-semibold text-[#879089]">
          {summary}
        </span>
        <Icon
          name="chevron"
          className={`h-4 w-4 text-[#66716B] transition-transform duration-200 motion-reduce:transition-none ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        id={contentId}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-[#EEF1EF] px-3.5 py-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ToolRow({
  href,
  title,
  detail,
  meta,
  icon,
  onNavigate,
}: {
  href: string;
  title: string;
  detail: string;
  meta: string;
  icon: HomeIconName;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] px-2 py-2.5 outline-none transition hover:bg-[#F6F8F7] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99]"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#F6F8F7] text-[#66716B]">
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-bold text-[#101613]">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-[1.35] text-[#66716B]">
          {detail}
        </span>
      </span>
      <span className="rounded-full bg-[#F6F8F7] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#879089]">
        {meta}
      </span>
    </Link>
  );
}

function DeveloperDemoTools({ onNavigate }: { onNavigate: () => void }) {
  const manualDetail = featureFlags.enableBarcodeLookup
    ? "Type a barcode or paste a real ingredient list and run it through the current Truthlabel engine."
    : "Paste a real ingredient list and run it through the current Truthlabel engine.";

  return (
    <div className="space-y-1.5">
      <ToolRow
        href="/app/history"
        title="Save your scans"
        detail="Open the private scan history list for this account."
        meta="History"
        icon="history"
        onNavigate={onNavigate}
      />
      {featureFlags.enableDemoProducts ? (
        <ToolRow
          href={defaultProductHref}
          title="Explore a Sample Result"
          detail="Open the demo scanner report for this design pass."
          meta="Sample result"
          icon="file"
          onNavigate={onNavigate}
        />
      ) : null}
      <ToolRow
        href="/app/manual"
        title="Barcode or Manual Ingredients"
        detail={manualDetail}
        meta="Live input"
        icon="barcode"
        onNavigate={onNavigate}
      />
      <ToolRow
        href="/app/manual"
        title="Paste Real Label"
        detail="Add product name, brand, category, allergens, and packaging text if you have them."
        meta="Manual flow"
        icon="list"
        onNavigate={onNavigate}
      />
      {featureFlags.enableDemoProducts ? (
        <>
          <ToolRow
            href={defaultProductHref}
            title={defaultDemoProduct.productName}
            detail={`Default demo category: ${defaultDemoProduct.productCategory}`}
            meta="Demo scanner result"
            icon="spark"
            onNavigate={onNavigate}
          />
          <div className="rounded-[14px] border border-[#EEF1EF] bg-[#FAFBFA] px-2 py-2">
            <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#879089]">
              Try Demo Labels
            </p>
            <div className="divide-y divide-[#EEF1EF]">
              {demoProducts.map((product) => (
                <ToolRow
                  key={`developer-${product.id}`}
                  href={`/app/results?demo=${product.id}`}
                  title={product.productName}
                  detail={product.productCategory}
                  meta="Quick testing"
                  icon="code"
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function DeveloperToolsSection({
  activeAccordion,
  onToggle,
  onNavigate,
}: {
  activeAccordion: AccordionId | null;
  onToggle: (id: AccordionId) => void;
  onNavigate: () => void;
}) {
  if (!showLocalInternalTools) {
    return null;
  }

  return (
    <section className="mt-5">
      <AccordionCard
        id="developer"
        icon="code"
        tint="neutral"
        title="Developer & Demo Tools"
        summary="Local only"
        activeAccordion={activeAccordion}
        onToggle={onToggle}
      >
        <DeveloperDemoTools onNavigate={onNavigate} />
      </AccordionCard>
    </section>
  );
}

function ProtectionSummary({
  allergyCount,
  preferenceCount,
  customCount,
}: {
  allergyCount: number;
  preferenceCount: number;
  customCount: number;
}) {
  const rows = [
    {
      icon: "shield" as const,
      label: "Allergy Watch List",
      value: allergyCount,
      status: "active",
      tint: "red" as const,
    },
    {
      icon: "settings" as const,
      label: "Food preferences",
      value: preferenceCount,
      status: "selected",
      tint: "yellow" as const,
    },
    {
      icon: "list" as const,
      label: "Custom ingredients",
      value: customCount,
      status: "watched",
      tint: "green" as const,
    },
  ];

  return (
    <section className="mt-6" aria-labelledby="protection-title">
      <div className="rounded-[22px] border border-[#DCE7E1] bg-white p-4 shadow-[0_8px_26px_rgba(15,40,28,0.055)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2
              id="protection-title"
              className="text-[18px] font-extrabold text-[#101613]"
            >
              Your protection
            </h2>
            <p className="mt-1 text-[12.5px] leading-5 text-[#66716B]">
              Saved checks without showing private Watch List names.
            </p>
          </div>
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#E8F6EF] text-[#0E5A3F]">
            <Icon name="shield" className="h-[21px] w-[21px]" />
          </span>
        </div>

        <div className="mt-4 divide-y divide-[#EEF1EF]">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid min-h-[58px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-2.5"
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-[13px] ${tintClasses(row.tint)}`}
              >
                <Icon name={row.icon} className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 text-[14px] font-extrabold text-[#101613]">
                {row.label}
              </span>
              <span className="rounded-full border border-[#E2E8E4] bg-[#F8FAF8] px-3 py-1.5 text-[12px] font-extrabold text-[#27332E]">
                {row.value} {row.status}
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/app/account"
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-full bg-[#0E5A3F] px-4 text-[13px] font-extrabold text-white outline-none transition hover:bg-[#0B4A34] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99]"
        >
          Manage Watch List
        </Link>
      </div>
    </section>
  );
}

export default function HomeScreen() {
  const profile = useStoredProfile();
  const settings = useUserSettings();
  const [activeAccordion, setActiveAccordion] = useState<AccordionId | null>(null);
  const allergyCount = settings.allergyProfile.allergens.length;
  const customCount = settings.allergyProfile.customAllergens.length;
  const preferenceCount = profile.avoid.length;

  function handleNavigate() {
    saveProfile(profile);
  }

  function handleToggleAccordion(id: AccordionId) {
    setActiveAccordion((current) => (current === id ? null : id));
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8FAF8] px-[18px] pt-[calc(12px+env(safe-area-inset-top))] text-[#101613] sm:px-5">
      <div className="mx-auto w-full max-w-[480px] pb-[calc(100px+env(safe-area-inset-bottom))]">
        <HomeHeader />
        <HeroSection />
        <ScanActionGrid onNavigate={handleNavigate} />
        <RecentScansSection onScanProduct={handleNavigate} />
        <ProtectionSummary
          allergyCount={allergyCount}
          preferenceCount={preferenceCount}
          customCount={customCount}
        />
        <PwaInstallPrompt />
        <DeveloperToolsSection
          activeAccordion={activeAccordion}
          onToggle={handleToggleAccordion}
          onNavigate={handleNavigate}
        />
      </div>
      <AppBottomNavigation />
    </main>
  );
}
