import { healthyAlternativeCategories } from "./categories";
import { healthyAlternativeProducts } from "./demoProducts";
import type { HealthyAlternativeProduct } from "./types";

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function byRank(
  productA: HealthyAlternativeProduct,
  productB: HealthyAlternativeProduct,
) {
  return productA.selection.rank - productB.selection.rank;
}

function matchesCategory(product: HealthyAlternativeProduct, category: string) {
  const normalizedCategory = normalize(category);
  const categoryConfig = healthyAlternativeCategories.find((entry) =>
    [entry.id, entry.slug, entry.name].some(
      (value) => normalize(value) === normalizedCategory,
    ),
  );

  return normalize(product.category) === normalize(categoryConfig?.name ?? category);
}

export function findHealthyAlternativeCategoryBySlug(
  slug: string,
  categories = healthyAlternativeCategories,
) {
  const normalizedSlug = normalize(slug);

  return categories.find((category) =>
    [category.id, category.slug].some((value) => normalize(value) === normalizedSlug),
  );
}

export function findHealthyAlternativeProductBySlug(
  slug: string,
  products: HealthyAlternativeProduct[] = healthyAlternativeProducts,
) {
  const normalizedSlug = normalize(slug);
  return products.find((product) => normalize(product.slug) === normalizedSlug);
}

export function getHealthyAlternativeProductsByCategory(
  category: string,
  products: HealthyAlternativeProduct[] = healthyAlternativeProducts,
) {
  return products.filter((product) => matchesCategory(product, category)).sort(byRank);
}

export function getHealthyAlternativeProductsBySubcategory(
  subcategory: string,
  products: HealthyAlternativeProduct[] = healthyAlternativeProducts,
) {
  const normalizedSubcategory = normalize(subcategory);

  return products
    .filter((product) => normalize(product.subcategory) === normalizedSubcategory)
    .sort(byRank);
}

export function getRecommendedHealthyAlternativeProducts(
  products: HealthyAlternativeProduct[] = healthyAlternativeProducts,
) {
  return products.filter((product) => product.selection.recommended).sort(byRank);
}

export function searchHealthyAlternativeProducts(
  query: string,
  products: HealthyAlternativeProduct[] = healthyAlternativeProducts,
) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  return products
    .filter((product) =>
      [
        product.productName,
        product.brand,
        product.category,
        product.subcategory,
        product.productType,
      ].some((value) => normalize(value).includes(normalizedQuery)),
    )
    .sort(byRank);
}

function similarityScore(
  currentProduct: HealthyAlternativeProduct,
  candidate: HealthyAlternativeProduct,
) {
  if (normalize(candidate.productType) === normalize(currentProduct.productType)) {
    return 0;
  }

  if (normalize(candidate.subcategory) === normalize(currentProduct.subcategory)) {
    return 1;
  }

  if (candidate.category === currentProduct.category) {
    return 2;
  }

  return Number.POSITIVE_INFINITY;
}

export function getSimilarHealthyAlternativeProducts(
  currentProductOrSlug: HealthyAlternativeProduct | string,
  products: HealthyAlternativeProduct[] = healthyAlternativeProducts,
  limit = 4,
) {
  const currentProduct =
    typeof currentProductOrSlug === "string"
      ? findHealthyAlternativeProductBySlug(currentProductOrSlug, products)
      : currentProductOrSlug;

  if (!currentProduct) {
    return [];
  }

  return products
    .filter((product) => product.id !== currentProduct.id)
    .map((product) => ({
      product,
      score: similarityScore(currentProduct, product),
    }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((entryA, entryB) => {
      if (entryA.score !== entryB.score) {
        return entryA.score - entryB.score;
      }

      return byRank(entryA.product, entryB.product);
    })
    .slice(0, limit)
    .map((entry) => entry.product);
}
