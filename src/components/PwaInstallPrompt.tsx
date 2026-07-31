"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  safeLocalStorageGetItem,
  safeLocalStorageSetItem,
} from "@/lib/browserStorage";
import { getSupabaseBrowserClient } from "@/lib/auth/supabaseClient";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

const INSTALL_PROMPT_DISMISSED_KEY = "truthlabel.install-prompt.dismissed";
const INSTALL_PROMPT_DISMISSED_EVENT = "truthlabel.install-prompt.dismissed.changed";

function InstallGlyph() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4v10m0 0 4-4m-4 4-4-4M5 18.5h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 3.75h6A2.25 2.25 0 0 1 17.25 6v12A2.25 2.25 0 0 1 15 20.25H9A2.25 2.25 0 0 1 6.75 18V6A2.25 2.25 0 0 1 9 3.75Zm2 13.5h2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function isAppleMobileDevice() {
  const touchMac =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return /iPad|iPhone|iPod/i.test(navigator.userAgent) || touchMac;
}

function isAndroidDevice() {
  return /Android/i.test(navigator.userAgent);
}

function isInAppBrowser() {
  return /Instagram|FBAN|FBAV|FB_IAB|FBIOS|FB4A|TikTok|Bytedance|Line\/|MicroMessenger|Snapchat|Pinterest|LinkedInApp/i.test(
    navigator.userAgent,
  );
}

function isMobileDevice() {
  return (
    /Android|iPad|iPhone|iPod|Mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width: 820px) and (pointer: coarse)").matches
  );
}

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as NavigatorWithStandalone).standalone)
  );
}

function subscribeToClientReady() {
  return () => undefined;
}

function subscribeToInstallPromptDismissed(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleChange(event: Event) {
    if (
      event instanceof StorageEvent &&
      event.key !== null &&
      event.key !== INSTALL_PROMPT_DISMISSED_KEY
    ) {
      return;
    }

    onStoreChange();
  }

  window.addEventListener("storage", handleChange);
  window.addEventListener(INSTALL_PROMPT_DISMISSED_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(INSTALL_PROMPT_DISMISSED_EVENT, handleChange);
  };
}

function getInstallPromptDismissedClientSnapshot() {
  return safeLocalStorageGetItem(INSTALL_PROMPT_DISMISSED_KEY) === "true";
}

