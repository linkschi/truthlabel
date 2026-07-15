"use client";

import { useState } from "react";
import ConcernDot from "@/components/ConcernDot";
import { RowActionText, StatusPill } from "@/components/ResultUi";
import type { AnalyzedNutrient } from "@/lib/analyzeProduct";

type NutrientListProps = {
  nutrients: AnalyzedNutrient[];
  onSelect: (item: AnalyzedNutrient) => void;
  emptyState?: {
    title: string;
    text: string;
  };
};

const rowToneClasses = {
  green: "rounded-[12px] bg-transparent hover:bg-[#fbf8f2]",
  yellow: "rounded-[12px] bg-transparent hover:bg-[#fbf8f2]",
  red: "rounded-[12px] bg-[#fdf8f7] hover:bg-[#fbf2f1]",
} as const;

export default function NutrientList({
  nutrients,
  onSelect,
  emptyState,
}: NutrientListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const redCount = nutrients.filter((nutrient) => nutrient.level === "red").length;

  return (
    <section className="border-b border-[var(--line)] px-4 py-3.5">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-[#e9dfd1] bg-white/74 px-3.5 py-3 text-left transition hover:bg-[#fbf8f2] active:scale-[0.99]"
      >
        <p className="min-w-0 truncate text-[14px] font-semibold text-[#1c2b24]">
          Nutrition Breakdown
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#617068]">{nutrients.length} checks</span>
          {redCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#e7d7d4] bg-[#f7ecea] px-2 py-1 text-[10px] font-semibold text-[#896560]">
              <ConcernDot level="red" />
              {redCount}
            </span>
          ) : null}
          <span
            className={`text-[#66756d] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6.5L8 10L12 6.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </button>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${isOpen ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="min-h-0">
          {nutrients.length > 0 ? (
            <div className="divide-y divide-[#eee4d5]">
              {nutrients.map((nutrient) => (
                <button
                  key={nutrient.key}
                  type="button"
                  onClick={() => onSelect(nutrient)}
                  className={`grid min-h-[2.5rem] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-1.5 px-1 py-2.5 text-left transition active:scale-[0.99] sm:gap-2 ${rowToneClasses[nutrient.level]}`}
                >
                  <ConcernDot level={nutrient.level} />
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-[14px] font-medium text-[#1b2c24]">
                      {nutrient.name}
                    </span>
                    {/\d/.test(nutrient.value) ? (
                      <span className="shrink-0 text-[11px] text-[#607067]">
                        {nutrient.value}
                      </span>
                    ) : null}
                  </div>
                  <StatusPill tone={nutrient.level} className="justify-self-end">
                    {nutrient.rowStatusLabel}
                  </StatusPill>
                  {nutrient.level !== "green" ? (
                    <RowActionText tone={nutrient.level} />
                  ) : (
                    <span />
                  )}
                </button>
              ))}
            </div>
          ) : emptyState ? (
            <div className="rounded-[18px] border border-[#e7decf] bg-[#faf7f0] px-3.5 py-3.5">
              <p className="text-[13px] font-semibold text-[#1c2b24]">{emptyState.title}</p>
              <p className="mt-1.5 text-[13px] leading-5 text-[#55645c]">{emptyState.text}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
