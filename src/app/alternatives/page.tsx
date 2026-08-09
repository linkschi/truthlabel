import Link from "next/link";

import {
  getRecommendedHealthyAlternativeProducts,
  healthyAlternativeCategories,
  healthyAlternativePopularSwaps,
} from "@/lib/healthyAlternatives";

import AlternativeProductCard from "./_components/AlternativeProductCard";
import AlternativesSearchField from "./_components/AlternativesSearchField";
import styles from "./alternativesHome.module.css";

export default function AlternativesPage() {
  const visibleCategories = healthyAlternativeCategories
    .slice()
    .sort((categoryA, categoryB) => categoryA.order - categoryB.order)
    .slice(0, 8);
  const recommendedProducts = getRecommendedHealthyAlternativeProducts().slice(0, 6);

  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="alternatives-home-title">
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle} id="alternatives-home-title">
            Find healthier alternatives.
          </h1>
          <p className={styles.heroText}>
            Better everyday products, carefully selected to make shopping simpler.
          </p>
        </div>
        <AlternativesSearchField />
      </section>

      <section className={styles.section} aria-labelledby="shop-by-category-title">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} id="shop-by-category-title">
            Shop by category
          </h2>
        </div>
        <div className={styles.categoryGrid}>
          {visibleCategories.map((category) => (
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
        <Link className={styles.textLink} href="/alternatives/explore">
          View all categories -&gt;
        </Link>
      </section>

      {recommendedProducts.length > 0 ? (
        <section className={styles.section} aria-labelledby="better-choices-title">
          <div>
            <h2 className={styles.sectionTitle} id="better-choices-title">
              Better everyday choices
            </h2>
            <p className={styles.sectionText}>
              A few carefully selected options worth knowing about.
            </p>
          </div>
          <div className={styles.productRail} aria-label="Better everyday choices">
            {recommendedProducts.map((product) => (
              <AlternativeProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby="popular-swaps-title">
        <h2 className={styles.sectionTitle} id="popular-swaps-title">
          Popular swaps
        </h2>
        <div className={styles.swapList}>
          {healthyAlternativePopularSwaps.map((swap) => (
            <Link className={styles.swapCard} href={swap.href} key={swap.id}>
              <span>
                <span className={styles.swapFrom}>{swap.from}</span>
                <span className={styles.swapAction}>
                  Find better options in {swap.category}
                </span>
              </span>
              <span className={styles.swapArrow} aria-hidden="true">
                -&gt;
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.trustSection} aria-labelledby="trust-title">
        <div className={styles.trustIntro}>
          <h2 className={styles.sectionTitle} id="trust-title">
            You shouldn't need to research every label.
          </h2>
          <p className={styles.sectionText}>
            We look at product information and ingredients to help surface better
            everyday alternatives.
          </p>
        </div>
        <div className={styles.trustList}>
          <div className={styles.trustRow}>
            <span className={styles.trustTitle}>Simple information</span>
            <span className={styles.trustText}>
              Understand why a product was selected.
            </span>
          </div>
          <div className={styles.trustRow}>
            <span className={styles.trustTitle}>Curated choices</span>
            <span className={styles.trustText}>
              Focus on useful everyday alternatives.
            </span>
          </div>
          <div className={styles.trustRow}>
            <span className={styles.trustTitle}>Easy shopping</span>
            <span className={styles.trustText}>
              Find an option and continue to the retailer.
            </span>
          </div>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-search-title">
        <div>
          <h2 className={styles.sectionTitle} id="final-search-title">
            Looking for something specific?
          </h2>
        </div>
        <Link className={styles.primaryCta} href="/alternatives/explore">
          Explore all alternatives
        </Link>
      </section>

      <footer className={styles.footer}>
        Healthy Alternatives helps you browse better everyday options. Full
        search, filters, product pages, and retailer actions will be added in
        later steps.
      </footer>
    </div>
  );
}
