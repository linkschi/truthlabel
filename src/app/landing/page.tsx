import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import FloatingInsights from "@/components/FloatingInsights";
import LandingConcernCarousel from "@/components/LandingConcernCarousel";
import LandingFaq, { type LandingFaqItem } from "@/components/LandingFaq";
import SupportContactLink from "@/components/SupportContactLink";
import TruthLabelChecksScroller from "@/components/TruthLabelChecksScroller";
import "../homepage-theme.css";

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

const truthlabelTrialStartUrl = "/create-account";

const launchMetrics = [
  "Independent & self-funded",
  "7 days free",
  "Cancel anytime",
];

const planIncludes: Array<{ id: string; content: ReactNode }> = [
  {
    id: "shop",
    content: (
      <>
        Shop with Truthlabel and see{" "}
        <span className="landing-highlight">instant results</span>
      </>
    ),
  },
  {
    id: "banned",
    content: (
      <>
        Scan for <span className="landing-highlight">banned or dangerous</span>{" "}
        food
      </>
    ),
  },
  {
    id: "cancer",
    content: (
      <>
        Spot <span className="landing-highlight">cancer-linked</span> ingredients
      </>
    ),
  },
  {
    id: "lab-made",
    content: (
      <>
        Check <span className="landing-highlight">lab-made</span> and
        bioengineered foods
      </>
    ),
  },
  {
    id: "ultra-processed",
    content: (
      <>
        Identify <span className="landing-highlight">ultra-processed</span>{" "}
        products
      </>
    ),
  },
  {
    id: "alerts",
    content: (
      <>
        Get <span className="landing-highlight">serious ingredient alerts</span>
      </>
    ),
  },
  {
    id: "plain-english",
    content: (
      <>
        Clear <span className="landing-highlight">warnings</span> in plain
        English
      </>
    ),
  },
  {
    id: "independent",
    content: (
      <>
        Built by an{" "}
        <span className="landing-yellow-highlight">independent, self-funded</span>{" "}
        team - <span className="landing-yellow-highlight">not a food company</span>
      </>
    ),
  },
];

