import { allergenAliases } from "@/data/allergenAliases";
import { bannedRestricted } from "@/data/bannedRestricted";
import {
  automaticSeriousOverrideChecks,
  categoryProfiles,
  defaultProductCategory,
  exposureCheckLabels,
  getCategoryProfileBySlug,
  getCategorySlug,
} from "@/data/categoryProfiles";
import {
  demoExposureProduct as demoProductMeta,
  demoIngredientRecords,
} from "@/data/demoIngredients";
import { defaultProfile, type UserProfile } from "@/data/fakeProduct";
import { buildFinalVerdict } from "@/lib/buildFinalVerdict";
import { buildQuickOverview } from "@/lib/buildQuickOverview";
import { calculateExposureRisk } from "@/lib/calculateExposureRisk";
import {
  findArtificialSweetenerMatches,
  summarizeArtificialSweetenerMatches,
  type ArtificialSweetenerCategorySummary,
} from "@/lib/ingredientIntelligence/artificialSweeteners";
import {
  findUltraProcessedAutomaticRedTriggers,
  findUltraProcessedIndicatorMatches,
  summarizeUltraProcessedIndicatorMatches,
} from "@/lib/ingredientIntelligence/ultraProcessedIndicators";
import {
  calculateIssueCounts,
  type CalculatedIssueCounts,
} from "@/lib/calculateIssueCounts";
import { classifyIngredients } from "@/lib/classifyIngredients";
import {
  analyzeArtificialEngineeredFoodConstruction,
  type ArtificialEngineeredFoodConstructionSummary,
} from "@/lib/ingredientIntelligence/artificialEngineeredFoodConstruction";
import type {
  AdditiveBreakdownKind,
  AdditiveBreakdownResult,
  CategoryProfile,
  ExposureCheckId,
  ExposureCheckResult,
  ExposureDetail,
  ExposureDetailSection,
  IngredientClassification,
  IngredientGroup,
  IngredientRecord,
  ProductCategory,
  Severity,
} from "@/types/exposure";

export type DemoModalSection = ExposureDetailSection;
export type DemoDetail = ExposureDetail;

export type DemoQuickOverviewRow = {
  id: ExposureCheckId;
  label: string;
  value: string;
  tone: Severity;
  redCount?: number;
  yellowCount?: number;
  clearLabel?: string;
  badgeTone?: Severity;
  detail: DemoDetail;
  serious?: boolean;
};

export type DemoNaturalProcessed = {
  naturalPercent: number;
  processedPercent: number;
  viewLabel: string;
};

export type DemoIngredientItem = {
  name: string;
  tone: Severity;
  detail?: DemoDetail;
};

export type DemoIngredientGroup = {
  label: string;
  tone: Severity;
  items: DemoIngredientItem[];
};

export type DemoDeepCheckRow = DemoQuickOverviewRow;

export type DemoBrandTrustRow = {
  title: string;
  status: string;
  tone: Exclude<Severity, "neutral">;
  subtitle: string;
  redCount?: number;
  yellowCount?: number;
  clearLabel?: string;
  detail: DemoDetail;
  serious?: boolean;
};

export type DemoAdditiveBreakdownItem = {
  id: AdditiveBreakdownKind;
  label: string;
  count: number;
  tone: Severity;
  detail: DemoDetail;
};

export type DemoAdditivesSection = {
  label: string;
  value: string;
  tone: Severity;
  subtitle: string;
  redCount: number;
  yellowCount: number;
  clearLabel?: string;
  detail: DemoDetail;
  breakdown: DemoAdditiveBreakdownItem[];
  serious?: boolean;
};

export type DemoCategoryProfile = {
  id: ProductCategory;
  key: string;
  label: string;
  description: string;
  quickOverviewIds: ExposureCheckId[];
};

export type DemoDisplayRule = {
  title: string;
  text: string;
};

export type DemoBenchmarkComment = {
  title: string;
  text: string;
};

export type DemoExposureProductView = {
  name: string;
  brand: string;
  barcode: string;
  imageAlt: string;
  score: number;
  scoreLabel: string;
  gradeLabel: string;
  tone: Exclude<Severity, "neutral">;
};

export type DemoFinalVerdict = {
  title: string;
  text: string;
};

export type DemoExposureReport = {
  product: DemoExposureProductView;
  categoryProfile: DemoCategoryProfile;
  quickOverviewRows: DemoQuickOverviewRow[];
  naturalProcessed: DemoNaturalProcessed;
  ingredientGroups: DemoIngredientGroup[];
  deepCheckRows: DemoDeepCheckRow[];
  additivesSection: DemoAdditivesSection;
  brandTrustRow: DemoBrandTrustRow;
  finalVerdict: DemoFinalVerdict;
};

export type DemoExposureCheckOverride = {
  value?: string | number;
  severity?: Severity;
  redCount?: number;
  yellowCount?: number;
  clearLabel?: string;
  badgeTone?: Severity;
  detail?: DemoDetail;
  hasMeaningfulValue?: boolean;
  isAutomaticSeriousOverride?: boolean;
};

export type DemoExposureOptions = {
  checkOverrides?: Partial<Record<ExposureCheckId, DemoExposureCheckOverride>>;
};

type BuiltCheckRow = ExposureCheckResult & {
  detail: DemoDetail;
  clearLabel?: string;
  badgeTone?: Severity;
};

type AdditiveDescriptor = {
  id: AdditiveBreakdownKind;
  label: string;
  positiveTone: Exclude<Severity, "neutral">;
};

const additiveBreakdownDescriptors: AdditiveDescriptor[] = [
  {
    id: "artificial_colours",
    label: "Artificial colours",
    positiveTone: "red",
  },
  {
    id: "preservatives",
    label: "Preservatives",
    positiveTone: "yellow",
  },
  {
    id: "emulsifiers",
    label: "Emulsifiers",
    positiveTone: "yellow",
  },
  {
    id: "artificial_sweeteners",
    label: "Artificial sweeteners",
    positiveTone: "yellow",
  },
  {
    id: "stabilisers_thickeners",
    label: "Stabilisers / thickeners",
    positiveTone: "yellow",
  },
  {
    id: "flavour_enhancers",
    label: "Flavour enhancers",
    positiveTone: "yellow",
  },
  {
    id: "other_additives",
    label: "Other additives",
    positiveTone: "yellow",
  },
];

const deepCheckOrder: ExposureCheckId[] = [
  "cancer_linked_watch",
  "artificial_engineered_food_construction",
  "artificial_colours",
  "artificial_sweeteners",
  "preservatives",
  "ingredient_count",
  "microplastics",
  "heavy_metals",
  "meat_feed_source",
  "fry_oil_seed_oils",
];

const severityStatusLabels: Record<Exclude<Severity, "neutral">, string> = {
  green: "Lower concern",
  yellow: "Worth reviewing",
  red: "Red flag found",
};

function toModalTone(severity: Severity): Exclude<Severity, "neutral"> {
  return severity === "neutral" ? "yellow" : severity;
}

function toDemoCategoryProfile(profile: CategoryProfile): DemoCategoryProfile {
  return {
    id: profile.id,
    key: profile.slug,
    label: profile.label,
    description: profile.description,
    quickOverviewIds: profile.quickOverviewIds,
  };
}

