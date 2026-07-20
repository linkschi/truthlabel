"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useEffect } from "react";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";

function FullPageLoading({
  title = "Checking access",
  message = "Truthlabel is checking your account, free trial, and subscription status.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <main className="min-h-screen px-4 py-6">
      <section className="mx-auto flex min-h-[70vh] max-w-[440px] items-center justify-center">
        <div className="w-full rounded-[30px] border border-[var(--border-soft)] bg-[var(--bg-surface)] px-5 py-6 text-center shadow-[var(--shadow)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--green-main)]">
            Truthlabel
          </p>
          <h1 className="mt-2 font-heading text-[1.45rem] font-semibold text-[var(--text-main)]">
            {title}
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">
            {message}
          </p>
        </div>
      </section>
    </main>
  );
}

function ProtectedAppShellInner({ children }: { children: ReactNode }) {
  const { accessState, errorMessage, isConfigured } = useTruthlabelAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (accessState === "loading" || !isConfigured) {
      return;
    }

    const query = searchParams.toString();
    const nextPath = `${pathname}${query ? `?${query}` : ""}`;

    if (accessState === "signed_out") {
      router.replace(`/sign-in?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (accessState === "inactive") {
      router.replace("/activate");
    }
  }, [accessState, isConfigured, pathname, router, searchParams]);

  if (!isConfigured) {
    return (
      <main className="min-h-screen px-4 py-6">
        <section className="mx-auto max-w-[440px] rounded-[30px] border border-[var(--red-border)] bg-[var(--red-bg)] px-5 py-6 shadow-[var(--shadow)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--red-dark)]">
            Setup needed
          </p>
          <h1 className="mt-2 font-heading text-[1.45rem] font-semibold text-[var(--text-main)]">
            Account access is not configured yet.
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">
            Add the Supabase public URL and publishable key in Vercel before opening the app.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full bg-[var(--text-main)] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white"
          >
            Back to landing
          </Link>
        </section>
      </main>
    );
  }

  if (accessState !== "active") {
    return (
      <FullPageLoading
        title={accessState === "loading" ? "Checking access" : "Redirecting"}
        message={
          errorMessage ||
          "Truthlabel is checking whether this account has trial or paid access."
        }
      />
    );
  }

  return children;
}

export default function ProtectedAppShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<FullPageLoading />}>
      <ProtectedAppShellInner>{children}</ProtectedAppShellInner>
    </Suspense>
  );
}
