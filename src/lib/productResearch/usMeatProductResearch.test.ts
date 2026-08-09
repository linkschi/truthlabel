import assert from "node:assert/strict";
import test from "node:test";

import { normalizeExternalProduct } from "@/lib/productDatabase/normalizeExternalProduct";

import {
  enrichWithUsMeatProductResearch,
  findUsMeatProductResearch,
  getUsMeatProductResearchCount,
  lookupUsMeatProductResearch,
} from "./usMeatProductResearch";

function signalType(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return (value as { signalType?: unknown }).signalType;
}

test("US meat research batch contains the first researched records plus batch 1 replacements", () => {
  assert.equal(getUsMeatProductResearchCount(), 226);
});

test("known UPC resolves to a local meat product with ingredients and safety context", () => {
  const result = lookupUsMeatProductResearch({ barcode: "078742030623" });

  assert.ok(result);
  assert.equal(result.provider, "truthlabel_local_research");
  assert.equal(
    result.productName,
    "Great Value Fully Cooked Original Pork Sausage Patties - Family Size 35.6 oz",
  );
  assert.ok(result.ingredients?.includes("BHA"));
  assert.ok(result.ingredients?.includes("Propyl gallate"));
  assert.equal(result.externalSignals?.length, 1);
  assert.equal(signalType(result.externalSignals?.[0]), "historical_recall");
});

test("UPC matching tolerates a leading zero version", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0078742030623" });

  assert.ok(result);
  assert.equal(result.productName?.includes("Great Value Fully Cooked"), true);
});

test("batch 1 chicken barcode resolves with broth and salt disclosure", () => {
  const result = lookupUsMeatProductResearch({ barcode: "078742026619" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Great Value All Natural Boneless Skinless Chicken Breasts, 5 lb (Frozen)",
  );
  assert.ok(result.ingredients?.includes("Chicken broth"));
  assert.ok(result.ingredients?.includes("Salt"));
  assert.ok(result.imageUrl);
});

test("batch 1 hot dog barcode resolves with nitrite and phosphate markers", () => {
  const result = lookupUsMeatProductResearch({ barcode: "00054500193342" });

  assert.ok(result);
  assert.equal(result.productName, "Ball Park Beef Hot Dogs, 30 oz, 16 Count");
  assert.ok(result.ingredients?.includes("Sodium nitrite"));
  assert.ok(result.ingredients?.includes("Sodium phosphate"));
  assert.match(JSON.stringify(result.raw), /productSpecificChecks/);
});

test("batch 1 ground turkey carries historical product-line recall context", () => {
  const result = lookupUsMeatProductResearch({ barcode: "142222602010" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "JENNIE-O All-Natural 93/7 Ground Turkey, 16 oz",
  );
  assert.ok(result.ingredients?.includes("Rosemary extract"));
  assert.equal(signalType(result.externalSignals?.[0]), "historical_recall");
});

test("batch 2 bacon barcode resolves with cure-system ingredients", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0007080004118" });

  assert.ok(result);
  assert.equal(result.productName, "Smithfield Hometown Original Bacon");
  assert.ok(result.ingredients?.includes("Sodium nitrite"));
  assert.ok(result.ingredients?.includes("Sodium phosphates"));
  assert.match(JSON.stringify(result.raw), /brand\/different-product historical recall/);
});

test("batch 2 deli turkey barcode preserves celery-powder and carrageenan findings", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0003760013264" });

  assert.ok(result);
  assert.equal(result.productName, "HORMEL NATURAL CHOICE Smoked Deli Turkey");
  assert.ok(result.ingredients?.includes("Cultured celery powder"));
  assert.ok(result.ingredients?.includes("Carrageenan"));
  assert.match(JSON.stringify(result.raw), /labeling-policy context/);
});

test("batch 2 name fallback can find no-barcode seasoned chicken research", () => {
  const record = findUsMeatProductResearch({
    productName: "Perdue Short Cuts Garlic Herb Chicken Breast 3 lb",
    brandName: "PERDUE SHORTCUTS",
  });

  assert.ok(record);
  assert.equal(record.id, "perdue_shortcuts_garlic_herb_chicken_breasts_3_lb");
  assert.ok(record.ingredients.includes("Xanthan gum"));
});

test("batch 2 Boar's Head barcode keeps outbreak context without marking an exact recall", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0004242161411" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Boar's Head London Broil Top Round Roast Beef",
  );
  assert.equal(result.externalSignals?.length, 0);
  assert.match(JSON.stringify(result.raw), /major brand\/plant product-family history/);
});

test("batch 2 turkey bacon barcode resolves mechanically separated turkey findings", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0002265530301" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Butterball Original Turkey Bacon, Smoke-Cured, Chopped and Formed",
  );
  assert.ok(result.ingredients?.includes("Mechanically separated turkey"));
  assert.ok(result.ingredients?.includes("Sodium nitrite"));
});

test("batch 3 name fallback can find variable-weight ground beef with hidden disclosures", () => {
  const record = findUsMeatProductResearch({
    productName: "93 Lean 7 Fat Lean Ground Beef Fresh All Natural",
    brandName: "Walmart fresh beef",
  });

  assert.ok(record);
  assert.equal(record.id, "walmart_all_natural_93_7_ground_beef_1_lb_tray");
  assert.equal(record.ingredientDisclosure, "not_exposed");
  assert.equal(record.markerFacts.addedWater, "hidden");
});

test("batch 3 Perdue Harvestland chicken barcode resolves as simple chicken", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0025064650000" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "PERDUE HARVESTLAND Free Range Boneless Skinless Chicken Thighs",
  );
  assert.deepEqual(result.ingredients, ["Chicken"]);
});

test("batch 3 Applegate bacon keeps cultured celery powder context", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0002531710100" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Applegate Natural Hickory Smoked Uncured Sunday Bacon",
  );
  assert.ok(result.ingredients?.includes("Cultured celery powder"));
  assert.equal(result.externalSignals?.length, 0);
  assert.match(JSON.stringify(result.raw), /uncured\/no-added-nitrite claim/);
});

test("batch 3 Johnsonville Italian sausage resolves BHA and propyl gallate", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0007778200816" });

  assert.ok(result);
  assert.equal(result.productName, "Johnsonville Mild Italian Sausage Links");
  assert.ok(result.ingredients?.includes("BHA"));
  assert.ok(result.ingredients?.includes("Propyl gallate"));
  assert.match(JSON.stringify(result.raw), /hazard classification context/);
});

test("batch 3 Boar's Head SmokeMaster ham carries exact historical recall context", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0027576470000" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Boar's Head SmokeMaster Beechwood Smoked Black Forest Uncured Ham",
  );
  assert.equal(signalType(result.externalSignals?.[0]), "historical_recall");
  assert.match(JSON.stringify(result.raw), /confirmed source conflict/);
});

test("batch 4 Kroger ground beef barcode resolves with historical alert context", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0001111069982" });

  assert.ok(result);
  assert.equal(result.productName, "Kroger 80/20 Ground Beef Tray 1 LB");
  assert.deepEqual(result.ingredients, ["Ground beef"]);
  assert.equal(signalType(result.externalSignals?.[0]), "public_health_alert");
});

test("batch 4 name fallback can find Walmart beef stew meat with hidden solution fields", () => {
  const record = findUsMeatProductResearch({
    productName: "Walmart Beef Stew Meat Tray Fresh",
    brandName: "Fresh Beef",
  });

  assert.ok(record);
  assert.equal(record.id, "walmart_beef_stew_meat_tray_fresh");
  assert.equal(record.ingredientDisclosure, "not_exposed");
  assert.equal(record.markerFacts.addedWater, "hidden");
});

test("batch 4 Tyson chicken resolves added broth formulation", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0002370003006" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Tyson Thin Sliced Boneless Skinless Chicken Breasts, Frozen",
  );
  assert.ok(result.ingredients?.includes("Chicken broth"));
  assert.match(JSON.stringify(result.raw), /up to 15%/);
});

test("batch 4 Eckrich smoked sausage resolves mechanically separated chicken and MSG", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0004660055005" });

  assert.ok(result);
  assert.equal(result.productName, "Eckrich Original Smoked Sausage Links");
  assert.ok(result.ingredients?.includes("Mechanically separated chicken"));
  assert.ok(result.ingredients?.includes("MSG"));
});

test("batch 4 Nathan's franks and Buddig ham keep processed-meat additives", () => {
  const franks = lookupUsMeatProductResearch({ barcode: "0088831391490" });
  const ham = lookupUsMeatProductResearch({ barcode: "0007740010837" });

  assert.ok(franks);
  assert.ok(ham);
  assert.ok(franks.ingredients?.includes("Sodium nitrite"));
  assert.ok(franks.ingredients?.includes("Sodium phosphate"));
  assert.ok(ham.ingredients?.includes("Carrageenan"));
  assert.ok(ham.ingredients?.includes("Cultured celery powder"));
});

test("batch 4 Simple Truth lamb resolves as one-ingredient lamb with hidden raising claims", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0001111003104" });

  assert.ok(result);
  assert.equal(result.productName, "Simple Truth Natural Ground Lamb");
  assert.deepEqual(result.ingredients, ["Lamb"]);
  assert.match(JSON.stringify(result.raw), /grass-fed\/grass-finished status/);
});

