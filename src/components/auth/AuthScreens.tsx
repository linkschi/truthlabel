"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";
import { useTruthlabelAuth } from "@/components/auth/AuthProvider";
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

function SignInFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ tone: "green" | "red"; message: string } | null>(
    null,
  );
  const [isBusy, setIsBusy] = useState(false);
  const nextPath = searchParams.get("next") || "/app";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsBusy(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Account access is not configured yet.");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error) {
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
      title="Welcome back."
      message="Sign in with the email you used for your Truthlabel account."
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
        <Link href="/create-account" className="font-semibold text-[var(--green-main)]">
          Create an account
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

export function CreateAccountScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState<{
    tone: "green" | "yellow" | "red";
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

    if (!acceptedTerms) {
      setStatus({
        tone: "red",
        message: "Please accept the Terms and Privacy Policy to continue.",
      });
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
          emailRedirectTo:
            typeof window === "undefined" ? undefined : `${window.location.origin}/app`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.replace("/app");
        router.refresh();
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setAcceptedTerms(false);
      setStatus({
        tone: "green",
        message:
          "Check your email to confirm your Truthlabel account. Your 7-day trial is created with the account and will be waiting after confirmation.",
      });
    } catch (error) {
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

  return (
    <AuthShell
      eyebrow="Create account"
      title="Start your 7-day Truthlabel trial."
      message="Create your account, confirm your email, then start scanning ingredient labels with your personal Watch List."
      wide
    >
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="rounded-[26px] border border-[var(--green-border)] bg-[var(--green-bg)]/72 p-5">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[var(--green-dark)]">
            Included in trial
          </p>
          <ul className="mt-4 grid gap-3 text-[13px] font-semibold leading-5 text-[var(--text-main)]">
            {[
              "Barcode, camera, OCR, and manual label checks",
              "Personal allergy Watch List warnings",
              "Green, yellow, and red ingredient explanations",
              "No payment required to create the trial account",
              "If you continue after the free trial, cancel anytime",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--green-main)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-[18px] border border-white/80 bg-white/72 px-4 py-3 text-[12px] font-semibold leading-5 text-[var(--green-dark)]">
            Your trial access is created by the account system. Paid access can
            be added later after the trial, and you can cancel anytime.
          </p>
        </aside>

        <div>
          <form onSubmit={handleSubmit}>
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
            <label className="mt-4 flex gap-3 rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[12px] leading-5 text-[var(--text-secondary)]">
              <input
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--green-main)]"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-[var(--green-main)]"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-[var(--green-main)]"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {status ? (
              <StatusMessage tone={status.tone} message={status.message} />
            ) : null}
            <button disabled={isBusy} className={submitButtonClass(isBusy)}>
              {isBusy ? "Creating account..." : "Start free trial"}
            </button>
          </form>
          <p className="mt-5 text-[13px] leading-5 text-[var(--text-secondary)]">
            Truthlabel helps explain labels; it does not replace the original
            package label or medical advice. If you continue after the free
            trial, you can cancel anytime.
          </p>
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
        message: "If this email exists, Supabase will send a password reset link.",
      });
    } catch (error) {
      setStatus({
        tone: "red",
        message:
          error instanceof Error
            ? error.message
            : "Truthlabel could not send the reset email.",
      });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Reset your password."
      message="Enter your account email and Truthlabel will request a reset link from Supabase."
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
    } catch (error) {
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
      message="This page works after opening a valid Supabase password reset link."
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
    trialAccess,
    trialDaysRemaining,
    user,
  } = useTruthlabelAuth();
  const [licenseKey, setLicenseKey] = useState("");
  const [activationStatus, setActivationStatus] = useState<{
    tone: "green" | "yellow" | "red";
    message: string;
  } | null>(null);
  const [isActivatingLicense, setIsActivatingLicense] = useState(false);
  const checkoutUrl =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKOUT_URL?.trim() || "https://truthlabel.gumroad.com";
  const isActive = accessState === "active";
  const trialEndLabel = trialAccess?.trial_ends_at
    ? new Date(trialAccess.trial_ends_at).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  async function handleLicenseActivation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActivationStatus(null);

    if (!user) {
      setActivationStatus({
        tone: "red",
        message: "Sign in before activating a Gumroad license.",
      });
      return;
    }

    const trimmedLicenseKey = licenseKey.trim();

    if (trimmedLicenseKey.length < 8) {
      setActivationStatus({
        tone: "red",
        message: "Enter the Gumroad license key from your purchase email.",
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
      await refreshAccess();
    } catch (error) {
      setActivationStatus({
        tone: "red",
        message:
          error instanceof Error
            ? error.message
            : "Truthlabel could not verify this Gumroad license.",
      });
    } finally {
      setIsActivatingLicense(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Activate"
      title="Activate your Truthlabel access."
      message="New accounts receive a 7-day free trial. Gumroad subscription activation is used to continue access after the trial, and you can cancel anytime."
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
                ? "Active subscription"
                : accessKind === "trial"
                  ? `Free trial - ${trialDaysRemaining} day${
                      trialDaysRemaining === 1 ? "" : "s"
                    } left`
                  : subscription?.status ?? "Inactive"}
            </span>
          </p>
          {accessKind === "trial" && trialEndLabel ? (
            <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
              Trial ends:{" "}
              <span className="font-semibold text-[var(--text-main)]">
                {trialEndLabel}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 grid gap-2.5">
        <a
          href={checkoutUrl}
          className="inline-flex justify-center rounded-full border border-transparent bg-[var(--text-main)] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white"
        >
          Continue with Gumroad
        </a>
        <p className="text-center text-[12px] font-semibold leading-5 text-[var(--text-secondary)]">
          If you continue after the free trial, you can cancel anytime.
        </p>
        {user ? (
          <button
            type="button"
            onClick={() => void refreshAccess()}
            className="rounded-full border border-[var(--border-soft)] bg-white px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-main)]"
          >
            Refresh access status
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
            Gumroad license key
          </span>
          <input
            className={inputClass}
            type="text"
            autoComplete="off"
            inputMode="text"
            value={licenseKey}
            onChange={(event) => setLicenseKey(event.target.value)}
            placeholder="Paste your Gumroad license key"
          />
        </label>
        <p className="mt-2 text-[12px] leading-5 text-[var(--text-secondary)]">
          Use the license key from your Gumroad purchase email. Truthlabel
          verifies it securely and stores only a protected license hash.
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
          {isActivatingLicense ? "Verifying..." : "Activate paid access"}
        </button>
      </form>

      <div className="mt-5 rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
          Trial and license activation
        </p>
        <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">
          The 7-day trial is created by Supabase when your account is created.
          Gumroad license-key verification can activate paid access after the
          trial once the Supabase Edge Function is deployed. Membership and
          cancellation are managed
          through the secure checkout flow.
        </p>
      </div>
    </AuthShell>
  );
}
