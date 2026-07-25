import type {
  ScanHistoryListItem,
  ScanHistorySeverity,
} from "@/lib/scanHistory/scanHistoryTypes";

export type ScanHistoryDateGroup = {
  label: "Today" | "Yesterday" | "Earlier this week" | "Older";
  records: ScanHistoryListItem[];
};

export function getSeverityDotClass(severity: ScanHistorySeverity) {
  if (severity === "red") {
    return "bg-[var(--red-main)]";
  }

  if (severity === "yellow") {
    return "bg-[var(--amber-main)]";
  }

  return "bg-[var(--green-main)]";
}

export function getScoreRingColor(severity: ScanHistorySeverity) {
  if (severity === "red") {
    return "var(--red-main)";
  }

  if (severity === "yellow") {
    return "var(--amber-main)";
  }

  return "var(--green-main)";
}

function getStartOfDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function differenceInCalendarDays(left: Date, right: Date) {
  const leftStart = getStartOfDay(left).getTime();
  const rightStart = getStartOfDay(right).getTime();

  return Math.round((leftStart - rightStart) / (24 * 60 * 60 * 1000));
}

export function getHistoryDateGroupLabel(
  scannedAt: string,
  now = new Date(),
): ScanHistoryDateGroup["label"] {
  const date = new Date(scannedAt);
  const dayDelta = differenceInCalendarDays(now, date);

  if (dayDelta === 0) {
    return "Today";
  }

  if (dayDelta === 1) {
    return "Yesterday";
  }

  if (dayDelta < 7) {
    return "Earlier this week";
  }

  return "Older";
}

export function groupScanHistoryByDate(
  records: ScanHistoryListItem[],
  now = new Date(),
): ScanHistoryDateGroup[] {
  const orderedLabels: ScanHistoryDateGroup["label"][] = [
    "Today",
    "Yesterday",
    "Earlier this week",
    "Older",
  ];
  const groups = new Map<ScanHistoryDateGroup["label"], ScanHistoryListItem[]>();

  records.forEach((record) => {
    const label = getHistoryDateGroupLabel(record.scannedAt, now);
    groups.set(label, [...(groups.get(label) ?? []), record]);
  });

  return orderedLabels
    .map((label) => ({ label, records: groups.get(label) ?? [] }))
    .filter((group) => group.records.length > 0);
}

export function formatRelativeScanTime(scannedAt: string, now = new Date()) {
  const date = new Date(scannedAt);
  const elapsedMs = Math.max(0, now.getTime() - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (elapsedMs < minute) {
    return "Scanned just now";
  }

  if (elapsedMs < hour) {
    const minutes = Math.round(elapsedMs / minute);
    return `Scanned ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (elapsedMs < day) {
    const hours = Math.round(elapsedMs / hour);
    return `Scanned ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.round(elapsedMs / day);

  if (days === 1) {
    return "Scanned yesterday";
  }

  if (days < 7) {
    return `Scanned ${days} days ago`;
  }

  return `Scanned ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  })}`;
}

export function formatFullScanDate(scannedAt: string) {
  return new Date(scannedAt).toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function buildHistoryScoreLabel(record: ScanHistoryListItem) {
  const score =
    record.summary.score === null ? "No score" : `${record.summary.score} out of 100`;

  return `Truthlabel score ${score}. ${record.summary.verdictLabel}.`;
}
