import {
  truthlabelSimpleProductCheckDataPacks,
} from "@/data/productChecks/simpleProductChecks";
import { normalizeIngredientIntelligenceText } from "@/lib/ingredientIntelligenceMatcher";
import type {
  CheckSeverity,
  CheckStatus,
  EvidenceType,
  ProductCheckDataPack,
  ProductCheckEvaluation,
  ProductCheckItem,
  ProductCheckMatchSource,
} from "@/types/productCheck";

export type ProductCheckMatcherInput = {
  ingredients?: string[];
  productName?: string;
  productCategory?: string;
  packagingText?: string;
  packageClaims?: string[];
  certifications?: string[];
  manufacturerDisclosures?: string[];
  externalSignals?: string[];
  dataPacks?: readonly ProductCheckDataPack[];
};

export type ProductCheckMatcherOutput = {
  matches: ProductCheckEvaluation[];
  evaluatedItems: ProductCheckEvaluation[];
  debug: {
    sourceCount: number;
    dataPackCount: number;
    evaluatedItemCount: number;
  };
};

type PreparedSource = {
  source: ProductCheckMatchSource;
  evidenceType: EvidenceType;
  original: string;
  normalized: string;
};

type TermMatch = {
  source: PreparedSource;
  alias: string;
};

const severityRank: Record<CheckSeverity, number> = {
  green: 0,
  yellow: 1,
  red: 2,
};

const statusRank: Record<CheckStatus, number> = {
  unknown: 0,
  not_confirmed: 1,
  not_detected: 2,
  possible: 3,
  likely: 4,
  confirmed: 5,
  lab_confirmed: 6,
  above_limit: 7,
};

const visibleStatuses = new Set<CheckStatus>([
  "confirmed",
  "not_detected",
  "likely",
  "possible",
  "lab_confirmed",
  "above_limit",
]);

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeTerm(value: string) {
  return normalizeIngredientIntelligenceText(value);
}

function containsWholeNormalizedTerm(value: string, term: string) {
  if (!value || !term) {
    return false;
  }

  return ` ${value} `.includes(` ${term} `);
}

function prepareTextSource(
  source: ProductCheckMatchSource,
  evidenceType: EvidenceType,
  value: string | undefined,
) {
  if (!value?.trim()) {
    return null;
  }

  return {
    source,
    evidenceType,
    original: value,
    normalized: normalizeTerm(value),
  } satisfies PreparedSource;
}

function buildPreparedSources(input: ProductCheckMatcherInput) {
  const sources: PreparedSource[] = [];

  input.ingredients?.forEach((ingredient) => {
    const source = prepareTextSource("ingredient", "ingredient_list", ingredient);
    if (source) {
      sources.push(source);
    }
  });

  [
    prepareTextSource("product_name", "product_name", input.productName),
    prepareTextSource("package_claim", "package_claim", input.packagingText),
    prepareTextSource("product_name", "category_risk_marker", input.productCategory),
  ].forEach((source) => {
    if (source) {
      sources.push(source);
    }
  });

  input.packageClaims?.forEach((claim) => {
    const source = prepareTextSource("package_claim", "package_claim", claim);
    if (source) {
      sources.push(source);
    }
  });

  input.certifications?.forEach((certification) => {
    const source = prepareTextSource(
      "certification",
      "certification",
      certification,
    );
    if (source) {
      sources.push(source);
    }
  });

  input.manufacturerDisclosures?.forEach((disclosure) => {
    const source = prepareTextSource(
      "manufacturer_disclosure",
      "manufacturer_disclosure",
      disclosure,
    );
    if (source) {
      sources.push(source);
    }
  });

  input.externalSignals?.forEach((signal) => {
    const normalized = normalizeTerm(signal);
    const evidenceType: EvidenceType = /recall|outbreak|public health alert/.test(
      normalized,
    )
      ? "official_recall"
      : /lab|tested|detected|above limit|elevated/.test(normalized)
        ? "product_specific_lab_test"
        : "regulatory_record";
    const source = prepareTextSource("external_signal", evidenceType, signal);
    if (source) {
      sources.push(source);
    }
  });

  return sources;
}