test("batch 5 name fallback can find Sanderson drumsticks with hidden formulation fields", () => {
  const record = findUsMeatProductResearch({
    productName: "Sanderson Farms Chicken Drumsticks",
    brandName: "Sanderson Farms",
  });

  assert.ok(record);
  assert.equal(record.id, "sanderson_farms_fresh_chicken_drumsticks_family_pack");
  assert.equal(record.ingredientDisclosure, "not_exposed");
  assert.equal(record.markerFacts.addedWater, "hidden");
});

test("batch 5 Just Bare chicken keeps retained-water disclosure separate from added solution", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0002410559005" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Just Bare Boneless Skinless Fresh Chicken Breast",
  );
  assert.ok(result.ingredients?.includes("Up to 1% retained water"));
  assert.match(JSON.stringify(result.raw), /retained process water/i);
});

test("batch 5 Heritage Farm whole chicken resolves broth and carrageenan", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0021069500000" });

  assert.ok(result);
  assert.equal(result.productName, "Heritage Farm Whole Fresh Chicken");
  assert.ok(result.ingredients?.includes("Chicken broth"));
  assert.ok(result.ingredients?.includes("Carrageenan"));
});

test("batch 5 JENNIE-O frozen turkey breast resolves the enhanced additive list", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0025008400000" });

  assert.ok(result);
  assert.equal(result.productName, "JENNIE-O Bone-In Frozen Turkey Breast");
  assert.ok(result.ingredients?.includes("Sodium phosphate"));
  assert.ok(result.ingredients?.includes("Disodium inosinate"));
  assert.ok(result.ingredients?.includes("Disodium guanylate"));
});

test("batch 5 Bob Evans sausage and Aidells sausage preserve MSG and celery powder distinctions", () => {
  const bobEvans = lookupUsMeatProductResearch({ barcode: "0007590000200" });
  const aidells = lookupUsMeatProductResearch({ barcode: "0076401420805" });

  assert.ok(bobEvans);
  assert.ok(aidells);
  assert.ok(bobEvans.ingredients?.includes("MSG"));
  assert.ok(bobEvans.ingredients?.includes("Potassium lactate"));
  assert.ok(aidells.ingredients?.includes("Cultured celery powder"));
  assert.ok(aidells.ingredients?.includes("Natural pork casing"));
});

test("batch 5 Oscar Mayer bologna and Hillshire roast beef keep processed deli additives", () => {
  const bologna = lookupUsMeatProductResearch({ barcode: "0004470000885" });
  const roastBeef = lookupUsMeatProductResearch({ barcode: "0004450098469" });

  assert.ok(bologna);
  assert.ok(roastBeef);
  assert.ok(bologna.ingredients?.includes("Corn syrup"));
  assert.ok(bologna.ingredients?.includes("Sodium nitrite"));
  assert.ok(roastBeef.ingredients?.includes("Potassium phosphates"));
  assert.ok(roastBeef.ingredients?.includes("Caramel color"));
});

test("batch 7 no-barcode ibp ground beef remains a hidden-disclosure record", () => {
  const record = findUsMeatProductResearch({
    productName: "90 Lean 10 Fat Ground Beef 1 lb Brick Fresh",
    brandName: "ibp Trusted Excellence",
  });

  assert.ok(record);
  assert.equal(
    record.id,
    "ibp_trusted_excellence_all_natural_90_10_ground_beef_vacuum_sealed_1_lb",
  );
  assert.equal(record.ingredientDisclosure, "not_exposed");
  assert.deepEqual(record.ingredients, []);
  assert.equal(record.markerFacts.addedWater, "hidden");
});

test("batch 7 Tyson frozen tenderloins resolve the up-to-15-percent broth formulation", () => {
  const result = lookupUsMeatProductResearch({ barcode: "00023700162229" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Tyson Boneless Skinless Chicken Breast Tenderloins, Frozen",
  );
  assert.ok(result.ingredients?.includes("Chicken broth"));
  assert.ok(result.ingredients?.includes("Natural flavorings"));
  assert.match(JSON.stringify(result.raw), /up to 15%/);
});

test("batch 7 Perdue organic whole chicken keeps organic and no-antibiotics claims separate from hidden retained water", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0025890300000" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "PERDUE HARVESTLAND Organic Whole Chicken with Giblets",
  );
  assert.deepEqual(result.ingredients, ["Chicken"]);
  assert.match(JSON.stringify(result.raw), /USDA Certified Organic/);
  assert.match(JSON.stringify(result.raw), /retained-water percentage/i);
});

test("batch 7 processed meats preserve mechanical separation, BHA, and celery-cure distinctions", () => {
  const hotDogs = lookupUsMeatProductResearch({ barcode: "0005450019325" });
  const salami = lookupUsMeatProductResearch({ barcode: "0027565000000" });
  const ham = lookupUsMeatProductResearch({ barcode: "0004470003129" });

  assert.ok(hotDogs);
  assert.ok(salami);
  assert.ok(ham);
  assert.ok(hotDogs.ingredients?.includes("Mechanically separated chicken"));
  assert.ok(hotDogs.ingredients?.includes("Sodium nitrite"));
  assert.ok(salami.ingredients?.includes("BHA"));
  assert.ok(salami.ingredients?.includes("BHT"));
  assert.ok(ham.ingredients?.includes("Cultured celery juice"));
  assert.ok(ham.ingredients?.includes("Sodium phosphates"));
});

test("batch 7 Private Selection lamb rejects corrupted retailer ingredient data", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0021308000000" });

  assert.ok(result);
  assert.equal(result.productName, "Private Selection Lamb Loin Chops");
  assert.deepEqual(result.ingredients, []);
  assert.match(JSON.stringify(result.raw), /retailer database mismatch/);
  assert.equal(result.externalSignals?.length, 0);
});

test("batch 8 Kroger ground beef barcode resolves as simple beef with hidden raising disclosures", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0001111069984" });

  assert.ok(result);
  assert.equal(result.productName, "Kroger 85/15 Ground Beef Tray");
  assert.deepEqual(result.ingredients, ["Ground beef"]);
  assert.match(JSON.stringify(result.raw), /finelyTexturedBeef/);
});

test("batch 8 Butterball turkey tenderloins resolve added water and flavor formulation", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0002265570196" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Butterball All Natural Extra Lean Fresh Turkey Breast Tenderloins",
  );
  assert.ok(result.ingredients?.includes("Water"));
  assert.ok(result.ingredients?.includes("Natural flavors"));
  assert.match(JSON.stringify(result.raw), /solution percentage/i);
});

test("batch 8 processed meats preserve nitrite, phosphate, celery powder, and high-sodium distinctions", () => {
  const bacon = lookupUsMeatProductResearch({ barcode: "0007080022529" });
  const turkey = lookupUsMeatProductResearch({ barcode: "0027555900000" });
  const sausage = lookupUsMeatProductResearch({ barcode: "0076401429352" });

  assert.ok(bacon);
  assert.ok(turkey);
  assert.ok(sausage);
  assert.ok(bacon.ingredients?.includes("Sodium nitrite"));
  assert.ok(turkey.ingredients?.includes("Sodium phosphate"));
  assert.ok(sausage.ingredients?.includes("Cultured celery powder"));
  assert.match(JSON.stringify(sausage.raw), /570 mg sodium/);
});

test("batch 8 no-barcode H-E-B grass-fed beef is available through name fallback", () => {
  const record = findUsMeatProductResearch({
    productName: "H-E-B Grass Fed and Finished Ground Beef 85% Lean",
    brandName: "H-E-B",
  });

  assert.ok(record);
  assert.equal(record.id, "h_e_b_grass_fed_finished_ground_beef_85_lean");
  assert.equal(record.markerFacts.grassFed, "yes");
  assert.equal(record.markerFacts.antibiotics, "no");
});

test("batch 9 Kroger 93 lean beef resolves with historical public-health alert context", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0001111097930" });

  assert.ok(result);
  assert.equal(result.productName, "Kroger 93% Lean Ground Beef");
  assert.deepEqual(result.ingredients, ["Ground beef"]);
  assert.equal(signalType(result.externalSignals?.[0]), "public_health_alert");
  assert.match(JSON.stringify(result.raw), /December 2021/);
});

test("batch 9 Heritage Farm chicken breast resolves 15 percent broth solution", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0021065600000" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Heritage Farm Boneless Skinless Fresh Chicken Breast",
  );
  assert.ok(result.ingredients?.includes("Chicken broth"));
  assert.ok(result.ingredients?.includes("Carrageenan"));
  assert.match(JSON.stringify(result.raw), /15% solution/);
});

test("batch 9 corned beef and Black Forest ham preserve high-sodium curing markers", () => {
  const cornedBeef = lookupUsMeatProductResearch({ barcode: "0024174600000" });
  const ham = lookupUsMeatProductResearch({ barcode: "0024573710000" });

  assert.ok(cornedBeef);
  assert.ok(ham);
  assert.ok(cornedBeef.ingredients?.includes("Sodium nitrite"));
  assert.ok(cornedBeef.ingredients?.includes("Sodium phosphates"));
  assert.match(JSON.stringify(cornedBeef.raw), /up to 35%/i);
  assert.ok(ham.ingredients?.includes("Caramel color"));
  assert.match(JSON.stringify(ham.raw), /580 mg sodium/);
});

