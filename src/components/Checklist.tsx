import ConcernDot from "@/components/ConcernDot";
import {
  RowActionText,
  SectionLabel,
  SectionMeta,
  StatusPill,
} from "@/components/ResultUi";
import type { ScanCheckItem } from "@/lib/analyzeProduct";

type ChecklistProps = {
  items: ScanCheckItem[];
  onSelect: (item: ScanCheckItem) => void;
};

const rowToneClasses = {
  red: "rounded-[12px] bg-[#fdf8f7]",
  yellow: "rounded-[12px] bg-[#fdfaf4]",
  green: "rounded-[12px] bg-transparent",
  neutral: "rounded-[12px] bg-transparent",
} as const;

function CheckDot({ tone }: { tone: ScanCheckItem["tone"] }) {
  if (tone === "neutral") {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9c0b0]"
      />
    );
  }

  return <ConcernDot level={tone} />;
}

export default function Checklist({ items, onSelect }: ChecklistProps) {
  const itemCount = items.length;

  return (
    <section className="border-b border-[var(--line)] px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>What We Looked For</SectionLabel>
        <SectionMeta>{itemCount} checks</SectionMeta>
      </div>

      <div className="mt-2 divide-y divide-[#eee4d5]">
        {items.map((item) => {
          const isInteractive = item.tone === "red" || item.tone === "yellow";
          const actionTone = item.tone === "red" ? "red" : "yellow";
          const content = (
            <div
              className={`grid min-h-[2.5rem] grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-1.5 px-1 py-2.5 text-left transition sm:gap-2 ${rowToneClasses[item.tone]}`}
            >
              <CheckDot tone={item.tone} />
              <span className="truncate text-[14px] font-medium text-[#25352d]">
                {item.label}
              </span>
              <StatusPill
                tone={item.tone === "neutral" ? "neutral" : item.tone}
                className="justify-self-end"
              >
                {item.status}
              </StatusPill>
              {isInteractive ? <RowActionText tone={actionTone} /> : <span />}
            </div>
          );

          if (isInteractive && item.modal) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className="w-full transition active:scale-[0.99]"
              >
                {content}
              </button>
            );
          }

          return <div key={item.id}>{content}</div>;
        })}
      </div>
    </section>
  );
}
