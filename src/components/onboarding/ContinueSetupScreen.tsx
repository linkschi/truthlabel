"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/auth/supabaseClient";

type ContinueSetupStatus = "opening" | "failed";

function SetupSpinner() {
  return (
    <span
      aria-hidden="true"
      className="mx-auto inline-flex h-8 w-8 animate-spin rounded-full border-2 border-[#BFDCCB] border-t-[#0E5A3F] motion-reduce:animate-none"
    />
  );
}

export default function ContinueSetupScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<ContinueSetupStatus>("opening");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function redeemSetupLink() {
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const tokenHash = hashParams.get("token_hash")?.trim() ?? "";
      const nextPath = hashParams.get("next")?.trim() || "/app/onboarding";

      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );

      if (!tokenHash) {
        if (!cancelled) {
          setStatus("failed");
          setErrorMessage("This setup link is missing or has already been used.");
        }
        return;
      }

      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        if (!cancelled) {
          setStatus("failed");
          setErrorMessage("TruthLabel account access is not configured here yet.");
        }
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "email",
      });

      if (cancelled) {
        return;
      }

      if (error) {
        setStatus("failed");
        setErrorMessage("For your security, setup links work only once and expire after a short time.");
        return;
      }

      router.replace(nextPath.startsWith("/") ? nextPath : "/app/onboarding");
    }

    const redeemHandle = window.setTimeout(() => {
      void redeemSetupLink();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(redeemHandle);
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#FBFDFB] px-5 py-[calc(18px+env(safe-area-inset-top))] text-[#101613]">
      <section className="mx-auto flex min-h-[78vh] w-full max-w-[430px] items-center justify-center">
        <div className="w-full rounded-[30px] border border-[#D7E7DD] bg-white px-5 py-7 text-center shadow-[0_18px_44px_rgba(15,40,28,0.08)]">
          {status === "opening" ? (
            <>
              <SetupSpinner />
              <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
                Opening TruthLabel
              </p>
              <h1 className="mt-2 text-[30px] font-black leading-[1.04] tracking-[-0.04em]">
                Your account is ready
              </h1>
              <p className="mx-auto mt-3 max-w-[310px] text-[15px] leading-6 text-[#66716B]">
                We&apos;re continuing your setup in this browser.
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#A33A3F]">
                Setup link expired
              </p>
              <h1 className="mt-2 text-[30px] font-black leading-[1.04] tracking-[-0.04em]">
                Your setup link has expired
              </h1>
              <p className="mx-auto mt-3 max-w-[320px] text-[15px] leading-6 text-[#66716B]">
                {errorMessage ||
                  "For your security, setup links work only once and expire after a short time."}
              </p>
              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/sign-in?next=/app/onboarding")}
                  className="min-h-[52px] rounded-[16px] bg-[#0E5A3F] px-5 text-[15px] font-extrabold text-white shadow-[0_14px_30px_rgba(14,90,63,0.16)] outline-none transition hover:bg-[#0B4732] focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99]"
                >
                  Create a new setup link
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/sign-in?next=/app/onboarding")}
                  className="min-h-11 rounded-[16px] border border-[#D7E7DD] bg-white px-5 text-[14px] font-bold text-[#0E5A3F] outline-none transition focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2"
                >
                  Sign in instead
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
