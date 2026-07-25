import { getScoreRingColor } from "@/lib/scanHistory/scanHistoryDisplay";
import type { ScanHistorySeverity } from "@/lib/scanHistory/scanHistoryTypes";

export default function ScanHistoryScoreRing({
  score,
  severity,
  size = 58,
  stroke = 4,
  label,
}: {
  score: number | null;
  severity: ScanHistorySeverity;
  size?: number;
  stroke?: number;
  label: string;
}) {
  const normalizedScore = Math.max(0, Math.min(100, score ?? 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - normalizedScore / 100);
  const center = size / 2;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ height: size, width: size }}
      role="img"
      aria-label={label}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 -rotate-90"
        height={size}
        width={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          stroke="#E8EEE9"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          stroke={getScoreRingColor(severity)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={stroke}
        />
      </svg>
      <span className="text-[13px] font-black text-[#101613]">
        {score ?? "--"}
      </span>
    </span>
  );
}
