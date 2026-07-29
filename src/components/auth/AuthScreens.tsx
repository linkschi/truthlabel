"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
import { trackTruthlabelEvent } from "@/lib/analytics/analyticsClient";
import { normalizeAnalyticsError } from "@/lib/analytics/analyticsEvents";
import { getSupabaseBrowserClient } from "@/lib/auth/supabaseClient";

const inputClass =
  "mt-2 w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[14px] text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--green-main)] focus:ring-2 focus:ring-[rgba(21,128,61,0.14)]";

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

function getGumroadCheckoutUrl() {
  return (
    process.env.NEXT_PUBLIC_GUMROAD_CHECKOUT_URL?.trim() ||
    "https://truthlabel.gumroad.com/l/fnoakd?wanted=true"
  );
}

function storePendingCheckoutEmail(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem("truthlabel.pendingCheckoutEmail", email);
  } catch {
    // Browsers can block storage. Checkout should still continue.
  }
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

  if (accessState === "active") {
    return (
      <AuthShell
        eyebrow="Signed in"
        title="Truthlabel is ready."
        message="You are already signed in on this device."
      >
        <Link
          href="/app"
          className="mt-5 inline-flex w-full justify-center rounded-full border border-transparent bg-[var(--text-main)] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_36px_rgba(23,20,18,0.16)]"
        >
          Open Truthlabel
        </Link>
      </AuthShell>
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
      trackTruthlabelEvent(
        "checkout_handoff_shown",
        {
          source: "create_account_page",
        },
        { userId: data.user?.id },
      );
      storePendingCheckoutEmail(email);
      setFirstName("");
      setPassword("");
      setConfirmPassword("");
      setIsRedirectingToCheckout(true);
      setStatus({
        tone: "green",
        message: "Account created. Taking you to checkout.",
      });

      window.setTimeout(() => {
        trackTruthlabelEvent(
          "checkout_started",
          {
            source: "create_account_auto_redirect",
          },
          { userId: data.user?.id },
        );
        window.location.assign(checkoutUrl);
      }, 1900);
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
  const {
    accessKind,
    accessState,
    errorMessage,
    refreshAccess,
    subscription,
    user,
  } = useTruthlabelAuth();
  const [licenseKey, setLicenseKey] = useState("");
  const [activationStatus, setActivationStatus] = useState<{
    tone: "green" | "yellow" | "red";
    message: string;
  } | null>(null);
  const [isActivatingLicense, setIsActivatingLicense] = useState(false);
  const activationViewTrackedRef = useRef(false);
  const checkoutUrl = getGumroadCheckoutUrl();
  const isActive = accessState === "active";

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
          "License key found from the activation link. Review it, then activate access.",
      });
    });
  }, []);

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
      setActivationStatus({
        tone: "green",
        message: data.message || "Paid Truthlabel access is active.",
      });
      trackTruthlabelEvent(
        "activation_success",
        {
          activation_method: "license_key",
          status: data.status || "active",
        },
        { userId: user.id },
      );
      await refreshAccess();
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
        message:
          error instanceof Error
            ? error.message
            : "Truthlabel could not verify this license key.",
      });
    } finally {
      setIsActivatingLicense(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Activate"
      title="Activate your Truthlabel access."
      message="Access not active yet. If you used a different email at checkout, paste the license key from your purchase email to link access to this account."
    >
      {errorMessage ? <StatusMessage tone="red" message={errorMessage} /> : null}

      {!user ? (
        <div className="mt-5 rounded-[20px] border border-[var(--amber-border)] bg-[var(--amber-bg)] px-4 py-3 text-[13px] leading-5 text-[var(--amber-dark)]">
          Sign in or create an account before activating access.
        </div>
      ) : null}

      {user ? (
        <div className="mt-5 rounded-[20px] border border-[var(--border-soft)] bg-[var(--bg-soft)] px-4 py-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Signed in as
          </p>
          <p className="mt-1 text-[14px] font-semibold text-[var(--text-main)]">
            {user.email}
          </p>
          <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">
            Current access:{" "}
            <span className="font-semibold">
              {accessKind === "paid"
                ? "Active subscription or trial"
                : subscription?.status ?? "Inactive"}
            </span>
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-2.5">
        {user ? (
          <a
            href={checkoutUrl}
            onClick={() =>
              trackTruthlabelEvent(
                "checkout_started",
                {
                  source: "activation_page",
                },
                { userId: user.id },
              )
            }
            className="inline-flex justify-center rounded-full border border-transparent bg-[var(--text-main)] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white"
          >
            Start 7-day trial
          </a>
        ) : (
          <Link
            href="/create-account"
            className="inline-flex justify-center rounded-full border border-transparent bg-[var(--text-main)] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white"
          >
            Create account to start trial
          </Link>
        )}
        <p className="text-center text-[12px] font-semibold leading-5 text-[var(--text-secondary)]">
          Trial details are confirmed at checkout. You can cancel anytime.
        </p>
        {user ? (
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
              void refreshAccess();
            }}
            className="rounded-full border border-[var(--border-soft)] bg-white px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-main)]"
          >
            I finished checkout - check access
          </button>
        ) : (
          <Link
            href="/sign-in?next=/activate"
            className="inline-flex justify-center rounded-full border border-[var(--border-soft)] bg-white px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-main)]"
          >
            Sign in to activate
          </Link>
        )}
        {isActive ? (
          <Link
            href="/app"
            className="inline-flex justify-center rounded-full border border-[var(--green-border)] bg-[var(--green-bg)] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--green-dark)]"
          >
            Open Truthlabel
          </Link>
        ) : null}
      </div>

      <form
        onSubmit={handleLicenseActivation}
        className="mt-5 rounded-[20px] border border-[var(--border-soft)] bg-white px-4 py-4"
      >
        <label className="block">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            License key
          </span>
          <input
            className={inputClass}
            type="text"
            autoComplete="off"
            inputMode="text"
            value={licenseKey}
            onChange={(event) => setLicenseKey(event.target.value)}
            placeholder="Paste your license key"
          />
        </label>
        <p className="mt-2 text-[12px] leading-5 text-[var(--text-secondary)]">
          Paste the key from your purchase email to activate this account.
        </p>
        {activationStatus ? (
          <StatusMessage
            tone={activationStatus.tone}
            message={activationStatus.message}
          />
        ) : null}
        <button
          disabled={isActivatingLicense || !user}
          className={submitButtonClass(isActivatingLicense || !user)}
        >
          {isActivatingLicense ? "Verifying..." : "Activate access"}
        </button>
      </form>
    </AuthShell>
  );
}
