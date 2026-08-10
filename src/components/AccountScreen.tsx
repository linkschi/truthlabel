"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import AppBottomNavigation from "@/components/AppBottomNavigation";
import AllergyProfileSettings from "@/components/AllergyProfileSettings";
import ScanPreferencesSettings from "@/components/ScanPreferencesSettings";
import SupportContactLink from "@/components/SupportContactLink";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { avoidOptions, type AvoidConcern } from "@/data/fakeProduct";
import { getThiislincornSampleProducts } from "@/data/demoProducts";
import { trackTruthlabelEvent } from "@/lib/analytics/analyticsClient";
import { normalizeAnalyticsError } from "@/lib/analytics/analyticsEvents";
import { hasMvpActivationAccess } from "@/lib/auth/mvpActivationAccess";
import {
  getBrowserStorageNotice,
  safeLocalStorageRemoveItem,
} from "@/lib/browserStorage";
import { isThiislincornOnboardingTestAccount } from "@/lib/onboarding/onboardingTestMode";
import {
  clearScanHistory,
  listScanHistory,
} from "@/lib/scanHistory/scanHistoryClient";
import { saveProfile, useStoredProfile } from "@/lib/profileStorage";
import { defaultUserSettings } from "@/lib/userSettings/defaultUserSettings";
import { buildSupportMailtoHref } from "@/lib/supportContact";
import {
  clearUserSettings,
  updateAllergyProfile,
  updateScanPreferences,
  useUserSettings,
} from "@/lib/userSettings/userSettingsStorage";

type AccountIconName =
  | "alert"
  | "arrow"
  | "camera"
  | "check"
  | "chevron"
  | "clipboard"
  | "home"
  | "history"
  | "help"
  | "lock"
  | "settings"
  | "shield"
  | "trash"
  | "user";

type ProtectionPanel = "all" | "allergy" | "food" | "custom" | "scan";
type ConfirmationAction =
  | "clear_history"
  | "reset_preferences"
  | "clear_device_data"
  | "delete_account";

