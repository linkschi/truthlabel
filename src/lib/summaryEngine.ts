export type OverallSummaryContent = {
  title: string;
  intro: string;
  reasons: string[];
  recommendation: string;
};

type SummaryInput = {
  label: string;
  reasons: string[];
  hasAllergyMatch: boolean;
};

export function buildOverallSummary({
  label,
  reasons,
  hasAllergyMatch,
}: SummaryInput): OverallSummaryContent {
  if (hasAllergyMatch) {
    return {
      title: "Strong Warning",
      intro: "This product contains an ingredient that matches your saved allergy.",
      reasons,
      recommendation:
        "Do not consume it if you are allergic to the flagged ingredient.",
    };
  }

  if (label === "High Concern" || label === "Strong Warning") {
    return {
      title: "High Concern",
      intro: "This product triggered multiple red flags.",
      reasons,
      recommendation:
        "The front packaging may look simple, but the label tells a different story. Review the highlighted items before buying or eating.",
    };
  }

  if (label === "Medium Concern") {
    return {
      title: "Worth Reviewing",
      intro: "This product is not a clean pass.",
      reasons,
      recommendation: "It has a few things worth questioning before regular use.",
    };
  }

  return {
    title: "Low Concern",
    intro: "No major red flags were found from the available label data.",
    reasons,
    recommendation:
      "This product appears low concern for most users, but always check the physical label if you have allergies or specific dietary needs.",
  };
}
