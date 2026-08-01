"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";

import styles from "./TruthLabelChecksScroller.module.css";

type CheckTone = "danger" | "warning" | "laboratory" | "standard";
type CheckIcon = ComponentType<SVGProps<SVGSVGElement>>;

type TruthLabelCheck = {
  id: string;
  title: string;
  description: string;
  tone: CheckTone;
  Icon: CheckIcon;
};

const scrollSpeed = 54;

function BanIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="m7.4 7.4 9.2 9.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M12 3.8 19 7v5.2c0 4.5-2.9 7-7 8.2-4.1-1.2-7-3.7-7-8.2V7l7-3.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="m8.8 12.2 2 2 4.4-4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function ShieldAlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M12 3.8 19 7v5.2c0 4.5-2.9 7-7 8.2-4.1-1.2-7-3.7-7-8.2V7l7-3.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M12 8.6v4.8M12 16.6h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PaletteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M12 4a8 8 0 0 0 0 16h1.2a1.7 1.7 0 0 0 1.1-3l-.2-.2a1.4 1.4 0 0 1 .9-2.5h1.1A4.1 4.1 0 0 0 20 10.1C20 6.7 16.5 4 12 4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path d="M8.3 10h.01M11 7.8h.01M14.5 8.6h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  );
}

function CandyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M8 9.2 4.6 7.4a1 1 0 0 0-1.4 1.1l.8 3.5-.8 3.5a1 1 0 0 0 1.4 1.1L8 14.8"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="m16 9.2 3.4-1.8a1 1 0 0 1 1.4 1.1L20 12l.8 3.5a1 1 0 0 1-1.4 1.1L16 14.8"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <rect
        width="8.2"
        height="8.2"
        x="7.9"
        y="7.9"
        rx="2.1"
        stroke="currentColor"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function FlaskIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M9 3.8h6M10 3.8v5.1l-4.4 7.6A2.5 2.5 0 0 0 7.8 20h8.4a2.5 2.5 0 0 0 2.2-3.5L14 8.9V3.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M8.6 15.2h6.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function FactoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M4.5 19.5V9.8l5 3V9.8l5 3V6.5h5v13"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path d="M4.5 19.5h15M8 16h.01M12 16h.01M16 16h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}

function LayersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="m12 4 8 4-8 4-8-4 8-4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="m5 12 7 3.5 7-3.5M5 16l7 3.5 7-3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function WheatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 4v16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
      <path
        d="M12 7.5c-2.2 0-3.8-1.2-4.8-3 2.7-.2 4.2 1.2 4.8 3ZM12 11.8c-2.4 0-4.1-1.2-5.2-3.2 2.9-.2 4.6 1.3 5.2 3.2ZM12 16c-2.5 0-4.3-1.3-5.5-3.4 3.1-.2 4.9 1.4 5.5 3.4ZM12 7.5c2.2 0 3.8-1.2 4.8-3-2.7-.2-4.2 1.2-4.8 3ZM12 11.8c2.4 0 4.1-1.2 5.2-3.2-2.9-.2-4.6 1.3-5.2 3.2ZM12 16c2.5 0 4.3-1.3 5.5-3.4-3.1-.2-4.9 1.4-5.5 3.4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.45"
      />
    </svg>
  );
}

function SirenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M7 18v-5a5 5 0 0 1 10 0v5"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path d="M5 18h14M12 3.5V5M4.8 6.2 6 7.3M19.2 6.2 18 7.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
      <path d="M9 13a3 3 0 0 1 3-3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
    </svg>
  );
}

function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M8.3 5.8v12.4a1 1 0 0 0 1.55.83l9.3-6.2a1 1 0 0 0 0-1.66l-9.3-6.2a1 1 0 0 0-1.55.83Z" />
    </svg>
  );
}

function PauseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M7.4 5.2h3.1v13.6H7.4V5.2Zm6.1 0h3.1v13.6h-3.1V5.2Z" />
    </svg>
  );
}

const truthLabelChecks: TruthLabelCheck[] = [
  {
    id: "banned",
    title: "Banned ingredients",
    description: "Restricted-item checks",
    tone: "danger",
    Icon: BanIcon,
  },
  {
    id: "allergy",
    title: "Allergy matches",
    description: "Based on your avoid list",
    tone: "danger",
    Icon: ShieldCheckIcon,
  },
  {
    id: "cancer",
    title: "Cancer-linked warnings",
    description: "High-concern ingredient checks",
    tone: "danger",
    Icon: ShieldAlertIcon,
  },
  {
    id: "colors",
    title: "Artificial colors",
    description: "Synthetic color additives",
    tone: "warning",
    Icon: PaletteIcon,
  },
  {
    id: "sweeteners",
    title: "Artificial sweeteners",
    description: "Sugar-substitute checks",
    tone: "warning",
    Icon: CandyIcon,
  },
  {
    id: "preservatives",
    title: "Preservatives",
    description: "Shelf-life additive checks",
    tone: "warning",
    Icon: FlaskIcon,
  },
  {
    id: "heavy-metals",
    title: "Heavy-metal review",
    description: "Lead, arsenic and mercury signals",
    tone: "laboratory",
    Icon: FlaskIcon,
  },
  {
    id: "oils",
    title: "Processed oils",
    description: "Hydrogenated and refined oils",
    tone: "warning",
    Icon: FactoryIcon,
  },
  {
    id: "ultra-processed",
    title: "Ultra-processed foods",
    description: "Processing-level analysis",
    tone: "warning",
    Icon: LayersIcon,
  },
  {
    id: "fillers",
    title: "Fillers and binders",
    description: "Texture and volume additives",
    tone: "standard",
    Icon: WheatIcon,
  },
  {
    id: "lab-made",
    title: "Lab-made food",
    description: "Bioengineered food checks",
    tone: "laboratory",
    Icon: FlaskIcon,
  },
  {
    id: "brand",
    title: "Brand warnings",
    description: "Recalls and safety records",
    tone: "laboratory",
    Icon: SirenIcon,
  },
];

