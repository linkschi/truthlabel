"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  defaultDemoProductId,
  demoProducts,
  getDemoProductById,
} from "@/data/demoProducts";
import { publicAppConfig } from "@/lib/appConfig";
import { saveProfile, useStoredProfile } from "@/lib/profileStorage";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

type HomeIconName =
  | "activity"
  | "arrow"
  | "barcode"
  | "camera"
  | "chevron"
  | "clipboard"
  | "code"
  | "file"
  | "home"
  | "list"
  | "search"
  | "settings"
  | "shield"
  | "spark"
  | "user";

type AccordionId = "how" | "watch" | "developer";
type Tint = "green" | "yellow" | "red" | "neutral";

const defaultProductHref = `/product?category=packaged-processed-foods&demo=${defaultDemoProductId}`;
const defaultDemoProduct = getDemoProductById(defaultDemoProductId);
const featureFlags = publicAppConfig.flags;

const capabilityPills = [
  { label: "Barcode", icon: "barcode" as const, tint: "red" as const },
  { label: "Ingredients", icon: "list" as const, tint: "yellow" as const },
  { label: "OCR", icon: "camera" as const, tint: "green" as const },
];

const valuePreviewItems = [
  {
    icon: "search" as const,
    label: "Ingredient flags",
    tint: "red" as const,
  },
  {
    icon: "activity" as const,
    label: "Exposure score",
    tint: "yellow" as const,
  },
  {
    icon: "shield" as const,
    label: "Clear verdict",
    tint: "green" as const,
  },
];

const howItWorksSteps = [
  "Scan or enter the ingredient list.",
  "Truthlabel analyses ingredients and exposure checks.",
  "Review highlighted concerns, explanations, and the final verdict.",
] as const;

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
    <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-[linear-gradient(145deg,#B91C1C_0%,#EA580C_100%)] shadow-[0_7px_18px_rgba(185,28,28,0.18)]">
      <span className="grid gap-[3px]">
        <span className="h-[3px] w-[18px] rounded-full bg-white" />
        <span className="h-[3px] w-[18px] rounded-full bg-[#FDE68A]" />
        <span className="h-[3px] w-[18px] rounded-full bg-[#86EFAC]" />
      </span>
    </span>
  );
}

function HomeHeader() {
  return (
    <header className="flex min-h-[58px] items-center justify-between gap-4">
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-[14px] outline-none transition focus-visible:ring-2 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-2"
        aria-label="Truthlabel home"
      >
        <TruthlabelMark />
        <span className="text-[20px] font-extrabold tracking-[-0.02em] text-[#101613]">
          Truth<span className="text-[#B91C1C]">label</span>
        </span>
      </Link>

      <Link
        href="/account"
        aria-label="Open Truthlabel account"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#F3D2D4] bg-[#FDEDEE] text-[#A33A3F] transition hover:bg-[#FBE0E2] focus-visible:ring-2 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-2 active:scale-[0.98]"
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
        <span className="text-[#B91C1C]">trust it.</span>
      </h1>
      <p className="mt-3 max-w-[360px] text-[14.5px] leading-[1.5] text-[#66716B]">
        Truthlabel scans barcodes and ingredient labels to help you understand what a food product contains.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {capabilityPills.map((pill) => (
          <span
            key={pill.label}
            className={`inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold ${tintClasses(pill.tint)}`}
          >
            <Icon name={pill.icon} className="h-3.5 w-3.5" />
            {pill.label}
          </span>
        ))}
      </div>
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
  capabilities,
  variant,
  onClick,
}: {
  href: string;
  icon: HomeIconName;
  title: string;
  description: string;
  capabilities: string;
  variant: "manual" | "camera";
  onClick: () => void;
}) {
  const isCamera = variant === "camera";
  const cardClasses = isCamera
    ? "border-transparent bg-[linear-gradient(145deg,#B91C1C_0%,#EA580C_100%)] text-white shadow-[0_9px_24px_rgba(185,28,28,0.18)] hover:shadow-[0_11px_28px_rgba(185,28,28,0.22)] focus-visible:ring-white"
    : "border-[#F3E4A9] bg-[#FFFBEA] text-[#101613] shadow-[0_5px_18px_rgba(92,60,10,0.07)] hover:border-[#E7C95D] hover:shadow-[0_8px_22px_rgba(92,60,10,0.09)] focus-visible:ring-[#B45309]";
  const iconClasses = isCamera
    ? "bg-white/15 text-white ring-1 ring-white/22"
    : "bg-[#FFF6D8] text-[#8A6500]";
  const arrowClasses = isCamera
    ? "bg-white/92 text-[#B91C1C]"
    : "bg-white text-[#8A6500]";
  const mutedText = isCamera ? "text-white/78" : "text-[#66716B]";
  const capabilityText = isCamera ? "text-white/86" : "text-[#8A6500]";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex min-h-[176px] flex-col rounded-[18px] border p-4 outline-none transition duration-200 ease-out hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.985] ${cardClasses}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-[14px] ${iconClasses}`}
        >
          <Icon name={icon} className="h-[22px] w-[22px]" />
        </span>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition group-hover:scale-105 ${arrowClasses}`}
        >
          <Icon name="arrow" className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-auto pt-7">
        <h3 className="text-[17px] font-extrabold tracking-[-0.01em]">{title}</h3>
        <p className={`mt-1.5 text-[13px] leading-[1.45] ${mutedText}`}>
          {description}
        </p>
        <p className={`mt-3 text-[12px] font-semibold ${capabilityText}`}>
          {capabilities}
        </p>
      </div>
    </Link>
  );
}