function sourceContext(input: ProductCheckMatcherInput) {
  return normalizeTerm(
    [
      input.productName,
      input.productCategory,
      ...(input.ingredients ?? []),
      input.packagingText,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function hasAnyTerm(value: string, terms: string[]) {
  return terms.some((term) =>
    containsWholeNormalizedTerm(value, normalizeTerm(term)),
  );
}

function itemAppliesToInput(
  item: ProductCheckItem,
  input: ProductCheckMatcherInput,
) {
  const context = sourceContext(input);

  if (item.doesNotApplyWhen.length && hasAnyTerm(context, item.doesNotApplyWhen)) {
    return false;
  }

  if (item.appliesWhen.length && hasAnyTerm(context, item.appliesWhen)) {
    return true;
  }

  if (item.productTypes.length === 0) {
    return true;
  }

  return hasAnyTerm(context, item.productTypes);
}

function hasExclusion(item: ProductCheckItem, sources: PreparedSource[]) {
  return sources.some((source) =>
    item.exclusionAliases.some((alias) =>
      containsWholeNormalizedTerm(source.normalized, normalizeTerm(alias)),
    ),
  );
}

function findTermMatch(
  terms: string[],
  sources: PreparedSource[],
  allowedSources: ProductCheckMatchSource[],
): TermMatch | null {
  const normalizedTerms = uniqueStrings(terms).map((alias) => ({
    alias,
    normalized: normalizeTerm(alias),
  }));

  return sources
    .filter((source) => allowedSources.includes(source.source))
    .flatMap((source) =>
      normalizedTerms
        .filter((term) =>
          containsWholeNormalizedTerm(source.normalized, term.normalized),
        )
        .map((term) => ({ source, alias: term.alias })),
    )
    .sort((left, right) => right.alias.length - left.alias.length)[0] ?? null;
}

function findStatusMatch(
  item: ProductCheckItem,
  sources: PreparedSource[],
): { status: CheckStatus; match: TermMatch | null } {
  const negativeClaimMatch = findTermMatch(item.negativeClaimAliases, sources, [
    "package_claim",
    "product_name",
    "manufacturer_disclosure",
  ]);
  if (negativeClaimMatch) {
    return {
      status: "not_detected" as const,
      match: negativeClaimMatch,
    };
  }

  const labMatch = findTermMatch(item.aliases, sources, ["external_signal"]);
  if (labMatch && item.evidenceTypes.includes("product_specific_lab_test")) {
    const normalized = labMatch.source.normalized;
    return {
      status: /above limit|exceed|elevated|unsafe|violation/.test(normalized)
        ? ("above_limit" as const)
        : ("lab_confirmed" as const),
      match: labMatch,
    };
  }

  const officialRecallMatch = findTermMatch(item.aliases, sources, [
    "external_signal",
  ]);
  if (officialRecallMatch && item.evidenceTypes.includes("official_recall")) {
    return {
      status: "confirmed" as const,
      match: officialRecallMatch,
    };
  }

  const ingredientMatch = findTermMatch(item.aliases, sources, ["ingredient"]);
  if (ingredientMatch && item.evidenceTypes.includes("ingredient_list")) {
    return {
      status:
        item.evidenceTypes.includes("category_risk_marker") &&
        !item.evidenceTypes.includes("product_specific_lab_test")
          ? ("possible" as const)
          : ("confirmed" as const),
      match: ingredientMatch,
    };
  }

  const productNameMatch = findTermMatch(item.productNameAliases, sources, [
    "product_name",
  ]);
  if (productNameMatch) {
    return {
      status:
        item.evidenceTypes.includes("category_risk_marker")
          ? ("possible" as const)
          : ("confirmed" as const),
      match: productNameMatch,
    };
  }

  const claimMatch = findTermMatch(item.claimAliases, sources, [
    "package_claim",
    "product_name",
    "manufacturer_disclosure",
    "certification",
  ]);
  if (claimMatch) {
    return {
      status: "confirmed" as const,
      match: claimMatch,
    };
  }

  const categoryRiskMatch = findTermMatch(item.aliases, sources, [
    "product_name",
    "package_claim",
  ]);
  if (categoryRiskMatch && item.evidenceTypes.includes("category_risk_marker")) {
    return {
      status: "possible" as const,
      match: categoryRiskMatch,
    };
  }

  return {
    status: item.defaultStatusWhenMissing,
    match: null,
  };
}

function severityForStatus(item: ProductCheckItem, status: CheckStatus) {
  return (
    item.severityRules.find((rule) => rule.status === status)?.severity ??
    item.defaultSeverity
  );
}

function strongestEvidenceType(
  item: ProductCheckItem,
  status: CheckStatus,
  match: TermMatch | null,
) {
  if (!match) {
    return null;
  }

  if (status === "possible" && item.evidenceTypes.includes("category_risk_marker")) {
    return "category_risk_marker";
  }

  if (item.evidenceTypes.includes(match.source.evidenceType)) {
    return match.source.evidenceType;
  }

  return item.evidenceTypes[0] ?? match.source.evidenceType;
}

function evaluateItem(
  item: ProductCheckItem,
  input: ProductCheckMatcherInput,
  sources: PreparedSource[],
): ProductCheckEvaluation | null {
  if (!itemAppliesToInput(item, input) || hasExclusion(item, sources)) {
    return null;
  }

  const { status, match } = findStatusMatch(item, sources);
  const severity = severityForStatus(item, status);

  return {
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    itemId: item.itemId,
    canonicalId: item.canonicalId,
    mainName: item.mainName,
    status,
    severity,
    evidenceType: strongestEvidenceType(item, status, match),
    evidenceStrengthRequired: item.evidenceStrengthRequired,
    matchedText: match?.source.original ?? null,
    matchedAlias: match?.alias ?? null,
    matchSource: match?.source.source ?? null,
    userFacingReason: item.userFacingReason,
    positiveWording: item.positiveWording,
    warningWording: item.warningWording,
    action: item.action,
    dedupeGroup: item.dedupeGroup,
    overloadEligible: item.overloadEligible,
    sourceRefs: item.sourceRefs,
  } satisfies ProductCheckEvaluation;
}

function chooseStrongerEvaluation(
  current: ProductCheckEvaluation | undefined,
  candidate: ProductCheckEvaluation,
) {
  if (!current) {
    return candidate;
  }

  if (statusRank[candidate.status] !== statusRank[current.status]) {
    return statusRank[candidate.status] > statusRank[current.status]
      ? candidate
      : current;
  }

  if (severityRank[candidate.severity] !== severityRank[current.severity]) {
    return severityRank[candidate.severity] > severityRank[current.severity]
      ? candidate
      : current;
  }

  return (candidate.matchedAlias?.length ?? 0) > (current.matchedAlias?.length ?? 0)
    ? candidate
    : current;
}

function dedupeEvaluations(evaluations: ProductCheckEvaluation[]) {
  const byDedupeGroup = new Map<string, ProductCheckEvaluation>();

  evaluations.forEach((evaluation) => {
    const key = evaluation.dedupeGroup || evaluation.canonicalId;
    byDedupeGroup.set(
      key,
      chooseStrongerEvaluation(byDedupeGroup.get(key), evaluation),
    );
  });

  return [...byDedupeGroup.values()];
}

export function matchProductChecks(
  input: ProductCheckMatcherInput,
): ProductCheckMatcherOutput {
  const dataPacks = input.dataPacks ?? truthlabelSimpleProductCheckDataPacks;
  const sources = buildPreparedSources(input);
  const evaluatedItems = dedupeEvaluations(
    dataPacks
      .flatMap((pack) => pack.items)
      .map((item) => evaluateItem(item, input, sources))
      .filter((item): item is ProductCheckEvaluation => Boolean(item)),
  );
  const matches = evaluatedItems
    .filter((item) => visibleStatuses.has(item.status) && item.matchedText)
    .sort((left, right) => {
      const severityDelta = severityRank[right.severity] - severityRank[left.severity];
      if (severityDelta !== 0) {
        return severityDelta;
      }

      return statusRank[right.status] - statusRank[left.status];
    });

  return {
    matches,
    evaluatedItems,
    debug: {
      sourceCount: sources.length,
      dataPackCount: dataPacks.length,
      evaluatedItemCount: evaluatedItems.length,
    },
  };
}