function getInstallPromptDismissedServerSnapshot() {
  return false;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installAccepted, setInstallAccepted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const isClientReady = useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );
  const dismissed = useSyncExternalStore(
    subscribeToInstallPromptDismissed,
    getInstallPromptDismissedClientSnapshot,
    getInstallPromptDismissedServerSnapshot,
  );
  const isAppleMobile = isClientReady && isAppleMobileDevice();
  const isAndroid = isClientReady && isAndroidDevice();
  const isInApp = isClientReady && isInAppBrowser();
  const isReady = isClientReady && isMobileDevice();
  const isInstalled =
    installAccepted || (isClientReady && isStandaloneMode());

  useEffect(() => {
    function handleInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setDeferredPrompt(null);
      setInstallAccepted(true);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (isInApp || !deferredPrompt) {
      setShowInstructions((current) => !current);
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choice.outcome === "accepted") {
      setInstallAccepted(true);
    }
  }

  async function handleCopySetupLink() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setCopyStatus("Setup link unavailable. Open TruthLabel in Safari or Chrome and sign in.");
      return;
    }

    try {
      setCopyStatus("Creating setup link...");
      const { data, error } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (error || !accessToken) {
        throw new Error("Missing setup session.");
      }

      const response = await fetch("/api/setup-handoff/create", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      const payload = (await response.json().catch(() => ({}))) as {
        setupUrl?: string;
        message?: string;
      };

      if (!response.ok || !payload.setupUrl) {
        throw new Error(payload.message || "Setup link could not be created.");
      }

      await navigator.clipboard.writeText(payload.setupUrl);
      setCopyStatus(
        isAndroid
          ? "Install link copied. Open Chrome, paste the link, then install TruthLabel from there."
          : "Install link copied. Open Safari, paste the link, then install TruthLabel from there.",
      );
    } catch {
      setCopyStatus("Copy failed. Use your browser menu to open this page in Safari or Chrome.");
    }
  }

  function handleDismiss() {
    safeLocalStorageSetItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
    window.dispatchEvent(new Event(INSTALL_PROMPT_DISMISSED_EVENT));
  }

  if (dismissed || !isReady || isInstalled) {
    return null;
  }

  const hasNativePrompt = Boolean(deferredPrompt);
  const installTitle = isInApp
    ? isAndroid
      ? "Open in Chrome to install TruthLabel"
      : "Open in Safari to install TruthLabel"
    : isAppleMobile
      ? "Install the TruthLabel app on your iPhone"
      : "Install the TruthLabel app on your phone";
  const installSteps = isInApp
    ? isAndroid
      ? [
          "Tap the browser menu",
          "Choose Open in Chrome, Open in browser, or Open in external browser",
          "Install the TruthLabel app there",
        ]
      : [
          "Tap the browser menu",
          "Choose Open in Safari or Open in external browser",
          "Install the TruthLabel app from Safari",
        ]
    : isAppleMobile
      ? [
          "Tap Safari's Share button",
          "Choose Add to Home Screen",
          "Keep the app install setting turned on, then tap Add",
        ]
      : [
          hasNativePrompt ? "Tap Install this app below" : "Open your browser menu",
          hasNativePrompt ? "Confirm the install prompt" : "Choose Install app or Add to Home screen",
          "Open TruthLabel from your Home Screen",
        ];

  return (
    <section
      className="mt-5 overflow-hidden rounded-[18px] border border-[#DCE7E1] bg-white px-4 py-3.5 shadow-[0_6px_18px_rgba(15,40,28,0.045)]"
      aria-label="Install TruthLabel"
      data-testid="pwa-install-prompt"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#E8F6EF] text-[#0E5A3F]">
          <PhoneGlyph />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold text-[#101613]">
            Install the TruthLabel app
          </h2>
          <p className="mt-1 text-[12px] leading-5 text-[#66716B]">
            Add TruthLabel to your Home Screen to finish installing the app for faster scanning.
          </p>
          <button
            type="button"
            onClick={handleInstall}
            className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-[#0E5A3F] px-4 text-[12px] font-bold text-white outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
          >
            <InstallGlyph />
            {hasNativePrompt && !isInApp ? "Install this app" : "Show installation steps"}
          </button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full px-2 py-1 text-[11px] font-bold text-[#879089] outline-none transition hover:text-[#0E5A3F] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
        >
          I&apos;ll use the browser for now
        </button>
      </div>

      {showInstructions ? (
        <div
          className="mt-3 rounded-[15px] border border-[#DCE9E1] bg-[#F8FAF8] px-3.5 py-3 text-[12px] leading-5 text-[#526159]"
          aria-live="polite"
        >
          <p className="font-extrabold text-[#101613]">
            {installTitle}
          </p>
          {isInApp ? (
            <p className="mt-1 text-[12px] leading-5 text-[#66716B]">
              Instagram and Facebook browsers cannot finish app installation. Open this link in Safari or Chrome first.
            </p>
          ) : null}
          <ol className="mt-2 grid gap-1.5">
            {installSteps.map((step, index) => (
              <li key={step} className="flex gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F3FAF6] text-[10px] font-black text-[#0E5A3F]">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {isInApp ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={handleCopySetupLink}
                className="inline-flex min-h-9 items-center rounded-full bg-[#0E5A3F] px-4 text-[12px] font-bold text-white outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
              >
                Copy install link
              </button>
              {copyStatus ? (
                <p className="mt-2 text-[12px] font-bold leading-5 text-[#0E5A3F]">
                  {copyStatus}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
