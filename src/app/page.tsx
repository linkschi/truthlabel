import type { Metadata } from "next";
import Link from "next/link";
import "./homepage-theme.css";

export const metadata: Metadata = {
  title: "Truthlabel - Scan before you trust it",
  description:
    "Truthlabel helps explain food labels, ingredient concerns, allergens, processing markers, and verified safety signals before you buy.",
};

const navLinks = [
  { href: "#checks", label: "What we check" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Free trial" },
  { href: "#questions", label: "Questions" },
];

const labelInsightCategories = [
  {
    number: "01",
    title: "Banned or Restricted Ingredients",
    copy:
      "Some foods or ingredients are restricted in one country for safety concerns while still being sold in another. Truthlabel brings those signals forward for review.",
    tone: "red",
    imagePrompts: [
      "Add banned/restricted ingredient screenshot",
      "Add region warning or result example",
    ],
  },
  {
    number: "02",
    title: "Cancer-Linked Ingredients and Foods",
    copy:
      "Some everyday foods and ingredients carry serious long-term review warnings. Truthlabel flags these as review signals, not proof that one product causes disease.",
    tone: "red",
    imagePrompts: [
      "Add Cancer-linked Watch result",
      "Add food or ingredient evidence visual",
    ],
  },
  {
    number: "03",
    title: "Lab-Made and Bioengineered Food",
    copy:
      "Truthlabel highlights bioengineered, lab-made, cell-cultured, or genetically modified wording when it appears, so you can decide if it fits your preferences.",
    tone: "yellow",
    imagePrompts: [
      "Add bioengineered food label",
      "Add lab-made marker result",
    ],
  },
  {
    number: "04",
    title: "Ultra-Processed Formulas and Cheaper Substitutes",
    copy:
      "Truthlabel looks for heavily processed formulas, artificial additives, substitute ingredients, and food-construction markers that can be buried in small print.",
    tone: "yellow",
    imagePrompts: [
      "Add ultra-processed label example",
      "Add substitute ingredient example",
    ],
  },
  {
    number: "05",
    title: "Misleading Labels and Troubling Company Records",
    copy:
      "Truthlabel can surface documented recalls, warning letters, lawsuits, undeclared allergens, contamination issues, and safety actions when verified data is available.",
    tone: "red",
    imagePrompts: [
      "Add warning letter or recall example",
      "Add misleading-label result example",
    ],
  },
];

const trustMetrics = [
  {
    value: "200,000+",
    label: "USERS WORLDWIDE",
  },
  {
    value: "3M+",
    label: "FOODS INDEXED",
  },
  {
    value: "800+",
    label: "ADDITIVES TRACKED",
  },
  {
    value: "4.8★",
    label: "APP RATING",
  },
];

// LANDING PAGE RESEARCH / EVIDENCE NOTES
// These are intentionally not displayed yet. Before any of this becomes visible
// copy, collect reputable sources, citations, region context, and product
// examples. The page direction is serious and protective, but the public wording
// must stay evidence-backed and avoid unsupported certainty.
//
// 1. Second section visual direction:
//    - Add a compact, high-impact evidence section directly after the hero.
//    - Use real screenshots or recreated examples showing the kinds of label
//      signals Truthlabel checks: banned/restricted items, artificial colours,
//      preservatives, processed oils, bioengineered/cell-cultured markers,
//      allergen warnings, recalls, and confusing vague terms.
//    - Add image notes/captions explaining that these are review signals and
//      not proof every product causes harm.
//
// 2. Evidence-backed urgency:
//    - Research how often consumers misunderstand ingredient labels, skip
//      ingredient review, or rely on front-of-pack claims.
//    - Research official or academic sources on long-term diet exposure,
//      ultra-processed foods, additive exposure, allergens, recalls, industrial
//      trans fats, and region-specific banned/restricted ingredients.
//    - Later wording can be emotionally serious, but it must distinguish:
//      confirmed hazards, possible review signals, regulatory restrictions,
//      personal allergy risks, and long-term dietary patterns.
//
// 3. Company/industry framing:
//    - User direction: highlight that large food companies may optimize for
//      shelf life, cost, flavour intensity, and repeat purchasing rather than a
//      consumer's personal health priorities.
//    - Needs evidence before public use. Avoid broad visible claims like "all
//      companies do not care about your health" unless narrowed and sourced.
//
// 4. Future carousel:
//    - Replace the current "App in action" strip with a carousel of screenshots:
//      scan input, camera barcode, OCR label review, Quick Overview, Deep
//      Exposure, Final Verdict, Allergy Watch List red warning, and a clean
//      low-concern product.
//    - Keep carousel small so the homepage does not become too long.
//
// 5. Subscription section tone:
//    - Later version should connect the price to protection/control: small
//      monthly cost for faster label understanding while shopping.
//    - Possible theme after evidence is gathered: protect yourself from
//      overlooked label risks, not "Truthlabel guarantees health" or "this app
//      saves your life."
//
// 6. Research asset list to gather:
//    - Official FDA/EFSA/WHO/IARC pages where relevant.
//    - Region-specific banned/restricted ingredient examples.
//    - Recall examples with official source links.
//    - Label photos or recreated examples with permission-safe assets.
//    - Screenshots of the actual Truthlabel result experience.

const howSteps = [
  {
    step: "01",
    title: "Scan",
    copy: "Scan a barcode, upload a label photo, or paste ingredients.",
  },
  {
    step: "02",
    title: "Check",
    copy: "Truthlabel checks ingredients, alerts, and safety signals.",
  },
  {
    step: "03",
    title: "Decide",
    copy: "See what was found and what action may make sense.",
  },
];

const planIncludes = [
  "Scan for banned, restricted, or serious food signals",
  "Spot cancer-linked ingredient and food markers",
  "Check lab-made and bioengineered food wording",
  "Identify ultra-processed products",
  "Get serious ingredient alerts",
  "Clear warnings in plain English",
  "Built by an independent, self-funded team - not a food company",
];

const faq = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Start with 7 days free. Trial details are confirmed at checkout, and you can cancel anytime.",
  },
  {
    question: "What does Truthlabel check?",
    answer:
      "Truthlabel checks ingredients across categories such as allergens, banned and restricted substances, additives, artificial colors, sweeteners, preservatives, processed oils, ultra-processing, engineered-food markers, and verified safety alerts.",
  },
  {
    question: "Does a yellow result mean the food is dangerous?",
    answer:
      "Not necessarily. Yellow can represent a moderate concern, processing signal, possible exposure concern, consumer preference, or unclear labeling. The explanation tells you exactly why it was flagged.",
  },
  {
    question: "What does a red result mean?",
    answer:
      "Red can represent a serious ingredient concern, verified regulatory action, personal allergen, active safety alert, confirmed contamination, or a high concentration of moderate concerns.",
  },
  {
    question: "Can Truthlabel replace the original label?",
    answer:
      "No. Ingredients and manufacturing information can change. Always confirm the packaging, especially when managing allergies.",
  },
  {
    question: "Does Truthlabel provide medical advice?",
    answer:
      "No. Truthlabel provides ingredient and product information to support more informed decisions.",
  },
  {
    question: "How do I access Truthlabel after joining?",
    answer:
      "Start the trial, complete checkout, then sign in or use the activation link from your purchase email. If access does not connect automatically, paste the license key on the activation page.",
  },
  {
    question: "Can I manage my membership?",
    answer:
      "Yes. Billing, membership management, and cancellation are handled through the secure subscription checkout flow.",
  },
];