test("batch 9 hot dogs and smoked turkey sausage keep mechanically separated meat findings", () => {
  const wieners = lookupUsMeatProductResearch({ barcode: "0004470000266" });
  const sausage = lookupUsMeatProductResearch({ barcode: "0002265530646" });

  assert.ok(wieners);
  assert.ok(sausage);
  assert.equal(signalType(wieners.externalSignals?.[0]), "historical_recall");
  assert.ok(wieners.ingredients?.includes("Mechanically separated chicken"));
  assert.ok(wieners.ingredients?.includes("Mechanically separated turkey"));
  assert.ok(sausage.ingredients?.includes("Mechanically separated turkey"));
  assert.ok(sausage.ingredients?.includes("Beef collagen casing"));
});

test("batch 9 deli turkey, bacon, and andouille preserve celery-cure and sodium context", () => {
  const turkey = lookupUsMeatProductResearch({ barcode: "0004450097651" });
  const bacon = lookupUsMeatProductResearch({ barcode: "0003760048760" });
  const andouille = lookupUsMeatProductResearch({ barcode: "0004280411741" });

  assert.ok(turkey);
  assert.ok(bacon);
  assert.ok(andouille);
  assert.ok(turkey.ingredients?.includes("Cultured celery powder"));
  assert.ok(turkey.ingredients?.includes("Sodium phosphates"));
  assert.ok(bacon.ingredients?.includes("Cultured celery powder"));
  assert.ok(andouille.ingredients?.includes("Sodium nitrite"));
  assert.match(JSON.stringify(andouille.raw), /550 mg sodium/);
});

test("batch 10 Kroger beef roast rejects generic Food-A-Pedia data as exact ingredients", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0024194700000" });

  assert.ok(result);
  assert.equal(result.productName, "Shoulder English Beef Roast");
  assert.deepEqual(result.ingredients, []);
  assert.match(JSON.stringify(result.raw), /Food-A-Pedia/);
  assert.match(JSON.stringify(result.raw), /does not infer beef only/);
});

test("batch 10 simple chicken and pork records resolve without false additive findings", () => {
  const chicken = lookupUsMeatProductResearch({ barcode: "0020077020000" });
  const pork = findUsMeatProductResearch({
    productName: "H-E-B Natural Bone-in Boston Butt Pork Roast",
    brandName: "H-E-B",
  });

  assert.ok(chicken);
  assert.ok(pork);
  assert.deepEqual(chicken.ingredients, ["Boneless chicken breast"]);
  assert.deepEqual(pork.ingredients, ["Pork"]);
  assert.equal(chicken.externalSignals?.length, 0);
  assert.equal(pork.markerFacts.phosphates, "not_listed");
});

test("batch 10 H-E-B Original Thick Cut Bacon replaces the older shallow legacy record", () => {
  const record = findUsMeatProductResearch({
    productName: "H-E-B Original Thick Cut Bacon 12 oz",
    brandName: "H-E-B",
  });

  assert.ok(record);
  assert.equal(record.id, "heb_original_thick_cut_bacon_12_oz");
  assert.equal(record.productName, "H-E-B Original Thick Cut Bacon");
  assert.ok(record.ingredients.includes("Sodium nitrite"));
  assert.match(JSON.stringify(record.structuredReviewNotes), /sodium phosphates/);
});

test("batch 10 hot dogs and hot links preserve high-sodium nitrite and mechanical-separation markers", () => {
  const queenCity = lookupUsMeatProductResearch({ barcode: "0001129104725" });
  const barS = lookupUsMeatProductResearch({ barcode: "0001590023800" });

  assert.ok(queenCity);
  assert.ok(barS);
  assert.ok(queenCity.ingredients?.includes("Sodium nitrite"));
  assert.ok(queenCity.ingredients?.includes("Sodium phosphate"));
  assert.ok(barS.ingredients?.includes("Mechanically separated chicken"));
  assert.ok(barS.ingredients?.includes("Pork hearts"));
  assert.match(JSON.stringify(barS.raw), /640 mg sodium/);
});

test("batch 10 deli roast beef and applewood bacon preserve celery-derived curing context", () => {
  const roastBeef = lookupUsMeatProductResearch({ barcode: "0001111062679" });
  const bacon = findUsMeatProductResearch({
    productName: "H-E-B Natural Applewood Smoked Thick Cut Bacon",
    brandName: "H-E-B",
  });

  assert.ok(roastBeef);
  assert.ok(bacon);
  assert.ok(roastBeef.ingredients?.includes("Celery seed extractives"));
  assert.equal(roastBeef.rawLabels?.includes("No nitrates/nitrites added except naturally occurring sources"), true);
  assert.ok(bacon.ingredients.includes("Celery powder"));
  assert.match(JSON.stringify(bacon.structuredReviewNotes), /curing source/);
});

test("batch 10 Tyson bone-in chicken rejects mismatched stuffed-product ingredient panel", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0026080600000" });

  assert.ok(result);
  assert.equal(result.productName, "Tyson Bone-In Fresh Chicken Breast");
  assert.deepEqual(result.ingredients, []);
  assert.match(JSON.stringify(result.raw), /retailer data mismatch/);
  assert.match(JSON.stringify(result.raw), /stuffed boneless-chicken/);
});

test("batch 11 H-E-B steak and Hill Country Fare chicken resolve by name without false additives", () => {
  const steak = findUsMeatProductResearch({
    productName: "H-E-B Natural Beef T-Bone Steak Bone-In USDA Choice",
    brandName: "H-E-B",
  });
  const chicken = findUsMeatProductResearch({
    productName: "Hill Country Fare Chicken Leg Quarters",
    brandName: "Hill Country Fare",
  });

  assert.ok(steak);
  assert.ok(chicken);
  assert.deepEqual(steak.ingredients, ["Beef"]);
  assert.deepEqual(chicken.ingredients, ["Chicken leg quarters"]);
  assert.equal(steak.markerFacts.addedWater, "not_listed");
  assert.equal(chicken.markerFacts.retainedWater, "hidden");
});

test("batch 11 Perdue chicken keeps simple chicken data and avoids unrelated recall signals", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0007274507829" });

  assert.ok(result);
  assert.equal(result.productName, "PERDUE Fresh Boneless Skinless Chicken Breasts");
  assert.deepEqual(result.ingredients, ["Chicken"]);
  assert.equal(result.externalSignals?.length, 0);
  assert.match(JSON.stringify(result.raw), /"antibiotics":"no"/);
  assert.match(JSON.stringify(result.raw), /different frozen ready-to-eat/);
});

test("batch 11 Butterball roast and Smithfield ham preserve added solution markers", () => {
  const turkey = lookupUsMeatProductResearch({ barcode: "0002265527487" });
  const ham = lookupUsMeatProductResearch({ barcode: "0007080034931" });

  assert.ok(turkey);
  assert.ok(ham);
  assert.ok(turkey.ingredients?.includes("Sodium phosphate"));
  assert.ok(turkey.ingredients?.includes("Caramel color"));
  assert.match(JSON.stringify(turkey.raw), /"addedWater":"yes"/);
  assert.match(JSON.stringify(turkey.raw), /"phosphates":"yes"/);
  assert.ok(ham.ingredients?.includes("High fructose corn syrup"));
  assert.ok(ham.ingredients?.includes("Sodium nitrite"));
  assert.match(JSON.stringify(ham.raw), /"highSodium":"yes"/);
  assert.match(JSON.stringify(ham.raw), /950 mg sodium/);
});

test("batch 11 Johnsonville patties capture water and lactate without nitrite or phosphate", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0007778200470" });

  assert.ok(result);
  assert.ok(result.ingredients?.includes("Water"));
  assert.ok(result.ingredients?.includes("Potassium lactate"));
  assert.ok(result.ingredients?.includes("Sodium diacetate"));
  assert.equal(result.ingredients?.includes("Sodium nitrite"), false);
  assert.equal(result.ingredients?.includes("Sodium phosphate"), false);
  assert.match(JSON.stringify(result.raw), /"sodiumNitrite":"not_listed"/);
});

test("batch 11 veal keeps hidden disclosure while H-E-B lamb keeps no-antibiotics claims", () => {
  const veal = lookupUsMeatProductResearch({ barcode: "0021266950000" });
  const lamb = findUsMeatProductResearch({
    productName: "H-E-B Natural Lamb Shoulder Chop",
    brandName: "H-E-B",
  });

  assert.ok(veal);
  assert.ok(lamb);
  assert.deepEqual(veal.ingredients, []);
  assert.match(JSON.stringify(veal.raw), /"addedWater":"hidden"/);
  assert.match(JSON.stringify(veal.raw), /residue program/);
  assert.deepEqual(lamb.ingredients, ["Lamb"]);
  assert.equal(lamb.markerFacts.antibiotics, "no");
  assert.equal(lamb.markerFacts.growthHormones, "no");
});

test("batch 11 Thomas Farms goat and Skylark liver keep origin and nutrition context", () => {
  const goat = lookupUsMeatProductResearch({ barcode: "00647086621004" });
  const liver = lookupUsMeatProductResearch({ barcode: "0007904122638" });

  assert.ok(goat);
  assert.ok(liver);
  assert.deepEqual(goat.ingredients, ["Goat"]);
  assert.match(JSON.stringify(goat.raw), /Australia/);
  assert.deepEqual(liver.ingredients, ["Beef liver"]);
  assert.match(JSON.stringify(liver.raw), /380% DV vitamin A/);
});

