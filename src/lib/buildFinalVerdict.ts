import type {
  ExposureCheckResult,
  ExposureRiskBand,
} from "@/types/exposure";

export type FinalVerdict = {
  title: ExposureRiskBand;
  text: string;
};

function hasPositiveCount(check?: ExposureCheckResult) {
  if (!check || !check.hasMeaningfulValue) {
    return false;
  }

  if (check.redCount + check.yellowCount > 0) {
    return true;
  }

  if (typeof check.value === "number") {
    return check.value > 0;
  }

  if (typeof check.value !== "string") {
    return false;
  }

  return !["no", "clear", "0", "none", "none found"].includes(
    check.value.trim().toLowerCase(),
  );
}

function getBand(exposureRisk: number): ExposureRiskBand {
  if (exposureRisk <= 24) {
    return "Clean Pass";
  }

  if (exposureRisk <= 49) {
    return "Worth Reviewing";
  }

  if (exposureRisk <= 64) {
    return "High Review";
  }

  if (exposureRisk <= 79) {
    return "Poor";
  }

  return "Strong Warning";
}

export function buildFinalVerdict(
  exposureRisk: number,
  checkResults: ExposureCheckResult[],
): FinalVerdict {
  const band = getBand(exposureRisk);
  const allergyRisk = checkResults.find((check) => check.id === "allergy_risk");
  const construction = checkResults.find(
    (check) => check.id === "artificial_engineered_food_construction",
  );
  const bannedRestricted = checkResults.find(
    (check) => check.id === "banned_restricted_items",
  );
  const redIssueCount = checkResults.filter(
    (check) => check.severity === "red" || check.redCount > 0,
  ).length;

  const introByBand: Record<ExposureRiskBand, string> = {
    "Clean Pass":
      "This product looks lower concern from the available demo label data.",
    "Worth Reviewing":
      "This product is not a clean pass. A few label signals are worth reviewing before regular use.",
    "High Review":
      "This product deserves a closer look. The label shows several review-level concerns instead of a simple ingredient story.",
    Poor:
      "This product is not a clean pass. The scan found heavy processing signals, additive concerns, and ingredient red flags worth questioning before buying or eating.",
    "Strong Warning":
      "This product triggered multiple red flags. The label tells a more serious story than the front packaging suggests.",
  };

  const sentences = [introByBand[band]];

  if (hasPositiveCount(allergyRisk)) {
    sentences.push(
      "Do not consume this product if you are allergic to the flagged ingredient.",
    );
  }

  if (hasPositiveCount(bannedRestricted)) {
    sentences.push(
      "This product contains an ingredient on the banned/restricted watch list.",
    );
  }

  if (construction?.severity === "red") {
    sentences.push(
      "This product contains multiple construction markers and may be built or extended rather than simple whole food.",
    );
  } else if (construction?.severity === "yellow") {
    sentences.push(
      "This product contains artificial or engineered food-construction markers worth questioning.",
    );
  }

  if (redIssueCount >= 2 && band !== "Strong Warning") {
    sentences.push("This product triggered multiple red flags.");
  }

  return {
    title: band,
    text: sentences.join(" "),
  };
}
