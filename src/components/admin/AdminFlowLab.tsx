import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

type FlowLink = {
  label: string;
  detail: string;
  href: string;
  tone?: "primary" | "neutral";
};

const installPreviewLinks: FlowLink[] = [
  {
    label: "Full onboarding replay",
    detail: "Starts the customer onboarding flow again from the beginning.",
    href: "/app/onboarding?review=1&restart=1",
    tone: "primary",
  },
  {
    label: "Install guide - auto detect",
    detail: "Uses the real browser/device detection logic.",
    href: "/app/onboarding?review=1&install=1",
  },
  {
    label: "iPhone Home Screen install",
    detail: "Shows Safari steps for adding TruthLabel to the Home Screen.",
    href: "/app/onboarding?review=1&install=1&installEnv=iphone",
  },
  {
    label: "Android Home Screen install",
    detail: "Shows Android browser steps for installing TruthLabel.",
    href: "/app/onboarding?review=1&install=1&installEnv=android-manual",
  },
  {
    label: "Already installed state",
    detail: "Shows the completion state and the path back into the app.",
    href: "/app/onboarding?review=1&install=1&installEnv=installed",
  },
];

const socialHandoffLinks: FlowLink[] = [
  {
    label: "Instagram/Facebook on iPhone",
    detail: "Shows the Open in Safari handoff before Home Screen install.",
    href: "/app/onboarding?review=1&install=1&installEnv=ios-in-app",
    tone: "primary",
  },
  {
    label: "Instagram/Facebook on Android",
    detail: "Shows the Open in Chrome/browser handoff before install.",
    href: "/app/onboarding?review=1&install=1&installEnv=android-in-app",
    tone: "primary",
  },
];

const toolLinks: FlowLink[] = [
  {
    label: "Internal analytics",
    detail: "Check customer events, landing visits, trial clicks, and errors.",
    href: "/app/admin/analytics",
  },
  {
    label: "Demo Scan Builder",
    detail: "Create custom result examples without touching real scans.",
    href: "/app/admin/demo-scan-builder",
  },
  {
    label: "Account cancel flow",
    detail: "Jump to the Account page cancellation button and open the dialog.",
    href: "/app/account#cancel-subscription",
  },
];

function FlowCard({ detail, href, label, tone = "neutral" }: FlowLink) {
  return (
    <Link
      href={href}
      className={`block rounded-[20px] border px-4 py-4 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5A3F] focus-visible:ring-offset-2 active:scale-[0.99] ${
        tone === "primary"
          ? "border-[#0E5A3F] bg-[#0E5A3F] text-white"
          : "border-[#DCE5DF] bg-white text-[#101613] hover:bg-[#F7F9F7]"
      }`}
    >
      <span className="block text-[14px] font-black tracking-[-0.01em]">
        {label}
      </span>
      <span
        className={`mt-1.5 block text-[12.5px] font-semibold leading-5 ${
          tone === "primary" ? "text-white/78" : "text-[#56635C]"
        }`}
      >
        {detail}
      </span>
    </Link>
  );
}