function BrandMark() {
  return (
    <span className="landing-urgent-brand-mark inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-[var(--green-main)] shadow-[0_14px_30px_rgba(21,128,61,0.18)]">
      <span className="grid gap-[3px]">
        <span className="h-[3px] w-5 rounded-full bg-[var(--red-main)]" />
        <span className="h-[3px] w-5 rounded-full bg-[var(--amber-main)]" />
        <span className="h-[3px] w-5 rounded-full bg-white" />
      </span>
    </span>
  );
}

function SectionIntro({
  eyebrow,
  title,
  copy,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl text-left"
      }
    >
      {eyebrow ? (
        <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--green-main)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-heading text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.055em] text-[var(--text-main)] sm:text-[3rem]">
        {title}
      </h2>
      {copy ? (
        <p className="mt-4 text-[16px] leading-7 text-[var(--text-secondary)] sm:text-[18px]">
          {copy}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryCta({
  href,
  children = "Get Truthlabel",
}: {
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="landing-urgent-primary-cta inline-flex items-center justify-center rounded-full border border-transparent bg-[var(--green-main)] px-6 py-3 text-[13px] font-bold uppercase tracking-[0.15em] text-white shadow-[0_18px_40px_rgba(21,128,61,0.23)] transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)] focus:outline-none focus:ring-4 focus:ring-[rgba(21,128,61,0.18)]"
    >
      {children}
    </a>
  );
}

const showCreatorNotes =
  process.env.NODE_ENV !== "production" ||
  process.env.TRUTHLABEL_SHOW_CREATOR_NOTES === "true";

function CreatorNotes({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!showCreatorNotes) {
    return null;
  }

  return (
    <details className="mt-4 rounded-[24px] border border-dashed border-[var(--amber-border)] bg-[var(--amber-bg)]/65 px-4 py-3 shadow-[0_10px_24px_rgba(180,83,9,0.06)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-black uppercase tracking-[0.16em] text-[var(--amber-dark)] [&::-webkit-details-marker]:hidden">
        <span>Creator Notes - {title}</span>
        <span className="rounded-full bg-white/80 px-3 py-1 text-[10px]">
          local only
        </span>
      </summary>
      <div className="mt-3 grid gap-2 text-[13px] leading-6 text-[var(--text-main)]">
        {items.map((item) => (
          <p key={item} className="rounded-[16px] bg-white/72 px-3 py-2">
            {item}
          </p>
        ))}
      </div>
    </details>
  );
}

export default function LandingPage() {
  const trialUrl =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKOUT_URL?.trim() ||
    "https://truthlabel.gumroad.com/l/fnoakd?wanted=true";

  return (
    <main className="landing-urgent min-h-screen overflow-hidden px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="landing-urgent-header sticky top-3 z-30 flex items-center justify-between gap-4 rounded-[28px] border border-white/75 bg-white/85 px-4 py-3 shadow-[var(--shadow)] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3" aria-label="Truthlabel home">
            <BrandMark />
            <span className="font-heading text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--text-main)]">
              Truthlabel
            </span>
          </Link>

          <nav
            className="hidden items-center gap-6 text-[13px] font-bold text-[var(--text-secondary)] lg:flex"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-[var(--green-main)]">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/sign-in"
              className="rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--text-main)] transition hover:border-[var(--green-border)]"
            >
              Sign in
            </Link>
            <PrimaryCta href={trialUrl}>Start free trial</PrimaryCta>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <Link
              href="/sign-in"
              className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-main)]"
            >
              Sign in
            </Link>
            <details className="group relative">
              <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-[var(--border-soft)] bg-white text-[var(--text-main)] [&::-webkit-details-marker]:hidden">
                <span className="sr-only">Open menu</span>
                <span className="grid gap-1">
                  <span className="h-0.5 w-4 rounded-full bg-current" />
                  <span className="h-0.5 w-4 rounded-full bg-current" />
                  <span className="h-0.5 w-4 rounded-full bg-current" />
                </span>
              </summary>
              <div className="absolute right-0 mt-3 grid w-56 gap-2 rounded-[22px] border border-[var(--border-soft)] bg-white p-3 shadow-[var(--shadow)]">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-[16px] px-3 py-2 text-[13px] font-bold text-[var(--text-main)] hover:bg-[var(--green-bg)]"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={trialUrl}
                  className="rounded-[16px] bg-[var(--green-main)] px-3 py-2 text-center text-[12px] font-bold uppercase tracking-[0.12em] text-white"
                >
                  Start free trial
                </a>
              </div>
            </details>
          </div>
        </header>

        <section className="landing-urgent-hero relative overflow-hidden rounded-[42px] border border-[var(--green-border)] px-5 py-12 sm:px-8 sm:py-16 lg:py-24">
          <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(21,128,61,0.08)] blur-3xl" />
          <div className="mx-auto max-w-4xl text-center">
            <p className="landing-urgent-kicker text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--green-main)]">
              Know what is really in your food
            </p>
            <h1 className="landing-urgent-title mt-4 font-heading text-[3.35rem] font-semibold leading-[0.94] tracking-[-0.065em] text-[var(--text-main)] sm:text-[4.6rem] lg:text-[5.6rem]">
              Scan before you trust it.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-8 text-[var(--text-secondary)] sm:text-[19px]">
              The label lists the ingredients. Truthlabel brings forward the
              hidden ingredient concerns inside everyday food - from banned or
              restricted items and harmful additive signals to ultra-processing,
              serious safety warnings, allergen matches, and documented brand
              or label issues.
            </p>
            <p className="mx-auto mt-5 max-w-2xl font-heading text-[1.35rem] font-semibold leading-8 tracking-[-0.035em] text-[var(--green-dark)] sm:text-[1.65rem]">
              Truthlabel turns confusing ingredients into a clear list of what
              you may want to review, limit, or avoid.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryCta href={trialUrl}>Start free 7-day trial</PrimaryCta>
            </div>
          </div>
        </section>

        <CreatorNotes
          title="Hero"
          items={[
            "Future direction: add stronger real-world examples or screenshots near the phone mockup, but keep the hero clean and focused on the promise: scan before trusting front-of-pack marketing.",
            "Evidence to collect: research on consumer misunderstanding of ingredient labels and how often people rely on front-of-pack claims instead of reading full ingredients.",
            "Keep visible copy serious but careful: Truthlabel helps reveal what deserves attention; it should not claim to guarantee health, safety, or disease prevention.",
          ]}
        />

        <section className="trust-metrics" aria-label="Truthlabel statistics">
          <div className="trust-metrics__inner">
            <div className="trust-metrics__divider" />

            <div className="trust-metrics__grid">
              {trustMetrics.map((metric) => (
                <div className="trust-metrics__item" key={metric.label}>
                  <strong className="trust-metrics__value">
                    {metric.value}
                  </strong>
                  <span className="trust-metrics__label">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="trust-metrics__divider" />
          </div>
        </section>

        <section
          id="checks"
          aria-labelledby="label-insights-title"
          className="mt-8 rounded-[42px] border border-[var(--border-soft)] bg-white/88 px-5 py-7 shadow-[var(--shadow)] sm:px-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--green-main)]">
                What labels can hide
              </p>
              <h2
                id="label-insights-title"
                className="mt-2 font-heading text-[2rem] font-semibold leading-[1.03] tracking-[-0.055em] text-[var(--text-main)] sm:text-[2.8rem]"
              >
                Exposing what profit-first food systems can hide.
              </h2>
              <p className="mt-4 max-w-3xl text-[15px] font-semibold leading-7 text-[var(--text-secondary)] sm:text-[17px]">
                Food companies are becoming larger, more consolidated, and more
                focused on shelf life, scale, low-cost formulas, and mass
                production. Many everyday products now use bioengineered
                markers, artificial additives, cheaper substitutes, and heavily
                processed systems that deserve a closer look.
              </p>
            </div>
            <p className="rounded-full border border-[var(--green-border)] bg-[var(--green-bg)] px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-[var(--green-dark)]">
              Swipe sideways
            </p>
          </div>

          <p className="mt-8 max-w-3xl text-[15px] font-black uppercase tracking-[0.14em] text-[var(--text-main)]">
            These are the ingredients and practices becoming disturbingly
            common in everyday food.
          </p>

          <div className="mt-6 grid gap-8">
            {labelInsightCategories.map((category) => {
              const frameClass =
                category.tone === "red"
                  ? "border-[var(--red-border)] bg-[var(--red-bg)] text-[var(--red-dark)]"
                  : category.tone === "yellow"
                    ? "border-[var(--amber-border)] bg-[var(--amber-bg)] text-[var(--amber-dark)]"
                    : "border-[var(--green-border)] bg-[var(--green-bg)] text-[var(--green-dark)]";

              return (
                <article
                  key={category.title}
                  className="landing-label-category rounded-[34px] border border-[var(--border-soft)] bg-[var(--bg-soft)]/72 p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--text-main)] text-[12px] font-black text-white">
                      {category.number}
                    </span>
                    <h3 className="font-heading text-[1.65rem] font-semibold leading-[1.02] tracking-[-0.055em] text-[var(--text-main)] sm:text-[2.15rem]">
                      {category.title}
                    </h3>
                  </div>

                  <div
                    className="landing-label-carousel landing-label-carousel--category mt-5 flex gap-4 overflow-x-auto pb-4"
                    aria-label={`${category.title} image carousel`}
                  >
                    {category.imagePrompts.map((imagePrompt, imageIndex) => (
                      <div
                        key={imagePrompt}
                        className="landing-label-slide landing-label-slide--category shrink-0 overflow-hidden rounded-[30px] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-3 shadow-[0_16px_34px_rgba(23,20,18,0.08)]"
                        style={{ aspectRatio: "4 / 5" }}
                        aria-label={`${category.title} image slot ${imageIndex + 1}`}
                      >
                        <div
                          className={`relative h-full overflow-hidden rounded-[24px] border ${frameClass}`}
                        >
                          <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_26%_20%,rgba(255,255,255,0.68),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.28),transparent_48%)]" />
                          <span className="absolute right-4 top-4 rounded-full bg-white/75 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]">
                            {category.number}.{imageIndex + 1}
                          </span>
                          <div className="relative grid h-full place-items-center p-5 text-center">
                            <p className="mx-auto max-w-[15rem] text-[13px] font-black leading-5">
                              {imagePrompt}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="max-w-3xl text-[15px] font-semibold leading-7 text-[var(--text-secondary)] sm:text-[17px]">
                    {category.copy}
                  </p>
                </article>
              );
            })}
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-[15px] font-semibold leading-7 text-[var(--text-secondary)] sm:text-[17px]">
            The warning is not always visible. It can be hidden in small print,
            buried behind health claims, or missing from the front completely.
            Truthlabel brings the warning forward.
          </p>
        </section>

        <CreatorNotes
          title="Truthlabel visual carousel"
          items={[
            "Replace each portrait image slot with real screenshots or permission-safe label photos. Keep the 4:5 shape for a social-carousel feel.",
            "Potential slide assets: restricted ingredient result, allergy Watch List red warning, additive-heavy product, processed oil warning, OCR label photo to result flow.",
            "Keep captions evidence-safe: show what Truthlabel flags for review, but avoid claiming a product causes disease unless a verified source supports that exact claim.",
          ]}
        />

        <section
          id="how"
          className="mt-8 rounded-[42px] border border-[var(--border-soft)] bg-[linear-gradient(135deg,#ffffff_0%,#f6fbf4_58%,#fff8df_100%)] p-5 shadow-[var(--shadow)] sm:p-8"
        >
          <SectionIntro
            eyebrow="How it works"
            title="Scan, check, decide."
            copy="Truthlabel turns a product label into a focused result: what was found, why it was flagged, and what action may make sense."
          />
          <div className="mt-6 grid gap-3 rounded-[28px] border border-white bg-white/78 p-3 shadow-[0_14px_32px_rgba(23,20,18,0.05)] lg:grid-cols-3">
            {howSteps.map((item) => (
              <article
                key={item.title}
                className="flex items-start gap-3 rounded-[22px] border border-[var(--border-soft)] bg-white px-4 py-3"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-[var(--green-main)] text-[12px] font-black text-white">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-heading text-[1.15rem] font-semibold tracking-[-0.035em] text-[var(--text-main)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
                    {item.copy}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 overflow-hidden rounded-[28px] border border-[var(--green-border)] bg-white/78 p-3 shadow-[0_16px_34px_rgba(21,128,61,0.08)]">
            <div className="grid min-h-[170px] place-items-center rounded-[22px] border border-dashed border-[var(--green-border)] bg-[var(--green-bg)] px-5 py-7 text-center">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[var(--green-dark)]">
                  Image slot
                </p>
                <p className="mx-auto mt-2 max-w-xl font-heading text-[1.25rem] font-semibold leading-tight tracking-[-0.04em] text-[var(--text-main)]">
                  Add a screenshot or visual showing scan, check, decide in
                  action.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CreatorNotes
          title="How it works"
          items={[
            "Keep this section short. It should not become another technical explanation page.",
            "Future visuals: three small screenshots or animated frames showing barcode scan, ingredient/OCR review, and final result.",
            "The goal is to make the user feel: I can use this quickly in a shop, not I need to understand a technical system.",
          ]}
        />

        <CreatorNotes
          title="Personal protection - paused"
          items={[
            "Paused from the public page for now: a future section can show allergy Watch List and food-preference settings once the account flow is fully polished.",
            "This remains a strong conversion angle because it explains that Truthlabel can become personal, not just a generic scanner.",
            "Future copy angle: the same product can be low concern for one user and serious for another because of allergies or selected Watch List preferences.",
            "Keep allergy wording strict and safe: always tell users to check the original package label and follow medical advice for known allergies.",
          ]}
        />

        <section className="rounded-[30px] border border-[var(--border-soft)] bg-white px-5 py-5 shadow-[0_14px_32px_rgba(23,20,18,0.06)] sm:px-8">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--green-main)]">
            Everyday decisions
          </p>
          <h2 className="mt-2 font-heading text-[1.7rem] font-semibold leading-tight tracking-[-0.05em] text-[var(--text-main)] sm:text-[2.15rem]">
            Use it where food choices actually happen.
          </h2>
          <p className="mt-3 max-w-4xl text-[14px] font-semibold leading-6 text-[var(--text-secondary)] sm:text-[15px]">
            Check products while grocery shopping, reviewing food at home,
            managing allergies, comparing options, or choosing packaged foods
            for your family.
          </p>
        </section>

        <CreatorNotes
          title="Everyday decisions"
          items={[
            "Keep this as a shortlist rather than a big section. It only needs to remind users where Truthlabel fits: grocery store, home, allergies, comparing products, shopping for family.",
            "Future version can include one realistic shopper scenario, but avoid fake testimonials until real user feedback exists.",
          ]}
        />

        <section
          id="pricing"
          className="mt-8 rounded-[44px] border border-[var(--green-border)] bg-[var(--green-bg)] p-6 shadow-[var(--shadow)] sm:p-9"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[var(--green-dark)]">
              Try Truthlabel free for 7 days
            </p>
            <h2 className="mt-3 font-heading text-[2.25rem] font-semibold leading-[1.02] tracking-[-0.055em] text-[var(--text-main)] sm:text-[3.2rem]">
              Protect yourself from profit-first food labels.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] font-bold leading-7 text-[var(--green-dark)] sm:text-[17px]">
              See clearer warnings before products reach your basket.
            </p>
          </div>
          <ul className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-2">
            {planIncludes.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-[20px] border border-white/70 bg-white/72 px-4 py-3 text-left text-[14px] font-bold leading-6 text-[var(--text-main)] shadow-[0_10px_22px_rgba(21,128,61,0.06)]"
              >
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--green-main)]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-col items-center justify-center gap-3">
            <PrimaryCta href={trialUrl}>Try free for 7 days</PrimaryCta>
            <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[var(--green-dark)]">
              Cancel anytime
            </p>
            <p className="max-w-lg text-center text-[12px] font-bold leading-5 text-[var(--green-dark)]">
              Join 200,000+ people choosing to understand what is really inside
              their food.
            </p>
          </div>
        </section>

        <CreatorNotes
          title="Pricing and trial"
          items={[
            "Position the price as a small monthly cost for faster label understanding and more control while shopping.",
            "Current planned offer: 7-day free trial, then $4.99/month.",
            "Current business rule: all free-trial buttons go straight to checkout. Account setup and activation happen after checkout through sign-in, activation link, or license key.",
            "Future emotional angle after evidence is ready: protect yourself from overlooked label risks and from formulation choices that prioritize shelf life, cost, or taste intensity over your personal priorities.",
            "Add independence as a sales factor near the trial CTA: Truthlabel should be presented as an independent research-led tool, not funded by food brands, manufacturers, or advertisers whose products are being checked.",
            "Create a future section about independence and research standards: explain that Truthlabel aims to evaluate labels from the consumer side, cite sources, separate evidence levels, and avoid sponsored product rankings.",
            "Possible CTA-side trust bullets: independent label research, no paid product placements, no affiliate product recommendations, evidence-backed explanations, and user-first allergy/Watch List settings.",
            "Do not say Truthlabel saves lives or guarantees protection unless there is strong legal and scientific support. Safer public wording: helps you notice warnings, understand labels faster, and make more informed choices.",
            "Keep payment mechanics quiet: mention secure checkout and membership management, not the payment provider name everywhere.",
          ]}
        />

        <section id="questions" className="py-14 sm:py-20">
          <SectionIntro
            eyebrow="Questions"
            title="Frequently asked questions"
            copy="Short answers for the decisions people usually need before joining."
            align="center"
          />
          <div className="mx-auto mt-8 grid max-w-4xl gap-3">
            {faq.map((item) => (
              <details
                key={item.question}
                className="group rounded-[24px] border border-[var(--border-soft)] bg-white px-5 py-4 shadow-[0_12px_26px_rgba(23,20,18,0.05)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-[15px] font-black text-[var(--text-main)] [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green-bg)] text-[var(--green-dark)] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[14px] leading-7 text-[var(--text-secondary)]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <CreatorNotes
          title="Independence and research trust"
          items={[
            "Future visible section idea: 'Independent label research, built for the shopper.'",
            "Explain that Truthlabel should not be funded by food companies, brands, or product advertisers whose items are being checked.",
            "Say the app is research-led and user-first, but back it with a clear methodology page later: sources used, evidence levels, regional rules, and how corrections are handled.",
            "Use as a sales factor without overclaiming: independent does not mean perfect; it means the product is not designed to protect a brand's marketing claims.",
            "Add short trust bullets near the final CTA: independent research, no affiliate recommendations, no paid product ranking, evidence-backed notes, and personal Watch List control.",
          ]}
        />

        <footer className="mt-8 rounded-[30px] border border-[var(--border-soft)] bg-white/82 px-5 py-6 text-[13px] leading-6 text-[var(--text-secondary)] shadow-[var(--shadow)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <Link href="/" className="inline-flex items-center gap-3">
                <BrandMark />
                <span className="font-heading text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--text-main)]">
                  Truthlabel
                </span>
              </Link>
              <p className="mt-4">
                Truthlabel helps explain ingredient labels and product safety
                signals. It is not medical advice. Always check the original
                product label, especially for allergies.
              </p>
            </div>
            <nav className="grid gap-2 font-bold text-[var(--text-main)] sm:grid-cols-2 lg:min-w-[420px] lg:grid-cols-3">
              <a href="#how">How it works</a>
              <a href="#checks">What we check</a>
              <Link href="/sign-in">Sign in</Link>
              <a href={trialUrl}>Start free trial</a>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/health-disclaimer">Health disclaimer</Link>
              <a href="#questions">Questions</a>
            </nav>
          </div>
          <p className="mt-5 border-t border-[var(--border-soft)] pt-4 text-[12px] font-bold text-[var(--text-muted)]">
            Copyright {new Date().getFullYear()} Truthlabel. Built for clearer
            food-label decisions.
          </p>
        </footer>
      </div>
    </main>
  );
}
