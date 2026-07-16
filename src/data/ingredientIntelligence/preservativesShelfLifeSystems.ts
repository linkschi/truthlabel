export type PreservativesShelfLifeSystemsItemSeverity = "yellow" | "red";

export type PreservativesShelfLifeSystemsItemScoringImpact =
  | "yellow_preservative"
  | "automatic_red";

export type PreservativesShelfLifeSystemsItemDataStatus =
  | "starter"
  | "verified_core"
  | "needs_region_verification";

export type PreservativesShelfLifeSystemsCategorySeverity = "green" | "yellow" | "red";

export type PreservativesShelfLifeSystemsDisplayMode =
  | "No"
  | "yellow_count_badge"
  | "red_count_badge";

export type PreservativesShelfLifeSystemsItem = {
  id: string;
  mainName: string;
  otherNames: string[];
  chemicalNames?: string[];
  brandNames?: string[];
  eNumbers?: string[];
  insNumbers?: string[];
  abbreviations?: string[];
  labelVariants?: string[];
  spellingVariants?: string[];
  regionalNames?: string[];
  eNumberVariants?: string[];
  severity: PreservativesShelfLifeSystemsItemSeverity;
  reason: string;
  healthConcernType: string;
  warningLabel: string;
  userFacingReason: string;
  matchingNotes: string;
  scoringImpact: PreservativesShelfLifeSystemsItemScoringImpact;
  dataStatus: PreservativesShelfLifeSystemsItemDataStatus;
};

export type PreservativesShelfLifeSystemsAliasCoverage = Partial<Pick<
  PreservativesShelfLifeSystemsItem,
  | "otherNames"
  | "chemicalNames"
  | "brandNames"
  | "eNumbers"
  | "insNumbers"
  | "abbreviations"
  | "labelVariants"
  | "spellingVariants"
  | "regionalNames"
  | "eNumberVariants"
>>;

export type PreservativesShelfLifeSystemsCategoryRule = {
  severity: PreservativesShelfLifeSystemsCategorySeverity;
  display: PreservativesShelfLifeSystemsDisplayMode;
  scoreImpact: number | "automatic_red";
  reason?: string;
  examples?: string[];
};

