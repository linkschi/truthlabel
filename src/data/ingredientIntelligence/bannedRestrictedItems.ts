/**
 * Truthlabel — Banned / Restricted Items Database
 *
 * Scope:
 * Western-market label-relevant banned/restricted ingredients, additives, colours,
 * preservatives, sweeteners, flour agents, illegal dyes, and prohibited food substances.
 *
 * Regions covered where verified:
 * - US
 * - US-California
 * - EU
 * - UK
 * - Canada
 * - Australia/New Zealand where verified
 *
 * Important:
 * This category can overlap with Artificial Colours, Preservatives, Sweeteners,
 * Harmful Additives, Cancer-linked Watch, etc.
 *
 * That overlap is allowed.
 * Category lists should be complete.
 * The scoring engine should prevent unfair duplicate scoring by canonicalIngredientId.
 */

export const bannedRestrictedItems = [
  {
    id: "erythrosine_red_no_3",
    canonicalIngredientId: "erythrosine",
    mainName: "Erythrosine / FD&C Red No. 3",
    otherNames: [
      "Erythrosine",
      "Red No. 3",
      "Red 3",
      "FD&C Red No. 3",
      "FD&C Red 3",
      "Food Red 14",
      "Acid Red 51",
      "CI Food Red 14",
      "C.I. Food Red 14",
      "CI 45430",
      "C.I. 45430",
      "E127",
      "E-127",
      "INS 127"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "authorization_revoked",
        effectiveDate: "2027-01-15 for food",
        reason:
          "FDA revoked authorization under the Delaney Clause after animal cancer findings triggered the legal cancer rule."
      },
      {
        region: "US-California",
        status: "prohibited_from_food_sale",
        effectiveDate: "2027-01-01",
        reason:
          "California AB 418 prohibits foods containing Red Dye 3 from being manufactured, sold, delivered, distributed, or held for sale."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because a major food regulator has revoked/prohibited food use.",
    healthConcernType: "cancer_related_regulatory_concern",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient has been revoked/prohibited for food use in the United States because of cancer-related regulatory concerns. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    codexNotes:
      "Do not claim this definitely causes cancer in humans. Say it triggered a cancer-related regulatory rule and was revoked/prohibited.",
    sourceRefs: ["FDA_RED_3_2025", "CALIFORNIA_AB_418"]
  },

  {
    id: "titanium_dioxide_e171",
    canonicalIngredientId: "titanium_dioxide",
    mainName: "Titanium Dioxide / E171",
    otherNames: [
      "Titanium Dioxide",
      "Titanium dioxide",
      "Titanium oxide",
      "Titanium white",
      "CI Pigment White 6",
      "CI 77891",
      "C.I. 77891",
      "E171",
      "E-171",
      "INS 171",
      "Artificial color",
      "Artificial colour",
      "Colored with titanium dioxide",
      "Coloured with titanium dioxide"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "EU",
        status: "not_permitted_as_food_additive",
        effectiveDate: "2022",
        reason:
          "EFSA concluded that genotoxicity concerns could not be ruled out for titanium dioxide particles used as food additive E171."
      }
    ],
    countryNotes: [
      {
        region: "Australia/New Zealand",
        status: "permitted",
        note:
          "FSANZ says titanium dioxide is permitted in Australia/New Zealand. Do not mark as banned there."
      },
      {
        region: "US",
        status: "permitted_with_conditions",
        note:
          "FDA allows titanium dioxide as a colour additive under specific limits. Do not mark as banned in the US."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because the EU removed it from permitted food additive use after safety review.",
    healthConcernType: "genotoxicity_concern",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is not permitted as a food additive in the European Union because regulators could not rule out genotoxicity concerns. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    codexNotes:
      "Do not say titanium dioxide is banned everywhere. Region wording is required.",
    sourceRefs: ["EFSA_E171_2021", "EU_E171_BAN_2022", "FSANZ_TIO2_REVIEW", "FDA_TIO2_STATUS"]
  },

  {
    id: "brominated_vegetable_oil_bvo",
    canonicalIngredientId: "brominated_vegetable_oil",
    mainName: "Brominated Vegetable Oil",
    otherNames: [
      "Brominated Vegetable Oil",
      "Brominated vegetable oil",
      "BVO",
      "Brominated oil",
      "Brominated soybean oil",
      "Brominated vegetable oil stabilizer"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "food_additive_authorization_revoked",
        effectiveDate: "2024-08-02 effective; compliance after transition",
        reason:
          "FDA revoked the regulation allowing BVO in food after concluding the intended use is no longer considered safe."
      },
      {
        region: "US-California",
        status: "prohibited_from_food_sale",
        effectiveDate: "2027-01-01",
        reason:
          "California AB 418 prohibits foods containing brominated vegetable oil."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because FDA revoked its food-use authorization after safety review.",
    healthConcernType: "regulatory_safety_concern",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient was revoked for food use in the United States after regulatory safety review. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    codexNotes:
      "Commonly found historically in some citrus-flavoured drinks. Match BVO strongly.",
    sourceRefs: ["FDA_BVO_2024", "CALIFORNIA_AB_418"]
  },

  {
    id: "partially_hydrogenated_oils_phos",
    canonicalIngredientId: "partially_hydrogenated_oils",
    mainName: "Partially Hydrogenated Oils",
    otherNames: [
      "Partially hydrogenated oil",
      "Partially hydrogenated oils",
      "PHO",
      "PHOs",
      "Partially hydrogenated vegetable oil",
      "Partially hydrogenated soybean oil",
      "Partially hydrogenated cottonseed oil",
      "Partially hydrogenated palm oil",
      "Partially hydrogenated rapeseed oil",
      "Partially hydrogenated canola oil",
      "Partially hydrogenated corn oil"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "no_longer_GRAS_and_uses_revoked",
        reason:
          "FDA determined partially hydrogenated oils are no longer Generally Recognized as Safe and completed revocation of remaining uses."
      },
      {
        region: "Canada",
        status: "prohibited_in_foods",
        reason:
          "Health Canada banned PHOs in foods because they are the main source of industrially produced trans fats."
      },
      {
        region: "EU",
        status: "restricted_by_industrial_trans_fat_limit",
        reason:
          "EU rules restrict industrial trans fats in food."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because major regulators removed or restricted PHOs due to industrial trans fat risk.",
    healthConcernType: "cardiovascular_health_risk",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is banned/restricted in major regions because it is a major source of industrial trans fats linked to heart-health risk. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    codexNotes:
      "Also count under Hydrogenated / Partially Hydrogenated Oils and Seed Oils / Processed Oils.",
    sourceRefs: ["FDA_PHO_FINAL_DETERMINATION", "FDA_PHO_2023_FINAL_ACTION", "HEALTH_CANADA_PHO_BAN"]
  },

  {
    id: "potassium_bromate",
    canonicalIngredientId: "potassium_bromate",
    mainName: "Potassium Bromate",
    otherNames: [
      "Potassium Bromate",
      "Potassium bromate",
      "Bromated flour",
      "Bromate",
      "Potassium salt of bromic acid",
      "Bromic acid potassium salt"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "UK",
        status: "prohibited_as_flour_improver",
        reason:
          "UK regulations prohibit potassium bromate as a flour improver."
      },
      {
        region: "Canada",
        status: "not_permitted_as_food_additive",
        reason:
          "Potassium bromate was delisted and is no longer permitted as a food additive in foods offered for sale in Canada."
      },
      {
        region: "US-California",
        status: "prohibited_from_food_sale",
        effectiveDate: "2027-01-01",
        reason:
          "California AB 418 prohibits foods containing potassium bromate."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because several regulators prohibit or do not permit it as a food additive/flour improver.",
    healthConcernType: "cancer_related_safety_concern",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is banned/restricted in some regions because of cancer-related safety concerns around its use as a flour improver. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    codexNotes:
      "Do not claim banned in all Western countries unless region-specific verification is added.",
    sourceRefs: ["UK_POTASSIUM_BROMATE_PROHIBITION", "CANADA_POTASSIUM_BROMATE_DELISTED", "CALIFORNIA_AB_418"]
  },

  {
    id: "azodicarbonamide",
    canonicalIngredientId: "azodicarbonamide",
    mainName: "Azodicarbonamide",
    otherNames: [
      "Azodicarbonamide",
      "ADA",
      "ADCA",
      "Azobisformamide",
      "Azodicarboxamide",
      "E927",
      "E-927",
      "INS 927"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "EU",
        status: "illegal_as_dough_improver",
        reason:
          "EFSA notes that use of azodicarbonamide as a dough improver is illegal in the EU."
      }
    ],
    countryNotes: [
      {
        region: "US",
        status: "approved_with_limits",
        note:
          "FDA says ADA is approved for use as a whitening agent in cereal flour and dough conditioner in bread baking. Do not mark as banned in the US."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is illegal/not permitted as a dough improver in the EU.",
    healthConcernType: "regulatory_safety_concern",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is illegal/not permitted as a dough improver in the European Union. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    codexNotes:
      "Also count under Flour Treatment Agents and Ultra-Processed Indicators.",
    sourceRefs: ["EFSA_AZODICARBONAMIDE_SEM", "FDA_ADA_FAQ"]
  },

  {
    id: "propylparaben_e216_e217",
    canonicalIngredientId: "propylparaben",
    mainName: "Propylparaben",
    otherNames: [
      "Propylparaben",
      "Propyl paraben",
      "Propyl p-hydroxybenzoate",
      "Propyl 4-hydroxybenzoate",
      "Propyl para-hydroxybenzoate",
      "E216",
      "E-216",
      "INS 216",
      "Sodium propylparaben",
      "Sodium propyl p-hydroxybenzoate",
      "Sodium propyl para-hydroxybenzoate",
      "E217",
      "E-217",
      "INS 217"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "EU",
        status: "withdrawn_not_permitted_as_food_additive",
        reason:
          "EU withdrew E216 and E217 after EFSA could not recommend an ADI because of effects on sex hormones and male reproductive organs in juvenile rats."
      },
      {
        region: "US-California",
        status: "prohibited_from_food_sale",
        effectiveDate: "2027-01-01",
        reason:
          "California AB 418 prohibits foods containing propylparaben."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because the EU withdrew it from permitted food additive use and California prohibits it from 2027.",
    healthConcernType: "endocrine_or_reproductive_concern",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is banned/restricted in some regions because of reproductive or hormone-related safety concerns. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    codexNotes:
      "Also count under Preservatives and Additives & Preservatives.",
    sourceRefs: ["EU_PROPYLPARABEN_WITHDRAWAL", "CALIFORNIA_AB_418"]
  },

  {
    id: "cyclamates_e952",
    canonicalIngredientId: "cyclamates",
    mainName: "Cyclamates",
    otherNames: [
      "Cyclamate",
      "Cyclamates",
      "Cyclamic acid",
      "Sodium cyclamate",
      "Calcium cyclamate",
      "Sodium cyclohexylsulfamate",
      "Calcium cyclohexylsulfamate",
      "E952",
      "E-952",
      "INS 952"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_direct_addition_to_human_food",
        reason:
          "Listed under US substances prohibited from direct addition or use as human food."
      },
      {
        region: "Canada",
        status: "not_permitted_in_foods",
        reason:
          "Canada permits cyclamate sweeteners only as non-food products under specific conditions; they are not permitted to be used in foods."
      }
    ],
    countryNotes: [
      {
        region: "Australia/New Zealand",
        status: "permitted",
        note:
          "FSANZ lists cyclamates as approved intense sweeteners. Do not mark as banned in AU/NZ."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is prohibited/not permitted for food use in some major regions.",
    healthConcernType: "not_permitted_for_food_use_in_some_regions",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This sweetener is banned/restricted for food use in some regions. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    codexNotes:
      "Do not mark as banned in every country. Region-specific display is required.",
    sourceRefs: ["FDA_21_CFR_189", "CANADA_CYCLAMATE_RULES", "FSANZ_CYCLAMATE_PERMISSION"]
  },

  {
    id: "safrole",
    canonicalIngredientId: "safrole",
    mainName: "Safrole",
    otherNames: [
      "Safrole",
      "Sassafras oil constituent",
      "4-Allyl-1,2-methylenedioxybenzene",
      "1,3-Benzodioxole, 5-(2-propenyl)-",
      "5-(2-propenyl)-1,3-benzodioxole"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_human_food",
        reason:
          "FDA lists safrole among substances prohibited from use in human food."
      },
      {
        region: "Canada",
        status: "adulterating_substance_in_all_foods",
        reason:
          "Health Canada lists safrole as an adulterating substance in all foods."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is prohibited/adulterating in food rules.",
    healthConcernType: "prohibited_food_substance",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is prohibited/restricted for use in food in some regions. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    codexNotes:
      "Also count under Flavourings and Cancer-linked Watch if that category exists.",
    sourceRefs: ["FDA_21_CFR_189", "HEALTH_CANADA_ADULTERATING_SUBSTANCES"]
  },

  {
    id: "coumarin_added_tonka",
    canonicalIngredientId: "coumarin_added",
    mainName: "Added Coumarin / Tonka Bean Extract",
    otherNames: [
      "Coumarin",
      "Added coumarin",
      "Tonka bean",
      "Tonka bean extract",
      "Tonka extract",
      "1,2-benzopyrone",
      "Benzopyrone"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_added_food_substance",
        reason:
          "FDA rules treat food containing added coumarin or coumarin from tonka beans/tonka extract as adulterated."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items when coumarin is added directly or comes from tonka bean/tonka extract.",
    healthConcernType: "prohibited_flavouring",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is prohibited as an added food substance in the United States when added as coumarin or tonka bean extract. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    codexNotes:
      "Do not flag natural trace coumarin in cinnamon from normal ingredient labels as the same thing unless rules are created for natural occurrence.",
    sourceRefs: ["FDA_21_CFR_189"]
  },

  {
    id: "calamus_sweet_flag",
    canonicalIngredientId: "calamus",
    mainName: "Calamus / Sweet Flag",
    otherNames: [
      "Calamus",
      "Sweet flag",
      "Calamus root",
      "Acorus calamus",
      "Sweet cane",
      "Sweet cinnamon",
      "Sweetroot",
      "Myrtle flag",
      "Flagroot",
      "Sweet grass",
      "Calamus oil",
      "Calamus extract"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_human_food",
        reason:
          "FDA lists calamus and its derivatives among substances prohibited from use in human food."
      },
      {
        region: "Canada",
        status: "adulterating_substance_in_all_foods",
        reason:
          "Health Canada lists oil, extract, or root of calamus from Acorus calamus L. as an adulterating substance in all foods."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because calamus and its derivatives are prohibited/restricted in official food rules.",
    healthConcernType: "prohibited_food_substance",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is prohibited/restricted for food use in some regions. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_21_CFR_189", "HEALTH_CANADA_ADULTERATING_SUBSTANCES"]
  },

  {
    id: "cinnamyl_anthranilate",
    canonicalIngredientId: "cinnamyl_anthranilate",
    mainName: "Cinnamyl Anthranilate",
    otherNames: [
      "Cinnamyl anthranilate",
      "Cinnamyl 2-aminobenzoate",
      "Cinnamyl o-aminobenzoate"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_direct_addition_to_human_food",
        reason:
          "FDA lists cinnamyl anthranilate among substances prohibited from direct addition or use as human food."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is on the US prohibited food substances list.",
    healthConcernType: "prohibited_food_substance",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is prohibited from direct addition to human food in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_21_CFR_189"]
  },

  {
    id: "cobaltous_salts",
    canonicalIngredientId: "cobaltous_salts",
    mainName: "Cobaltous Salts",
    otherNames: [
      "Cobaltous salts",
      "Cobalt salts",
      "Cobalt chloride",
      "Cobalt sulfate",
      "Cobalt sulphate",
      "Cobaltous chloride",
      "Cobaltous sulfate",
      "Cobaltous sulphate"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_direct_addition_to_human_food",
        reason:
          "FDA lists cobaltous salts and derivatives among substances prohibited from direct addition or use as human food."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because cobaltous salts are on the US prohibited food substances list.",
    healthConcernType: "prohibited_food_substance",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is prohibited from direct addition to human food in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_21_CFR_189"]
  },

  {
    id: "diethylpyrocarbonate_depc",
    canonicalIngredientId: "diethylpyrocarbonate",
    mainName: "Diethylpyrocarbonate",
    otherNames: [
      "Diethylpyrocarbonate",
      "DEPC",
      "Diethyl pyrocarbonate",
      "Pyrocarbonic acid diethyl ester"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_direct_addition_to_human_food",
        reason:
          "FDA lists diethylpyrocarbonate among substances prohibited from direct addition or use as human food."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is on the US prohibited food substances list.",
    healthConcernType: "prohibited_food_substance",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is prohibited from direct addition to human food in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_21_CFR_189"]
  },

  {
    id: "dulcin",
    canonicalIngredientId: "dulcin",
    mainName: "Dulcin",
    otherNames: [
      "Dulcin",
      "Sucrol",
      "Valzin",
      "4-ethoxyphenylurea",
      "p-ethoxyphenylurea"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_direct_addition_to_human_food",
        reason:
          "FDA lists dulcin among substances prohibited from direct addition or use as human food."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is on the US prohibited food substances list.",
    healthConcernType: "prohibited_sweetener",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This sweetener is prohibited from direct addition to human food in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_21_CFR_189"]
  },

  {
    id: "monochloroacetic_acid",
    canonicalIngredientId: "monochloroacetic_acid",
    mainName: "Monochloroacetic Acid",
    otherNames: [
      "Monochloroacetic acid",
      "Chloroacetic acid",
      "MCA",
      "Monochloroethanoic acid"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_direct_addition_to_human_food",
        reason:
          "FDA lists monochloroacetic acid among substances prohibited from direct addition or use as human food."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is on the US prohibited food substances list.",
    healthConcernType: "prohibited_food_substance",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is prohibited from direct addition to human food in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_21_CFR_189"]
  },

  {
    id: "nordihydroguaiaretic_acid_ndga",
    canonicalIngredientId: "ndga",
    mainName: "Nordihydroguaiaretic Acid",
    otherNames: [
      "Nordihydroguaiaretic acid",
      "NDGA",
      "Nordihydroguaiacetic acid"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_direct_addition_to_human_food",
        reason:
          "FDA lists nordihydroguaiaretic acid among substances prohibited from direct addition or use as human food."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is on the US prohibited food substances list.",
    healthConcernType: "prohibited_antioxidant_or_food_substance",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is prohibited from direct addition to human food in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_21_CFR_189"]
  },

  {
    id: "p_4000",
    canonicalIngredientId: "p_4000",
    mainName: "P-4000",
    otherNames: [
      "P-4000",
      "P 4000",
      "P4000",
      "5-nitro-2-propoxyaniline"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_direct_addition_to_human_food",
        reason:
          "FDA lists P-4000 among substances prohibited from direct addition or use as human food."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is on the US prohibited food substances list.",
    healthConcernType: "prohibited_sweetener_or_food_substance",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is prohibited from direct addition to human food in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_21_CFR_189"]
  },

  {
    id: "thiourea",
    canonicalIngredientId: "thiourea",
    mainName: "Thiourea",
    otherNames: [
      "Thiourea",
      "Thiocarbonyl diamide",
      "Sulfourea",
      "Sulphourea"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_direct_addition_to_human_food",
        reason:
          "FDA lists thiourea among substances prohibited from direct addition or use as human food."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is on the US prohibited food substances list.",
    healthConcernType: "prohibited_food_substance",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is prohibited from direct addition to human food in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_21_CFR_189"]
  },

  {
    id: "chlorofluorocarbon_propellants",
    canonicalIngredientId: "chlorofluorocarbon_propellants",
    mainName: "Chlorofluorocarbon Propellants",
    otherNames: [
      "Chlorofluorocarbon propellants",
      "CFC propellants",
      "CFCs",
      "Fluorocarbon propellants"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "prohibited_from_human_food_use",
        reason:
          "FDA lists chlorofluorocarbon propellants among substances prohibited from use in human food."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is listed in US prohibited food substance rules.",
    healthConcernType: "prohibited_food_substance",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This propellant is prohibited from use in human food in the United States. Truthlabel flags this as a serious safety concern.",
    sourceRefs: ["FDA_21_CFR_189"]
  },

  {
    id: "sudan_dyes",
    canonicalIngredientId: "sudan_dyes",
    mainName: "Sudan Dyes",
    otherNames: [
      "Sudan I",
      "Sudan II",
      "Sudan III",
      "Sudan IV",
      "Sudan Red",
      "Sudan Red I",
      "Sudan Red II",
      "Sudan Red III",
      "Sudan Red IV",
      "Scarlet Red",
      "Solvent Yellow 14",
      "Solvent Orange 7",
      "Solvent Red 23",
      "Solvent Red 24"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "illegal_for_food_use",
        reason:
          "FDA describes Sudan dyes as red industrial dyes that can cause cancer and are illegal to use in food."
      },
      {
        region: "EU",
        status: "prohibited_in_food",
        reason:
          "EU official-control documents treat confirmed Sudan dye findings in food as non-compliance because their use in food is prohibited."
      },
      {
        region: "UK",
        status: "illegal_food_dye",
        reason:
          "UK food alerts describe Sudan IV as an illegal dye with potential genotoxic and carcinogenic concern."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because Sudan dyes are industrial dyes, not food colours.",
    healthConcernType: "illegal_dye_cancer_or_genotoxicity_concern",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "ILLEGAL / RESTRICTED COLOUR",
    userFacingReason:
      "This is an industrial dye that is illegal/not permitted for food use in major regions. Truthlabel flags this as a serious safety concern. Avoid this product where possible.",
    codexNotes:
      "Usually appears through adulteration/fraud, not honest labels. Still match label text and recall data.",
    sourceRefs: ["FDA_FOOD_FRAUD_SUDAN_DYES", "EU_SUDAN_DYES_CONTROL", "UK_FSA_SUDAN_IV_ALERT"]
  },

  {
    id: "rhodamine_b",
    canonicalIngredientId: "rhodamine_b",
    mainName: "Rhodamine B",
    otherNames: [
      "Rhodamine B",
      "Basic Violet 10",
      "CI Basic Violet 10",
      "C.I. Basic Violet 10",
      "CI 45170",
      "C.I. 45170"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "UK",
        status: "illegal_food_dye",
        reason:
          "UK food alerts describe Rhodamine B as an illegal dye that may pose a health risk."
      },
      {
        region: "EU",
        status: "not_permitted_for_food_use",
        reason:
          "Rhodamine B is treated as an unauthorised/illegal dye in food-control contexts."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is an illegal/non-food dye.",
    healthConcernType: "illegal_dye_health_risk",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "ILLEGAL / RESTRICTED COLOUR",
    userFacingReason:
      "This is an illegal/non-food dye that may pose a health risk. Truthlabel flags this as a serious safety concern. Avoid this product where possible.",
    codexNotes:
      "Usually detected through recalls or lab testing rather than normal ingredient labels.",
    sourceRefs: ["UK_FSA_ILLEGAL_DYES"]
  },

  {
    id: "fdc_red_no_2_amaranth_us_delisted",
    canonicalIngredientId: "amaranth",
    mainName: "FD&C Red No. 2 / Amaranth",
    otherNames: [
      "FD&C Red No. 2",
      "FD&C Red 2",
      "Red No. 2",
      "Red 2",
      "Amaranth",
      "E123",
      "E-123",
      "INS 123",
      "CI 16185",
      "C.I. 16185"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "delisted_color_additive",
        reason:
          "FDA colour-additive database lists FD&C Red No. 2 as delisted; delisted colour additives are not permitted for use."
      }
    ],
    countryNotes: [
      {
        region: "EU",
        status: "check_current_permission_before_claiming_ban",
        note:
          "Do not automatically call E123 banned in the EU without checking current additive permissions."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is a delisted US colour additive.",
    healthConcernType: "delisted_colour_additive",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "DELISTED / RESTRICTED COLOUR",
    userFacingReason:
      "This colour additive is delisted/not permitted for use in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_COLOR_ADDITIVE_STATUS"]
  },

  {
    id: "fdc_red_no_1_us_delisted",
    canonicalIngredientId: "fdc_red_no_1",
    mainName: "FD&C Red No. 1",
    otherNames: [
      "FD&C Red No. 1",
      "FD&C Red 1",
      "Red No. 1",
      "Red 1",
      "Food Red No. 1"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "delisted_color_additive",
        reason:
          "FDA food-substance records list FD&C Red No. 1 as delisted."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is a delisted US colour additive.",
    healthConcernType: "delisted_colour_additive",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "DELISTED / RESTRICTED COLOUR",
    userFacingReason:
      "This colour additive is delisted/not permitted for use in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_EAFUS_DELISTED_COLORS"]
  },

  {
    id: "fdc_green_no_1_us_delisted",
    canonicalIngredientId: "fdc_green_no_1",
    mainName: "FD&C Green No. 1",
    otherNames: [
      "FD&C Green No. 1",
      "FD&C Green 1",
      "Green No. 1",
      "Green 1",
      "Food Green No. 1"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "delisted_color_additive",
        reason:
          "FDA food-substance records list FD&C Green No. 1 as delisted."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is a delisted US colour additive.",
    healthConcernType: "delisted_colour_additive",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "DELISTED / RESTRICTED COLOUR",
    userFacingReason:
      "This colour additive is delisted/not permitted for use in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_EAFUS_DELISTED_COLORS"]
  },

  {
    id: "fdc_green_no_2_us_delisted",
    canonicalIngredientId: "fdc_green_no_2",
    mainName: "FD&C Green No. 2",
    otherNames: [
      "FD&C Green No. 2",
      "FD&C Green 2",
      "Green No. 2",
      "Green 2",
      "Food Green No. 2"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "delisted_color_additive",
        reason:
          "FDA food-substance records list FD&C Green No. 2 as delisted."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is a delisted US colour additive.",
    healthConcernType: "delisted_colour_additive",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "DELISTED / RESTRICTED COLOUR",
    userFacingReason:
      "This colour additive is delisted/not permitted for use in the United States. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["FDA_EAFUS_DELISTED_COLORS"]
  },

  {
    id: "orange_b_restricted_removal_watch",
    canonicalIngredientId: "orange_b",
    mainName: "Orange B",
    otherNames: [
      "Orange B",
      "FD&C Orange B"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "restricted_and_proposed_for_revocation",
        reason:
          "FDA says Orange B is only approved for hot dog and sausage casings and has proposed revoking the authorization because use appears abandoned."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is narrowly restricted and under FDA revocation action.",
    healthConcernType: "restricted_colour_additive_under_revocation_action",
    severity: "yellow",
    scoreImpact: "yellow_review",
    warningLabel: "RESTRICTED COLOUR ADDITIVE",
    userFacingReason:
        "This colour additive is narrowly restricted and under regulatory removal action in the United States. Truthlabel flags this as a regulatory review item until a completed prohibition is verified.",
    codexNotes:
      "Do not say fully banned yet unless the final rule has been issued. Use restricted/removal-watch wording.",
    sourceRefs: ["FDA_COLOR_QA", "FDA_ORANGE_B_PROPOSED_REVOCATION"]
  },

  {
    id: "citrus_red_no_2_restricted_removal_watch",
    canonicalIngredientId: "citrus_red_no_2",
    mainName: "Citrus Red No. 2",
    otherNames: [
      "Citrus Red No. 2",
      "Citrus Red 2",
      "Citrus Red #2",
      "Solvent Red 80",
      "CI 12156",
      "C.I. 12156"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "US",
        status: "restricted_and_under_removal_action",
        reason:
          "FDA says Citrus Red No. 2 is only approved to colour orange peels and FDA is taking action to remove the regulation."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it is narrowly restricted and under FDA removal action.",
    healthConcernType: "restricted_colour_additive_under_removal_action",
    severity: "yellow",
    scoreImpact: "yellow_review",
    warningLabel: "RESTRICTED COLOUR ADDITIVE",
    userFacingReason:
        "This colour additive is narrowly restricted and under regulatory removal action in the United States. Truthlabel flags this as a regulatory review item until a completed prohibition is verified.",
    codexNotes:
      "Do not say fully banned yet unless final revocation is confirmed. Use restricted/removal-watch wording.",
    sourceRefs: ["FDA_COLOR_QA", "FDA_SYNTHETIC_DYES_PHASEOUT"]
  },

  {
    id: "oil_of_micranthum",
    canonicalIngredientId: "oil_of_micranthum",
    mainName: "Oil of Micranthum",
    otherNames: [
      "Oil of micranthum",
      "Cinnamomum micranthum oil",
      "Oil from Cinnamomum micranthum"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "Canada",
        status: "adulterating_substance_in_all_foods",
        reason:
          "Health Canada lists oil of micranthum from Cinnamomum micranthum Hayata as an adulterating substance in all foods."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it appears on Canada's adulterating-substances list.",
    healthConcernType: "adulterating_substance",
    severity: "red",
    scoreImpact: "automatic_red",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
      "This ingredient is listed as an adulterating substance in foods in Canada. Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible.",
    sourceRefs: ["HEALTH_CANADA_ADULTERATING_SUBSTANCES"]
  },

  {
    id: "petrolatum_food_canada",
    canonicalIngredientId: "petrolatum",
    mainName: "Petrolatum",
    otherNames: [
      "Petrolatum",
      "Petroleum jelly",
      "Soft paraffin"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "Canada",
        status: "adulterating_substance_in_all_foods",
        reason:
          "Health Canada lists petrolatum as an adulterating substance in all foods."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because it appears on Canada's adulterating-substances list.",
    healthConcernType: "adulterating_substance",
    severity: "yellow",
    scoreImpact: "yellow_review",
    warningLabel: "BANNED / RESTRICTED INGREDIENT",
    userFacingReason:
        "This substance has regulatory review relevance for food use in some regions. Truthlabel flags it for careful regional verification rather than treating it as universally banned.",
    sourceRefs: ["HEALTH_CANADA_ADULTERATING_SUBSTANCES"]
  },

  {
    id: "paraffin_wax_canada_restricted",
    canonicalIngredientId: "paraffin_wax",
    mainName: "Paraffin Wax",
    otherNames: [
      "Paraffin wax",
      "Paraffin",
      "Petroleum wax"
    ],
    countriesRestrictedOrBannedIn: [
      {
        region: "Canada",
        status: "adulterating_substance_with_exception",
        reason:
          "Health Canada lists paraffin wax as adulterating in all foods except chewing gum with a paraffin wax base."
      }
    ],
    categoryMeaning:
      "This item belongs in Banned / Restricted Items because Canada treats it as adulterating in foods except a specific chewing gum exception.",
    healthConcernType: "adulterating_substance_with_exception",
    severity: "yellow",
    scoreImpact: "yellow_review",
    warningLabel: "RESTRICTED INGREDIENT",
    userFacingReason:
        "This substance has regulatory review relevance and exceptions in some food contexts. Truthlabel flags it for regional and product-context review rather than treating it as an automatic red item.",
    codexNotes:
      "Requires product-context logic. Do not flag chewing gum with paraffin wax base the same way without checking the exception.",
    sourceRefs: ["HEALTH_CANADA_ADULTERATING_SUBSTANCES"]
  }
];

/**
 * Matching rules for Codex:
 *
 * 1. Match against:
 * - mainName
 * - otherNames
 * - E-numbers
 * - INS numbers
 * - colour index names
 * - spelling variants
 *
 * 2. Normalize before matching:
 * - lowercase
 * - remove punctuation
 * - normalize "colour" and "color"
 * - normalize "sulphate" and "sulfate"
 * - normalize "sulphite" and "sulfite"
 * - normalize "FD & C", "FD&C", "FDC"
 * - remove brackets before matching
 *
 * 3. Do not double count the same ingredient:
 * Example:
 * "Erythrosine (E127)" = one match, not two.
 *
 * 4. Category overlap is allowed:
 * Red No. 3 can appear in:
 * - Artificial Colours
 * - Banned / Restricted Items
 * - Cancer-linked Watch
 * - Harmful Additives
 *
 * 5. Category counts may count it in every relevant category.
 * Overall score should avoid unfair duplicate scoring by canonicalIngredientId.
 *
 * 6. Any item in bannedRestrictedItems:
 * - category severity = red
 * - scoreImpact = automatic_red
 * - Final Verdict must mention it
 * - Quick Overview must show Banned / Restricted Items 🔴
 *
 * 7. Region wording is mandatory:
 * Do not say "banned in your country" unless user region is verified.
 * Say "banned/restricted in [region]" instead.
 *
 * 8. Do not say:
 * - "definitely causes cancer"
 * - "poison"
 * - "deadly"
 * unless an official source uses that exact claim.
 *
 * Use direct but accurate wording:
 * "Truthlabel flags this as a serious safety concern. Avoid this ingredient where possible."
 */