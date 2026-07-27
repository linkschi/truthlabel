import type { Metadata } from "next";
import Link from "next/link";
import LandingConcernCarousel from "@/components/LandingConcernCarousel";
import LandingFaq, { type LandingFaqItem } from "@/components/LandingFaq";
import "./homepage-theme.css";

export const metadata: Metadata = {
  title: "Truthlabel - Scan before you trust it",
  description:
    "Truthlabel checks food ingredients for serious warnings, allergens, additives, heavy processing, and product safety signals before you buy.",
};

const genuineReviews: Array<{
  rating: number;
  review: string;
  name: string;
  benefitTag: string;
  verified: boolean;
}> = [];

const gumroadCheckoutUrl =
  process.env.NEXT_PUBLIC_GUMROAD_CHECKOUT_URL?.trim() ||
  "https://truthlabel.gumroad.com/l/fnoakd?wanted=true";

const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#checks-grid", label: "What we check" },
  ...(genuineReviews.length > 0 ? [{ href: "#reviews", label: "Reviews" }] : []),
  { href: "#questions", label: "Questions" },
];

const credibilityItems = [
  {
    title: "Banned ingredient checks",
    copy: "Regulatory restriction signals are separated from ordinary review notes.",
    icon: "ban",
  },
  {
    title: "Personal allergy alerts",
    copy: "Selected allergens can become direct personal warnings.",
    icon: "shield",
  },
  {
    title: "Clear ingredient reasons",
    copy: "Every important finding explains what was detected and why.",
    icon: "list",
  },
  {
    title: "Private scan history",
    copy: "Your product history is built for your account, not the public page.",
    icon: "lock",
  },
];

const problemCards = [
  {
    title: "Unfamiliar ingredients",
    copy:
      "Most shoppers do not have time to research every additive, color, oil, and preservative.",
  },
  {
    title: "Important warnings get buried",
    copy:
      "Serious findings can disappear inside long ingredient lists and vague labeling.",
  },
  {
    title: "Everyone has different concerns",
    copy:
      "Allergies, food preferences, and ingredients to avoid are not the same for everyone.",
  },
];

const seriousWarnings = [
  {
    label: "Banned",
    title: "Banned ingredient detected",
    copy: "This ingredient is prohibited for food use in a supported region.",
  },
  {
    label: "Allergen",
    title: "Your allergen is present",
    copy: "This product directly contains an allergen on your Watch List.",
  },
  {
    label: "Recall",
    title: "Active product recall",
    copy: "This product or batch is connected to an official safety alert.",
  },
];

const checkCards = [
  {
    title: "Banned and restricted ingredients",
    copy: "See ingredients prohibited, revoked, or restricted for food use in supported regions.",
    icon: "ban",
  },
  {
    title: "Allergy Watch List",
    copy: "Bring selected allergens forward as direct personal warnings when found.",
    icon: "shield",
  },
  {
    title: "Cancer-related concerns",
    copy: "Separate possible, probable, and established evidence instead of mixing them together.",
    icon: "alert",
  },
  {
    title: "Artificial colors",
    copy: "Identify synthetic color additives and understand why they were flagged.",
    icon: "color",
  },
  {
    title: "Sweeteners",
    copy: "Spot artificial and non-sugar sweetener systems in drinks, snacks, and packaged foods.",
    icon: "drop",
  },
  {
    title: "Preservatives and additives",
    copy: "Review shelf-life systems, additive load, and ingredients used for stability.",
    icon: "plus",
  },
  {
    title: "Heavy-metal evidence",
    copy: "Use verified external data and category review markers without overclaiming contamination.",
    icon: "lab",
  },
  {
    title: "Processed oils and fats",
    copy: "Distinguish ordinary oils from processed-oil systems and industrial fat markers.",
    icon: "oil",
  },
  {
    title: "Ultra-processing",
    copy: "Surface isolated, modified, reconstructed, flavored, and highly structured food markers.",
    icon: "layers",
  },
  {
    title: "Ingredient integrity and fillers",
    copy: "Highlight extenders, binders, fillers, and food-construction signals when relevant.",
    icon: "grid",
  },
  {
    title: "Engineered-food markers",
    copy: "Identify bioengineered, cell-cultured, precision-fermented, and lab-made wording.",
    icon: "dna",
  },
  {
    title: "Brand and recall signals",
    copy: "Bring verified official safety alerts forward when product-specific data is available.",
    icon: "signal",
  },
];

const howSteps = [
  {
    number: "01",
    title: "Scan",
    copy: "Scan the barcode or enter it manually.",
  },
  {
    number: "02",
    title: "Check",
    copy:
      "Truthlabel analyzes the product using ingredient, allergy, processing, and safety rules.",
  },
  {
    number: "03",
    title: "Decide",
    copy:
      "Review what was found, why it matters, and whether you may want to limit or avoid it.",
  },
];

