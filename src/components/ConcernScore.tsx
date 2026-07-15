import type { ReactNode } from "react";
import { SectionLabel } from "@/components/ResultUi";

type ConcernScoreProps = {
  value: number;
  label: string;
  detail: string;
  visual?: ReactNode;
};

export default function ConcernScore({
  value,
  label,
  detail,
  visual,
}: ConcernScoreProps) {
  const progressWidth = `${Math.max(value * 10, 10)}%`;
  const progressClass =
    value >= 7 ? "bg-[var(--red)]" : value >= 4 ? "bg-[var(--yellow)]" : "bg-[var(--green)]";

  return (
    <div className="rounded-[24px] border border-[#e7decf] bg-[#fbf8f2] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <SectionLabel>Exposure Score</SectionLabel>
          <p className="mt-2 font-heading text-[2.35rem] font-semibold leading-none text-[#17251f]">
            {value}/10
          </p>
          <p className="mt-2 text-[1rem] font-semibold text-[#2b3b33]">{label}</p>
          <p className="mt-2 max-w-[15rem] text-[13px] leading-5 text-[#56645c]">
            {detail}
          </p>
        </div>
        {visual ? <div className="shrink-0">{visual}</div> : null}
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eee7db]">
        <div className={`h-full rounded-full ${progressClass}`} style={{ width: progressWidth }} />
      </div>
    </div>
  );
}
