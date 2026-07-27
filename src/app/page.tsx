import type { Metadata } from "next";
import Link from "next/link";
import LandingConcernCarousel from "@/components/LandingConcernCarousel";
import LandingFaq, { type LandingFaqItem } from "@/components/LandingFaq";
import "./homepage-theme.css";

export const metadata: Metadata = {
  title: "Truthlabel - Scan before you trust it",
  description:
    "Truthlabel helps expose hidden ingredient and safety signals in everyday food, including banned ingredients, harmful additives, ultra-processing, and brand warnings.",
};

const genuineReviews: Array<{
  rating: number;
  review: string;
  name: string;
  benefitTag: string;
  verified: boolean;
}> = [];

const truthlabelCheckoutUrl = "https://truthlabel.gumroad.com/l/fnoakd?wanted=true";

const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#checks-grid", label: "What we check" },
  ...(genuineReviews.length > 0 ? [{ href: "#reviews", label: "Reviews" }] : []),
  { href: "#questions", label: "Questions" },
];

const checkCards = [
  {
    title: "Banned ingredients",
    copy: "Items banned or restricted in supported regions.",
    icon: "ban",
  },
  {
    title: "Allergy matches",
    copy: "Ingredients matching your allergy list.",
    icon: "shield",
  },
  {
    title: "Cancer-linked warnings",
    copy: "Ingredients with serious long-term concern signals.",
    icon: "alert",
  },
  {
    title: "Artificial colors",
    copy: "Synthetic colors added to food.",
    icon: "color",
  },
  {
    title: "Artificial sweeteners",
    copy: "Non-sugar sweetener systems.",
    icon: "drop",
  },
  {
    title: "Preservatives",
    copy: "Shelf-life and stability additives.",
    icon: "plus",
  },
  {
    title: "Heavy-metal review",
    copy: "Category or verified safety signals.",
    icon: "lab",
  },
  {
    title: "Processed oils",
    copy: "Seed oils and processed fat markers.",
    icon: "oil",
  },
  {
    title: "Ultra-processed foods",
    copy: "Modified, isolated, or reconstructed ingredients.",
    icon: "layers",
  },
  {
    title: "Fillers and binders",
    copy: "Extenders and food-construction markers.",
    icon: "grid",
  },
  {
    title: "Lab-made food",
    copy: "Bioengineered or cell-cultured wording.",
    icon: "dna",
  },
  {
    title: "Brand warnings",
    copy: "Recalls, alerts, and safety actions.",
    icon: "signal",
  },
];

const protectionChips = [
  "Allergy alerts",
  "Watch List matches",
  "Food preferences",
  "Avoid-list ingredients",
  "Personal red warnings",
];

const launchMetrics = [
  { label: "Independent", value: "Self-funded" },
  { label: "Trial", value: "7 days free" },
  { label: "Access", value: "$4.99/month" },
];

