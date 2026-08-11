import assert from "node:assert/strict";
import test from "node:test";

import { buildDemoScanResult } from "@/lib/demoScanBuilder/buildDemoScanResult";
import {
  createDemoCategoryFromTemplate,
  createDemoIngredientsText,
  getDemoTemplateStateLabel,
} from "@/lib/demoScanBuilder/demoScanTemplates";
import { createStarterDemoScan } from "@/lib/demoScanBuilder/demoScanTypes";

test("demo category templates create editable good, bad, and very bad categories", () => {
  const goodCategory = createDemoCategoryFromTemplate("harmful_additives", "good");
  const badCategory = createDemoCategoryFromTemplate("harmful_additives", "bad");
  const veryBadCategory = createDemoCategoryFromTemplate(
    "harmful_additives",
    "very_bad",
  );

  assert.equal(getDemoTemplateStateLabel("good"), "Good");
  assert.equal(getDemoTemplateStateLabel("bad"), "Bad");
  assert.equal(getDemoTemplateStateLabel("very_bad"), "Very bad");
  assert.equal(goodCategory.severity, "green");
  assert.equal(badCategory.severity, "yellow");
  assert.equal(veryBadCategory.severity, "red");
  assert.ok(veryBadCategory.findings.length > badCategory.findings.length);
});

test("demo ingredient presets feed the reusable results ingredient breakdown", () => {
  const record = createStarterDemoScan();

  record.ingredientsText = createDemoIngredientsText(
    "breakfast_cereal",
    "very_bad",
  );

  const result = buildDemoScanResult(record);

  assert.ok(result.ingredientBreakdown.totalIngredients > 0);
  assert.ok(result.ingredientBreakdown.naturalPositive.length > 0);
  assert.ok(result.ingredientBreakdown.processedArtificial.length > 0);
  assert.ok(
    result.ingredientBreakdown.processedArtificial.some(
      (item) => item.severity === "red",
    ),
  );
});