export const demoCategoryProfiles: DemoCategoryProfile[] = categoryProfiles.map(
  toDemoCategoryProfile,
);

export const defaultDemoCategory = getCategorySlug(defaultProductCategory);

export const demoCheckLabels = exposureCheckLabels;

const automaticSeriousOverrideCheckSet = new Set(automaticSeriousOverrideChecks);

export const demoDisplayRules: DemoDisplayRule[] = [
  {
    title: "Quick Overview",
    text: "Uses the selected category's normal rows first, then adds official serious override checks only when they have a meaningful red result.",
  },
  {
    title: "Serious override",
    text: "Allergy risk, banned / restricted items, cancer-linked watch, microplastics, heavy metals, serious brand safety, and recall warning can override category when they turn red.",
  },
  {
    title: "Hidden unknowns",
    text: "Rows with unknown or missing values stay out of Quick Overview and Deep Exposure Checks so the result page does not get padded with filler.",
  },
  {
    title: "Rule-driven counts",
    text: "Issue badges now come from generated ingredient rules, not from manual row values.",
  },
  {
    title: "Construction matching",
    text: "Artificial / Engineered Food Construction counts unique matched ingredient lines and avoids double counting alias-heavy wording like HVP plus its long form.",
  },
];

export const demoBenchmarkComments: DemoBenchmarkComment[] = [
  {
    title: "Demo-only categories",
    text: "These categories are shown on the home page only so the rule system is easy to inspect during the demo phase.",
  },
  {
    title: "Category baseline",
    text: "Each category starts with its own normal row set. That baseline decides what belongs in Quick Overview before override checks are merged in.",
  },
  {
    title: "Meaningful values",
    text: "A row appears only when it has a meaningful result like Found, Likely, Clear, No, or a real number value such as the ingredient count.",
  },
  {
    title: "Unknown values stay hidden",
    text: "Checks with unknown, blank, or unsupported values stay hidden until the app has enough rule or data coverage to show them honestly.",
  },
  {
    title: "Clear values stay contextual",
    text: "Clear values only show when the selected category expects that row or when the row belongs to a dedicated safety surface like Brand Trust / Safety.",
  },
  {
    title: "Natural vs processed rule",
    text: "Natural percentage uses the positive ingredient count against the total visible ingredient count. Processed percentage combines processed and unknown / review ingredients.",
  },
  {
    title: "Risk score rule",
    text: "The Exposure Risk score gets stronger as red flags, additive load, processed percentage, and review ingredients stack up.",
  },
  {
    title: "No nutrition yet",
    text: "Nutrition breakdown stays out of this rule pass. This phase is ingredient and exposure logic only.",
  },
];

function severityOrder(severity: Severity) {
  if (severity === "red") {
    return 0;
  }

  if (severity === "yellow") {
    return 1;
  }

  if (severity === "neutral") {
    return 2;
  }

  return 3;
}

function hasMeaningfulValue(value: string | number | undefined) {
  if (typeof value === "number") {
    return true;
  }

  if (!value) {
    return false;
  }

  return value.trim().toLowerCase() !== "unknown";
}

function stringifyValue(value: string | number | undefined) {
  if (value === undefined) {
    return "";
  }

  return `${value}`;
}

