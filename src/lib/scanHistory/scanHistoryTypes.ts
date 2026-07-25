import type { ScanResult } from "@/lib/buildScanResult";

export type ScanHistorySeverity = "green" | "yellow" | "red";
export type ScanHistoryResultFilter = "all" | ScanHistorySeverity;
export type ScanHistoryTimeFilter = "today" | "last_7_days" | "last_30_days" | "all_time";

export type ScanHistoryCategorySnapshot = {
  categoryId: string;
  categoryName: string;
  severity: ScanHistorySeverity;
  triggerReason: string;
  count: number;
  title: string;
  explanation: string;
  action: string | null;
  findings: Array<{
    canonicalIngredientId: string | null;
    displayName: string;
    severity: ScanHistorySeverity;
    reason: string;
    explanation: string;
  }>;
};

export type ScanHistoryResultSnapshot = {
  scanResult: ScanResult;
  categories: ScanHistoryCategorySnapshot[];
  ingredientsText: string | null;
  parsedIngredients: string[];
  nutrition: unknown | null;
  nutriScore: string | null;
  novaGroup: number | null;
  dataConfidence: "high" | "medium" | "low";
  source: string | null;
  sourceLastUpdatedAt: string | null;
  ruleVersion: string;
  ingredientDatabaseVersion: string;
};

export type ScanHistoryRecord = {
  id: string;
  userId: string;
  barcode: string | null;
  scannedAt: string;
  product: {
    name: string;
    brand: string | null;
    quantity: string | null;
    imageUrl: string | null;
    category: string | null;
  };
  summary: {
    score: number | null;
    overallSeverity: ScanHistorySeverity;
    verdictKey: string;
    verdictLabel: string;
    greenCount: number;
    yellowCount: number;
    redCount: number;
    seriousRedCount: number;
    overloadRedCount: number;
    allergenRedCount: number;
  };
  resultSnapshot: ScanHistoryResultSnapshot;
  createdAt: string;
};

export type ScanHistoryListItem = Omit<ScanHistoryRecord, "resultSnapshot">;

export type ScanHistoryListFilters = {
  search?: string;
  result?: ScanHistoryResultFilter;
  time?: ScanHistoryTimeFilter;
  allergenWarnings?: boolean;
  seriousFindings?: boolean;
  highProcessingLoad?: boolean;
  limit?: number;
  beforeScannedAt?: string;
};

export type ScanHistorySaveInput = {
  scanResult: ScanResult;
  ingredientText?: string | null;
  parsedIngredients?: string[];
  nutrition?: unknown | null;
  nutriScore?: string | null;
  novaGroup?: number | null;
  source?: string | null;
  sourceLastUpdatedAt?: string | null;
  scannedAt?: string;
};

export type ScanHistorySummaryCounts = {
  greenCount: number;
  yellowCount: number;
  redCount: number;
  seriousRedCount: number;
  overloadRedCount: number;
  allergenRedCount: number;
  highProcessingLoad: boolean;
};
