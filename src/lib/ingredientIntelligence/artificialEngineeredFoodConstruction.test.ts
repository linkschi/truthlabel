import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeArtificialEngineeredFoodConstruction,
  getConstructionGroupMatchedIngredients,
} from "./artificialEngineeredFoodConstruction";

test("construction analysis stays green when no markers are found", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Whole oats", "Dates", "Sea salt"],
    productCategory: "fresh_simple",
  });

  assert.equal(summary.categorySeverity, "green");
  assert.equal(summary.totalMarkerCount, 0);
  assert.equal(summary.displayCount, 0);
});

test("construction analysis turns yellow for one marker", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Soy protein isolate"],
    productCategory: "packaged_processed",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.totalMarkerCount, 1);
  assert.equal(summary.displayCount, 1);
});

test("construction analysis stays yellow for four overload-eligible processing markers", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: [
      "Soy protein isolate",
      "Methylcellulose",
      "Natural flavour",
      "Modified starch",
    ],
    productCategory: "packaged_processed",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.totalMarkerCount, 4);
  assert.equal(summary.overloadEligibleMarkerCount, 4);
});

test("construction analysis turns red at five overload-eligible processing markers", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: [
      "Soy protein isolate",
      "Methylcellulose",
      "Natural flavour",
      "Modified starch",
      "Protein powder",
    ],
    productCategory: "packaged_processed",
  });

  assert.equal(summary.categorySeverity, "red");
  assert.equal(summary.overloadEligibleMarkerCount, 5);
  assert.match(summary.warningText, /reconstructed, isolated, textured/i);
});

test("meat products with fillers and binders stay yellow unless overload threshold is crossed", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    productName: "Chicken patties",
    ingredientNames: [
      "Chicken",
      "Water added",
      "Soy protein",
      "Modified starch",
      "Methylcellulose",
    ],
    productCategory: "meat_fast_food",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasMeatOrSeafoodExtenderTrigger, true);
});

test("bioengineered disclosure stays a transparency-led yellow flag", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Corn flour"],
    labelTexts: ["Contains a bioengineered food ingredient"],
    productCategory: "packaged_processed",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasBioengineeredDisclosure, true);
  assert.match(summary.warningText, /genetic engineering/i);
});

test("cultivated protein wording stays yellow by default", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    productName: "Cell-cultured chicken bites",
    ingredientNames: ["Cell-cultured chicken"],
    productCategory: "meat_fast_food",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasCultivatedProtein, true);
  assert.match(summary.warningText, /grown from animal cells/i);
});

test("imitation seafood with multiple construction markers stays yellow below overload threshold", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    productName: "Imitation crab sticks",
    ingredientNames: ["Surimi", "Modified starch", "Crab flavour", "Colour added"],
    productCategory: "seafood",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.totalMarkerCount, 4);
});

test("construction matching normalizes british and american spelling", () => {
  const british = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Caramel colour"],
    productCategory: "packaged_processed",
  });
  const american = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Caramel color"],
    productCategory: "packaged_processed",
  });

  assert.equal(british.totalMarkerCount, 1);
  assert.equal(american.totalMarkerCount, 1);
  assert.deepEqual(british.triggeredGroupNames, american.triggeredGroupNames);
});

test("construction matching does not double count alias-heavy ingredient wording", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Hydrolysed vegetable protein (HVP)"],
    productCategory: "packaged_processed",
  });

  assert.equal(summary.totalMarkerCount, 1);
  assert.deepEqual(
    getConstructionGroupMatchedIngredients(
      summary,
      "artificial_flavours_and_flavour_systems",
    ),
    ["Hydrolysed vegetable protein (HVP)"],
  );
});

test("animal-free whey protein triggers the animal-free dairy group as yellow", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Animal-free whey protein"],
    productCategory: "dairy_egg",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.deepEqual(
    getConstructionGroupMatchedIngredients(
      summary,
      "animal_free_dairy_precision_fermented_milk_proteins",
    ),
    ["Animal-free whey protein"],
  );
});

