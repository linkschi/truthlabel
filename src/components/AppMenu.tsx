"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AllergyProfile from "@/components/AllergyProfile";
import { SectionLabel } from "@/components/ResultUi";
import { publicAppConfig } from "@/lib/appConfig";
import { type AllergyConcern, type AvoidConcern } from "@/data/fakeProduct";
import { saveProfile, useStoredProfile } from "@/lib/profileStorage";

const navItems = [
  {
    href: "/app",
    label: "Home",
    detail: "Start a scan or open the sample flow.",
  },
  {
    href: "/app/manual",
    label: "Manual scan",
    detail: "Paste ingredients and run a real label scan.",
  },
  {
    href: "/app/history",
    label: "History",
    detail: "Review previous completed scans saved under this account.",
  },
  ...(publicAppConfig.flags.enableDemoProducts
    ? [
        {
          href: "/app/results",
          label: "Sample result",
          detail: "Preview the current demo result screen.",
        },
      ]
    : []),
  {
    href: "/app/settings",
    label: "Settings",
    detail: "Edit allergy, region, and scan preferences on this device.",
  },
  {
    href: "/app/account",
    label: "Account",
    detail: "Open account, access, and preference information.",
  },
] as const;

function toggleSelection<T extends string>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

export default function AppMenu({
  variant = "header",
}: {
  variant?: "header" | "bottomNav";
}) {
  const pathname = usePathname();
  const profile = useStoredProfile();
  const [isOpen, setIsOpen] = useState(false);

  function handleToggleAllergy(value: AllergyConcern) {
    saveProfile({
      ...profile,
      allergies: toggleSelection(profile.allergies, value),
    });
  }

  function handleToggleAvoid(value: AvoidConcern) {
    saveProfile({
      ...profile,
      avoid: toggleSelection(profile.avoid, value),
    });
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      {variant === "bottomNav" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-[12px] text-[11px] font-semibold text-[#849089] outline-none transition hover:text-[#65706A] focus-visible:ring-2 focus-visible:ring-[#12583D] focus-visible:ring-offset-2"
          aria-label="Open menu"
        >
          <span className="inline-flex h-[30px] w-9 items-center justify-center rounded-[12px]">
            <span className="flex flex-col gap-1">
              <span className="h-[1.5px] w-5 rounded-full bg-current" />
              <span className="h-[1.5px] w-5 rounded-full bg-current" />
              <span className="h-[1.5px] w-5 rounded-full bg-current" />
            </span>
          </span>
          <span>Menu</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd4c2] bg-white/88 text-[#33443c] transition hover:bg-[#f8f3ea] active:scale-[0.98]"
          aria-label="Open navigation"
        >
          <span className="flex flex-col gap-1">
            <span className="h-[1.5px] w-4 rounded-full bg-current" />
            <span className="h-[1.5px] w-4 rounded-full bg-current" />
            <span className="h-[1.5px] w-4 rounded-full bg-current" />
          </span>
        </button>
      )}

      {isOpen ? (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div className="absolute inset-0 animate-[overlayIn_180ms_ease-out] bg-[#18241f]/46 backdrop-blur-sm" />
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-[23rem] animate-[drawerIn_220ms_ease-out] overflow-y-auto border-l border-white/75 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-menu-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6d4f]">
                  Truthlabel
                </p>
                <h2
                  id="app-menu-title"
                  className="mt-1 font-heading text-[1.35rem] font-semibold text-[#17251f]"
                >
                  Menu
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd4c2] bg-white/88 text-lg text-[#445047] transition hover:bg-[#f8f3ea]"
                aria-label="Close navigation"
              >
                X
              </button>
            </div>

            <section className="mt-5 rounded-[22px] border border-[#e7decf] bg-white/76 px-4 py-4">
              <SectionLabel>Navigation</SectionLabel>
              <div className="mt-3 grid gap-2.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`rounded-[18px] border px-3.5 py-3 transition active:scale-[0.99] ${
                        isActive
                          ? "border-[#1c3028] bg-[#1c3028] text-white"
                          : "border-[#ddd6ca] bg-[#faf7f0] text-[#22342c]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[14px] font-semibold">{item.label}</span>
                        {isActive ? (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                            Current
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={`mt-1.5 text-[12px] leading-5 ${
                          isActive ? "text-white/74" : "text-[#5a6960]"
                        }`}
                      >
                        {item.detail}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>

            <div className="mt-4">
              <AllergyProfile
                profile={profile}
                onToggleAllergy={handleToggleAllergy}
                onToggleAvoid={handleToggleAvoid}
                variant="panel"
              />
            </div>

            <p className="mt-4 text-[12px] leading-5 text-[#6a776f]">
              Quick allergy toggles stay saved on this device. Open Settings for the full allergy profile, region, and scan preferences.
            </p>
          </aside>
        </div>
      ) : null}
    </>
  );
}
