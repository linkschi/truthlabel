import Link from "next/link";
import { notFound } from "next/navigation";

import {
  findHealthyAlternativeProductBySlug,
  getRecommendedHealthyAlternativeProducts,
  getSimilarHealthyAlternativeProducts,
  healthyAlternativeCategories,
  healthyAlternativeProducts,
} from "@/lib/healthyAlternatives";

import AlternativeProductCard from "../../_components/AlternativeProductCard";
import AlternativeProductImage from "../../_components/AlternativeProductImage";
import styles from "./productPage.module.css";

export function generateStaticParams() {
  return healthyAlternativeProducts.map((product) => ({
    slug: product.slug,
  }));
}

export default async function AlternativesProductPage({ params }: PageProps<"/alternatives/product/[slug]">) {
  const { slug } = await params;
  const product = findHealthyAlternativeProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const visibleTags = product.recommendationTags.slice(0, 4);
  const ingredients = product.ingredients?.filter((ingredient) => ingredient.trim());
  const amazonHref = product.amazon?.affiliateUrl || product.amazon?.url || "";
  const isAffiliateLink = Boolean(product.amazon?.affiliateUrl);
  const similarProducts =
    getSimilarHealthyAlternativeProducts(product, healthyAlternativeProducts, 4);
  const fallbackOptions = similarProducts.length > 0
    ? similarProducts
    : getRecommendedHealthyAlternativeProducts()
        .filter((recommendedProduct) => recommendedProduct.id !== product.id)
        .slice(0, 4);
  const category = healthyAlternativeCategories.find(
    (category) => category.name === product.category,
  );
  const backHref = category ? `/alternatives/category/${category.slug}` : "/alternatives/explore";

  return (
    <article className={styles.productPage} aria-labelledby="product-title">
      <Link className={styles.backLink} href={backHref}>
        &lt;- Back
      </Link>

      <AlternativeProductImage product={product} />

      <header className={styles.summary}>
        <span className={styles.category}>{product.category}</span>
        <span className={styles.brand}>{product.brand}</span>
        <h1 className={styles.title} id="product-title">
          {product.productName}
        </h1>

        {visibleTags.length > 0 ? (
          <div className={styles.tags} aria-label="Recommendation tags">
            {visibleTags.map((tag) => (
              <span className={styles.tag} key={tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {product.shortDescription ? (
          <p className={styles.description}>{product.shortDescription}</p>
        ) : null}
      </header>

      {product.whyRecommended ? (
        <section className={styles.section} aria-labelledby="why-recommended-title">
          <h2 className={styles.sectionTitle} id="why-recommended-title">
            Why we recommend it
          </h2>
          <p className={styles.sectionText}>{product.whyRecommended}</p>
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby="ingredients-title">
        <h2 className={styles.sectionTitle} id="ingredients-title">
          Ingredients
        </h2>
        {ingredients && ingredients.length > 0 ? (
          <ul className={styles.ingredientList}>
            {ingredients.map((ingredient) => (
              <li className={styles.ingredientItem} key={ingredient}>
                {ingredient}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.unavailableText}>
            Full ingredient information is not currently available. Check the
            product label before purchase.
          </p>
        )}
      </section>

      <section className={styles.ctaSection} aria-label="Retailer action">
        {amazonHref ? (
          <>
            <a
              className={styles.amazonButton}
              href={amazonHref}
              rel={isAffiliateLink ? "sponsored noopener noreferrer" : "noopener noreferrer"}
              target="_blank"
            >
              View on Amazon
            </a>
            {isAffiliateLink ? (
              <p className={styles.affiliateNote}>
                We may earn a commission from qualifying purchases at no
                additional cost to you.
              </p>
            ) : null}
          </>
        ) : (
          <p className={styles.unavailableText}>Retailer link currently unavailable</p>
        )}
      </section>

      {fallbackOptions.length > 0 ? (
        <section className={styles.section} aria-labelledby="similar-title">
          <h2 className={styles.sectionTitle} id="similar-title">
            More good options
          </h2>
          <div className={styles.similarRail} aria-label="More good options">
            {fallbackOptions.map((similarProduct) => (
              <AlternativeProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
