import { SectionLabel } from "@/components/ResultUi";
import type { OverallSummaryContent } from "@/lib/summaryEngine";

type OverallSummaryProps = {
  summary: OverallSummaryContent;
};

export default function OverallSummary({ summary }: OverallSummaryProps) {
  return (
    <section className="px-4 py-3.5">
      <SectionLabel>Final Verdict</SectionLabel>
      <h2 className="mt-1.5 font-heading text-[1.1rem] font-semibold text-[#17251f]">
        {summary.title}
      </h2>
      <p className="mt-2 text-[14px] leading-5 text-[#56645c]">{summary.intro}</p>
      <p className="mt-1.5 text-[13px] leading-5 text-[#445249]">{summary.recommendation}</p>
    </section>
  );
}
