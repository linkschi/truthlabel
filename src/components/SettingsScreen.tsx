"use client";

import Link from "next/link";
import { useState } from "react";

import AppMenu from "@/components/AppMenu";
import AllergyProfileSettings from "@/components/AllergyProfileSettings";
import RegionSettings from "@/components/RegionSettings";
import ScanPreferencesSettings from "@/components/ScanPreferencesSettings";
import { SectionLabel } from "@/components/ResultUi";
import { getBrowserStorageNotice } from "@/lib/browserStorage";
import {
  clearUserSettings,
  resetUserSettings,
  updateAllergyProfile,
  updateRegionSettings,
  updateScanPreferences,
  useUserSettings,
} from "@/lib/userSettings/userSettingsStorage";

export default function SettingsScreen() {
  const settings = useUserSettings();
  const [statusMessage, setStatusMessage] = useState("");
  const storageNotice = getBrowserStorageNotice();

  function handleStatus(message: string) {
    setStatusMessage(message);
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-[440px] space-y-4">
        <header className="flex items-start justify-between gap-4 px-1 py-1">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6d4f]">
              Truthlabel
            </p>
            <h1 className="mt-1 font-heading text-[1.7rem] font-semibold text-[#17251f]">
              Settings
            </h1>
            <p className="mt-2 max-w-sm text-[14px] leading-5 text-[#58665e]">
              Keep allergy, region, and scan defaults on this device so Truthlabel can personalize scans without sending them elsewhere.
            </p>
          </div>
          <AppMenu />
        </header>

        <div className="rounded-[24px] border border-white/72 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Settings home</SectionLabel>
            <Link
              href="/app/manual"
              className="rounded-full border border-[#ddd6ca] bg-white/88 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#33443c] transition active:scale-[0.99]"
            >
              Back to scan
            </Link>
          </div>
          <p className="mt-2 text-[13px] leading-5 text-[#55645c]">
            Your allergy profile is stored locally on this device for MVP testing.
          </p>
        </div>

        {storageNotice ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-[22px] border border-[#e7d7d4] bg-[#f7ecea] px-4 py-3 text-[#6b4d49] shadow-[var(--shadow)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f615e]">
              Storage note
            </p>
            <p className="mt-1.5 text-[13px] leading-5">{storageNotice}</p>
          </div>
        ) : null}

        {statusMessage ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-[22px] border border-[#e7decf] bg-[#faf7f0] px-4 py-3 text-[#55645c] shadow-[var(--shadow)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c6d4f]">
              Settings status
            </p>
            <p className="mt-1.5 text-[13px] leading-5">{statusMessage}</p>
          </div>
        ) : null}

        <AllergyProfileSettings
          key={`allergy-${settings.allergyProfile.lastUpdated ?? settings.updatedAt}`}
          profile={settings.allergyProfile}
          onSave={(profile) => {
            updateAllergyProfile(profile);
            handleStatus("Allergy profile saved on this device.");
          }}
          onClear={() => {
            updateAllergyProfile({
              allergens: [],
              customAllergens: [],
              lastUpdated: new Date().toISOString(),
            });
            handleStatus("Allergy profile cleared on this device.");
          }}
        />

        <RegionSettings
          key={`region-${settings.regionSettings.region ?? "UNKNOWN"}-${settings.regionSettings.country}-${settings.regionSettings.language}`}
          value={settings.regionSettings}
          onSave={(regionSettings) => {
            updateRegionSettings(regionSettings);
            handleStatus("Region settings saved on this device.");
          }}
        />

        <ScanPreferencesSettings
          key={`scan-preferences-${settings.scanPreferences.defaultProductCategory}-${settings.scanPreferences.showNotCheckedExternalSections}-${settings.scanPreferences.showConfidenceNotes}-${settings.scanPreferences.autoRunExternalSafetyLookup}`}
          value={settings.scanPreferences}
          onSave={(scanPreferences) => {
            updateScanPreferences(scanPreferences);
            handleStatus("Scan preferences saved on this device.");
          }}
        />

        <section className="rounded-[24px] border border-[#e7decf] bg-white/78 px-4 py-4 shadow-[var(--shadow)]">
          <SectionLabel>Reset / Clear</SectionLabel>
          <p className="mt-1.5 text-[14px] leading-5 text-[#55645c]">
            Clear the allergy profile only, or reset every saved setting on this device.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                clearUserSettings();
                handleStatus("Saved settings cleared on this device.");
              }}
              className="rounded-full border border-[#ddd6ca] bg-white/88 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#33443c] transition active:scale-[0.99]"
            >
              Clear saved settings
            </button>
            <button
              type="button"
              onClick={() => {
                resetUserSettings();
                handleStatus("All settings reset to the Truthlabel MVP defaults.");
              }}
              className="rounded-full border border-[#1c3028] bg-[#1c3028] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition active:scale-[0.99]"
            >
              Reset all settings
            </button>
          </div>

          <p className="mt-3 text-[12px] leading-5 text-[#6a776f]">
            Allergy profile data stays local for this MVP and should not be synced without clear user consent.
          </p>
        </section>
      </div>
    </main>
  );
}
