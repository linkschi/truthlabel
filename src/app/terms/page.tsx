import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "Truthlabel terms notes.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <article className="mx-auto max-w-[720px] rounded-[32px] border border-[var(--border-soft)] bg-white px-5 py-6 shadow-[var(--shadow)]">
        <Link href="/" className="text-[13px] font-semibold text-[var(--green-main)]">
          Back to Truthlabel
        </Link>
        <h1 className="mt-4 font-heading text-[2rem] font-semibold text-[var(--text-main)]">
          Terms
        </h1>
        <p className="mt-4 text-[14px] leading-7 text-[var(--text-secondary)]">
          Truthlabel provides ingredient and safety-signal information for educational review. Product data can be incomplete, user-submitted, or unavailable. Always check the package label before making a food decision.
        </p>
        <p className="mt-3 text-[14px] leading-7 text-[var(--text-secondary)]">
          Paid subscription purchases, renewals, cancellations, and card
          handling are managed by Gumroad. If you continue after the free trial,
          you can cancel anytime through the secure subscription checkout flow.
        </p>
      </article>
    </main>
  );
}