test("batch 12 H-E-B chuck roast and Tyson wings remain simple meat records", () => {
  const chuck = findUsMeatProductResearch({
    productName: "H-E-B Natural Angus Beef Boneless Chuck Roast USDA Choice",
    brandName: "H-E-B",
  });
  const wings = lookupUsMeatProductResearch({ barcode: "0022143400000" });

  assert.ok(chuck);
  assert.ok(wings);
  assert.deepEqual(chuck.ingredients, ["Beef"]);
  assert.equal(chuck.markerFacts.antibiotics, "no");
  assert.equal(chuck.markerFacts.growthHormones, "no");
  assert.deepEqual(wings.ingredients, ["Chicken wings"]);
  assert.match(JSON.stringify(wings.raw), /retainedWater":"hidden/);
  assert.match(JSON.stringify(wings.raw), /different ready-to-eat chicken products/);
});

test("batch 12 Butterball turkey breast and Hormel ham preserve enhanced and cured markers", () => {
  const turkey = lookupUsMeatProductResearch({ barcode: "0022008400000" });
  const ham = lookupUsMeatProductResearch({ barcode: "037600255936" });

  assert.ok(turkey);
  assert.ok(ham);
  assert.ok(turkey.ingredients?.includes("Water"));
  assert.ok(turkey.ingredients?.includes("Spices"));
  assert.match(JSON.stringify(turkey.raw), /up to 8% solution/);
  assert.match(JSON.stringify(turkey.raw), /"addedWater":"yes"/);
  assert.ok(ham.ingredients?.includes("Sodium nitrite"));
  assert.ok(ham.ingredients?.includes("Sodium phosphates"));
  assert.ok(ham.ingredients?.includes("Modified potato starch"));
  assert.match(JSON.stringify(ham.raw), /990 mg/);
  assert.match(JSON.stringify(ham.raw), /"highSodium":"yes"/);
});

test("batch 12 Johnsonville breakfast links keep BHA and propyl gallate visible", () => {
  const result = lookupUsMeatProductResearch({ barcode: "0007778200276" });

  assert.ok(result);
  assert.ok(result.ingredients?.includes("BHA"));
  assert.ok(result.ingredients?.includes("Propyl gallate"));
  assert.ok(result.ingredients?.includes("Beef collagen casing"));
  assert.match(JSON.stringify(result.raw), /reasonably anticipated to be a human carcinogen/);
  assert.match(JSON.stringify(result.raw), /"bha":"yes"/);
  assert.match(JSON.stringify(result.raw), /"propylGallate":"yes"/);
});

test("batch 12 deli meats preserve celery powder, phosphate, carrageenan, and sodium context", () => {
  const boarsHead = lookupUsMeatProductResearch({ barcode: "0004242150026" });
  const oscarMayer = lookupUsMeatProductResearch({ barcode: "0004470003099" });

  assert.ok(boarsHead);
  assert.ok(oscarMayer);
  assert.ok(boarsHead.ingredients?.includes("Cultured celery powder"));
  assert.ok(boarsHead.ingredients?.includes("Sodium phosphate"));
  assert.match(JSON.stringify(boarsHead.raw), /Jarratt recall/);
  assert.ok(oscarMayer.ingredients?.includes("Carrageenan"));
  assert.ok(oscarMayer.ingredients?.includes("Sodium phosphates"));
  assert.ok(oscarMayer.ingredients?.includes("Modified cornstarch"));
  assert.match(JSON.stringify(oscarMayer.raw), /540 mg sodium/);
});

test("batch 12 lamb, tripe, and ground veal keep origin and hidden-disclosure distinctions", () => {
  const lamb = lookupUsMeatProductResearch({ barcode: "00647086412008" });
  const tripe = findUsMeatProductResearch({
    productName: "Rumba Meats Beef Honeycomb Tripe Pancita De Res Panal",
    brandName: "Rumba Meats",
  });
  const veal = lookupUsMeatProductResearch({ barcode: "0001111067439" });

  assert.ok(lamb);
  assert.ok(tripe);
  assert.ok(veal);
  assert.deepEqual(lamb.ingredients, ["Ground lamb"]);
  assert.match(JSON.stringify(lamb.raw), /Australia/);
  assert.match(JSON.stringify(lamb.raw), /"antibiotics":"no"/);
  assert.deepEqual(tripe.ingredients, []);
  assert.equal(tripe.ingredientDisclosure, "not_exposed");
  assert.equal(tripe.markerFacts.addedWater, "hidden");
  assert.deepEqual(veal.ingredients, ["Veal"]);
  assert.match(JSON.stringify(veal.raw), /American veal/);
});

test("batch 13 Target ground beef keeps hidden ingredient disclosure and origin conflict", () => {
  const result = lookupUsMeatProductResearch({ barcode: "085239020180" });

  assert.ok(result);
  assert.equal(result.productName, "Fresh All Natural 85/15 Ground Beef");
  assert.deepEqual(result.ingredients, []);
  assert.match(JSON.stringify(result.raw), /not infer an unseen package ingredient panel/);
  assert.match(JSON.stringify(result.raw), /Made in USA or Imported/);
  assert.match(JSON.stringify(result.raw), /"finelyTexturedBeef":"hidden"/);
});

test("batch 13 GreenWise chicken and Good & Gather turkey keep simple poultry disclosures", () => {
  const chicken = findUsMeatProductResearch({
    productName: "GreenWise Boneless Chicken Breast Portions Raised Without Antibiotics",
    brandName: "GreenWise",
  });
  const turkey = lookupUsMeatProductResearch({ barcode: "085239050248" });

  assert.ok(chicken);
  assert.ok(turkey);
  assert.deepEqual(chicken.ingredients, ["Chicken breast fillets"]);
  assert.equal(chicken.markerFacts.retainedWater, "yes");
  assert.equal(chicken.markerFacts.addedWater, "not_listed");
  assert.deepEqual(turkey.ingredients, ["Turkey", "Rosemary extract"]);
  assert.match(JSON.stringify(turkey.raw), /"antibiotics":"no"/);
  assert.match(JSON.stringify(turkey.raw), /bone pieces and spoilage/);
});

test("batch 13 Target pork chops preserve marinade contradiction and phosphate finding", () => {
  const result = lookupUsMeatProductResearch({ barcode: "213008000006" });

  assert.ok(result);
  assert.ok(result.ingredients?.includes("Pork stock"));
  assert.ok(result.ingredients?.includes("Potassium lactate"));
  assert.ok(result.ingredients?.includes("Sodium phosphate"));
  assert.match(JSON.stringify(result.raw), /unseasoned/);
  assert.match(JSON.stringify(result.raw), /marinated with pork stock/);
  assert.match(JSON.stringify(result.raw), /"phosphates":"yes"/);
});

test("batch 13 Whole Foods 365 uncured meats preserve celery and no-celery distinctions", () => {
  const bacon = findUsMeatProductResearch({
    productName: "365 No Sugar Added Uncured Pork Bacon",
    brandName: "365 by Whole Foods Market",
  });
  const hotDogs = findUsMeatProductResearch({
    productName: "365 Organic Uncured Grass-Fed Beef Hot Dogs",
    brandName: "365 by Whole Foods Market",
  });
  const chickenSausage = findUsMeatProductResearch({
    productName: "365 Savory Breakfast Chicken Sausage",
    brandName: "365 by Whole Foods Market",
  });

  assert.ok(bacon);
  assert.ok(hotDogs);
  assert.ok(chickenSausage);
  assert.equal(bacon.markerFacts.celeryPowder, "not_listed");
  assert.equal(bacon.markerFacts.sodiumNitrite, "not_listed");
  assert.ok(hotDogs.ingredients.includes("Celery powder"));
  assert.equal(hotDogs.markerFacts.celeryPowder, "yes");
  assert.equal(hotDogs.markerFacts.organic, "yes");
  assert.deepEqual(chickenSausage.ingredients, [
    "Chicken",
    "Water",
    "Sea salt",
    "Spices",
    "Sage",
    "Maple sugar",
  ]);
});

test("batch 13 Aldi bratwurst and Target chicken sausage preserve serious processed-meat markers", () => {
  const bratwurst = findUsMeatProductResearch({
    productName: "ALDI Original Bratwurst Party Pack",
    brandName: "ALDI private-label fresh sausage",
  });
  const chickenSausage = lookupUsMeatProductResearch({ barcode: "196761492007" });

  assert.ok(bratwurst);
  assert.ok(chickenSausage);
  assert.ok(bratwurst.ingredients.includes("BHA"));
  assert.ok(bratwurst.ingredients.includes("Propyl gallate"));
  assert.equal(bratwurst.markerFacts.bha, "yes");
  assert.match(JSON.stringify(bratwurst.structuredReviewNotes), /12 links while the descriptive copy refers to 10 links/);
  assert.ok(chickenSausage.ingredients?.includes("Cultured celery juice powder"));
  assert.ok(chickenSausage.ingredients?.includes("Beef collagen casing"));
  assert.match(JSON.stringify(chickenSausage.raw), /750 mg sodium/);
  assert.match(JSON.stringify(chickenSausage.raw), /"highSodium":"yes"/);
});

