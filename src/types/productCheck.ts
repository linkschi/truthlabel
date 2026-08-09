export type CheckSeverity = "green" | "yellow" | "red";

export type CheckStatus =
  | "confirmed"
  | "not_detected"
  | "not_confirmed"
  | "likely"
  | "possible"
  | "lab_confirmed"
  | "above_limit"
  | "unknown";

export type EvidenceType =
  | "ingredient_list"
  | "product_name"
  | "package_claim"
  | "certification"
  | "manufacturer_disclosure"
  | "category_risk_marker"
  | "product_specific_lab_test"
  | "official_recall"
  | "regulatory_record";

export type EvidenceStrengthRequired = "low" | "moderate" | "strong";

export type ProductCheckSourceRef = {
  sourceId: string;
  title: string;
  jurisdiction?: string;
  checkedAt?: string;
};

export type ProductCheckLabEvidenceRules = {
  analyte?: string;
  unit?: "ppb" | "ppm" | "mg/kg" | "ug/kg";
  applicableLimitSource?: string;
  productMatchRequired: boolean;
  batchMatchRequired?: boolean;
};

export type ProductCheckItem = {
  categoryId: string;
  categoryName: string;

  itemId: string;
  canonicalId: string;
  mainName: string;

  aliases: string[];
  productNameAliases: string[];
  claimAliases: string[];
  negativeClaimAliases: string[];
  exclusionAliases: string[];

  productTypes: string[];
  appliesWhen: string[];
  doesNotApplyWhen: string[];

  statusOptions: CheckStatus[];
  defaultStatusWhenMissing: "not_confirmed" | "unknown" | "not_detected";

  defaultSeverity: CheckSeverity;
  severityRules: Array<{
    status: CheckStatus;
    severity: CheckSeverity;
  }>;

  evidenceTypes: EvidenceType[];
  evidenceStrengthRequired: EvidenceStrengthRequired;

  userFacingReason: string;
  positiveWording?: string;
  warningWording?: string;
  action?: string;

  sourceRefs: ProductCheckSourceRef[];

  matchingNotes: string;
  dedupeGroup: string;
  overloadEligible: boolean;

  labEvidenceRules?: ProductCheckLabEvidenceRules;
};

export type ProductCheckDataPack = {
  id: string;
  categoryName: string;
  categoryMeaning: string;
  dataStatus: "starter" | "starter_needs_expansion" | "needs_external_data";
  defaultCategorySeverity: CheckSeverity;
  productTypes: string[];
  items: readonly ProductCheckItem[];
  matchingRules: readonly string[];
  falsePositiveGuards: readonly string[];
};

export type ProductCheckMatchSource =
  | "ingredient"
  | "product_name"
  | "package_claim"
  | "certification"
  | "manufacturer_disclosure"
  | "external_signal";

export type ProductCheckEvaluation = {
  categoryId: string;
  categoryName: string;
  itemId: string;
  canonicalId: string;
  mainName: string;
  status: CheckStatus;
  severity: CheckSeverity;
  evidenceType: EvidenceType | null;
  evidenceStrengthRequired: EvidenceStrengthRequired;
  matchedText: string | null;
  matchedAlias: string | null;
  matchSource: ProductCheckMatchSource | null;
  userFacingReason: string;
  positiveWording?: string;
  warningWording?: string;
  action?: string;
  dedupeGroup: string;
  overloadEligible: boolean;
  sourceRefs: ProductCheckSourceRef[];
};