function Section({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="rounded-[26px] border border-[#DCE5DF] bg-white px-4 py-5 shadow-[0_10px_28px_rgba(15,40,28,0.05)]">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0E5A3F]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-[1.35rem] font-black tracking-[-0.04em] text-[#101613]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function AdminFlowLab({ adminEmail }: { adminEmail: string }) {
  return (
    <main className="min-h-screen bg-[#F7F9F7] px-4 py-5 text-[#101613] sm:px-5 sm:py-6">
      <div className="mx-auto w-full max-w-[980px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/app"
            className="rounded-full border border-[#DCE5DF] bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#34443C]"
          >
            Back to app
          </Link>
          <Link
            href="/app/admin/analytics"
            className="rounded-full border border-[#DCE5DF] bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#0E5A3F]"
          >
            Analytics
          </Link>
        </div>

        <section className="rounded-[30px] border border-[#CFE8D9] bg-[#F2FBF4] px-4 py-5 shadow-[0_10px_28px_rgba(15,40,28,0.05)]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
            Private admin
          </p>
          <h1 className="mt-1 text-[2.15rem] font-black leading-none tracking-[-0.06em] text-[#102019]">
            Flow Lab
          </h1>
          <p className="mt-3 max-w-[640px] text-[13px] font-semibold leading-5 text-[#53635A]">
            Preview onboarding, social browser handoff, Home Screen installation,
            and cancellation help without hunting through the app.
          </p>
          <p className="mt-3 rounded-[16px] border border-[#BFDCCB] bg-white/70 px-3 py-2 text-[12px] font-bold text-[#0E5A3F]">
            Admin: {adminEmail}
          </p>
        </section>

        <Section eyebrow="Install onboarding" title="Home Screen installation">
          <div className="grid gap-3 sm:grid-cols-2">
            {installPreviewLinks.map((link) => (
              <FlowCard key={link.href} {...link} />
            ))}
          </div>
        </Section>

        <Section eyebrow="Social browsers" title="Instagram and Facebook handoff">
          <p className="mb-4 text-[13px] font-semibold leading-5 text-[#56635C]">
            These previews show the handoff screens that tell users to open the
            app link in Safari or Chrome so they can install TruthLabel on their
            Home Screen.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {socialHandoffLinks.map((link) => (
              <FlowCard key={link.href} {...link} />
            ))}
          </div>
        </Section>

        <Section eyebrow="Cancellation" title="Receipt and membership help">
          <p className="text-[13px] font-semibold leading-5 text-[#56635C]">
            The customer flow lives in Account. They click Cancel subscription,
            see receipt screenshots, then either open their email or request a
            receipt resend with their checkout email.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
            <figure className="overflow-hidden rounded-[18px] border border-[#DCE5DF] bg-[#F7F9F7] p-1">
              <Image
                src="/cancel-receipt-email.jpeg"
                alt="Receipt email showing subscription settings"
                width={720}
                height={1280}
                className="h-[210px] w-full object-contain sm:h-[260px]"
              />
            </figure>
            <figure className="overflow-hidden rounded-[18px] border border-[#DCE5DF] bg-[#F7F9F7] p-1">
              <Image
                src="/cancel-membership.jpeg"
                alt="Manage membership screen showing cancel membership"
                width={720}
                height={1280}
                className="h-[210px] w-full object-contain sm:h-[260px]"
              />
            </figure>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {toolLinks.map((link) => (
              <FlowCard key={link.href} {...link} />
            ))}
          </div>
        </Section>

        <Section eyebrow="Reusable notes" title="How these flows are built">
          <div className="grid gap-3 text-[13px] font-semibold leading-5 text-[#56635C]">
            <p>
              Main onboarding component:
              {" "}
              <code className="rounded bg-[#EDF7F1] px-1.5 py-0.5 text-[#0E5A3F]">
                src/components/onboarding/TruthlabelOnboardingScreen.tsx
              </code>
            </p>
            <p>
              Install screenshots are static assets in
              {" "}
              <code className="rounded bg-[#EDF7F1] px-1.5 py-0.5 text-[#0E5A3F]">
                public/onboarding-*.jpeg
              </code>
              . Cancellation screenshots are
              {" "}
              <code className="rounded bg-[#EDF7F1] px-1.5 py-0.5 text-[#0E5A3F]">
                public/cancel-*.jpeg
              </code>
              .
            </p>
            <p>
              Full implementation notes are saved in
              {" "}
              <code className="rounded bg-[#EDF7F1] px-1.5 py-0.5 text-[#0E5A3F]">
                docs/reusable-onboarding-and-account-flows.md
              </code>
              {" "}
              so we can copy the logic into another app later.
            </p>
          </div>
        </Section>
      </div>
    </main>
  );
}