test("batch 13 Publix sweet ham keeps 28 percent added-ingredients disclosure", () => {
  const ham = findUsMeatProductResearch({
    productName: "Publix Deli Cooked Sweet Ham Presliced",
    brandName: "Publix Deli",
  });

  assert.ok(ham);
  assert.ok(ham.ingredients.includes("Sodium phosphate"));
  assert.ok(ham.ingredients.includes("Sodium nitrite"));
  assert.ok(ham.ingredients.includes("Fructose"));
  assert.equal(ham.markerFacts.addedWater, "yes");
  assert.match(JSON.stringify(ham.productSpecificChecks), /28%/);
  assert.match(JSON.stringify(ham.structuredReviewNotes), /more than one-quarter/);
});

test("batch 14 Target uncured bacon preserves celery powder without synthetic nitrite", () => {
  const result = lookupUsMeatProductResearch({ barcode: "085239186817" });

  assert.ok(result);
  assert.ok(result.ingredients?.includes("Cultured celery powder"));
  assert.ok(result.ingredients?.includes("Fermented rice extract powder"));
  assert.equal(result.ingredients?.includes("Sodium nitrite"), false);
  assert.match(JSON.stringify(result.raw), /"celeryPowder":"yes"/);
  assert.match(JSON.stringify(result.raw), /"sodiumNitrite":"not_listed"/);
});

test("batch 14 chicken thigh records separate clean labels from hidden ALDI disclosure", () => {
  const greenWise = findUsMeatProductResearch({
    productName: "GreenWise Boneless Skinless Chicken Thighs",
    brandName: "GreenWise",
  });
  const wholeFoods = findUsMeatProductResearch({
    productName: "365 Organic Boneless Skinless Chicken Thighs",
    brandName: "365 by Whole Foods Market",
  });
  const neverAny = findUsMeatProductResearch({
    productName: "Never Any Fresh Antibiotic Free Boneless Skinless Chicken Breasts",
    brandName: "Never Any!",
  });

  assert.ok(greenWise);
  assert.ok(wholeFoods);
  assert.ok(neverAny);
  assert.deepEqual(greenWise.ingredients, ["Chicken thighs"]);
  assert.equal(greenWise.markerFacts.retainedWater, "hidden");
  assert.deepEqual(wholeFoods.ingredients, ["Boneless skinless chicken thighs"]);
  assert.equal(wholeFoods.markerFacts.organic, "yes");
  assert.deepEqual(neverAny.ingredients, []);
  assert.equal(neverAny.ingredientDisclosure, "not_exposed");
  assert.equal(neverAny.markerFacts.addedWater, "hidden");
});

test("batch 14 deli turkey records preserve broth, phosphate, celery, and nitrite differences", () => {
  const targetTurkey = lookupUsMeatProductResearch({ barcode: "085239046586" });
  const publixTurkey = findUsMeatProductResearch({
    productName: "Publix Smoked Honey Turkey Breast Thin Sliced",
    brandName: "Publix",
  });

  assert.ok(targetTurkey);
  assert.ok(publixTurkey);
  assert.ok(targetTurkey.ingredients?.includes("Turkey broth"));
  assert.ok(targetTurkey.ingredients?.includes("Carrageenan"));
  assert.ok(targetTurkey.ingredients?.includes("Celery powder"));
  assert.match(JSON.stringify(targetTurkey.raw), /"highSodium":"yes"/);
  assert.ok(publixTurkey.ingredients.includes("Sodium nitrite"));
  assert.ok(publixTurkey.ingredients.includes("Modified food starch"));
  assert.equal(publixTurkey.markerFacts.sodiumNitrite, "yes");
  assert.equal(publixTurkey.markerFacts.highSodium, "no");
});

test("batch 14 Whole Foods ground beef and Target ham preserve simple versus processed markers", () => {
  const beef = findUsMeatProductResearch({
    productName: "365 Ground Beef 90% Lean 10% Fat",
    brandName: "365 by Whole Foods Market",
  });
  const ham = lookupUsMeatProductResearch({ barcode: "085239287897" });

  assert.ok(beef);
  assert.ok(ham);
  assert.deepEqual(beef.ingredients, ["Ground beef"]);
  assert.equal(beef.markerFacts.finelyTexturedBeef, "hidden");
  assert.equal(beef.markerFacts.addedWater, "not_listed");
  assert.ok(ham.ingredients?.includes("Sodium phosphates"));
  assert.ok(ham.ingredients?.includes("Cultured celery juice"));
  assert.match(JSON.stringify(ham.raw), /820 mg sodium/);
  assert.match(JSON.stringify(ham.raw), /Made in USA or Imported/);
});

test("batch 14 Parkview sausages preserve mechanical separation and close recall context", () => {
  const cocktail = findUsMeatProductResearch({
    productName: "Parkview Cocktail Sausages 14 oz",
    brandName: "Parkview",
  });
  const kielbasa = findUsMeatProductResearch({
    productName: "Parkview Polska Kielbasa 14 oz",
    brandName: "Parkview",
  });

  assert.ok(cocktail);
  assert.ok(kielbasa);
  assert.ok(cocktail.ingredients.includes("Mechanically separated turkey"));
  assert.ok(cocktail.ingredients.includes("Sodium nitrite"));
  assert.equal(cocktail.markerFacts.mechanicallySeparated, "yes");
  assert.match(JSON.stringify(cocktail.structuredReviewNotes), /pork and chicken/);
  assert.ok(kielbasa.ingredients.includes("Corn syrup"));
  assert.ok(kielbasa.ingredients.includes("Sodium phosphate"));
  assert.ok(kielbasa.ingredients.includes("Sodium nitrite"));
  assert.match(JSON.stringify(kielbasa.structuredReviewNotes), /different 13-oz turkey product/);
});

test("batch 15 Target top sirloin keeps hidden ingredient disclosure and origin conflict", () => {
  const result = lookupUsMeatProductResearch({ barcode: "214470000006" });

  assert.ok(result);
  assert.equal(result.productName, "Good & Gather Fresh Beef Top Sirloin Boneless Steak Raw");
  assert.deepEqual(result.ingredients, []);
  assert.match(JSON.stringify(result.raw), /unseen ingredient data is not inferred/);
  assert.match(JSON.stringify(result.raw), /Australia/);
  assert.match(JSON.stringify(result.raw), /Made in the USA/);
});

test("batch 15 Prairie Fresh pork tenderloin preserves 16 percent solution and sweetener system", () => {
  const result = findUsMeatProductResearch({
    productName: "Prairie Fresh Honey Sriracha Pork Tenderloin",
    brandName: "Prairie Fresh",
  });

  assert.ok(result);
  assert.ok(result.ingredients.includes("Sucralose"));
  assert.ok(result.ingredients.includes("Maltodextrin"));
  assert.ok(result.ingredients.includes("Xanthan gum"));
  assert.equal(result.markerFacts.addedWater, "yes");
  assert.equal(result.markerFacts.phosphates, "not_listed");
  assert.match(JSON.stringify(result.productSpecificChecks), /up to 16%/);
});

test("batch 15 deli chicken and turkey records preserve water, starch, celery, and sodium distinctions", () => {
  const chicken = findUsMeatProductResearch({
    productName: "365 Sliced Oven Roasted Chicken",
    brandName: "365 by Whole Foods Market",
  });
  const turkey = findUsMeatProductResearch({
    productName: "Good & Gather All Natural Oven Roasted Turkey Breast",
    brandName: "Good & Gather",
  });

  assert.ok(chicken);
  assert.ok(turkey);
  assert.ok(chicken.ingredients.includes("Potato starch"));
  assert.equal(chicken.markerFacts.highSodium, "yes");
  assert.equal(chicken.markerFacts.phosphates, "not_listed");
  assert.ok(turkey.ingredients.includes("Turkey broth"));
  assert.ok(turkey.ingredients.includes("Celery powder"));
  assert.equal(turkey.markerFacts.celeryPowder, "yes");
  assert.equal(turkey.markerFacts.highSodium, "no");
});

test("batch 15 Publix ham and simple ground turkey records keep processed versus clean markers", () => {
  const ham = findUsMeatProductResearch({
    productName: "Publix Deli Tavern Ham Presliced",
    brandName: "Publix Deli",
  });
  const darkTurkey = findUsMeatProductResearch({
    productName: "365 Dark Ground Turkey",
    brandName: "365 by Whole Foods Market",
  });
  const publixTurkey = findUsMeatProductResearch({
    productName: "Publix 99% Fat Free Ground Turkey Breast",
    brandName: "Publix",
  });

  assert.ok(ham);
  assert.ok(darkTurkey);
  assert.ok(publixTurkey);
  assert.ok(ham.ingredients.includes("Sodium phosphate"));
  assert.ok(ham.ingredients.includes("Sodium nitrite"));
  assert.equal(ham.markerFacts.highSodium, "yes");
  assert.deepEqual(darkTurkey.ingredients, ["Turkey", "Rosemary extract"]);
  assert.equal(darkTurkey.markerFacts.addedWater, "not_listed");
  assert.deepEqual(publixTurkey.ingredients, ["Turkey breast", "Rosemary extract"]);
  assert.equal(publixTurkey.countryOfOrigin, "United States");
});

