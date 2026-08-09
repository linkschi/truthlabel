"use client";

import Link from "next/link";
import { useState } from "react";

import type { HealthyAlternativeProduct } from "@/lib/healthyAlternatives";

import styles from "./AlternativeProductCard.module.css";

function getProductImageAlt(product: HealthyAlternativeProduct) {
  return `${product.brand} ${product.productName}`.trim();
}

function getFallbackInitials(product: HealthyAlternativeProduct) {
  const source = product.brand || product.productName;

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function isUnresolvedDemoImage(imagePath: string) {
  return imagePath.startsWith("/alternatives/demo/");
}

export default function AlternativeProductCard({
  product,
}: {
  product: HealthyAlternativeProduct;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const productHref = `/alternatives/product/${product.slug}`;
  const productImage = product.images?.primary;
  const imageSrc =
    typeof productImage === "string" && !isUnresolvedDemoImage(productImage)
      ? productImage
      : "";
  const visibleTags = product.recommendationTags.slice(0, 2);
  const shouldShowImage = Boolean(imageSrc) && !imageFailed;

  return (
    <Link
      href={productHref}
      className={styles.card}
      aria-label={`View ${getProductImageAlt(product)}`}
    >
      <span className={styles.imageFrame}>
        {shouldShowImage ? (
          <img
            src={imageSrc}
            alt={getProductImageAlt(product)}
            className={styles.productImage}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className={styles.imageFallback} aria-label="Product image not available">
            <span className={styles.fallbackMark}>
              {getFallbackInitials(product) || "TL"}
            </span>
            <span className={styles.fallbackText}>Image coming soon</span>
          </span>
        )}
      </span>

      <span className={styles.content}>
        <span className={styles.brand}>{product.brand}</span>
        <span className={styles.productName}>{product.productName}</span>

        {visibleTags.length > 0 ? (
          <span className={styles.tags} aria-label="Recommendation tags">
            {visibleTags.map((tag) => (
              <span className={styles.tag} key={tag}>
                {tag}
              </span>
            ))}
          </span>
        ) : null}

        <span className={styles.action}>View product <span aria-hidden="true">-&gt;</span></span>
      </span>
    </Link>
  );
}
