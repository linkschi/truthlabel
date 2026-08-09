import type { ReactNode } from "react";

import styles from "../alternativesFoundation.module.css";

export default function AlternativesPlaceholderPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.placeholderSection}>
      <p className={styles.mutedMetadata}>Healthy Alternatives</p>
      <h1 className={styles.pageTitle}>{title}</h1>
      <p className={styles.bodyText}>{children}</p>
    </section>
  );
}