test("batch 15 ALDI meatballs, lamb shank, and JENNIE-O tenderloins preserve heavy and hidden markers", () => {
  const meatballs = findUsMeatProductResearch({
    productName: "ALDI Mild Italian Style Meatballs 16 oz",
    brandName: "Not A Branded Item / ALDI",
  });
  const lamb = findUsMeatProductResearch({
    productName: "Never Any Lamb Shank",
    brandName: "Never Any!",
  });
  const turkeyTenderloins = findUsMeatProductResearch({
    productName: "JENNIE-O Turkey Breast Tenderloins All Natural",
    brandName: "JENNIE-O",
  });

  assert.ok(meatballs);
  assert.ok(lamb);
  assert.ok(turkeyTenderloins);
  assert.ok(meatballs.ingredients.includes("BHA"));
  assert.ok(meatballs.ingredients.includes("Propyl gallate"));
  assert.ok(meatballs.ingredients.includes("Potassium sorbate"));
  assert.equal(meatballs.markerFacts.bha, "yes");
  assert.equal(meatballs.markerFacts.propylGallate, "yes");
  assert.deepEqual(lamb.ingredients, []);
  assert.equal(lamb.ingredientDisclosure, "not_exposed");
  assert.equal(lamb.markerFacts.addedWater, "hidden");
  assert.ok(turkeyTenderloins.ingredients.includes("Baking soda"));
  assert.ok(turkeyTenderloins.ingredients.includes("Turbinado sugar"));
  assert.equal(turkeyTenderloins.markerFacts.addedWater, "yes");
  assert.match(JSON.stringify(turkeyTenderloins.structuredReviewNotes), /solution percentage/);
});

test("batch 16 Target chuck roast and sausage barcode records preserve hidden versus processed findings", () => {
  const roast = lookupUsMeatProductResearch({ barcode: "214471000005" });
  const sausage = lookupUsMeatProductResearch({ barcode: "085239010204" });

  assert.ok(roast);
  assert.ok(sausage);
  assert.equal(roast.productName, "Good & Gather Fresh Beef Boneless Chuck Roast Raw");
  assert.deepEqual(roast.ingredients, []);
  assert.match(JSON.stringify(roast.raw), /Australia/);
  assert.match(JSON.stringify(roast.raw), /Made in the USA/);
  assert.ok(sausage.ingredients?.includes("Corn syrup"));
  assert.ok(sausage.ingredients?.includes("Dextrose"));
  assert.match(JSON.stringify(sausage.raw), /Breakfast sausage is processed meat/);
});

test("batch 16 Whole Foods deli meats preserve celery, water, starch, and sodium markers", () => {
  const ham = findUsMeatProductResearch({
    productName: "365 Black Forest Uncured Ham Slices Value Pack",
    brandName: "365 by Whole Foods Market",
  });
  const turkey = findUsMeatProductResearch({
    productName: "365 Oven Roasted Turkey Breast Deli Slices",
    brandName: "365 by Whole Foods Market",
  });

  assert.ok(ham);
  assert.ok(turkey);
  assert.ok(ham.ingredients.includes("Cultured celery powder"));
  assert.equal(ham.markerFacts.celeryPowder, "yes");
  assert.equal(ham.markerFacts.sodiumNitrite, "not_listed");
  assert.equal(ham.markerFacts.highSodium, "yes");
  assert.ok(turkey.ingredients.includes("Potato starch"));
  assert.equal(turkey.markerFacts.addedWater, "yes");
  assert.equal(turkey.markerFacts.highSodium, "yes");
});

test("batch 16 bison records separate plain ground bison from ancestral organ blend", () => {
  const plainBison = findUsMeatProductResearch({
    productName: "Great Range 90 10 Ground Bison Brick",
    brandName: "Great Range",
  });
  const ancestralBlend = findUsMeatProductResearch({
    productName: "Force of Nature Grass Fed Ground Bison with Liver and Heart",
    brandName: "Force of Nature Meats",
  });

  assert.ok(plainBison);
  assert.ok(ancestralBlend);
  assert.deepEqual(plainBison.ingredients, ["Ground bison"]);
  assert.equal(plainBison.markerFacts.grassFed, "hidden");
  assert.deepEqual(ancestralBlend.ingredients, ["Bison", "Bison liver", "Bison heart"]);
  assert.equal(ancestralBlend.markerFacts.grassFed, "yes");
  assert.equal(ancestralBlend.markerFacts.antibiotics, "no");
  assert.match(JSON.stringify(ancestralBlend.structuredReviewNotes), /8%/);
});

test("batch 16 processed hot dogs and Eckrich sausage keep celery, MSG, phosphate, and mechanical-separation markers", () => {
  const hotDogs = findUsMeatProductResearch({
    productName: "True Story Organic Grass Fed Beef Hot Dogs",
    brandName: "True Story",
  });
  const eckrich = findUsMeatProductResearch({
    productName: "Eckrich Jalapeno and Cheddar Smoked Sausage Links",
    brandName: "Eckrich",
  });

  assert.ok(hotDogs);
  assert.ok(eckrich);
  assert.ok(hotDogs.ingredients.includes("Celery powder"));
  assert.equal(hotDogs.markerFacts.organic, "yes");
  assert.equal(hotDogs.markerFacts.highSodium, "yes");
  assert.ok(eckrich.ingredients.includes("Mechanically separated chicken"));
  assert.ok(eckrich.ingredients.includes("MSG"));
  assert.ok(eckrich.ingredients.includes("Sodium nitrite"));
  assert.equal(eckrich.markerFacts.mechanicallySeparated, "yes");
  assert.equal(eckrich.markerFacts.phosphates, "yes");
});

test("batch 16 GreenWise pork tenderloin and chicken drumsticks keep glaze versus simple-poultry distinctions", () => {
  const pork = findUsMeatProductResearch({
    productName: "GreenWise Maple Chipotle Pork Tenderloin",
    brandName: "GreenWise / Publix",
  });
  const chicken = findUsMeatProductResearch({
    productName: "GreenWise Chicken Drumsticks Raised Without Antibiotics",
    brandName: "GreenWise / Publix",
  });

  assert.ok(pork);
  assert.ok(chicken);
  assert.ok(pork.ingredients.includes("Maltodextrin"));
  assert.ok(pork.ingredients.includes("Modified cornstarch"));
  assert.equal(pork.markerFacts.addedWater, "not_listed");
  assert.deepEqual(chicken.ingredients, ["Chicken drumsticks"]);
  assert.equal(chicken.markerFacts.antibiotics, "no");
  assert.equal(chicken.markerFacts.retainedWater, "hidden");
});

test("batch 17 Target sirloin strips preserve barcode match, hidden disclosure, and origin conflict", () => {
  const result = lookupUsMeatProductResearch({ barcode: "191907884548" });

  assert.ok(result);
  assert.equal(
    result.productName,
    "Good & Gather Fresh Beef Sirloin Boneless Steak Strips Raw",
  );
  assert.deepEqual(result.ingredients, []);
  assert.match(JSON.stringify(result.raw), /Australia/);
  assert.match(JSON.stringify(result.raw), /Made in the USA/);
  assert.match(JSON.stringify(result.raw), /active August 2026 recall/);
  assert.equal(result.externalSignals?.length, 0);
});

test("batch 17 GreenWise tenderloins and Swift goat stay simple while preserving hidden raising fields", () => {
  const chicken = findUsMeatProductResearch({
    productName: "GreenWise Chicken Breast Tenderloins Raised Without Antibiotics",
    brandName: "GreenWise / Publix",
  });
  const goat = findUsMeatProductResearch({
    productName: "Swift Bone-In Goat Cubes",
    brandName: "Swift Meats",
  });

  assert.ok(chicken);
  assert.ok(goat);
  assert.deepEqual(chicken.ingredients, ["Chicken"]);
  assert.equal(chicken.markerFacts.antibiotics, "no");
  assert.equal(chicken.markerFacts.retainedWater, "hidden");
  assert.deepEqual(goat.ingredients, ["Goat"]);
  assert.equal(goat.countryOfOrigin, "Australia");
  assert.equal(goat.markerFacts.addedWater, "no");
  assert.equal(goat.markerFacts.antibiotics, "hidden");
});

test("batch 17 raw pork and veal records keep product identity separate from hidden ingredient panels", () => {
  const pork = findUsMeatProductResearch({
    productName: "Never Any 80/20 Ground Pork",
    brandName: "Never Any!",
  });
  const veal = findUsMeatProductResearch({
    productName: "Publix Veal Shoulder Chop Round Bone",
    brandName: "Publix",
  });

  assert.ok(pork);
  assert.ok(veal);
  assert.deepEqual(pork.ingredients, []);
  assert.equal(pork.ingredientDisclosure, "not_exposed");
  assert.equal(pork.markerFacts.antibiotics, "no");
  assert.equal(pork.markerFacts.addedWater, "hidden");
  assert.deepEqual(veal.ingredients, []);
  assert.equal(veal.ingredientDisclosure, "not_exposed");
  assert.equal(veal.markerFacts.phosphates, "hidden");
});

test("batch 17 deli ham and roast beef records preserve phosphate, celery, data-error, and sodium distinctions", () => {
  const ham = findUsMeatProductResearch({
    productName: "Good & Gather Uncured Honey Ham Ultra Thin Deli Slices",
    brandName: "Good & Gather",
  });
  const targetRoastBeef = findUsMeatProductResearch({
    productName: "Good & Gather Ultra-Thin Roast Beef Deli Slices",
    brandName: "Good & Gather",
  });
  const applegate = findUsMeatProductResearch({
    productName: "Applegate Organic Roast Beef Sliced 5 oz",
    brandName: "Applegate",
  });

  assert.ok(ham);
  assert.ok(targetRoastBeef);
  assert.ok(applegate);
  assert.ok(ham.ingredients.includes("Sodium phosphates"));
  assert.ok(ham.ingredients.includes("Celery powder"));
  assert.equal(ham.markerFacts.highSodium, "yes");
  assert.ok(targetRoastBeef.ingredients.includes("Maltodextrin"));
  assert.equal(targetRoastBeef.markerFacts.phosphates, "yes");
  assert.equal(targetRoastBeef.markerFacts.highSodium, "context_only");
  assert.match(JSON.stringify(targetRoastBeef.structuredReviewNotes), /510000mg/);
  assert.ok(applegate.ingredients.includes("Organic grass-fed beef"));
  assert.equal(applegate.markerFacts.organic, "yes");
  assert.equal(applegate.markerFacts.grassFed, "yes");
});

