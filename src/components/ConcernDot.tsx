import type { ConcernLevel } from "@/data/fakeProduct";

const toneClasses: Record<ConcernLevel, string> = {
  green: "bg-[var(--green-main)]",
  yellow: "bg-[var(--amber-main)]",
  red: "bg-[var(--red-main)]",
};

type ConcernDotProps = {
  level: ConcernLevel;
  className?: string;
};

export default function ConcernDot({ level, className = "" }: ConcernDotProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${toneClasses[level]} ${className}`}
    />
  );
}
