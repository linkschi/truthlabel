"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import AllergyProfileSettings from "@/components/AllergyProfileSettings";
import ScanPreferencesSettings from "@/components/ScanPreferencesSettings";
import SupportContactLink from "@/components/SupportContactLink";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { publicAppConfig } from "@/lib/appConfig";
import { hasMvpActivationAccess } from "@/lib/auth/mvpActivationAccess";
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

function formatAccountDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

function getSubscriptionAccessLabel(
  subscription: ReturnType<typeof useTruthlabelAuth>["subscription"],
) {
  if (!subscription) {
    return "";
  }

  const accessEndDate = formatAccountDate(subscription.access_ends_at);

  switch (subscription.status) {
    case "active":
      return "Active subscription";
    case "active_until_end":
      return accessEndDate
        ? `Canceled, active until ${accessEndDate}`
        : "Canceled, active until period end";
    case "payment_failed":
      return "Payment issue";
    case "expired":
      return "Expired";
    case "refunded":
      return "Refunded";
    case "disputed":
      return "Payment disputed";
    case "chargebacked":
      return "Chargebacked";
    case "inactive":
    default:
      return "Inactive";
  }
}

function subscribeToMvpAccessStore() {
  return () => undefined;
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
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const hasMvpAccessPass = useSyncExternalStore(
    subscribeToMvpAccessStore,
    hasMvpActivationAccess,
    () => false,
  );
  const storageNotice = getBrowserStorageNotice();
  const manageSubscriptionUrl =
    publicAppConfig.gumroadManageSubscriptionUrl ||
    publicAppConfig.gumroadCheckoutUrl;
  const subscriptionAccessLabel = getSubscriptionAccessLabel(subscription);

  const accessLabel =
    accessKind === "paid"
      ? subscriptionAccessLabel || "Active subscription"
      : hasMvpAccessPass
        ? "Active MVP access on this device"
        : subscriptionAccessLabel || "Inactive";
  const accountFirstName = getAccountFirstName(user?.user_metadata);
  void trialAccess;
  void trialDaysRemaining;
  const savedAllergyCount =
    settings.allergyProfile.allergens.length +
    settings.allergyProfile.customAllergens.length;

  useEffect(() => {
    if (!isPreferencesOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPreferencesOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isPreferencesOpen]);

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  async function handleRefreshAccess() {
    await refreshAccess();
    const nextHasMvpAccessPass = hasMvpActivationAccess();
    setStatusMessage(
      nextHasMvpAccessPass
        ? "MVP access is active on this device."
        : "Access status refreshed.",
    );
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
          {hasMvpAccessPass && accessKind !== "paid" ? (
            <p className="mt-3 rounded-[14px] border border-[#D7E7DD] bg-[#F3FAF6] px-3 py-2 text-[12px] font-semibold leading-5 text-[#0E5A3F]">
              Your activation link has opened MVP access on this device. Full
              checkout/subscription linking can still be completed later.
            </p>
          ) : null}
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
            <Link
              href="/app/onboarding?review=1&restart=1"
              className="inline-flex h-10 items-center rounded-full border border-[#D7E7DD] bg-[#F3FAF6] px-4 text-[12px] font-bold text-[#0E5A3F] transition hover:bg-[#E8F6EF] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              View onboarding again
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

        <section className="mt-4 rounded-[18px] border border-[#F1DDAD] bg-[#FFFBEC] px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#8A6500]">
              <Icon name="lock" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-extrabold text-[#101613]">
                Subscription
              </h2>
              <p className="mt-1 text-[13px] leading-[1.5] text-[#66716B]">
                Manage billing or cancel your Truthlabel subscription from the
                checkout account page. If you cancel, access should remain on
                until the current billing period ends.
              </p>
              {subscription?.status === "active_until_end" ? (
                <p className="mt-3 rounded-[14px] border border-[#F1DDAD] bg-white px-3 py-2 text-[12px] font-semibold leading-5 text-[#8A6500]">
                  Cancellation received. {accessLabel}
                </p>
              ) : null}
              {isCancelConfirmOpen ? (
                <div className="mt-3 rounded-[16px] border border-[#F3D2D4] bg-white px-3 py-3">
                  <p className="text-[13px] font-extrabold text-[#101613]">
                    Are you sure you want to cancel?
                  </p>
                  <p className="mt-1 text-[12.5px] leading-5 text-[#66716B]">
                    This opens your subscription management page. Truthlabel
                    will update access when the checkout cancellation signal is
                    received.
                  </p>
                  <div className="mt-3 rounded-[14px] border border-[#D7E7DD] bg-[#F8FBF9] px-3 py-2.5 text-left">
                    <p className="text-[12.5px] font-extrabold text-[#101613]">
                      Different checkout email?
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-[#66716B]">
                      Link your license key before canceling so Truthlabel knows
                      which account and checkout belong together. You can
                      usually find the key in your purchase email or receipt.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href="/activate"
                        className="inline-flex h-9 items-center rounded-full border border-[#BFDCCB] bg-white px-3.5 text-[11px] font-bold text-[#0E5A3F] transition hover:bg-[#E8F6EF] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
                      >
                        Link license key
                      </Link>
                      <SupportContactLink
                        context="Lost license key or cancel help"
                        className="inline-flex h-9 items-center rounded-full border border-[#E2E8E4] bg-white px-3.5 text-[11px] font-bold text-[#66716B] transition hover:bg-[#F6F8F7] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
                      >
                        I lost my key
                      </SupportContactLink>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={manageSubscriptionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center rounded-full bg-[#A33A3F] px-4 text-[12px] font-bold text-white transition hover:bg-[#8D3035] focus-visible:ring-2 focus-visible:ring-[#A33A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
                    >
                      Continue to cancel
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsCancelConfirmOpen(false)}
                      className="inline-flex h-10 items-center rounded-full border border-[#D7E7DD] bg-white px-4 text-[12px] font-bold text-[#0E5A3F] transition hover:bg-[#F3FAF6] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
                    >
                      Keep subscription
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCancelConfirmOpen(true)}
                  className="mt-3 inline-flex h-10 items-center rounded-full border border-[#F3D2D4] bg-white px-4 text-[12px] font-bold text-[#A33A3F] transition hover:bg-[#FFF6F6] focus-visible:ring-2 focus-visible:ring-[#A33A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  Cancel subscription
                </button>
              )}
            </div>
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

        <section className="mt-4 rounded-[18px] border border-[#D7E7DD] bg-[#F3FAF6] px-4 py-4 shadow-[0_5px_18px_rgba(15,40,28,0.045)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[17px] font-extrabold text-[#101613]">
                Allergy Watch List & scan preferences
              </h2>
              <p className="mt-1.5 text-[13px] leading-[1.45] text-[#66716B]">
                Choose allergens Truthlabel should flag strongly, then set a few scan defaults.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-[#C8E0D2] bg-white px-2.5 py-1 text-[11px] font-bold text-[#0E5A3F]">
              {savedAllergyCount} saved
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPreferencesOpen(true)}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[14px] border border-[#0E5A3F] bg-[#0E5A3F] px-4 text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(14,90,63,0.14)] transition hover:bg-[#0B4732] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Open allergy and scan settings
          </button>
        </section>

        {isPreferencesOpen ? (
          <div
            className="fixed inset-0 z-50 bg-[#101613]/45 px-3 py-[calc(18px+env(safe-area-inset-top))] backdrop-blur-sm"
            onClick={() => setIsPreferencesOpen(false)}
            role="presentation"
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="account-preferences-title"
              className="mx-auto flex h-full max-h-[760px] w-full max-w-[500px] flex-col overflow-hidden rounded-[26px] border border-white/70 bg-[#F8FBF9] shadow-[0_24px_70px_rgba(16,22,19,0.22)]"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="flex items-start justify-between gap-4 border-b border-[#E2E8E4] bg-white px-4 py-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0E5A3F]">
                    Account settings
                  </p>
                  <h2
                    id="account-preferences-title"
                    className="mt-1 text-[20px] font-black leading-tight text-[#101613]"
                  >
                    Allergy & scan preferences
                  </h2>
                  <p className="mt-1 text-[12.5px] leading-5 text-[#66716B]">
                    Update allergy warnings and scan behavior in one place.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreferencesOpen(false)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D7E7DD] bg-[#F3FAF6] text-[18px] font-bold text-[#0E5A3F] transition hover:bg-[#E8F6EF] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
                  aria-label="Close allergy and scan settings"
                >
                  X
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <div className="grid gap-4">
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
              </div>
            </section>
          </div>
        ) : null}

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

        <section className="mt-4 rounded-[18px] border border-[#E2E8E4] bg-white px-4 py-4">
          <h2 className="text-[16px] font-extrabold text-[#101613]">
            Account benefits
          </h2>
          <div className="-mx-1 mt-3 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex min-w-[168px] snap-start items-center gap-2.5 rounded-[15px] border border-[#D7E7DD] bg-[#F3FAF6] px-3 py-3"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#0E5A3F]">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <span className="text-[12.5px] font-bold leading-[1.25] text-[#101613]">
                  {benefit}
                </span>
              </div>
            ))}
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
