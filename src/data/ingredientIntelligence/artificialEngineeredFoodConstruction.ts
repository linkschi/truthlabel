export type ArtificialEngineeredFoodConstructionCategory =
  "artificial_engineered_food_construction";

export type ArtificialEngineeredFoodConstructionSeverityDefault =
  | "yellow"
  | "neutral";

export type ArtificialEngineeredFoodConstructionDataStatus =
  | "starter"
  | "needs_expansion"
  | "verified_core";

export type ArtificialEngineeredFoodConstructionFlagType =
  | "consumer_preference"
  | "processing"
  | "inherited"
  | "label_transparency";

export type ArtificialEngineeredFoodConstructionGroupBehavior = {
  flagType: ArtificialEngineeredFoodConstructionFlagType;
  reason:
    | "Bioengineered"
    | "Cell-grown"
    | "Fortified"
    | "Fermented"
    | "Engineered"
    | "Imitation"
    | "Reformed"
    | "Recovered"
    | "Isolated"
    | "Filled"
    | "Bound"
    | "Modified"
    | "Stabilized"
    | "Flavored"
    | "Concentrated"
    | "Reconstructed"
    | "Added fiber"
    | "Structured"
    | "Unclear";
  title: string;
  directExplanation: string;
  countsTowardHarmfulIngredientTotal: boolean;
  countsTowardHealthVerdict: boolean;
  overloadEligible: boolean;
};

export type ArtificialEngineeredFoodConstructionGroup = {
  id: string;
  groupName: string;
  category: ArtificialEngineeredFoodConstructionCategory;
  description: string;
  markers: string[];
  severityDefault: ArtificialEngineeredFoodConstructionSeverityDefault;
  redTriggers: string[];
  userFacingWarning: string;
  strongerWarning: string;
  dataStatus: ArtificialEngineeredFoodConstructionDataStatus;
  matchingNotes: string;
};

const category: ArtificialEngineeredFoodConstructionCategory =
  "artificial_engineered_food_construction";
const dataStatus: ArtificialEngineeredFoodConstructionDataStatus =
  "needs_expansion";

export const artificialEngineeredFoodConstructionDeveloperNote =
  "This is a living marker database. New food-construction ingredients, label terms, and processing markers should be added over time.";

export const artificialEngineeredFoodConstructionCategoryColorMap = {
  green: {
    display: "No engineered-food markers detected.",
  },
  yellow: {
    reason: "Engineered",
    title: "Engineered food methods detected",
    message:
      "This product uses biotechnology, reconstructed ingredients, or industrial food-building methods. This does not automatically mean it is harmful, but you may want to review it if you prefer simpler or less engineered food.",
    action:
      "Choose a simpler or conventionally produced alternative if this matters to you.",
  },
  red: {
    display:
      "A specific red ingredient is present, a serious override applies, or enough processing markers cross the overload threshold.",
    overloadThreshold: 5,
    overloadReason: "Overload",
    overloadTitle: "High engineered-food load",
    overloadMessage:
      "This product contains several reconstructed, isolated, textured, or heavily modified ingredients. You may want to limit how often you consume it.",
  },
} as const;

