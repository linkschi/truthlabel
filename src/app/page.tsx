import type { Metadata } from "next";
import Link from "next/link";
import { defaultDemoProductId } from "@/data/demoProducts";

export const metadata: Metadata = {
  title: "Truthlabel",
  description:
    "Truthlabel checks food ingredients for banned substances, additives, allergens, processing concerns, and safety signals.",
};

const checks = [
  "Banned and restricted ingredients",
  "Allergy Watch List matches",
  "Artificial colors and sweeteners",
  "Preservatives and additives",
  "Processed oils and fats",
  "Ultra-processing indicators",
  "Engineered-food markers",
  "Brand safety alerts",
];

const faq = [
  {
    question: "Is Truthlabel medical advice?",
    answer:
      "No. Truthlabel provides food and ingredient information for educational purposes. Always check the package label, especially for allergies.",
  },
  {
    question: "Can I use the scanner for free?",
    answer:
      "Truthlabel is being set up as a paid subscription app. Scanner access requires an active subscription.",
  },
  {
    question: "Does a warning mean a product is unsafe for everyone?",
    answer:
      "No. Truthlabel flags review signals based on label data, personal allergy settings, and available official safety information.",
  },
];

function getCheckoutUrl() {
  return (
    process.env.NEXT_PUBLIC_GUMROAD_CHECKOUT_URL?.trim() ||
    "https://truthlabel.gumroad.com"
  );
}

function BrandMark() {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--green-main)] shadow-[0_12px_24px_rgba(21,128,61,0.18)]">
      <span className="grid gap-[3px]">
        <span className="h-[3px] w-5 rounded-full bg-[var(--red-main)]" />
        <span className="h-[3px] w-5 rounded-full bg-[var(--amber-main)]" />
        <span className="h-[3px] w-5 rounded-full bg-white" />
      </span>
    </span>
  );
}

