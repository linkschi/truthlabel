import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Health disclaimer",
  description: "Truthlabel health and allergy disclaimer.",
};

export default function HealthDisclaimerPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <article className="mx-auto max-w-[720px] rounded-[32px] border border-[var(--border-soft)] bg-white px-5 py-6 shadow-[var(--shadow)]">
        <Link href="/" className="text-[13px] font-semibold text-[var(--green-main)]">
          Back to Truthlabel
        </Link>
        <h1 className="mt-4 font-heading text-[2rem] font-semibold text-[var(--text-main)]">
          Health disclaimer
        </h1>
        <p className="mt-4 text-[14px] leading-7 text-[var(--text-secondary)]">
          Truthlabel is not medical advice. It does not diagnose, treat, or prevent disease. For allergies, always check the package label and follow medical advice from a qualified professional.
        </p>
        <p className="mt-3 text-[14px] leading-7 text-[var(--text-secondary)]">
          Missing data is not proof of absence. A green or low concern result does not guarantee a product is suitable for every person.
        </p>
      </article>
    </main>
  );
}