const planIncludes = [
  "Shop with Truthlabel: pick up a product, scan it, and see instant warnings",
  "Scan for banned or dangerous food",
  "Spot cancer-linked ingredients",
  "Check lab-made and bioengineered foods",
  "Identify ultra-processed products",
  "Get serious ingredient alerts",
  "Clear warnings in plain English",
  "Built by an independent, self-funded team - not a food company",
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
    <a className={`landing-button landing-button--primary ${className}`} href={truthlabelCheckoutUrl}>
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
      </section>

      <section className="landing-exposure-intro">
        <div className="landing-exposure-copy">
          <h2>
            Truthlabel exposes dangerous ingredients hidden in everyday food.
          </h2>
          <p>
            Truthlabel helps spot products &quot;banned&quot; in other
            countries, harmful additives, ultra-processing, and warning signals
            that are easy to miss.
          </p>
          <p>
            We expose brands with a history of &quot;misleading labels&quot;,
            safety violations, or serious product warnings.
          </p>
          <p>
            Then we turn those incidents into clear lists of things you may want
            to avoid.
          </p>
        </div>
        <div className="landing-media-slot landing-media-slot--scan">
          <span>Screenshot placeholder</span>
          <strong>Truthlabel scan result image goes here</strong>
          <p>Use this space for a real app scan screenshot or brand-trust result.</p>
        </div>
      </section>

      <section id="pricing" className="landing-pricing">
        <div className="landing-pricing__card">
          <div>
            <p className="landing-eyebrow">Truthlabel Full Access</p>
            <h2>Protect yourself from evil brands that put profit first</h2>
            <p>
              Try Truthlabel free for 7 days and start checking the food you
              buy, eat, and bring home.
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
            7 days free - Cancel anytime - No long-term commitment
          </p>
          <div className="landing-launch-metrics" aria-label="Truthlabel launch facts">
            {launchMetrics.map((metric) => (
              <span key={metric.label}>
                <strong>{metric.value}</strong>
                {metric.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-profit-section">
        <div className="landing-profit-lead">
          <SectionIntro
            eyebrow="Evidence and shopping context"
            title="Exposing evil brands that only care about profits"
            copy="Food companies are becoming more focused on profit and mass production. Many everyday products now contain lab-made ingredients, harmful cheaper substitutes, and heavily processed formulas that can raise serious health concerns."
          />
          <div className="landing-media-slot landing-media-slot--brands">
            <span>Image placeholder</span>
            <strong>Popular brands and people shopping</strong>
            <p>Add a visual showing everyday supermarket choices and brand evidence.</p>
          </div>
        </div>
        <div className="landing-profit-copy">
          <p>
            Some of these items are banned in other countries or states because
            of safety concerns. Through legal loopholes, they can still be sold
            to everyday families with little protection.
          </p>
        </div>
      </section>

      <section className="landing-concerns">
        <SectionIntro
          eyebrow="What is becoming common"
          title="Items and practices appearing more often in everyday food."
          copy="The danger is not always visible. It can be hidden in small print, buried behind health claims, or missing from the front completely."
        />
        <LandingConcernCarousel />
      </section>

      <section id="checks-grid" className="landing-checks">
        <SectionIntro
          centered
          eyebrow="What Truthlabel checks"
          title="More than basic ingredients"
          copy="Fast checks for the food warnings people usually miss."
        />
        <ul className="landing-check-list" aria-label="Truthlabel check categories">
          {checkCards.map((card) => (
            <li key={card.title}>
              <span className="landing-check-list__icon">
                <Icon name={card.icon} />
              </span>
              <strong>{card.title}</strong>
              <span>{card.copy}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="how" className="landing-how">
        <div className="landing-how__copy">
          <SectionIntro
            eyebrow="How our app works"
            title="Scan, check, decide."
            copy="Truthlabel turns a product label into a focused result. It shows what was found, why it was flagged, and what action may make sense."
          />
          <p className="landing-shopping-copy">
            Use it while shopping: pick up a product, scan it in the aisle, and
            get instant ingredient labels, warnings, and clear next steps.
          </p>
        </div>
        <div className="landing-video-slot" aria-label="Video placeholder for Truthlabel scanning process">
          <span>Video placeholder</span>
          <strong>Truthlabel scanning process video goes here</strong>
          <p>Show the app scanning a real product and opening the result.</p>
        </div>
      </section>

      <section className="landing-personal">
        <SectionIntro
          centered
          eyebrow="Personal protection"
          title="Set what matters to you"
          copy="Choose allergies, ingredients, and food markers you want Truthlabel to bring forward."
        />
        <div className="landing-chip-list landing-chip-list--centered">
          {protectionChips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      </section>

      <section className="landing-history landing-history--compact">
        <SectionIntro
          centered
          eyebrow="Scan history"
          title="Save what you scan"
          copy="Reopen previous scans inside your private account when you want to compare products later."
        />
        <a className="landing-text-link" href="/sign-in">
          View your scan history
        </a>
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
