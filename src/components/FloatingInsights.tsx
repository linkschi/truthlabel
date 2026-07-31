import Image from "next/image";
import type { ComponentType, SVGProps } from "react";

import styles from "./FloatingInsights.module.css";

type InsightTone = "danger" | "warning" | "score";
type InsightPosition =
  | "topLeft"
  | "topRight"
  | "middleRight"
  | "bottomLeft"
  | "bottomRight";
type InsightIcon = ComponentType<SVGProps<SVGSVGElement>>;

type InsightItem = {
  id: string;
  title: string;
  value: string;
  description: string;
  Icon: InsightIcon;
  tone: InsightTone;
  position: InsightPosition;
  animationDelay: string;
};

type FloatingInsightsProps = {
  imageSrc: string;
  imageAlt?: string;
};

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
        d="M12 8.4v5.1M12 16.7h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.1"
      />
    </svg>
  );
}

function GaugeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M4.7 17.6a8.2 8.2 0 1 1 14.6 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
      <path
        d="m12 14 3.1-4.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
      <path
        d="M8 17.6h8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function LabMadeIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M8.6 15.2h6.8M10 11.7h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

const insights: InsightItem[] = [
  {
    id: "banned-items",
    title: "Banned Items",
    value: "3",
    description: "Detected",
    Icon: BanIcon,
    tone: "danger",
    position: "topLeft",
    animationDelay: "0s",
  },
  {
    id: "ultra-processed",
    title: "Ultra-Processed",
    value: "8",
    description: "Items found",
    Icon: LayersIcon,
    tone: "danger",
    position: "topRight",
    animationDelay: "-1.1s",
  },
  {
    id: "lab-made-food",
    title: "Lab-Made Food",
    value: "4",
    description: "Signals found",
    Icon: LabMadeIcon,
    tone: "danger",
    position: "middleRight",
    animationDelay: "-1.7s",
  },
  {
    id: "cancer-linked",
    title: "Cancer-Linked",
    value: "2",
    description: "Ingredients found",
    Icon: ShieldAlertIcon,
    tone: "danger",
    position: "bottomLeft",
    animationDelay: "-2.2s",
  },
  {
    id: "exposure-score",
    title: "Exposure Score",
    value: "28 / 100",
    description: "High concern",
    Icon: GaugeIcon,
    tone: "danger",
    position: "bottomRight",
    animationDelay: "-3.1s",
  },
];

export default function FloatingInsights({
  imageSrc,
  imageAlt = "Food product analysis",
}: FloatingInsightsProps) {
  return (
    <figure className={styles.section} aria-label="Product scan highlights">
      <div className={styles.visual}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 672px"
          className={styles.backgroundImage}
        />
        <div className={styles.imageOverlay} aria-hidden="true" />

        {insights.map(
          ({
            id,
            title,
            value,
            description,
            Icon,
            tone,
            position,
            animationDelay,
          }) => (
            <article
              key={id}
              className={[styles.card, styles[position], styles[tone]].join(
                " ",
              )}
              style={{ animationDelay }}
            >
              <div className={styles.iconContainer} aria-hidden="true">
                <Icon />
              </div>

              <div className={styles.cardContent}>
                <p className={styles.title}>{title}</p>
                <div className={styles.valueRow}>
                  <strong className={styles.value}>{value}</strong>
                  <span className={styles.description}>{description}</span>
                </div>
              </div>
            </article>
          ),
        )}
      </div>
    </figure>
  );
}
