import type { ExposureRiskMainReason } from "@/lib/calculateExposureRisk";
import {
  extractExternalSafetySignals,
  isMicroplasticSafetySignal,
  normalizeExternalSafetyText,
  type ExternalSafetySignal,
} from "@/lib/externalSafety/externalSafetyTypes";
import type { IngredientIntelligenceMatcherInput } from "@/lib/ingredientIntelligenceMatcher";

export type TruthlabelFinalVerdictCode =
  | "clear"
  | "moderate"
  | "limit"
  | "avoid"
  | "do_not_consume";

export type TruthlabelImmediateStopReason =
  | "active_safety_alert"
  | "confirmed_contamination"
  | "undeclared_allergen_recall"
  | "selected_allergen";

export type EvidenceAwareFinalVerdict = {
  verdictCode: TruthlabelFinalVerdictCode;
  verdictLabel:
    | "No major concerns"
    | "Consume in moderation"
    | "Limit consumption"
    | "Recommended to avoid"
    | "Do not consume";
  verdictTone: "green" | "yellow" | "red";
  opening: string;
  summary: string;
  totalRedCount: number;
  seriousRedCount: number;
  overloadRedCount: number;
  yellowCount: number;
  immediateStopReason?: TruthlabelImmediateStopReason;
};

type BuildEvidenceAwareFinalVerdictInput = {
  mainReasons: ExposureRiskMainReason[];
  externalSignals?: IngredientIntelligenceMatcherInput["externalSignals"];
};

const overloadReasonTypes = new Set([
  "count_overload",
  "category_combo_trigger",
  "long_ingredient_list",
  "high_processed_share",
]);

const contaminationSignalTypes = new Set<ExternalSafetySignal["signalType"]>([
  "pathogen_contamination",
  "foreign_material",
  "heavy_metal_warning",
  "chemical_contamination",
]);

const activeSafetySignalTypes = new Set<ExternalSafetySignal["signalType"]>([
  "active_recall",
  "public_health_alert",
  "allergen_recall",
  ...contaminationSignalTypes,
]);

function isHighConfidenceRedSignal(signal: ExternalSafetySignal) {
  return signal.severity === "red" && signal.matchConfidence === "high";
}

function isCurrentSignal(signal: ExternalSafetySignal) {
  return signal.status === "active" || signal.status === "unknown";
}

function getStructuredImmediateStopReason(
  signals: ExternalSafetySignal[],
): TruthlabelImmediateStopReason | undefined {
  const urgentSignals = signals.filter(
    (signal) => isHighConfidenceRedSignal(signal) && isCurrentSignal(signal),
  );

  if (urgentSignals.some((signal) => signal.signalType === "allergen_recall")) {
    return "undeclared_allergen_recall";
  }

  if (
    urgentSignals.some(
      (signal) =>
        contaminationSignalTypes.has(signal.signalType) ||
        isMicroplasticSafetySignal(signal),
    )
  ) {
    return "confirmed_contamination";
  }

  if (urgentSignals.some((signal) => activeSafetySignalTypes.has(signal.signalType))) {
    return "active_safety_alert";
  }

  return undefined;
}

function getLegacySignalText(
  signals: IngredientIntelligenceMatcherInput["externalSignals"],
) {
  return normalizeExternalSafetyText(
    (signals ?? [])
      .filter((signal): signal is string => typeof signal === "string")
      .join(" "),
  );
}

function getLegacyImmediateStopReason(
  signals: IngredientIntelligenceMatcherInput["externalSignals"],
): TruthlabelImmediateStopReason | undefined {
  const signalText = getLegacySignalText(signals);
  if (!signalText) {
    return undefined;
  }

  if (
    /(?:active|official).*recall.*(?:undeclared|allergen)|(?:undeclared|allergen).*active.*recall/.test(
      signalText,
    )
  ) {
    return "undeclared_allergen_recall";
  }

  if (
    /confirmed contamination|recall due to (?:lead|arsenic|cadmium|mercury|salmonella|listeria|e coli|contamination)/.test(
      signalText,
    )
  ) {
    return "confirmed_contamination";
  }

  if (/active official recall|active recall|public health alert/.test(signalText)) {
    return "active_safety_alert";
  }

  return undefined;
}

function getSelectedAllergenName(reasons: ExposureRiskMainReason[]) {
  const allergyReason = reasons.find(
    (reason) => reason.reasonType === "allergy_profile_match",
  );

  return allergyReason?.matchedItems[0]?.trim() || "a selected allergen";
}

function hasDirectSelectedAllergen(reasons: ExposureRiskMainReason[]) {
  const allergyReason = reasons.find(
    (reason) => reason.reasonType === "allergy_profile_match",
  );
  if (!allergyReason) {
    return false;
  }

  const evidenceText = normalizeExternalSafetyText(
    [allergyReason.message, ...allergyReason.matchedItems].join(" "),
  );

  return !/(?:may contain|traces of|cross contact|shared equipment|same facility|same oil)/.test(
    evidenceText,
  );
}

