"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  searchHealthyAlternativeProducts,
  type HealthyAlternativeCategory,
  type HealthyAlternativeProduct,
} from "@/lib/healthyAlternatives";

import AlternativeProductCard from "./AlternativeProductCard";
import searchStyles from "./AlternativesSearchField.module.css";
import styles from "./AlternativesExploreClient.module.css";

function cleanQuery(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export default function AlternativesExploreClient({
  categories,
  products,
  initialQuery,
}: {
  categories: HealthyAlternativeCategory[];
  products: HealthyAlternativeProduct[];
  initialQuery: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const cleanedQuery = cleanQuery(query);
  const isSearching = cleanedQuery.length > 0;
  const matchingProducts = isSearching
    ? searchHealthyAlternativeProducts(cleanedQuery, products)
    : [];

  function clearSearch() {
    setQuery("");
    router.replace("/alternatives/explore");
  }

  return (
    <section className={styles.explorePage} aria-labelledby="explore-title">
      <div className={styles.header}>
        <h1 className={styles.title} id="explore-title">
          Explore alternatives
        </h1>
        <form
          className={searchStyles.searchForm}
          role="search"
          aria-label="Search alternatives"
          onSubmit={(event) => event.preventDefault()}
        >
          <span className={searchStyles.searchIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path
                d="m20 20-4.4-4.4m2.4-5.1a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </span>
          <input
            className={searchStyles.input}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, brands, or categories"
            autoComplete="off"
          />
          {query.length > 0 ? (
            <button
              className={searchStyles.clearButton}
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <span aria-hidden="true">x</span>
            </button>
          ) : null}
        </form>
      </div>

      {isSearching ? (
        <div className={styles.resultsArea}>
          <h2 className={styles.sectionTitle}>Results for &ldquo;{cleanedQuery}&rdquo;</h2>
          {matchingProducts.length > 0 ? (
            <div className={styles.productGrid}>
              {matchingProducts.map((product) => (
                <AlternativeProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>No alternatives found</h2>
              <p className={styles.emptyText}>
                Try another product, brand, or category.
              </p>
              <button className={styles.browseButton} type="button" onClick={clearSearch}>
                Browse categories
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.resultsArea}>
          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <Link
                className={styles.categoryCard}
                href={`/alternatives/category/${category.slug}`}
                key={category.id}
              >
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryAction}>Browse -&gt;</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