export default function TruthLabelChecksScroller() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);
  const scrollUpdateFrameRef = useRef<number | null>(null);
  const [isPrepared, setIsPrepared] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeId, setActiveId] = useState(truthLabelChecks[0].id);

  const updateActiveCard = useCallback(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const centre = containerRect.top + containerRect.height / 2;
    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("[data-check-card]"),
    );

    let closestId = cards[0]?.dataset.checkId ?? "";
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCentre = rect.top + rect.height / 2;
      const distance = Math.abs(cardCentre - centre);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = card.dataset.checkId ?? "";
      }
    });

    if (closestId) {
      setActiveId((current) => (current === closestId ? current : closestId));
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollUpdateFrameRef.current !== null) {
      return;
    }

    scrollUpdateFrameRef.current = window.requestAnimationFrame(() => {
      scrollUpdateFrameRef.current = null;
      updateActiveCard();
    });
  }, [updateActiveCard]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const preparationObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPrepared(true);
          preparationObserver.disconnect();
        }
      },
      {
        rootMargin: "600px 0px",
        threshold: 0,
      },
    );

    preparationObserver.observe(section);

    return () => preparationObserver.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.35);
      },
      {
        threshold: [0, 0.35, 0.7],
      },
    );

    visibilityObserver.observe(section);

    return () => visibilityObserver.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;

    const handleChange = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (
      reducedMotionRef.current ||
      !isPrepared ||
      !isVisible ||
      isPaused
    ) {
      previousTimeRef.current = null;

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      return;
    }

    const animate = (time: number) => {
      const container = scrollRef.current;

      if (!container) {
        return;
      }

      if (previousTimeRef.current === null) {
        previousTimeRef.current = time;
      }

      const delta = Math.min(time - previousTimeRef.current, 40);
      previousTimeRef.current = time;

      const loopPoint = container.scrollHeight / 2;

      if (loopPoint > 0) {
        container.scrollTop += scrollSpeed * (delta / 1000);

        if (container.scrollTop >= loopPoint) {
          container.scrollTop -= loopPoint;
        }
      }

      updateActiveCard();
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      previousTimeRef.current = null;
    };
  }, [isPaused, isPrepared, isVisible, updateActiveCard]);

  useEffect(() => {
    return () => {
      if (scrollUpdateFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollUpdateFrameRef.current);
      }
    };
  }, []);

  function togglePlayback() {
    setIsPaused((current) => !current);
  }

  return (
    <div
      ref={sectionRef}
      className={styles.section}
      aria-label="Truthlabel check examples"
    >
      <div className={styles.windowShell}>
        <div className={styles.windowHeader}>
          <div>
            <p className={styles.windowTitle}>What Truthlabel checks</p>
            <p className={styles.windowStatus}>
              {isPaused
                ? "Paused"
                : "Running automatically"}
            </p>
          </div>

          <button
            type="button"
            className={styles.playbackButton}
            onClick={togglePlayback}
            aria-label={
              isPaused
                ? "Resume automatic scrolling"
                : "Pause automatic scrolling"
            }
            aria-pressed={isPaused}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
            <span>{isPaused ? "Play" : "Pause"}</span>
          </button>
        </div>

        <div className={styles.viewport}>
          <div
            ref={scrollRef}
            className={styles.scroller}
            tabIndex={0}
            onScroll={handleScroll}
            aria-label="Truthlabel food checks"
          >
            <div className={styles.list}>
              {[...truthLabelChecks, ...truthLabelChecks].map(({ id, title, description, tone, Icon }, index) => {
                const isActive = activeId === id;

                return (
                  <article
                    key={`${id}-${index}`}
                    data-check-card
                    data-check-id={id}
                    tabIndex={0}
                    className={[
                      styles.card,
                      styles[tone],
                      isActive ? styles.active : "",
                    ].join(" ")}
                  >
                    <span className={styles.accent} aria-hidden="true" />
                    <span className={styles.iconContainer} aria-hidden="true">
                      <Icon />
                    </span>
                    <span className={styles.cardText}>
                      <strong className={styles.cardTitle}>{title}</strong>
                      <span className={styles.cardDescription}>
                        {description}
                      </span>
                    </span>
                  </article>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
