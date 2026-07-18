import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOpenFoodFactsProductUrl,
  lookupOpenFoodFactsProduct,
} from "./openFoodFactsClient";

function installMockWindow(origin = "https://truthlabel.test") {
  const originalWindow = globalThis.window;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      location: {
        origin,
      },
    },
  });

  return () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      writable: true,
      value: originalWindow,
    });
  };
}

function installMockFetch(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
) {
  const originalFetch = globalThis.fetch;

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    writable: true,
    value: handler,
  });

  return () => {
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: originalFetch,
    });
  };
}

test("buildOpenFoodFactsProductUrl uses the JSON product endpoint", () => {
  assert.equal(
    buildOpenFoodFactsProductUrl(
      "https://world.openfoodfacts.org/api/v2",
      "5449000000996",
    ),
    "https://world.openfoodfacts.org/api/v2/product/5449000000996.json",
  );
});

test("lookupOpenFoodFactsProduct uses the same-origin proxy in browsers", async () => {
  const restoreWindow = installMockWindow();
  const requestedUrls: string[] = [];
  const restoreFetch = installMockFetch(async (input) => {
    const url = input.toString();
    requestedUrls.push(url);

    return Response.json({
      code: "1000000001234",
      status: 1,
      product: {
        code: "1000000001234",
        product_name: "Fallback Test Product",
        brands: "Truthlabel Test",
        categories: "Snacks",
        ingredients_text: "Water, sugar",
      },
    });
  });

  try {
    const result = await lookupOpenFoodFactsProduct({
      barcode: "1000000001234",
    });

    assert.equal(result.found, true);
    assert.equal(result.productName, "Fallback Test Product");
    assert.equal(requestedUrls[0]?.startsWith("https://truthlabel.test/api/product-lookup?barcode="), true);
    assert.equal(
      requestedUrls.some((url) =>
        url.startsWith("https://truthlabel.test/api/product-lookup?barcode="),
      ),
      true,
    );
  } finally {
    restoreFetch();
    restoreWindow();
  }
});

test("lookupOpenFoodFactsProduct treats Open Food Facts 404 as product not found", async () => {
  const restoreFetch = installMockFetch(async () =>
    Response.json(
      {
        code: "6003678052405",
        status: 0,
        status_verbose: "product not found",
      },
      { status: 404 },
    ),
  );

  try {
    const result = await lookupOpenFoodFactsProduct({
      barcode: "6003678052405",
    });

    assert.equal(result.found, false);
    assert.equal(result.barcode, "6003678052405");
    assert.deepEqual(result.dataQualityWarnings, ["product not found"]);
  } finally {
    restoreFetch();
  }
});
