"use client";

import type { ReactNode } from "react";
import { useState } from "react";

export type LandingFaqItem = {
  question: string;
  answer: ReactNode;
};

export default function LandingFaq({ items }: { items: LandingFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="landing-faq-list">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `landing-faq-panel-${index}`;

        return (
          <div className="landing-faq-item" key={item.question}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span>{item.question}</span>
              <span aria-hidden="true">{isOpen ? "-" : "+"}</span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-hidden={!isOpen}
              className="landing-faq-panel"
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
