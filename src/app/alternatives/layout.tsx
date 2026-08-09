import type { ReactNode } from "react";
import Link from "next/link";

import styles from "./alternativesFoundation.module.css";

const navItems = [
  { href: "/alternatives", label: "Home" },
  { href: "/alternatives/explore", label: "Explore" },
  { href: "/alternatives/saved", label: "Saved" },
];

export default function AlternativesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className={styles.foundation}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/alternatives" className={styles.brand}>
            Healthy Alternatives
          </Link>
          <nav aria-label="Healthy Alternatives">
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.navLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  );
}
