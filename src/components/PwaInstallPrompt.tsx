"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

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

function isAppleMobileDevice() {
  const touchMac =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return /iPad|iPhone|iPod/i.test(navigator.userAgent) || touchMac;
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

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installAccepted, setInstallAccepted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const isClientReady = useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );
  const isAppleMobile = isClientReady && isAppleMobileDevice();
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
    if (!deferredPrompt) {
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

  if (!isReady || isInstalled) {
    return null;
  }

  const hasNativePrompt = Boolean(deferredPrompt);

  return (
    <section
      className="mt-6 rounded-[18px] border border-[#D7E7DD] bg-[#F3FAF6] px-4 py-4"
      aria-label="Install Truthlabel"
      data-testid="pwa-install-prompt"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#0E5A3F] text-white shadow-[0_6px_14px_rgba(14,90,63,0.18)]">
          <InstallGlyph />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold text-[#101613]">
            Install Truthlabel
          </h2>
          <p className="mt-1 text-[12px] leading-5 text-[#66716B]">
            Add Truthlabel to your home screen for quicker access and an app-like view.
          </p>
          <button
            type="button"
            onClick={handleInstall}
            className="mt-3 min-h-10 rounded-[13px] bg-[#0E5A3F] px-4 text-[12px] font-bold text-white outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
          >
            {hasNativePrompt ? "Install app" : "How to install"}
          </button>
        </div>
      </div>

      {showInstructions ? (
        <div
          className="mt-3 rounded-[14px] border border-[#DCE9E1] bg-white px-3.5 py-3 text-[12px] leading-5 text-[#526159]"
          aria-live="polite"
        >
          {isAppleMobile
            ? "In your browser, open Share and choose Add to Home Screen."
            : "Open your browser menu and choose Install app or Add to Home screen."}
        </div>
      ) : null}
    </section>
  );
}
