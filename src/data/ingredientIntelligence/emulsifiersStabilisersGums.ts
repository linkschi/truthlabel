export const emulsifiersStabilisersGumsDataPack = {
  id: "emulsifiers_stabilisers_thickeners_gums",
  categoryName: "Emulsifiers / Stabilisers / Thickeners / Gums",
  categoryMeaning:
    "This category detects ingredients used to hold food together, thicken texture, stop separation, bind water, create creaminess, stabilise mixtures, or rebuild food texture. InsideIt flags these because they show the product's texture is being engineered or chemically supported.",
  dataStatus: "starter_needs_expansion",
  defaultCategorySeverity: "yellow",

  items: [
    {
      id: "lecithins",
      mainName: "Lecithins",
      otherNames: [
        "Lecithin",
        "Lecithins",
        "Soy lecithin",
        "Soya lecithin",
        "Sunflower lecithin",
        "Rapeseed lecithin",
        "Canola lecithin",
        "Egg lecithin",
        "Hydrolyzed lecithin",
        "Hydrolysed lecithin"
      ],
      chemicalNames: [
        "Phosphatidylcholine",
        "Phospholipids",
        "Phosphatides"
      ],
      brandNames: [],
      eNumbers: ["E322", "E-322"],
      insNumbers: ["322", "INS 322"],
      abbreviations: [],
      labelVariants: [
        "Emulsifier E322",
        "Emulsifier: lecithin",
        "Emulsifier: soy lecithin",
        "Emulsifier: sunflower lecithin"
      ],
      spellingVariants: ["Soya lecithin", "Soy lecithin"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Emulsifier used to stop ingredients from separating and improve texture.",
      healthConcernType: "emulsifier_texture_stabiliser",
      warningLabel: "EMULSIFIER FOUND",
      userFacingReason:
        "This product contains lecithin, an emulsifier used to hold ingredients together and improve texture. InsideIt flags this because the product's texture is being supported by an added emulsifier.",
      matchingNotes:
        "Match lecithin, soy lecithin, soya lecithin, sunflower lecithin, E322, and INS 322. Do not double count if both name and E-number appear.",
      scoringImpact: "yellow_emulsifier",
      dataStatus: "starter"
    },

    {
      id: "mono_and_diglycerides",
      mainName: "Mono- and Diglycerides",
      otherNames: [
        "Mono- and diglycerides",
        "Mono and diglycerides",
        "Monoglycerides",
        "Diglycerides",
        "Mono-diglycerides",
        "Mono diglycerides",
        "Glycerol monostearate",
        "Glyceryl monostearate",
        "Distilled monoglycerides",
        "Distilled mono- and diglycerides"
      ],
      chemicalNames: [
        "Monoacylglycerols",
        "Diacylglycerols",
        "Glycerol esters of fatty acids"
      ],
      brandNames: [],
      eNumbers: ["E471", "E-471"],
      insNumbers: ["471", "INS 471"],
      abbreviations: ["GMS"],
      labelVariants: [
        "Emulsifier E471",
        "Emulsifier: mono- and diglycerides",
        "Emulsifier: monoglycerides",
        "Emulsifier: glycerol monostearate"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Common emulsifier used in baked goods, ice cream, spreads, sauces, and processed foods to improve texture and stop separation.",
      healthConcernType: "emulsifier_texture_stabiliser",
      warningLabel: "EMULSIFIER FOUND",
      userFacingReason:
        "This product contains mono- and diglycerides, emulsifiers used to build texture and stop separation. InsideIt flags this as a processed texture-support ingredient.",
      matchingNotes:
        "Match mono- and diglycerides, monoglycerides, diglycerides, glycerol monostearate, glyceryl monostearate, E471, and INS 471.",
      scoringImpact: "yellow_emulsifier",
      dataStatus: "starter"
    },

    {
      id: "datem",
      mainName: "DATEM",
      otherNames: [
        "DATEM",
        "Diacetyl tartaric acid esters of mono- and diglycerides",
        "Diacetyl tartaric acid esters of mono and diglycerides",
        "Diacetyl tartaric esters of mono- and diglycerides"
      ],
      chemicalNames: [
        "Diacetyl tartaric acid esters of mono- and diglycerides of fatty acids"
      ],
      brandNames: [],
      eNumbers: ["E472e", "E-472e"],
      insNumbers: ["472e", "INS 472e"],
      abbreviations: ["DATEM"],
      labelVariants: [
        "Emulsifier E472e",
        "Emulsifier: DATEM",
        "Dough conditioner DATEM"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Dough emulsifier used to strengthen bread structure and improve processed bakery texture.",
      healthConcernType: "bakery_emulsifier_dough_conditioner",
      warningLabel: "DOUGH EMULSIFIER FOUND",
      userFacingReason:
        "This product contains DATEM, a dough emulsifier used to strengthen and engineer bread texture. InsideIt flags this as a processed bakery texture additive.",
      matchingNotes:
        "Match DATEM, diacetyl tartaric acid esters of mono- and diglycerides, E472e, and INS 472e.",
      scoringImpact: "yellow_emulsifier",
      dataStatus: "starter"
    },

    {
      id: "e472_emulsifier_esters",
      mainName: "E472 Emulsifier Esters",
      otherNames: [
        "Acetic acid esters of mono- and diglycerides",
        "Lactic acid esters of mono- and diglycerides",
        "Citric acid esters of mono- and diglycerides",
        "Tartaric acid esters of mono- and diglycerides",
        "Mixed acetic and tartaric acid esters of mono- and diglycerides",
        "Mono- and diacetyl tartaric acid esters of mono- and diglycerides"
      ],
      chemicalNames: [
        "Esters of mono- and diglycerides of fatty acids",
        "Acetic acid esters of mono- and diglycerides of fatty acids",
        "Lactic acid esters of mono- and diglycerides of fatty acids",
        "Citric acid esters of mono- and diglycerides of fatty acids",
        "Tartaric acid esters of mono- and diglycerides of fatty acids"
      ],
      brandNames: [],
      eNumbers: [
        "E472a",
        "E-472a",
        "E472b",
        "E-472b",
        "E472c",
        "E-472c",
        "E472d",
        "E-472d",
        "E472f",
        "E-472f"
      ],
      insNumbers: [
        "472a",
        "INS 472a",
        "472b",
        "INS 472b",
        "472c",
        "INS 472c",
        "472d",
        "INS 472d",
        "472f",
        "INS 472f"
      ],
      abbreviations: ["ACETEM", "LACTEM", "CITREM", "MATEM"],
      labelVariants: [
        "Emulsifier E472a",
        "Emulsifier E472b",
        "Emulsifier E472c",
        "Emulsifier E472d",
        "Emulsifier E472f",
        "Emulsifier: esters of mono- and diglycerides"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Emulsifier family used to engineer texture, dough structure, fat dispersion, and shelf stability.",
      healthConcernType: "emulsifier_texture_stabiliser",
      warningLabel: "EMULSIFIER FOUND",
      userFacingReason:
        "This product contains E472 emulsifier esters, used to engineer texture and stability in processed foods. InsideIt flags this as a texture-support additive.",
      matchingNotes:
        "Match E472a, E472b, E472c, E472d, E472f, ACETEM, LACTEM, CITREM, MATEM, and named mono/diglyceride esters.",
      scoringImpact: "yellow_emulsifier",
      dataStatus: "starter"
    },

    {
      id: "polysorbates",
      mainName: "Polysorbates",
      otherNames: [
        "Polysorbate",
        "Polysorbate 20",
        "Polysorbate 40",
        "Polysorbate 60",
        "Polysorbate 65",
        "Polysorbate 80",
        "Tween 20",
        "Tween 40",
        "Tween 60",
        "Tween 65",
        "Tween 80"
      ],
      chemicalNames: [
        "Polyoxyethylene sorbitan monolaurate",
        "Polyoxyethylene sorbitan monopalmitate",
        "Polyoxyethylene sorbitan monostearate",
        "Polyoxyethylene sorbitan tristearate",
        "Polyoxyethylene sorbitan monooleate"
      ],
      brandNames: ["Tween"],
      eNumbers: [
        "E432",
        "E-432",
        "E434",
        "E-434",
        "E435",
        "E-435",
        "E436",
        "E-436",
        "E433",
        "E-433"
      ],
      insNumbers: [
        "432",
        "INS 432",
        "434",
        "INS 434",
        "435",
        "INS 435",
        "436",
        "INS 436",
        "433",
        "INS 433"
      ],
      abbreviations: [],
      labelVariants: [
        "Emulsifier E432",
        "Emulsifier E433",
        "Emulsifier E434",
        "Emulsifier E435",
        "Emulsifier E436",
        "Emulsifier: polysorbate 80",
        "Emulsifier: polysorbate 60"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Synthetic emulsifier family used to keep oil and water mixed and stabilise processed foods.",
      healthConcernType: "synthetic_emulsifier",
      warningLabel: "EMULSIFIER FOUND",
      userFacingReason:
        "This product contains polysorbates, synthetic emulsifiers used to keep mixtures stable. InsideIt flags this because the product's texture and stability are being chemically supported.",
      matchingNotes:
        "Match polysorbate 20/40/60/65/80, Tween names, E432, E433, E434, E435, E436, and INS variants.",
      scoringImpact: "yellow_emulsifier",
      dataStatus: "starter"
    },

    {
      id: "sorbitan_esters",
      mainName: "Sorbitan Esters",
      otherNames: [
        "Sorbitan monostearate",
        "Sorbitan tristearate",
        "Sorbitan monolaurate",
        "Sorbitan monooleate",
        "Sorbitan monopalmitate",
        "Span 20",
        "Span 40",
        "Span 60",
        "Span 65",
        "Span 80"
      ],
      chemicalNames: [
        "Sorbitan fatty acid esters",
        "Sorbitan esters of fatty acids"
      ],
      brandNames: ["Span"],
      eNumbers: [
        "E491",
        "E-491",
        "E492",
        "E-492",
        "E493",
        "E-493",
        "E494",
        "E-494",
        "E495",
        "E-495"
      ],
      insNumbers: [
        "491",
        "INS 491",
        "492",
        "INS 492",
        "493",
        "INS 493",
        "494",
        "INS 494",
        "495",
        "INS 495"
      ],
      abbreviations: [],
      labelVariants: [
        "Emulsifier E491",
        "Emulsifier E492",
        "Emulsifier E493",
        "Emulsifier E494",
        "Emulsifier E495",
        "Emulsifier: sorbitan monostearate"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Emulsifier family used to stabilise fats, oils, creams, toppings, bakery products, and processed foods.",
      healthConcernType: "emulsifier_texture_stabiliser",
      warningLabel: "EMULSIFIER FOUND",
      userFacingReason:
        "This product contains sorbitan esters, emulsifiers used to stabilise texture and prevent separation. InsideIt flags this as a processed texture-support ingredient.",
      matchingNotes:
        "Match sorbitan monostearate, tristearate, monolaurate, monooleate, monopalmitate, Span names, and E491-E495.",
      scoringImpact: "yellow_emulsifier",
      dataStatus: "starter"
    },

    {
      id: "pgpr",
      mainName: "PGPR",
      otherNames: [
        "PGPR",
        "Polyglycerol polyricinoleate",
        "Polyglycerol polyricinoleic acid",
        "Polyglycerol esters of polycondensed fatty acids of castor oil"
      ],
      chemicalNames: ["Polyglycerol polyricinoleate"],
      brandNames: [],
      eNumbers: ["E476", "E-476"],
      insNumbers: ["476", "INS 476"],
      abbreviations: ["PGPR"],
      labelVariants: [
        "Emulsifier E476",
        "Emulsifier: PGPR",
        "Emulsifier: polyglycerol polyricinoleate"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Emulsifier often used in chocolate and coatings to improve flow and reduce viscosity.",
      healthConcernType: "emulsifier_viscosity_modifier",
      warningLabel: "EMULSIFIER FOUND",
      userFacingReason:
        "This product contains PGPR, an emulsifier used to control texture and flow, especially in chocolate-style products. InsideIt flags this as a processed texture additive.",
      matchingNotes:
        "Match PGPR, polyglycerol polyricinoleate, E476, and INS 476.",
      scoringImpact: "yellow_emulsifier",
      dataStatus: "starter"
    },

    {
      id: "ssl_csl_lactylates",
      mainName: "Stearoyl Lactylates",
      otherNames: [
        "Sodium stearoyl lactylate",
        "Calcium stearoyl lactylate",
        "Stearoyl lactylates",
        "Sodium stearoyl-2-lactylate",
        "Calcium stearoyl-2-lactylate"
      ],
      chemicalNames: [
        "Sodium stearoyl lactylate",
        "Calcium stearoyl lactylate"
      ],
      brandNames: [],
      eNumbers: ["E481", "E-481", "E482", "E-482"],
      insNumbers: ["481", "INS 481", "482", "INS 482"],
      abbreviations: ["SSL", "CSL"],
      labelVariants: [
        "Emulsifier E481",
        "Emulsifier E482",
        "Dough conditioner SSL",
        "Emulsifier: sodium stearoyl lactylate",
        "Emulsifier: calcium stearoyl lactylate"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Emulsifier and dough conditioner used to improve bread softness, volume, and processed texture.",
      healthConcernType: "bakery_emulsifier_dough_conditioner",
      warningLabel: "DOUGH EMULSIFIER FOUND",
      userFacingReason:
        "This product contains stearoyl lactylates, emulsifiers used to engineer softness, volume, and texture in processed foods. InsideIt flags this as a texture-support additive.",
      matchingNotes:
        "Match sodium stearoyl lactylate, calcium stearoyl lactylate, SSL, CSL, E481, E482, and INS variants.",
      scoringImpact: "yellow_emulsifier",
      dataStatus: "starter"
    },

    {
      id: "sucrose_esters_sucroglycerides",
      mainName: "Sucrose Esters / Sucroglycerides",
      otherNames: [
        "Sucrose esters of fatty acids",
        "Sucrose esters",
        "Sucroglycerides",
        "Sugar esters",
        "Sucrose fatty acid esters"
      ],
      chemicalNames: [
        "Sucrose esters of fatty acids",
        "Sucrose glycerides"
      ],
      brandNames: [],
      eNumbers: ["E473", "E-473", "E474", "E-474"],
      insNumbers: ["473", "INS 473", "474", "INS 474"],
      abbreviations: [],
      labelVariants: [
        "Emulsifier E473",
        "Emulsifier E474",
        "Emulsifier: sucrose esters",
        "Emulsifier: sucroglycerides"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Emulsifiers used to build smooth texture, stability, and fat dispersion.",
      healthConcernType: "emulsifier_texture_stabiliser",
      warningLabel: "EMULSIFIER FOUND",
      userFacingReason:
        "This product contains sucrose esters or sucroglycerides, emulsifiers used to build texture and stability. InsideIt flags this as a processed texture-support ingredient.",
      matchingNotes:
        "Match sucrose esters, sucrose esters of fatty acids, sucroglycerides, E473, E474, and INS variants.",
      scoringImpact: "yellow_emulsifier",
      dataStatus: "starter"
    },

    {
      id: "polyglycerol_esters",
      mainName: "Polyglycerol Esters",
      otherNames: [
        "Polyglycerol esters of fatty acids",
        "Polyglycerol esters",
        "Polyglycerol fatty acid esters"
      ],
      chemicalNames: ["Polyglycerol esters of fatty acids"],
      brandNames: [],
      eNumbers: ["E475", "E-475"],
      insNumbers: ["475", "INS 475"],
      abbreviations: [],
      labelVariants: [
        "Emulsifier E475",
        "Emulsifier: polyglycerol esters"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Emulsifier used to support texture, stability, and fat dispersion in processed foods.",
      healthConcernType: "emulsifier_texture_stabiliser",
      warningLabel: "EMULSIFIER FOUND",
      userFacingReason:
        "This product contains polyglycerol esters, emulsifiers used to support texture and stability. InsideIt flags this as a processed texture additive.",
      matchingNotes:
        "Match polyglycerol esters of fatty acids, polyglycerol esters, E475, and INS 475.",
      scoringImpact: "yellow_emulsifier",
      dataStatus: "starter"
    },

    {
      id: "propylene_glycol_esters",
      mainName: "Propylene Glycol Esters",
      otherNames: [
        "Propylene glycol esters of fatty acids",
        "Propylene glycol esters",
        "Propylene glycol monoesters",
        "Propylene glycol monostearate"
      ],
      chemicalNames: ["Propylene glycol esters of fatty acids"],
      brandNames: [],
      eNumbers: ["E477", "E-477"],
      insNumbers: ["477", "INS 477"],
      abbreviations: ["PGMS"],
      labelVariants: [
        "Emulsifier E477",
        "Emulsifier: propylene glycol esters"
      ],
      spellingVariants: [],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Emulsifier used to support texture and stability in processed foods.",
      healthConcernType: "emulsifier_texture_stabiliser",
      warningLabel: "EMULSIFIER FOUND",
      userFacingReason:
        "This product contains propylene glycol esters, emulsifiers used to support texture and stability. InsideIt flags this as a processed texture additive.",
      matchingNotes:
        "Match propylene glycol esters of fatty acids, propylene glycol monostearate, PGMS, E477, and INS 477.",
      scoringImpact: "yellow_emulsifier",
      dataStatus: "starter"
    },

    {
      id: "carrageenan",
      mainName: "Carrageenan",
      otherNames: [
        "Carrageenan",
        "Carrageen",
        "Irish moss extract",
        "Kappa carrageenan",
        "Iota carrageenan",
        "Lambda carrageenan"
      ],
      chemicalNames: ["Sulfated polysaccharides from red seaweed"],
      brandNames: [],
      eNumbers: ["E407", "E-407"],
      insNumbers: ["407", "INS 407"],
      abbreviations: [],
      labelVariants: [
        "Thickener E407",
        "Stabiliser E407",
        "Stabilizer E407",
        "Gelling agent E407"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Thickener and stabiliser used to create creamy texture, gel structure, and prevent separation.",
      healthConcernType: "thickener_gelling_stabiliser",
      warningLabel: "THICKENER / STABILISER FOUND",
      userFacingReason:
        "This product contains carrageenan, a thickener and stabiliser used to build texture and prevent separation. InsideIt flags this as a texture-engineering additive.",
      matchingNotes:
        "Match carrageenan, carrageen, Irish moss extract, E407, and INS 407.",
      scoringImpact: "yellow_thickener_stabiliser",
      dataStatus: "starter"
    },

    {
      id: "processed_eucheuma_seaweed",
      mainName: "Processed Eucheuma Seaweed",
      otherNames: [
        "Processed eucheuma seaweed",
        "PES",
        "Semi-refined carrageenan",
        "Processed seaweed"
      ],
      chemicalNames: ["Semi-refined carrageenan"],
      brandNames: [],
      eNumbers: ["E407a", "E-407a"],
      insNumbers: ["407a", "INS 407a"],
      abbreviations: ["PES"],
      labelVariants: [
        "Thickener E407a",
        "Stabiliser E407a",
        "Stabilizer E407a",
        "Gelling agent E407a"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Carrageenan-like seaweed ingredient used to thicken, gel, and stabilise food texture.",
      healthConcernType: "thickener_gelling_stabiliser",
      warningLabel: "THICKENER / STABILISER FOUND",
      userFacingReason:
        "This product contains processed eucheuma seaweed, a thickener and stabiliser used to build food texture. InsideIt flags this as a texture-engineering additive.",
      matchingNotes:
        "Match processed eucheuma seaweed, semi-refined carrageenan, PES, E407a, and INS 407a.",
      scoringImpact: "yellow_thickener_stabiliser",
      dataStatus: "starter"
    },

    {
      id: "xanthan_gum",
      mainName: "Xanthan Gum",
      otherNames: [
        "Xanthan gum",
        "Xanthan",
        "Corn sugar gum"
      ],
      chemicalNames: ["Xanthan polysaccharide"],
      brandNames: [],
      eNumbers: ["E415", "E-415"],
      insNumbers: ["415", "INS 415"],
      abbreviations: [],
      labelVariants: [
        "Thickener E415",
        "Stabiliser E415",
        "Stabilizer E415",
        "Gum E415"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gum thickener used to thicken sauces, drinks, dressings, gluten-free foods, and processed textures.",
      healthConcernType: "gum_thickener_stabiliser",
      warningLabel: "GUM / THICKENER FOUND",
      userFacingReason:
        "This product contains xanthan gum, a thickener used to build and stabilise texture. InsideIt flags this as a texture-engineering additive.",
      matchingNotes:
        "Match xanthan gum, xanthan, E415, and INS 415.",
      scoringImpact: "yellow_gum_thickener",
      dataStatus: "starter"
    },

    {
      id: "guar_gum",
      mainName: "Guar Gum",
      otherNames: [
        "Guar gum",
        "Guaran",
        "Guar flour"
      ],
      chemicalNames: ["Guar galactomannan"],
      brandNames: [],
      eNumbers: ["E412", "E-412"],
      insNumbers: ["412", "INS 412"],
      abbreviations: [],
      labelVariants: [
        "Thickener E412",
        "Stabiliser E412",
        "Stabilizer E412",
        "Gum E412"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gum thickener used to thicken, stabilise, and improve texture.",
      healthConcernType: "gum_thickener_stabiliser",
      warningLabel: "GUM / THICKENER FOUND",
      userFacingReason:
        "This product contains guar gum, a thickener used to build and stabilise texture. InsideIt flags this as a texture-engineering additive.",
      matchingNotes:
        "Match guar gum, guaran, guar flour, E412, and INS 412.",
      scoringImpact: "yellow_gum_thickener",
      dataStatus: "starter"
    },

    {
      id: "locust_bean_gum",
      mainName: "Locust Bean Gum",
      otherNames: [
        "Locust bean gum",
        "Carob bean gum",
        "Carob gum",
        "LBG"
      ],
      chemicalNames: ["Carob galactomannan"],
      brandNames: [],
      eNumbers: ["E410", "E-410"],
      insNumbers: ["410", "INS 410"],
      abbreviations: ["LBG"],
      labelVariants: [
        "Thickener E410",
        "Stabiliser E410",
        "Stabilizer E410",
        "Gum E410"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gum thickener used to stabilise texture, especially in dairy, desserts, sauces, and processed foods.",
      healthConcernType: "gum_thickener_stabiliser",
      warningLabel: "GUM / THICKENER FOUND",
      userFacingReason:
        "This product contains locust bean gum, a thickener used to stabilise texture. InsideIt flags this as a texture-engineering additive.",
      matchingNotes:
        "Match locust bean gum, carob bean gum, carob gum, LBG, E410, and INS 410.",
      scoringImpact: "yellow_gum_thickener",
      dataStatus: "starter"
    },

    {
      id: "gellan_gum",
      mainName: "Gellan Gum",
      otherNames: [
        "Gellan gum",
        "High acyl gellan gum",
        "Low acyl gellan gum"
      ],
      chemicalNames: ["Gellan polysaccharide"],
      brandNames: [],
      eNumbers: ["E418", "E-418"],
      insNumbers: ["418", "INS 418"],
      abbreviations: [],
      labelVariants: [
        "Thickener E418",
        "Stabiliser E418",
        "Stabilizer E418",
        "Gelling agent E418",
        "Gum E418"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gelling and stabilising gum used to suspend ingredients and build texture.",
      healthConcernType: "gum_gelling_stabiliser",
      warningLabel: "GUM / STABILISER FOUND",
      userFacingReason:
        "This product contains gellan gum, a stabiliser used to suspend ingredients and build texture. InsideIt flags this as a texture-engineering additive.",
      matchingNotes:
        "Match gellan gum, high acyl gellan gum, low acyl gellan gum, E418, and INS 418.",
      scoringImpact: "yellow_gum_thickener",
      dataStatus: "starter"
    },

    {
      id: "tara_gum",
      mainName: "Tara Gum",
      otherNames: [
        "Tara gum",
        "Peruvian carob gum"
      ],
      chemicalNames: ["Tara galactomannan"],
      brandNames: [],
      eNumbers: ["E417", "E-417"],
      insNumbers: ["417", "INS 417"],
      abbreviations: [],
      labelVariants: [
        "Thickener E417",
        "Stabiliser E417",
        "Stabilizer E417",
        "Gum E417"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gum thickener used to stabilise and build processed texture.",
      healthConcernType: "gum_thickener_stabiliser",
      warningLabel: "GUM / THICKENER FOUND",
      userFacingReason:
        "This product contains tara gum, a thickener used to build and stabilise food texture. InsideIt flags this as a texture-engineering additive.",
      matchingNotes:
        "Match tara gum, Peruvian carob gum, E417, and INS 417.",
      scoringImpact: "yellow_gum_thickener",
      dataStatus: "starter"
    },

    {
      id: "acacia_gum_arabic_gum",
      mainName: "Acacia Gum / Gum Arabic",
      otherNames: [
        "Acacia gum",
        "Gum arabic",
        "Arabic gum",
        "Acacia fibre",
        "Acacia fiber"
      ],
      chemicalNames: ["Acacia senegal gum", "Acacia seyal gum"],
      brandNames: [],
      eNumbers: ["E414", "E-414"],
      insNumbers: ["414", "INS 414"],
      abbreviations: [],
      labelVariants: [
        "Stabiliser E414",
        "Stabilizer E414",
        "Emulsifier E414",
        "Gum E414",
        "Thickener E414"
      ],
      spellingVariants: ["Fibre", "Fiber", "Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gum used as a stabiliser, emulsifier, thickener, and fibre/bulking ingredient.",
      healthConcernType: "gum_emulsifier_stabiliser",
      warningLabel: "GUM / STABILISER FOUND",
      userFacingReason:
        "This product contains acacia gum/gum arabic, used to stabilise texture and support processed food structure. InsideIt flags this as a texture-support additive.",
      matchingNotes:
        "Match acacia gum, gum arabic, arabic gum, acacia fibre/fiber, E414, and INS 414.",
      scoringImpact: "yellow_gum_thickener",
      dataStatus: "starter"
    },

    {
      id: "tragacanth_gum",
      mainName: "Tragacanth Gum",
      otherNames: [
        "Tragacanth",
        "Tragacanth gum",
        "Gum tragacanth"
      ],
      chemicalNames: ["Astragalus gum"],
      brandNames: [],
      eNumbers: ["E413", "E-413"],
      insNumbers: ["413", "INS 413"],
      abbreviations: [],
      labelVariants: [
        "Thickener E413",
        "Stabiliser E413",
        "Stabilizer E413",
        "Gum E413"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gum thickener and stabiliser used to support texture.",
      healthConcernType: "gum_thickener_stabiliser",
      warningLabel: "GUM / THICKENER FOUND",
      userFacingReason:
        "This product contains tragacanth gum, a thickener and stabiliser. InsideIt flags this as a texture-engineering additive.",
      matchingNotes:
        "Match tragacanth, tragacanth gum, gum tragacanth, E413, and INS 413.",
      scoringImpact: "yellow_gum_thickener",
      dataStatus: "starter"
    },

    {
      id: "karaya_gum",
      mainName: "Karaya Gum",
      otherNames: [
        "Karaya gum",
        "Gum karaya",
        "Sterculia gum"
      ],
      chemicalNames: ["Sterculia urens gum"],
      brandNames: [],
      eNumbers: ["E416", "E-416"],
      insNumbers: ["416", "INS 416"],
      abbreviations: [],
      labelVariants: [
        "Thickener E416",
        "Stabiliser E416",
        "Stabilizer E416",
        "Gum E416"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gum thickener and stabiliser used to support processed texture.",
      healthConcernType: "gum_thickener_stabiliser",
      warningLabel: "GUM / THICKENER FOUND",
      userFacingReason:
        "This product contains karaya gum, a thickener and stabiliser. InsideIt flags this as a texture-engineering additive.",
      matchingNotes:
        "Match karaya gum, gum karaya, sterculia gum, E416, and INS 416.",
      scoringImpact: "yellow_gum_thickener",
      dataStatus: "starter"
    },

    {
      id: "konjac_gum_glucomannan",
      mainName: "Konjac Gum / Glucomannan",
      otherNames: [
        "Konjac gum",
        "Konjac",
        "Konjac flour",
        "Konjac glucomannan",
        "Glucomannan",
        "Konnyaku"
      ],
      chemicalNames: ["Konjac glucomannan"],
      brandNames: [],
      eNumbers: ["E425", "E-425"],
      insNumbers: ["425", "INS 425"],
      abbreviations: ["KGM"],
      labelVariants: [
        "Thickener E425",
        "Stabiliser E425",
        "Stabilizer E425",
        "Gelling agent E425",
        "Gum E425"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: ["Konnyaku"],
      severity: "yellow",
      reason:
        "Thickener and gelling ingredient used to build texture and structure.",
      healthConcernType: "gum_thickener_gelling_agent",
      warningLabel: "GUM / THICKENER FOUND",
      userFacingReason:
        "This product contains konjac gum/glucomannan, a thickener used to build texture and gel structure. InsideIt flags this as a texture-engineering additive.",
      matchingNotes:
        "Match konjac gum, konjac flour, glucomannan, konjac glucomannan, konnyaku, E425, and INS 425.",
      scoringImpact: "yellow_gum_thickener",
      dataStatus: "starter"
    },

    {
      id: "pectins",
      mainName: "Pectins",
      otherNames: [
        "Pectin",
        "Pectins",
        "Amidated pectin",
        "Low methoxyl pectin",
        "High methoxyl pectin",
        "Fruit pectin",
        "Apple pectin",
        "Citrus pectin"
      ],
      chemicalNames: ["Pectic polysaccharides", "Amidated pectin"],
      brandNames: [],
      eNumbers: ["E440", "E-440", "E440i", "E-440i", "E440ii", "E-440ii"],
      insNumbers: ["440", "INS 440", "440i", "INS 440i", "440ii", "INS 440ii"],
      abbreviations: [],
      labelVariants: [
        "Gelling agent E440",
        "Stabiliser E440",
        "Stabilizer E440",
        "Thickener E440"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gelling and thickening ingredient used to build texture in jams, desserts, drinks, and processed foods.",
      healthConcernType: "gelling_thickener_stabiliser",
      warningLabel: "GELLING / THICKENING AGENT FOUND",
      userFacingReason:
        "This product contains pectin, a gelling or thickening ingredient used to build texture. InsideIt flags this as a texture-support additive.",
      matchingNotes:
        "Match pectin, pectins, amidated pectin, fruit pectin, apple pectin, citrus pectin, E440, E440i, E440ii, and INS variants.",
      scoringImpact: "yellow_thickener_stabiliser",
      dataStatus: "starter"
    },

    {
      id: "agar",
      mainName: "Agar",
      otherNames: [
        "Agar",
        "Agar-agar",
        "Agar agar",
        "Japanese isinglass"
      ],
      chemicalNames: ["Agarose", "Agar polysaccharide"],
      brandNames: [],
      eNumbers: ["E406", "E-406"],
      insNumbers: ["406", "INS 406"],
      abbreviations: [],
      labelVariants: [
        "Gelling agent E406",
        "Thickener E406",
        "Stabiliser E406",
        "Stabilizer E406"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gelling and thickening ingredient used to create firm gel texture.",
      healthConcernType: "gelling_thickener_stabiliser",
      warningLabel: "GELLING / THICKENING AGENT FOUND",
      userFacingReason:
        "This product contains agar, a gelling ingredient used to build texture. InsideIt flags this as a texture-support additive.",
      matchingNotes:
        "Match agar, agar-agar, agar agar, E406, and INS 406.",
      scoringImpact: "yellow_thickener_stabiliser",
      dataStatus: "starter"
    },

    {
      id: "alginates",
      mainName: "Alginates",
      otherNames: [
        "Alginic acid",
        "Sodium alginate",
        "Potassium alginate",
        "Ammonium alginate",
        "Calcium alginate",
        "Propylene glycol alginate",
        "Alginate",
        "Alginates"
      ],
      chemicalNames: [
        "Alginic acid",
        "Sodium salt of alginic acid",
        "Potassium salt of alginic acid",
        "Calcium salt of alginic acid",
        "Propylene glycol alginate"
      ],
      brandNames: [],
      eNumbers: [
        "E400",
        "E-400",
        "E401",
        "E-401",
        "E402",
        "E-402",
        "E403",
        "E-403",
        "E404",
        "E-404",
        "E405",
        "E-405"
      ],
      insNumbers: [
        "400",
        "INS 400",
        "401",
        "INS 401",
        "402",
        "INS 402",
        "403",
        "INS 403",
        "404",
        "INS 404",
        "405",
        "INS 405"
      ],
      abbreviations: ["PGA"],
      labelVariants: [
        "Thickener E400",
        "Thickener E401",
        "Stabiliser E401",
        "Stabilizer E401",
        "Gelling agent E404",
        "Emulsifier E405"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Seaweed-derived thickener, stabiliser, and gelling family used to build texture and structure.",
      healthConcernType: "thickener_gelling_stabiliser",
      warningLabel: "THICKENER / STABILISER FOUND",
      userFacingReason:
        "This product contains alginates, ingredients used to thicken, gel, and stabilise texture. InsideIt flags this as a texture-engineering additive.",
      matchingNotes:
        "Match alginic acid, sodium alginate, potassium alginate, ammonium alginate, calcium alginate, propylene glycol alginate, E400-E405, and INS variants.",
      scoringImpact: "yellow_thickener_stabiliser",
      dataStatus: "starter"
    },

    {
      id: "cellulose_and_microcrystalline_cellulose",
      mainName: "Cellulose / Microcrystalline Cellulose",
      otherNames: [
        "Cellulose",
        "Microcrystalline cellulose",
        "Powdered cellulose",
        "Cellulose powder",
        "Cellulose fibre",
        "Cellulose fiber",
        "MCC"
      ],
      chemicalNames: ["Cellulose", "Microcrystalline cellulose"],
      brandNames: [],
      eNumbers: ["E460", "E-460", "E460i", "E-460i", "E460ii", "E-460ii"],
      insNumbers: ["460", "INS 460", "460i", "INS 460i", "460ii", "INS 460ii"],
      abbreviations: ["MCC"],
      labelVariants: [
        "Bulking agent E460",
        "Stabiliser E460",
        "Stabilizer E460",
        "Anti-caking agent E460",
        "Thickener E460"
      ],
      spellingVariants: ["Fibre", "Fiber", "Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Cellulose ingredient used as a stabiliser, bulking agent, anti-caking ingredient, or texture builder.",
      healthConcernType: "cellulose_texture_bulking_stabiliser",
      warningLabel: "TEXTURE / BULKING ADDITIVE FOUND",
      userFacingReason:
        "This product contains cellulose or microcrystalline cellulose, used to build texture, bulk, or stability. InsideIt flags this as a processed texture-support ingredient.",
      matchingNotes:
        "Match cellulose, microcrystalline cellulose, powdered cellulose, cellulose fibre/fiber, MCC, E460, E460i, E460ii, and INS variants.",
      scoringImpact: "yellow_texture_builder",
      dataStatus: "starter"
    },

    {
      id: "cellulose_derivatives",
      mainName: "Cellulose Derivatives",
      otherNames: [
        "Methylcellulose",
        "Methyl cellulose",
        "Ethyl cellulose",
        "Hydroxypropyl cellulose",
        "Hydroxypropyl methylcellulose",
        "Hydroxypropylmethylcellulose",
        "HPMC",
        "Carboxymethyl cellulose",
        "Sodium carboxymethyl cellulose",
        "CMC",
        "Cellulose gum",
        "Crosslinked sodium carboxymethyl cellulose",
        "Enzymatically hydrolysed carboxymethyl cellulose",
        "Enzymatically hydrolyzed carboxymethyl cellulose"
      ],
      chemicalNames: [
        "Methylcellulose",
        "Ethyl cellulose",
        "Hydroxypropyl cellulose",
        "Hydroxypropyl methylcellulose",
        "Sodium carboxymethyl cellulose",
        "Crosslinked sodium carboxymethyl cellulose"
      ],
      brandNames: [],
      eNumbers: [
        "E461",
        "E-461",
        "E462",
        "E-462",
        "E463",
        "E-463",
        "E464",
        "E-464",
        "E466",
        "E-466",
        "E468",
        "E-468",
        "E469",
        "E-469"
      ],
      insNumbers: [
        "461",
        "INS 461",
        "462",
        "INS 462",
        "463",
        "INS 463",
        "464",
        "INS 464",
        "466",
        "INS 466",
        "468",
        "INS 468",
        "469",
        "INS 469"
      ],
      abbreviations: ["HPMC", "CMC"],
      labelVariants: [
        "Thickener E461",
        "Thickener E464",
        "Thickener E466",
        "Stabiliser E466",
        "Stabilizer E466",
        "Cellulose gum",
        "Binder methylcellulose"
      ],
      spellingVariants: [
        "Hydrolysed",
        "Hydrolyzed",
        "Stabiliser",
        "Stabilizer"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Cellulose-derived thickeners, binders, and stabilisers used to build or hold processed food texture.",
      healthConcernType: "cellulose_thickener_binder_stabiliser",
      warningLabel: "THICKENER / BINDER FOUND",
      userFacingReason:
        "This product contains cellulose-derived thickeners or binders, used to build and hold texture. InsideIt flags this as a food-construction additive.",
      matchingNotes:
        "Match methylcellulose, ethyl cellulose, hydroxypropyl cellulose, HPMC, carboxymethyl cellulose, sodium CMC, cellulose gum, E461, E462, E463, E464, E466, E468, E469, and INS variants.",
      scoringImpact: "yellow_texture_builder",
      dataStatus: "starter"
    },

    {
      id: "modified_starches",
      mainName: "Modified Starches",
      otherNames: [
        "Modified starch",
        "Modified corn starch",
        "Modified maize starch",
        "Modified potato starch",
        "Modified tapioca starch",
        "Modified wheat starch",
        "Pregelatinized starch",
        "Pregelatinised starch",
        "Oxidised starch",
        "Oxidized starch",
        "Distarch phosphate",
        "Phosphated distarch phosphate",
        "Acetylated distarch phosphate",
        "Acetylated starch",
        "Hydroxypropyl starch",
        "Hydroxypropyl distarch phosphate",
        "Starch sodium octenyl succinate",
        "Acetylated oxidised starch",
        "Acetylated oxidized starch"
      ],
      chemicalNames: [
        "Chemically modified starch",
        "Oxidised starch",
        "Distarch phosphate",
        "Acetylated distarch phosphate",
        "Hydroxypropyl distarch phosphate",
        "Starch sodium octenyl succinate"
      ],
      brandNames: [],
      eNumbers: [
        "E1404",
        "E-1404",
        "E1410",
        "E-1410",
        "E1412",
        "E-1412",
        "E1413",
        "E-1413",
        "E1414",
        "E-1414",
        "E1420",
        "E-1420",
        "E1422",
        "E-1422",
        "E1440",
        "E-1440",
        "E1442",
        "E-1442",
        "E1450",
        "E-1450",
        "E1451",
        "E-1451"
      ],
      insNumbers: [
        "1404",
        "INS 1404",
        "1410",
        "INS 1410",
        "1412",
        "INS 1412",
        "1413",
        "INS 1413",
        "1414",
        "INS 1414",
        "1420",
        "INS 1420",
        "1422",
        "INS 1422",
        "1440",
        "INS 1440",
        "1442",
        "INS 1442",
        "1450",
        "INS 1450",
        "1451",
        "INS 1451"
      ],
      abbreviations: [],
      labelVariants: [
        "Thickener modified starch",
        "Stabiliser modified starch",
        "Stabilizer modified starch",
        "Modified food starch",
        "Modified starch thickener"
      ],
      spellingVariants: [
        "Pregelatinized",
        "Pregelatinised",
        "Oxidized",
        "Oxidised",
        "Stabiliser",
        "Stabilizer"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Modified starches are used to thicken, stabilise, bind water, improve texture, and support processed food structure.",
      healthConcernType: "modified_starch_thickener_stabiliser",
      warningLabel: "MODIFIED STARCH / THICKENER FOUND",
      userFacingReason:
        "This product contains modified starches, used to thicken, bind, or stabilise processed food texture. InsideIt flags this as a food-construction marker.",
      matchingNotes:
        "Match modified starch, modified food starch, named modified starches, E1404, E1410, E1412, E1413, E1414, E1420, E1422, E1440, E1442, E1450, E1451, and INS variants.",
      scoringImpact: "yellow_texture_builder",
      dataStatus: "starter"
    },

    {
      id: "phosphate_stabilisers",
      mainName: "Phosphate Stabilisers",
      otherNames: [
        "Phosphates",
        "Sodium phosphate",
        "Monosodium phosphate",
        "Disodium phosphate",
        "Trisodium phosphate",
        "Potassium phosphate",
        "Dipotassium phosphate",
        "Tripotassium phosphate",
        "Calcium phosphate",
        "Monocalcium phosphate",
        "Dicalcium phosphate",
        "Tricalcium phosphate",
        "Diphosphates",
        "Disodium diphosphate",
        "Tetrasodium diphosphate",
        "Tetrasodium pyrophosphate",
        "Sodium acid pyrophosphate",
        "SAPP",
        "Triphosphates",
        "Sodium tripolyphosphate",
        "STPP",
        "Polyphosphates"
      ],
      chemicalNames: [
        "Orthophosphates",
        "Diphosphates",
        "Triphosphates",
        "Polyphosphates",
        "Sodium tripolyphosphate",
        "Tetrasodium pyrophosphate"
      ],
      brandNames: [],
      eNumbers: [
        "E339",
        "E-339",
        "E340",
        "E-340",
        "E341",
        "E-341",
        "E450",
        "E-450",
        "E451",
        "E-451",
        "E452",
        "E-452"
      ],
      insNumbers: [
        "339",
        "INS 339",
        "340",
        "INS 340",
        "341",
        "INS 341",
        "450",
        "INS 450",
        "451",
        "INS 451",
        "452",
        "INS 452"
      ],
      abbreviations: ["SAPP", "STPP"],
      labelVariants: [
        "Stabiliser E339",
        "Stabilizer E339",
        "Stabiliser E450",
        "Stabilizer E450",
        "Water binder phosphates",
        "Meat phosphate stabiliser",
        "Meat phosphate stabilizer"
      ],
      spellingVariants: ["Stabiliser", "Stabilizer"],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Phosphates are used to hold water, stabilise texture, support processed meat structure, and improve moisture retention.",
      healthConcernType: "phosphate_water_binding_stabiliser",
      warningLabel: "PHOSPHATE STABILISER FOUND",
      userFacingReason:
        "This product contains phosphate stabilisers, often used to hold water and support processed texture. InsideIt flags this as a food-construction and texture-support marker.",
      matchingNotes:
        "Match phosphates, sodium phosphate, disodium phosphate, trisodium phosphate, potassium phosphate, calcium phosphate, diphosphates, triphosphates, polyphosphates, SAPP, STPP, E339, E340, E341, E450, E451, E452, and INS variants.",
      scoringImpact: "yellow_texture_builder",
      dataStatus: "starter"
    },

    {
      id: "gelatin",
      mainName: "Gelatin",
      otherNames: [
        "Gelatin",
        "Gelatine",
        "Beef gelatin",
        "Pork gelatin",
        "Fish gelatin",
        "Hydrolyzed gelatin",
        "Hydrolysed gelatin",
        "Collagen protein",
        "Hydrolyzed collagen",
        "Hydrolysed collagen"
      ],
      chemicalNames: ["Denatured collagen", "Hydrolysed collagen"],
      brandNames: [],
      eNumbers: [],
      insNumbers: [],
      abbreviations: [],
      labelVariants: [
        "Gelling agent gelatin",
        "Gelling agent gelatine",
        "Stabiliser gelatin",
        "Stabilizer gelatin"
      ],
      spellingVariants: [
        "Gelatin",
        "Gelatine",
        "Hydrolyzed",
        "Hydrolysed",
        "Stabiliser",
        "Stabilizer"
      ],
      regionalNames: [],
      severity: "yellow",
      reason:
        "Gelling and texture ingredient used to set, thicken, or stabilise foods.",
      healthConcernType: "gelling_texture_stabiliser",
      warningLabel: "GELLING AGENT FOUND",
      userFacingReason:
        "This product contains gelatin/gelatine, a gelling ingredient used to build texture. InsideIt flags this as a texture-support ingredient.",
      matchingNotes:
        "Match gelatin, gelatine, beef gelatin, pork gelatin, fish gelatin, hydrolyzed/hydrolysed gelatin, collagen protein, and hydrolyzed/hydrolysed collagen.",
      scoringImpact: "yellow_thickener_stabiliser",
      dataStatus: "starter"
    }
  ],

  categoryScoringRules: {
    noEmulsifiersStabilisersFound: {
      severity: "green",
      display: "No",
      scoreImpact: 0
    },
    oneToTwoTextureAdditives: {
      severity: "yellow",
      display: "yellow_count_badge",
      scoreImpact: 8,
      reason:
        "Product contains emulsifiers, stabilisers, thickeners, gums, or texture-support ingredients."
    },
    threeOrMoreTextureAdditives: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: 22,
      reason:
        "Product contains multiple texture-engineering systems. InsideIt treats this as a high emulsifier/stabiliser load."
    },
    anyBannedRestrictedTextureAdditive: {
      severity: "red",
      display: "red_count_badge",
      scoreImpact: "automatic_red",
      reason:
        "Ingredient also appears in Banned / Restricted Items."
    }
  },

  finalVerdictRules: {
    yellow:
      "This product contains emulsifiers, stabilisers, thickeners, gums, or texture-support additives. InsideIt flags this because the product's texture is being engineered or chemically supported.",
    redLoad:
      "This product contains multiple emulsifiers, stabilisers, thickeners, gums, or texture-support systems. InsideIt flags this as a high texture-engineering load.",
    redRestricted:
      "This product contains a banned or restricted texture additive. InsideIt flags this as a serious regulatory concern."
  },

  matchingNormalizationRules: [
    "lowercase all ingredient text",
    "remove punctuation",
    "remove brackets",
    "collapse extra spaces",
    "normalize stabiliser and stabilizer",
    "normalize fibre and fiber",
    "normalize hydrolysed and hydrolyzed",
    "normalize oxidised and oxidized",
    "normalize pregelatinised and pregelatinized",
    "normalize E-numbers with and without hyphen",
    "normalize INS numbers",
    "do not double count the same ingredient if name and E-number both appear",
    "do not double count abbreviations and full names when they refer to the same item"
  ]
} as const;

export type EmulsifiersStabilisersGumsDataPack = typeof emulsifiersStabilisersGumsDataPack;
export type EmulsifiersStabilisersGumsItem = (typeof emulsifiersStabilisersGumsDataPack.items)[number];
