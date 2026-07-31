"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type ConcernTone = "red" | "yellow" | "green";

type ConcernCard = {
  label: string;
  headline: ReactNode;
  copy: ReactNode;
  tone: ConcernTone;
};

const concernCards: ConcernCard[] = [
  {
    label: "Banned or Restricted Ingredients",
    headline: (
      <>
        Restricted ingredients still reach shelves.
      </>
    ),
    copy: (
      <>
        Truthlabel flags supported{" "}
        <span className="landing-highlight">banned or restricted</span> matches.
      </>
    ),
    tone: "red",
  },
  {
    label: "Cancer-Linked Ingredients and Foods",
    headline: (
      <>
        Long-term concern signals can hide in ordinary food.
      </>
    ),
    copy: (
      <>
        Truthlabel highlights cancer-related ingredient and food markers.
      </>
    ),
    tone: "red",
  },
  {
    label: "Lab-Made and Bioengineered Food",
    headline: "Lab-made food signals are easy to miss.",
    copy: (
      <>
        Truthlabel flags bioengineered, cell-cultured, and lab-made wording.
      </>
    ),
    tone: "yellow",
  },
  {
    label: "Misleading Labels and Troubling Company Records",
    headline: (
      <>
        Brand history can change how a label looks.
      </>
    ),
    copy: (
      <>
        Truthlabel checks verified recall, misbranding, and safety-action records.
      </>
    ),
    tone: "yellow",
  },
  {
    label: "Hundreds More Review Signals",
    headline: "More checks behind every scan.",
    copy: (
      <>
        Additives, processing markers, safety signals, and more.
      </>
    ),
    tone: "yellow",
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
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