function formatList(values: string[]) {
  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function getArtificialSweetenerSummary(ingredients: IngredientRecord[]) {
  return summarizeArtificialSweetenerMatches(
    ingredients.flatMap((ingredient) =>
      findArtificialSweetenerMatches(
        [ingredient.displayName, ...ingredient.aliases].join(", "),
      ),
    ),
  );
}

function getUltraProcessedIndicatorSummary(ingredients: IngredientRecord[]) {
  return summarizeUltraProcessedIndicatorMatches(
    ingredients.flatMap((ingredient) =>
      findUltraProcessedIndicatorMatches(
        [ingredient.displayName, ...ingredient.aliases].join(", "),
      ),
    ),
    ingredients.flatMap((ingredient) =>
      findUltraProcessedAutomaticRedTriggers(
        [ingredient.displayName, ...ingredient.aliases].join(", "),
      ),
    ),
  );
}

function buildArtificialSweetenerDetail(
  title: string,
  summary: ArtificialSweetenerCategorySummary,
): DemoDetail {
  const tone = summary.categorySeverity === "green" ? "green" : summary.categorySeverity;
  const countText = `${summary.totalCount} artificial sweetener signal${summary.totalCount === 1 ? "" : "s"}`;
  const signalVerb = summary.totalCount === 1 ? "was" : "were";
  const restrictedNames = formatList(summary.redItems.map((item) => item.mainName));

  return buildGenericDetail({
    title,
    tone,
    whyFlagged:
      summary.totalCount === 0
        ? "No artificial sweetener signal was found in the current demo ingredient list."
        : summary.hasAutomaticRed
          ? `${restrictedNames} triggered the banned/restricted sweetener rule in this category.`
          : summary.categorySeverity === "red"
            ? `${countText} ${signalVerb} found in the demo ingredient list, which crosses the red threshold for this category.`
            : `${countText} ${signalVerb} found in the demo ingredient list.`,
    whatItMeans:
      summary.totalCount === 0
        ? "This is one of the calmer lower-level checks."
        : summary.hasAutomaticRed
          ? "InsideIt treats this as a serious regulatory sweetener concern."
          : summary.categorySeverity === "red"
            ? "InsideIt treats 3 or more sweetener systems as a red sweetener-load concern."
            : "This product uses added non-sugar sweetening systems instead of a simpler sweetness profile.",
    whatToDo:
      summary.totalCount === 0
        ? "Focus on the rows that still show review or warning signals."
        : summary.hasAutomaticRed
          ? "Avoid the flagged sweetener and review the full label before buying or eating."
          : summary.categorySeverity === "red"
            ? "Question why the product needs this many sweetener systems before buying or eating regularly."
            : "Keep it in mind if artificial sweeteners are one of the things you avoid.",
  });
}

function getCheckCounts(
  issueCounts: CalculatedIssueCounts,
  id: ExposureCheckId,
) {
  return issueCounts.byCheck[id] ?? { red: 0, yellow: 0 };
}

function getIngredientNamesByIds(
  ingredientIds: string[],
  ingredientMap: Map<string, IngredientRecord>,
) {
  return ingredientIds
    .map((id) => ingredientMap.get(id)?.displayName)
    .filter((name): name is string => Boolean(name));
}

function hasHydrogenatedOil(ingredient: IngredientRecord) {
  const values = [ingredient.displayName, ...ingredient.aliases].map((value) =>
    value.toLowerCase(),
  );

  return values.some(
    (value) =>
      (value.includes("hydrogenated") || value.includes("partially hydrogenated")) &&
      value.includes("oil"),
  );
}

function buildIngredientDetail(ingredient: IngredientRecord): DemoDetail {
  const tone = toModalTone(ingredient.severity);
  const isFlagged = ingredient.severity === "yellow" || ingredient.severity === "red";

  const sections: DemoModalSection[] = isFlagged
    ? [
        {
          label: "Why this was flagged",
          text:
            ingredient.whyFlagged ??
            "This ingredient is part of the review or warning logic in the current demo rules.",
        },
        {
          label: "What this means",
          text:
            ingredient.whatItMeans ??
            "It adds to the product's overall exposure story instead of supporting a clean pass.",
        },
        {
          label: "What to do",
          text:
            ingredient.whatToDo ??
            "Review it in the context of the full ingredient list before buying or eating.",
        },
      ]
    : [
        {
          label: "What it is",
          text: ingredient.shortDefinition ?? "A normal ingredient in the product.",
        },
        {
          label: "Why it is used",
          text: ingredient.whyUsed ?? "It helps shape flavour, texture, or structure.",
        },
        {
          label: "Concern",
          text:
            ingredient.whatItMeans ??
            "This ingredient is not one of the warning signals driving the result.",
        },
      ];

  return {
    title: ingredient.displayName,
    tone,
    status: severityStatusLabels[tone],
    sections,
  };
}

function buildGenericDetail({
  title,
  tone,
  whyFlagged,
  whatItMeans,
  whatToDo,
}: {
  title: string;
  tone: Exclude<Severity, "neutral">;
  whyFlagged: string;
  whatItMeans: string;
  whatToDo: string;
}): DemoDetail {
  return {
    title,
    tone,
    status: severityStatusLabels[tone],
    sections: [
      {
        label: "Why this was flagged",
        text: whyFlagged,
      },
      {
        label: "What this means",
        text: whatItMeans,
      },
      {
        label: "What to do",
        text: whatToDo,
      },
    ],
  };
}

function makeCheckRow({
  id,
  value,
  severity,
  redCount = 0,
  yellowCount = 0,
  isAutomaticSeriousOverride = automaticSeriousOverrideCheckSet.has(id),
  clearLabel,
  badgeTone,
  detail,
}: {
  id: ExposureCheckId;
  value?: string | number;
  severity: Severity;
  redCount?: number;
  yellowCount?: number;
  isAutomaticSeriousOverride?: boolean;
  clearLabel?: string;
  badgeTone?: Severity;
  detail: DemoDetail;
}): BuiltCheckRow {
  return {
    id,
    label: exposureCheckLabels[id],
    value,
    severity,
    redCount,
    yellowCount,
    isAutomaticSeriousOverride,
    hasMeaningfulValue: clearLabel !== undefined ? true : hasMeaningfulValue(value),
    clearLabel,
    badgeTone,
    detail,
  };
}

function applyCheckOverrides(
  rows: BuiltCheckRow[],
  overrides?: DemoExposureOptions["checkOverrides"],
) {
  if (!overrides) {
    return rows;
  }

  return rows.map((row) => {
    const override = overrides[row.id];
    if (!override) {
      return row;
    }

    const nextValue = Object.prototype.hasOwnProperty.call(override, "value")
      ? override.value
      : row.value;
    const nextClearLabel = Object.prototype.hasOwnProperty.call(override, "clearLabel")
      ? override.clearLabel
      : row.clearLabel;

    return {
      ...row,
      ...override,
      value: nextValue,
      clearLabel: nextClearLabel,
      hasMeaningfulValue:
        override.hasMeaningfulValue ??
        (nextClearLabel !== undefined ? true : hasMeaningfulValue(nextValue)),
    };
  });
}

function matchAllergies(profile: UserProfile, ingredients: IngredientRecord[]) {
  const matches: Array<{ allergy: string; ingredient: IngredientRecord }> = [];
  const seen = new Set<string>();

  profile.allergies.forEach((allergy) => {
    const aliases = allergenAliases[allergy] ?? [];

    ingredients.forEach((ingredient) => {
      const haystack = [
        ingredient.displayName.toLowerCase(),
        ...ingredient.aliases.map((alias) => alias.toLowerCase()),
      ];

      const matched = aliases.some((alias) =>
        haystack.some(
          (entry) => entry.includes(alias.toLowerCase()) || alias.toLowerCase().includes(entry),
        ),
      );

      if (!matched) {
        return;
      }

      const key = `${allergy}:${ingredient.id}`;
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      matches.push({ allergy, ingredient });
    });
  });

  return matches;
}

function buildAdditiveBreakdown(
  ingredients: IngredientRecord[],
): AdditiveBreakdownResult[] {
  const counts = new Map<AdditiveBreakdownKind, number>();
  const artificialSweetenerSummary = getArtificialSweetenerSummary(ingredients);

  additiveBreakdownDescriptors.forEach((item) => {
    counts.set(item.id, 0);
  });

  ingredients.forEach((ingredient) => {
    ingredient.additiveKinds?.forEach((kind) => {
      counts.set(kind, (counts.get(kind) ?? 0) + 1);
    });
  });

  return additiveBreakdownDescriptors.map((descriptor) => {
    const count =
      descriptor.id === "artificial_sweeteners"
        ? artificialSweetenerSummary.totalCount
        : (counts.get(descriptor.id) ?? 0);
    const severity =
      descriptor.id === "artificial_sweeteners"
        ? artificialSweetenerSummary.categorySeverity
        : descriptor.id === "flavour_enhancers"
          ? count >= 3
            ? "red"
            : count > 0
              ? "yellow"
              : "green"
        : count > 0
          ? descriptor.positiveTone
          : "green";

    return {
      id: descriptor.id,
      label: descriptor.label,
      count,
      severity,
      redCount:
        descriptor.id === "artificial_sweeteners"
          ? severity === "red"
            ? count
            : 0
          : severity === "red"
            ? count
            : 0,
      yellowCount:
        descriptor.id === "artificial_sweeteners"
          ? severity === "yellow"
            ? count
            : 0
          : severity === "yellow"
            ? count
            : 0,
      detail:
        descriptor.id === "artificial_sweeteners"
          ? buildArtificialSweetenerDetail(descriptor.label, artificialSweetenerSummary)
          : descriptor.id === "flavour_enhancers"
            ? buildGenericDetail({
                title: descriptor.label,
                tone: severity === "green" ? "green" : severity,
                whyFlagged:
                  count >= 3
                    ? "The ingredient list contains multiple flavouring or flavour-enhancing systems."
                    : count > 0
                      ? `The ingredient list contains ${count} flavour-system signal${count === 1 ? "" : "s"}.`
                      : "No flavour-system signal was found in this demo ingredient list.",
                whatItMeans:
                  count >= 3
                    ? "InsideIt treats 3 or more flavour systems as a red flavour-system load, not as a banned/restricted claim by itself."
                    : count > 0
                      ? "This means the product's taste may be built or boosted with added flavour systems."
                      : "This is one of the calmer results in the additive breakdown.",
                whatToDo:
                  count >= 3
                    ? "Question why the product needs this many taste-building systems before buying or eating regularly."
                    : count > 0
                      ? "Use it as a review point before regular use."
                      : "Keep attention on the rows that still show review or warning signals.",
              })
          : buildGenericDetail({
              title: descriptor.label,
              tone: severity === "green" ? "green" : descriptor.positiveTone,
              whyFlagged:
                count > 0
                  ? `The ingredient list contains ${count} ${descriptor.label.toLowerCase()} signal${count === 1 ? "" : "s"}.`
                  : `No ${descriptor.label.toLowerCase()} signals were found in this demo ingredient list.`,
              whatItMeans:
                count > 0
                  ? "This contributes to the additive side of the exposure score instead of the cleaner side."
                  : "This is one of the calmer results in the additive breakdown.",
              whatToDo:
                count > 0
                  ? "Review it with the rest of the additive breakdown before buying or eating regularly."
                  : "Keep attention on the rows that still show review or warning signals.",
            }),
    };
  });
}

function buildConstructionDetail(
  summary: ArtificialEngineeredFoodConstructionSummary,
): DemoDetail {
  const tone = summary.categorySeverity === "green" ? "green" : summary.categorySeverity;
  const groupDetails = summary.matchedGroups
    .filter((match) => match.group.id !== "label_transparency_risk_markers")
    .map(
      (match) =>
        `${match.group.groupName}: ${formatList(match.matchedIngredients)}`,
    );
  const matchedIngredientText =
    summary.matchedIngredients.length > 0
      ? formatList(summary.matchedIngredients)
      : summary.neutralMatchedIngredients.length > 0
        ? formatList(summary.neutralMatchedIngredients)
        : "No matched construction markers were found.";
  const whyThisMatters =
    summary.redReasons.length > 0
      ? summary.redReasons.join(" ")
      : summary.categorySeverity === "yellow"
        ? "The ingredient list shows construction or transparency markers worth reviewing before calling this a clean pass."
        : "The current demo ingredient list does not show a meaningful construction pattern here.";

  return {
    title: exposureCheckLabels.artificial_engineered_food_construction,
    tone,
    status: severityStatusLabels[tone],
    sections: [
      {
        label: "Category summary",
        text: summary.warningText,
      },
      {
        label: "Total construction markers found",
        text:
          summary.categorySeverity === "green"
            ? "No artificial or engineered food-construction markers were matched in the current demo ingredient list."
            : `${summary.displayCount} marker${summary.displayCount === 1 ? "" : "s"} matched the current construction rules.`,
      },
      {
        label: "Groups triggered",
        text:
          groupDetails.length > 0
            ? groupDetails.join("; ")
            : "No construction groups were triggered in this demo pass.",
      },
      {
        label: "Matched ingredients",
        text: matchedIngredientText,
      },
      {
        label: "Why this matters",
        text: whyThisMatters,
      },
      {
        label: "What to do",
        text:
          summary.categorySeverity === "red"
            ? "Treat this as a serious food-construction concern and review the grouped ingredients before buying or eating regularly."
            : summary.categorySeverity === "yellow"
              ? "Use it as a direct prompt to review the grouped ingredients before you trust the product."
              : "Keep attention on the rows that still show review or warning weight.",
      },
    ],
  };
}

function buildCheckRows({
  category,
  profile,
  classification,
  issueCounts,
  additiveBreakdown,
}: {
  category: ProductCategory;
  profile: UserProfile;
  classification: IngredientClassification;
  issueCounts: CalculatedIssueCounts;
  additiveBreakdown: AdditiveBreakdownResult[];
}) {
  const ingredientMap = new Map(
    demoIngredientRecords.map((ingredient) => [ingredient.id, ingredient]),
  );
  const harmfulAdditives = getCheckCounts(issueCounts, "harmful_additives");
  const bannedRestrictedCounts = getCheckCounts(issueCounts, "banned_restricted_items");
  const cancerWatchCounts = getCheckCounts(issueCounts, "cancer_linked_watch");
  const additiveCounts = getCheckCounts(issueCounts, "additives_preservatives");
  const allergyMatches = matchAllergies(profile, demoIngredientRecords);
  const constructionSummary = analyzeArtificialEngineeredFoodConstruction({
    productName: demoProductMeta.name,
    ingredientNames: demoIngredientRecords.map((ingredient) => ingredient.displayName),
    productCategory: category,
  });
  const processedOilIngredients = demoIngredientRecords.filter((ingredient) =>
    ingredient.issueTags.includes("seed_oil"),
  );
  const hydrogenatedOilCount = processedOilIngredients.filter(hasHydrogenatedOil).length;
  const processedOilCount = processedOilIngredients.length;
  const nonHydrogenatedOilCount = processedOilCount - hydrogenatedOilCount;
  const processedOilSeverity: Severity =
    hydrogenatedOilCount > 0 || processedOilCount >= 2
      ? "red"
      : processedOilCount > 0
        ? "yellow"
        : "green";
  const artificialSweetenerSummary = getArtificialSweetenerSummary(
    demoIngredientRecords,
  );
  const ultraProcessedIndicatorSummary = getUltraProcessedIndicatorSummary(
    demoIngredientRecords,
  );

  const harmfulAdditiveNames = getIngredientNamesByIds(
    [
      ...(issueCounts.ingredientIdsByCheck.harmful_additives?.red ?? []),
      ...(issueCounts.ingredientIdsByCheck.harmful_additives?.yellow ?? []),
    ],
    ingredientMap,
  );
  const bannedRestrictedNames = getIngredientNamesByIds(
    [...(issueCounts.ingredientIdsByCheck.banned_restricted_items?.red ?? [])],
    ingredientMap,
  );
  const cancerWatchNames = getIngredientNamesByIds(
    [...(issueCounts.ingredientIdsByCheck.cancer_linked_watch?.red ?? [])],
    ingredientMap,
  );
  const additiveCountTotal = additiveBreakdown.reduce((sum, item) => sum + item.count, 0);
  const preservativeCount =
    additiveBreakdown.find((item) => item.id === "preservatives")?.count ?? 0;
  const artificialSweetenerCount = artificialSweetenerSummary.totalCount;
  const artificialColourCount =
    additiveBreakdown.find((item) => item.id === "artificial_colours")?.count ?? 0;

  const bannedRestrictedRows = bannedRestrictedNames.map((name) => {
    const restricted = Object.values(bannedRestricted).find(
      (item) => item?.name.toLowerCase() === name.toLowerCase(),
    );

    return restricted ?? null;
  });

  const harmfulAdditiveTotal = harmfulAdditives.red + harmfulAdditives.yellow;
  const processedIngredientSeverity: Severity =
    ultraProcessedIndicatorSummary.categorySeverity;
  const processedMixSeverity: Severity =
    classification.processedPercent >= 60
      ? "red"
      : classification.processedPercent >= 31
        ? "yellow"
        : "green";
  const ingredientCountSeverity: Severity =
    classification.totalCount >= 15
      ? "red"
      : classification.totalCount >= 8
        ? "yellow"
        : "green";

  const ingredientCountValue =
    ingredientCountSeverity === "red"
      ? "High"
      : ingredientCountSeverity === "yellow"
        ? "Review"
        : "Low";

  const additiveSectionSeverity: Severity =
    additiveCountTotal >= 3 ? "red" : additiveCountTotal > 0 ? "yellow" : "green";
  const additiveSectionValue =
    additiveSectionSeverity === "red"
      ? "High"
      : additiveSectionSeverity === "yellow"
        ? "Review"
        : "No";

  const rows: BuiltCheckRow[] = [
    makeCheckRow({
      id: "artificial_engineered_food_construction",
      value:
        constructionSummary.categorySeverity === "green"
          ? "No"
          : `${constructionSummary.displayCount}`,
      severity: constructionSummary.categorySeverity,
      redCount:
        constructionSummary.categorySeverity === "red"
          ? constructionSummary.displayCount
          : 0,
      yellowCount:
        constructionSummary.categorySeverity === "yellow"
          ? constructionSummary.displayCount
          : 0,
      clearLabel:
        constructionSummary.categorySeverity === "green" ? "No" : undefined,
      detail: buildConstructionDetail(constructionSummary),
    }),
    makeCheckRow({
      id: "harmful_additives",
      severity:
        harmfulAdditiveTotal >= 3
          ? "red"
          : harmfulAdditiveTotal > 0
            ? "yellow"
            : "green",
      redCount: harmfulAdditives.red,
      yellowCount: harmfulAdditives.yellow,
      clearLabel: harmfulAdditiveTotal === 0 ? "No" : undefined,
      detail: buildGenericDetail({
        title: exposureCheckLabels.harmful_additives,
        tone: harmfulAdditiveTotal >= 3 ? "red" : harmfulAdditiveTotal > 0 ? "yellow" : "green",
        whyFlagged:
          harmfulAdditiveTotal > 0
            ? `The demo rules found ${harmfulAdditiveTotal} additive-style ingredient${harmfulAdditiveTotal === 1 ? "" : "s"}: ${formatList(harmfulAdditiveNames)}.`
            : "No harmful additive signals were found in this demo ingredient set.",
        whatItMeans:
          harmfulAdditiveTotal > 0
            ? "The product leans further into a processed ingredient story instead of a cleaner pantry-style label."
            : "This is one of the calmer checks in the overview.",
        whatToDo:
          harmfulAdditiveTotal > 0
            ? "Open the ingredient groups and additive breakdown to see which ingredients are driving the warning."
            : "Focus on the rows that still show review or warning signals.",
      }),
    }),
    makeCheckRow({
      id: "banned_restricted_items",
      severity:
        bannedRestrictedCounts.red + bannedRestrictedCounts.yellow > 0 ? "red" : "green",
      redCount: bannedRestrictedCounts.red,
      yellowCount: bannedRestrictedCounts.yellow,
      clearLabel:
        bannedRestrictedCounts.red + bannedRestrictedCounts.yellow === 0 ? "No" : undefined,
      detail: buildGenericDetail({
        title: exposureCheckLabels.banned_restricted_items,
        tone:
          bannedRestrictedCounts.red + bannedRestrictedCounts.yellow > 0 ? "red" : "green",
        whyFlagged:
          bannedRestrictedRows.length > 0
            ? `${formatList(
                bannedRestrictedRows
                  .filter((row): row is NonNullable<typeof row> => row !== null)
                  .map((row) => row.name),
              )} appears on the demo banned / restricted watch list.`
            : "No banned or restricted watch-list ingredients were found.",
        whatItMeans:
          bannedRestrictedRows.length > 0
            ? "This is one of the strongest red flags in the current rule set."
            : "This check did not surface a banned or restricted item for this demo result.",
        whatToDo:
          bannedRestrictedRows.length > 0
            ? "Review the flagged ingredient before deciding this product is worth buying or eating."
            : "Keep attention on the checks that still show review or warning signals.",
      }),
    }),
    makeCheckRow({
      id: "seed_oil",
      value:
        hydrogenatedOilCount > 0
          ? "Hydrogenated found"
          : processedOilCount >= 2
            ? "High load"
          : processedOilCount > 0
            ? `${processedOilCount}`
            : "No",
      severity: processedOilSeverity,
      redCount:
        processedOilSeverity === "red"
          ? hydrogenatedOilCount || processedOilCount
          : undefined,
      yellowCount: processedOilSeverity === "yellow" ? nonHydrogenatedOilCount : undefined,
      clearLabel: processedOilCount === 0 ? "No" : undefined,
      detail: buildGenericDetail({
        title: exposureCheckLabels.seed_oil,
        tone: processedOilSeverity,
        whyFlagged:
          hydrogenatedOilCount > 0
            ? `The ingredient list contains ${hydrogenatedOilCount} hydrogenated oil signal${hydrogenatedOilCount === 1 ? "" : "s"}, which crosses the red threshold for this category.`
            : processedOilCount >= 2
              ? `The ingredient list contains ${processedOilCount} seed or processed-oil signal${processedOilCount === 1 ? "" : "s"}, which InsideIt treats as a high processed-oil load.`
            : processedOilCount > 0
              ? `The ingredient list contains ${processedOilCount} processed-oil signal${processedOilCount === 1 ? "" : "s"}, but none are hydrogenated or partially hydrogenated.`
            : "No processed-oil signal was found in the current demo ingredient list.",
        whatItMeans:
          hydrogenatedOilCount > 0
            ? "This is a stronger oil warning and can push the product into the red zone."
            : processedOilCount >= 2
              ? "This is a red load concern because multiple processed oil systems appear in one product. It is not a banned/restricted claim by itself."
            : processedOilCount > 0
              ? "This adds to the review side of the score without becoming a red issue by itself."
            : "This is one calmer result in the overview.",
        whatToDo:
          processedOilCount > 0
            ? "Keep it in mind if processed oils are one of the things you watch for."
            : "Focus on the rows that still show stronger exposure signals.",
      }),
    }),
    makeCheckRow({
      id: "total_ingredients",
      value: classification.totalCount,
      severity: ingredientCountSeverity,
      badgeTone: ingredientCountSeverity,
      detail: buildGenericDetail({
        title: exposureCheckLabels.total_ingredients,
        tone: toModalTone(ingredientCountSeverity),
        whyFlagged: `This demo product has ${classification.totalCount} visible ingredients.`,
        whatItMeans:
          ingredientCountSeverity === "red"
            ? "The ingredient count crosses the red threshold and adds to the overall warning level."
            : ingredientCountSeverity === "yellow"
              ? "The list is getting long enough to count as a review signal."
            : "The ingredient list is relatively short compared with more heavily formulated products.",
        whatToDo:
          ingredientCountSeverity !== "green"
            ? "Use it as context while reviewing the processed and additive signals."
            : "Keep attention on any rows that still show stronger warnings.",
      }),
    }),
    makeCheckRow({
      id: "ultra_processed",
      value:
        ultraProcessedIndicatorSummary.hasAutomaticRed
          ? "Red marker"
          : processedIngredientSeverity === "red"
            ? "High load"
            : processedIngredientSeverity === "yellow"
              ? `${ultraProcessedIndicatorSummary.totalCount}`
              : "No",
      severity: processedIngredientSeverity,
      redCount:
        processedIngredientSeverity === "red"
          ? ultraProcessedIndicatorSummary.displayCount
          : 0,
      yellowCount:
        processedIngredientSeverity === "yellow"
          ? ultraProcessedIndicatorSummary.totalCount
          : 0,
      clearLabel: processedIngredientSeverity === "green" ? "No" : undefined,
      detail: buildGenericDetail({
        title: exposureCheckLabels.ultra_processed,
        tone: toModalTone(processedIngredientSeverity),
        whyFlagged:
          ultraProcessedIndicatorSummary.hasAutomaticRed
            ? "At least one ultra-processed marker also triggered a red rule in another category."
            : processedIngredientSeverity === "red"
              ? `The product contains ${ultraProcessedIndicatorSummary.totalCount} ultra-processed marker${ultraProcessedIndicatorSummary.totalCount === 1 ? "" : "s"}, which crosses the red threshold for this category.`
              : processedIngredientSeverity === "yellow"
                ? `The product contains ${ultraProcessedIndicatorSummary.totalCount} ultra-processed marker${ultraProcessedIndicatorSummary.totalCount === 1 ? "" : "s"}, which puts it into review range.`
            : "The ingredient mix does not strongly point toward an ultra-processed profile in this demo pass.",
        whatItMeans:
          ultraProcessedIndicatorSummary.hasAutomaticRed
            ? "InsideIt treats this as a serious ingredient concern because another category already marks the ingredient red."
            : processedIngredientSeverity === "red"
              ? "InsideIt treats 4 or more ultra-processed markers as a red ultra-processed load."
              : processedIngredientSeverity === "yellow"
                ? "The label leans harder into engineered support ingredients than a simpler food usually would."
            : "This check is not one of the main drivers of concern for this result.",
        whatToDo:
          processedIngredientSeverity !== "green"
            ? "Use it together with the additive and ingredient-group sections before buying."
            : "Keep attention on the rows that still show review or warning signals.",
      }),
    }),
    makeCheckRow({
      id: "natural_vs_processed",
      value: `${classification.naturalPercent}% / ${classification.processedPercent}%`,
      severity: processedMixSeverity,
      detail: buildGenericDetail({
        title: exposureCheckLabels.natural_vs_processed,
        tone: toModalTone(processedMixSeverity),
        whyFlagged:
          processedMixSeverity !== "green"
            ? `The visible ingredient mix is ${classification.naturalPercent}% natural-positive and ${classification.processedPercent}% processed or review.`
            : "The visible ingredient mix does not lean heavily toward processed ingredients.",
        whatItMeans:
          processedMixSeverity === "red"
            ? "The processed share crosses the red threshold and becomes a direct red-zone trigger."
            : processedMixSeverity === "yellow"
              ? "Most of the ingredient story sits on the processed or unclear side instead of the cleaner side."
            : "The ingredient split is not one of the stronger warning signals in this result.",
        whatToDo:
          processedMixSeverity !== "green"
            ? "Open the ingredient groups to see exactly which items are driving the imbalance."
            : "Keep focus on the highlighted rows that still carry more warning weight.",
      }),
    }),
    makeCheckRow({
      id: "allergy_risk",
      value: allergyMatches.length > 0 ? "Found" : "No",
      severity: allergyMatches.length > 0 ? "red" : "green",
      redCount: allergyMatches.length,
      clearLabel: allergyMatches.length === 0 ? "No" : undefined,
      detail: buildGenericDetail({
        title: exposureCheckLabels.allergy_risk,
        tone: allergyMatches.length > 0 ? "red" : "green",
        whyFlagged:
          allergyMatches.length > 0
            ? `The selected allergy profile matched ${formatList(
                allergyMatches.map((match) => `${match.ingredient.displayName} (${match.allergy})`),
              )}.`
            : "No selected allergy from the current watch profile matched the visible ingredient list.",
        whatItMeans:
          allergyMatches.length > 0
            ? "This is a direct personal warning, not just a general review note."
            : "The app did not surface an allergy issue for the current profile and visible ingredients.",
        whatToDo:
          allergyMatches.length > 0
            ? "Do not consume this product if you are allergic to the flagged ingredient."
            : "Always confirm the physical label, but this result is not showing an allergy warning on its own.",
      }),
    }),
    makeCheckRow({
      id: "artificial_sweeteners",
      value: artificialSweetenerCount > 0 ? `${artificialSweetenerCount}` : "No",
      severity: artificialSweetenerSummary.categorySeverity,
      redCount:
        artificialSweetenerSummary.categorySeverity === "red"
          ? artificialSweetenerCount
          : 0,
      yellowCount:
        artificialSweetenerSummary.categorySeverity === "yellow"
          ? artificialSweetenerCount
          : 0,
      clearLabel: artificialSweetenerCount === 0 ? "No" : undefined,
      detail: buildArtificialSweetenerDetail(
        exposureCheckLabels.artificial_sweeteners,
        artificialSweetenerSummary,
      ),
    }),
    makeCheckRow({
      id: "artificial_colours",
      value: artificialColourCount > 0 ? `${artificialColourCount}` : "No",
      severity: artificialColourCount > 0 ? "yellow" : "green",
      yellowCount: artificialColourCount,
      clearLabel: artificialColourCount === 0 ? "No" : undefined,
      detail: buildGenericDetail({
        title: exposureCheckLabels.artificial_colours,
        tone: artificialColourCount > 0 ? "yellow" : "green",
        whyFlagged:
          artificialColourCount > 0
            ? `The bar contains ${artificialColourCount} artificial colour signal, driven by Red No. 3.`
            : "No artificial colour signal was found in this demo ingredient list.",
        whatItMeans:
          artificialColourCount > 0
            ? "Artificial colour use is a warning signal, but it does not become red on its own unless it also triggers an automatic red watch category."
            : "This check is not adding concern to the result.",
        whatToDo:
          artificialColourCount > 0
            ? "Review the flagged ingredient before deciding you trust the product."
            : "Keep attention on the rows that still show review or warning signals.",
      }),
    }),
    makeCheckRow({
      id: "preservatives",
      value: preservativeCount > 0 ? `${preservativeCount}` : "No",
      severity: preservativeCount > 0 ? "yellow" : "green",
      yellowCount: preservativeCount,
      clearLabel: preservativeCount === 0 ? "No" : undefined,
      detail: buildGenericDetail({
        title: exposureCheckLabels.preservatives,
        tone: preservativeCount > 0 ? "yellow" : "green",
        whyFlagged:
          preservativeCount > 0
            ? `The ingredient list contains ${preservativeCount} preservative signal${preservativeCount === 1 ? "" : "s"}.`
            : "No preservative signal was found in the current demo ingredient list.",
        whatItMeans:
          preservativeCount > 0
            ? "This adds to the longer-shelf-life processing story behind the label."
            : "This is one of the cleaner lower-level checks in the result.",
        whatToDo:
          preservativeCount > 0
            ? "Review it with the rest of the additive breakdown."
            : "Keep attention on the rows that still show stronger warning weight.",
      }),
    }),
    makeCheckRow({
      id: "microplastics",
      value: "Unknown",
      severity: "neutral",
      detail: buildGenericDetail({
        title: exposureCheckLabels.microplastics,
        tone: "yellow",
        whyFlagged: "The current demo ingredient pass does not have enough support to judge this honestly.",
        whatItMeans: "This check stays hidden until the app has a real basis for showing it.",
        whatToDo: "Treat it as unsupported for now rather than reading anything into it.",
      }),
    }),
    makeCheckRow({
      id: "heavy_metals",
      value: "Unknown",
      severity: "neutral",
      detail: buildGenericDetail({
        title: exposureCheckLabels.heavy_metals,
        tone: "yellow",
        whyFlagged: "The current demo ingredient pass does not have enough support to judge this honestly.",
        whatItMeans: "This check stays hidden until the app has a real basis for showing it.",
        whatToDo: "Treat it as unsupported for now rather than reading anything into it.",
      }),
    }),
    makeCheckRow({
      id: "meat_feed_source",
      value: "Unknown",
      severity: "neutral",
      detail: buildGenericDetail({
        title: exposureCheckLabels.meat_feed_source,
        tone: "yellow",
        whyFlagged: "This cereal-bar demo product does not support a meat feed source check.",
        whatItMeans: "The row stays hidden because it would not be honest to show a fake value.",
        whatToDo: "Ignore this check for the current demo product.",
      }),
    }),
    makeCheckRow({
      id: "fry_oil_seed_oils",
      value: "Unknown",
      severity: "neutral",
      detail: buildGenericDetail({
        title: exposureCheckLabels.fry_oil_seed_oils,
        tone: "yellow",
        whyFlagged: "This cereal-bar demo product does not support a fry-oil check.",
        whatItMeans: "The row stays hidden because there is not enough basis to show it honestly.",
        whatToDo: "Ignore this check for the current demo product.",
      }),
    }),
    makeCheckRow({
      id: "additives_preservatives",
      value: additiveSectionValue,
      severity: additiveSectionSeverity,
      redCount: additiveCounts.red,
      yellowCount: additiveCounts.yellow,
      detail: buildGenericDetail({
        title: exposureCheckLabels.additives_preservatives,
        tone: additiveSectionSeverity === "green" ? "green" : toModalTone(additiveSectionSeverity),
        whyFlagged:
          additiveCountTotal > 0
            ? `The demo rules found ${additiveCountTotal} additive-style ingredient signals across the breakdown.`
            : "No additive or preservative signals were found in the current demo list.",
        whatItMeans:
          additiveCountTotal > 0
            ? "This section combines the additive load into one clearer readout before you open the breakdown."
            : "This section is calm for the current demo result.",
        whatToDo:
          additiveCountTotal > 0
            ? "Open the breakdown to see which additive categories are actually driving the warning."
            : "Keep focus on the rows that still show stronger warning weight.",
      }),
    }),
    makeCheckRow({
      id: "ingredient_count",
      value: ingredientCountValue,
      severity: ingredientCountSeverity,
      detail: buildGenericDetail({
        title: exposureCheckLabels.ingredient_count,
        tone: toModalTone(ingredientCountSeverity),
        whyFlagged: `The current demo product shows ${classification.totalCount} total ingredients.`,
        whatItMeans:
          ingredientCountSeverity === "red"
            ? "That is a high count and adds to the sense that the label is doing a lot of work."
            : ingredientCountSeverity === "yellow"
              ? "The count is not extreme, but it still adds to the review side of the score."
              : "The ingredient count is not one of the main drivers of concern here.",
        whatToDo:
          ingredientCountSeverity !== "green"
            ? "Compare it against a shorter-label option if a simpler ingredient list matters to you."
            : "Keep attention on the rows that still show stronger warning signals.",
      }),
    }),
    makeCheckRow({
      id: "cancer_linked_watch",
      value: cancerWatchCounts.red + cancerWatchCounts.yellow > 0 ? "Found" : "No",
      severity: cancerWatchCounts.red + cancerWatchCounts.yellow > 0 ? "red" : "green",
      redCount: cancerWatchCounts.red,
      yellowCount: cancerWatchCounts.yellow,
      clearLabel: cancerWatchCounts.red + cancerWatchCounts.yellow === 0 ? "No" : undefined,
      detail: buildGenericDetail({
        title: exposureCheckLabels.cancer_linked_watch,
        tone: cancerWatchCounts.red + cancerWatchCounts.yellow > 0 ? "red" : "green",
        whyFlagged:
          cancerWatchNames.length > 0
            ? `${formatList(cancerWatchNames)} is on the current demo cancer-linked watch list.`
            : "No cancer-linked watch-list item was found in the current demo result.",
        whatItMeans:
          cancerWatchNames.length > 0
            ? "This is treated as a stronger red flag instead of a routine yellow review note."
            : "This check is not adding concern to the current result.",
        whatToDo:
          cancerWatchNames.length > 0
            ? "Treat it as a serious reason to review the product before buying or eating regularly."
            : "Keep attention on the rows that still show stronger warning weight.",
      }),
    }),
    makeCheckRow({
      id: "brand_trust_safety",
      value: "Clear",
      severity: "green",
      clearLabel: "Clear",
      detail: buildGenericDetail({
        title: exposureCheckLabels.brand_trust_safety,
        tone: "green",
        whyFlagged: "No active brand-trust warning is being surfaced in this demo pass.",
        whatItMeans: "This is one positive context signal, but it does not erase ingredient red flags elsewhere.",
        whatToDo: "Use it as supporting context while still judging the product by the label itself.",
      }),
    }),
    makeCheckRow({
      id: "lawsuits_recalls",
      value: "Clear",
      severity: "green",
      clearLabel: "Clear",
      detail: buildGenericDetail({
        title: exposureCheckLabels.lawsuits_recalls,
        tone: "green",
        whyFlagged: "No lawsuit or recall issue is being surfaced in this demo pass.",
        whatItMeans: "This is not one of the concerns driving the current result.",
        whatToDo: "Keep focus on the ingredient and additive signals that still matter more here.",
      }),
    }),
  ];

  return {
    rows,
    constructionSummary,
  };
}

function buildIngredientGroups(
  classification: IngredientClassification,
): DemoIngredientGroup[] {
  const groupMeta: Array<{
    id: IngredientGroup;
    label: string;
    tone: Severity;
  }> = [
    {
      id: "natural_positive",
      label: "Positive / Natural",
      tone: "green",
    },
    {
      id: "processed_artificial",
      label: "Negative / Processed / Artificial",
      tone: "red",
    },
    {
      id: "unknown_review",
      label: "Unknown / Review",
      tone: "neutral",
    },
  ];

  return groupMeta.map((group) => ({
    label: group.label,
    tone: group.tone,
    items: classification.groups[group.id].map((ingredient) => ({
      name: ingredient.displayName,
      tone: ingredient.severity,
      detail: buildIngredientDetail(ingredient),
    })),
  }));
}

function buildAdditivesSection(
  checkMap: Map<ExposureCheckId, BuiltCheckRow>,
  additiveBreakdown: AdditiveBreakdownResult[],
): DemoAdditivesSection {
  const additiveRow = checkMap.get("additives_preservatives")!;

  return {
    label: additiveRow.label,
    value: stringifyValue(additiveRow.value),
    tone: additiveRow.severity,
    subtitle: "Chemical additives found in this product",
    redCount: additiveRow.redCount,
    yellowCount: additiveRow.yellowCount,
    clearLabel: additiveRow.clearLabel,
    detail: additiveRow.detail,
    breakdown: additiveBreakdown.map((item) => ({
      id: item.id,
      label: item.label,
      count: item.count,
      tone: item.severity,
      detail: item.detail,
    })),
    serious: additiveRow.isAutomaticSeriousOverride,
  };
}

function buildBrandTrustRow(
  checkMap: Map<ExposureCheckId, BuiltCheckRow>,
): DemoBrandTrustRow {
  const brandTrust = checkMap.get("brand_trust_safety")!;
  const lawsuitsRecalls = checkMap.get("lawsuits_recalls")!;
  const tone =
    lawsuitsRecalls.severity === "red" || brandTrust.severity === "red"
      ? "red"
      : lawsuitsRecalls.severity === "yellow" || brandTrust.severity === "yellow"
        ? "yellow"
        : "green";

  const subtitle =
    lawsuitsRecalls.severity === "red"
      ? "Active recall concerns surfaced"
      : brandTrust.severity === "red"
        ? "Brand safety concerns surfaced"
        : tone === "yellow"
          ? "Brand safety signals are worth reviewing"
          : "No active lawsuits or recalls";

  const activeRow =
    lawsuitsRecalls.severity === "red"
      ? lawsuitsRecalls
      : brandTrust;
  const redCount = Math.max(brandTrust.redCount, lawsuitsRecalls.redCount);
  const yellowCount = Math.max(brandTrust.yellowCount, lawsuitsRecalls.yellowCount);

  return {
    title: brandTrust.label,
    status: activeRow.clearLabel ?? stringifyValue(activeRow.value),
    tone,
    subtitle,
    redCount: redCount || undefined,
    yellowCount: yellowCount || undefined,
    clearLabel: tone === "green" ? "Clear" : undefined,
    detail: activeRow.detail,
  };
}

function buildDeepCheckRows(
  category: ProductCategory,
  allChecks: BuiltCheckRow[],
  quickOverviewRows: DemoQuickOverviewRow[],
) {
  const categoryProfile = getCategoryProfileBySlug(getCategorySlug(category));
  const quickOverviewIds = new Set(quickOverviewRows.map((row) => row.id));
  const categoryBaseIds = new Set(categoryProfile.quickOverviewIds);
  const checkMap = new Map(allChecks.map((row) => [row.id, row]));

  return deepCheckOrder
    .map((id, index) => ({
      row: checkMap.get(id),
      index,
    }))
    .filter(
      (
        entry,
      ): entry is { row: BuiltCheckRow; index: number } => entry.row !== undefined,
    )
    .filter(({ row }) => {
      if (
        quickOverviewIds.has(row.id) ||
        categoryBaseIds.has(row.id) ||
        row.id === "additives_preservatives" ||
        row.id === "brand_trust_safety" ||
        row.id === "lawsuits_recalls"
      ) {
        return false;
      }

      if (row.isAutomaticSeriousOverride && row.severity !== "red") {
        return false;
      }

      return row.hasMeaningfulValue;
    })
    .sort((a, b) => {
      const severityDelta = severityOrder(a.row.severity) - severityOrder(b.row.severity);
      if (severityDelta !== 0) {
        return severityDelta;
      }

      return a.index - b.index;
    })
    .map(({ row }) => ({
      id: row.id,
      label: row.label,
      value: stringifyValue(row.value),
      tone: row.severity,
      redCount: row.redCount || undefined,
      yellowCount: row.yellowCount || undefined,
      clearLabel: row.clearLabel,
      badgeTone: row.badgeTone,
      detail: row.detail,
      serious: row.isAutomaticSeriousOverride,
    }));
}

function getRiskTone(score: number): Exclude<Severity, "neutral"> {
  if (score >= 65) {
    return "red";
  }

  if (score >= 25) {
    return "yellow";
  }

  return "green";
}

export function getDemoCategoryProfile(categorySlug?: string | null): DemoCategoryProfile {
  return toDemoCategoryProfile(getCategoryProfileBySlug(categorySlug));
}

export function getDemoExposureReport(
  categorySlug?: string | null,
  profile: UserProfile = defaultProfile,
  options?: DemoExposureOptions,
): DemoExposureReport {
  const categoryProfile = getCategoryProfileBySlug(categorySlug);
  const classification = classifyIngredients(demoIngredientRecords);
  const issueCounts = calculateIssueCounts(demoIngredientRecords);
  const additiveBreakdown = buildAdditiveBreakdown(demoIngredientRecords);
  const builtChecks = buildCheckRows({
    category: categoryProfile.id,
    profile,
    classification,
    issueCounts,
    additiveBreakdown,
  });
  const allChecks = applyCheckOverrides(
    builtChecks.rows,
    options?.checkOverrides,
  );

  const quickOverviewBase = buildQuickOverview(
    categoryProfile.id,
    allChecks.map((row) => ({
      id: row.id,
      label: row.label,
      value: row.value,
      severity: row.severity,
      redCount: row.redCount,
      yellowCount: row.yellowCount,
      isAutomaticSeriousOverride: row.isAutomaticSeriousOverride,
      hasMeaningfulValue: row.hasMeaningfulValue,
    })),
  );
  const checkMap = new Map(allChecks.map((row) => [row.id, row]));
  const quickOverviewRows: DemoQuickOverviewRow[] = quickOverviewBase
    .map((row) => checkMap.get(row.id)!)
    .map((row) => ({
      id: row.id,
      label: row.label,
      value: stringifyValue(row.value),
      tone: row.severity,
      redCount: row.redCount || undefined,
      yellowCount: row.yellowCount || undefined,
      clearLabel: row.clearLabel,
      badgeTone: row.badgeTone,
      detail: row.detail,
      serious: row.isAutomaticSeriousOverride,
    }));

  const risk = calculateExposureRisk({
    checkResults: allChecks,
    ingredientClassification: classification,
    additivesBreakdown: additiveBreakdown,
    constructionSummary: builtChecks.constructionSummary,
  });
  const finalVerdict = buildFinalVerdict(risk.exposureRisk, allChecks);
  const riskTone = getRiskTone(risk.exposureRisk);

  return {
    product: {
      name: demoProductMeta.name,
      brand: demoProductMeta.brand,
      barcode: demoProductMeta.barcode,
      imageAlt: demoProductMeta.imageAlt,
      score: risk.exposureRisk,
      scoreLabel: finalVerdict.title,
      gradeLabel: "Exposure Risk",
      tone: riskTone,
    },
    categoryProfile: toDemoCategoryProfile(categoryProfile),
    quickOverviewRows,
    naturalProcessed: {
      naturalPercent: classification.naturalPercent,
      processedPercent: classification.processedPercent,
      viewLabel: "View ingredients",
    },
    ingredientGroups: buildIngredientGroups(classification),
    deepCheckRows: buildDeepCheckRows(
      categoryProfile.id,
      allChecks,
      quickOverviewRows,
    ),
    additivesSection: buildAdditivesSection(checkMap, additiveBreakdown),
    brandTrustRow: buildBrandTrustRow(checkMap),
    finalVerdict,
  };
}
