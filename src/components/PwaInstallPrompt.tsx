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
  const installSteps = isAppleMobile
    ? ["Tap Share in your browser", "Choose Add to Home Screen", "Tap Add"]
    : [
        hasNativePrompt ? "Tap Install app below" : "Open your browser menu",
        hasNativePrompt ? "Confirm the install prompt" : "Choose Install app or Add to Home screen",
        "Open Truthlabel from your phone screen",
      ];

  return (
    <section
      className="mt-6 overflow-hidden rounded-[22px] border border-[#D7E7DD] bg-[linear-gradient(145deg,#F3FAF6_0%,#FFFFFF_52%,#FFF8D7_100%)] px-4 py-4 shadow-[0_14px_34px_rgba(15,40,28,0.08)]"
      aria-label="Install Truthlabel"
      data-testid="pwa-install-prompt"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#0E5A3F] text-white shadow-[0_8px_18px_rgba(14,90,63,0.2)]">
          <PhoneGlyph />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold text-[#101613]">
            Install Truthlabel on your phone
          </h2>
          <p className="mt-1 text-[12px] leading-5 text-[#66716B]">
            Add the web app to your home screen for faster scans and an app-like view.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Home screen icon", "Fast access", "App-like view"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#D7E7DD] bg-white/82 px-2.5 py-1 text-[10px] font-bold text-[#0E5A3F]"
              >
                {item}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={handleInstall}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-[13px] bg-[#0E5A3F] px-4 text-[12px] font-bold text-white outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
          >
            <InstallGlyph />
            {hasNativePrompt ? "Install app" : "How to install"}
          </button>
        </div>
      </div>

      {showInstructions ? (
        <div
          className="mt-3 rounded-[16px] border border-[#DCE9E1] bg-white/88 px-3.5 py-3 text-[12px] leading-5 text-[#526159]"
          aria-live="polite"
        >
          <p className="font-extrabold text-[#101613]">
            {isAppleMobile ? "iPhone install steps" : "Android install steps"}
          </p>
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
        </div>
      ) : null}
    </section>
  );
}
