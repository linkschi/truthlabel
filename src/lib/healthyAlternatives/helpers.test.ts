import assert from "node:assert/strict";
import test from "node:test";

import { healthyAlternativeCategories } from "./categories";
import { healthyAlternativeProducts } from "./demoProducts";
import {
  findHealthyAlternativeCategoryBySlug,
  findHealthyAlternativeProductBySlug,
  getHealthyAlternativeProductsByCategory,
  getHealthyAlternativeProductsBySubcategory,
  getRecommendedHealthyAlternativeProducts,
  getSimilarHealthyAlternativeProducts,
  searchHealthyAlternativeProducts,
} from "./helpers";

test("Healthy Alternatives category configuration contains the official 15 categories", () => {
  assert.equal(healthyAlternativeCategories.length, 15);
  assert.deepEqual(
    healthyAlternativeCategories.map((category) => category.name),
    [
      "Bread & Bakery",
      "Breakfast",
      "Dairy",
      "Eggs",
      "Meat",
      "Seafood",
      "Snacks",
      "Drinks",
      "Sauces & Condiments",
      "Frozen Foods",
      "Rice & Pasta",
      "Cooking Oils",
      "Chocolate & Sweets",
      "Baby & Kids Foods",
      "Plant-Based Alternatives",
    ],
  );
});

test("demo product data covers the required temporary data states", () => {
  assert.ok(healthyAlternativeProducts.length >= 8);
  assert.ok(healthyAlternativeProducts.length <= 10);
  assert.ok(healthyAlternativeProducts.every((product) => product.source.kind === "demo"));
  assert.ok(
    healthyAlternativeProducts.some(
      (product) => (product.images?.gallery?.length ?? 0) > 1,
    ),
  );
  assert.ok(
    healthyAlternativeProducts.some(
      (product) =>
        Boolean(product.images?.primary) && (product.images?.gallery?.length ?? 0) === 0,
    ),
  );
  assert.ok(
    healthyAlternativeProducts.some(
      (product) => product.recommendationTags.length >= 4,
    ),
  );
  assert.ok(
    healthyAlternativeProducts.some(
      (product) => product.recommendationTags.length <= 2,
    ),
  );
  assert.ok(
    healthyAlternativeProducts.some((product) => (product.ingredients?.length ?? 0) > 0),
  );
  assert.ok(
    healthyAlternativeProducts.some((product) => product.ingredients === undefined),
  );
  assert.ok(healthyAlternativeProducts.some((product) => Boolean(product.amazon?.url)));
  assert.ok(healthyAlternativeProducts.some((product) => !product.amazon?.url));
  assert.ok(new Set(healthyAlternativeProducts.map((product) => product.category)).size >= 5);
});

test("findHealthyAlternativeProductBySlug returns a product by slug", () => {
  const product = findHealthyAlternativeProductBySlug(
    "demo-sprouted-buckwheat-sourdough",
  );

  assert.ok(product);
  assert.equal(product.productName, "Demo Sprouted Buckwheat Sourdough");
});

test("findHealthyAlternativeCategoryBySlug returns a category by slug", () => {
  const category = findHealthyAlternativeCategoryBySlug("rice-pasta");

  assert.ok(category);
  assert.equal(category.name, "Rice & Pasta");
});

test("category and subcategory helpers return ranked products", () => {
  const snackProducts = getHealthyAlternativeProductsByCategory("snacks");
  const breadProducts = getHealthyAlternativeProductsByCategory("Bread & Bakery");
  const chipProducts = getHealthyAlternativeProductsBySubcategory("chips");

  assert.equal(snackProducts[0]?.slug, "demo-seed-oil-free-potato-chips");
  assert.equal(breadProducts[0]?.slug, "demo-sprouted-buckwheat-sourdough");
  assert.equal(chipProducts[0]?.productType, "Potato Chips");
});

test("search helper matches products by simple normalized fields", () => {
  const cerealResults = searchHealthyAlternativeProducts("  CEREAL  ");
  const brandResults = searchHealthyAlternativeProducts("demo grove");
  const categoryResults = searchHealthyAlternativeProducts("cooking oils");

  assert.ok(cerealResults.some((product) => product.slug === "demo-short-list-oat-cereal"));
  assert.ok(brandResults.some((product) => product.slug === "demo-extra-virgin-olive-oil"));
  assert.ok(categoryResults.some((product) => product.slug === "demo-extra-virgin-olive-oil"));
  assert.deepEqual(searchHealthyAlternativeProducts("not-a-real-demo-match"), []);
});

test("recommended helper returns only recommended products sorted by rank", () => {
  const recommendedProducts = getRecommendedHealthyAlternativeProducts();

  assert.ok(recommendedProducts.length > 0);
  assert.ok(recommendedProducts.every((product) => product.selection.recommended));
  assert.ok(
    recommendedProducts.every((product, index, products) => {
      const previous = products[index - 1];
      return !previous || previous.selection.rank <= product.selection.rank;
    }),
  );
});

test("similar products exclude the current product and prefer product type, subcategory, then category", () => {
  const current = {
    ...healthyAlternativeProducts[0],
    id: "current-demo-bread",
    slug: "current-demo-bread",
    selection: {
      ...healthyAlternativeProducts[0].selection,
      rank: 99,
    },
  };

  const sameType = {
    ...healthyAlternativeProducts[0],
    id: "same-type",
    slug: "same-type",
    selection: {
      ...healthyAlternativeProducts[0].selection,
      rank: 3,
    },
  };

  const sameSubcategory = {
    ...healthyAlternativeProducts[0],
    id: "same-subcategory",
    slug: "same-subcategory",
    productType: "Sandwich Bread",
    selection: {
      ...healthyAlternativeProducts[0].selection,
      rank: 1,
    },
  };

  const sameCategory = {
    ...healthyAlternativeProducts[0],
    id: "same-category",
    slug: "same-category",
    subcategory: "Wraps",
    productType: "Tortilla Wrap",
    selection: {
      ...healthyAlternativeProducts[0].selection,
      rank: 1,
    },
  };

  const similar = getSimilarHealthyAlternativeProducts(
    current,
    [current, sameCategory, sameSubcategory, sameType],
    4,
  );

  assert.deepEqual(
    similar.map((product) => product.id),
    ["same-type", "same-subcategory", "same-category"],
  );
  assert.ok(!similar.some((product) => product.id === current.id));
});
