import type { ArtificialColourScoreImpact } from "./artificialColoursStarter";

export type ArtificialColourRestrictionStatus =
  | "none"
  | "needs_verification"
  | "revoked"
  | "not_permitted"
  | "under_removal_process";

export type ArtificialColourHealthConcernType =
  | "child_activity_attention_warning"
  | "cancer_linked_regulatory_concern"
  | "synthetic_colour_additive"
  | "regulatory_removal_action"
  | "genotoxicity_concern"
  | "colour_additive";

export type ArtificialColourAlertTone =
  | "informational"
  | "firm_review"
  | "firm_alert";

export type ArtificialColourSeverityOverlayItem = {
  id: string;
  severity: "green" | "yellow" | "red";
  scoreImpact: ArtificialColourScoreImpact;
  restrictionStatus: ArtificialColourRestrictionStatus;
  restrictedRegions: string[];
  restrictionReason: string;
  healthConcernType: ArtificialColourHealthConcernType;
  alertTone: ArtificialColourAlertTone;
  warningLabel: string;
  userFacingReason: string;
};

export const artificialColoursSeverityOverlay: ArtificialColourSeverityOverlayItem[] = [
  {
    id: "tartrazine",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Carries child activity/attention warning requirements in some regions.",
    healthConcernType: "child_activity_attention_warning",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Some regions require warning labels for this colour because of possible effects on activity and attention in children. Truthlabel flags it as an artificial additive. Avoid products with artificial colours where possible.",
  },
  {
    id: "sunset_yellow_fcf",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Carries child activity/attention warning requirements in some regions.",
    healthConcernType: "child_activity_attention_warning",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Some regions require warning labels for this colour because of possible effects on activity and attention in children. Truthlabel flags it as an artificial additive. Avoid products with artificial colours where possible.",
  },
  {
    id: "allura_red_ac",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Carries child activity/attention warning requirements in some regions.",
    healthConcernType: "child_activity_attention_warning",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Some regions require warning labels for this colour because of possible effects on activity and attention in children. Truthlabel flags it as an artificial additive. Avoid products with artificial colours where possible.",
  },
  {
    id: "erythrosine",
    severity: "red",
    scoreImpact: "automatic_red",
    restrictionStatus: "revoked",
    restrictedRegions: ["US"],
    restrictionReason:
      "Cancer-related regulatory concern under the Delaney Clause.",
    healthConcernType: "cancer_linked_regulatory_concern",
    alertTone: "firm_alert",
    warningLabel: "BANNED / RESTRICTED COLOUR",
    userFacingReason:
      "This ingredient was revoked for food use in the United States for cancer-related regulatory concerns. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
  },
  {
    id: "brilliant_blue_fcf",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason: "Synthetic artificial colour additive.",
    healthConcernType: "synthetic_colour_additive",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Truthlabel flags it because it is a synthetic additive used to change the appearance of food. Avoid products with artificial colours where possible.",
  },
  {
    id: "indigotine",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason: "Synthetic artificial colour additive.",
    healthConcernType: "synthetic_colour_additive",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Truthlabel flags it because it is a synthetic additive used to change the appearance of food. Avoid products with artificial colours where possible.",
  },
  {
    id: "fast_green_fcf",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason: "Synthetic artificial colour additive.",
    healthConcernType: "synthetic_colour_additive",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Truthlabel flags it because it is a synthetic additive used to change the appearance of food. Avoid products with artificial colours where possible.",
  },
  {
    id: "amaranth",
    severity: "red",
    scoreImpact: "automatic_red",
    restrictionStatus: "needs_verification",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Region status needs verification before banned/restricted wording is used.",
    healthConcernType: "synthetic_colour_additive",
    alertTone: "firm_alert",
    warningLabel: "BANNED / RESTRICTED COLOUR",
    userFacingReason:
        "This is the same substance as FD&C Red No. 2. Truthlabel treats it as a red artificial-colour concern where a supported market has delisted or prohibited that colour additive.",
  },
  {
    id: "ponceau_4r",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Carries child activity/attention warning requirements in some regions.",
    healthConcernType: "child_activity_attention_warning",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Some regions require warning labels for this colour because of possible effects on activity and attention in children. Truthlabel flags it as an artificial additive. Avoid products with artificial colours where possible.",
  },
  {
    id: "azorubine",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Carries child activity/attention warning requirements in some regions.",
    healthConcernType: "child_activity_attention_warning",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Some regions require warning labels for this colour because of possible effects on activity and attention in children. Truthlabel flags it as an artificial additive. Avoid products with artificial colours where possible.",
  },
  {
    id: "quinoline_yellow",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Carries child activity/attention warning requirements in some regions.",
    healthConcernType: "child_activity_attention_warning",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Some regions require warning labels for this colour because of possible effects on activity and attention in children. Truthlabel flags it as an artificial additive. Avoid products with artificial colours where possible.",
  },
  {
    id: "patent_blue_v",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "needs_verification",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Region status needs verification before banned/restricted wording is used.",
    healthConcernType: "synthetic_colour_additive",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Truthlabel flags it because it is a synthetic additive used to change the appearance of food. Avoid products with artificial colours where possible.",
  },
  {
    id: "green_s",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "needs_verification",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Region status needs verification before banned/restricted wording is used.",
    healthConcernType: "synthetic_colour_additive",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Truthlabel flags it because it is a synthetic additive used to change the appearance of food. Avoid products with artificial colours where possible.",
  },
  {
    id: "brilliant_black_bn",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "needs_verification",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Region status needs verification before banned/restricted wording is used.",
    healthConcernType: "synthetic_colour_additive",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Truthlabel flags it because it is a synthetic additive used to change the appearance of food. Avoid products with artificial colours where possible.",
  },
  {
    id: "brown_ht",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "needs_verification",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Region status needs verification before banned/restricted wording is used.",
    healthConcernType: "synthetic_colour_additive",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Truthlabel flags it because it is a synthetic additive used to change the appearance of food. Avoid products with artificial colours where possible.",
  },
  {
    id: "litholrubine_bk",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "needs_verification",
    restrictedRegions: [],
    restrictionReason:
      "Synthetic artificial colour additive. Region status needs verification before banned/restricted wording is used.",
    healthConcernType: "synthetic_colour_additive",
    alertTone: "firm_review",
    warningLabel: "ARTIFICIAL COLOUR FOUND",
    userFacingReason:
      "This is an artificial colour additive. Truthlabel flags it because it is a synthetic additive used to change the appearance of food. Avoid products with artificial colours where possible.",
  },
  {
    id: "citrus_red_no_2",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "under_removal_process",
    restrictedRegions: ["US"],
    restrictionReason:
      "FDA announced action to remove the color additive regulation allowing this dye.",
    healthConcernType: "regulatory_removal_action",
    alertTone: "firm_review",
    warningLabel: "REGULATORY REMOVAL WATCH",
    userFacingReason:
        "Regulators are taking steps to remove or limit this colour from the food supply. Its current legal status depends on the country and effective date, so Truthlabel flags it for regulatory review.",
  },
  {
    id: "orange_b",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "under_removal_process",
    restrictedRegions: ["US"],
    restrictionReason:
      "FDA announced action to remove the color additive regulation allowing this dye.",
    healthConcernType: "regulatory_removal_action",
    alertTone: "firm_review",
    warningLabel: "REGULATORY REMOVAL WATCH",
    userFacingReason:
        "Regulators are taking steps to remove or limit this colour from the food supply. Its current legal status depends on the country and effective date, so Truthlabel flags it for regulatory review.",
  },
  {
    id: "titanium_dioxide",
    severity: "red",
    scoreImpact: "automatic_red",
    restrictionStatus: "not_permitted",
    restrictedRegions: ["EU"],
    restrictionReason:
      "Regulators could not rule out genotoxicity concerns when used as a food additive.",
    healthConcernType: "genotoxicity_concern",
    alertTone: "firm_alert",
    warningLabel: "BANNED / RESTRICTED COLOUR",
    userFacingReason:
      "This ingredient is banned/restricted in the European Union because regulators could not rule out genotoxicity concerns. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
  },
  {
    id: "caramel_colour",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason: "Colour additive used to darken foods and drinks.",
    healthConcernType: "colour_additive",
    alertTone: "firm_review",
    warningLabel: "COLOUR ADDITIVE FOUND",
    userFacingReason:
      "This is a colour additive used to change the appearance of food or drinks. Truthlabel counts it as a processed/artificial ingredient.",
  },
  {
    id: "caramel_i",
    severity: "green",
    scoreImpact: "informational",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason:
      "Plain caramel colour additive used to darken foods and drinks.",
    healthConcernType: "colour_additive",
    alertTone: "informational",
    warningLabel: "COLOUR ADDITIVE INFORMATION",
    userFacingReason:
        "This caramel colour class is recorded as colour-additive information. Truthlabel does not treat it as a harmful-ingredient warning by presence alone.",
  },
  {
    id: "caramel_ii",
    severity: "green",
    scoreImpact: "informational",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason: "Caramel colour additive used to darken foods and drinks.",
    healthConcernType: "colour_additive",
    alertTone: "informational",
    warningLabel: "COLOUR ADDITIVE INFORMATION",
    userFacingReason:
        "This caramel colour class is recorded as colour-additive information. Truthlabel does not treat it as a harmful-ingredient warning by presence alone.",
  },
  {
    id: "caramel_iii",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason: "Caramel colour additive used to darken foods and drinks.",
    healthConcernType: "colour_additive",
    alertTone: "firm_review",
    warningLabel: "COLOUR ADDITIVE FOUND",
    userFacingReason:
      "This is a colour additive used to change the appearance of food or drinks. Truthlabel counts it as a processed/artificial ingredient.",
  },
  {
    id: "caramel_iv",
    severity: "yellow",
    scoreImpact: "yellow_additive",
    restrictionStatus: "none",
    restrictedRegions: [],
    restrictionReason: "Caramel colour additive used to darken foods and drinks.",
    healthConcernType: "colour_additive",
    alertTone: "firm_review",
    warningLabel: "COLOUR ADDITIVE FOUND",
    userFacingReason:
      "This is a colour additive used to change the appearance of food or drinks. Truthlabel counts it as a processed/artificial ingredient.",
  },
];

export const artificialColoursSeverityOverlayById = Object.fromEntries(
  artificialColoursSeverityOverlay.map((item) => [item.id, item]),
) satisfies Record<string, ArtificialColourSeverityOverlayItem>;
