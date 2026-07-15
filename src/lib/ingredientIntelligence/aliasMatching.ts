export type AliasCoverageBuckets = {
  otherNames?: readonly string[];
  chemicalNames?: readonly string[];
  brandNames?: readonly string[];
  eNumbers?: readonly string[];
  insNumbers?: readonly string[];
  abbreviations?: readonly string[];
  labelVariants?: readonly string[];
  spellingVariants?: readonly string[];
  regionalNames?: readonly string[];
  eNumberVariants?: readonly string[];
};

export type MatchableAliasItem = {
  id: string;
  mainName: string;
  otherNames: readonly string[];
};

const aliasFieldNames = [
  "otherNames",
  "chemicalNames",
  "brandNames",
  "eNumbers",
  "insNumbers",
  "abbreviations",
  "labelVariants",
  "spellingVariants",
  "regionalNames",
  "eNumberVariants",
] as const;

function normalizeSubscriptDigits(value: string) {
  return value
    .replace(/\u2080/g, "0")
    .replace(/\u2081/g, "1")
    .replace(/\u2082/g, "2")
    .replace(/\u2083/g, "3")
    .replace(/\u2084/g, "4")
    .replace(/\u2085/g, "5")
    .replace(/\u2086/g, "6")
    .replace(/\u2087/g, "7")
    .replace(/\u2088/g, "8")
    .replace(/\u2089/g, "9");
}

export function normalizeAliasText(value: string) {
  return normalizeSubscriptDigits(value)
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, "")
    .replace(/\u03b1/g, "alpha")
    .replace(/\u03b2/g, "beta")
    .replace(/colour/g, "color")
    .replace(/flavour/g, "flavor")
    .replace(/sulph/g, "sulf")
    .replace(/hydrolysed/g, "hydrolyzed")
    .replace(/stabiliser/g, "stabilizer")
    .replace(/[()[\]{}]/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectAliasValues<TItem extends MatchableAliasItem>(
  item: TItem,
  coverage?: AliasCoverageBuckets,
) {
  const values = new Set<string>([item.mainName, ...item.otherNames]);
  const itemCoverage = item as MatchableAliasItem & AliasCoverageBuckets;

  aliasFieldNames.forEach((fieldName) => {
    itemCoverage[fieldName]?.forEach((value) => values.add(value));
    coverage?.[fieldName]?.forEach((value) => values.add(value));
  });

  return [...values];
}

function buildMatchTerms<TItem extends MatchableAliasItem>(
  item: TItem,
  coverage?: AliasCoverageBuckets,
) {
  const terms = new Map<string, { value: string; allowCollapsed: boolean }>();

  collectAliasValues(item, coverage)
    .map(normalizeAliasText)
    .filter(Boolean)
    .forEach((value) => {
      terms.set(value, { value, allowCollapsed: false });
      if (value.includes(" ")) {
        const collapsed = value.replace(/\s+/g, "");
        terms.set(collapsed, { value: collapsed, allowCollapsed: true });
      }
    });

  return [...terms.values()];
}

function includesNormalizedTerm(haystack: string, term: string) {
  return ` ${haystack} `.includes(` ${term} `);
}

export function findAliasMatches<TItem extends MatchableAliasItem>(
  items: readonly TItem[],
  coverageById: Partial<Record<string, AliasCoverageBuckets>> | undefined,
  labelText: string,
) {
  const haystack = normalizeAliasText(labelText);
  const collapsedHaystack = haystack.replace(/\s+/g, "");
  const matches = new Map<string, TItem>();

  if (!haystack) {
    return [] as TItem[];
  }

  items.forEach((item) => {
    const terms = buildMatchTerms(item, coverageById?.[item.id]);
    const matched = terms.some(({ value, allowCollapsed }) => {
      if (!value) {
        return false;
      }

      return (
        includesNormalizedTerm(haystack, value) ||
        (allowCollapsed && collapsedHaystack.includes(value))
      );
    });

    if (matched) {
      matches.set(item.id, item);
    }
  });

  return [...matches.values()];
}
