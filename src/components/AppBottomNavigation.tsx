"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppNavIconName = "home" | "scan" | "history" | "bag" | "account";

type AppNavItem = {
  href: string;
  label: string;
  icon: AppNavIconName;
  ariaLabel?: string;
};

const navItems: AppNavItem[] = [
  { href: "/app", label: "Home", icon: "home" },
  {
    href: "/app/manual?mode=camera",
    label: "Scan",
    icon: "scan",
    ariaLabel: "Scan a product",
  },
  { href: "/app/history", label: "History", icon: "history" },
  {
    href: "/app/better-picks",
    label: "Better Picks",
    icon: "bag",
    ariaLabel: "Better product alternatives",
  },
  { href: "/app/account", label: "Account", icon: "account" },
];

function getActiveKey(pathname: string) {
  if (pathname === "/app") {
    return "/app";
  }

  if (pathname === "/app/manual" || pathname === "/app/scan") {
    return "/app/manual?mode=camera";
  }

  if (pathname.startsWith("/app/history")) {
    return "/app/history";
  }

  if (pathname.startsWith("/app/better-picks")) {
    return "/app/better-picks";
  }

  if (
    pathname.startsWith("/app/account") ||
    pathname === "/app/settings" ||
    pathname === "/settings" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/health-disclaimer" ||
    pathname === "/update-password"
  ) {
    return "/app/account";
  }

  return "";
}

function AppNavIcon({ name }: { name: AppNavIconName }) {
  const commonProps = {
    "aria-hidden": true,
    className: "h-[19px] w-[19px]",
    fill: "none",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (name) {
    case "scan":
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
    case "bag":
      return (
        <svg {...commonProps}>
          <path
            d="M7.2 8.5h9.6l1 11H6.2l1-11Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M9 9V7.8a3 3 0 0 1 6 0V9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
          <path
            d="M9.2 13.2h5.6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "account":
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
    case "home":
    default:
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
  }
}

export default function AppBottomNavigation() {
  const pathname = usePathname();
  const activeKey = getActiveKey(pathname || "/app");

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DCE5DF] bg-white shadow-[0_-8px_22px_rgba(15,40,28,0.06)]"
    >
      <div className="mx-auto grid h-[68px] max-w-[520px] grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const active = activeKey === item.href;

          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              aria-label={item.ariaLabel}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-[12px] px-0.5 text-[9px] font-semibold leading-none outline-none transition focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 min-[360px]:text-[10px] ${
                active ? "text-[#0E5A3F]" : "text-[#5F6C65] hover:text-[#0E5A3F]"
              }`}
            >
              <span
                className={`inline-flex h-[29px] w-9 items-center justify-center rounded-[12px] ${
                  active ? "bg-[#E8F6EF]" : ""
                }`}
              >
                <AppNavIcon name={item.icon} />
              </span>
              <span className="whitespace-nowrap text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
