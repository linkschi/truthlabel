import type { Metadata } from "next";
import Link from "next/link";

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

const checkHighlights = [
  {
    title: "Banned or restricted items",
    copy:
      "Some ingredients are restricted, revoked, or not permitted in supported regions. Truthlabel brings those signals forward.",
    tone: "red",
  },
  {
    title: "Personal allergen matches",
    copy:
      "Your allergy Watch List changes what matters. A normal ingredient for one person can be a personal red warning for another.",
    tone: "red",
  },
  {
    title: "Additives and processing load",
    copy:
      "Colors, sweeteners, preservatives, processed oils, and engineered-food markers can be easy to miss in a long label.",
    tone: "yellow",
  },
  {
    title: "Verified safety signals",
    copy:
      "When official recall or safety data is available, Truthlabel can help surface it without claiming missing data proves safety.",
    tone: "yellow",
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
    copy: "Scan the barcode, use the camera, upload a label photo, or enter ingredients manually.",
  },
  {
    step: "02",
    title: "Check",
    copy:
      "Truthlabel checks ingredient, allergy, processing, regulatory, and safety rules where data is available.",
  },
  {
    step: "03",
    title: "Decide",
    copy:
      "See what was found, why it was flagged, and whether you may want to limit or avoid the product.",
  },
];

const checkGroups = [
  {
    title: "Immediate safety",
    items: [
      {
        title: "Banned and restricted ingredients",
        copy:
          "See ingredients prohibited, restricted, or being removed from food use in supported regions.",
      },
      {
        title: "Allergy Watch List matches",
        copy:
          "Receive a direct warning when a product contains an allergen you selected.",
      },
      {
        title: "Recalls and safety alerts",
        copy:
          "Bring serious product-specific safety information forward when verified data is available.",
      },
    ],
  },
  {
    title: "Ingredient concerns",
    items: [
      {
        title: "Artificial colors and sweeteners",
        copy:
          "Identify artificial additives and understand why they were flagged.",
      },
      {
        title: "Preservatives and additive load",
        copy:
          "See individual concerns and products containing a high number of flagged additives.",
      },
      {
        title: "Processed oils and fats",
        copy:
          "Distinguish ordinary oils from heavily processed fats and industrial trans-fat sources.",
      },
      {
        title: "Cancer-related concerns",
        copy:
          "Surface ingredients and food exposures with possible, probable, or established cancer-related evidence.",
      },
    ],
  },
  {
    title: "Food construction and transparency",
    items: [
      {
        title: "Ultra-processing indicators",
        copy:
          "See when a product relies on isolated, reconstructed, flavored, stabilized, or modified ingredients.",
      },
      {
        title: "Bioengineered and cell-grown markers",
        copy:
          "Highlight genetically engineered, cell-cultured, or precision-fermented ingredients when these matter to you.",
      },
      {
        title: "Unclear labeling",
        copy:
          "Identify vague terms that make it difficult to know exactly what a product contains.",
      },
    ],
  },
];

const allergyOptions = [
  "Peanut",
  "Milk",
  "Egg",
  "Sesame",
  "Wheat",
  "Shellfish",
];

const preferenceOptions = [
  "GMO or bioengineered ingredients",
  "Cell-cultured ingredients",
  "Precision-fermented proteins",
  "Artificial colors",
  "Artificial sweeteners",
  "Processed oils",
  "Ultra-processed foods",
];

const useCases = [
  {
    title: "Grocery shopping",
    copy: "Check unfamiliar products before putting them in your basket.",
  },
  {
    title: "At home",
    copy: "Review products already stored in your kitchen.",
  },
  {
    title: "Managing allergies",
    copy:
      "Bring selected allergens forward instead of searching through the entire label.",
  },
  {
    title: "Choosing between products",
    copy:
      "Compare which option has fewer concerns and a simpler ingredient profile.",
  },
  {
    title: "Shopping for family",
    copy:
      "Make more informed decisions about the packaged foods brought into your home.",
  },
];