const allergyChips = ["Peanut", "Milk", "Egg", "Wheat", "Sesame", "Shellfish"];

const preferenceChips = [
  "GMO and bioengineered",
  "Cell-cultured",
  "Precision-fermented",
  "Artificial colors",
  "Artificial sweeteners",
  "Processed oils",
  "Ultra-processed food",
];

const historyRows = [
  {
    product: "Organic Rolled Oats",
    score: "94",
    verdict: "No major concerns",
    tone: "green",
  },
  {
    product: "Peanut Butter",
    score: "61",
    verdict: "Consume in moderation",
    tone: "yellow",
  },
  {
    product: "Nacho Cheese Chips",
    score: "22",
    verdict: "Recommended to avoid",
    tone: "red",
  },
];

const planIncludes = [
  "Full barcode scanning",
  "Complete ingredient analysis",
  "Personalized allergy Watch List",
  "Serious ingredient warnings",
  "Food-preference settings",
  "Scan history",
  "Full explanations",
  "Future improvements",
];

const trustItems = [
  {
    title: "Evidence-aware",
    copy:
      "Serious findings explain the ingredient, concern type, and supporting reason.",
  },
  {
    title: "Honest about uncertainty",
    copy:
      "Possible concerns, confirmed dangers, personal preferences, and overload warnings are described differently.",
  },
  {
    title: "User-controlled",
    copy:
      "Truthlabel supports informed choices but does not replace the product label or medical advice.",
  },
];

const faqItems: LandingFaqItem[] = [
  {
    question: "What does Truthlabel check?",
    answer:
      "Truthlabel checks ingredients across categories such as allergens, banned and restricted ingredients, artificial additives, sweeteners, preservatives, processed oils, ultra-processing, engineered-food markers, and verified safety alerts.",
  },
  {
    question: "Does yellow mean a product is dangerous?",
    answer:
      "Not necessarily. Yellow can mean a moderate review signal, processing marker, preference match, exposure-dependent concern, or unclear label wording.",
  },
  {
    question: "What causes a red result?",
    answer:
      "Red can come from a serious ingredient concern, verified regulatory action, personal allergen match, active safety alert, confirmed contamination signal, or high category load.",
  },
  {
    question: "Can Truthlabel replace the original product label?",
    answer:
      "No. Ingredients and manufacturing details can change. Always confirm the original package label, especially for allergies.",
  },
  {
    question: "How does the 7-day free trial work?",
    answer:
      "Begin the trial from checkout, then sign in to activate access, set preferences, and start scanning. Trial and billing details are confirmed before checkout is completed.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There is no long-term commitment, and future renewals can be canceled whenever you choose.",
  },
  {
    question: "How do I access Truthlabel after checkout?",
    answer:
      "After checkout, sign in with your account. If access does not connect automatically, use the activation link or license key from your purchase email.",
  },
  {
    question: "Is my scan history private?",
    answer:
      "Scan history is part of the protected app experience. The public landing page never displays a real signed-in user's private scan history.",
  },
];

