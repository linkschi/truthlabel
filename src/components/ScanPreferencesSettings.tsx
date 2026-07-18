"use client";

import { useState } from "react";

import { SectionLabel } from "@/components/ResultUi";
import type { UserScanPreferences } from "@/lib/userSettings/userSettingsTypes";

type ScanPreferencesSettingsProps = {
  value: UserScanPreferences;
  onSave: (value: UserScanPreferences) => void;
};

const productCategoryOptions = [
  "Packaged / Processed Foods",
  "Meat / Fast Food",
  "Drinks / Beverages",
  "Baby / Kids Food",
  "Seafood",
  "Dairy / Egg Products",
  "Fresh / Simple Foods",
  "General / Unknown",
] as const;

function ToggleRow({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-[18px] border border-[#e7decf] bg-[#faf7f0] px-3.5 py-3">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[#22342c]">{label}</p>
        <p className="mt-1 text-[12px] leading-5 text-[#5a6960]">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-[#cbbca2] text-[#1c3028] focus:ring-[#1c3028]"
      />
    </label>
  );
}

export default function ScanPreferencesSettings({
  value,
  onSave,
}: ScanPreferencesSettingsProps) {
  const [draft, setDraft] = useState<UserScanPreferences>(value);

  return (
    <section className="rounded-[24px] border border-[#e7decf] bg-white/78 px-4 py-4 shadow-[var(--shadow)]">
      <SectionLabel>Scan Preferences</SectionLabel>
      <p className="mt-1.5 text-[14px] leading-5 text-[#55645c]">
        Keep the active scan flow simple and set the defaults you want Truthlabel to use.
      </p>

      <label className="mt-4 block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#445047]">
          Default product category
        </span>
        <select
          value={draft.defaultProductCategory}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              defaultProductCategory: event.target.value,
            }))
          }
          className="mt-2 w-full rounded-[18px] border border-[#ddd6ca] bg-white/88 px-4 py-3 text-[14px] text-[#1f2d26] outline-none transition focus:border-[#bba88b] focus:bg-white"
        >
          {productCategoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 space-y-3">
        <ToggleRow
          checked={draft.showNotCheckedExternalSections}
          label="Show external sections when not found"
          description="Keep recall and external-safety sections visible even when no live check ran."
          onChange={(checked) =>
            setDraft((current) => ({
              ...current,
              showNotCheckedExternalSections: checked,
            }))
          }
        />
        <ToggleRow
          checked={draft.showConfidenceNotes}
          label="Show confidence notes"
          description="Show scanner caution notes under the result when label or lookup certainty is limited."
          onChange={(checked) =>
            setDraft((current) => ({
              ...current,
              showConfidenceNotes: checked,
            }))
          }
        />
        <ToggleRow
          checked={draft.autoRunExternalSafetyLookup}
          label="Auto-run external safety lookup"
          description="Try live recall and official-safety checks automatically when product identity is strong enough."
          onChange={(checked) =>
            setDraft((current) => ({
              ...current,
              autoRunExternalSafetyLookup: checked,
            }))
          }
        />
      </div>

      <button
        type="button"
        onClick={() => onSave(draft)}
        className="mt-4 rounded-full border border-[#1c3028] bg-[#1c3028] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition active:scale-[0.99]"
      >
        Save scan preferences
      </button>
    </section>
  );
}