test("batch 17 Whole Foods roast beef and Appleton Farms sausage keep processed-meat additive details", () => {
  const wholeFoodsRoastBeef = findUsMeatProductResearch({
    productName: "365 Sliced Roast Beef",
    brandName: "365 by Whole Foods Market",
  });
  const sausage = findUsMeatProductResearch({
    productName: "Appleton Farms Italian Sausage",
    brandName: "Appleton Farms",
  });

  assert.ok(wholeFoodsRoastBeef);
  assert.ok(sausage);
  assert.ok(wholeFoodsRoastBeef.ingredients.includes("Cane sugar"));
  assert.equal(wholeFoodsRoastBeef.markerFacts.addedWater, "yes");
  assert.equal(wholeFoodsRoastBeef.markerFacts.phosphates, "not_listed");
  assert.ok(sausage.ingredients.includes("Dextrose"));
  assert.equal(sausage.markerFacts.addedWater, "yes");
  assert.equal(sausage.markerFacts.sodiumNitrite, "not_listed");
  assert.match(JSON.stringify(sausage.structuredReviewNotes), /Impero Foods/);
});

test("batch 18 mixed meatloaf records preserve exact simple blend versus hidden disclosure", () => {
  const wahlburgers = findUsMeatProductResearch({
    productName: "Wahlburgers Meatball Meatloaf Blend",
    brandName: "Wahlburgers",
  });
  const publix = findUsMeatProductResearch({
    productName: "Publix Ground Meatloaf Beef and Pork USDA Inspected",
    brandName: "Publix",
  });

  assert.ok(wahlburgers);
  assert.ok(publix);
  assert.deepEqual(wahlburgers.ingredients, ["Beef", "Pork", "Veal"]);
  assert.equal(wahlburgers.markerFacts.addedWater, "no");
  assert.deepEqual(publix.ingredients, []);
  assert.equal(publix.ingredientDisclosure, "not_exposed");
  assert.equal(publix.markerFacts.addedWater, "hidden");
  assert.match(JSON.stringify(publix.structuredReviewNotes), /Power Plate Meals/);
});

test("batch 18 organ meat and lamb records keep simple liver separate from hidden lamb disclosure", () => {
  const liver = lookupUsMeatProductResearch({ barcode: "00079041206375" });
  const lamb = findUsMeatProductResearch({
    productName: "Never Any Fresh Ground Lamb",
    brandName: "Never Any!",
  });

  assert.ok(liver);
  assert.ok(lamb);
  assert.deepEqual(liver.ingredients, ["Calf liver"]);
  assert.match(JSON.stringify(liver.raw), /380% Daily Value/);
  assert.deepEqual(lamb.ingredients, []);
  assert.equal(lamb.ingredientDisclosure, "not_exposed");
  assert.equal(lamb.markerFacts.antibiotics, "context_only");
  assert.equal(lamb.markerFacts.phosphates, "hidden");
});

test("batch 18 turkey deli and bacon UPCs preserve phosphate, celery, and sodium distinctions", () => {
  const turkey = lookupUsMeatProductResearch({ barcode: "041498253301" });
  const bacon = lookupUsMeatProductResearch({ barcode: "099482539788" });
  const smokedTurkey = lookupUsMeatProductResearch({ barcode: "00041415231801" });

  assert.ok(turkey);
  assert.ok(bacon);
  assert.ok(smokedTurkey);
  assert.ok(turkey.ingredients?.includes("Sodium phosphate"));
  assert.ok(turkey.ingredients?.includes("Carrageenan"));
  assert.match(JSON.stringify(turkey.raw), /"phosphates":"yes"/);
  assert.ok(bacon.ingredients?.includes("Cultured celery powder"));
  assert.match(JSON.stringify(bacon.raw), /"sodiumNitrite":"not_listed"/);
  assert.match(JSON.stringify(bacon.raw), /"highSodium":"no"/);
  assert.ok(smokedTurkey.ingredients?.includes("Native potato starch"));
  assert.match(JSON.stringify(smokedTurkey.raw), /"highSodium":"no"/);
});

test("batch 18 Never Any apple chicken sausage preserves secondary-source and high-sodium warnings", () => {
  const result = lookupUsMeatProductResearch({ barcode: "4099100177442" });

  assert.ok(result);
  assert.ok(result.ingredients?.includes("Celery juice powder"));
  assert.ok(result.ingredients?.includes("Beef collagen casing"));
  assert.match(JSON.stringify(result.raw), /"ingredientDisclosure":"inconsistent"/);
  assert.match(JSON.stringify(result.raw), /"highSodium":"yes"/);
  assert.match(JSON.stringify(result.dataQualityWarnings), /secondary current UPC data/);
  assert.match(JSON.stringify(result.raw), /Two secondary UPC records/);
});

test("batch 18 Lunch Mate hard salami keeps nitrite, BHA, BHT, and reassessment context visible", () => {
  const salami = findUsMeatProductResearch({
    productName: "Lunch Mate Hard Salami 8 oz",
    brandName: "Lunch Mate",
  });

  assert.ok(salami);
  assert.ok(salami.ingredients.includes("Sodium nitrite"));
  assert.ok(salami.ingredients.includes("BHA"));
  assert.ok(salami.ingredients.includes("BHT"));
  assert.equal(salami.markerFacts.sodiumNitrite, "yes");
  assert.equal(salami.markerFacts.bha, "yes");
  assert.equal(salami.markerFacts.highSodium, "yes");
  assert.match(JSON.stringify(salami.structuredReviewNotes), /BHA reassessment/);
});

test("batch 19 closes the 181-190 gap with barcode and name fallback meat markers", () => {
  const steak = lookupUsMeatProductResearch({ barcode: "214468000001" });
  const sausageLinks = lookupUsMeatProductResearch({ barcode: "4099100011494" });
  const andouille = lookupUsMeatProductResearch({ barcode: "085239083222" });
  const roastBeef = lookupUsMeatProductResearch({ barcode: "041415372801" });
  const smokedTurkey = findUsMeatProductResearch({
    productName: "365 Sliced Smoked Turkey",
    brandName: "365 by Whole Foods Market",
  });
  const ancestralBlend = findUsMeatProductResearch({
    productName: "Force of Nature Ground Beef Ancestral Blend",
    brandName: "Force of Nature Meats",
  });

  assert.ok(steak);
  assert.ok(sausageLinks);
  assert.ok(andouille);
  assert.ok(roastBeef);
  assert.ok(smokedTurkey);
  assert.ok(ancestralBlend);
  assert.match(JSON.stringify(steak.raw), /"ingredientDisclosure":"not_exposed"/);
  assert.ok(sausageLinks.ingredients?.includes("Mechanically separated turkey"));
  assert.ok(sausageLinks.ingredients?.includes("BHA"));
  assert.match(JSON.stringify(sausageLinks.raw), /"bha":"yes"/);
  assert.equal(andouille.productName, "Good & Gather Andouille Chicken Sausage");
  assert.match(JSON.stringify(andouille.raw), /"highSodium":"yes"/);
  assert.ok(roastBeef.ingredients?.includes("Sodium phosphate"));
  assert.match(JSON.stringify(roastBeef.raw), /"phosphates":"yes"/);
  assert.equal(smokedTurkey.markerFacts.celeryPowder, "yes");
  assert.equal(smokedTurkey.markerFacts.highSodium, "yes");
  assert.ok(ancestralBlend.ingredients.includes("Beef liver"));
  assert.equal(ancestralBlend.markerFacts.grassFed, "yes");
});

test("batch 20 Target beef barcodes resolve hidden disclosure and high-sodium seasoned steak records", () => {
  const steakForSandwiches = lookupUsMeatProductResearch({ barcode: "211299000002" });
  const peppercornSteak = lookupUsMeatProductResearch({ barcode: "198420651022" });

  assert.ok(steakForSandwiches);
  assert.ok(peppercornSteak);
  assert.equal(
    steakForSandwiches.productName,
    "Fresh USDA Choice Angus Beef Steak for Sandwiches",
  );
  assert.deepEqual(steakForSandwiches.ingredients, []);
  assert.match(JSON.stringify(steakForSandwiches.raw), /"ingredientDisclosure":"not_exposed"/);
  assert.equal(
    peppercornSteak.productName,
    "Good & Gather Cracked Peppercorn Crusted Beef Sirloin Petite Steaks",
  );
  assert.ok(peppercornSteak.ingredients?.includes("Black pepper"));
  assert.match(JSON.stringify(peppercornSteak.raw), /"highSodium":"yes"/);
});