function ScanActionGrid({ onNavigate }: { onNavigate: () => void }) {
  return (
    <section className="mt-6">
      <SectionHeading>Start a scan</SectionHeading>
      <div className="mt-3 grid grid-cols-2 gap-3 max-[349px]:grid-cols-1">
        <ScanActionCard
          href="/manual?mode=camera"
          icon="camera"
          title="Camera Scan"
          description="Scan a barcode or photograph an ingredient label."
          capabilities="Barcode / Camera / OCR"
          variant="camera"
          onClick={onNavigate}
        />
        <ScanActionCard
          href="/manual"
          icon="clipboard"
          title="Manual Scan"
          description="Enter a barcode or paste an ingredient list."
          capabilities="Barcode / Ingredient text"
          variant="manual"
          onClick={onNavigate}
        />
      </div>
    </section>
  );
}

function ValuePreview() {
  return (
    <section className="mt-6">
      <h2 className="text-[18px] font-extrabold text-[#101613]">
        What you&apos;ll see
      </h2>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {valuePreviewItems.map((item) => (
          <div
            key={item.label}
            className={`min-h-[96px] rounded-[16px] px-2.5 py-3 text-center ${tintClasses(item.tint)}`}
          >
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-[12px] bg-white/72">
              <Icon name={item.icon} className="h-[18px] w-[18px]" />
            </span>
            <p className="mt-2.5 text-[12px] font-extrabold leading-[1.2] text-[#101613]">
              {item.label}
            </p>
          </div>
        ))}
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
        className="grid min-h-[62px] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-[16px] px-3.5 py-3 text-left outline-none transition duration-200 hover:bg-[#F8F6F2] focus-visible:ring-2 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-2"
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

function HowItWorksSteps() {
  return (
    <ol className="space-y-0">
      {howItWorksSteps.map((step, index) => (
        <li key={step} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
          <div className="flex flex-col items-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF6D8] text-[12px] font-bold text-[#8A6500]">
              {index + 1}
            </span>
            {index < howItWorksSteps.length - 1 ? (
              <span className="my-1 h-7 w-px bg-[#F3E4A9]" />
            ) : null}
          </div>
          <p className="pb-4 pt-1 text-[13.5px] leading-[1.45] text-[#101613]">
            {step}
          </p>
        </li>
      ))}
    </ol>
  );
}

function WatchListPreview({ watchItems }: { watchItems: string[] }) {
  return (
    <div>
      {watchItems.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {watchItems.map((item) => (
            <span
              key={item}
              className="inline-flex rounded-full border border-[#F3D2D4] bg-[#FDEDEE] px-3 py-1.5 text-[12px] font-semibold text-[#A33A3F]"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="rounded-[14px] bg-[#F6F8F7] px-3 py-3 text-[13px] text-[#66716B]">
          No watch-list items selected.
        </p>
      )}

      <Link
        href="/settings"
        className="mt-3 flex min-h-[42px] w-full items-center justify-center rounded-[12px] border border-[#F3D2D4] bg-white px-4 text-[13px] font-bold text-[#A33A3F] transition hover:bg-[#FDEDEE] focus-visible:ring-2 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-2 active:scale-[0.99]"
      >
        {watchItems.length > 0 ? "Edit Watch List" : "Set Up Watch List"}
      </Link>
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
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] px-2 py-2.5 outline-none transition hover:bg-[#F8F6F2] focus-visible:ring-2 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-2 active:scale-[0.99]"
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
        href="/account"
        title="Save your scans"
        detail="Account and cross-device scan history are kept here while sign-in is still being built."
        meta="Account"
        icon="user"
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
        href="/manual"
        title="Manual Scan"
        detail={manualDetail}
        meta="Live input"
        icon="clipboard"
        onNavigate={onNavigate}
      />
      <ToolRow
        href="/manual"
        title="Paste Real Label"
        detail="Add product name, brand, category, allergens, and packaging text if you have them."
        meta="Manual flow"
        icon="list"
        onNavigate={onNavigate}
      />
      {process.env.NODE_ENV !== "production" ? (
        <ToolRow
          href="/manual?mode=camera&scannerDebug=1"
          title="Scanner Diagnostics"
          detail="Open the real camera scanner with safe stream, lens, focus, zoom, and decoder diagnostics."
          meta="Development only"
          icon="settings"
          onNavigate={onNavigate}
        />
      ) : null}
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
                  href={`/product?demo=${product.id}`}
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

function ExploreMore({
  activeAccordion,
  onToggle,
  watchItems,
  onNavigate,
}: {
  activeAccordion: AccordionId | null;
  onToggle: (id: AccordionId) => void;
  watchItems: string[];
  onNavigate: () => void;
}) {
  return (
    <section className="mt-6">
      <h2 className="text-[18px] font-extrabold text-[#101613]">Explore more</h2>
      <div className="mt-3 space-y-3">
        <AccordionCard
          id="how"
          icon="list"
          tint="yellow"
          title="How It Works"
          summary="3 steps"
          activeAccordion={activeAccordion}
          onToggle={onToggle}
        >
          <HowItWorksSteps />
        </AccordionCard>

        <AccordionCard
          id="watch"
          icon="settings"
          tint="red"
          title="Watch List"
          summary={watchItems.length > 0 ? `${watchItems.length} active` : "Not set"}
          activeAccordion={activeAccordion}
          onToggle={onToggle}
        >
          <WatchListPreview watchItems={watchItems} />
        </AccordionCard>

        <AccordionCard
          id="developer"
          icon="code"
          tint="neutral"
          title="Developer & Demo Tools"
          summary="Internal tools"
          activeAccordion={activeAccordion}
          onToggle={onToggle}
        >
          <DeveloperDemoTools onNavigate={onNavigate} />
        </AccordionCard>
      </div>
    </section>
  );
}

function TrustNote() {
  return (
    <section className="mt-6 rounded-[16px] border border-[#E9E1D2] bg-[#FBF8F1] px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#A33A3F]">
          <Icon name="shield" className="h-[19px] w-[19px]" />
        </span>
        <div>
          <h2 className="text-[14px] font-extrabold text-[#101613]">Trust Note</h2>
          <p className="mt-1 text-[13px] leading-[1.48] text-[#66716B]">
            Truthlabel helps explain ingredient labels and safety signals. It is not medical advice. Always check the product label, especially for allergies.
          </p>
        </div>
      </div>
    </section>
  );
}

function BottomNavigation() {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", icon: "home" as const, active: pathname === "/" },
    {
      href: "/manual",
      label: "Manual",
      icon: "clipboard" as const,
      active: pathname === "/manual",
    },
    {
      href: "/manual?mode=camera",
      label: "Camera",
      icon: "camera" as const,
      active: false,
    },
    {
      href: "/account",
      label: "Account",
      icon: "user" as const,
      active: pathname === "/account",
    },
  ];

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8E4] bg-white/96 shadow-[0_-8px_22px_rgba(15,40,28,0.06)] backdrop-blur"
    >
      <div className="mx-auto grid h-[66px] max-w-[480px] grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => (
          <Link
            key={`${item.label}-${item.href}`}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-[12px] text-[11px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-2 ${
              item.active ? "text-[#B91C1C]" : "text-[#5F6C65] hover:text-[#B91C1C]"
            }`}
          >
            <span
              className={`inline-flex h-[30px] w-9 items-center justify-center rounded-[12px] ${
                item.active ? "bg-[#FDEDEE]" : ""
              }`}
            >
              <Icon name={item.icon} className="h-[20px] w-[20px]" />
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function HomeScreen() {
  const profile = useStoredProfile();
  const [activeAccordion, setActiveAccordion] = useState<AccordionId | null>(null);
  const watchItems = [...profile.allergies, ...profile.avoid];

  function handleNavigate() {
    saveProfile(profile);
  }

  function handleToggleAccordion(id: AccordionId) {
    setActiveAccordion((current) => (current === id ? null : id));
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(253,237,238,0.78),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,246,216,0.82),transparent_31%),#FFFDFC] px-[18px] pt-[calc(12px+env(safe-area-inset-top))] text-[#101613] sm:px-5">
      <div className="mx-auto w-full max-w-[480px] pb-[calc(100px+env(safe-area-inset-bottom))]">
        <HomeHeader />
        <HeroSection />
        <ScanActionGrid onNavigate={handleNavigate} />
        <ValuePreview />
        <ExploreMore
          activeAccordion={activeAccordion}
          onToggle={handleToggleAccordion}
          watchItems={watchItems}
          onNavigate={handleNavigate}
        />
        <PwaInstallPrompt />
        <TrustNote />
      </div>
      <BottomNavigation />
    </main>
  );
}