function getImmediateStopReason(
  input: BuildEvidenceAwareFinalVerdictInput,
): TruthlabelImmediateStopReason | undefined {
  const externalReason =
    getStructuredImmediateStopReason(
      extractExternalSafetySignals(input.externalSignals),
    ) ?? getLegacyImmediateStopReason(input.externalSignals);

  if (externalReason) {
    return externalReason;
  }

  if (hasDirectSelectedAllergen(input.mainReasons)) {
    return "selected_allergen";
  }

  return undefined;
}

function buildImmediateStopVerdict(
  reason: TruthlabelImmediateStopReason,
  mainReasons: ExposureRiskMainReason[],
  counts: Pick<
    EvidenceAwareFinalVerdict,
    "totalRedCount" | "seriousRedCount" | "overloadRedCount" | "yellowCount"
  >,
): EvidenceAwareFinalVerdict {
  const common = {
    ...counts,
    verdictCode: "do_not_consume" as const,
    verdictLabel: "Do not consume" as const,
    verdictTone: "red" as const,
    immediateStopReason: reason,
  };

  if (reason === "selected_allergen") {
    const allergen = getSelectedAllergenName(mainReasons);
    return {
      ...common,
      opening: `This product contains ${allergen}, which is on your allergy Watch List.`,
      summary: `Do not consume it if you are allergic to ${allergen}. Always check the package label and follow your medical guidance.`,
    };
  }

  if (reason === "undeclared_allergen_recall") {
    return {
      ...common,
      opening: "An official warning reports an undeclared allergen in this product.",
      summary:
        "Do not consume it if the alert applies to your product or batch. Check the affected lot, date, region, and official recall instructions.",
    };
  }

  if (reason === "confirmed_contamination") {
    return {
      ...common,
      opening: "A verified product-specific contamination warning was found.",
      summary:
        "Do not consume the affected product. Check the affected lot, date, region, and official safety instructions.",
    };
  }

  return {
    ...common,
    opening: "This product is connected to an active safety alert.",
    summary:
      "Do not consume the affected product. Check the affected lot, date, region, and official recall instructions.",
  };
}

export function buildEvidenceAwareFinalVerdict(
  input: BuildEvidenceAwareFinalVerdictInput,
): EvidenceAwareFinalVerdict {
  const redReasons = input.mainReasons.filter((reason) => reason.severity === "red");
  const yellowReasons = input.mainReasons.filter(
    (reason) => reason.severity === "yellow",
  );
  const overloadReasons = redReasons.filter((reason) =>
    overloadReasonTypes.has(reason.reasonType),
  );
  const seriousReasons = redReasons.filter(
    (reason) => !overloadReasonTypes.has(reason.reasonType),
  );
  const counts = {
    totalRedCount: new Set(redReasons.map((reason) => reason.categoryId)).size,
    seriousRedCount: new Set(seriousReasons.map((reason) => reason.categoryId)).size,
    overloadRedCount: new Set(overloadReasons.map((reason) => reason.categoryId)).size,
    yellowCount: new Set(yellowReasons.map((reason) => reason.categoryId)).size,
  };
  const immediateStopReason = getImmediateStopReason(input);

  if (immediateStopReason) {
    return buildImmediateStopVerdict(immediateStopReason, input.mainReasons, counts);
  }

  if (counts.totalRedCount >= 3 || counts.seriousRedCount >= 1) {
    const multipleSeriousConcerns =
      counts.seriousRedCount >= 2 || counts.totalRedCount >= 3;
    return {
      ...counts,
      verdictCode: "avoid",
      verdictLabel: "Recommended to avoid",
      verdictTone: "red",
      opening: multipleSeriousConcerns
        ? "This product contains several serious ingredient concerns."
        : "This product contains a serious ingredient concern.",
      summary: multipleSeriousConcerns
        ? "Truthlabel recommends avoiding it and choosing an alternative when possible."
        : "You may want to avoid it or choose an alternative without the flagged ingredient.",
    };
  }

  if (counts.overloadRedCount >= 1) {
    return {
      ...counts,
      verdictCode: "limit",
      verdictLabel: "Limit consumption",
      verdictTone: "red",
      opening:
        counts.overloadRedCount >= 2
          ? "This product has high concern levels in multiple ingredient categories."
          : "This product has a high concentration of moderate ingredient concerns.",
      summary:
        counts.overloadRedCount >= 2
          ? "It is better consumed occasionally, and you may want to choose a simpler alternative."
          : "It crosses Truthlabel's concern threshold. You may want to limit how often you consume it.",
    };
  }

  if (counts.yellowCount > 0) {
    const hasSeveralYellowFindings = counts.yellowCount >= 3;
    return {
      ...counts,
      verdictCode: "moderate",
      verdictLabel: "Consume in moderation",
      verdictTone: "yellow",
      opening: hasSeveralYellowFindings
        ? "This product contains several moderate ingredient concerns."
        : "This product contains some moderate ingredient concerns.",
      summary: hasSeveralYellowFindings
        ? "It may be better as an occasional choice rather than something you consume regularly."
        : "This does not mean you should avoid it, but you may want to consume it in moderation.",
    };
  }

  return {
    ...counts,
    verdictCode: "clear",
    verdictLabel: "No major concerns",
    verdictTone: "green",
    opening: "No major ingredient concerns were detected from the available label data.",
    summary:
      "This does not guarantee the product is suitable for everyone. Always check the package label, especially for allergies.",
  };
}
