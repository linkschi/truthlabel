import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAuthorizedTruthlabelAdminEmailFromCookies } from "@/lib/auth/supabaseServer";
import styles from "./alternativesFoundation.module.css";

export const dynamic = "force-dynamic";

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
  return <AdminOnlyAlternativesLayout>{children}</AdminOnlyAlternativesLayout>;
}

async function AdminOnlyAlternativesLayout({ children }: { children: ReactNode }) {
  const adminEmail = await getAuthorizedTruthlabelAdminEmailFromCookies();

  if (!adminEmail) {
    notFound();
  }

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