export const preservativesShelfLifeSystemsDataPack = {
  id: "preservatives_shelf_life_systems",
  categoryName: "Preservatives & Shelf-Life Systems",
  categoryMeaning:
    "This category detects ingredients used to preserve food, prevent mould, slow oxidation, cure meat, protect colour, or extend shelf life. Truthlabel flags these because they show the product is chemically supported for longer storage or stability.",
  dataStatus: "starter_verified_core",
  defaultCategorySeverity: "yellow",

  items: [
    {
      id: "sodium_benzoate",
      mainName: "Sodium Benzoate",
      otherNames: [
        "Sodium benzoate",
        "Benzoate of soda",
        "E211",
        "E-211",
        "INS 211",
      ],
      severity: "yellow",
      reason:
        "Preservative commonly used in acidic foods and drinks to slow microbial growth.",
      healthConcernType: "chemical_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains sodium benzoate, a chemical preservative used to extend shelf life. Truthlabel flags this because the product is chemically preserved rather than relying only on simple fresh ingredients.",
      matchingNotes:
        "Match sodium benzoate, E211, E-211, INS 211, and benzoate of soda.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "potassium_benzoate",
      mainName: "Potassium Benzoate",
      otherNames: ["Potassium benzoate", "E212", "E-212", "INS 212"],
      severity: "yellow",
      reason:
        "Preservative used to protect acidic foods and drinks from spoilage.",
      healthConcernType: "chemical_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains potassium benzoate, a preservative used to extend shelf life. Truthlabel flags this as a shelf-life additive.",
      matchingNotes: "Match potassium benzoate, E212, E-212, and INS 212.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "calcium_benzoate",
      mainName: "Calcium Benzoate",
      otherNames: ["Calcium benzoate", "E213", "E-213", "INS 213"],
      severity: "yellow",
      reason:
        "Benzoate preservative used to slow spoilage in processed foods.",
      healthConcernType: "chemical_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains calcium benzoate, a preservative used to slow spoilage. Truthlabel flags this as a shelf-life additive.",
      matchingNotes: "Match calcium benzoate, E213, E-213, and INS 213.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "benzoic_acid",
      mainName: "Benzoic Acid",
      otherNames: ["Benzoic acid", "E210", "E-210", "INS 210"],
      severity: "yellow",
      reason:
        "Preservative acid used mainly in acidic foods and beverages.",
      healthConcernType: "chemical_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains benzoic acid, a preservative used to control spoilage. Truthlabel flags this as a shelf-life additive.",
      matchingNotes: "Match benzoic acid, E210, E-210, and INS 210.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "potassium_sorbate",
      mainName: "Potassium Sorbate",
      otherNames: ["Potassium sorbate", "E202", "E-202", "INS 202"],
      severity: "yellow",
      reason:
        "Preservative used to slow mould, yeast, and microbial growth.",
      healthConcernType: "mould_yeast_control_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains potassium sorbate, a preservative used to slow mould and yeast growth. Truthlabel flags this because the product is chemically supported for longer shelf life.",
      matchingNotes: "Match potassium sorbate, E202, E-202, and INS 202.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "sodium_sorbate",
      mainName: "Sodium Sorbate",
      otherNames: ["Sodium sorbate", "E201", "E-201", "INS 201"],
      severity: "yellow",
      reason: "Sorbate preservative used to slow microbial spoilage.",
      healthConcernType: "mould_yeast_control_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains sodium sorbate, a preservative used to extend shelf life. Truthlabel flags this as a shelf-life additive.",
      matchingNotes: "Match sodium sorbate, E201, E-201, and INS 201.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "calcium_sorbate",
      mainName: "Calcium Sorbate",
      otherNames: ["Calcium sorbate", "E203", "E-203", "INS 203"],
      severity: "yellow",
      reason: "Sorbate preservative used to slow spoilage.",
      healthConcernType: "mould_yeast_control_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains calcium sorbate, a preservative used to slow spoilage. Truthlabel flags this as a shelf-life additive.",
      matchingNotes: "Match calcium sorbate, E203, E-203, and INS 203.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "sorbic_acid",
      mainName: "Sorbic Acid",
      otherNames: ["Sorbic acid", "E200", "E-200", "INS 200"],
      severity: "yellow",
      reason:
        "Preservative acid used to control mould and yeast growth.",
      healthConcernType: "mould_yeast_control_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains sorbic acid, a preservative used to slow mould and yeast growth. Truthlabel flags this as a shelf-life additive.",
      matchingNotes: "Match sorbic acid, E200, E-200, and INS 200.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "calcium_propionate",
      mainName: "Calcium Propionate",
      otherNames: ["Calcium propionate", "E282", "E-282", "INS 282"],
      severity: "yellow",
      reason:
        "Preservative commonly used in bread and bakery products to slow mould growth.",
      healthConcernType: "bakery_mould_control_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains calcium propionate, a preservative often used to stop bread and baked goods from moulding quickly. Truthlabel flags this as a shelf-life additive.",
      matchingNotes: "Match calcium propionate, E282, E-282, and INS 282.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "sodium_propionate",
      mainName: "Sodium Propionate",
      otherNames: ["Sodium propionate", "E281", "E-281", "INS 281"],
      severity: "yellow",
      reason:
        "Preservative used to slow mould growth, especially in bakery-type products.",
      healthConcernType: "bakery_mould_control_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains sodium propionate, a preservative used to slow mould growth. Truthlabel flags this as a shelf-life additive.",
      matchingNotes: "Match sodium propionate, E281, E-281, and INS 281.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "propionic_acid",
      mainName: "Propionic Acid",
      otherNames: ["Propionic acid", "E280", "E-280", "INS 280"],
      severity: "yellow",
      reason: "Preservative acid used to slow mould growth.",
      healthConcernType: "bakery_mould_control_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains propionic acid, a preservative used to slow mould growth. Truthlabel flags this as a shelf-life additive.",
      matchingNotes: "Match propionic acid, E280, E-280, and INS 280.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "sodium_nitrite",
      mainName: "Sodium Nitrite",
      otherNames: [
        "Sodium nitrite",
        "Nitrite",
        "Curing salt",
        "Cure salt",
        "E250",
        "E-250",
        "INS 250",
      ],
      severity: "yellow",
      reason:
        "Curing preservative used in processed meats to preserve colour, flavour, and control microbial risk. It is a higher-concern preservative because nitrites can be linked to nitrosamine concerns in processed meat contexts.",
      healthConcernType: "processed_meat_curing_preservative",
      warningLabel: "CURING PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains sodium nitrite, a curing preservative commonly used in processed meat. Truthlabel flags this because nitrite curing is a higher-concern shelf-life system, especially in processed meat products.",
      matchingNotes:
        "Match sodium nitrite, nitrite, curing salt, cure salt, E250, E-250, and INS 250.",
      scoringImpact: "yellow_preservative",
      dataStatus: "verified_core",
    },
    {
      id: "potassium_nitrite",
      mainName: "Potassium Nitrite",
      otherNames: ["Potassium nitrite", "E249", "E-249", "INS 249"],
      severity: "yellow",
      reason:
        "Curing preservative used in some meat products. Higher-concern because nitrites are part of processed meat curing systems.",
      healthConcernType: "processed_meat_curing_preservative",
      warningLabel: "CURING PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains potassium nitrite, a curing preservative. Truthlabel flags this because nitrite curing is a higher-concern shelf-life system in processed meat products.",
      matchingNotes: "Match potassium nitrite, E249, E-249, and INS 249.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "sodium_nitrate",
      mainName: "Sodium Nitrate",
      otherNames: ["Sodium nitrate", "Nitrate", "E251", "E-251", "INS 251"],
      severity: "yellow",
      reason:
        "Curing preservative used in some processed meats and preserved foods. It can convert to nitrite under certain conditions.",
      healthConcernType: "processed_meat_curing_preservative",
      warningLabel: "CURING PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains sodium nitrate, a curing preservative. Truthlabel flags this because nitrate/nitrite curing systems are higher-concern preservatives in processed foods.",
      matchingNotes: "Match sodium nitrate, nitrate, E251, E-251, and INS 251.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "potassium_nitrate",
      mainName: "Potassium Nitrate",
      otherNames: [
        "Potassium nitrate",
        "Saltpetre",
        "Saltpeter",
        "E252",
        "E-252",
        "INS 252",
      ],
      severity: "yellow",
      reason:
        "Curing preservative used in processed meat and preserved food systems.",
      healthConcernType: "processed_meat_curing_preservative",
      warningLabel: "CURING PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains potassium nitrate, a curing preservative. Truthlabel flags this because nitrate curing is a higher-concern shelf-life system.",
      matchingNotes:
        "Match potassium nitrate, saltpetre, saltpeter, E252, E-252, and INS 252.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "sulfur_dioxide_sulfites",
      mainName: "Sulfur Dioxide / Sulphites",
      otherNames: [
        "Sulfur dioxide",
        "Sulphur dioxide",
        "Sulfites",
        "Sulphites",
        "Sulphiting agents",
        "Sulfiting agents",
        "E220",
        "E-220",
        "INS 220",
      ],
      severity: "yellow",
      reason:
        "Preservative group that can trigger sensitivity reactions in some people and must be declared on labels at detectable levels in some regions.",
      healthConcernType: "sulfite_sensitivity_or_allergy_risk",
      warningLabel: "SULFITE PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains sulphites/sulfites, preservatives that can trigger reactions in sensitive people. Truthlabel flags this as a shelf-life and sensitivity concern.",
      matchingNotes:
        "Match sulfur dioxide, sulphur dioxide, sulfites, sulphites, sulfiting agents, sulphiting agents, E220, and INS 220. Normalize sulfur/sulphur and sulfite/sulphite.",
      scoringImpact: "yellow_preservative",
      dataStatus: "verified_core",
    },
    {
      id: "sodium_sulfite",
      mainName: "Sodium Sulfite",
      otherNames: ["Sodium sulfite", "Sodium sulphite", "E221", "E-221", "INS 221"],
      severity: "yellow",
      reason:
        "Sulfite preservative used to protect colour and slow spoilage; can be an issue for sulfite-sensitive people.",
      healthConcernType: "sulfite_sensitivity_or_allergy_risk",
      warningLabel: "SULFITE PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains sodium sulfite/sulphite, a preservative that can affect sulfite-sensitive people. Truthlabel flags this as a shelf-life and sensitivity concern.",
      matchingNotes:
        "Match sodium sulfite, sodium sulphite, E221, E-221, and INS 221.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "sodium_bisulfite",
      mainName: "Sodium Bisulfite",
      otherNames: [
        "Sodium bisulfite",
        "Sodium bisulphite",
        "Sodium hydrogen sulfite",
        "Sodium hydrogen sulphite",
        "E222",
        "E-222",
        "INS 222",
      ],
      severity: "yellow",
      reason:
        "Sulfite preservative used to slow spoilage and preserve colour; can be an issue for sulfite-sensitive people.",
      healthConcernType: "sulfite_sensitivity_or_allergy_risk",
      warningLabel: "SULFITE PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains sodium bisulfite/bisulphite, a sulfite preservative. Truthlabel flags this as a shelf-life and sensitivity concern.",
      matchingNotes:
        "Match sodium bisulfite, sodium bisulphite, sodium hydrogen sulfite, sodium hydrogen sulphite, E222, and INS 222.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "sodium_metabisulfite",
      mainName: "Sodium Metabisulfite",
      otherNames: [
        "Sodium metabisulfite",
        "Sodium metabisulphite",
        "E223",
        "E-223",
        "INS 223",
      ],
      severity: "yellow",
      reason:
        "Sulfite preservative used to slow spoilage and preserve colour; can be an issue for sulfite-sensitive people.",
      healthConcernType: "sulfite_sensitivity_or_allergy_risk",
      warningLabel: "SULFITE PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains sodium metabisulfite/metabisulphite, a sulfite preservative. Truthlabel flags this as a shelf-life and sensitivity concern.",
      matchingNotes:
        "Match sodium metabisulfite, sodium metabisulphite, E223, E-223, and INS 223.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "potassium_metabisulfite",
      mainName: "Potassium Metabisulfite",
      otherNames: [
        "Potassium metabisulfite",
        "Potassium metabisulphite",
        "E224",
        "E-224",
        "INS 224",
      ],
      severity: "yellow",
      reason:
        "Sulfite preservative often used in drinks, dried fruit, and preserved foods; can be an issue for sulfite-sensitive people.",
      healthConcernType: "sulfite_sensitivity_or_allergy_risk",
      warningLabel: "SULFITE PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains potassium metabisulfite/metabisulphite, a sulfite preservative. Truthlabel flags this as a shelf-life and sensitivity concern.",
      matchingNotes:
        "Match potassium metabisulfite, potassium metabisulphite, E224, E-224, and INS 224.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "calcium_sulfite",
      mainName: "Calcium Sulfite",
      otherNames: ["Calcium sulfite", "Calcium sulphite", "E226", "E-226", "INS 226"],
      severity: "yellow",
      reason:
        "Sulfite preservative; can be an issue for sulfite-sensitive people.",
      healthConcernType: "sulfite_sensitivity_or_allergy_risk",
      warningLabel: "SULFITE PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains calcium sulfite/sulphite, a sulfite preservative. Truthlabel flags this as a shelf-life and sensitivity concern.",
      matchingNotes:
        "Match calcium sulfite, calcium sulphite, E226, E-226, and INS 226.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "calcium_bisulfite",
      mainName: "Calcium Bisulfite",
      otherNames: [
        "Calcium bisulfite",
        "Calcium bisulphite",
        "Calcium hydrogen sulfite",
        "Calcium hydrogen sulphite",
        "E227",
        "E-227",
        "INS 227",
      ],
      severity: "yellow",
      reason:
        "Sulfite preservative; can be an issue for sulfite-sensitive people.",
      healthConcernType: "sulfite_sensitivity_or_allergy_risk",
      warningLabel: "SULFITE PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains calcium bisulfite/bisulphite, a sulfite preservative. Truthlabel flags this as a shelf-life and sensitivity concern.",
      matchingNotes:
        "Match calcium bisulfite, calcium bisulphite, calcium hydrogen sulfite, calcium hydrogen sulphite, E227, and INS 227.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "potassium_bisulfite",
      mainName: "Potassium Bisulfite",
      otherNames: [
        "Potassium bisulfite",
        "Potassium bisulphite",
        "Potassium hydrogen sulfite",
        "Potassium hydrogen sulphite",
        "E228",
        "E-228",
        "INS 228",
      ],
      severity: "yellow",
      reason:
        "Sulfite preservative; can be an issue for sulfite-sensitive people.",
      healthConcernType: "sulfite_sensitivity_or_allergy_risk",
      warningLabel: "SULFITE PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains potassium bisulfite/bisulphite, a sulfite preservative. Truthlabel flags this as a shelf-life and sensitivity concern.",
      matchingNotes:
        "Match potassium bisulfite, potassium bisulphite, potassium hydrogen sulfite, potassium hydrogen sulphite, E228, and INS 228.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "bha",
      mainName: "BHA",
      otherNames: [
        "BHA",
        "Butylated hydroxyanisole",
        "Butyl hydroxyanisole",
        "E320",
        "E-320",
        "INS 320",
      ],
      severity: "yellow",
      reason:
        "Synthetic antioxidant preservative used to slow fat and oil rancidity. FDA has launched a reassessment of BHA, so Truthlabel treats it as a higher-review preservative.",
      healthConcernType: "synthetic_antioxidant_preservative_under_review",
      warningLabel: "HIGH-REVIEW PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains BHA, a synthetic preservative used to prevent fats and oils from going rancid. Truthlabel flags this as a higher-review preservative because it is under renewed safety review.",
      matchingNotes:
        "Match BHA, butylated hydroxyanisole, butyl hydroxyanisole, E320, and INS 320.",
      scoringImpact: "yellow_preservative",
      dataStatus: "verified_core",
    },
    {
      id: "bht",
      mainName: "BHT",
      otherNames: [
        "BHT",
        "Butylated hydroxytoluene",
        "Butyl hydroxytoluene",
        "E321",
        "E-321",
        "INS 321",
      ],
      severity: "yellow",
      reason:
        "Synthetic antioxidant preservative used to slow rancidity in fats, oils, cereals, snacks, and packaged foods.",
      healthConcernType: "synthetic_antioxidant_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains BHT, a synthetic preservative used to stop fats and oils from going rancid. Truthlabel flags this as a shelf-life additive.",
      matchingNotes:
        "Match BHT, butylated hydroxytoluene, butyl hydroxytoluene, E321, and INS 321.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "tbhq",
      mainName: "TBHQ",
      otherNames: [
        "TBHQ",
        "Tertiary butylhydroquinone",
        "tert-Butylhydroquinone",
        "Tert-butylhydroquinone",
        "E319",
        "E-319",
        "INS 319",
      ],
      severity: "yellow",
      reason:
        "Synthetic antioxidant preservative used to protect fats and oils from rancidity.",
      healthConcernType: "synthetic_antioxidant_preservative",
      warningLabel: "PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains TBHQ, a synthetic preservative used to protect oils and fats from rancidity. Truthlabel flags this as a shelf-life additive.",
      matchingNotes:
        "Match TBHQ, tertiary butylhydroquinone, tert-butylhydroquinone, E319, and INS 319.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "calcium_disodium_edta",
      mainName: "Calcium Disodium EDTA",
      otherNames: [
        "Calcium disodium EDTA",
        "Calcium disodium ethylenediaminetetraacetate",
        "CaNa2EDTA",
        "E385",
        "E-385",
        "INS 385",
      ],
      severity: "yellow",
      reason:
        "Chelating preservative/stabiliser used to protect colour, flavour, and shelf stability by binding metals.",
      healthConcernType: "chelating_shelf_life_stabiliser",
      warningLabel: "SHELF-LIFE STABILISER FOUND",
      userFacingReason:
        "This product contains calcium disodium EDTA, a shelf-life stabiliser used to protect colour, flavour, and stability. Truthlabel flags this as a processed shelf-life additive.",
      matchingNotes:
        "Match calcium disodium EDTA, calcium disodium ethylenediaminetetraacetate, CaNa2EDTA, E385, and INS 385.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "disodium_edta",
      mainName: "Disodium EDTA",
      otherNames: [
        "Disodium EDTA",
        "Disodium ethylenediaminetetraacetate",
        "EDTA",
        "E386",
        "E-386",
        "INS 386",
      ],
      severity: "yellow",
      reason:
        "Chelating stabiliser used to protect shelf stability and prevent quality loss.",
      healthConcernType: "chelating_shelf_life_stabiliser",
      warningLabel: "SHELF-LIFE STABILISER FOUND",
      userFacingReason:
        "This product contains disodium EDTA, a stabiliser used to protect shelf life and quality. Truthlabel flags this as a processed shelf-life additive.",
      matchingNotes:
        "Match disodium EDTA, disodium ethylenediaminetetraacetate, EDTA, E386, and INS 386.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "natamycin",
      mainName: "Natamycin",
      otherNames: ["Natamycin", "Pimaricin", "E235", "E-235", "INS 235"],
      severity: "yellow",
      reason:
        "Antifungal preservative used on some cheese, meat, and food surfaces to control mould and yeast.",
      healthConcernType: "antifungal_preservative",
      warningLabel: "ANTIFUNGAL PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains natamycin, an antifungal preservative used to control mould and yeast. Truthlabel flags this as a shelf-life treatment.",
      matchingNotes: "Match natamycin, pimaricin, E235, and INS 235.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "nisin",
      mainName: "Nisin",
      otherNames: ["Nisin", "E234", "E-234", "INS 234"],
      severity: "yellow",
      reason:
        "Antimicrobial preservative used to control certain bacteria in foods.",
      healthConcernType: "antimicrobial_preservative",
      warningLabel: "ANTIMICROBIAL PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains nisin, an antimicrobial preservative. Truthlabel flags this because the product uses an added preservation system.",
      matchingNotes: "Match nisin, E234, and INS 234.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "lysozyme",
      mainName: "Lysozyme",
      otherNames: [
        "Lysozyme",
        "Egg lysozyme",
        "Lysozyme from egg",
        "E1105",
        "E-1105",
        "INS 1105",
      ],
      severity: "yellow",
      reason:
        "Enzyme used as an antimicrobial preservative in some foods; can also matter for egg-allergy review when sourced from egg.",
      healthConcernType: "antimicrobial_preservative_possible_egg_allergen",
      warningLabel: "ANTIMICROBIAL PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains lysozyme, an antimicrobial preservation ingredient. Truthlabel flags this as a shelf-life system and may also review it for egg allergy if egg-sourced.",
      matchingNotes:
        "Match lysozyme, egg lysozyme, lysozyme from egg, E1105, and INS 1105.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "dimethyl_dicarbonate",
      mainName: "Dimethyl Dicarbonate",
      otherNames: [
        "Dimethyl dicarbonate",
        "DMDC",
        "Velcorin",
        "E242",
        "E-242",
        "INS 242",
      ],
      severity: "yellow",
      reason:
        "Cold sterilising/preservation agent used in some beverages to control microorganisms.",
      healthConcernType: "beverage_preservation_agent",
      warningLabel: "BEVERAGE PRESERVATION AGENT FOUND",
      userFacingReason:
        "This product contains dimethyl dicarbonate/DMDC, a beverage preservation agent used to control microorganisms. Truthlabel flags this as a processing and shelf-life marker.",
      matchingNotes:
        "Match dimethyl dicarbonate, DMDC, Velcorin, E242, and INS 242.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "ethyl_lauroyl_arginate",
      mainName: "Ethyl Lauroyl Arginate",
      otherNames: [
        "Ethyl lauroyl arginate",
        "Ethyl lauroyl arginate HCl",
        "Lauric arginate",
        "LAE",
        "E243",
        "E-243",
        "INS 243",
      ],
      severity: "yellow",
      reason:
        "Antimicrobial preservative used to control bacteria in certain foods.",
      healthConcernType: "antimicrobial_preservative",
      warningLabel: "ANTIMICROBIAL PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains ethyl lauroyl arginate, an antimicrobial preservative. Truthlabel flags this because the product uses an added preservation system.",
      matchingNotes:
        "Match ethyl lauroyl arginate, ethyl lauroyl arginate HCl, lauric arginate, LAE, E243, and INS 243.",
      scoringImpact: "yellow_preservative",
      dataStatus: "starter",
    },
    {
      id: "methylparaben",
      mainName: "Methylparaben",
      otherNames: [
        "Methylparaben",
        "Methyl paraben",
        "Methyl p-hydroxybenzoate",
        "Methyl 4-hydroxybenzoate",
        "E218",
        "E-218",
        "INS 218",
        "Sodium methylparaben",
        "Sodium methyl p-hydroxybenzoate",
        "E219",
        "E-219",
        "INS 219",
      ],
      severity: "yellow",
      reason:
        "Paraben preservative. Truthlabel flags parabens for review because this preservative family has region-specific rules and safety discussion.",
      healthConcernType: "paraben_preservative_review",
      warningLabel: "PARABEN PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains a paraben preservative. Truthlabel flags this because parabens are synthetic preservatives with region-specific safety review history.",
      matchingNotes:
        "Match methylparaben, methyl paraben, methyl p-hydroxybenzoate, E218, sodium methylparaben, and E219.",
      scoringImpact: "yellow_preservative",
      dataStatus: "needs_region_verification",
    },
    {
      id: "ethylparaben",
      mainName: "Ethylparaben",
      otherNames: [
        "Ethylparaben",
        "Ethyl paraben",
        "Ethyl p-hydroxybenzoate",
        "Ethyl 4-hydroxybenzoate",
        "E214",
        "E-214",
        "INS 214",
        "Sodium ethylparaben",
        "Sodium ethyl p-hydroxybenzoate",
        "E215",
        "E-215",
        "INS 215",
      ],
      severity: "yellow",
      reason:
        "Paraben preservative. Truthlabel flags parabens for review because this preservative family has region-specific rules and safety discussion.",
      healthConcernType: "paraben_preservative_review",
      warningLabel: "PARABEN PRESERVATIVE FOUND",
      userFacingReason:
        "This product contains a paraben preservative. Truthlabel flags this because parabens are synthetic preservatives with region-specific safety review history.",
      matchingNotes:
        "Match ethylparaben, ethyl paraben, ethyl p-hydroxybenzoate, E214, sodium ethylparaben, and E215.",
      scoringImpact: "yellow_preservative",
      dataStatus: "needs_region_verification",
    },
    {
      id: "propylparaben",
      mainName: "Propylparaben",
      otherNames: [
        "Propylparaben",
        "Propyl paraben",
        "Propyl p-hydroxybenzoate",
        "Propyl 4-hydroxybenzoate",
        "E216",
        "E-216",
        "INS 216",
        "Sodium propylparaben",
        "Sodium propyl p-hydroxybenzoate",
        "E217",
        "E-217",
        "INS 217",
      ],
      severity: "red",
      reason:
        "Propylparaben is a preservative with region-specific ban/restriction status. The EU withdrew E216 and E217 after EFSA could not recommend an ADI because of reproductive/endocrine-related animal-study concerns.",
      healthConcernType: "endocrine_or_reproductive_concern",
      warningLabel: "BANNED / RESTRICTED PRESERVATIVE",
      userFacingReason:
        "This product contains propylparaben, a preservative banned/restricted in some regions because of reproductive or hormone-related safety concerns. Truthlabel flags this as a serious safety concern.",
      matchingNotes:
        "Match propylparaben, propyl paraben, propyl p-hydroxybenzoate, E216, sodium propylparaben, and E217.",
      scoringImpact: "automatic_red",
      dataStatus: "verified_core",
    },
  ] satisfies PreservativesShelfLifeSystemsItem[],

  aliasCoverage: {
    benzoic_acid: {
      chemicalNames: ["Benzenecarboxylic acid", "Phenylformic acid"],
      labelVariants: [
        "Preservative E210",
        "Acidity regulator E210",
        "Benzoic acid preservative",
      ],
    },
    sodium_benzoate: {
      chemicalNames: [
        "Sodium salt of benzoic acid",
        "Benzoic acid sodium salt",
      ],
      otherNames: ["Benzoate of soda"],
      labelVariants: [
        "Preservative E211",
        "Sodium benzoate preservative",
        "Benzoate preservative",
      ],
    },
    potassium_benzoate: {
      chemicalNames: [
        "Potassium salt of benzoic acid",
        "Benzoic acid potassium salt",
      ],
      labelVariants: [
        "Preservative E212",
        "Potassium benzoate preservative",
        "Benzoate preservative",
      ],
    },
    calcium_benzoate: {
      chemicalNames: [
        "Calcium salt of benzoic acid",
        "Benzoic acid calcium salt",
      ],
      labelVariants: [
        "Preservative E213",
        "Calcium benzoate preservative",
        "Benzoate preservative",
      ],
    },
    sorbic_acid: {
      chemicalNames: ["2,4-hexadienoic acid", "Hexa-2,4-dienoic acid"],
      labelVariants: ["Preservative E200", "Sorbic acid preservative"],
    },
    sodium_sorbate: {
      chemicalNames: [
        "Sodium salt of sorbic acid",
        "Sorbic acid sodium salt",
      ],
      labelVariants: [
        "Preservative E201",
        "Sodium sorbate preservative",
        "Sorbate preservative",
      ],
    },
    potassium_sorbate: {
      chemicalNames: [
        "Potassium salt of sorbic acid",
        "Sorbic acid potassium salt",
      ],
      labelVariants: [
        "Preservative E202",
        "Potassium sorbate preservative",
        "Sorbate preservative",
      ],
    },
    calcium_sorbate: {
      chemicalNames: [
        "Calcium salt of sorbic acid",
        "Sorbic acid calcium salt",
      ],
      labelVariants: [
        "Preservative E203",
        "Calcium sorbate preservative",
        "Sorbate preservative",
      ],
    },
    propionic_acid: {
      chemicalNames: ["Propanoic acid"],
      labelVariants: ["Preservative E280", "Propionic acid preservative"],
    },
    sodium_propionate: {
      chemicalNames: [
        "Sodium propanoate",
        "Sodium salt of propionic acid",
        "Propionic acid sodium salt",
      ],
      labelVariants: [
        "Preservative E281",
        "Sodium propionate preservative",
        "Propionate preservative",
      ],
    },
    calcium_propionate: {
      chemicalNames: [
        "Calcium propanoate",
        "Calcium salt of propionic acid",
        "Propionic acid calcium salt",
      ],
      labelVariants: [
        "Preservative E282",
        "Calcium propionate preservative",
        "Propionate preservative",
        "Bread preservative",
      ],
    },
    sodium_nitrite: {
      otherNames: [
        "Nitrite curing salt",
        "Curing salt",
        "Cure salt",
        "Pink curing salt",
        "Prague powder #1",
        "Prague powder No. 1",
        "Prague powder 1",
        "Cure #1",
        "Cure No. 1",
        "Instacure #1",
        "Insta Cure #1",
      ],
      labelVariants: [
        "Preservative E250",
        "Sodium nitrite curing agent",
        "Nitrite preservative",
      ],
    },
    potassium_nitrite: {
      otherNames: ["Potassium nitrite curing salt", "Nitrite curing agent"],
      labelVariants: [
        "Preservative E249",
        "Potassium nitrite preservative",
        "Nitrite preservative",
      ],
    },
    sodium_nitrate: {
      otherNames: [
        "Chile saltpetre",
        "Chile saltpeter",
        "Nitrate curing salt",
      ],
      labelVariants: [
        "Preservative E251",
        "Sodium nitrate preservative",
        "Nitrate preservative",
      ],
    },
    potassium_nitrate: {
      otherNames: [
        "Saltpetre",
        "Saltpeter",
        "Nitre",
        "Niter",
        "Prague powder #2",
        "Prague powder No. 2",
        "Prague powder 2",
        "Cure #2",
        "Cure No. 2",
        "Instacure #2",
        "Insta Cure #2",
      ],
      labelVariants: [
        "Preservative E252",
        "Potassium nitrate preservative",
        "Nitrate preservative",
      ],
    },
    sulfur_dioxide_sulfites: {
      otherNames: [
        "Sulphur dioxide",
        "Sulfur dioxide",
        "Sulfites",
        "Sulphites",
        "Sulfiting agents",
        "Sulphiting agents",
        "Sulfur dioxide preservative",
        "Sulphur dioxide preservative",
      ],
      abbreviations: ["SO2"],
      labelVariants: [
        "Preservative E220",
        "Contains sulfites",
        "Contains sulphites",
        "Sulfite preservative",
        "Sulphite preservative",
      ],
    },
    sodium_sulfite: {
      spellingVariants: ["Sodium sulfite", "Sodium sulphite"],
      chemicalNames: ["Disodium sulfite", "Disodium sulphite"],
      labelVariants: [
        "Preservative E221",
        "Sodium sulfite preservative",
        "Sodium sulphite preservative",
      ],
    },
    sodium_bisulfite: {
      spellingVariants: [
        "Sodium bisulfite",
        "Sodium bisulphite",
        "Sodium hydrogen sulfite",
        "Sodium hydrogen sulphite",
      ],
      chemicalNames: ["Sodium hydrogen sulfite", "Sodium hydrogen sulphite"],
      labelVariants: [
        "Preservative E222",
        "Sodium bisulfite preservative",
        "Sodium bisulphite preservative",
      ],
    },
    sodium_metabisulfite: {
      spellingVariants: [
        "Sodium metabisulfite",
        "Sodium metabisulphite",
      ],
      abbreviations: ["SMB", "SMS"],
      chemicalNames: [
        "Disodium metabisulfite",
        "Disodium metabisulphite",
        "Sodium pyrosulfite",
        "Sodium pyrosulphite",
      ],
      labelVariants: [
        "Preservative E223",
        "Sodium metabisulfite preservative",
        "Sodium metabisulphite preservative",
      ],
    },
    potassium_metabisulfite: {
      spellingVariants: [
        "Potassium metabisulfite",
        "Potassium metabisulphite",
      ],
      abbreviations: ["KMS"],
      chemicalNames: ["Potassium pyrosulfite", "Potassium pyrosulphite"],
      labelVariants: [
        "Preservative E224",
        "Potassium metabisulfite preservative",
        "Potassium metabisulphite preservative",
      ],
    },
    calcium_sulfite: {
      spellingVariants: ["Calcium sulfite", "Calcium sulphite"],
      labelVariants: [
        "Preservative E226",
        "Calcium sulfite preservative",
        "Calcium sulphite preservative",
      ],
    },
    calcium_bisulfite: {
      spellingVariants: [
        "Calcium bisulfite",
        "Calcium bisulphite",
        "Calcium hydrogen sulfite",
        "Calcium hydrogen sulphite",
      ],
      chemicalNames: ["Calcium hydrogen sulfite", "Calcium hydrogen sulphite"],
      labelVariants: [
        "Preservative E227",
        "Calcium bisulfite preservative",
        "Calcium bisulphite preservative",
      ],
    },
    potassium_bisulfite: {
      spellingVariants: [
        "Potassium bisulfite",
        "Potassium bisulphite",
        "Potassium hydrogen sulfite",
        "Potassium hydrogen sulphite",
      ],
      chemicalNames: [
        "Potassium hydrogen sulfite",
        "Potassium hydrogen sulphite",
      ],
      labelVariants: [
        "Preservative E228",
        "Potassium bisulfite preservative",
        "Potassium bisulphite preservative",
      ],
    },
    bha: {
      chemicalNames: [
        "Butylated hydroxyanisole",
        "Butyl hydroxyanisole",
        "tert-butyl-4-hydroxyanisole",
        "tertiary butylhydroxyanisole",
        "tBHA",
      ],
      labelVariants: [
        "Antioxidant E320",
        "Preservative E320",
        "Synthetic antioxidant BHA",
      ],
    },
    bht: {
      chemicalNames: [
        "Butylated hydroxytoluene",
        "Butyl hydroxytoluene",
        "2,6-di-tert-butyl-4-methylphenol",
        "dibutylhydroxytoluene",
      ],
      labelVariants: [
        "Antioxidant E321",
        "Preservative E321",
        "Synthetic antioxidant BHT",
      ],
    },
    tbhq: {
      chemicalNames: [
        "Tertiary butylhydroquinone",
        "tert-Butylhydroquinone",
        "tertiary-butyl hydroquinone",
        "tert-butyl hydroquinone",
        "2-tert-butylhydroquinone",
      ],
      labelVariants: [
        "Antioxidant E319",
        "Preservative E319",
        "Synthetic antioxidant TBHQ",
      ],
    },
    calcium_disodium_edta: {
      chemicalNames: [
        "Calcium disodium ethylenediaminetetraacetate",
        "Calcium disodium edetate",
        "Edetate calcium disodium",
      ],
      abbreviations: ["CaNa2EDTA"],
      labelVariants: [
        "Preservative E385",
        "Antioxidant synergist E385",
        "Calcium disodium EDTA preservative",
      ],
    },
    disodium_edta: {
      chemicalNames: [
        "Disodium ethylenediaminetetraacetate",
        "Disodium edetate",
        "Edetate disodium",
      ],
      abbreviations: ["EDTA", "Na2EDTA"],
      labelVariants: [
        "Preservative E386",
        "Disodium EDTA preservative",
        "EDTA stabiliser",
        "EDTA stabilizer",
      ],
    },
    natamycin: {
      otherNames: ["Pimaricin"],
      labelVariants: [
        "Preservative E235",
        "Natamycin preservative",
        "Antifungal preservative",
        "Surface preservative natamycin",
      ],
    },
    nisin: {
      otherNames: ["Nisin preparation"],
      labelVariants: [
        "Preservative E234",
        "Nisin preservative",
        "Antimicrobial preservative",
      ],
    },
    lysozyme: {
      otherNames: ["Egg lysozyme", "Lysozyme from egg", "Hen egg lysozyme"],
      abbreviations: ["HEL"],
      labelVariants: [
        "Preservative E1105",
        "Lysozyme preservative",
        "Egg-derived lysozyme",
      ],
    },
    dimethyl_dicarbonate: {
      chemicalNames: ["Dimethyl dicarbonate", "Dimethyl pyrocarbonate"],
      abbreviations: ["DMDC"],
      brandNames: ["Velcorin"],
      labelVariants: [
        "Preservative E242",
        "Beverage preservative DMDC",
        "Cold sterilant DMDC",
      ],
    },
    ethyl_lauroyl_arginate: {
      chemicalNames: [
        "Ethyl lauroyl arginate",
        "Ethyl lauroyl arginate hydrochloride",
        "Ethyl-N-alpha-lauroyl-L-arginate hydrochloride",
      ],
      otherNames: ["Lauric arginate"],
      abbreviations: ["LAE", "LAE HCl"],
      labelVariants: [
        "Preservative E243",
        "Antimicrobial preservative LAE",
        "Ethyl lauroyl arginate HCl",
      ],
    },
    methylparaben: {
      chemicalNames: [
        "Methyl p-hydroxybenzoate",
        "Methyl 4-hydroxybenzoate",
        "Methyl para-hydroxybenzoate",
        "p-hydroxybenzoic acid methyl ester",
      ],
      otherNames: [
        "Methyl paraben",
        "Sodium methylparaben",
        "Sodium methyl p-hydroxybenzoate",
      ],
      eNumberVariants: ["E218", "E-218", "E219", "E-219"],
      labelVariants: ["Paraben preservative", "Methylparaben preservative"],
    },
    ethylparaben: {
      chemicalNames: [
        "Ethyl p-hydroxybenzoate",
        "Ethyl 4-hydroxybenzoate",
        "Ethyl para-hydroxybenzoate",
        "p-hydroxybenzoic acid ethyl ester",
      ],
      otherNames: [
        "Ethyl paraben",
        "Sodium ethylparaben",
        "Sodium ethyl p-hydroxybenzoate",
      ],
      eNumberVariants: ["E214", "E-214", "E215", "E-215"],
      labelVariants: ["Paraben preservative", "Ethylparaben preservative"],
    },
    propylparaben: {
      chemicalNames: [
        "Propyl p-hydroxybenzoate",
        "Propyl 4-hydroxybenzoate",
        "Propyl para-hydroxybenzoate",
        "p-hydroxybenzoic acid propyl ester",
      ],
      otherNames: [
        "Propyl paraben",
        "Sodium propylparaben",
        "Sodium propyl p-hydroxybenzoate",
      ],
      eNumberVariants: ["E216", "E-216", "E217", "E-217"],
      labelVariants: ["Paraben preservative", "Propylparaben preservative"],
    },
  } satisfies Record<string, PreservativesShelfLifeSystemsAliasCoverage>,

  categoryScoringRules: {
    noPreservativesFound: {
      severity: "green",
      display: "No",
      scoreImpact: 0,
    },
    oneToTwoPreservatives: {
      severity: "yellow",
      display: "yellow_count_badge",
      scoreImpact: 6,
    },
    threeOrMorePreservatives: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: 22,
      reason:
        "High preservative load. Product uses multiple shelf-life systems.",
    },
    anyBannedRestrictedPreservative: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: "automatic_red",
      examples: ["propylparaben"],
    },
  } satisfies Record<string, PreservativesShelfLifeSystemsCategoryRule>,

  finalVerdictRules: {
    yellow:
      "This product contains preservatives or shelf-life additives. Truthlabel flags this because the product is chemically supported for longer storage or stability.",
    redFromLoad:
      "This product contains multiple preservative systems. Truthlabel flags this as a high shelf-life additive load.",
    redFromBannedRestricted:
      "This product contains a banned or restricted preservative. Truthlabel flags this as a serious safety concern.",
  },

  matchingNormalizationRules: [
    "lowercase all ingredient text",
    "remove punctuation",
    "normalize sulphite to sulfite",
    "normalize sulphur to sulfur",
    "normalize metabisulphite to metabisulfite",
    "normalize benzoate E-numbers",
    "normalize sorbate E-numbers",
    "normalize propionate E-numbers",
    "normalize nitrate/nitrite E-numbers",
    "normalize E-numbers with and without hyphen",
    "normalize INS numbers only with additive-code context",
    "normalize sulfate/sulphate",
    "normalize flavor/flavour",
    "normalize color/colour",
    "normalize hydrolyzed/hydrolysed",
    "normalize Prague powder #1, Prague powder No. 1, and Prague powder 1",
    "normalize Cure #1 and Cure No. 1",
    "normalize KMS, SMB, and SMS only inside preservative matching context",
    "do not double count the same ingredient if name and E-number both appear",
  ],
} as const;

export type PreservativesShelfLifeSystemsDataPack =
  typeof preservativesShelfLifeSystemsDataPack;
