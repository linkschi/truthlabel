"use client";

import { useState } from "react";

import { SectionLabel } from "@/components/ResultUi";
import type { UserRegionSettings } from "@/lib/userSettings/userSettingsTypes";

type RegionSettingsProps = {
  value: UserRegionSettings;
  onSave: (value: UserRegionSettings) => void;
};

const regionOptions: Array<{
  value: NonNullable<UserRegionSettings["region"]>;
  label: string;
}> = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "EU", label: "European Union" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia / New Zealand" },
  { value: "ZA", label: "South Africa" },
  { value: "GLOBAL", label: "Global / Not sure" },
  { value: "UNKNOWN", label: "Unknown" },
];

export default function RegionSettings({
  value,
  onSave,
}: RegionSettingsProps) {
  const [region, setRegion] = useState<NonNullable<UserRegionSettings["region"]>>(
    value.region ?? "UNKNOWN",
  );
  const [country, setCountry] = useState(value.country ?? "");
  const [language, setLanguage] = useState(value.language ?? "en");

  return (
    <section className="rounded-[24px] border border-[#e7decf] bg-white/78 px-4 py-4 shadow-[var(--shadow)]">
      <SectionLabel>Region Settings</SectionLabel>
      <p className="mt-1.5 text-[14px] leading-5 text-[#55645c]">
        Choose the region InsideIt should use for regulatory wording and recall context.
      </p>
      <p className="mt-2 rounded-[18px] border border-[#efe6d8] bg-[#fbf7ef] px-3.5 py-3 text-[12px] leading-5 text-[#5d685f]">
        This ingredient is restricted in some regions. Check local rules if this matters for your location.
      </p>

      <label className="mt-4 block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#445047]">
          Region
        </span>
        <select
          value={region}
          onChange={(event) =>
            setRegion(event.target.value as NonNullable<UserRegionSettings["region"]>)
          }
          className="mt-2 w-full rounded-[18px] border border-[#ddd6ca] bg-white/88 px-4 py-3 text-[14px] text-[#1f2d26] outline-none transition focus:border-[#bba88b] focus:bg-white"
        >
          {regionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#445047]">
            Country
          </span>
          <input
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="Country name"
            className="mt-2 w-full rounded-[18px] border border-[#ddd6ca] bg-white/88 px-4 py-3 text-[14px] text-[#1f2d26] outline-none transition placeholder:text-[#8b8378] focus:border-[#bba88b] focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#445047]">
            Language
          </span>
          <input
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            placeholder="en"
            className="mt-2 w-full rounded-[18px] border border-[#ddd6ca] bg-white/88 px-4 py-3 text-[14px] text-[#1f2d26] outline-none transition placeholder:text-[#8b8378] focus:border-[#bba88b] focus:bg-white"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => onSave({ region, country, language })}
        className="mt-4 rounded-full border border-[#1c3028] bg-[#1c3028] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition active:scale-[0.99]"
      >
        Save region settings
      </button>
    </section>
  );
}
