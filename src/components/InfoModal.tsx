import { useEffect } from "react";
import type { ReactNode } from "react";
import { concernLabels, type ConcernLevel } from "@/data/fakeProduct";

const accentClasses: Record<ConcernLevel, string> = {
  green: "bg-[var(--green-main)]",
  yellow: "bg-[var(--amber-main)]",
  red: "bg-[var(--red-main)]",
};

type InfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tone: ConcernLevel;
  children: ReactNode;
};

export default function InfoModal({
  isOpen,
  onClose,
  title,
  tone,
  children,
}: InfoModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div className="absolute inset-0 animate-[overlayIn_180ms_ease-out] bg-[#171412]/56 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md animate-[sheetUp_220ms_ease-out] overflow-hidden rounded-t-[30px] border border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-[var(--shadow)] sm:rounded-[30px]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
      >
        <div className={`h-1.5 w-full ${accentClasses[tone]}`} />
        <div className="max-h-[82vh] overflow-y-auto p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--bg-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                {concernLabels[tone]}
              </span>
              <h2
                id="info-modal-title"
                className="mt-3 font-heading text-2xl font-semibold text-[var(--text-main)]"
              >
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] text-lg text-[var(--text-secondary)] transition hover:bg-[var(--bg-soft)]"
              aria-label="Close details"
            >
              X
            </button>
          </div>
          <div className="mt-3 space-y-3 text-[13px] leading-6 text-[var(--text-secondary)]">
            {children}
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Tap outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
