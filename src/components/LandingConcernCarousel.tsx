"use client";

import { useEffect, useRef, useState } from "react";

type ConcernTone = "red" | "yellow" | "green";

type ConcernCard = {
  label: string;
  headline: string;
  copy: string;
  tone: ConcernTone;
};

const concernCards: ConcernCard[] = [
  {
    label: "Banned and restricted ingredients",
    headline: "Banned elsewhere. Still found in some foods.",
    copy:
      "Truthlabel highlights verified regulatory restrictions and explains where and why they apply.",
    tone: "red",
  },
  {
    label: "Cancer-related concerns",
    headline:
      "Research has raised serious concerns about some everyday ingredients.",
    copy:
      "Truthlabel separates possible, probable, and established concerns instead of treating them as identical.",
    tone: "red",
  },
  {
    label: "Engineered and lab-made food",
    headline:
      "Know when food has been genetically engineered, cell-grown, or heavily reconstructed.",
    copy:
      "These markers are clearly identified for users who prefer conventionally produced food.",
    tone: "yellow",
  },
  {
    label: "Brand and product safety",
    headline: "See recalls, warnings, and serious product-safety signals.",
    copy:
      "Verified alerts are brought forward instead of being hidden behind a general score.",
    tone: "green",
  },
];

function ConcernIllustration({ tone }: { tone: ConcernTone }) {
  return (
    <div className={`landing-concern-visual landing-concern-visual--${tone}`} aria-hidden="true">
      <div className="landing-concern-visual__package">
        <span />
        <span />
        <span />
      </div>
      <div className="landing-concern-visual__scan">
        <span />
        <span />
        <span />
      </div>
      <div className="landing-concern-visual__badge">
        {tone === "red" ? "RED" : tone === "yellow" ? "YELLOW" : "CHECK"}
      </div>
    </div>
  );
}

export default function LandingConcernCarousel() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function scrollByCard(direction: "previous" | "next") {
    const carousel = carouselRef.current;
    if (!carousel) {
      return;
    }

    const firstCard = carousel.querySelector<HTMLElement>(".landing-concern-card");
    const distance = firstCard ? firstCard.offsetWidth + 20 : carousel.clientWidth * 0.8;

    carousel.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) {
      return undefined;
    }

    function updateScrollState() {
      if (!carousel) {
        return;
      }

      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
      setCanScrollLeft(carousel.scrollLeft > 4);
      setCanScrollRight(carousel.scrollLeft < maxScrollLeft - 4);
    }

    updateScrollState();
    carousel.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      carousel.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  return (
    <div className="landing-concern-shell">
      <div className="landing-carousel-controls" aria-label="Concern carousel controls">
        <button
          type="button"
          onClick={() => scrollByCard("previous")}
          disabled={!canScrollLeft}
          aria-label="Show previous concern"
        >
          <span aria-hidden="true">Prev</span>
        </button>
        <button
          type="button"
          onClick={() => scrollByCard("next")}
          disabled={!canScrollRight}
          aria-label="Show next concern"
        >
          <span aria-hidden="true">Next</span>
        </button>
      </div>

      <div
        ref={carouselRef}
        className="landing-concern-carousel"
        aria-label="Main Truthlabel concern examples"
        tabIndex={0}
      >
        {concernCards.map((card) => (
          <article className={`landing-concern-card landing-concern-card--${card.tone}`} key={card.label}>
            <ConcernIllustration tone={card.tone} />
            <div className="landing-concern-card__body">
              <p>{card.label}</p>
              <h3>{card.headline}</h3>
              <span>{card.copy}</span>
              <a href="#checks-grid">See why</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
