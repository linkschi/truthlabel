export type DemoSeverity = "green" | "yellow" | "red";

export type DemoProductQuality = "Excellent" | "Good" | "Moderate" | "Poor";

export const demoCategoryIconOptions = [
  "additive",
  "allergy",
  "ban",
  "barcode",
  "beaker",
  "candy",
  "colour",
  "drop",
  "eye",
  "factory",
  "flame",
  "leaf",
  "list",
  "meat",
  "metal",
  "micro",
  "oil",
  "question",
  "scale",
  "shield",
  "spark",
  "texture",
] as const;

export type DemoCategoryIconName = (typeof demoCategoryIconOptions)[number];

export type DemoScanFinding = {
  id: string;
  name: string;
  severity: DemoSeverity;
  explanation: string;
};

export type DemoScanCategory = {
  id: string;
  iconName: DemoCategoryIconName;
  name: string;
  statusLabel: string;
  severity: DemoSeverity;
  count: number;
  reason: string;
  message: string;
  action: string;
  findings: DemoScanFinding[];
};

export type DemoScanRecord = {
  kind: "truthlabel_demo_scan";
  id: string;
  internalTitle: string;
  productName: string;
  brandName: string;
  productImageDataUrl: string;
  ingredientScore: number;
  productQuality: DemoProductQuality;
  verdictSeverity: DemoSeverity;
  finalHeadline: string;
  finalSummary: string;
  categories: DemoScanCategory[];
  createdAt: string;
  updatedAt: string;
};

export const demoSeverityOptions: DemoSeverity[] = ["green", "yellow", "red"];

export const demoProductQualityOptions: DemoProductQuality[] = [
  "Excellent",
  "Good",
  "Moderate",
  "Poor",
];

export function createDemoId(prefix = "demo") {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${prefix}_${randomPart}`;
}

export function createBlankDemoFinding(): DemoScanFinding {
  return {
    id: createDemoId("finding"),
    name: "New finding",
    severity: "yellow",
    explanation: "Explain why this item appears in the demo result.",
  };
}

export function createBlankDemoCategory(): DemoScanCategory {
  return {
    id: createDemoId("category"),
    iconName: "list",
    name: "New category",
    statusLabel: "Yes",
    severity: "yellow",
    count: 1,
    reason: "Manual demo category.",
    message: "Describe what this category is showing.",
    action: "Use this section to explain what the viewer should notice.",
    findings: [createBlankDemoFinding()],
  };
}

export function createStarterDemoScan(): DemoScanRecord {
  const now = new Date().toISOString();

  return {
    kind: "truthlabel_demo_scan",
    id: createDemoId(),
    internalTitle: "New demo scan",
    productName: "Demo product",
    brandName: "Demo brand",
    productImageDataUrl: "",
    ingredientScore: 72,
    productQuality: "Moderate",
    verdictSeverity: "yellow",
    finalHeadline: "Manual demo verdict",
    finalSummary:
      "This is a manually created demo result. It does not use the real scanner or product database.",
    categories: [
      {
        id: createDemoId("category"),
        iconName: "additive",
        name: "Harmful Additives",
        statusLabel: "Yes",
        severity: "red",
        count: 3,
        reason: "Manual demo additive warning.",
        message: "This demo category shows how serious additive findings can appear.",
        action: "Review the ingredients before choosing this product.",
        findings: [
          {
            id: createDemoId("finding"),
            name: "Artificial additive example",
            severity: "red",
            explanation: "Example explanation for a manually entered serious finding.",
          },
          {
            id: createDemoId("finding"),
            name: "Processed stabilizer example",
            severity: "yellow",
            explanation: "Example explanation for a manually entered moderate finding.",
          },
        ],
      },
      {
        id: createDemoId("category"),
        iconName: "shield",
        name: "Brand Trust",
        statusLabel: "Review",
        severity: "yellow",
        count: 1,
        reason: "Manual demo brand signal.",
        message: "This demo category can show lawsuits, recalls, or warning-letter style notes.",
        action: "Use this section only for evidence you can support.",
        findings: [
          {
            id: createDemoId("finding"),
            name: "Documented company record example",
            severity: "yellow",
            explanation: "Example explanation for a manually entered brand-trust signal.",
          },
        ],
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