export default function LandingPage() {
  const checkoutUrl = getCheckoutUrl();

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 rounded-[28px] border border-white/70 bg-white/78 px-4 py-3 shadow-[var(--shadow)] backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
            <span className="font-heading text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--text-main)]">
              Truthlabel
            </span>
          </Link>
          <nav className="hidden items-center gap-5 text-[13px] font-semibold text-[var(--text-secondary)] sm:flex">
            <a href="#how">How it works</a>
            <a href="#checks">What we check</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-main)]"
            >
              Sign in
            </Link>
            <a
              href={checkoutUrl}
              className="hidden rounded-full border border-transparent bg-[var(--text-main)] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white sm:inline-flex"
            >
              Subscribe
            </a>
          </div>
        </header>

        <section className="grid gap-6 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-16">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--green-main)]">
              Food label intelligence
            </p>
            <h1 className="mt-4 max-w-2xl font-heading text-[3.2rem] font-semibold leading-[0.96] tracking-[-0.055em] text-[var(--text-main)] sm:text-[4.5rem]">
              Scan before you trust it
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-7 text-[var(--text-secondary)]">
              Truthlabel checks food ingredients for banned substances, additives, allergens, processing concerns, and ingredients you may prefer to avoid.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={checkoutUrl}
                className="inline-flex justify-center rounded-full border border-transparent bg-[var(--text-main)] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_36px_rgba(23,20,18,0.18)]"
              >
                Subscribe and get access
              </a>
              <Link
                href="/sign-in"
                className="inline-flex justify-center rounded-full border border-[var(--border-soft)] bg-white px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--text-main)]"
              >
                Already subscribed? Sign in
              </Link>
            </div>
          </div>

          <div className="rounded-[34px] border border-[var(--border-soft)] bg-white p-5 shadow-[var(--shadow)]">
            <div className="rounded-[28px] bg-[linear-gradient(145deg,var(--green-bg),white_42%,var(--amber-bg))] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                Example result preview
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[20px] border border-[var(--red-border)] bg-[var(--red-bg)] px-4 py-3">
                  <p className="text-[13px] font-bold text-[var(--red-dark)]">
                    Red flag found
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
                    Serious or personal review item detected.
                  </p>
                </div>
                <div className="rounded-[20px] border border-[var(--amber-border)] bg-[var(--amber-bg)] px-4 py-3">
                  <p className="text-[13px] font-bold text-[var(--amber-dark)]">
                    Moderate concern
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
                    Ingredient load or processing signal to review.
                  </p>
                </div>
                <div className="rounded-[20px] border border-[var(--green-border)] bg-[var(--green-bg)] px-4 py-3">
                  <p className="text-[13px] font-bold text-[var(--green-dark)]">
                    Recognizable ingredients
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
                    Simple label items found from available data.
                  </p>
                </div>
              </div>
              <Link
                href={`/app/results?demo=${defaultDemoProductId}`}
                className="mt-4 inline-flex text-[13px] font-semibold text-[var(--green-main)]"
              >
                View sample result after sign in
              </Link>
            </div>
          </div>
        </section>

        <section id="how" className="grid gap-3 md:grid-cols-3">
          {[
            "Scan or enter a barcode.",
            "Truthlabel checks the ingredients.",
            "Review clear green, yellow, and red findings.",
          ].map((step, index) => (
            <div
              key={step}
              className="rounded-[26px] border border-[var(--border-soft)] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(23,20,18,0.06)]"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--green-bg)] text-[13px] font-bold text-[var(--green-dark)]">
                {index + 1}
              </span>
              <p className="mt-4 text-[15px] font-semibold text-[var(--text-main)]">
                {step}
              </p>
            </div>
          ))}
        </section>

        <section id="checks" className="mt-10 rounded-[34px] border border-[var(--border-soft)] bg-white px-5 py-6 shadow-[var(--shadow)]">
          <h2 className="font-heading text-[2rem] font-semibold tracking-[-0.04em] text-[var(--text-main)]">
            What Truthlabel checks
          </h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {checks.map((check) => (
              <div
                key={check}
                className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-soft)] px-4 py-3 text-[13px] font-semibold text-[var(--text-main)]"
              >
                {check}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-[var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_30px_rgba(23,20,18,0.06)]">
            <h2 className="font-heading text-[1.55rem] font-semibold text-[var(--text-main)]">
              Allergy and Watch List
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">
              Truthlabel can flag ingredients that match your allergy settings or avoid list. This helps you review labels faster, but you should always check the package yourself.
            </p>
          </div>
          <div
            id="pricing"
            className="rounded-[30px] border border-[var(--green-border)] bg-[var(--green-bg)] px-5 py-6 shadow-[0_14px_30px_rgba(21,128,61,0.08)]"
          >
            <h2 className="font-heading text-[1.55rem] font-semibold text-[var(--text-main)]">
              Paid subscription access
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">
              Subscription and payment are handled by Gumroad. The exact price is shown on the checkout page.
            </p>
            <a
              href={checkoutUrl}
              className="mt-5 inline-flex rounded-full border border-transparent bg-[var(--text-main)] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white"
            >
              Start your subscription
            </a>
          </div>
        </section>

        <section className="mt-10 grid gap-3 md:grid-cols-3">
          {faq.map((item) => (
            <details
              key={item.question}
              className="rounded-[24px] border border-[var(--border-soft)] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(23,20,18,0.05)]"
            >
              <summary className="cursor-pointer text-[14px] font-bold text-[var(--text-main)]">
                {item.question}
              </summary>
              <p className="mt-3 text-[13px] leading-6 text-[var(--text-secondary)]">
                {item.answer}
              </p>
            </details>
          ))}
        </section>

        <footer className="mt-10 rounded-[28px] border border-[var(--border-soft)] bg-white/78 px-5 py-5 text-[13px] leading-6 text-[var(--text-secondary)] shadow-[var(--shadow)]">
          <p>
            Truthlabel provides food and ingredient information for educational purposes. It does not replace the product label or medical advice.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 font-semibold text-[var(--text-main)]">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/health-disclaimer">Health disclaimer</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