const thiislincornSampleProducts = getThiislincornSampleProducts();

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
    case "alert":
      return (
        <svg {...commonProps}>
          <path
            d="M12 8v5M12 17.2h.01M10.4 4.7 3.7 16.3A2.1 2.1 0 0 0 5.5 19.5h13a2.1 2.1 0 0 0 1.8-3.2L13.6 4.7a1.85 1.85 0 0 0-3.2 0Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
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
    case "camera":
      return (
        <svg {...commonProps}>
          <path
            d="M5 8.5h3l1.4-2h5.2l1.4 2h3A1.8 1.8 0 0 1 20.8 10v7A1.8 1.8 0 0 1 19 18.8H5A1.8 1.8 0 0 1 3.2 17v-7A1.8 1.8 0 0 1 5 8.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M12 16a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z"
            stroke="currentColor"
            strokeWidth="1.7"
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
    case "chevron":
      return (
        <svg {...commonProps}>
          <path
            d="m9 6 6 6-6 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
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
    case "history":
      return (
        <svg {...commonProps}>
          <path
            d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 8.9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M4.5 5v4h4M12 8v4.3l3 1.7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "help":
      return (
        <svg {...commonProps}>
          <path
            d="M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M9.8 9.5a2.25 2.25 0 1 1 3.7 1.7c-.9.7-1.5 1.1-1.5 2.3M12 16.8h.01"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
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
    case "settings":
      return (
        <svg {...commonProps}>
          <path
            d="M12 15.3a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M19.2 13.6v-3.2l-2-.5a6.6 6.6 0 0 0-.7-1.6l1.1-1.7-2.2-2.2-1.7 1.1a6.6 6.6 0 0 0-1.6-.7l-.5-2H10.4l-.5 2a6.6 6.6 0 0 0-1.6.7L6.6 4.4 4.4 6.6l1.1 1.7a6.6 6.6 0 0 0-.7 1.6l-2 .5v3.2l2 .5c.2.6.4 1.1.7 1.6l-1.1 1.7 2.2 2.2 1.7-1.1c.5.3 1 .5 1.6.7l.5 2h3.2l.5-2c.6-.2 1.1-.4 1.6-.7l1.7 1.1 2.2-2.2-1.1-1.7c.3-.5.5-1 .7-1.6l2-.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.45"
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
    case "trash":
      return (
        <svg {...commonProps}>
          <path
            d="M5 7h14M10 11v5M14 11v5M9 7l.8-2h4.4L15 7M7 7l.7 13h8.6L17 7"
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

function buildCancellationSupportBody({
  accountName,
  appEmail,
  checkoutEmail,
  accessStatusLabel,
  subscriptionStatus,
  accessEndDate,
  cancellationDetectedAt,
}: {
  accountName: string;
  appEmail: string;
  checkoutEmail: string;
  accessStatusLabel: string;
  subscriptionStatus: string;
  accessEndDate: string;
  cancellationDetectedAt: string;
}) {
  return [
    "Cancellation matching request",
    "",
    "Please resend my TruthLabel checkout receipt so I can use the subscription settings/cancel button.",
    "",
    `Account name: ${accountName || "not shown"}`,
    `Signed-in app email: ${appEmail}`,
    `Checkout/billing email: ${checkoutEmail.trim() || "[not entered]"}`,
    `Current app access: ${accessStatusLabel}`,
    `Subscription status shown in app: ${subscriptionStatus || "unknown"}`,
    `Access end date shown in app: ${accessEndDate || "not shown"}`,
    `Cancellation detected in app: ${cancellationDetectedAt || "not shown"}`,
    `Request time: ${new Date().toISOString()}`,
    "",
    "Notes:",
  ].join("\n");
}

function buildReceiptInboxHref(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const domain = cleanEmail.split("@").at(1) ?? "";
  const searchQuery = encodeURIComponent("Truthlabel checkout receipt subscription");

  if (domain === "gmail.com" || domain === "googlemail.com") {
    return `https://mail.google.com/mail/u/${encodeURIComponent(cleanEmail)}/#search/${searchQuery}`;
  }

  if (
    domain === "outlook.com" ||
    domain === "hotmail.com" ||
    domain === "live.com" ||
    domain === "msn.com"
  ) {
    return `https://outlook.live.com/mail/0/search?q=${searchQuery}`;
  }

  if (domain === "yahoo.com" || domain === "ymail.com" || domain === "rocketmail.com") {
    return "https://mail.yahoo.com/";
  }

  if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") {
    return "https://www.icloud.com/mail/";
  }

  if (domain === "proton.me" || domain === "protonmail.com") {
    return "https://mail.proton.me/";
  }

  return "https://mail.google.com/";
}

function getAccessStatus(args: {
  accessState: ReturnType<typeof useTruthlabelAuth>["accessState"];
  accessKind: ReturnType<typeof useTruthlabelAuth>["accessKind"];
  hasMvpAccessPass: boolean;
  subscription: ReturnType<typeof useTruthlabelAuth>["subscription"];
}) {
  if (args.accessState === "loading") {
    return {
      label: "Checking access",
      className: "border-[#DCE5DF] bg-white text-[#56635C]",
    };
  }

  if (
    args.subscription?.status === "payment_failed" ||
    args.subscription?.status === "disputed" ||
    args.subscription?.status === "chargebacked"
  ) {
    return {
      label: "Payment issue",
      className: "border-[#F4C7C9] bg-[#FFF6F6] text-[#B42318]",
    };
  }

  if (args.subscription?.status === "active_until_end" && args.accessKind === "paid") {
    return {
      label: "Access ending",
      className: "border-[#F1DDAD] bg-[#FFF8E1] text-[#8A6500]",
    };
  }

  if (
    args.accessKind === "paid" ||
    args.hasMvpAccessPass ||
    args.accessState === "active"
  ) {
    return {
      label: "Active",
      className: "border-[#BFDCCB] bg-[#EDF7F1] text-[#0E5A3F]",
    };
  }

  return {
    label: "Inactive",
    className: "border-[#DCE5DF] bg-white text-[#56635C]",
  };
}

function getInitials(name: string, email: string) {
  const source = name || email;
  const parts = source
    .replace(/@.*/, "")
    .split(/[\s._+-]+/)
    .filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "T";
  const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? "L";

  return `${first}${second}`.toUpperCase();
}

function subscribeToMvpAccessStore() {
  return () => undefined;
}

function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`mt-4 rounded-[20px] border border-[#DCE5DF] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,40,28,0.045)] ${className}`}
      aria-labelledby={`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`}
    >
      <h2
        id={`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`}
        className="text-[18px] font-extrabold text-[#101613]"
      >
        {title}
      </h2>
      <div className="mt-3 divide-y divide-[#EEF1EF]">{children}</div>
    </section>
  );
}

function RowShell({
  icon,
  title,
  detail,
  meta,
  destructive = false,
}: {
  icon: AccountIconName;
  title: string;
  detail?: string;
  meta?: string;
  destructive?: boolean;
}) {
  return (
    <>
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${
          destructive ? "bg-[#FFF6F6] text-[#B42318]" : "bg-[#EDF7F1] text-[#0E5A3F]"
        }`}
      >
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-[14px] font-extrabold ${
            destructive ? "text-[#B42318]" : "text-[#101613]"
          }`}
        >
          {title}
        </span>
        {detail ? (
          <span className="mt-0.5 block text-[12.5px] leading-5 text-[#56635C]">
            {detail}
          </span>
        ) : null}
      </span>
      {meta ? (
        <span className="shrink-0 rounded-full border border-[#DCE5DF] bg-[#F7F9F7] px-2.5 py-1 text-[11px] font-extrabold text-[#56635C]">
          {meta}
        </span>
      ) : null}
      <Icon
        name="chevron"
        className={`h-4 w-4 shrink-0 ${destructive ? "text-[#B42318]" : "text-[#879089]"}`}
      />
    </>
  );
}

function RowButton({
  icon,
  title,
  detail,
  meta,
  destructive,
  onClick,
}: {
  icon: AccountIconName;
  title: string;
  detail?: string;
  meta?: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid min-h-[58px] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 py-3 text-left outline-none transition hover:bg-[#F7F9F7] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
    >
      <RowShell
        icon={icon}
        title={title}
        detail={detail}
        meta={meta}
        destructive={destructive}
      />
    </button>
  );
}

function RowLink({
  icon,
  title,
  detail,
  meta,
  href,
  destructive,
  external = false,
}: {
  icon: AccountIconName;
  title: string;
  detail?: string;
  meta?: string;
  href: string;
  destructive?: boolean;
  external?: boolean;
}) {
  const className =
    "grid min-h-[58px] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 py-3 text-left outline-none transition hover:bg-[#F7F9F7] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2";
  const children = (
    <RowShell
      icon={icon}
      title={title}
      detail={detail}
      meta={meta}
      destructive={destructive}
    />
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function FoodPreferenceSettings({
  selected,
  onToggle,
}: {
  selected: AvoidConcern[];
  onToggle: (value: AvoidConcern) => void;
}) {
  return (
    <section className="rounded-[22px] border border-[#DCE5DF] bg-white px-4 py-4">
      <h3 className="text-[16px] font-extrabold text-[#101613]">
        Food preferences
      </h3>
      <p className="mt-1.5 text-[13px] leading-5 text-[#56635C]">
        Choose the food concerns Truthlabel should keep visible for you.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {avoidOptions.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              aria-pressed={isSelected}
              className={`min-h-10 rounded-full border px-3.5 text-[12px] font-extrabold transition focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99] ${
                isSelected
                  ? "border-[#0E5A3F] bg-[#0E5A3F] text-white"
                  : "border-[#DCE5DF] bg-[#F7F9F7] text-[#56635C]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function getConfirmationCopy(action: ConfirmationAction) {
  switch (action) {
    case "clear_history":
      return {
        title: "Clear scan history?",
        message:
          "This will permanently remove saved scan snapshots from your account.",
        confirmLabel: "Clear scan history",
      };
    case "reset_preferences":
      return {
        title: "Reset your preferences?",
        message:
          "This will remove your selected food preferences. Your account and scan history will not be deleted.",
        confirmLabel: "Reset preferences",
      };
    case "clear_device_data":
      return {
        title: "Clear data from this device?",
        message:
          "Removes cached settings and results stored only on this phone. Your account will not be deleted.",
        confirmLabel: "Clear device data",
      };
    case "delete_account":
      return {
        title: "Delete your account?",
        message:
          "Account deletion is handled by support during MVP testing so we can verify the request safely.",
        confirmLabel: "Contact support",
      };
  }
}

export default function AccountScreen() {
  const router = useRouter();
  const settings = useUserSettings();
  const profile = useStoredProfile();
  const {
    accessState,
    accessKind,
    errorMessage,
    subscription,
    trialAccess,
    trialDaysRemaining,
    user,
    refreshAccess,
    signOut,
  } = useTruthlabelAuth();
  const [statusMessage, setStatusMessage] = useState("");
  const [protectionPanel, setProtectionPanel] = useState<ProtectionPanel | null>(null);
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReceiptHelpOpen, setCancelReceiptHelpOpen] = useState(false);
  const [cancelCheckoutEmail, setCancelCheckoutEmail] = useState("");
  const [scanHistoryCount, setScanHistoryCount] = useState<number | null>(null);
  const hasMvpAccessPass = useSyncExternalStore(
    subscribeToMvpAccessStore,
    hasMvpActivationAccess,
    () => false,
  );
  const storageNotice = getBrowserStorageNotice();
  const accountFirstName = getAccountFirstName(user?.user_metadata);
  const accountEmail = user?.email ?? "Unknown email";
  const accessStatus = getAccessStatus({
    accessState,
    accessKind,
    hasMvpAccessPass,
    subscription,
  });
  const accountInitials = getInitials(accountFirstName, accountEmail);
  const accessEndDate = formatAccountDate(subscription?.access_ends_at);
  const cancellationDetectedDate = formatAccountDate(
    subscription?.cancellation_detected_at,
  );
  const accessIsActive = accessStatus.label === "Active" || accessStatus.label === "Access ending";
  const cancelButtonVisible = accessState !== "loading";
  const cancelCheckoutEmailReady = /\S+@\S+\.\S+/.test(
    cancelCheckoutEmail.trim(),
  );
  const receiptInboxHref = buildReceiptInboxHref(accountEmail);
  const cancellationSupportHref = buildSupportMailtoHref({
    subject: "Truthlabel receipt resend request",
    body: buildCancellationSupportBody({
      accountName: accountFirstName,
      appEmail: accountEmail,
      checkoutEmail: cancelCheckoutEmail,
      accessStatusLabel: accessStatus.label,
      subscriptionStatus: subscription?.status ?? "unknown",
      accessEndDate,
      cancellationDetectedAt: cancellationDetectedDate,
    }),
  });
  void trialAccess;
  void trialDaysRemaining;
  const allergyCount = settings.allergyProfile.allergens.length;
  const customIngredientCount = settings.allergyProfile.customAllergens.length;
  const foodPreferenceCount = profile.avoid.length;
  const isThiislincornTester = isThiislincornOnboardingTestAccount(user?.email);

  useEffect(() => {
    if (!protectionPanel && !cancelDialogOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProtectionPanel(null);
        closeCancelDialog();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [cancelDialogOpen, protectionPanel]);

  function closeCancelDialog() {
    setCancelDialogOpen(false);
    setCancelReceiptHelpOpen(false);
  }

  useEffect(() => {
    const loadHandle = window.setTimeout(() => {
      void listScanHistory({ limit: 100 })
        .then((records) => setScanHistoryCount(records.length))
        .catch(() => setScanHistoryCount(null));
    }, 0);

    return () => window.clearTimeout(loadHandle);
  }, []);

  async function handleSignOut() {
    trackTruthlabelEvent(
      "signout_started",
      {
        access_status: accessStatus.label,
        subscription_status: subscription?.status ?? "unknown",
      },
      { userId: user?.id },
    );

    try {
      await signOut();
      trackTruthlabelEvent("signout_success", {
        source: "account_page",
      });
      router.replace("/");
    } catch (error) {
      trackTruthlabelEvent(
        "signout_failed",
        {
          error_type: normalizeAnalyticsError(error),
          source: "account_page",
        },
        { userId: user?.id },
      );
      setStatusMessage("We couldn't sign out. Try again.");
    }
  }

  async function handleRefreshAccess() {
    trackTruthlabelEvent(
      "access_check_started",
      {
        source: "account_page_button",
        access_status: accessStatus.label,
      },
      { userId: user?.id },
    );
    await refreshAccess();
    trackTruthlabelEvent(
      "access_check_success",
      {
        source: "account_page_button",
      },
      { userId: user?.id },
    );
    const nextHasMvpAccessPass = hasMvpActivationAccess();
    setStatusMessage(
      nextHasMvpAccessPass
        ? "MVP access is active on this device."
        : "Access status refreshed.",
    );
  }

  function handleOpenCancelDialog() {
    trackTruthlabelEvent(
      "subscription_cancel_started",
      {
        access_status: accessStatus.label,
        subscription_status: subscription?.status ?? "unknown",
      },
      { userId: user?.id },
    );
    setCancelReceiptHelpOpen(false);
    setCancelDialogOpen(true);
  }

  function handleOpenManageSubscription(source: "access_card") {
    trackTruthlabelEvent(
      "subscription_manage_opened",
      {
        source,
        access_status: accessStatus.label,
        subscription_status: subscription?.status ?? "unknown",
      },
      { userId: user?.id },
    );
    setCancelReceiptHelpOpen(false);
    setCancelDialogOpen(true);
  }

  function handleEmailCancellationDetails() {
    trackTruthlabelEvent(
      "subscription_cancel_email_started",
      {
        has_checkout_email: Boolean(cancelCheckoutEmail.trim()),
        access_status: accessStatus.label,
        subscription_status: subscription?.status ?? "unknown",
      },
      { userId: user?.id },
    );
    setStatusMessage("Receipt resend request prepared. Send the email after it opens.");
  }

  function handleToggleFoodPreference(value: AvoidConcern) {
    saveProfile({
      ...profile,
      avoid: profile.avoid.includes(value)
        ? profile.avoid.filter((entry) => entry !== value)
        : [...profile.avoid, value],
    });
  }

  async function handleConfirmAction() {
    const action = confirmationAction;

    if (!action) {
      return;
    }

    setConfirmationAction(null);

    if (action === "clear_history") {
      try {
        await clearScanHistory();
        setScanHistoryCount(0);
        setStatusMessage("Scan history cleared.");
      } catch {
        setStatusMessage("We couldn't clear scan history. Try again.");
      }
      return;
    }

    if (action === "reset_preferences") {
      updateScanPreferences(defaultUserSettings.scanPreferences);
      saveProfile({ ...profile, avoid: [] });
      setStatusMessage("Food preferences reset. Your account and scan history were not deleted.");
      return;
    }

    if (action === "clear_device_data") {
      clearUserSettings();
      saveProfile({ allergies: [], avoid: [] });
      safeLocalStorageRemoveItem("insideit.manual-scan.latest");
      safeLocalStorageRemoveItem("insideit.barcode-scan.latest");
      setStatusMessage("Device data cleared. Your account was not deleted.");
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F9F7] px-[18px] pt-[calc(14px+env(safe-area-inset-top))] text-[#101613] sm:px-5">
      <div className="mx-auto w-full max-w-[480px] pb-[calc(100px+env(safe-area-inset-bottom))]">
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

        <section className="mt-5" aria-labelledby="account-title">
          <h1
            id="account-title"
            className="text-[30px] font-black leading-tight tracking-[-0.025em] text-[#101613]"
          >
            Account
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#0E5A3F] text-[15px] font-black text-white">
              {accountInitials}
            </span>
            <div className="min-w-0 flex-1">
              {accountFirstName ? (
                <p className="truncate text-[14px] font-extrabold text-[#101613]">
                  {accountFirstName}
                </p>
              ) : null}
              <p className="break-all text-[13px] font-semibold leading-5 text-[#56635C]">
                {accountEmail}
              </p>
              <span
                className={`mt-2 inline-flex min-h-7 items-center rounded-full border px-3 text-[12px] font-extrabold ${accessStatus.className}`}
              >
                {accessStatus.label}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[20px] border border-[#DCE5DF] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,40,28,0.045)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[18px] font-extrabold text-[#101613]">
                Truthlabel access
              </h2>
              <p className="mt-1.5 text-[13px] leading-[1.5] text-[#56635C]">
                {accessState === "loading"
                  ? "Checking your Truthlabel access."
                  : accessIsActive
                    ? "Your Truthlabel access is active."
                    : "Your account is signed in, but paid access has not been activated."}
              </p>
              {accessEndDate && accessIsActive ? (
                <p className="mt-1 text-[12px] font-semibold text-[#56635C]">
                  Access end date: {accessEndDate}
                </p>
              ) : null}
            </div>
            <span
              className={`inline-flex shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-extrabold ${accessStatus.className}`}
            >
              {accessStatus.label}
            </span>
          </div>
          {errorMessage ? (
            <p
              className={`mt-3 rounded-[14px] border px-3 py-2 text-[12px] font-semibold leading-5 ${
                accessIsActive
                  ? "border-[#BFDCCB] bg-[#EDF7F1] text-[#0E5A3F]"
                  : "border-[#F4C7C9] bg-[#FFF6F6] text-[#B42318]"
              }`}
            >
              {accessIsActive
                ? "Access is active. The latest refresh did not finish, so Truthlabel is using the last confirmed account access."
                : "Access lookup failed. Try checking access again."}
            </p>
          ) : null}
          {hasMvpAccessPass && accessKind !== "paid" ? (
            <p className="mt-3 rounded-[14px] border border-[#BFDCCB] bg-[#EDF7F1] px-3 py-2 text-[12px] font-semibold leading-5 text-[#0E5A3F]">
              Truthlabel MVP access is open on this device. Full
              checkout/subscription linking can still be completed later.
            </p>
          ) : null}
          {statusMessage ? (
            <p className="mt-3 rounded-[14px] border border-[#BFDCCB] bg-[#EDF7F1] px-3 py-2 text-[12px] font-semibold text-[#0E5A3F]">
              {statusMessage}
            </p>
          ) : null}
          <div className="mt-4 grid gap-2 min-[390px]:grid-cols-2">
            {accessIsActive ? (
              <button
                type="button"
                onClick={() => handleOpenManageSubscription("access_card")}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0E5A3F] px-4 text-[13px] font-extrabold text-white transition hover:bg-[#0B4732] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                Manage subscription
              </button>
            ) : (
              <Link
                href="/app"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0E5A3F] px-4 text-[13px] font-extrabold text-white transition hover:bg-[#0B4732] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                Open app
              </Link>
            )}
            {cancelButtonVisible ? (
              <button
                type="button"
                onClick={handleOpenCancelDialog}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#F4C7C9] bg-[#FFF6F6] px-4 text-[13px] font-extrabold text-[#B42318] transition hover:bg-[#FDECEC] focus-visible:ring-2 focus-visible:ring-[#B42318] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                Cancel subscription
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void handleRefreshAccess()}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#DCE5DF] bg-white px-4 text-[13px] font-extrabold text-[#0E5A3F] transition hover:bg-[#EDF7F1] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Check access
            </button>
          </div>
        </section>

        <SectionCard title="Your protection">
          <RowButton
            icon="shield"
            title="Allergy Watch List"
            meta={`${allergyCount} selected`}
            onClick={() => setProtectionPanel("allergy")}
          />
          <RowButton
            icon="settings"
            title="Food preferences"
            meta={`${foodPreferenceCount} selected`}
            onClick={() => setProtectionPanel("food")}
          />
          <RowButton
            icon="clipboard"
            title="Custom ingredients"
            meta={`${customIngredientCount} watched`}
            onClick={() => setProtectionPanel("custom")}
          />
          <div className="pt-3">
            <button
              type="button"
              onClick={() => setProtectionPanel("all")}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#0E5A3F] px-4 text-[13px] font-extrabold text-white transition hover:bg-[#0B4732] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Manage protection settings
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Your activity">
          <RowLink
            icon="history"
            title="Scan history"
            meta={scanHistoryCount === null ? undefined : `${scanHistoryCount} scans`}
            href="/app/history"
          />
        </SectionCard>

        <SectionCard title="App settings">
          <RowLink
            icon="check"
            title="Install TruthLabel"
            detail="Finish installing TruthLabel on your Home Screen."
            href="/app/onboarding?review=1&install=1"
          />
          <RowLink
            icon="clipboard"
            title="View onboarding again"
            href="/app/onboarding?review=1&restart=1"
          />
        </SectionCard>

        {isThiislincornTester ? (
          <SectionCard title="Admin tools">
            <p className="pb-2 text-[12.5px] font-semibold leading-5 text-[#56635C]">
              Visible only on thiislincorn test accounts. These are the private tools
              for custom demo results and internal analytics.
            </p>
            <RowLink
              icon="settings"
              title="Demo Scan Builder"
              detail="Create and reopen customizable scan-result examples."
              href="/app/admin/demo-scan-builder"
            />
            <RowLink
              icon="history"
              title="Internal analytics"
              detail="Review MVP reliability, funnel, and business signals."
              href="/app/admin/analytics"
            />
            <RowLink
              icon="check"
              title="Better Picks MVP"
              detail="Open the admin-only Healthy Alternatives preview."
              href="/app/better-picks"
            />
          </SectionCard>
        ) : null}

        {isThiislincornTester ? (
          <SectionCard title="Thiislincorn tester shortcuts">
            <p className="pb-2 text-[12.5px] font-semibold leading-5 text-[#56635C]">
              Visible only on thiislincorn test accounts. Use these buttons to
              replay setup screens quickly.
            </p>
            <RowLink
              icon="clipboard"
              title="Replay full onboarding"
              href="/app/onboarding?review=1&restart=1"
            />
            <RowLink
              icon="check"
              title="Install setup - auto detect"
              href="/app/onboarding?review=1&install=1"
            />
            <RowLink
              icon="camera"
              title="Test iPhone install guide"
              href="/app/onboarding?review=1&install=1&installEnv=iphone"
            />
            <RowLink
              icon="arrow"
              title="Test Instagram iPhone handoff"
              href="/app/onboarding?review=1&install=1&installEnv=ios-in-app"
            />
            <RowLink
              icon="arrow"
              title="Test Instagram Android handoff"
              href="/app/onboarding?review=1&install=1&installEnv=android-in-app"
            />
            <RowLink
              icon="settings"
              title="Test Android manual install"
              href="/app/onboarding?review=1&install=1&installEnv=android-manual"
            />
          </SectionCard>
        ) : null}

        {isThiislincornTester && thiislincornSampleProducts.length > 0 ? (
          <SectionCard title="Thiislincorn sample tests">
            <p className="pb-2 text-[12.5px] font-semibold leading-5 text-[#56635C]">
              Products you send me can live here. Tap one to open the current
              Truthlabel result as if it was scanned.
            </p>
            {thiislincornSampleProducts.map((product) => (
              <RowLink
                key={`thiislincorn-sample-${product.id}`}
                icon="clipboard"
                title={product.productName}
                detail={`${product.brandName} - ${product.productCategory}`}
                meta="Open scan"
                href={`/app/results?demo=${product.id}`}
              />
            ))}
          </SectionCard>
        ) : null}

        <SectionCard title="Privacy and security">
          <RowLink icon="lock" title="Change password" href="/update-password" />
          <RowButton
            icon="trash"
            title="Clear scan history"
            destructive
            onClick={() => setConfirmationAction("clear_history")}
          />
          <RowButton
            icon="settings"
            title="Reset preferences"
            destructive
            onClick={() => setConfirmationAction("reset_preferences")}
          />
          <RowButton
            icon="trash"
            title="Clear data from this device"
            detail="Removes cached settings and results stored only on this phone."
            destructive
            onClick={() => setConfirmationAction("clear_device_data")}
          />
          <RowButton
            icon="alert"
            title="Delete account"
            detail="Contact support to request account deletion during MVP testing."
            destructive
            onClick={() => setConfirmationAction("delete_account")}
          />
          <RowLink icon="shield" title="Privacy Policy" href="/privacy" />
          <RowLink icon="clipboard" title="Terms" href="/terms" />
          <RowLink
            icon="help"
            title="Health disclaimer"
            href="/health-disclaimer"
          />
          {storageNotice ? (
            <p
              role="status"
              aria-live="polite"
              className="pt-3 text-[12.5px] font-semibold leading-5 text-[#B42318]"
            >
              {storageNotice}
            </p>
          ) : null}
        </SectionCard>

        <section className="mt-4 rounded-[20px] border border-[#DCE5DF] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,40,28,0.045)]">
          <h2 className="text-[18px] font-extrabold text-[#101613]">
            Help and support
          </h2>
          <SupportContactLink
            context="Account support"
            className="mt-3 grid min-h-[58px] w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[16px] border border-[#DCE5DF] px-3 py-3 text-left outline-none transition hover:bg-[#F7F9F7] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#EDF7F1] text-[#0E5A3F]">
              <Icon name="help" className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-extrabold text-[#101613]">
                Contact support
              </span>
              <span className="mt-0.5 block text-[12.5px] leading-5 text-[#56635C]">
                Get help with activation, scanning, or your account.
              </span>
            </span>
            <Icon name="chevron" className="h-4 w-4 shrink-0 text-[#879089]" />
          </SupportContactLink>
        </section>

        <section className="mt-5">
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#DCE5DF] bg-white px-4 text-[13px] font-extrabold text-[#101613] transition hover:bg-[#F7F9F7] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Sign out
          </button>
        </section>

        {cancelDialogOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-end bg-[#101613]/45 px-4 py-4 sm:items-center"
            role="presentation"
            onClick={closeCancelDialog}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="account-cancel-title"
              className="mx-auto w-full max-w-[520px] rounded-[24px] border border-[#DCE5DF] bg-white px-5 py-5 shadow-[0_22px_58px_rgba(15,40,28,0.22)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="account-cancel-title"
                    className="text-[21px] font-black tracking-[-0.02em] text-[#101613]"
                  >
                    Need to cancel?
                  </h2>
                  <p className="mt-2 text-[15px] font-semibold leading-7 text-[#101613]">
                    Open the receipt from your checkout email and click the
                    subscription settings or manage membership button to
                    cancel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCancelDialog}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DCE5DF] bg-[#F7F9F7] text-[18px] font-bold text-[#0E5A3F] transition hover:bg-[#EDF7F1] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
                  aria-label="Close cancellation options"
                >
                  X
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <figure className="overflow-hidden rounded-[18px] border border-[#DCE5DF] bg-[#F7F9F7]">
                  <img
                    src="/cancel-receipt-email.jpeg"
                    alt="Receipt email showing the subscription settings link"
                    className="h-full w-full object-contain"
                  />
                </figure>
                <figure className="overflow-hidden rounded-[18px] border border-[#DCE5DF] bg-[#F7F9F7]">
                  <img
                    src="/cancel-membership.jpeg"
                    alt="Manage membership page showing the cancel membership button"
                    className="h-full w-full object-contain"
                  />
                </figure>
              </div>

              <div className="mt-4 grid gap-2">
                <a
                  href={receiptInboxHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeCancelDialog}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#0E5A3F] px-4 text-[13px] font-extrabold text-white transition hover:bg-[#0B4732] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  Go check my email
                </a>
                <button
                  type="button"
                  onClick={() => setCancelReceiptHelpOpen((isOpen) => !isOpen)}
                  aria-expanded={cancelReceiptHelpOpen}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#DCE5DF] bg-white px-4 text-[13px] font-extrabold text-[#0E5A3F] transition hover:bg-[#EDF7F1] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  I cannot find my receipt
                </button>
              </div>

              {cancelReceiptHelpOpen ? (
                <div className="mt-4 rounded-[20px] border border-[#DCE5DF] bg-[#F7F9F7] px-4 py-4">
                  <p className="text-[14px] font-extrabold text-[#101613]">
                    Cannot find the receipt?
                  </p>
                  <p className="mt-1.5 text-[13px] leading-5 text-[#56635C]">
                    No problem. Enter the email used at checkout and we will
                    resend the receipt.
                  </p>
                  <p className="mt-2 text-[12.5px] leading-5 text-[#56635C]">
                    It could be the same email you signed in with, or a
                    different checkout or billing email.
                  </p>

                  <div className="mt-3 rounded-[16px] border border-[#DCE5DF] bg-white px-3 py-2.5">
                    <p className="text-[10.5px] font-black uppercase tracking-[0.14em] text-[#56635C]">
                      Signed-in account
                    </p>
                    <p className="mt-1 break-all text-[12.5px] font-extrabold text-[#101613]">
                      {accountFirstName ? `${accountFirstName} - ` : ""}
                      {accountEmail}
                    </p>
                  </div>

                  <label htmlFor="cancel-checkout-email" className="mt-3 block">
                    <span className="text-[13px] font-extrabold text-[#101613]">
                      Email used at checkout
                    </span>
                    <input
                      id="cancel-checkout-email"
                      type="email"
                      value={cancelCheckoutEmail}
                      onChange={(event) => setCancelCheckoutEmail(event.target.value)}
                      placeholder="email used at checkout"
                      className="mt-2 min-h-12 w-full rounded-[16px] border border-[#DCE5DF] bg-white px-3.5 text-[15px] font-semibold text-[#101613] outline-none transition placeholder:text-[#9AA39D] focus:border-[#0E5A3F] focus:ring-3 focus:ring-[#0E5A3F]/15"
                    />
                  </label>

                  {cancelCheckoutEmailReady ? (
                    <a
                      href={cancellationSupportHref}
                      onClick={handleEmailCancellationDetails}
                      className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#0E5A3F] px-4 text-[13px] font-extrabold text-white transition hover:bg-[#0B4732] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.98]"
                    >
                      Request receipt resend
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="mt-3 inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-[#DCE5DF] px-4 text-[13px] font-extrabold text-[#56635C]"
                    >
                      Enter checkout email to continue
                    </button>
                  )}
                </div>
              ) : null}
            </section>
          </div>
        ) : null}

        {protectionPanel ? (
          <div
            className="fixed inset-0 z-50 bg-[#101613]/45 px-3 py-[calc(18px+env(safe-area-inset-top))] backdrop-blur-sm"
            onClick={() => setProtectionPanel(null)}
            role="presentation"
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="account-preferences-title"
              className="mx-auto flex h-full max-h-[760px] w-full max-w-[500px] flex-col overflow-hidden rounded-[24px] border border-white/70 bg-[#F7F9F7] shadow-[0_24px_70px_rgba(16,22,19,0.22)]"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="flex items-start justify-between gap-4 border-b border-[#DCE5DF] bg-white px-4 py-4">
                <div>
                  <h2
                    id="account-preferences-title"
                    className="text-[20px] font-black leading-tight text-[#101613]"
                  >
                    Protection settings
                  </h2>
                  <p className="mt-1 text-[12.5px] leading-5 text-[#56635C]">
                    Allergy safety settings stay separate from ordinary food preferences.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProtectionPanel(null)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DCE5DF] bg-[#F7F9F7] text-[18px] font-bold text-[#0E5A3F] transition hover:bg-[#EDF7F1] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
                  aria-label="Close protection settings"
                >
                  X
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <div className="grid gap-4">
                  {protectionPanel === "all" ||
                  protectionPanel === "allergy" ||
                  protectionPanel === "custom" ? (
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
                  ) : null}

                  {protectionPanel === "all" || protectionPanel === "food" ? (
                    <FoodPreferenceSettings
                      selected={profile.avoid}
                      onToggle={handleToggleFoodPreference}
                    />
                  ) : null}

                  {protectionPanel === "all" || protectionPanel === "scan" ? (
                    <ScanPreferencesSettings
                      key={`account-scan-preferences-${settings.scanPreferences.defaultProductCategory}-${settings.scanPreferences.showNotCheckedExternalSections}-${settings.scanPreferences.showConfidenceNotes}-${settings.scanPreferences.autoRunExternalSafetyLookup}`}
                      value={settings.scanPreferences}
                      onSave={(scanPreferences) => {
                        updateScanPreferences(scanPreferences);
                        setStatusMessage("Result preferences saved on this device.");
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        ) : null}

        {confirmationAction ? (
          <div
            className="fixed inset-0 z-50 flex items-end bg-[#101613]/45 px-4 py-4 sm:items-center"
            role="presentation"
            onClick={() => setConfirmationAction(null)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="account-confirm-title"
              className="mx-auto w-full max-w-[420px] rounded-[22px] border border-[#DCE5DF] bg-white px-4 py-4 shadow-[0_22px_58px_rgba(15,40,28,0.22)]"
              onClick={(event) => event.stopPropagation()}
            >
              <h2
                id="account-confirm-title"
                className="text-[20px] font-black text-[#101613]"
              >
                {getConfirmationCopy(confirmationAction).title}
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-[#56635C]">
                {getConfirmationCopy(confirmationAction).message}
              </p>
              <div className="mt-4 grid gap-2 min-[390px]:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setConfirmationAction(null)}
                  className="min-h-11 rounded-full border border-[#DCE5DF] bg-white px-4 text-[13px] font-extrabold text-[#101613] transition hover:bg-[#F7F9F7] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
                >
                  Cancel
                </button>
                {confirmationAction === "delete_account" ? (
                  <SupportContactLink
                    context="Delete account request"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#B42318] px-4 text-[13px] font-extrabold text-white transition hover:bg-[#921B12] focus-visible:ring-2 focus-visible:ring-[#B42318] focus-visible:ring-offset-2"
                  >
                    {getConfirmationCopy(confirmationAction).confirmLabel}
                  </SupportContactLink>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleConfirmAction()}
                    className="min-h-11 rounded-full bg-[#B42318] px-4 text-[13px] font-extrabold text-white transition hover:bg-[#921B12] focus-visible:ring-2 focus-visible:ring-[#B42318] focus-visible:ring-offset-2"
                  >
                    {getConfirmationCopy(confirmationAction).confirmLabel}
                  </button>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
      <AppBottomNavigation />
    </main>
  );
}
