type ScoreSignals = {
  hasAllergyMatch: boolean;
  hasRegulatoryWarning: boolean;
  hasRedNutrient: boolean;
  hasYellowIngredient: boolean;
  hasYellowNutrient: boolean;
  redFlagCount?: number;
};

export function calculateConcernScore(signals: ScoreSignals) {
  let score = 0;

  if (signals.hasRedNutrient) {
    score += 3;
  }

  if (signals.hasRegulatoryWarning) {
    score += 2;
  }

  if (signals.hasAllergyMatch) {
    score += 1;
  }

  if (signals.hasYellowIngredient) {
    score += 1;
  }

  if (signals.hasYellowNutrient) {
    score += 1;
  }

  if ((signals.redFlagCount ?? 0) >= 3) {
    score = Math.max(score, 8);
  } else if ((signals.redFlagCount ?? 0) >= 2) {
    score = Math.max(score, 7);
  }

  return Math.max(1, Math.min(score, 10));
}

export function getConcernLabel(score: number) {
  if (score >= 9) {
    return "Strong Warning";
  }

  if (score >= 7) {
    return "High Concern";
  }

  if (score >= 4) {
    return "Medium Concern";
  }

  return "Low Concern";
}

export function getConcernDetail(score: number) {
  if (score >= 9) {
    return "Multiple serious warnings were found in the label data.";
  }

  if (score >= 7) {
    return "This product triggered multiple red flags in the current scan.";
  }

  if (score >= 4) {
    return "This product is not a clean pass and has review items worth checking.";
  }

  return "No urgent red flags were found from the available label data.";
}