const planIncludes = [
  "7-day free trial",
  "Full barcode scanning",
  "Complete ingredient analysis",
  "Personalized allergy Watch List",
  "Food-preference settings",
  "Green, yellow, and red explanations",
  "Serious ingredient alerts",
  "Sign-in based account access",
  "Future improvements included",
];

const faq = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes. New Truthlabel accounts receive a 7-day free trial so you can test the scanner with real products before continuing with paid access.",
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
      "Create an account to start the 7-day trial. After the trial, subscription billing and membership management are handled through secure checkout.",
  },
  {
    question: "Can I manage my membership?",
    answer:
      "Yes. Billing and membership management are handled through the secure subscription checkout flow.",
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
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-[var(--green-main)] shadow-[0_14px_30px_rgba(21,128,61,0.18)]">
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
      className="inline-flex items-center justify-center rounded-full border border-transparent bg-[var(--green-main)] px-6 py-3 text-[13px] font-bold uppercase tracking-[0.15em] text-white shadow-[0_18px_40px_rgba(21,128,61,0.23)] transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)] focus:outline-none focus:ring-4 focus:ring-[rgba(21,128,61,0.18)]"
    >
      {children}
    </a>
  );
}

function SecondaryCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-[var(--border-soft)] bg-white px-6 py-3 text-[13px] font-bold uppercase tracking-[0.15em] text-[var(--text-main)] shadow-[0_12px_30px_rgba(23,20,18,0.06)] transition hover:-translate-y-0.5 hover:border-[var(--green-border)] focus:outline-none focus:ring-4 focus:ring-[rgba(21,128,61,0.12)]"
    >
      {children}
    </a>
  );
}

