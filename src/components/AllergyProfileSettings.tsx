"use client";

import { useMemo, useState } from "react";

import { SectionLabel } from "@/components/ResultUi";
import { commonAllergens } from "@/lib/userSettings/commonAllergens";
import type { UserAllergyProfile } from "@/lib/userSettings/userSettingsTypes";

type AllergyProfileSettingsProps = {
  profile: UserAllergyProfile;
  onSave: (profile: UserAllergyProfile) => void;
  onClear: () => void;
};

function uniqueStrings(values: Array<string | undefined | null>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

function toggleSelection(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

const chipClass =
  "rounded-full border px-3 py-1.5 text-left text-[13px] font-medium transition";

export default function AllergyProfileSettings({
  profile,
  onSave,
  onClear,
}: AllergyProfileSettingsProps) {
  const [selectedAllergens, setSelectedAllergens] = useState(profile.allergens);
  const [customInput, setCustomInput] = useState(profile.customAllergens.join(", "));

  const customAllergens = useMemo(
    () =>
      uniqueStrings(
        customInput
          .split(/[,\n]/)
          .map((entry) => entry.trim())
          .filter(Boolean),
      ),
    [customInput],
  );

  const selectedLabels = useMemo(
    () =>
      selectedAllergens
        .map(
          (id) =>
            commonAllergens.find((entry) => entry.id === id)?.label ?? id,
        )
        .concat(customAllergens),
    [customAllergens, selectedAllergens],
  );

  function handleSave() {
    onSave({
      allergens: selectedAllergens,
      customAllergens,
      lastUpdated: new Date().toISOString(),
    });
  }

  return (
    <section className="rounded-[24px] border border-[#e7decf] bg-white/78 px-4 py-4 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>Allergy Profile</SectionLabel>
          <p className="mt-1.5 text-[14px] leading-5 text-[#55645c]">
            Choose allergens you want InsideIt to treat as high priority during scans.
          </p>
        </div>
        <span className="rounded-full border border-[#e1d8ca] bg-[#faf7f0] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d6a5d]">
          Saved locally
        </span>
      </div>

      <p className="mt-3 rounded-[18px] border border-[#efe6d8] bg-[#fbf7ef] px-3.5 py-3 text-[12px] leading-5 text-[#5d685f]">
        InsideIt can help flag matching ingredients, but always check the product label yourself.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {commonAllergens.map((allergen) => {
          const selected = selectedAllergens.includes(allergen.id);

          return (
            <button
              key={allergen.id}
              type="button"
              onClick={() =>
                setSelectedAllergens((current) =>
                  toggleSelection(current, allergen.id),
                )
              }
              aria-pressed={selected}
              className={`${chipClass} ${
                selected
                  ? "border-[#1c3028] bg-[#1c3028] text-white shadow-[0_10px_24px_rgba(28,48,40,0.14)]"
                  : "border-[#ddd6ca] bg-white/88 text-[#33443c] hover:border-[#c4b493] hover:bg-[#fbf6ed]"
              }`}
            >
              {allergen.label}
            </button>
          );
        })}
      </div>

      <label className="mt-4 block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#445047]">
          Custom allergens
        </span>
        <textarea
          value={customInput}
          onChange={(event) => setCustomInput(event.target.value)}
          placeholder="Add custom allergens separated by commas or new lines."
          className="mt-2 min-h-[96px] w-full rounded-[18px] border border-[#ddd6ca] bg-white/88 px-4 py-3 text-[14px] text-[#1f2d26] outline-none transition placeholder:text-[#8b8378] focus:border-[#bba88b] focus:bg-white"
        />
      </label>

      <div className="mt-4 rounded-[18px] border border-[#e7decf] bg-[#faf7f0] px-3.5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c6d4f]">
          Selected profile
        </p>
        {selectedLabels.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedLabels.map((label) => (
              <span
                key={label}
                className="inline-flex rounded-full border border-[#e1d8ca] bg-white/88 px-3 py-1 text-[12px] font-medium text-[#445249]"
              >
                {label}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[13px] leading-5 text-[#55645c]">
            No saved allergens selected yet.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-full border border-[#1c3028] bg-[#1c3028] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition active:scale-[0.99]"
        >
          Save allergy profile
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-[#ddd6ca] bg-white/88 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#33443c] transition active:scale-[0.99]"
        >
          Clear allergy profile
        </button>
      </div>
    </section>
  );
}
