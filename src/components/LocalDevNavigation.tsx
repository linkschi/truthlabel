"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicAppConfig } from "@/lib/appConfig";

const localNavigationLinks = [
  { href: "/app", label: "Home" },
  { href: "/app/manual", label: "Manual" },
  { href: "/app/history", label: "History" },
  { href: "/app/better-picks", label: "Better Picks" },
  { href: "/app/account", label: "Account" },
  {
    href: "/app/results?category=packaged-processed-foods&demo=red-berry-soda",
    label: "Sample Result",
  },
  { href: "/app/saved", label: "Saved Route" },
  { href: "/", label: "Landing" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/create-account", label: "Create Account" },
  { href: "/activate", label: "Activate" },
  { href: "/brand-assets", label: "Brand Assets" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export default function LocalDevNavigation() {
  const pathname = usePathname();

  if (!publicAppConfig.flags.enableLocalDevBypass) {
    return null;
  }

  return (
    <aside className="sticky top-0 z-[60] border-b border-[#d8e8df] bg-[#f8fbf9]/96 px-3 py-2 text-[#17251f] shadow-[0_8px_22px_rgba(15,40,28,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-[980px] flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#0e5a3f]">
            Local dev navigation
          </p>
          <span className="rounded-full bg-[#e8f6ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0e5a3f]">
            Login bypass on
          </span>
        </div>
        <nav
          aria-label="Local development shortcuts"
          className="-mx-1 flex gap-1 overflow-x-auto pb-1"
        >
          {localNavigationLinks.map((item) => {
            const isActive = pathname === item.href.split("?")[0];

            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-bold transition focus-visible:ring-2 focus-visible:ring-[#0e5a3f] focus-visible:ring-offset-2 ${
                  isActive
                    ? "border-[#0e5a3f] bg-[#0e5a3f] text-white"
                    : "border-[#d8e8df] bg-white text-[#26372f] hover:bg-[#e8f6ef]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
