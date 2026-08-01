"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import SupportContactLink from "@/components/SupportContactLink";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { trackTruthlabelEvent } from "@/lib/analytics/analyticsClient";
import { normalizeAnalyticsError } from "@/lib/analytics/analyticsEvents";
import { grantMvpActivationAccess } from "@/lib/auth/mvpActivationAccess";
import { getSupabaseBrowserClient } from "@/lib/auth/supabaseClient";

const inputClass =
  "mt-2 w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[14px] text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--green-main)] focus:ring-2 focus:ring-[rgba(21,128,61,0.14)]";
const pendingCheckoutEmailStorageKey = "truthlabel.pendingCheckoutEmail";

function AuthShell({
  eyebrow,
  title,
  message,
  wide = false,
  children,
}: {
  eyebrow: string;
  title: string;
  message: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-5">
      <section className={`mx-auto ${wide ? "max-w-4xl" : "max-w-[440px]"}`}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
        >
          Truthlabel
        </Link>

        <div className="mt-5 rounded-[32px] border border-[var(--border-soft)] bg-[var(--bg-surface)] px-5 py-6 shadow-[var(--shadow)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--green-main)]">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-heading text-[1.85rem] font-semibold leading-tight text-[var(--text-main)]">
            {title}
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">
            {message}
          </p>
          {children}
          <div className="mt-5 border-t border-[var(--border-soft)] pt-4 text-center">
            <SupportContactLink
              context={title}
              className="inline-flex items-center justify-center rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-[12px] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--green-border)] hover:text-[var(--green-main)]"
            >
              Need help? Contact support
            </SupportContactLink>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusMessage({
  tone,
  message,
}: {
  tone: "green" | "yellow" | "red";
  message: string;
}) {
  const classes = {
    green:
      "border-[var(--green-border)] bg-[var(--green-bg)] text-[var(--green-dark)]",
    yellow:
      "border-[var(--amber-border)] bg-[var(--amber-bg)] text-[var(--amber-dark)]",
    red: "border-[var(--red-border)] bg-[var(--red-bg)] text-[var(--red-dark)]",
  }[tone];

  return (
    <div
      role={tone === "red" ? "alert" : "status"}
      className={`mt-4 rounded-[18px] border px-4 py-3 text-[13px] leading-5 ${classes}`}
    >
      {message}
    </div>
  );
}

function submitButtonClass(isBusy: boolean) {
  return `mt-5 w-full rounded-full border border-transparent bg-[var(--text-main)] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_36px_rgba(23,20,18,0.16)] transition active:scale-[0.99] ${
    isBusy ? "cursor-wait opacity-70" : ""
  }`;
}

function getPasswordResetErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();

  if (
    normalized.includes("rate limit") ||
    normalized.includes("rate_limit") ||
    normalized.includes("too many") ||
    normalized.includes("email rate")
  ) {
    return "Password reset is temporarily busy. Try again later, or create a new account and activate access with your license key.";
  }

  return message || "Truthlabel could not send the reset email.";
}

function getActivationErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();

  if (
    normalized.includes("activation link is not valid") ||
    normalized.includes("mvp access activation is not configured") ||
    normalized.includes("access activation is not configured") ||
    normalized.includes("activate mvp access")
  ) {
    return message || "This activation link could not be used.";
  }

  if (
    normalized.includes("sign in before activating") ||
    normalized.includes("sign-in session expired") ||
    normalized.includes("session expired")
  ) {
    return "Sign in again, then open the activation link from your purchase email.";
  }

  if (
    normalized.includes("different email") ||
    normalized.includes("another email") ||
    normalized.includes("email address")
  ) {
    return "This license key belongs to a different email address. Sign in using the email used at checkout.";
  }

  if (
    normalized.includes("expired") ||
    normalized.includes("refunded") ||
    normalized.includes("disputed") ||
    normalized.includes("chargeback") ||
    normalized.includes("payment_failed") ||
    normalized.includes("payment failed") ||
    normalized.includes("not currently eligible")
  ) {
    return "This subscription is no longer active. Renew it through checkout to restore access.";
  }

  if (
    normalized.includes("could not verify") ||
    normalized.includes("license verification failed") ||
    normalized.includes("not valid") ||
    normalized.includes("invalid") ||
    normalized.includes("license")
  ) {
    return "We couldn't verify this license key. Check the key and try again.";
  }

  return "We couldn't check your access right now. Please try again.";
}