const faqItems: LandingFaqItem[] = [
  {
    question: "What does Truthlabel check?",
    answer: (
      <>
        Truthlabel checks ingredients across categories such as allergens,{" "}
        <span className="landing-highlight">banned and restricted ingredients</span>,
        artificial additives, sweeteners, preservatives, processed oils,
        ultra-processing, engineered-food markers, and verified safety alerts.
      </>
    ),
  },
  {
    question: "Does yellow mean a product is dangerous?",
    answer: (
      <>
        Not necessarily. Yellow can mean a moderate review signal, processing
        marker, preference match, exposure-dependent concern, or unclear label
        wording.
      </>
    ),
  },
  {
    question: "What causes a red result?",
    answer: (
      <>
        Red can come from a <span className="landing-highlight">serious</span>{" "}
        ingredient concern, verified regulatory action, personal allergen match,
        active safety alert, confirmed contamination signal, or high category
        load.
      </>
    ),
  },
  {
    question: "Can Truthlabel replace the original product label?",
    answer:
      "No. Ingredients and manufacturing details can change. Always confirm the original package label, especially for allergies.",
  },
  {
    question: "How does the 7-day free trial work?",
    answer:
      "Begin the trial from checkout, then sign in to Truthlabel, set your preferences, and start scanning. Trial and billing details are confirmed before checkout is completed.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There is no long-term commitment, and future renewals can be canceled whenever you choose.",
  },
  {
    question: "How do I access Truthlabel after checkout?",
    answer:
      "After checkout, sign in with your Truthlabel account. Once you are signed in, the app opens so you can start scanning.",
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

function PrimaryCta({
  children = "Try Truthlabel free for 7 days",
  className = "",
  analyticsSource = "landing_cta",
}: {
  children?: React.ReactNode;
  className?: string;
  analyticsSource?: string;
}) {
  return (
    <a
      className={`landing-button landing-button--primary ${className}`}
      href={truthlabelTrialStartUrl}
      data-analytics-event="trial_cta_clicked"
      data-analytics-source={analyticsSource}
    >
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
  title: ReactNode;
  copy?: ReactNode;
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

function FullPricingSection() {
  return (
    <section id="pricing" className="landing-pricing">
      <div className="landing-pricing__card">
        <div>
          <p className="landing-eyebrow">Truthlabel Full Access</p>
          <h2>Try Truthlabel free for 7 days</h2>
        </div>
        <div className="landing-price">
          <strong>$4.99</strong>
          <span>/ month after trial</span>
        </div>
        <ul>
          {planIncludes.map((item) => (
            <li key={item.id}>{item.content}</li>
          ))}
        </ul>
        <div className="landing-guarantee">
          <strong>Cancel Anytime Guarantee</strong>
          <p>No long-term commitment. Cancel future renewals whenever you choose.</p>
        </div>
        <PrimaryCta analyticsSource="pricing_section">
          Try Truthlabel free for 7 days
        </PrimaryCta>
        <div className="landing-launch-metrics" aria-label="Truthlabel launch facts">
          {launchMetrics.map((metric) => (
            <span key={metric}>
              <strong>{metric}</strong>
            </span>
          ))}
        </div>
      </div>
    </section>
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

        <div className="landing-header-actions">
          <PrimaryCta analyticsSource="landing_header">
            Try Truthlabel free for 7 days
          </PrimaryCta>
        </div>
      </header>

      <section className="landing-exposure-intro">
        <div className="landing-exposure-copy">
          <p className="landing-eyebrow">Know what is really in your food</p>
          <h1>Scan before you trust it.</h1>
          <p>
            Truthlabel exposes{" "}
            <span className="landing-highlight">dangerous ingredients</span>{" "}
            hidden in your food.
          </p>
          <p>
            Truthlabel helps spot products{" "}
            <span className="landing-highlight">
              &quot;banned&quot; in other countries
            </span>
            ,{" "}
            <span className="landing-highlight">harmful additives</span>
            ,{" "}
            <span className="landing-highlight">ultra-processing</span>
            , and{" "}
            <span className="landing-highlight">warning signals</span>{" "}
            that are easy to miss.
          </p>
        </div>
        <FloatingInsights
          imageSrc="/landing-first-section-scan.jpg"
          imageAlt="Truthlabel scan preview showing a barcode scan and product result on a phone"
        />
      </section>

      <section className="landing-post-exposure-cta" aria-label="Start your Truthlabel trial">
        <div className="landing-hero__actions">
          <PrimaryCta className="landing-hero__primary" analyticsSource="post_exposure_cta">
            Try Truthlabel free for 7 days
          </PrimaryCta>
        </div>
        <p className="landing-trust-line">
          7 days free - Cancel anytime - No long-term commitment
        </p>
      </section>

      <section className="landing-profit-section">
        <div className="landing-profit-lead">
          <SectionIntro
            eyebrow="Evidence and shopping context"
            title={
              <>
                Exposing <span className="landing-highlight">evil brands</span>{" "}
                that only care about profits
              </>
            }
            copy={
              <>
                Food companies are becoming more focused on profit and mass
                production. Many everyday products now contain{" "}
                <span className="landing-highlight">lab-made ingredients</span>,
                harmful cheaper substitutes, and heavily processed formulas
                that can raise{" "}
                <span className="landing-highlight">serious health concerns</span>.
              </>
            }
          />
          <figure className="landing-media-slot landing-media-slot--brands">
            <Image
              className="landing-brand-shopping-image"
              src="/landing-brand-shopping.jpeg"
              alt="Supermarket aisle with popular packaged-food brand logos above shoppers"
              width={851}
              height={1280}
            />
          </figure>
        </div>
        <div className="landing-profit-copy">
          <p>
            Some of these items are <span className="landing-highlight">banned</span>{" "}
            in other countries or states because of{" "}
            <span className="landing-highlight">safety concerns</span>. Through
            legal loopholes, they can still be sold to everyday families with{" "}
            <span className="landing-highlight">little protection</span>.
          </p>
        </div>
      </section>

      <section className="landing-concerns">
        <SectionIntro
          eyebrow="What is becoming common"
          title="Items becoming more common in food."
        />
        <LandingConcernCarousel />
        <p className="landing-concerns__note">
          The <span className="landing-highlight">danger</span> is not always
          visible. It can be hidden in small print, buried behind health claims,
          or missing from the front completely.
        </p>
      </section>

      <section id="checks-grid" className="landing-checks">
        <SectionIntro
          centered
          eyebrow="What Truthlabel checks"
          title="More than basic ingredients"
          copy="Fast checks for the food warnings people usually miss."
        />
        <TruthLabelChecksScroller />
      </section>

      <section id="how" className="landing-how">
        <div className="landing-how__copy">
          <SectionIntro
            eyebrow="How our app works"
            title="Scan, check, decide."
            copy={
              <>
                Truthlabel turns a product label into a focused result. It shows
                what was found, why it was{" "}
                <span className="landing-highlight">flagged</span>, and what
                action may make sense.
              </>
            }
          />
          <p className="landing-shopping-copy">
            Use it while shopping: pick up a product, scan it in the aisle, and
            get instant ingredient labels,{" "}
            <span className="landing-highlight">warnings</span>, and clear next
            steps.
          </p>
        </div>
        <figure className="landing-video-slot landing-demo-video-card">
          <video
            aria-label="Truthlabel scanning process preview"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="landing-demo-video"
          >
            <source src="/landing-scout-scan.mp4" type="video/mp4" />
            Your browser does not support the Truthlabel scanning preview video.
          </video>
        </figure>
      </section>

      <section className="landing-personal landing-personal--compact">
        <SectionIntro
          centered
          eyebrow="Personal protection"
          title="Allergy checks and scan history"
        />
        <div className="landing-personal-summary" aria-label="Personal Truthlabel features">
          <article>
            <span>Allergy alerts</span>
            <p>
              Select your allergens once. Truthlabel brings matching ingredients
              forward as personal alerts.
            </p>
          </article>
          <article>
            <span>Scan history</span>
            <p>
              Keep past product checks in your account so you can reopen or
              compare them later.
            </p>
          </article>
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

      <FullPricingSection />

      <section id="questions" className="landing-faq">
        <SectionIntro
          centered
          title="FAQ"
        />
        <LandingFaq items={faqItems} />
      </section>

      <section className="landing-final-cta">
        <h2>Know before it reaches your basket.</h2>
        <p>
          Understand the ingredients, see the{" "}
          <span className="landing-highlight">warnings</span>, and make the
          choice with greater confidence.
        </p>
        <PrimaryCta analyticsSource="final_cta">
          Try Truthlabel free for 7 days
        </PrimaryCta>
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
            label, especially for <span className="landing-highlight">allergies</span>.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/health-disclaimer">Health disclaimer</Link>
          <SupportContactLink context="Landing page">Contact support</SupportContactLink>
        </nav>
        <p>Copyright {new Date().getFullYear()} Truthlabel.</p>
      </footer>
    </main>
  );
}
