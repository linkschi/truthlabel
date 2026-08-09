import assert from "node:assert/strict";
import test from "node:test";

import { matchProductChecks } from "./matchProductChecks";

function findItem(output: ReturnType<typeof matchProductChecks>, itemId: string) {
  return output.evaluatedItems.find((item) => item.itemId === itemId);
}

test("wild-caught seafood is confirmed from product name without inferring farmed", () => {
  const output = matchProductChecks({
    productName: "Wild Alaska Salmon Fillets",
    productCategory: "Seafood",
  });

  const wildCaught = findItem(output, "wild_caught");
  const farmed = findItem(output, "farmed");

  assert.ok(wildCaught);
  assert.equal(wildCaught.status, "confirmed");
  assert.equal(wildCaught.severity, "green");
  assert.ok(farmed);
  assert.equal(farmed.status, "not_confirmed");
  assert.equal(farmed.matchedText, null);
});

test("wild rice does not trigger wild-caught seafood", () => {
  const output = matchProductChecks({
    ingredients: ["wild rice"],
    productName: "Organic Wild Rice",
    productCategory: "Rice",
  });

  assert.equal(findItem(output, "wild_caught"), undefined);
});

test("seafood sulfites are direct ingredient warnings", () => {
  const output = matchProductChecks({
    productName: "Cooked Shrimp",
    productCategory: "Seafood",
    ingredients: ["shrimp", "salt", "sodium metabisulfite"],
  });

  const sulfites = findItem(output, "added_sulfites");

  assert.ok(sulfites);
  assert.equal(sulfites.status, "confirmed");
  assert.equal(sulfites.severity, "yellow");
  assert.equal(sulfites.matchSource, "ingredient");
});

test("missing antibiotic claim stays not confirmed instead of likely", () => {
  const output = matchProductChecks({
    productName: "Atlantic Salmon Fillet",
    productCategory: "Seafood",
  });

  const antibiotics = findItem(output, "antibiotics");

  assert.ok(antibiotics);
  assert.equal(antibiotics.status, "not_confirmed");
  assert.equal(antibiotics.matchedText, null);
});

test("raised-without-antibiotics claim becomes not detected", () => {
  const output = matchProductChecks({
    productName: "Organic Whole Milk",
    productCategory: "Dairy",
    packageClaims: ["Raised without antibiotics"],
  });

  const antibiotics = output.evaluatedItems.find(
    (item) =>
      item.categoryId === "dairy_production_composition" &&
      item.itemId === "antibiotics",
  );

  assert.ok(antibiotics);
  assert.equal(antibiotics.status, "not_detected");
  assert.equal(antibiotics.severity, "green");
});

test("cocoa category marker stays possible yellow, not confirmed contamination", () => {
  const output = matchProductChecks({
    productName: "70% Dark Chocolate",
    productCategory: "Chocolate",
    ingredients: ["cocoa mass", "sugar", "cocoa butter"],
  });

  const heavyMetalRisk = findItem(output, "heavy_metal_risk");

  assert.ok(heavyMetalRisk);
  assert.equal(heavyMetalRisk.status, "possible");
  assert.equal(heavyMetalRisk.severity, "yellow");
  assert.equal(heavyMetalRisk.evidenceType, "category_risk_marker");
});

test("cocoa lead only becomes red from product-specific external evidence", () => {
  const output = matchProductChecks({
    productName: "Dark Chocolate Bar",
    productCategory: "Chocolate",
    externalSignals: ["Product-specific lab test: lead detected above limit"],
  });

  const lead = findItem(output, "lead");

  assert.ok(lead);
  assert.equal(lead.status, "above_limit");
  assert.equal(lead.severity, "red");
  assert.equal(lead.evidenceType, "product_specific_lab_test");
});

test("baby rice cereal creates arsenic review marker, not confirmed contamination", () => {
  const output = matchProductChecks({
    productName: "Baby Rice Cereal",
    productCategory: "Baby Food",
    ingredients: ["rice flour"],
  });

  const riceReview = findItem(output, "rice_arsenic_review_marker");

  assert.ok(riceReview);
  assert.equal(riceReview.status, "possible");
  assert.equal(riceReview.severity, "yellow");
});

test("US grass-fed beef confirms source claims without inferring antibiotics", () => {
  const output = matchProductChecks({
    productName: "USDA Organic Grass-Fed Ground Beef",
    productCategory: "Meat",
    packageClaims: ["No added hormones", "100% grass-fed"],
    certifications: ["USDA Organic"],
  });

  const grassFed = findItem(output, "grass_fed");
  const organic = findItem(output, "usda_organic");
  const hormones = findItem(output, "growth_hormones");
  const antibiotics = findItem(output, "antibiotics");

  assert.ok(grassFed);
  assert.equal(grassFed.status, "confirmed");
  assert.equal(grassFed.severity, "green");
  assert.ok(organic);
  assert.equal(organic.status, "confirmed");
  assert.equal(organic.severity, "green");
  assert.ok(hormones);
  assert.equal(hormones.status, "not_detected");
  assert.equal(hormones.severity, "green");
  assert.ok(antibiotics);
  assert.equal(antibiotics.status, "not_confirmed");
  assert.equal(antibiotics.matchedText, null);
});

test("ordinary US ground beef keeps missing source claims hidden", () => {
  const output = matchProductChecks({
    productName: "Ground Beef 80% Lean",
    productCategory: "Meat",
    ingredients: ["beef"],
  });

  const grassFed = findItem(output, "grass_fed");
  const hormones = findItem(output, "growth_hormones");

  assert.ok(grassFed);
  assert.equal(grassFed.status, "not_confirmed");
  assert.equal(grassFed.matchedText, null);
  assert.ok(hormones);
  assert.equal(hormones.status, "not_confirmed");
  assert.equal(hormones.matchedText, null);
});

test("enhanced chicken flags added water and phosphates", () => {
  const output = matchProductChecks({
    productName: "Boneless Chicken Breast",
    productCategory: "Meat",
    ingredients: ["chicken breast", "water", "salt", "sodium phosphates"],
    packageClaims: ["Contains up to 15% solution of water and salt"],
  });

  const addedWater = findItem(output, "added_water_solution");
  const phosphates = findItem(output, "added_phosphates");

  assert.ok(addedWater);
  assert.equal(addedWater.status, "confirmed");
  assert.equal(addedWater.severity, "yellow");
  assert.ok(phosphates);
  assert.equal(phosphates.status, "confirmed");
  assert.equal(phosphates.severity, "yellow");
});

test("processed hot dogs flag reconstructed meat markers", () => {
  const output = matchProductChecks({
    productName: "Chicken Hot Dogs",
    productCategory: "Meat",
    ingredients: [
      "mechanically separated chicken",
      "water",
      "salt",
    ],
  });

  const reconstructed = findItem(output, "mechanically_separated_reconstructed");

  assert.ok(reconstructed);
  assert.equal(reconstructed.status, "confirmed");
  assert.equal(reconstructed.severity, "red");
});

test("seafood does not trigger US meat-only checks", () => {
  const output = matchProductChecks({
    productName: "Wild Alaska Salmon Fillets",
    productCategory: "Seafood",
    ingredients: ["salmon"],
  });

  assert.equal(
    output.evaluatedItems.some((item) => item.categoryId === "us_meat_source_treatment"),
    false,
  );
});