function MiniSignal({
  tone,
  label,
  count,
}: {
  tone: "red" | "yellow" | "green";
  label: string;
  count: string;
}) {
  const toneClass =
    tone === "red"
      ? "border-[var(--red-border)] bg-[var(--red-bg)] text-[var(--red-dark)]"
      : tone === "yellow"
        ? "border-[var(--amber-border)] bg-[var(--amber-bg)] text-[var(--amber-dark)]"
        : "border-[var(--green-border)] bg-[var(--green-bg)] text-[var(--green-dark)]";

  return (
    <div className={`rounded-[18px] border px-3 py-2 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
          {label}
        </span>
        <span className="text-[13px] font-black">{count}</span>
      </div>
    </div>
  );
}

function OptionPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--green-border)] bg-white px-3 py-2 text-[12px] font-bold text-[var(--green-dark)] shadow-[0_8px_18px_rgba(21,128,61,0.06)]">
      {children}
    </span>
  );
}

export default function LandingPage() {
  const checkoutUrl = getCheckoutUrl();
  const trialUrl = "/create-account";

  return (
    <main className="min-h-screen overflow-hidden px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="sticky top-3 z-30 flex items-center justify-between gap-4 rounded-[28px] border border-white/75 bg-white/85 px-4 py-3 shadow-[var(--shadow)] backdrop-blur-xl">
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

        <section className="relative grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
          <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(21,128,61,0.08)] blur-3xl" />
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--green-main)]">
              Know what is really in your food
            </p>
            <h1 className="mt-4 max-w-3xl font-heading text-[3.35rem] font-semibold leading-[0.94] tracking-[-0.065em] text-[var(--text-main)] sm:text-[4.6rem] lg:text-[5.6rem]">
              Scan before you trust it.
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-8 text-[var(--text-secondary)] sm:text-[19px]">
              Truthlabel turns confusing ingredient lists into clear,
              personalized findings - helping you spot banned ingredients,
              allergens, additive concerns, heavy processing, and ingredients
              you prefer to avoid.
            </p>
            <p className="mt-5 max-w-2xl font-heading text-[1.35rem] font-semibold leading-8 tracking-[-0.035em] text-[var(--green-dark)] sm:text-[1.65rem]">
              The label tells you what is inside. Truthlabel tells you what
              deserves your attention.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryCta href={trialUrl}>Start free 7-day trial</PrimaryCta>
              <SecondaryCta href="#how">See how it works</SecondaryCta>
            </div>
            <p className="mt-4 text-[13px] font-bold text-[var(--text-secondary)]">
              Clear findings. Personal Watch Lists. Simple explanations. Trial
              starts when you create an account.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[430px]">
            <div className="absolute -left-8 top-20 h-28 w-28 rounded-full bg-[rgba(252,211,77,0.38)] blur-2xl" />
            <div className="absolute -right-8 bottom-20 h-32 w-32 rounded-full bg-[rgba(200,30,30,0.12)] blur-2xl" />
            <div className="relative rounded-[46px] border border-[var(--border-soft)] bg-[var(--text-main)] p-3 shadow-[0_28px_80px_rgba(23,20,18,0.24)]">
              <div className="rounded-[36px] bg-[var(--bg-page)] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-12 w-12 rounded-[18px] bg-[linear-gradient(135deg,#7c2d12,#fcd34d_48%,#14532d)]" />
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        Product scan
                      </p>
                      <p className="font-heading text-[1.1rem] font-semibold tracking-[-0.03em] text-[var(--text-main)]">
                        Chocolate Cereal
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--red-main)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white">
                    72
                  </span>
                </div>

                <div className="mt-5 rounded-[24px] border border-[var(--red-border)] bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--red-dark)]">
                    Immediate alerts
                  </p>
                  <div className="mt-3 grid gap-2">
                    <MiniSignal tone="red" label="Red No. 3" count="1" />
                    <MiniSignal tone="yellow" label="Additive concerns" count="4" />
                    <MiniSignal tone="yellow" label="Flavor system" count="1" />
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-[var(--border-soft)] bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Quick overview
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <MiniSignal tone="red" label="Warnings" count="Yes" />
                    <MiniSignal tone="yellow" label="Review" count="5" />
                    <MiniSignal tone="green" label="Simple items" count="3" />
                    <MiniSignal tone="green" label="Allergen match" count="No" />
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] bg-[var(--green-main)] p-4 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">
                    Final result
                  </p>
                  <p className="mt-1 font-heading text-[1.5rem] font-semibold tracking-[-0.04em]">
                    Recommended to avoid
                  </p>
                  <p className="mt-2 text-[12px] leading-5 text-white/82">
                    Multiple warning signals were found. Truthlabel explains the
                    reason before you decide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="checks"
          className="rounded-[42px] border border-[var(--border-soft)] bg-white p-5 shadow-[var(--shadow)] sm:p-8"
        >
          {/* Future visual note: add compact real screenshots/photos here - banned/restricted examples, confusing labels, bioengineered markers, additive-heavy products, and Truthlabel result screens. Keep it evidence-safe and do not imply every example causes harm. */}
          <SectionIntro
            eyebrow="What Truthlabel checks"
            title="The label details that are easy to overlook."
            copy="Front-of-pack claims can be simple. Ingredient labels are not. Truthlabel scans for the warning signals, personal matches, and processing markers that deserve your attention before a product reaches your basket."
            align="center"
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {checkHighlights.map((highlight) => {
              const toneClass =
                highlight.tone === "red"
                  ? "border-[var(--red-border)] bg-[var(--red-bg)]"
                  : "border-[var(--amber-border)] bg-[var(--amber-bg)]";

              return (
                <article
                  key={highlight.title}
                  className={`rounded-[28px] border p-5 ${toneClass}`}
                >
                  <h3 className="font-heading text-[1.3rem] font-semibold leading-tight tracking-[-0.04em] text-[var(--text-main)]">
                    {highlight.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">
                    {highlight.copy}
                  </p>
                </article>
              );
            })}
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {checkGroups.map((group) => (
              <article
                key={group.title}
                className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--bg-soft)] p-5"
              >
                <h3 className="font-heading text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--green-dark)]">
                  {group.title}
                </h3>
                <div className="mt-4 grid gap-3">
                  {group.items.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3"
                    >
                      <p className="text-[14px] font-black text-[var(--text-main)]">
                        {item.title}
                      </p>
                      <p className="mt-2 text-[13px] leading-6 text-[var(--text-secondary)]">
                        {item.copy}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="how"
          className="mt-8 rounded-[42px] border border-[var(--border-soft)] bg-[linear-gradient(135deg,#ffffff_0%,#f6fbf4_58%,#fff8df_100%)] p-5 shadow-[var(--shadow)] sm:p-8"
        >
          <SectionIntro
            eyebrow="How it works"
            title="Scan, check, decide."
            copy="Truthlabel turns a product label into a focused result: what was found, why it was flagged, and what action may make sense."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {howSteps.map((item) => (
              <article
                key={item.title}
                className="rounded-[30px] border border-white bg-white/82 p-6 shadow-[0_14px_32px_rgba(23,20,18,0.06)]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--green-main)] font-heading text-[1rem] font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-5 font-heading text-[1.65rem] font-semibold tracking-[-0.04em] text-[var(--text-main)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-[var(--text-secondary)]">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[34px] border border-[var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_32px_rgba(23,20,18,0.06)] sm:px-8">
          {/* Future visual note: replace this compact strip with a carousel of real app screenshots: scan input, Quick Overview, Deep Exposure explanations, Final Verdict, and allergy Watch List result. */}
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--green-main)]">
                App in action
              </p>
              <h2 className="mt-3 font-heading text-[1.85rem] font-semibold leading-tight tracking-[-0.05em] text-[var(--text-main)] sm:text-[2.3rem]">
                Results should feel quick, visual, and clear.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Scan label", "See warnings", "Read action"].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-[var(--green-border)] bg-[var(--green-bg)] px-4 py-4 text-[13px] font-black text-[var(--green-dark)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <SectionIntro
            eyebrow="Personal protection"
            title="Built around what matters to you"
            copy="Truthlabel does not treat every user as if they have the same concerns."
            align="center"
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[36px] border border-[var(--green-border)] bg-[var(--green-bg)] p-6 shadow-[0_16px_36px_rgba(21,128,61,0.08)]">
              <h3 className="font-heading text-[1.85rem] font-semibold tracking-[-0.045em] text-[var(--text-main)]">
                Your allergy Watch List
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-[var(--text-secondary)]">
                Select the allergens that affect you. Truthlabel can bring
                direct matches forward as personal red warnings.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {allergyOptions.map((item) => (
                  <OptionPill key={item}>{item}</OptionPill>
                ))}
              </div>
              <p className="mt-5 text-[13px] font-bold leading-6 text-[var(--green-dark)]">
                Always confirm the original package label when managing
                allergies.
              </p>
            </article>
            <article className="rounded-[36px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_16px_36px_rgba(23,20,18,0.06)]">
              <h3 className="font-heading text-[1.85rem] font-semibold tracking-[-0.045em] text-[var(--text-main)]">
                Your food preferences
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-[var(--text-secondary)]">
                Choose which food-production and ingredient markers you want
                Truthlabel to highlight.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {preferenceOptions.map((item) => (
                  <OptionPill key={item}>{item}</OptionPill>
                ))}
              </div>
            </article>
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center font-heading text-[1.5rem] font-semibold leading-tight tracking-[-0.04em] text-[var(--green-dark)] sm:text-[2rem]">
            The same product can mean something different depending on what you
            personally avoid.
          </p>
        </section>

        <section className="rounded-[34px] border border-[var(--border-soft)] bg-white px-5 py-6 shadow-[0_14px_32px_rgba(23,20,18,0.06)] sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--green-main)]">
                Everyday decisions
              </p>
              <h2 className="mt-2 font-heading text-[1.85rem] font-semibold leading-tight tracking-[-0.05em] text-[var(--text-main)] sm:text-[2.35rem]">
                Use it where food choices actually happen.
              </h2>
            </div>
            <p className="max-w-lg text-[14px] leading-6 text-[var(--text-secondary)]">
              A quick check can help you notice serious warnings, recognize
              heavily processed products, and stay aware of ingredients that
              matter to you.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {useCases.map((item) => (
              <div
                key={item.title}
                className="rounded-full border border-[var(--green-border)] bg-[var(--green-bg)] px-4 py-2 text-[12px] font-black text-[var(--green-dark)]"
              >
                {item.title}
              </div>
            ))}
          </div>
        </section>

        <section
          id="pricing"
          className="mt-8 grid gap-6 rounded-[44px] border border-[var(--green-border)] bg-white p-5 shadow-[var(--shadow)] sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
        >
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[var(--green-main)]">
              Trial then full access
            </p>
            <h2 className="mt-3 font-heading text-[2.25rem] font-semibold leading-[1.02] tracking-[-0.055em] text-[var(--text-main)] sm:text-[3.1rem]">
              7 days free, then $3.99/month.
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-[var(--text-secondary)] sm:text-[18px]">
              Use Truthlabel as a protection layer for modern food labels:
              banned or restricted ingredients, personal allergy matches,
              additive load, processing markers, and safety signals when data is
              available.
            </p>
            <p className="mt-4 rounded-[20px] border border-[var(--border-soft)] bg-[var(--bg-soft)] px-4 py-3 text-[13px] font-bold leading-6 text-[var(--text-main)]">
              Start with the 7-day trial. If Truthlabel helps you shop with
              more awareness, continue for $3.99/month. Checkout confirms the
              current price before payment.
            </p>
          </div>
          <div className="rounded-[34px] border border-[var(--green-border)] bg-[var(--green-bg)] p-6">
            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[var(--green-dark)]">
              Truthlabel Full Access
            </p>
            <h3 className="mt-3 font-heading text-[2rem] font-semibold tracking-[-0.05em] text-[var(--text-main)]">
              Trial access now
            </h3>
            <ul className="mt-5 grid gap-3">
              {planIncludes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[14px] font-bold leading-6 text-[var(--text-main)]"
                >
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--green-main)]" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <PrimaryCta href={trialUrl}>Start free trial</PrimaryCta>
              <Link
                href={checkoutUrl}
                className="inline-flex items-center justify-center rounded-full border border-[var(--green-border)] bg-white px-5 py-3 text-[12px] font-black uppercase tracking-[0.14em] text-[var(--green-dark)]"
              >
                Subscribe
              </Link>
            </div>
            <p className="mt-4 text-[12px] font-bold leading-5 text-[var(--green-dark)]">
              Trial access is created through your Truthlabel account. Secure
              subscription checkout confirms billing before payment.
            </p>
          </div>
        </section>

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

        <section className="rounded-[44px] border border-[var(--border-soft)] bg-[var(--text-main)] p-7 text-center text-white shadow-[0_28px_80px_rgba(23,20,18,0.22)] sm:p-10">
          <h2 className="font-heading text-[2.55rem] font-semibold leading-[0.98] tracking-[-0.06em] sm:text-[4rem]">
            Know before it reaches your basket.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-8 text-white/78">
            Understand the ingredients. See the concerns. Make the choice with
            greater confidence.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryCta href={trialUrl}>Start free trial</PrimaryCta>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white px-6 py-3 text-[13px] font-bold uppercase tracking-[0.15em] text-[var(--text-main)]"
            >
              Already subscribed? Sign in
            </Link>
          </div>
          <p className="mt-7 font-heading text-[1.4rem] font-semibold tracking-[-0.04em] text-white/72">
            Scan before you trust it.
          </p>
        </section>

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
              <a href={checkoutUrl}>Subscribe</a>
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
