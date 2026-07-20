import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Truthlabel privacy notes.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <article className="mx-auto max-w-[720px] rounded-[32px] border border-[var(--border-soft)] bg-white px-5 py-6 shadow-[var(--shadow)]">
        <Link href="/" className="text-[13px] font-semibold text-[var(--green-main)]">
          Back to Truthlabel
        </Link>
        <h1 className="mt-4 font-heading text-[2rem] font-semibold text-[var(--text-main)]">
          Privacy
        </h1>
        <p className="mt-4 text-[14px] leading-7 text-[var(--text-secondary)]">
          Truthlabel uses product, ingredient, barcode, and account information to provide ingredient analysis and paid access. Allergy settings are sensitive preference data and should only be used to personalize warnings.
        </p>
        <p className="mt-3 text-[14px] leading-7 text-[var(--text-secondary)]">
          OCR photos are used to extract ingredient text in the browser. Barcode and external safety lookups may send product identifiers to product or official safety data providers.
        </p>
      </article>
    </main>
  );
}