function getGumroadCheckoutUrl() {
  return (
    process.env.NEXT_PUBLIC_GUMROAD_CHECKOUT_URL?.trim() ||
    "https://truthlabel.gumroad.com/l/fnoakd?wanted=true"
  );
}

function isExistingAccountSignupError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("already exists") ||
    message.includes("user_exists")
  );
}

function storePendingCheckoutEmail(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(pendingCheckoutEmailStorageKey, email);
  } catch {
    // Browsers can block storage. Checkout should still continue.
  }
}

function hasPendingCheckoutEmail() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return Boolean(window.sessionStorage.getItem(pendingCheckoutEmailStorageKey));
  } catch {
    return false;
  }
}

function clearPendingCheckoutEmail() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(pendingCheckoutEmailStorageKey);
  } catch {
    // Storage cleanup is best effort only.
  }
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function SignInFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessState } = useTruthlabelAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ tone: "green" | "red"; message: string } | null>(
    null,
  );
  const [isBusy, setIsBusy] = useState(false);
  const nextPath = searchParams.get("next") || "/app";
  const isAlreadySignedIn = accessState === "active";

  useEffect(() => {
    if (isAlreadySignedIn) {
      router.replace("/app");
    }
  }, [isAlreadySignedIn, router]);

  if (isAlreadySignedIn) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-5">
        <section className="mx-auto flex min-h-[70vh] max-w-[440px] items-center justify-center">
          <div className="w-full rounded-[32px] border border-[var(--border-soft)] bg-[var(--bg-surface)] px-5 py-6 text-center shadow-[var(--shadow)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--green-main)]">
              Signed in
            </p>
            <h1 className="mt-2 font-heading text-[1.85rem] font-semibold leading-tight text-[var(--text-main)]">
              Opening Truthlabel...
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">
              You are already signed in. Taking you to the app now.
            </p>
          </div>
        </section>
      </main>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsBusy(true);
    trackTruthlabelEvent("login_started", {
      source: "sign_in_page",
    });

    try {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Account access is not configured yet.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      trackTruthlabelEvent(
        "login_success",
        {
          next_path: nextPath,
        },
        { userId: data.user?.id },
      );
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      trackTruthlabelEvent("login_failed", {
        error_type: normalizeAnalyticsError(error),
        next_path: nextPath,
      });
      setStatus({
        tone: "red",
        message:
          error instanceof Error
            ? error.message
            : "Truthlabel could not sign you in.",
      });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome to Truthlabel."
      message="Sign in to continue, or begin your 7-day free trial."
    >
      <form onSubmit={handleSubmit} className="mt-5">
        <label className="block">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Email
          </span>
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Password
          </span>
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {status ? <StatusMessage tone={status.tone} message={status.message} /> : null}
        <button disabled={isBusy} className={submitButtonClass(isBusy)}>
          {isBusy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-5 grid gap-2 text-[13px] leading-5 text-[var(--text-secondary)]">
        <Link href="/forgot-password" className="font-semibold text-[var(--green-main)]">
          Forgot password?
        </Link>
        <Link
          href="/create-account"
          className="inline-flex justify-center rounded-full border border-[var(--green-border)] bg-[var(--green-bg)] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--green-dark)]"
        >
          Begin 7-day free trial
        </Link>
      </div>
    </AuthShell>
  );
}

export function SignInScreen() {
  return (
    <Suspense>
      <SignInFormInner />
    </Suspense>
  );
}