test("batch 20 simple veal and wagyu records stay one-ingredient when disclosed", () => {
  const veal = findUsMeatProductResearch({
    productName: "Marcho Farms Ground Veal Premium",
    brandName: "Marcho Farms",
  });
  const wagyu = findUsMeatProductResearch({
    productName: "HeartBrand Akaushi Ground Beef",
    brandName: "HeartBrand",
  });

  assert.ok(veal);
  assert.ok(wagyu);
  assert.deepEqual(veal.ingredients, ["Veal"]);
  assert.equal(veal.markerFacts.addedWater, "no");
  assert.equal(veal.markerFacts.phosphates, "no");
  assert.deepEqual(wagyu.ingredients, ["Beef"]);
  assert.equal(wagyu.markerFacts.addedWater, "no");
  assert.equal(wagyu.markerFacts.sodiumNitrite, "not_listed");
});

test("batch 20 Force of Nature game meat keeps grass-fed claims and hidden ingredient distinction", () => {
  const venison = findUsMeatProductResearch({
    productName: "Force of Nature Grass-Fed Ground Venison Ancestral Blend",
    brandName: "Force of Nature Meats",
  });
  const elk = findUsMeatProductResearch({
    productName: "Force of Nature Grass-Fed Ground Elk",
    brandName: "Force of Nature Meats",
  });

  assert.ok(venison);
  assert.ok(elk);
  assert.ok(venison.ingredients.includes("Venison liver"));
  assert.ok(venison.ingredients.includes("Grass-fed beef"));
  assert.equal(venison.markerFacts.grassFed, "yes");
  assert.equal(venison.markerFacts.antibiotics, "no");
  assert.deepEqual(elk.ingredients, []);
  assert.equal(elk.ingredientDisclosure, "not_exposed");
  assert.equal(elk.markerFacts.grassFed, "yes");
  assert.equal(elk.markerFacts.addedWater, "hidden");
});

test("batch 20 turkey products separate plain tenderloin from added-solution tenderloin", () => {
  const greenwise = findUsMeatProductResearch({
    productName: "GreenWise Fresh Turkey Tenderloin USDA Premium",
    brandName: "GreenWise",
  });
  const jennieO = findUsMeatProductResearch({
    productName: "JENNIE-O Applewood Turkey Breast Tenderloins",
    brandName: "JENNIE-O",
  });

  assert.ok(greenwise);
  assert.ok(jennieO);
  assert.deepEqual(greenwise.ingredients, ["Turkey"]);
  assert.equal(greenwise.markerFacts.antibiotics, "no");
  assert.equal(greenwise.markerFacts.growthHormones, "context_only");
  assert.ok(jennieO.ingredients.includes("Water"));
  assert.ok(jennieO.ingredients.includes("Baking soda"));
  assert.equal(jennieO.markerFacts.addedWater, "yes");
  assert.match(JSON.stringify(jennieO.productSpecificChecks), /up to 30%/);
});

test("batch 20 sausage records preserve added water, sweeteners, and preservative markers", () => {
  const publix = findUsMeatProductResearch({
    productName: "Publix Mild Pork Italian Sausage",
    brandName: "Publix",
  });
  const johnsonville = findUsMeatProductResearch({
    productName: "Johnsonville Maple Syrup Breakfast Sausage Links",
    brandName: "Johnsonville",
  });

  assert.ok(publix);
  assert.ok(johnsonville);
  assert.ok(publix.ingredients.includes("Dextrose"));
  assert.ok(publix.ingredients.includes("Sugar"));
  assert.equal(publix.markerFacts.addedWater, "yes");
  assert.equal(publix.markerFacts.sodiumNitrite, "not_listed");
  assert.ok(johnsonville.ingredients.includes("BHA"));
  assert.ok(johnsonville.ingredients.includes("Propyl gallate"));
  assert.equal(johnsonville.markerFacts.bha, "yes");
  assert.equal(johnsonville.markerFacts.propylGallate, "yes");
  assert.equal(johnsonville.markerFacts.highSodium, "no");
});

test("batch 21 name fallback keeps hidden disclosures and serious processed-meat markers", () => {
  const organicBeef = findUsMeatProductResearch({
    productName: "Good and Gather Organic Grassfed Ground Beef",
    brandName: "Good & Gather",
  });
  const meatballs = findUsMeatProductResearch({
    productName: "Publix Italian Style Pork Meatballs",
    brandName: "Publix",
  });
  const turkeyFranks = findUsMeatProductResearch({
    productName: "Parkview Turkey Franks",
    brandName: "Parkview",
  });
  const bacon = findUsMeatProductResearch({
    productName: "Appleton Farms Premium Bacon",
    brandName: "Appleton Farms",
  });
  const chickenSausage = findUsMeatProductResearch({
    productName: "GreenWise Italian Provolone Smoked Chicken Sausage",
    brandName: "GreenWise",
  });

  assert.ok(organicBeef);
  assert.ok(meatballs);
  assert.ok(turkeyFranks);
  assert.ok(bacon);
  assert.ok(chickenSausage);
  assert.equal(organicBeef.ingredientDisclosure, "not_exposed");
  assert.equal(organicBeef.markerFacts.organic, "yes");
  assert.equal(organicBeef.markerFacts.grassFed, "yes");
  assert.ok(meatballs.ingredients.includes("Disodium phosphate"));
  assert.equal(meatballs.markerFacts.phosphates, "yes");
  assert.ok(turkeyFranks.ingredients.includes("Mechanically separated turkey"));
  assert.equal(turkeyFranks.markerFacts.sodiumNitrite, "yes");
  assert.equal(bacon.markerFacts.addedWater, "yes");
  assert.equal(bacon.markerFacts.sodiumNitrite, "yes");
  assert.equal(chickenSausage.markerFacts.highSodium, "yes");
});

test("batch 22 adds organ meats and specialty meat markers without double-counting existing sausage", () => {
  const veal = lookupUsMeatProductResearch({ barcode: "0027272250000" });
  const mealMart = lookupUsMeatProductResearch({ barcode: "0051328995899" });
  const organicChicken = lookupUsMeatProductResearch({ barcode: "214491000009" });
  const butterball = findUsMeatProductResearch({
    productName: "Butterball Hardwood Smoked Turkey Sausage",
    brandName: "Butterball",
  });
  const porkTenderloin = findUsMeatProductResearch({
    productName: "Target Garlic and Herb Seasoned Pork Tenderloin",
    brandName: "Good & Gather",
  });
  const gizzards = findUsMeatProductResearch({
    productName: "Publix Chicken Gizzards",
    brandName: "Publix",
  });

  assert.ok(veal);
  assert.ok(mealMart);
  assert.ok(organicChicken);
  assert.ok(butterball);
  assert.ok(porkTenderloin);
  assert.ok(gizzards);
  assert.deepEqual(veal.ingredients, ["Veal"]);
  assert.ok(mealMart.ingredients?.includes("Sodium phosphate"));
  assert.match(JSON.stringify(mealMart.raw), /"phosphates":"yes"/);
  assert.match(JSON.stringify(organicChicken.raw), /"organic":"yes"/);
  assert.ok(butterball.ingredients.includes("Mechanically separated turkey"));
  assert.equal(butterball.markerFacts.sodiumNitrite, "yes");
  assert.equal(porkTenderloin.markerFacts.phosphates, "yes");
  assert.equal(gizzards.ingredientDisclosure, "not_exposed");
  assert.match(JSON.stringify(gizzards.productSpecificChecks), /chicken gizzards/);
});

test("product-name fallback can find meat records when barcode is unavailable", () => {
  const record = findUsMeatProductResearch({
    productName: "Simple Truth Organic Grass Fed 85/15 Ground Beef",
    brandName: "Simple Truth",
  });

  assert.ok(record);
  assert.equal(record.id, "simple_truth_organic_grass_fed_85_15_ground_beef_1_lb");
  assert.equal(record.markerFacts.grassFed, "yes");
  assert.equal(record.markerFacts.organic, "yes");
});

test("local meat research can fill missing external ingredients without changing provider", () => {
  const enriched = enrichWithUsMeatProductResearch({
    found: true,
    provider: "open_food_facts",
    barcode: "0004450034171",
    productName: "Hillshire Farm Smoked Sausage",
    brandName: "Hillshire Farm",
    productCategory: "Smoked sausage",
    ingredientsText: "",
    ingredients: [],
    dataQualityWarnings: ["Open Food Facts record had missing ingredients."],
    raw: { source: "open_food_facts" },
  });

  assert.equal(enriched.provider, "open_food_facts");
  assert.ok(enriched.ingredients?.includes("Mechanically separated turkey"));
  assert.ok(enriched.ingredients?.includes("MSG"));
  assert.ok(enriched.ingredientsText?.includes("Sodium nitrite"));
  assert.equal(signalType(enriched.externalSignals?.[0]), "historical_recall");
  assert.ok(
    enriched.dataQualityWarnings.some((warning) =>
      warning.includes("local US meat research"),
    ),
  );
});

test("normalized product data keeps local safety signals available for scanning", () => {
  const localResult = lookupUsMeatProductResearch({ barcode: "0004450034171" });

  assert.ok(localResult);
  const normalized = normalizeExternalProduct(localResult);

  assert.equal(normalized.productName, "Hillshire Farm Smoked Sausage - 14 oz");
  assert.equal(normalized.productCategory, "Meat / Fast Food");
  assert.ok(normalized.ingredientText.includes("Mechanically separated turkey"));
  assert.equal(normalized.externalSignals.length, 1);
});
