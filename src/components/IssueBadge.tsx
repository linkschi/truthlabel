import type { ReactNode } from "react";

type IssueBadgeColor = "red" | "yellow" | "green" | "neutral";

const badgeClasses: Record<IssueBadgeColor, string> = {
  red: "bg-[var(--red-main)] text-white",
  yellow: "bg-[var(--amber-main)] text-white",
  green: "bg-[var(--green-bg)] text-[var(--green-dark)]",
  neutral: "bg-[var(--neutral-bg)] text-[var(--neutral-text)]",
};

export default function IssueBadge({
  color,
  count,
  label,
  className = "",
}: {
  color: IssueBadgeColor;
  count?: number;
  label?: string;
  className?: string;
}) {
  const content: ReactNode = count !== undefined ? count : label;

  return (
    <span
      className={`inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[7px] text-[12px] font-bold leading-none ${badgeClasses[color]} ${className}`}
    >
      {content}
    </span>
  );
}