test("precision-fermented casein triggers the animal-free dairy group as yellow", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Precision-fermented casein"],
    productCategory: "dairy_egg",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.deepEqual(
    getConstructionGroupMatchedIngredients(
      summary,
      "animal_free_dairy_precision_fermented_milk_proteins",
    ),
    ["Precision-fermented casein"],
  );
});

test("recombinant ovalbumin triggers the animal-free egg group as yellow", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Recombinant ovalbumin"],
    productCategory: "dairy_egg",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.deepEqual(
    getConstructionGroupMatchedIngredients(
      summary,
      "animal_free_egg_fermentation_derived_egg_proteins",
    ),
    ["Recombinant ovalbumin"],
  );
});

test("soy leghemoglobin triggers the engineered heme group as yellow", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Soy leghemoglobin"],
    productCategory: "packaged_processed",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.deepEqual(
    getConstructionGroupMatchedIngredients(
      summary,
      "engineered_heme_leghemoglobin_meat_like_flavour_systems",
    ),
    ["Soy leghemoglobin"],
  );
});

test("AquAdvantage salmon triggers the specific bioengineered foods group as yellow", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["AquAdvantage salmon"],
    productCategory: "seafood",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasBioengineeredDisclosure, true);
  assert.deepEqual(
    getConstructionGroupMatchedIngredients(
      summary,
      "specific_bioengineered_food_disclosure_targets",
    ),
    ["AquAdvantage salmon"],
  );
});

test("cell-cultured salmon triggers the cultivated seafood group as yellow", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Cell-cultured salmon"],
    productCategory: "seafood",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.hasCultivatedProtein, true);
  assert.deepEqual(
    getConstructionGroupMatchedIngredients(
      summary,
      "cultivated_fat_seafood_and_animal_cell_derived_ingredients",
    ),
    ["Cell-cultured salmon"],
  );
});

test("animal-free collagen triggers the cultivated or cell-derived animal-like group as yellow", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Animal-free collagen"],
    productCategory: "general_unknown",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.deepEqual(
    getConstructionGroupMatchedIngredients(
      summary,
      "cultivated_fat_seafood_and_animal_cell_derived_ingredients",
    ),
    ["Animal-free collagen"],
  );
});

test("high-moisture extrusion triggers the structured food technology group as yellow", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["High-moisture extrusion"],
    productCategory: "packaged_processed",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.deepEqual(
    getConstructionGroupMatchedIngredients(
      summary,
      "extruded_printed_structured_food_technology_markers",
    ),
    ["High-moisture extrusion"],
  );
});

test("animal-free whey plus three processing markers stays yellow below overload threshold", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: [
      "Soy protein isolate",
      "Methylcellulose",
      "Natural flavour",
      "Animal-free whey protein",
    ],
    productCategory: "packaged_processed",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.equal(summary.totalMarkerCount, 4);
  assert.equal(summary.consumerPreferenceMarkerCount, 1);
  assert.equal(summary.overloadEligibleMarkerCount, 3);
});

test("bioengineered label wording stays a yellow transparency warning and not an unsafe claim", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["Corn flour"],
    labelTexts: ["Contains a bioengineered food ingredient"],
    productCategory: "packaged_processed",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.match(summary.warningText, /genetic engineering/i);
  assert.doesNotMatch(summary.warningText, /unsafe|dangerous/i);
});

test("beta symbol normalization matches fermentation-derived beta-lactoglobulin wording", () => {
  const summary = analyzeArtificialEngineeredFoodConstruction({
    ingredientNames: ["β-lactoglobulin from fermentation"],
    productCategory: "dairy_egg",
  });

  assert.equal(summary.categorySeverity, "yellow");
  assert.deepEqual(
    getConstructionGroupMatchedIngredients(
      summary,
      "animal_free_dairy_precision_fermented_milk_proteins",
    ),
    ["β-lactoglobulin from fermentation"],
  );
});
