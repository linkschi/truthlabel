import type {
  ExternalSafetyLookupInput,
  ExternalSafetySignal,
} from "./externalSafetyTypes";
import {
  normalizeExternalSafetyText,
  uniqueStrings,
} from "./externalSafetyTypes";

export type ExternalSafetyMatchCandidate = {
  barcodes?: string[];
  productNames?: string[];
  brandNames?: string[];
  companyNames?: string[];
  lotCodes?: string[];
  categoryKeywords?: string[];
  searchableText?: string;
};

function tokenSet(value: string | undefined) {
  return new Set(
    normalizeExternalSafetyText(value)
      .split(" ")
      .filter((token) => token.length >= 3),
  );
}

function hasExactDigits(
  sourceValue: string | undefined,
  targetDigits: string | undefined,
) {
  const source = sourceValue?.replace(/\D+/g, "") ?? "";
  const target = targetDigits?.replace(/\D+/g, "") ?? "";
  return Boolean(source && target && source.includes(target));
}

function phraseMatches(
  left: string | undefined,
  right: string | undefined,
) {
  const normalizedLeft = normalizeExternalSafetyText(left);
  const normalizedRight = normalizeExternalSafetyText(right);

  if (!normalizedLeft || !normalizedRight) {
    return false;
  }

  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  );
}

function overlapRatio(left: string | undefined, right: string | undefined) {
  const leftTokens = [...tokenSet(left)];
  const rightTokens = [...tokenSet(right)];

  if (leftTokens.length === 0 || rightTokens.length === 0) {
    return 0;
  }

  const rightSet = new Set(rightTokens);
  const overlap = leftTokens.filter((token) => rightSet.has(token)).length;
  return overlap / Math.max(leftTokens.length, rightTokens.length);
}

function hasCategoryKeywordMatch(
  input: ExternalSafetyLookupInput,
  candidate: ExternalSafetyMatchCandidate,
) {
  const source = normalizeExternalSafetyText(
    [input.productCategory, candidate.searchableText, ...(candidate.categoryKeywords ?? [])]
      .filter(Boolean)
      .join(" "),
  );

  const category = normalizeExternalSafetyText(input.productCategory);
  return Boolean(
    source &&
      category &&
      category
        .split(" ")
        .filter((token) => token.length >= 3)
        .some((token) => ` ${source} `.includes(` ${token} `)),
  );
}

export function matchExternalSafetySignal(
  input: ExternalSafetyLookupInput,
  candidate: ExternalSafetyMatchCandidate,
): Pick<ExternalSafetySignal, "matchedBy" | "matchConfidence"> {
  const matchedBy: ExternalSafetySignal["matchedBy"] = [];
  let score = 0;

  const inputBarcode = input.barcode?.trim();
  const candidateBarcodeMatch = (candidate.barcodes ?? []).some((barcode) =>
    hasExactDigits(barcode, inputBarcode),
  );
  if (candidateBarcodeMatch) {
    matchedBy.push("barcode");
    score += 100;
  }

  const inputLotCode = input.lotCode?.trim();
  if (
    inputLotCode &&
    (candidate.lotCodes ?? []).some((lotCode) =>
      phraseMatches(lotCode, inputLotCode),
    )
  ) {
    matchedBy.push("lot_code");
    score += 40;
  }

  const productNameMatched = (candidate.productNames ?? []).some((name) => {
    if (phraseMatches(name, input.productName)) {
      return true;
    }

    return overlapRatio(name, input.productName) >= 0.7;
  });
  if (productNameMatched) {
    matchedBy.push("product_name");
    score += 50;
  }

  const brandMatched = (candidate.brandNames ?? []).some((name) =>
    phraseMatches(name, input.brandName),
  );
  if (brandMatched) {
    matchedBy.push("brand_name");
    score += 25;
  }

  const companyMatched = (candidate.companyNames ?? []).some((name) =>
    phraseMatches(name, input.brandName),
  );
  if (companyMatched) {
    matchedBy.push("company_name");
    score += 20;
  }

  if (hasCategoryKeywordMatch(input, candidate)) {
    matchedBy.push("category_keyword");
    score += 12;
  }

  const uniqueMatchedBy = uniqueStrings(matchedBy) as ExternalSafetySignal["matchedBy"];

  let matchConfidence: ExternalSafetySignal["matchConfidence"] = "low";
  if (
    uniqueMatchedBy.includes("barcode") ||
    (uniqueMatchedBy.includes("product_name") &&
      (uniqueMatchedBy.includes("brand_name") ||
        uniqueMatchedBy.includes("company_name"))) ||
    (uniqueMatchedBy.includes("product_name") &&
      uniqueMatchedBy.includes("lot_code"))
  ) {
    matchConfidence = "high";
  } else if (score >= 45) {
    matchConfidence = "medium";
  }

  return {
    matchedBy: uniqueMatchedBy,
    matchConfidence,
  };
}
