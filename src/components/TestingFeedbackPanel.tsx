"use client";

import { useMemo, useRef, useState } from "react";
import { publicAppConfig } from "@/lib/appConfig";
import type { ScanResult } from "@/lib/buildScanResult";
import {
  buildFeedbackReport,
  type FeedbackIssueType,
  getFeedbackEnvironmentSummary,
} from "@/lib/feedback/buildFeedbackReport";

const fieldClass =
  "mt-1.5 w-full rounded-[16px] border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[13px] text-[var(--text-main)] outline-none transition focus:border-[var(--border-strong)]";

const issueTypeOptions: Array<{
  value: FeedbackIssueType;
  label: string;
}> = [
  { value: "wrong_ingredient_match", label: "Wrong ingredient match" },
  { value: "missed_ingredient", label: "Missed ingredient" },
  { value: "confusing_warning", label: "Confusing warning" },
  { value: "score_feels_wrong", label: "Score feels wrong" },
  { value: "barcode_data_wrong", label: "Barcode product data wrong" },
  { value: "ocr_text_wrong", label: "OCR text wrong" },
  { value: "allergy_warning_issue", label: "Allergy warning issue" },
  { value: "app_bug", label: "App bug" },
  { value: "other_feedback", label: "Other feedback" },
];

type TestingFeedbackPanelProps = {
  scanResult: ScanResult;
  ingredientText?: string;
  initialProductName?: string;
  initialBrandName?: string;
  initialBarcode?: string;
};

export default function TestingFeedbackPanel({
  scanResult,
  ingredientText = "",
  initialProductName,
  initialBrandName,
  initialBarcode,
}: TestingFeedbackPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [issueType, setIssueType] =
    useState<FeedbackIssueType>("other_feedback");
  const [productName, setProductName] = useState(
    initialProductName || scanResult.productHero.productName,
  );
  const [brandName, setBrandName] = useState(
    initialBrandName || scanResult.productHero.brandName,
  );
  const [barcode, setBarcode] = useState(
    initialBarcode || scanResult.productHero.barcode,
  );
  const [message, setMessage] = useState("");
  const [editableIngredientText, setEditableIngredientText] =
    useState(ingredientText);
  const [optionalContact, setOptionalContact] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const reportRef = useRef<HTMLTextAreaElement | null>(null);

  const reportText = useMemo(() => {
    return buildFeedbackReport({
      issueType,
      productName,
      brandName,
      barcode,
      scanMethod: scanResult.productHero.scanSource,
      message,
      ingredientText: editableIngredientText,
      optionalContact,
      scanResult,
      browserDeviceInfo: getFeedbackEnvironmentSummary(),
    });
  }, [
    barcode,
    brandName,
    editableIngredientText,
    issueType,
    message,
    optionalContact,
    productName,
    scanResult,
  ]);

  if (!publicAppConfig.flags.enableTestFeedback) {
    return null;
  }

  async function handleCopyReport() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reportText);
        setCopyStatus("Feedback report copied.");
        return;
      }
    } catch {
      // Fall through to manual copy below.
    }

    reportRef.current?.focus();
    reportRef.current?.select();
    setCopyStatus("Clipboard was unavailable. Copy the report from the box below.");
  }

  return (
    <section className="mt-4 rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-surface)] px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text-main)]">
            Tester feedback
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
            Report a confusing result, wrong match, barcode issue, OCR issue, or app bug without leaving the scan flow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen((current) => !current);
            setCopyStatus("");
          }}
          className="rounded-full border border-[var(--border-soft)] bg-[var(--bg-page)] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-main)]"
        >
          {isOpen ? "Hide report" : "Report an issue"}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-[16px] border border-[var(--amber-border)] bg-[var(--amber-bg)] px-3.5 py-3 text-[12px] leading-5 text-[var(--amber-dark)]">
            Testing mode is on for this build. Only share information you are comfortable sending.
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[12px] font-medium text-[var(--text-main)]">
              Issue type
              <select
                value={issueType}
                onChange={(event) =>
                  setIssueType(event.target.value as FeedbackIssueType)
                }
                className={fieldClass}
              >
                {issueTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-[12px] font-medium text-[var(--text-main)]">
              Product name
              <input
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="text-[12px] font-medium text-[var(--text-main)]">
              Brand name
              <input
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="text-[12px] font-medium text-[var(--text-main)]">
              Barcode
              <input
                value={barcode}
                onChange={(event) => setBarcode(event.target.value)}
                className={fieldClass}
                placeholder="Optional"
              />
            </label>
          </div>

          <label className="block text-[12px] font-medium text-[var(--text-main)]">
            What went wrong
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className={`${fieldClass} min-h-[110px] resize-y`}
              placeholder="Explain the wrong match, confusing wording, missing ingredient, score problem, or bug."
            />
          </label>

          <label className="block text-[12px] font-medium text-[var(--text-main)]">
            Ingredient text used for the scan
            <textarea
              value={editableIngredientText}
              onChange={(event) => setEditableIngredientText(event.target.value)}
              className={`${fieldClass} min-h-[96px] resize-y`}
              placeholder="Paste or edit the ingredient text if it helps explain the issue."
            />
          </label>

          <label className="block text-[12px] font-medium text-[var(--text-main)]">
            Optional contact
            <input
              value={optionalContact}
              onChange={(event) => setOptionalContact(event.target.value)}
              className={fieldClass}
              placeholder="Email or name if you want a follow-up"
            />
          </label>

          <div className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--bg-page)] px-3.5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[12px] font-semibold text-[var(--text-main)]">
                  Copyable feedback report
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">
                  App build {publicAppConfig.appVersion}
                  {publicAppConfig.buildDate
                    ? ` | ${publicAppConfig.buildDate}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void handleCopyReport();
                }}
                className="rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-main)]"
              >
                Copy report
              </button>
            </div>

            <textarea
              ref={reportRef}
              readOnly
              value={reportText}
              className={`${fieldClass} mt-3 min-h-[220px] resize-y bg-white`}
              aria-label="Feedback report preview"
            />

            <p className="mt-2 text-[11px] leading-5 text-[var(--text-secondary)]">
              {copyStatus ||
                "Copy this report into email, chat, or your issue tracker. Camera images and OCR photos are not included."}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
