import Link from "next/link";
import { notFound } from "next/navigation";

import {
  findHealthyAlternativeCategoryBySlug,
  getHealthyAlternativeProductsByCategory,
  healthyAlternativeCategories,
} from "@/lib/healthyAlternatives";

import AlternativeProductCard from "../../_components/AlternativeProductCard";
import styles from "../../_components/AlternativesExploreClient.module.css";

export function generateStaticParams() {
  return healthyAlternativeCategories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function AlternativesCategoryPage({ params }: PageProps<"/alternatives/category/[slug]">) {
  const { slug } = await params;
  const category = findHealthyAlternativeCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = getHealthyAlternativeProductsByCategory(category.name);

  return (
    <section className={styles.categoryPage} aria-labelledby="category-title">
      <Link className={styles.backLink} href="/alternatives/explore">
        &lt;- Explore
      </Link>

      <div className={styles.categoryIntro}>
        <h1 className={styles.title} id="category-title">
          {category.name}
        </h1>
        <p className={styles.categoryDescription}>{category.description}</p>
      </div>

      {products.length > 0 ? (
        <div className={styles.productGrid}>
          {products.map((product) => (
            <AlternativeProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className={styles.categoryEmpty}>
          Products for this category will appear here as demo data is added.
        </p>
      )}
    </section>
  );
}
