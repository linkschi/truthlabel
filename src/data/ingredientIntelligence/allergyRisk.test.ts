import assert from "node:assert/strict";
import test from "node:test";

import { allergenAliases } from "@/data/allergenAliases";
import { ingredientMatchesAllergy } from "@/lib/analyzeProduct";

import { allergyRiskDataPack } from "./allergyRisk";

test("allergyRiskDataPack stores the requested starter dataset", () => {
  assert.equal(allergyRiskDataPack.id, "allergy_risk");
  assert.equal(allergyRiskDataPack.categoryName, "Allergy Risk");
  assert.equal(allergyRiskDataPack.items.length, 15);
});

test("allergyRiskDataPack keeps all starter severities yellow", () => {
  const severities = new Set(
    allergyRiskDataPack.items.map((item) => item.basicSeveritySuggestion),
  );

  assert.deepEqual([...severities], ["yellow"]);
});

test("allergyRiskDataPack keeps personal-risk behavior metadata", () => {
  const warningStatement = allergyRiskDataPack.items.find(
    (item) => item.id === "allergen_warning_statement",
  );

  assert.ok(warningStatement);
  assert.equal(warningStatement.redOnlyWhenUserProfileMatches, false);

  allergyRiskDataPack.items
    .filter((item) => item.id !== "allergen_warning_statement")
    .forEach((item) => {
      assert.equal(item.redOnlyWhenUserProfileMatches, true);
      assert.deepEqual(item.categoryTags, ["allergy_risk"]);
      assert.equal(item.dataStatus, "starter");
      assert.equal(item.confidenceLevel, null);
    });
});

test("allergenAliases stays wired to the standalone pack for current profile groups", () => {
  assert.ok(allergenAliases.Milk.includes("caseinate"));
  assert.ok(allergenAliases.Egg.includes("ovalbumin"));
  assert.ok(allergenAliases["Tree nuts"].includes("tree nuts"));
  assert.ok(allergenAliases.Shellfish.includes("mollusks"));
  assert.ok(allergenAliases.Sesame.includes("gingelly"));
});

test("ingredientMatchesAllergy avoids key false positives and free-from phrases", () => {
  assert.equal(ingredientMatchesAllergy("milk thistle extract", "Milk"), false);
  assert.equal(ingredientMatchesAllergy("eggplant powder", "Egg"), false);
  assert.equal(ingredientMatchesAllergy("peanut-free roasted snack", "Peanuts"), false);
  assert.equal(ingredientMatchesAllergy("gluten-free", "Wheat / gluten"), false);
  assert.equal(ingredientMatchesAllergy("milk powder", "Milk"), true);
  assert.equal(ingredientMatchesAllergy("hydrolysed wheat protein", "Wheat / gluten"), true);
  assert.equal(ingredientMatchesAllergy("soya lecithin", "Soy"), true);
});
