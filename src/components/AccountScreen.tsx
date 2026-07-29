"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AllergyProfileSettings from "@/components/AllergyProfileSettings";
import ScanPreferencesSettings from "@/components/ScanPreferencesSettings";
import SupportContactLink from "@/components/SupportContactLink";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { getBrowserStorageNotice } from "@/lib/browserStorage";
import {
  clearUserSettings,
  resetUserSettings,
  updateAllergyProfile,
  updateScanPreferences,
  useUserSettings,
} from "@/lib/userSettings/userSettingsStorage";

type AccountIconName =
  | "arrow"
  | "check"
  | "clipboard"
  | "home"
  | "lock"
  | "shield"
  | "user";

const benefits = [
  "Keep your scan history",
  "Save products for later",
  "Sync your Watch List",
  "Access Truthlabel on another device",
] as const;

function Icon({
  name,
  className = "",
}: {
  name: AccountIconName;
  className?: string;
}) {
  const commonProps = {
    "aria-hidden": true,
    className: `h-5 w-5 ${className}`,
    fill: "none",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (name) {
    case "arrow":
      return (
        <svg {...commonProps}>
          <path
            d="M7 17 17 7M9 7h8v8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "check":
      return (
        <svg {...commonProps}>
          <path
            d="m5 12.5 4.2 4.2L19 7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...commonProps}>
          <path
            d="M9 5h6M8 13h8M8 17h5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
          <path
            d="M8.5 3.8h7A2.5 2.5 0 0 1 18 6.3v12.2A2.5 2.5 0 0 1 15.5 21h-7A2.5 2.5 0 0 1 6 18.5V6.3a2.5 2.5 0 0 1 2.5-2.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "home":
      return (
        <svg {...commonProps}>
          <path
            d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1h-4.2v-5.6H9.2V21H5a1 1 0 0 1-1-1v-9.2Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "lock":
      return (
        <svg {...commonProps}>
          <path
            d="M7 10V8a5 5 0 0 1 10 0v2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
          <path
            d="M6.5 10h11A1.5 1.5 0 0 1 19 11.5v7A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-7A1.5 1.5 0 0 1 6.5 10Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "shield":
      return (
        <svg {...commonProps}>
          <path
            d="M12 21s7-3.4 7-10.2V5.4L12 3 5 5.4v5.4C5 17.6 12 21 12 21Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="m8.8 12 2 2 4.4-4.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "user":
      return (
        <svg {...commonProps}>
          <path
            d="M12 12.2a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.8 20.2c.7-3.6 3.4-5.7 7.2-5.7s6.5 2.1 7.2 5.7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
  }
}

function TruthlabelMark() {
  return (
    <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-[#0E4C37] shadow-[0_7px_18px_rgba(14,76,55,0.18)]">
      <span className="grid gap-[3px]">
        <span className="h-[3px] w-[18px] rounded-full bg-[#E64B4F]" />
        <span className="h-[3px] w-[18px] rounded-full bg-[#F5C542]" />
        <span className="h-[3px] w-[18px] rounded-full bg-[#32A66A]" />
      </span>
    </span>
  );
}

function getAccountFirstName(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return "";
  }

  const values = metadata as Record<string, unknown>;
  const firstName = values.first_name || values.name || values.full_name;

  return typeof firstName === "string" ? firstName.trim() : "";
}

export default function AccountScreen() {
  const router = useRouter();
  const settings = useUserSettings();
  const {
    accessKind,
    subscription,
    trialAccess,
    trialDaysRemaining,
    user,
    refreshAccess,
    signOut,
  } = useTruthlabelAuth();
  const [statusMessage, setStatusMessage] = useState("");
  const storageNotice = getBrowserStorageNotice();

  const accessLabel =
    accessKind === "paid"
      ? "Active subscription or trial"
      : subscription?.status ?? "Inactive";
  const accountFirstName = getAccountFirstName(user?.user_metadata);
  void trialAccess;
  void trialDaysRemaining;

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  async function handleRefreshAccess() {
    await refreshAccess();
    setStatusMessage("Access status refreshed.");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-[18px] pt-[calc(14px+env(safe-area-inset-top))] text-[#101613] sm:px-5">
      <div className="mx-auto w-full max-w-[480px] pb-12">
        <header className="flex min-h-[58px] items-center justify-between gap-4">
          <Link
            href="/app"
            className="flex items-center gap-2.5 rounded-[14px] outline-none transition focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
            aria-label="Truthlabel home"
          >
            <TruthlabelMark />
            <span className="text-[20px] font-extrabold tracking-[-0.02em] text-[#101613]">
              Truth<span className="text-[#0E5A3F]">label</span>
            </span>
          </Link>
          <Link
            href="/app"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#D7E7DD] bg-[#F3FAF6] px-3 text-[12px] font-bold text-[#0E5A3F] transition hover:bg-[#E8F6EF] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <Icon name="home" className="h-4 w-4" />
            Home
          </Link>
        </header>

        <section className="mt-5 rounded-[22px] border border-[#F3E4A9] bg-[#FFFBEA] px-4 py-5 shadow-[0_5px_18px_rgba(15,40,28,0.055)]">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#FFF6D8] text-[#8A6500]">
            <Icon name="user" className="h-[23px] w-[23px]" />
          </span>
          <p className="mt-4 text-[12px] font-bold text-[#8A6500]">
            Truthlabel Account
          </p>
          <h1 className="mt-1 max-w-[330px] text-[30px] font-black leading-[1.08] tracking-[-0.025em] text-[#101613]">
            Save your scans and preferences
          </h1>
          <p className="mt-3 max-w-[360px] text-[14px] leading-[1.5] text-[#66716B]">
            Review your signed-in account, access status, Watch List, and privacy links.
          </p>
          <div className="mt-4 rounded-[16px] border border-[#D7E7DD] bg-white/78 px-3 py-3">
            <div className="flex items-start gap-2.5">
              <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-[#0E5A3F]" />
              <div className="min-w-0 text-[12.5px] leading-[1.45] text-[#66716B]">
                {accountFirstName ? (
                  <p>
                    First name{" "}
                    <span className="font-semibold text-[#101613]">
                      {accountFirstName}
                    </span>
                  </p>
                ) : null}
                <p>
                  Signed in as{" "}
                  <span className="font-semibold text-[#101613]">
                    {user?.email ?? "Unknown email"}
                  </span>
                </p>
                <p className="mt-1">
                  Access status:{" "}
                  <span className="font-semibold text-[#101613]">
                    {accessLabel}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[18px] border border-[#E2E8E4] bg-white px-4 py-4">
          <h2 className="text-[16px] font-extrabold text-[#101613]">
            Account access
          </h2>
          <p className="mt-1 text-[13px] leading-[1.45] text-[#66716B]">
            Truthlabel keeps you signed in on this device unless you sign out
            or clear the app&apos;s browser data.
          </p>
          {statusMessage ? (
            <p className="mt-3 rounded-[14px] border border-[#D7E7DD] bg-[#F3FAF6] px-3 py-2 text-[12px] font-semibold text-[#0E5A3F]">
              {statusMessage}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleRefreshAccess()}
              className="inline-flex h-10 items-center rounded-full border border-[#D7E7DD] bg-white px-4 text-[12px] font-bold text-[#0E5A3F] transition hover:bg-[#F3FAF6] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Refresh access
            </button>
            <Link
              href="/activate"
              className="inline-flex h-10 items-center rounded-full border border-[#D7E7DD] bg-[#F3FAF6] px-4 text-[12px] font-bold text-[#0E5A3F] transition hover:bg-[#E8F6EF] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Activation
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex h-10 items-center rounded-full border border-[#F3D2D4] bg-[#FFF6F6] px-4 text-[12px] font-bold text-[#A33A3F] transition hover:bg-[#FDEDEE] focus-visible:ring-2 focus-visible:ring-[#A33A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Sign out
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-[16px] border border-[#D7E7DD] bg-[#F3FAF6] px-4 py-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[14px] font-extrabold text-[#101613]">
                Need help with your account?
              </h2>
              <p className="mt-1 text-[12.5px] leading-[1.45] text-[#66716B]">
                Use this if checkout, activation, sign in, or scanning does not work.
              </p>
            </div>
            <SupportContactLink
              context="Account support"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-[#BFDCCB] bg-white px-4 text-[12px] font-bold text-[#0E5A3F] transition hover:bg-[#E8F6EF] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
            />
          </div>
        </section>

        <section className="mt-4 rounded-[18px] border border-[#E2E8E4] bg-white px-4 py-4">
          <h2 className="text-[16px] font-extrabold text-[#101613]">
            Account benefits
          </h2>
          <div className="mt-3 grid gap-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2.5 rounded-[14px] bg-[#F3FAF6] px-3 py-2.5"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#0E5A3F]">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <span className="text-[13.5px] font-semibold text-[#101613]">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </section>

        {storageNotice ? (
          <section
            role="status"
            aria-live="polite"
            className="mt-4 rounded-[18px] border border-[#F3D2D4] bg-[#FFF6F6] px-4 py-3 text-[#7A3D41]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
              Storage note
            </p>
            <p className="mt-1.5 text-[13px] leading-5">{storageNotice}</p>
          </section>
        ) : null}

        <section className="mt-4 rounded-[18px] border border-[#E2E8E4] bg-[#F6F8F7] px-4 py-4">
          <h2 className="text-[16px] font-extrabold text-[#101613]">
            Personal scan controls
          </h2>
          <p className="mt-1 text-[13px] leading-[1.45] text-[#66716B]">
            Manage allergy and scan preferences here. Region detection can be
            handled automatically later.
          </p>
          <div className="mt-4 grid gap-4">
            <AllergyProfileSettings
              key={`account-allergy-${settings.allergyProfile.lastUpdated ?? settings.updatedAt}`}
              profile={settings.allergyProfile}
              onSave={(profile) => {
                updateAllergyProfile(profile);
                setStatusMessage("Allergy Watch List saved on this device.");
              }}
              onClear={() => {
                updateAllergyProfile({
                  allergens: [],
                  customAllergens: [],
                  lastUpdated: new Date().toISOString(),
                });
                setStatusMessage("Allergy Watch List cleared on this device.");
              }}
            />

            <ScanPreferencesSettings
              key={`account-scan-preferences-${settings.scanPreferences.defaultProductCategory}-${settings.scanPreferences.showNotCheckedExternalSections}-${settings.scanPreferences.showConfidenceNotes}-${settings.scanPreferences.autoRunExternalSafetyLookup}`}
              value={settings.scanPreferences}
              onSave={(scanPreferences) => {
                updateScanPreferences(scanPreferences);
                setStatusMessage("Result preferences saved on this device.");
              }}
            />
          </div>
        </section>

        <section className="mt-4 rounded-[18px] border border-[#E2E8E4] bg-white px-4 py-4">
          <h2 className="text-[16px] font-extrabold text-[#101613]">
            Local data
          </h2>
          <p className="mt-1 text-[13px] leading-[1.45] text-[#66716B]">
            Clear or reset the local Watch List and scan preferences saved on
            this device.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                clearUserSettings();
                setStatusMessage("Local preferences cleared on this device.");
              }}
              className="inline-flex h-10 items-center rounded-full border border-[#D7E7DD] bg-white px-4 text-[12px] font-bold text-[#0E5A3F] transition hover:bg-[#F3FAF6] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Clear local data
            </button>
            <button
              type="button"
              onClick={() => {
                resetUserSettings();
                setStatusMessage("Preferences reset to Truthlabel defaults.");
              }}
              className="inline-flex h-10 items-center rounded-full border border-[#F3D2D4] bg-[#FFF6F6] px-4 text-[12px] font-bold text-[#A33A3F] transition hover:bg-[#FDEDEE] focus-visible:ring-2 focus-visible:ring-[#A33A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Reset preferences
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-[16px] border border-[#E9E1D2] bg-[#FBF8F1] px-4 py-3.5">
          <div className="flex items-start gap-3">
              <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-[#0E5A3F]" />
            <p className="text-[13px] leading-[1.48] text-[#66716B]">
              Privacy note: your allergy profile should be treated as sensitive preference data. Always check the product label yourself, especially for allergies.
            </p>
          </div>
        </section>

        <div className="mt-4 flex flex-wrap gap-3 px-1 text-[12px] font-semibold text-[#66716B]">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/health-disclaimer">Health disclaimer</Link>
          <Link href="/update-password">Change password</Link>
        </div>
      </div>
    </main>
  );
}
