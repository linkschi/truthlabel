import assert from "node:assert/strict";
import test from "node:test";

import { runManualScan } from "@/lib/runManualScan";
import {
  buildScanHistorySaveSignature,
  buildScanHistorySnapshot,
  summarizeScanHistoryResult,
} from "@/lib/scanHistory/scanHistorySnapshot";

test("scan history snapshot preserves the completed scan result", () => {
  const scanResult = runManualScan({
    productName: "Simple Oats",
    brandName: "Truthlabel Test",
    productCategory: "Fresh / Simple Foods",
    ingredientText: "Rolled oats",
  });
  const snapshot = buildScanHistorySnapshot({
    scanResult,
    ingredientText: "Rolled oats",
  });

  assert.equal(snapshot.scanResult.productHero.productName, "Simple Oats");
  assert.equal(snapshot.ingredientsText, "Rolled oats");
  assert.deepEqual(snapshot.parsedIngredients, ["Rolled oats"]);
  assert.equal(snapshot.ruleVersion, "truthlabel-rules-v1");
  assert.equal(snapshot.ingredientDatabaseVersion, "truthlabel-ingredient-db-v1");
});

test("scan history summary keeps saved severity and count context", () => {
  const scanResult = runManualScan({
    productName: "Preserved Sauce",
    brandName: "Truthlabel Test",
    productCategory: "Packaged / Processed Foods",
    ingredientText:
      "Water, sodium benzoate, potassium sorbate, calcium propionate, natural flavour",
  });
  const summary = summarizeScanHistoryResult(scanResult);

  assert.equal(scanResult.finalVerdict.verdictTone, "red");
  assert.ok(summary.redCount >= 1);
  assert.ok(summary.overloadRedCount >= 1);
});

test("scan history save signature changes when the saved result changes", () => {
  const firstScan = runManualScan({
    productName: "Simple Oats",
    brandName: "Truthlabel Test",
    ingredientText: "Rolled oats",
  });
  const secondScan = runManualScan({
    productName: "Simple Oats",
    brandName: "Truthlabel Test",
    ingredientText: "Rolled oats, sugar, sodium benzoate",
  });

  assert.notEqual(
    buildScanHistorySaveSignature({
      scanResult: firstScan,
      ingredientText: "Rolled oats",
    }),
    buildScanHistorySaveSignature({
      scanResult: secondScan,
      ingredientText: "Rolled oats, sugar, sodium benzoate",
    }),
  );
});