export const artificialEngineeredFoodConstructionGroupColorMap = {
  bioengineered_gmo_disclosure_markers: {
    flagType: "consumer_preference",
    reason: "Bioengineered",
    title: "Bioengineered disclosure detected",
    directExplanation:
      "This product contains or may contain an ingredient produced using genetic engineering.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  cultivated_cell_cultured_protein_markers: {
    flagType: "consumer_preference",
    reason: "Cell-grown",
    title: "Cell-cultured protein detected",
    directExplanation:
      "This protein was grown from animal cells instead of coming from conventional farming.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  imitation_analogue_food_markers: {
    flagType: "processing",
    reason: "Imitation",
    title: "Imitation food marker detected",
    directExplanation:
      "This product is designed to copy another food using substitute ingredients.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  reformed_reconstructed_meat_or_seafood_markers: {
    flagType: "processing",
    reason: "Reformed",
    title: "Reformed food marker detected",
    directExplanation:
      "Smaller pieces or processed proteins were combined and shaped to resemble a whole cut.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  mechanically_separated_recovered_meat_markers: {
    flagType: "processing",
    reason: "Recovered",
    title: "Mechanically recovered meat marker detected",
    directExplanation:
      "Meat was mechanically removed from bones and processed into a meat mixture.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  protein_isolates_and_textured_proteins: {
    flagType: "processing",
    reason: "Isolated",
    title: "Isolated or textured protein detected",
    directExplanation:
      "Protein was separated from its original food and processed to change its texture or function.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  fillers_and_extenders: {
    flagType: "processing",
    reason: "Filled",
    title: "Filler or extender detected",
    directExplanation:
      "Added ingredients increase volume or reduce the amount of the main food ingredient.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  binders_and_texture_builders: {
    flagType: "processing",
    reason: "Bound",
    title: "Binder or texture builder detected",
    directExplanation:
      "Added ingredients hold the product together or create a manufactured texture.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  modified_starches_and_industrial_carbohydrates: {
    flagType: "processing",
    reason: "Modified",
    title: "Modified carbohydrate detected",
    directExplanation:
      "Carbohydrates were industrially changed to improve texture, stability, or shelf life.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  emulsifiers_and_stabilisers: {
    flagType: "processing",
    reason: "Stabilized",
    title: "Emulsifier or stabilizer detected",
    directExplanation:
      "Added ingredients keep the product mixed, stable, or consistent.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  artificial_flavours_and_flavour_systems: {
    flagType: "processing",
    reason: "Flavored",
    title: "Flavor system detected",
    directExplanation:
      "Added flavor systems were used to create or strengthen the product's taste.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  artificial_colours_and_appearance_systems: {
    flagType: "inherited",
    reason: "Engineered",
    title: "Appearance system detected",
    directExplanation:
      "A broad appearance-system marker was found; known specific colors should use their own severity.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  artificial_sweeteners: {
    flagType: "inherited",
    reason: "Engineered",
    title: "Sweetener system detected",
    directExplanation:
      "A broad sweetener-system marker was found; known specific sweeteners should use their own severity.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  processed_oils_and_engineered_fats: {
    flagType: "inherited",
    reason: "Engineered",
    title: "Processed oil or engineered fat system detected",
    directExplanation:
      "A broad oil or engineered-fat marker was found; PHO and other known red fats should use their own severity.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  preservatives_and_shelf_life_systems: {
    flagType: "inherited",
    reason: "Engineered",
    title: "Shelf-life system detected",
    directExplanation:
      "A broad preservative marker was found; known specific preservatives should use their own severity.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  ultra_processed_powder_concentrate_markers: {
    flagType: "processing",
    reason: "Concentrated",
    title: "Powder or concentrate marker detected",
    directExplanation:
      "Part of the food was broken down, concentrated, or converted into a manufactured powder.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  made_from_concentrate_reconstructed_food_markers: {
    flagType: "processing",
    reason: "Reconstructed",
    title: "Reconstructed-food marker detected",
    directExplanation:
      "The food was concentrated and later rebuilt using water or other ingredients.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  synthetic_vitamins_and_fortification_systems: {
    flagType: "consumer_preference",
    reason: "Fortified",
    title: "Fortification system detected",
    directExplanation:
      "Vitamins or minerals were added during manufacturing rather than coming entirely from the original food.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  industrial_fibre_additives: {
    flagType: "processing",
    reason: "Added fiber",
    title: "Added fiber system detected",
    directExplanation:
      "Isolated or manufactured fiber was added instead of coming entirely from whole foods.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  animal_free_dairy_precision_fermented_milk_proteins: {
    flagType: "consumer_preference",
    reason: "Fermented",
    title: "Precision-fermented dairy protein detected",
    directExplanation:
      "Milk protein was produced using precision fermentation instead of coming directly from a dairy animal.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  animal_free_egg_fermentation_derived_egg_proteins: {
    flagType: "consumer_preference",
    reason: "Fermented",
    title: "Fermentation-derived egg protein detected",
    directExplanation:
      "Egg protein was produced using precision fermentation instead of coming directly from an egg.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  engineered_heme_leghemoglobin_meat_like_flavour_systems: {
    flagType: "processing",
    reason: "Engineered",
    title: "Engineered heme system detected",
    directExplanation:
      "Biotechnology was used to create a meat-like color or flavor component.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  molecular_farming_plant_made_animal_proteins: {
    flagType: "consumer_preference",
    reason: "Engineered",
    title: "Plant-made animal protein detected",
    directExplanation:
      "A plant was engineered to produce a protein normally associated with animals.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  specific_bioengineered_food_disclosure_targets: {
    flagType: "consumer_preference",
    reason: "Bioengineered",
    title: "Specific bioengineered food disclosure detected",
    directExplanation:
      "Reliable product information identifies this food or ingredient as bioengineered.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  cultivated_fat_seafood_and_animal_cell_derived_ingredients: {
    flagType: "consumer_preference",
    reason: "Cell-grown",
    title: "Cell-derived animal ingredient detected",
    directExplanation:
      "This food component was produced by growing animal cells under controlled conditions.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  microbial_biomass_fermentation_protein: {
    flagType: "consumer_preference",
    reason: "Fermented",
    title: "Microbial fermentation protein detected",
    directExplanation:
      "This protein was produced using microorganisms and controlled fermentation.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
  extruded_printed_structured_food_technology_markers: {
    flagType: "processing",
    reason: "Structured",
    title: "Structured food technology detected",
    directExplanation:
      "The food was shaped or constructed using extrusion, printing, or another industrial process.",
    countsTowardHarmfulIngredientTotal: true,
    countsTowardHealthVerdict: true,
    overloadEligible: true,
  },
  label_transparency_risk_markers: {
    flagType: "label_transparency",
    reason: "Unclear",
    title: "Food-construction details are unclear",
    directExplanation:
      "The label does not clearly explain some ingredients or processes used to make the product.",
    countsTowardHarmfulIngredientTotal: false,
    countsTowardHealthVerdict: false,
    overloadEligible: false,
  },
} as const satisfies Record<
  string,
  ArtificialEngineeredFoodConstructionGroupBehavior
>;

export function getArtificialEngineeredFoodConstructionGroupBehavior(
  groupId: string,
) {
  const behaviorById =
    artificialEngineeredFoodConstructionGroupColorMap as Record<
      string,
      ArtificialEngineeredFoodConstructionGroupBehavior
    >;

  return (
    behaviorById[groupId] ??
    behaviorById.label_transparency_risk_markers
  );
}

export const artificialEngineeredFoodConstructionGroups: ArtificialEngineeredFoodConstructionGroup[] =
  [
    {
      id: "bioengineered_gmo_disclosure_markers",
      groupName: "Bioengineered / GMO disclosure markers",
      category,
      description:
        "Disclosure terms that indicate bioengineered or genetically engineered food ingredients.",
      markers: [
        "Bioengineered food ingredient",
        "Contains a bioengineered food ingredient",
        "Contains bioengineered ingredients",
        "Bioengineered",
        "BE food",
        "BE ingredient",
        "Produced with genetic engineering",
        "Genetically engineered",
        "Genetically modified",
        "Genetically modified organism",
        "GMO",
        "GM ingredient",
        "Modified genetic material",
        "Recombinant ingredient",
        "Recombinant DNA",
        "rDNA",
        "Genetic engineering",
        "Derived from bioengineering",
        "May contain bioengineered food ingredients",
      ],
      severityDefault: "yellow",
      redTriggers: [],
      userFacingWarning:
        "Bioengineered or genetically engineered ingredient detected. Truthlabel flags this for transparency because some customers may want to avoid genetically engineered ingredients.",
      strongerWarning:
        "Bioengineered or genetically engineered ingredient detected. This product should be reviewed closely for transparency before buying or eating.",
      dataStatus,
      matchingNotes:
        "Match disclosure wording case-insensitively after normalization. This is a transparency flag, not an automatic safety claim.",
    },
    {
      id: "cultivated_cell_cultured_protein_markers",
      groupName: "Cultivated / cell-cultured protein markers",
      category,
      description:
        "Terms that indicate cultivated, cell-based, or lab-grown animal protein.",
      markers: [
        "Cultivated meat",
        "Cultured meat",
        "Cell-cultured meat",
        "Cell-based meat",
        "Lab-grown meat",
        "Cultivated chicken",
        "Cultivated beef",
        "Cultivated pork",
        "Cultivated seafood",
        "Cultivated fish",
        "Cell-cultured chicken",
        "Cell-cultured beef",
        "Cell-cultured seafood",
        "Animal cell culture",
        "Animal cell-cultured protein",
        "Cell-cultivated protein",
        "Cultured animal cells",
        "Cell-derived meat",
        "Cell-based seafood",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Hidden while the product is presented as conventional meat.",
        "Region-specific restriction exists.",
        "Verified mislabeling exists.",
      ],
      userFacingWarning:
        "This product appears to contain cultivated or cell-cultured animal protein. Truthlabel flags this because it is not conventional whole-cut meat and should be clearly disclosed.",
      strongerWarning:
        "This product appears to contain cultivated or cell-cultured animal protein and additional construction signals. Truthlabel flags this as a stronger food-construction concern.",
      dataStatus,
      matchingNotes:
        "Match cultivated and cell-cultured wording case-insensitively after normalization.",
    },
    {
      id: "imitation_analogue_food_markers",
      groupName: "Imitation / analogue food markers",
      category,
      description:
        "Markers that indicate a product is designed to imitate a more natural food.",
      markers: [
        "Imitation meat",
        "Meat analogue",
        "Meat analog",
        "Plant-based meat",
        "Vegan meat",
        "Meat-free chicken",
        "Meat-free beef",
        "Meatless burger",
        "Plant-based burger",
        "Plant-based mince",
        "Plant-based sausage",
        "Alternative protein",
        "Imitation cheese",
        "Cheese analogue",
        "Cheese analog",
        "Processed cheese product",
        "Imitation crab",
        "Seafood analogue",
        "Seafood analog",
        "Fish analogue",
        "Fish analog",
        "Imitation bacon",
        "Bacon-flavoured bits",
        "Chicken-style pieces",
        "Beef-style strips",
        "Meat-style pieces",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with artificial texture or appearance systems.",
      ],
      userFacingWarning:
        "This product appears to be an imitation or analogue food. Truthlabel flags this because it may be constructed to resemble a natural food using processed ingredients.",
      strongerWarning:
        "This product appears to be an imitation or analogue food with added construction signals. Truthlabel flags this as a stronger food-construction concern.",
      dataStatus,
      matchingNotes:
        "Normalize analogue/analog and flavored/flavoured variants before matching.",
    },
    {
      id: "reformed_reconstructed_meat_or_seafood_markers",
      groupName: "Reformed / reconstructed meat or seafood markers",
      category,
      description:
        "Markers that indicate meat or seafood may be shaped, reconstituted, or reconstructed.",
      markers: [
        "Reformed meat",
        "Restructured meat",
        "Formed meat",
        "Chopped and shaped meat",
        "Shaped chicken",
        "Formed chicken",
        "Reconstituted meat",
        "Reformed ham",
        "Reformed bacon",
        "Reformed fish",
        "Reformed seafood",
        "Fish paste",
        "Surimi",
        "Crab sticks",
        "Seafood sticks",
        "Imitation crab sticks",
        "Processed meat product",
        "Meat preparation",
        "Meat product with added water",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with multiple fillers, binders, or extenders.",
      ],
      userFacingWarning:
        "This product contains reformed or reconstructed food markers. Truthlabel flags this because the product may not be simple whole meat or whole seafood.",
      strongerWarning:
        "This product contains reconstructed meat or seafood markers plus additional construction signals. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Match reformed, restructured, reconstituted, surimi, and shaped-product wording after normalization.",
    },
    {
      id: "mechanically_separated_recovered_meat_markers",
      groupName: "Mechanically separated / recovered meat markers",
      category,
      description:
        "Markers that indicate highly processed recovered or mechanically separated meat.",
      markers: [
        "Mechanically separated meat",
        "Mechanically separated chicken",
        "Mechanically separated turkey",
        "Mechanically recovered meat",
        "Mechanically deboned meat",
        "Mechanically deboned poultry",
        "MDM",
        "MSM",
        "Meat paste",
        "Meat slurry",
        "Poultry paste",
        "Chicken paste",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with multiple fillers, binders, or extenders.",
      ],
      userFacingWarning:
        "This product contains mechanically separated or highly processed meat. Truthlabel flags this because it is not simple whole-cut meat.",
      strongerWarning:
        "This product contains mechanically separated or recovered meat plus added construction markers. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Match mechanically separated, recovered, deboned, and paste wording after normalization.",
    },
    {
      id: "protein_isolates_and_textured_proteins",
      groupName: "Protein isolates and textured proteins",
      category,
      description:
        "Protein ingredients often used to build, extend, or imitate food texture.",
      markers: [
        "Soy protein",
        "Soy protein isolate",
        "Soy protein concentrate",
        "Textured soy protein",
        "Textured vegetable protein",
        "TVP",
        "Pea protein",
        "Pea protein isolate",
        "Pea protein concentrate",
        "Wheat protein",
        "Wheat gluten",
        "Vital wheat gluten",
        "Corn protein",
        "Rice protein",
        "Potato protein",
        "Faba bean protein",
        "Mung bean protein",
        "Mycoprotein",
        "Milk protein isolate",
        "Milk protein concentrate",
        "Casein",
        "Caseinate",
        "Sodium caseinate",
        "Calcium caseinate",
        "Whey protein isolate",
        "Whey protein concentrate",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with other fillers, binders, or extenders.",
        "Four or more total construction markers found.",
      ],
      userFacingWarning:
        "This product contains protein isolates or textured proteins. Truthlabel flags this because these ingredients are often used to build, extend, or imitate food texture.",
      strongerWarning:
        "This product contains multiple artificial construction markers, including protein isolates or textured proteins. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Match protein isolates, concentrates, textured proteins, and caseinate variants case-insensitively after normalization.",
    },
    {
      id: "fillers_and_extenders",
      groupName: "Fillers and extenders",
      category,
      description:
        "Ingredients that can bulk out or extend a product beyond a simpler whole-food structure.",
      markers: [
        "Added water",
        "Water added",
        "Modified starch",
        "Corn starch",
        "Maize starch",
        "Potato starch",
        "Tapioca starch",
        "Rice starch",
        "Wheat starch",
        "Cassava starch",
        "Rice flour",
        "Wheat flour",
        "Breadcrumbs",
        "Bread crumbs",
        "Rusk",
        "Cereal filler",
        "Oat fibre",
        "Oat fiber",
        "Wheat fibre",
        "Wheat fiber",
        "Bamboo fibre",
        "Bamboo fiber",
        "Pea fibre",
        "Pea fiber",
        "Cellulose fibre",
        "Cellulose fiber",
        "Soy flour",
        "Defatted soy flour",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Two or more filler or extender markers appear in a meat, fish, seafood, or simple-food product.",
      ],
      userFacingWarning:
        "This product contains fillers or extenders. Truthlabel flags this because the ingredient list suggests the product may be extended rather than being simple whole food.",
      strongerWarning:
        "This product contains multiple filler or extender signals. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Normalize fibre/fiber variants and match filler-style starch, flour, breadcrumb, and added-water terms.",
    },
    {
      id: "binders_and_texture_builders",
      groupName: "Binders and texture builders",
      category,
      description:
        "Ingredients commonly used to hold, shape, thicken, or reconstruct food texture.",
      markers: [
        "Carrageenan",
        "Methylcellulose",
        "Cellulose",
        "Microcrystalline cellulose",
        "Xanthan gum",
        "Guar gum",
        "Locust bean gum",
        "Konjac gum",
        "Gellan gum",
        "Tara gum",
        "Arabic gum",
        "Acacia gum",
        "Sodium alginate",
        "Calcium alginate",
        "Alginate",
        "Transglutaminase",
        "Meat glue",
        "Phosphates",
        "Sodium phosphate",
        "Disodium phosphate",
        "Trisodium phosphate",
        "Tripolyphosphate",
        "Sodium tripolyphosphate",
        "Polyphosphates",
        "Diphosphates",
        "Tetrasodium pyrophosphate",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Two or more binders or texture builders appear with fillers or extenders.",
        "Found in meat or fish products with artificial construction markers.",
      ],
      userFacingWarning:
        "This product contains binders or texture builders. Truthlabel flags this because these ingredients can be used to hold, shape, thicken, or reconstruct food texture.",
      strongerWarning:
        "This product contains multiple binders or texture builders alongside other construction markers. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Match gum, alginate, phosphate, and transglutaminase terms after normalization.",
    },
    {
      id: "modified_starches_and_industrial_carbohydrates",
      groupName: "Modified starches and industrial carbohydrates",
      category,
      description:
        "Modified starches and industrial carbohydrate ingredients often used for texture, bulk, or processing.",
      markers: [
        "Modified starch",
        "Modified corn starch",
        "Modified maize starch",
        "Modified potato starch",
        "Modified tapioca starch",
        "Pregelatinized starch",
        "Pregelatinised starch",
        "Dextrin",
        "Maltodextrin",
        "Resistant maltodextrin",
        "Glucose syrup",
        "Corn syrup solids",
        "Polydextrose",
        "Inulin",
        "Chicory root fibre",
        "Chicory root fiber",
        "Soluble corn fiber",
        "Soluble corn fibre",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with other fillers, binders, or flavor systems.",
      ],
      userFacingWarning:
        "This product contains modified starches or industrial carbohydrate ingredients. Truthlabel flags this because these are common markers of engineered texture, bulk, or processing.",
      strongerWarning:
        "This product contains multiple modified starch or industrial carbohydrate markers. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Normalize fibre/fiber and pregelatinised/pregelatinized variants before matching.",
    },
    {
      id: "emulsifiers_and_stabilisers",
      groupName: "Emulsifiers and stabilisers",
      category,
      description:
        "Ingredients often used to engineer texture, mouthfeel, and shelf stability.",
      markers: [
        "Mono- and diglycerides",
        "Monoglycerides",
        "Diglycerides",
        "DATEM",
        "SSL",
        "Sodium stearoyl lactylate",
        "Calcium stearoyl lactylate",
        "Polysorbate 80",
        "Polysorbate 60",
        "Polysorbate 20",
        "Lecithin",
        "Soy lecithin",
        "Sunflower lecithin",
        "PGPR",
        "Propylene glycol esters",
        "Sorbitan monostearate",
        "Glycerol monostearate",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with imitation or cultivated meat markers.",
      ],
      userFacingWarning:
        "This product contains emulsifiers or stabilisers. Truthlabel flags this because these ingredients are often used to engineer texture, mouthfeel, and shelf stability.",
      strongerWarning:
        "This product contains multiple emulsifier or stabiliser signals alongside other construction markers. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Match emulsifier abbreviations and lecithin variants case-insensitively after normalization.",
    },
    {
      id: "artificial_flavours_and_flavour_systems",
      groupName: "Artificial flavours and flavour systems",
      category,
      description:
        "Flavouring systems and enhancers used to build taste beyond simple whole ingredients.",
      markers: [
        "Artificial flavour",
        "Artificial flavor",
        "Flavouring",
        "Flavoring",
        "Natural flavour",
        "Natural flavor",
        "Smoke flavour",
        "Smoke flavor",
        "Natural smoke flavour",
        "Natural smoke flavor",
        "Artificial smoke flavour",
        "Artificial smoke flavor",
        "Beef flavour",
        "Beef flavor",
        "Chicken flavour",
        "Chicken flavor",
        "Meat flavour",
        "Meat flavor",
        "Cheese flavour",
        "Cheese flavor",
        "Butter flavour",
        "Butter flavor",
        "Yeast extract",
        "Hydrolyzed vegetable protein",
        "Hydrolysed vegetable protein",
        "HVP",
        "Autolyzed yeast extract",
        "Autolysed yeast extract",
        "Disodium inosinate",
        "Disodium guanylate",
        "MSG",
        "Monosodium glutamate",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with imitation, cultivated, or high-count construction markers.",
      ],
      userFacingWarning:
        "This product contains flavouring systems or flavour enhancers. Truthlabel flags this because the taste may be built with added flavour technology rather than coming only from simple whole ingredients.",
      strongerWarning:
        "This product contains multiple flavour-system markers alongside other construction signals. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Normalize flavour/flavor and hydrolysed/hydrolyzed variants. Avoid double counting HVP aliases from the same ingredient line.",
    },
    {
      id: "artificial_colours_and_appearance_systems",
      groupName: "Artificial colours and appearance systems",
      category,
      description:
        "Color or appearance additives that may be used to enhance the product's look.",
      markers: [
        "Artificial colour",
        "Artificial color",
        "Synthetic colour",
        "Synthetic color",
        "Colour added",
        "Color added",
        "Red 40",
        "Yellow 5",
        "Yellow 6",
        "Blue 1",
        "Blue 2",
        "Green 3",
        "Red No. 3",
        "E102",
        "E110",
        "E129",
        "E127",
        "E133",
        "E132",
        "E143",
        "Caramel colour",
        "Caramel color",
        "Titanium dioxide",
        "Beetroot red",
        "Annatto",
        "Paprika extract",
        "Iron oxide",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Any matched marker also appears in Banned / Restricted Items.",
      ],
      userFacingWarning:
        "This product contains colour or appearance additives. Truthlabel flags this because the product's appearance may be artificially enhanced.",
      strongerWarning:
        "This product contains color or appearance additives that overlap with stronger safety or restriction signals. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Normalize colour/color variants and match E-number style aliases after punctuation cleanup.",
    },
    {
      id: "artificial_sweeteners",
      groupName: "Artificial sweeteners",
      category,
      description:
        "Artificial or high-intensity sweetening systems used to create sweetness beyond simple sugar or whole-food sweetness.",
      markers: [
        "Aspartame",
        "Sucralose",
        "Acesulfame potassium",
        "Acesulfame K",
        "Ace-K",
        "Saccharin",
        "Cyclamate",
        "Sodium cyclamate",
        "Neotame",
        "Advantame",
        "Alitame",
        "Steviol glycosides",
        "Erythritol",
        "Maltitol",
        "Sorbitol",
        "Xylitol",
        "Isomalt",
        "Mannitol",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Any matched marker also appears in Banned / Restricted Items.",
      ],
      userFacingWarning:
        "This product contains artificial or high-intensity sweeteners. Truthlabel flags this because sweetness is being created through added sweetening systems rather than simple sugar or whole-food sweetness.",
      strongerWarning:
        "This product contains artificial sweetener markers that overlap with stronger restriction signals. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Match sweetener names and abbreviations case-insensitively after normalization.",
    },
    {
      id: "processed_oils_and_engineered_fats",
      groupName: "Processed oils and engineered fats",
      category,
      description:
        "Industrial oils and engineered fats commonly used in ultra-processed foods.",
      markers: [
        "Vegetable oil",
        "Seed oil",
        "Soybean oil",
        "Canola oil",
        "Rapeseed oil",
        "Sunflower oil",
        "Cottonseed oil",
        "Corn oil",
        "Palm oil",
        "Palm kernel oil",
        "Hydrogenated oil",
        "Fully hydrogenated oil",
        "Partially hydrogenated oil",
        "Interesterified oil",
        "Interesterified fat",
        "Shortening",
        "Margarine",
        "Mono- and diglycerides",
        "Olestra",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Partially hydrogenated oil is found.",
      ],
      userFacingWarning:
        "This product contains processed oils or engineered fats. Truthlabel flags this because these fats are industrial ingredients often used in ultra-processed foods.",
      strongerWarning:
        "This product contains stronger processed-oil or engineered-fat signals. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Match processed oil, hydrogenated oil, and engineered fat terms after normalization.",
    },
    {
      id: "preservatives_and_shelf_life_systems",
      groupName: "Preservatives and shelf-life systems",
      category,
      description:
        "Preservatives and shelf-life support additives used to extend storage or stability.",
      markers: [
        "Sodium benzoate",
        "Potassium benzoate",
        "Calcium benzoate",
        "Benzoic acid",
        "Potassium sorbate",
        "Sodium sorbate",
        "Sorbic acid",
        "Calcium propionate",
        "Sodium propionate",
        "Propionic acid",
        "Sodium nitrite",
        "Sodium nitrate",
        "Potassium nitrite",
        "Potassium nitrate",
        "Sulphites",
        "Sulfites",
        "Sodium metabisulphite",
        "Sodium metabisulfite",
        "BHA",
        "BHT",
        "TBHQ",
        "EDTA",
        "Calcium disodium EDTA",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Any matched marker also appears in Banned / Restricted Items or Cancer-linked Watch.",
      ],
      userFacingWarning:
        "This product contains preservatives or shelf-life additives. Truthlabel flags this because the product is chemically supported for longer storage or stability.",
      strongerWarning:
        "This product contains preservative markers that overlap with stronger watch-list signals. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Normalize sulphite/sulfite variants and match preservative acronyms case-insensitively.",
    },
    {
      id: "ultra_processed_powder_concentrate_markers",
      groupName: "Ultra-processed powder / concentrate markers",
      category,
      description:
        "Powder, concentrate, and reconstructed component markers that suggest processed building blocks.",
      markers: [
        "Powdered milk",
        "Milk solids",
        "Whey powder",
        "Whey solids",
        "Egg powder",
        "Cheese powder",
        "Fruit powder",
        "Vegetable powder",
        "Juice powder",
        "Protein powder",
        "Cocoa powder",
        "Flavour powder",
        "Seasoning powder",
        "Soup powder",
        "Sauce powder",
        "Dehydrated flakes",
        "Dehydrated vegetables",
        "Spray-dried",
        "Freeze-dried",
        "Instant mix",
        "Premix",
        "Concentrate",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with other construction markers at a heavy load.",
      ],
      userFacingWarning:
        "This product contains powder, concentrate, or reconstructed ingredient markers. Truthlabel flags this because the product may be built from processed components rather than simple fresh ingredients.",
      strongerWarning:
        "This product contains multiple powder or concentrate markers alongside other construction signals. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Normalize flavour/flavor variants and match powder, premix, and concentrate wording after punctuation cleanup.",
    },
    {
      id: "made_from_concentrate_reconstructed_food_markers",
      groupName: "Made from concentrate / reconstructed food markers",
      category,
      description:
        "Markers that show a product or ingredient may be rebuilt from processed concentrate components.",
      markers: [
        "From concentrate",
        "Made from concentrate",
        "Reconstituted juice",
        "Reconstituted milk",
        "Reconstituted whey",
        "Reconstituted tomato",
        "Tomato concentrate",
        "Fruit concentrate",
        "Juice concentrate",
        "Apple juice concentrate",
        "Grape juice concentrate",
        "Pear juice concentrate",
        "Vegetable concentrate",
        "Rehydrated",
        "Reconstituted",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with flavor systems or broader heavy construction signals.",
      ],
      userFacingWarning:
        "This product contains concentrate or reconstituted ingredient markers. Truthlabel flags this because the product may be rebuilt from processed components.",
      strongerWarning:
        "This product contains multiple concentrate or reconstituted markers alongside other construction signals. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Match concentrate, reconstituted, and rehydrated wording after normalization.",
    },
    {
      id: "synthetic_vitamins_and_fortification_systems",
      groupName: "Synthetic vitamins / fortification systems",
      category,
      description:
        "Added fortification ingredients that can indicate an added nutrient system rather than a whole-food nutrient source.",
      markers: [
        "Ascorbic acid",
        "Folic acid",
        "Niacin",
        "Thiamine mononitrate",
        "Riboflavin",
        "Pyridoxine hydrochloride",
        "Cyanocobalamin",
        "Vitamin A palmitate",
        "Vitamin D3",
        "Ferrous sulfate",
        "Ferrous sulphate",
        "Reduced iron",
        "Zinc oxide",
        "Calcium carbonate",
        "Calcium phosphate",
      ],
      severityDefault: "yellow",
      redTriggers: [],
      userFacingWarning:
        "This product contains added fortification ingredients. Truthlabel flags this as an added nutrient system, not a whole-food nutrient source.",
      strongerWarning:
        "This product contains added fortification ingredients alongside multiple other construction markers. Truthlabel flags this as part of a broader food-construction concern.",
      dataStatus,
      matchingNotes:
        "Normalize sulphate/sulfate variants. Treat this as a transparency marker, not an automatic harm claim.",
    },
    {
      id: "industrial_fibre_additives",
      groupName: "Industrial fibre additives",
      category,
      description:
        "Added fibre or bulking ingredients that can reshape texture, bulk, or nutrition claims.",
      markers: [
        "Inulin",
        "Chicory root fibre",
        "Chicory root fiber",
        "Soluble corn fiber",
        "Soluble corn fibre",
        "Resistant maltodextrin",
        "Polydextrose",
        "Oat fibre",
        "Oat fiber",
        "Bamboo fibre",
        "Bamboo fiber",
        "Cellulose",
        "Psyllium husk",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with other filler, binder, or extender markers.",
      ],
      userFacingWarning:
        "This product contains added fibre or bulking ingredients. Truthlabel flags this because these ingredients can be used to change texture, bulk, or nutrition claims.",
      strongerWarning:
        "This product contains multiple fibre or bulking markers alongside other construction signals. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Normalize fibre/fiber variants and count industrial bulking fibers once per ingredient line.",
    },
    {
      id: "animal_free_dairy_precision_fermented_milk_proteins",
      groupName: "Animal-free dairy / precision-fermented milk proteins",
      category,
      description:
        "Animal-free, fermentation-derived, or recombinant dairy protein markers.",
      markers: [
        "Animal-free dairy",
        "Animal free dairy",
        "Animal-free milk",
        "Animal free milk",
        "Cow-free milk",
        "Cow free milk",
        "No-cow dairy",
        "Cowless dairy",
        "Dairy without cows",
        "Non-animal dairy protein",
        "Non-animal milk protein",
        "Animal-free whey",
        "Animal free whey",
        "Non-animal whey protein",
        "Whey protein from fermentation",
        "Fermentation-derived whey protein",
        "Precision-fermented whey protein",
        "Precision fermented whey protein",
        "Beta-lactoglobulin from fermentation",
        "β-lactoglobulin from fermentation",
        "Recombinant beta-lactoglobulin",
        "Recombinant β-lactoglobulin",
        "Fermentation-derived beta-lactoglobulin",
        "Animal-free casein",
        "Animal free casein",
        "Non-animal casein",
        "Recombinant casein",
        "Precision-fermented casein",
        "Fermentation-derived casein",
        "Dairy-identical protein",
        "Milk-identical protein",
        "Milk protein made by microbes",
        "Milk protein made by microflora",
        "Dairy protein made by fermentation",
        "Dairy protein from precision fermentation",
        "Microflora-derived dairy protein",
        "Microbe-made dairy protein",
        "Fermentation-made dairy protein",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with fillers, binders, flavour systems, colour systems, or reconstructed meat/seafood markers.",
      ],
      userFacingWarning:
        "This product contains animal-free or fermentation-derived dairy protein. Truthlabel flags this because the product may use engineered microbes or precision fermentation to create dairy-like proteins without animals.",
      strongerWarning:
        "This product contains dairy-like proteins made through fermentation or recombinant food technology. Truthlabel flags this as an engineered food-construction marker.",
      dataStatus,
      matchingNotes:
        "Prefer animal-free dairy, precision-fermented dairy protein, and fermentation-derived milk protein wording. Do not call it lab-grown milk unless the product itself does.",
    },
    {
      id: "animal_free_egg_fermentation_derived_egg_proteins",
      groupName: "Animal-free egg / fermentation-derived egg proteins",
      category,
      description:
        "Animal-free, fermentation-derived, or recombinant egg protein markers.",
      markers: [
        "Animal-free egg",
        "Animal free egg",
        "Egg without chickens",
        "Chicken-free egg",
        "Chicken free egg",
        "Non-animal egg protein",
        "Animal-free egg protein",
        "Fermentation-derived egg protein",
        "Precision-fermented egg protein",
        "Precision fermented egg protein",
        "Recombinant egg protein",
        "Recombinant ovalbumin",
        "Fermentation-derived ovalbumin",
        "Animal-free ovalbumin",
        "Non-animal ovalbumin",
        "Egg white protein from fermentation",
        "Ovo protein",
        "OvoPro",
        "EVERY egg protein",
        "No-chicken egg protein",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with fillers, binders, flavour systems, or broader construction markers.",
      ],
      userFacingWarning:
        "This product contains animal-free or fermentation-derived egg protein. Truthlabel flags this because the product may use precision fermentation or recombinant protein technology instead of conventional eggs.",
      strongerWarning:
        "This product contains animal-free or fermentation-derived egg protein plus additional construction signals. Truthlabel flags this as an engineered food-construction marker.",
      dataStatus,
      matchingNotes:
        "Treat this as an engineered or animal-free protein marker, not an automatic unsafe claim.",
    },
    {
      id: "engineered_heme_leghemoglobin_meat_like_flavour_systems",
      groupName:
        "Engineered heme / leghemoglobin / meat-like blood flavour systems",
      category,
      description:
        "Markers for engineered heme systems used to build meat-like flavour or appearance.",
      markers: [
        "Soy leghemoglobin",
        "Leghemoglobin",
        "Heme",
        "Heme protein",
        "Soy leghemoglobin preparation",
        "Recombinant leghemoglobin",
        "Fermentation-derived heme",
        "Precision-fermented heme",
        "Heme-containing protein",
        "Plant-based heme",
        "Meat-like heme flavour",
        "Meat-like heme flavor",
        "Heme flavor system",
        "Heme flavour system",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with fillers, binders, colour systems, or broader imitation-food markers.",
      ],
      userFacingWarning:
        "This product contains an engineered heme or meat-like flavour system. Truthlabel flags this because the meat-like taste or appearance may be built using engineered food technology.",
      strongerWarning:
        "This product contains engineered heme or meat-like flavour technology alongside other construction signals. Truthlabel flags this as an engineered food-construction marker.",
      dataStatus,
      matchingNotes:
        "Treat engineered heme as a food-construction and transparency marker, not an automatic safety claim.",
    },
    {
      id: "molecular_farming_plant_made_animal_proteins",
      groupName: "Molecular farming / plant-made animal proteins",
      category,
      description:
        "Markers that indicate engineered plants may be used to express animal-like proteins.",
      markers: [
        "Molecular farming",
        "Plant molecular farming",
        "Plant-made animal protein",
        "Plant-made dairy protein",
        "Plant-made egg protein",
        "Plant-made whey protein",
        "Plant-made casein",
        "Plant-made collagen",
        "Plant-expressed protein",
        "Plant-expressed animal protein",
        "Recombinant protein from plants",
        "Animal protein expressed in plants",
        "Dairy protein expressed in plants",
        "Egg protein expressed in plants",
        "Protein produced in plants",
        "Biofarmed protein",
        "Molecular farmed protein",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with fillers, binders, flavour systems, or broader engineered-protein signals.",
      ],
      userFacingWarning:
        "This product contains or claims plant-made recombinant protein technology. Truthlabel flags this because the product may use engineered plants to produce animal-like proteins.",
      strongerWarning:
        "This product contains plant-made recombinant protein technology alongside additional construction markers. Truthlabel flags this as an engineered food-construction marker.",
      dataStatus,
      matchingNotes:
        "Treat this as a transparency marker. Do not automatically call it dangerous.",
    },
    {
      id: "specific_bioengineered_food_disclosure_targets",
      groupName: "Specific bioengineered food disclosure targets",
      category,
      description:
        "Named bioengineered foods or disclosure targets that should be surfaced for transparency when the label supports them.",
      markers: [
        "Bioengineered alfalfa",
        "Bioengineered apple",
        "Arctic apple",
        "Arctic apples",
        "Bioengineered canola",
        "Bioengineered corn",
        "Bioengineered cottonseed",
        "Bioengineered eggplant",
        "BARI Bt eggplant",
        "BARI Bt Begun",
        "Bioengineered papaya",
        "Ringspot virus-resistant papaya",
        "Bioengineered pineapple",
        "Pink flesh pineapple",
        "Bioengineered potato",
        "Bioengineered salmon",
        "AquAdvantage salmon",
        "Genetically engineered salmon",
        "Bioengineered soybean",
        "Bioengineered soy",
        "Bioengineered squash",
        "Bioengineered sugarbeet",
        "Bioengineered sugar beet",
        "BE food ingredient",
        "Contains a bioengineered food ingredient",
        "May contain bioengineered food ingredients",
        "Derived from bioengineering",
      ],
      severityDefault: "yellow",
      redTriggers: [],
      userFacingWarning:
        "This product contains or may contain a bioengineered food ingredient. Truthlabel flags this for transparency because some customers may want to know when genetic engineering is involved.",
      strongerWarning:
        "This product contains a named bioengineered food disclosure marker alongside other construction signals. Truthlabel flags this as an engineered food-construction marker.",
      dataStatus,
      matchingNotes:
        "Only flag when the label, database, or verified source supports it. Do not infer this from animal feed alone.",
    },
    {
      id: "cultivated_fat_seafood_and_animal_cell_derived_ingredients",
      groupName:
        "Cultivated fat / cultivated seafood / animal cell derived ingredients",
      category,
      description:
        "Cultivated, cell-derived, or fermentation-derived animal-like ingredient markers beyond conventional whole-food sourcing.",
      markers: [
        "Cultivated fat",
        "Cell-cultured fat",
        "Cell cultured fat",
        "Cultured fat",
        "Cultivated pork fat",
        "Cultivated beef fat",
        "Cultivated chicken fat",
        "Animal cell-derived fat",
        "Cell-derived fat",
        "Cultivated seafood",
        "Cell-cultured seafood",
        "Cultured seafood",
        "Cell-based seafood",
        "Cultivated fish",
        "Cultivated salmon",
        "Cell-cultured salmon",
        "Cell-based salmon",
        "Cultivated tuna",
        "Cultivated shrimp",
        "Cultivated lobster",
        "Cultivated collagen",
        "Cell-cultured collagen",
        "Recombinant collagen",
        "Animal-free collagen",
        "Fermentation-derived collagen",
        "Precision-fermented collagen",
        "Animal-free gelatin",
        "Recombinant gelatin",
        "Fermentation-derived gelatin",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with fillers, binders, flavour systems, colour systems, or reconstructed meat/seafood markers.",
      ],
      userFacingWarning:
        "This product contains cultivated, cell-derived, or fermentation-derived animal-like ingredients. Truthlabel flags this because the product may not come from conventional animal farming or simple whole-food sources.",
      strongerWarning:
        "This product contains cultivated, cell-derived, or fermentation-derived animal-like ingredients alongside additional construction markers. Truthlabel flags this as an engineered food-construction marker.",
      dataStatus,
      matchingNotes:
        "Treat these as cultivated or cell-derived ingredient markers. Do not call them banned unless region-specific restriction data exists.",
    },
    {
      id: "microbial_biomass_fermentation_protein",
      groupName: "Microbial / biomass fermentation protein",
      category,
      description:
        "Alternative protein markers produced through microbial, fungal, algae, or biomass fermentation systems.",
      markers: [
        "Microbial protein",
        "Biomass fermentation protein",
        "Fermentation protein",
        "Fermented protein",
        "Single-cell protein",
        "Single cell protein",
        "Mycoprotein",
        "Fungal protein",
        "Fungi protein",
        "Mushroom root protein",
        "Microalgae protein",
        "Algae protein",
        "Algal protein",
        "Spirulina protein",
        "Chlorella protein",
        "Yeast protein",
        "Yeast-derived protein",
        "Bacterial protein",
        "Protein from microorganisms",
        "Protein from microbes",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with fillers, binders, flavour systems, or broader engineered-protein markers.",
      ],
      userFacingWarning:
        "This product contains microbial, fungal, algae, or biomass-fermentation protein. Truthlabel flags this because the product uses alternative protein technology rather than simple traditional protein sources.",
      strongerWarning:
        "This product contains microbial or biomass-fermentation protein alongside additional construction markers. Truthlabel flags this as an engineered food-construction marker.",
      dataStatus,
      matchingNotes:
        "Treat this as a construction and transparency marker, not an automatic safety claim.",
    },
    {
      id: "extruded_printed_structured_food_technology_markers",
      groupName: "Extruded / printed / structured food technology markers",
      category,
      description:
        "Processing-technology markers that suggest food texture is being engineered through extrusion, printing, or structuring systems.",
      markers: [
        "Extruded protein",
        "High-moisture extrusion",
        "High moisture extrusion",
        "Extrusion-cooked",
        "Extruded snack",
        "Texturized protein",
        "Texturised protein",
        "Structured protein",
        "Structured vegetable protein",
        "3D printed food",
        "3-D printed food",
        "Printed meat",
        "3D printed meat",
        "Printed steak",
        "Printed fish",
        "Printed seafood",
        "Structured meat analogue",
        "Structured meat analog",
      ],
      severityDefault: "yellow",
      redTriggers: [
        "Combined with imitation-food, binder, filler, or broader engineered-protein markers.",
      ],
      userFacingWarning:
        "This product contains structured, extruded, or printed food-technology markers. Truthlabel flags this because the product texture may be engineered through processing technology rather than coming from simple whole food.",
      strongerWarning:
        "This product contains structured, extruded, or printed food-technology markers alongside additional construction signals. Truthlabel flags this as an engineered food-construction marker.",
      dataStatus,
      matchingNotes:
        "Treat this as a food-construction marker, not an automatic unsafe claim.",
    },
    {
      id: "label_transparency_risk_markers",
      groupName: "Label transparency risk markers",
      category,
      description:
        "A computed risk group used when the ingredient evidence suggests the product is more constructed than it first appears.",
      markers: [],
      severityDefault: "yellow",
      redTriggers: [
        "Heavy construction load or strong mismatch exists.",
      ],
      userFacingWarning:
        "This product contains artificial or engineered food-construction markers. Truthlabel flags this because the ingredient list shows it may not be simple whole food.",
      strongerWarning:
        "This product contains multiple construction markers, including fillers, binders, extenders, flavour systems, colour systems, or engineered ingredients. Truthlabel flags this as a serious food-construction concern.",
      dataStatus,
      matchingNotes:
        "Trigger this group from evidence patterns such as heavy marker count, meat or seafood reconstruction, imitation systems, or strong simple-food mismatch.",
    },
  ];

export const artificialEngineeredFoodConstructionGroupsById = Object.fromEntries(
  artificialEngineeredFoodConstructionGroups.map((group) => [group.id, group]),
) satisfies Record<string, ArtificialEngineeredFoodConstructionGroup>;
