import type { ReactNode } from "react";
import type { ConcernLevel } from "@/data/fakeProduct";

type SectionTextProps = {
  children: ReactNode;
  className?: string;
};

type StatusTone = ConcernLevel | "neutral";

const statusToneClasses: Record<StatusTone, string> = {
  green: "border border-[#dde5de] bg-[#f6f8f4] text-[#66786d]",
  yellow: "border border-[#e6decf] bg-[#f8f3e8] text-[#86704a]",
  red: "border border-[#e7d7d4] bg-[#f7ecea] text-[#896560]",
  neutral: "border border-[#e1dbd0] bg-[#faf7f0] text-[#64736a]",
};

const actionToneClasses = {
  yellow: "text-[#97876e]",
  red: "text-[#9a817b]",
} as const;

export function SectionLabel({ children, className = "" }: SectionTextProps) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6d4f] ${className}`}
    >
      {children}
    </p>
  );
}

export function SectionMeta({ children, className = "" }: SectionTextProps) {
  return (
    <p
      className={`text-[11px] font-medium uppercase tracking-[0.14em] text-[#66756d] ${className}`}
    >
      {children}
    </p>
  );
}

type StatusPillProps = {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
};

export function StatusPill({
  tone,
  children,
  className = "",
}: StatusPillProps) {
  return (
    <span
      className={`inline-flex h-5 items-center justify-center whitespace-nowrap rounded-full px-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${statusToneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function RowActionText({
  tone,
  className = "",
}: {
  tone: "yellow" | "red";
  className?: string;
}) {
  return (
    <span
      className={`justify-self-end whitespace-nowrap text-right text-[8px] font-medium tracking-[0.04em] ${actionToneClasses[tone]} ${className}`}
    >
      <span className="hidden min-[361px]:inline">Tap to see why</span>
      <span className="min-[361px]:hidden">Why?</span>
    </span>
  );
}
