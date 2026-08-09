"use client";

import { useState } from "react";

import type { HealthyAlternativeProduct } from "@/lib/healthyAlternatives";

import styles from "./AlternativeProductImage.module.css";

function getImageAlt(product: HealthyAlternativeProduct) {
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

export default function AlternativeProductImage({
  product,
}: {
  product: HealthyAlternativeProduct;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const productImage = product.images?.primary;
  const imageSrc =
    typeof productImage === "string" && !isUnresolvedDemoImage(productImage)
      ? productImage
      : "";
  const shouldShowImage = Boolean(imageSrc) && !imageFailed;

  return (
    <div className={styles.imageFrame}>
      {shouldShowImage ? (
        <img
          src={imageSrc}
          alt={getImageAlt(product)}
          className={styles.productImage}
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className={styles.fallback} aria-label="Product image not available">
          <span className={styles.fallbackMark}>
            {getFallbackInitials(product) || "TL"}
          </span>
          <span className={styles.fallbackText}>Product image coming soon</span>
        </div>
      )}
    </div>
  );
}