function BrandMark() {
  return (
    <span className="landing-brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function Icon({ name }: { name: string }) {
  return (
    <svg
      aria-hidden="true"
      className="landing-icon"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {name === "ban" ? (
        <>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="m7.3 7.3 9.4 9.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      ) : name === "shield" || name === "lock" ? (
        <>
          <path d="M12 3.8 19 7v5.2c0 4.5-2.9 7-7 8.2-4.1-1.2-7-3.7-7-8.2V7l7-3.2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="m9 12 2 2 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </>
      ) : name === "list" ? (
        <>
          <path d="M8 7h10M8 12h10M8 17h7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
        </>
      ) : name === "alert" ? (
        <>
          <path d="M11 4.7 3.7 17.2A1.8 1.8 0 0 0 5.2 20h13.6a1.8 1.8 0 0 0 1.5-2.8L13 4.7a1.2 1.2 0 0 0-2 0Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M12 9v4M12 16.5h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </>
      ) : name === "layers" ? (
        <>
          <path d="m12 4 8 4-8 4-8-4 8-4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="m5 12 7 3.5 7-3.5M5 16l7 3.5 7-3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      ) : (
        <>
          <path d="M5 5h14v14H5V5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M8.5 9h7M8.5 12h7M8.5 15h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );
}

function PrimaryCta({
  children = "Begin my 7-day free trial",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a className={`landing-button landing-button--primary ${className}`} href={gumroadCheckoutUrl}>
      {children}
    </a>
  );
}

function SectionIntro({
  eyebrow,
  title,
  copy,
  centered = false,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "landing-section-intro landing-section-intro--center" : "landing-section-intro"}>
      {eyebrow ? <p className="landing-eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

function ResultPreview() {
  return (
    <div className="landing-result-preview" aria-label="Example Truthlabel result preview">
      <div className="landing-result-preview__top">
        <div className="landing-product-image" aria-hidden="true">
          <span>TL</span>
        </div>
        <div>
          <p>Truthlabel result</p>
          <h3>Chocolate Cereal</h3>
        </div>
      </div>

      <div className="landing-score-ring">
        <strong>42</strong>
        <span>/ 100</span>
      </div>

      <div className="landing-verdict-card">
        <p>Final verdict</p>
        <strong>Recommended to avoid</strong>
      </div>

      <div className="landing-finding landing-finding--red">
        <span>RED - BANNED</span>
        <strong>Red No. 3 detected</strong>
      </div>
      <div className="landing-finding landing-finding--yellow">
        <span>YELLOW - PROCESSING</span>
        <strong>High additive load</strong>
      </div>
      <div className="landing-finding landing-finding--yellow">
        <span>YELLOW - ADDITIVES</span>
        <strong>Artificial flavor system</strong>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link href="/" className="landing-logo" aria-label="Truthlabel home">
          <BrandMark />
          <span>Truthlabel</span>
        </Link>

        <nav className="landing-nav" aria-label="Public navigation">
          {navLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="landing-header-actions">
          <Link href="/sign-in" className="landing-sign-in">
            Sign in
          </Link>
          <PrimaryCta>Begin free trial</PrimaryCta>
        </div>

        <div className="landing-mobile-actions">
          <Link href="/sign-in" className="landing-sign-in">
            Sign in
          </Link>
          <details className="landing-mobile-menu">
            <summary aria-label="Open menu">
              <span />
              <span />
              <span />
            </summary>
            <div className="landing-mobile-panel">
              {navLinks.map((link) => (
                <a href={link.href} key={link.href}>
                  {link.label}
                </a>
              ))}
              <PrimaryCta>Begin free trial</PrimaryCta>
            </div>
          </details>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__copy">
          <p className="landing-eyebrow">Know what is really in your food</p>
          <h1>Scan before you trust it.</h1>
          <p>
            Truthlabel checks food ingredients for serious warnings, allergens,
            additives, heavy processing, and ingredients you may prefer to avoid.
          </p>
          <div className="landing-hero__actions">
            <PrimaryCta className="landing-hero__primary">
              Begin my 7-day free trial
            </PrimaryCta>
            <a className="landing-button landing-button--secondary" href="#how">
              See how it works
            </a>
          </div>
          <p className="landing-trust-line">
            7 days free - Cancel anytime - No long-term commitment
          </p>
        </div>
        <div className="landing-hero__visual">
          <ResultPreview />
        </div>
      </section>

      <section className="landing-credibility" aria-label="Truthlabel credibility highlights">
        {credibilityItems.map((item) => (
          <article key={item.title}>
            <span className="landing-credibility__icon">
              <Icon name={item.icon} />
            </span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="landing-problem">
        <SectionIntro
          centered
          title="Food labels should not leave you guessing."
          copy="Truthlabel brings the most important information forward."
        />
        <div className="landing-problem-grid">
          {problemCards.map((card) => (
            <article key={card.title}>
              <span />
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-concerns">
        <SectionIntro
          eyebrow="Consumer protection layer"
          title="Spot the warnings that are easy to miss."
          copy="Truthlabel turns hidden label signals into clear, focused findings before a product reaches your basket."
        />
        <LandingConcernCarousel />
      </section>

      <section className="landing-serious">
        <SectionIntro
          centered
          title="Serious findings should look serious."
          copy="Red warnings are reserved for stronger signals, not ordinary label noise."
        />
        <div className="landing-serious-grid">
          {seriousWarnings.map((warning) => (
            <article key={warning.title}>
              <span>{warning.label}</span>
              <h3>{warning.title}</h3>
              <p>{warning.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="checks-grid" className="landing-checks">
        <SectionIntro
          centered
          eyebrow="What Truthlabel checks"
          title="More than a basic nutrition score"
          copy="Truthlabel looks beyond calories and macros to explain ingredient and safety signals that may affect your decision."
        />
        <div className="landing-check-grid">
          {checkCards.map((card) => (
            <article key={card.title}>
              <span>
                <Icon name={card.icon} />
              </span>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="landing-how">
        <div className="landing-how__copy">
          <SectionIntro
            eyebrow="How it works"
            title="Scan. Check. Decide."
            copy="Truthlabel turns a product label into a focused result: what was found, why it was flagged, and what action may make sense."
          />
          <div className="landing-how-steps">
            {howSteps.map((step) => (
              <article key={step.title}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="landing-interface-preview" aria-label="Truthlabel scan flow preview">
          <div className="landing-interface-preview__phone">
            <div className="landing-interface-preview__bar" />
            <div className="landing-interface-preview__scan">
              <span />
              <strong>Barcode detected</strong>
              <p>Checking ingredients and safety signals</p>
            </div>
            <div className="landing-interface-preview__row landing-interface-preview__row--red">
              <span>Red</span>
              <p>Banned ingredient detected</p>
            </div>
            <div className="landing-interface-preview__row landing-interface-preview__row--yellow">
              <span>Yellow</span>
              <p>Processing markers found</p>
            </div>
            <div className="landing-interface-preview__row landing-interface-preview__row--green">
              <span>Green</span>
              <p>Simple ingredients found</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-personal">
        <SectionIntro
          centered
          eyebrow="Personalized protection"
          title="Built around what matters to you"
          copy="Truthlabel does not treat every user as if they have the same concerns."
        />
        <div className="landing-personal-grid">
          <article>
            <h3>Allergy Watch List</h3>
            <p>
              Selected allergens receive direct personal warnings when found in
              a product.
            </p>
            <div className="landing-chip-list">
              {allergyChips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          </article>
          <article>
            <h3>Food preferences</h3>
            <p>
              Choose which food-production and ingredient markers you personally
              want highlighted.
            </p>
            <div className="landing-chip-list landing-chip-list--yellow">
              {preferenceChips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="landing-history">
        <div>
          <SectionIntro
            eyebrow="Scan history"
            title="Keep track of what you scan"
            copy="This is a marketing preview only. A real signed-in user's private history is never shown on the public page."
          />
          <a className="landing-text-link" href="/sign-in">
            View your scan history
          </a>
        </div>
        <div className="landing-history-card" aria-label="Scan history example">
          {historyRows.map((row) => (
            <article className={`landing-history-row landing-history-row--${row.tone}`} key={row.product}>
              <div>
                <strong>{row.product}</strong>
                <span>{row.verdict}</span>
              </div>
              <p>{row.score}</p>
            </article>
          ))}
        </div>
      </section>

      {genuineReviews.length > 0 ? (
        <section id="reviews" className="landing-reviews">
          <SectionIntro
            centered
            title="What early Truthlabel users are saying"
          />
          <div className="landing-review-grid">
            {genuineReviews.map((review) => (
              <article key={`${review.name}-${review.review}`}>
                <span>{review.rating}/5</span>
                <p>{review.review}</p>
                <strong>{review.name}</strong>
                <em>{review.benefitTag}</em>
                {review.verified ? <small>Verified</small> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section id="pricing" className="landing-pricing">
        <div className="landing-pricing__card">
          <div>
            <p className="landing-eyebrow">Truthlabel Full Access</p>
            <h2>Begin your 7-day free trial</h2>
            <p>
              Get full access to Truthlabel and start checking the food you buy,
              eat, and bring home.
            </p>
          </div>
          <div className="landing-price">
            <strong>$4.99</strong>
            <span>/ month after trial</span>
          </div>
          <ul>
            {planIncludes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="landing-guarantee">
            <strong>Cancel Anytime Guarantee</strong>
            <p>No long-term commitment. Cancel future renewals whenever you choose.</p>
          </div>
          <PrimaryCta>Begin my 7-day free trial</PrimaryCta>
          <p className="landing-trust-line">
            7 days free - Cancel anytime - Secure checkout through Gumroad
          </p>
        </div>
      </section>

      <section className="landing-trust">
        <SectionIntro
          centered
          title="Clear about what Truthlabel can tell you"
        />
        <div className="landing-trust-grid">
          {trustItems.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="questions" className="landing-faq">
        <SectionIntro
          centered
          title="Questions before you start"
          copy="Short answers for the decisions people usually need before joining."
        />
        <LandingFaq items={faqItems} />
      </section>

      <section className="landing-final-cta">
        <h2>Know before it reaches your basket.</h2>
        <p>
          Understand the ingredients, see the warnings, and make the choice with
          greater confidence.
        </p>
        <PrimaryCta>Begin my 7-day free trial</PrimaryCta>
        <span>Cancel anytime - No long-term commitment</span>
      </section>

      <footer className="landing-footer">
        <div>
          <Link href="/" className="landing-logo" aria-label="Truthlabel home">
            <BrandMark />
            <span>Truthlabel</span>
          </Link>
          <p>
            Truthlabel helps explain ingredient labels and product safety
            signals. It is not medical advice. Always check the original product
            label, especially for allergies.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#how">How it works</a>
          <a href="#checks-grid">What we check</a>
          {genuineReviews.length > 0 ? <a href="#reviews">Reviews</a> : null}
          <a href="#questions">Questions</a>
          <Link href="/sign-in">Sign in</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/health-disclaimer">Health disclaimer</Link>
          <a href="mailto:support@truthlabel.app">Contact/support</a>
        </nav>
        <p>Copyright {new Date().getFullYear()} Truthlabel.</p>
      </footer>
    </main>
  );
}