function TrialActivationLoadingScreen({ email }: { email: string }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-5">
      <section className="mx-auto flex min-h-[76vh] max-w-[520px] items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[34px] border border-[var(--green-border)] bg-[linear-gradient(145deg,#F4FBF6_0%,#FFFFFF_48%,#FFF8D7_100%)] px-6 py-7 text-center shadow-[0_26px_80px_rgba(23,20,18,0.14)]">
          <div className="absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[rgba(21,128,61,0.13)] blur-2xl" />
          <div className="absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-[rgba(244,196,48,0.2)] blur-2xl" />

          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_16px_38px_rgba(21,128,61,0.16)]">
            <span className="absolute h-24 w-24 animate-spin rounded-full border-4 border-[rgba(21,128,61,0.15)] border-t-[var(--green-main)]" />
            <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--green-main)] text-[24px] font-black text-white">
              T
            </span>
          </div>

          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--green-main)]">
            Account created
          </p>
          <h1 className="mt-2 font-heading text-[2.2rem] font-semibold leading-tight tracking-[-0.05em] text-[var(--text-main)]">
            Activating your free trial.
          </h1>
          <p className="mx-auto mt-3 max-w-[390px] text-[14px] leading-6 text-[var(--text-secondary)]">
            Truthlabel is preparing your free trial access and opening
            checkout.
          </p>

          {email ? (
            <p className="mx-auto mt-4 max-w-[360px] rounded-[18px] border border-white/80 bg-white/72 px-4 py-3 text-[12px] font-semibold leading-5 text-[var(--green-dark)]">
              Account email: {email}
            </p>
          ) : null}

          <div className="mt-6 grid gap-2 text-left">
            {["Creating your account", "Preparing trial access", "Opening checkout"].map(
              (item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[18px] border border-white/80 bg-white/72 px-4 py-3 text-[13px] font-bold text-[var(--text-main)]"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      index === 2
                        ? "animate-pulse bg-[var(--amber-main)]"
                        : "bg-[var(--green-main)]"
                    }`}
                  />
                  <span>{item}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export function CreateAccountScreen() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{
    tone: "green" | "yellow" | "red";
    message: string;
  } | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);
  const checkoutUrl = getGumroadCheckoutUrl();

  useEffect(() => {
    trackTruthlabelEvent("signup_started", {
      source: "create_account_page",
    });
  }, []);

  function continueToCheckout({
    message,
    source,
    userId,
  }: {
    message: string;
    source: string;
    userId?: string | null;
  }) {
    trackTruthlabelEvent(
      "checkout_handoff_shown",
      {
        source,
      },
      { userId },
    );
    storePendingCheckoutEmail(email);
    setFirstName("");
    setPassword("");
    setConfirmPassword("");
    setIsRedirectingToCheckout(true);
    setStatus({
      tone: "green",
      message,
    });

    window.setTimeout(() => {
      trackTruthlabelEvent(
        "checkout_started",
        {
          source,
        },
        { userId },
      );
      try {
        window.location.assign(checkoutUrl);
      } catch (error) {
        trackTruthlabelEvent(
          "checkout_open_failed",
          {
            source,
            error_type: normalizeAnalyticsError(error),
          },
          { userId },
        );
        setIsRedirectingToCheckout(false);
        setStatus({
          tone: "red",
          message: "Checkout could not open. Try again.",
        });
      }
    }, 1900);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const trimmedFirstName = firstName.trim();

    if (trimmedFirstName.length < 2) {
      setStatus({ tone: "red", message: "Enter your first name to continue." });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ tone: "red", message: "Passwords do not match." });
      return;
    }

    setIsBusy(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Account access is not configured yet.");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: trimmedFirstName,
            name: trimmedFirstName,
          },
          emailRedirectTo:
            typeof window === "undefined"
              ? undefined
              : `${window.location.origin}/activate`,
        },
      });

      if (error) {
        if (isExistingAccountSignupError(error)) {
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (signInError) {
            throw new Error(
              "This email already has a Truthlabel account. Sign in with the existing password to continue.",
            );
          }

          trackTruthlabelEvent(
            "login_success",
            {
              source: "create_account_existing_account",
            },
            { userId: signInData.user?.id },
          );
          continueToCheckout({
            message: "Account found. Taking you to checkout.",
            source: "create_account_existing_account",
            userId: signInData.user?.id,
          });
          return;
        }

        throw error;
      }

      trackTruthlabelEvent(
        "signup_success",
        {
          source: "create_account_page",
          has_first_name: true,
        },
        { userId: data.user?.id },
      );
      continueToCheckout({
        message: "Account created. Taking you to checkout.",
        source: "create_account_auto_redirect",
        userId: data.user?.id,
      });
    } catch (error) {
      trackTruthlabelEvent("signup_failed", {
        error_type: normalizeAnalyticsError(error),
      });
      setStatus({
        tone: "red",
        message:
          error instanceof Error
            ? error.message
            : "Truthlabel could not create the account.",
      });
    } finally {
      setIsBusy(false);
    }
  }

  if (isRedirectingToCheckout) {
    return <TrialActivationLoadingScreen email={email} />;
  }

  return (
    <AuthShell
      eyebrow="7-day free trial"
      title="Create your account now."
      message="Start with a simple Truthlabel account."
    >
      <div className="mt-6">
          <form onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                First name
              </span>
              <input
                className={inputClass}
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </label>
            <label className="mt-4 block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                Email
              </span>
              <input
                className={inputClass}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="mt-4 block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                Password
              </span>
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                aria-describedby="signup-password-help"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <span
                id="signup-password-help"
                className="mt-2 block text-[12px] leading-5 text-[var(--text-muted)]"
              >
                Use at least 8 characters.
              </span>
            </label>
            <label className="mt-4 block">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                Confirm password
              </span>
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
            {status ? (
              <StatusMessage tone={status.tone} message={status.message} />
            ) : null}
            <button disabled={isBusy} className={submitButtonClass(isBusy)}>
              {isBusy ? "Creating account..." : "Create account now"}
            </button>
          </form>
          <p className="mt-3 text-[13px] leading-5 text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-[var(--green-main)]"
            >
              Sign in
            </Link>
          </p>
      </div>
    </AuthShell>
  );
}

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{
    tone: "green" | "red";
    message: string;
  } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsBusy(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Account access is not configured yet.");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          typeof window === "undefined"
            ? undefined
            : `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      setStatus({
        tone: "green",
        message: "If this email exists, Truthlabel will send a password reset link.",
      });
      trackTruthlabelEvent("password_reset_requested", {
        source: "forgot_password_page",
      });
    } catch (error) {
      trackTruthlabelEvent("password_reset_failed", {
        error_type: normalizeAnalyticsError(error),
      });
      setStatus({
        tone: "red",
        message: getPasswordResetErrorMessage(error),
      });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Reset your password."
      message="Enter your account email and Truthlabel will send a reset link."
    >
      <form onSubmit={handleSubmit} className="mt-5">
        <label className="block">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Email
          </span>
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {status ? <StatusMessage tone={status.tone} message={status.message} /> : null}
        <button disabled={isBusy} className={submitButtonClass(isBusy)}>
          {isBusy ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <Link
        href="/sign-in"
        className="mt-5 inline-flex text-[13px] font-semibold text-[var(--green-main)]"
      >
        Back to sign in
      </Link>
      <div className="mt-5 rounded-[20px] border border-[var(--border-soft)] bg-[var(--bg-soft)] px-4 py-4">
        <p className="text-[13px] font-semibold text-[var(--text-main)]">
          Need access sooner?
        </p>
        <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
          If reset email is unavailable, create a new account or sign in, then
          activate access with the license key from your purchase email.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/create-account"
            className="rounded-full border border-[var(--green-border)] bg-[var(--green-bg)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--green-dark)]"
          >
            Create account
          </Link>
          <Link
            href="/activate"
            className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-main)]"
          >
            Activate access
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export function UpdatePasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{
    tone: "green" | "red";
    message: string;
  } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (password !== confirmPassword) {
      setStatus({ tone: "red", message: "Passwords do not match." });
      return;
    }

    setIsBusy(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Account access is not configured yet.");
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setStatus({
        tone: "green",
        message: "Password updated. You can now sign in.",
      });
      trackTruthlabelEvent("password_update_success", {
        source: "update_password_page",
      });
    } catch (error) {
      trackTruthlabelEvent("password_update_failed", {
        error_type: normalizeAnalyticsError(error),
      });
      setStatus({
        tone: "red",
        message:
          error instanceof Error
            ? error.message
            : "Truthlabel could not update the password.",
      });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Update password"
      title="Choose a new password."
      message="This page works after opening a valid Truthlabel password reset link."
    >
      <form onSubmit={handleSubmit} className="mt-5">
        <label className="block">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            New password
          </span>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Confirm password
          </span>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        {status ? <StatusMessage tone={status.tone} message={status.message} /> : null}
        <button disabled={isBusy} className={submitButtonClass(isBusy)}>
          {isBusy ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}

export function ActivateScreen() {
  const router = useRouter();
  const {
    accessKind,
    accessState,
    errorMessage,
    refreshAccess,
    user,
  } = useTruthlabelAuth();
  const [licenseKey, setLicenseKey] = useState("");
  const [activationStatus, setActivationStatus] = useState<{
    tone: "green" | "yellow" | "red";
    message: string;
  } | null>(null);
  const [isActivatingLicense, setIsActivatingLicense] = useState(false);
  const [isLinkingPendingCheckout, setIsLinkingPendingCheckout] =
    useState(false);
  const activationViewTrackedRef = useRef(false);
  const activeAccessHandledRef = useRef(false);
  const mvpAccessHandledRef = useRef(false);
  const pendingCheckoutHandledRef = useRef(false);
  const isActive = accessState === "active";
  const [activationLinkContext] = useState(() => {
    if (typeof window === "undefined") {
      return {
        hasActivationLink: false,
        hasDirectAccessLink: false,
        hasLicenseLink: false,
        returnPath: "/activate",
      };
    }

    const params = new URLSearchParams(window.location.search);
    const hasDirectAccessLink = Boolean(
      params.get("mvp_access") ||
        params.get("early_access") ||
        params.get("access_code"),
    );
    const hasLicenseLink = Boolean(
      params.get("license_key") || params.get("license"),
    );

    return {
      hasActivationLink: hasDirectAccessLink || hasLicenseLink,
      hasDirectAccessLink,
      hasLicenseLink,
      returnPath: `${window.location.pathname}${window.location.search}`,
    };
  });
  const isCheckingAccess = accessState === "loading";
  const isVerifyingAccess =
    isActivatingLicense || isLinkingPendingCheckout;
  const activationTitle = isCheckingAccess
    ? "Checking access"
    : isActive
      ? "Access activated"
      : !user
        ? activationLinkContext.hasDirectAccessLink
          ? "Sign in to finish activation"
          : "Sign in to activate Truthlabel"
        : activationLinkContext.hasDirectAccessLink
          ? "Activating your Truthlabel account"
          : "Activate your Truthlabel account";
  const activationMessage = isCheckingAccess
    ? "Truthlabel is checking your account access."
    : isActive
      ? "Your Truthlabel account is ready. You can now start scanning products."
      : !user
        ? activationLinkContext.hasDirectAccessLink
          ? "Sign in with the account you want activated. The activation link will continue automatically after sign-in."
          : "Sign in with the Truthlabel account you want this access connected to."
        : activationLinkContext.hasDirectAccessLink
          ? "Truthlabel is using your activation link to turn on access for this signed-in account."
          : "Use the activation link from checkout first. If that does not work, enter your license key.";

  const openTruthlabelApp = useCallback(() => {
    window.setTimeout(() => {
      router.replace("/app");
      router.refresh();
    }, 650);
  }, [router]);

  const linkPendingCheckoutAccess = useCallback(
    async ({
      silent = false,
      source = "activation_page",
    }: {
      silent?: boolean;
      source?: string;
    } = {}) => {
      if (!user || isActive) {
        return false;
      }

      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setActivationStatus({
          tone: "red",
          message: "Account access is not configured yet.",
        });
        return false;
      }

      setIsLinkingPendingCheckout(true);

      if (!silent) {
        setActivationStatus({
          tone: "yellow",
          message: "Checking backup checkout records for this account...",
        });
      }

      try {
        const { data, error } = await supabase.functions.invoke<{
          linked?: boolean;
          alreadyActive?: boolean;
          message?: string;
          status?: string;
        }>("link-pending-gumroad-purchase", {
          body: { source },
        });

        if (error) {
          throw error;
        }

        if (data?.linked) {
          trackTruthlabelEvent(
            "activation_success",
            {
              activation_method: data.alreadyActive
                ? "already_active_checkout"
                : "pending_checkout_purchase",
              status: data.status || "active",
              source,
            },
            { userId: user.id },
          );
          clearPendingCheckoutEmail();
          await refreshAccess();
          setActivationStatus({
            tone: "green",
            message: "Access activated. Opening Truthlabel...",
          });
          openTruthlabelApp();
          return true;
        }

        if (!silent) {
          setActivationStatus({
            tone: "yellow",
            message:
              data?.message ||
              "The activation link is the main path. If access does not activate, use your license key as backup.",
          });
        }

        return false;
      } catch (error) {
        trackTruthlabelEvent(
          "activation_failed",
          {
            activation_method: "pending_checkout_purchase",
            error_type: normalizeAnalyticsError(error),
            source,
          },
          { userId: user.id },
        );

        if (!silent) {
          setActivationStatus({
            tone: "yellow",
            message:
              "Backup checkout checking did not finish. Use the activation link or license key from your purchase email.",
          });
        }

        return false;
      } finally {
        setIsLinkingPendingCheckout(false);
      }
    },
    [isActive, openTruthlabelApp, refreshAccess, user],
  );

  useEffect(() => {
    if (activationViewTrackedRef.current) {
      return;
    }

    activationViewTrackedRef.current = true;
    trackTruthlabelEvent(
      "activation_viewed",
      {
        access_state: accessState,
        access_kind: accessKind,
        signed_in: Boolean(user),
      },
      { userId: user?.id },
    );
  }, [accessKind, accessState, user]);

  useEffect(() => {
    if (!isActive || !activationLinkContext.hasActivationLink) {
      return;
    }

    if (activeAccessHandledRef.current) {
      return;
    }

    activeAccessHandledRef.current = true;
    setActivationStatus({
      tone: "green",
      message: "Access activated. Opening Truthlabel...",
    });
    openTruthlabelApp();
  }, [activationLinkContext.hasActivationLink, isActive, openTruthlabelApp]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const licenseFromUrl =
      params.get("license_key") || params.get("license") || "";

    if (!licenseFromUrl.trim()) {
      return;
    }

    const cleanedLicenseKey = licenseFromUrl.trim();

    void Promise.resolve().then(() => {
      setLicenseKey(cleanedLicenseKey);
      setActivationStatus({
        tone: "yellow",
        message:
          "License key found from the backup activation link. Review it, then activate access.",
      });
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const mvpAccessCode =
      params.get("mvp_access") ||
      params.get("early_access") ||
      params.get("access_code") ||
      "";

    if (!mvpAccessCode.trim()) {
      return;
    }

    if (accessState === "loading") {
      return;
    }

    if (isActive) {
      grantMvpActivationAccess("activation_link");
      return;
    }

    if (!user) {
      const statusHandle = window.setTimeout(() => {
        setActivationStatus({
          tone: "yellow",
          message:
            "Sign in with the account you want activated. Truthlabel will continue automatically.",
        });
      }, 0);

      return () => window.clearTimeout(statusHandle);
    }

    if (mvpAccessHandledRef.current) {
      return;
    }

    mvpAccessHandledRef.current = true;
    let cancelled = false;

    void Promise.resolve().then(async () => {
      setActivationStatus({
        tone: "yellow",
        message: "Activating this Truthlabel account...",
      });

      try {
        const supabase = getSupabaseBrowserClient();

        if (!supabase) {
          throw new Error("Account access is not configured yet.");
        }

        const { data, error } = await supabase.functions.invoke<{
          activated?: boolean;
          message?: string;
          status?: string;
        }>("activate-mvp-access", {
          body: { code: mvpAccessCode.trim() },
        });

        if (error) {
          throw error;
        }

        if (!data?.activated) {
          throw new Error(data?.message || "Truthlabel could not activate this account.");
        }

        grantMvpActivationAccess("activation_link");
        trackTruthlabelEvent(
          "activation_success",
          {
            activation_method: "mvp_access_link_account",
            status: data.status || "active",
          },
          { userId: user.id },
        );
        await refreshAccess();

        if (cancelled) {
          return;
        }

        setActivationStatus({
          tone: "green",
          message: "Access activated for this account. Opening Truthlabel...",
        });
        window.history.replaceState(null, "", "/activate");
        openTruthlabelApp();
      } catch (error) {
        if (cancelled) {
          return;
        }

        trackTruthlabelEvent(
          "activation_failed",
          {
            activation_method: "mvp_access_link_account",
            error_type: normalizeAnalyticsError(error),
          },
          { userId: user.id },
        );
        setActivationStatus({
          tone: "red",
          message: getActivationErrorMessage(error),
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [accessState, isActive, openTruthlabelApp, refreshAccess, user]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!user || isActive || accessState === "loading") {
      return;
    }

    if (pendingCheckoutHandledRef.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const hasMvpAccessCode = Boolean(
      params.get("mvp_access") ||
        params.get("early_access") ||
        params.get("access_code"),
    );

    if (hasMvpAccessCode) {
      return;
    }

    const shouldCheckCheckout =
      hasPendingCheckoutEmail() ||
      params.has("checkout") ||
      params.has("purchase") ||
      params.has("success") ||
      params.has("sale_id") ||
      params.has("subscription_id");

    if (!shouldCheckCheckout) {
      return;
    }

    pendingCheckoutHandledRef.current = true;
    let cancelled = false;
    const retryDelays = [0, 2500, 5000, 9000, 14000];

    void Promise.resolve().then(async () => {
      for (const [index, retryDelay] of retryDelays.entries()) {
        if (cancelled) {
          return;
        }

        if (retryDelay > 0) {
          await wait(retryDelay);
        }

        if (cancelled) {
          return;
        }

        const linked = await linkPendingCheckoutAccess({
          silent: index > 0,
          source: "checkout_return_auto",
        });

        if (linked || cancelled) {
          return;
        }

        await refreshAccess();
      }

      if (!cancelled) {
        setActivationStatus({
          tone: "yellow",
          message:
            "The activation link is the main path. If this does not activate soon, enter the license key from your purchase email.",
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    accessState,
    isActive,
    linkPendingCheckoutAccess,
    refreshAccess,
    user,
  ]);

  async function handleLicenseActivation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActivationStatus(null);

    if (!user) {
      trackTruthlabelEvent("activation_failed", {
        error_type: "signed_out",
      });
      setActivationStatus({
        tone: "red",
        message: "Sign in before activating your access.",
      });
      return;
    }

    const trimmedLicenseKey = licenseKey.trim();

    if (trimmedLicenseKey.length < 8) {
      trackTruthlabelEvent(
        "activation_failed",
        {
          error_type: "missing_license_key",
        },
        { userId: user.id },
      );
      setActivationStatus({
        tone: "red",
        message: "Enter the license key from your purchase email.",
      });
      return;
    }

    setIsActivatingLicense(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Account access is not configured yet.");
      }

      const { data, error } = await supabase.functions.invoke<{
        activated?: boolean;
        message?: string;
        status?: string;
      }>("verify-gumroad-license", {
        body: { licenseKey: trimmedLicenseKey },
      });

      if (error) {
        throw error;
      }

      if (!data?.activated) {
        throw new Error(
          data?.message || "Truthlabel could not activate this license key.",
        );
      }

      setLicenseKey("");
      trackTruthlabelEvent(
        "activation_success",
        {
          activation_method: "license_key",
          status: data.status || "active",
        },
        { userId: user.id },
      );
      await refreshAccess();
      setActivationStatus({
        tone: "green",
        message: "Access activated. Opening Truthlabel...",
      });
      openTruthlabelApp();
    } catch (error) {
      trackTruthlabelEvent(
        "activation_failed",
        {
          activation_method: "license_key",
          error_type: normalizeAnalyticsError(error),
        },
        { userId: user.id },
      );
      setActivationStatus({
        tone: "red",
        message: getActivationErrorMessage(error),
      });
    } finally {
      setIsActivatingLicense(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Truthlabel access"
      title={activationTitle}
      message={activationMessage}
    >
      {isCheckingAccess ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-5 flex items-center gap-3 rounded-[16px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[13px] font-semibold text-[var(--text-secondary)]"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--green-border)] border-t-[var(--green-main)]" />
          Checking access...
        </div>
      ) : null}

      {!isCheckingAccess && !user ? (
        <div className="mt-5 grid gap-3">
          <Link
            href={`/sign-in?next=${encodeURIComponent(
              activationLinkContext.returnPath,
            )}`}
            className="inline-flex min-h-[52px] items-center justify-center rounded-[16px] border border-transparent bg-[var(--green-main)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(14,90,63,0.14)]"
          >
            Sign in to activate
          </Link>
          {!activationLinkContext.hasActivationLink ? (
            <Link
              href="/create-account"
              className="text-center text-[13px] font-semibold text-[var(--green-main)]"
            >
              Need a Truthlabel account? Create one
            </Link>
          ) : null}
        </div>
      ) : null}

      {!isCheckingAccess && isActive ? (
        <div className="mt-5 grid gap-3">
          <div
            role="status"
            aria-live="polite"
            className="rounded-[16px] border border-[var(--green-border)] bg-[var(--green-bg)] px-4 py-3 text-[13px] font-semibold leading-5 text-[var(--green-dark)]"
          >
            This account is already active. You do not need to activate again.
          </div>
          <Link
            href="/app"
            className="inline-flex min-h-[52px] items-center justify-center rounded-[16px] border border-transparent bg-[var(--green-main)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(14,90,63,0.14)]"
          >
            Open Truthlabel
          </Link>
        </div>
      ) : null}

      {!isCheckingAccess && user && !isActive ? (
        <div className="mt-5">
          <p className="text-[13px] leading-5 text-[var(--text-secondary)]">
            Signed in as{" "}
            <span className="font-semibold text-[var(--text-main)]">
              {user.email}
            </span>
          </p>
        </div>
      ) : null}

      {!isCheckingAccess && user && !isActive ? (
        <form onSubmit={handleLicenseActivation} className="mt-5">
          <label htmlFor="truthlabel-license-key" className="block">
            <span className="text-[12px] font-semibold text-[var(--text-main)]">
              Backup license key
            </span>
            <input
              id="truthlabel-license-key"
              className="mt-2 w-full rounded-[16px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[15px] text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--green-main)] focus:ring-2 focus:ring-[rgba(21,128,61,0.14)]"
              type="text"
              autoComplete="off"
              inputMode="text"
              disabled={isVerifyingAccess}
              value={licenseKey}
              onChange={(event) => setLicenseKey(event.target.value)}
              placeholder="Enter your license key"
            />
          </label>
          <p className="mt-2 text-[12.5px] leading-5 text-[var(--text-secondary)]">
            Use this only if the activation link from your purchase email does
            not open correctly.
          </p>
          {activationStatus ? (
            <div
              role={activationStatus.tone === "red" ? "alert" : "status"}
              aria-live="polite"
              className={`mt-3 rounded-[14px] border px-3 py-2.5 text-[12.5px] leading-5 ${
                activationStatus.tone === "red"
                  ? "border-[#FDA29B] bg-[#FEF3F2] text-[#B42318]"
                  : activationStatus.tone === "green"
                    ? "border-[var(--green-border)] bg-[var(--green-bg)] text-[var(--green-dark)]"
                    : "border-[var(--amber-border)] bg-[var(--amber-bg)] text-[var(--amber-dark)]"
              }`}
            >
              {activationStatus.message}
            </div>
          ) : errorMessage ? (
            <div
              role="alert"
              aria-live="polite"
              className="mt-3 rounded-[14px] border border-[#FDA29B] bg-[#FEF3F2] px-3 py-2.5 text-[12.5px] leading-5 text-[#B42318]"
            >
              {getActivationErrorMessage(new Error(errorMessage))}
            </div>
          ) : null}
          <button
            disabled={isVerifyingAccess}
            className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[16px] border border-transparent bg-[var(--green-main)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(14,90,63,0.14)] transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-75"
          >
            {isVerifyingAccess ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/45 border-t-white" />
            ) : null}
            {isVerifyingAccess ? "Checking access..." : "Activate with license key"}
          </button>
          <button
            type="button"
            onClick={() => {
              trackTruthlabelEvent(
                "checkout_returned",
                {
                  source: "activation_page_check_access",
                },
                { userId: user.id },
              );
              void linkPendingCheckoutAccess({
                source: "activation_page_check_access",
              }).then((linked) => {
                if (!linked) {
                  void refreshAccess();
                }
              });
            }}
            disabled={isVerifyingAccess}
            className="mt-3 w-full rounded-full px-4 py-2 text-[13px] font-semibold text-[var(--green-main)] transition hover:bg-[var(--green-bg)]"
          >
            {isLinkingPendingCheckout
              ? "Checking backup..."
              : "Backup: check checkout status"}
          </button>
          <p className="mt-3 text-center text-[12.5px] leading-5 text-[var(--text-secondary)]">
            Can&apos;t find your license key?{" "}
            <SupportContactLink
              context="Activation page"
              className="font-semibold text-[var(--green-main)]"
            />
          </p>
        </form>
      ) : null}

    </AuthShell>
  );
}
