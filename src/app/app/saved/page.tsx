import Link from "next/link";

export default function AppSavedPage() {
  return (
    <main className="min-h-screen px-4 py-6">
      <section className="mx-auto max-w-[440px] rounded-[30px] border border-[var(--border-soft)] bg-white px-5 py-6 shadow-[var(--shadow)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--green-main)]">
          Truthlabel
        </p>
        <h1 className="mt-2 font-heading text-[1.55rem] font-semibold text-[var(--text-main)]">
          Saved products
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">
          Saved products will be connected after paid account activation is complete.
        </p>
        <Link
          href="/app/manual"
          className="mt-5 inline-flex rounded-full bg-[var(--text-main)] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white"
        >
          Start a scan
        </Link>
      </section>
    </main>
  );
}
