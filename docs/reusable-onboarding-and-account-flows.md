# Reusable Code Guide: Onboarding, App Install, Social Handoff, and Cancellation

This is a developer handoff for reusing the TruthLabel onboarding/install/cancellation system in another app.

It is not marketing notes. It explains the code shape, where each part lives, and what to copy or replace.

## Start Here For A New Codex Chat

Use this prompt in the next Codex chat:

```text
Read docs/reusable-onboarding-and-account-flows.md first.

I want to reuse the TruthLabel onboarding, Home Screen app-install, social browser handoff, admin preview Flow Lab, and cancellation-help flow in another app.

Do not inspect the whole repository.

Only inspect these files unless you are blocked:

src/app/app/admin/flow-lab/page.tsx
src/components/admin/AdminFlowLab.tsx
src/components/onboarding/TruthlabelOnboardingScreen.tsx
src/lib/onboarding/truthlabelOnboardingState.ts
src/lib/onboarding/onboardingTestMode.ts
src/components/AccountScreen.tsx
src/lib/auth/supabaseServer.ts
public/onboarding-*.jpeg
public/cancel-*.jpeg

Goal:

Copy the reusable structure into the new app with the new app's brand name, screenshots, admin guard, support email, analytics names, and route paths.

Keep the same logic:

admin-only Flow Lab
onboarding replay links
iPhone Add to Home Screen guide
Android install guide
Instagram/Facebook browser handoff
installed-state detection
cancellation receipt-help dialog

Do not copy TruthLabel-specific customer wording unless I ask.
Do not copy local development bypass into production.
Do not rebuild the design from scratch.
Stop after creating the same working flow structure in the new app.
```

Fast rule for the next Codex chat:

```text
Copy structure first. Replace brand-specific pieces second. Polish only after it works.
```

## Current Files

```text
src/app/app/admin/flow-lab/page.tsx
src/components/admin/AdminFlowLab.tsx
src/components/onboarding/TruthlabelOnboardingScreen.tsx
src/lib/onboarding/truthlabelOnboardingState.ts
src/lib/onboarding/onboardingTestMode.ts
src/components/AccountScreen.tsx
src/lib/auth/supabaseServer.ts
public/onboarding-*.jpeg
public/cancel-*.jpeg
```

## Admin Flow Lab

The Flow Lab is a private admin page that links to the real flows with preview query params.

Route:

```text
/app/admin/flow-lab
```

Server-protected page pattern:

```tsx
import { notFound } from "next/navigation";
import AdminFlowLab from "@/components/admin/AdminFlowLab";
import { getAuthorizedTruthlabelAdminEmailFromCookies } from "@/lib/auth/supabaseServer";

export const dynamic = "force-dynamic";

export default async function AdminFlowLabPage() {
  const adminEmail = await getAuthorizedTruthlabelAdminEmailFromCookies();

  if (!adminEmail) {
    notFound();
  }

  return <AdminFlowLab adminEmail={adminEmail} />;
}
```

Reuse note: keep this server guard. Do not only hide admin links in the UI. Normal users must not be able to open the page directly.

## Flow Link Data Pattern

The admin page is built from simple link arrays.

```tsx
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
    label: "iPhone Home Screen install",
    detail: "Shows Safari steps for adding TruthLabel to the Home Screen.",
    href: "/app/onboarding?review=1&install=1&installEnv=iphone",
  },
  {
    label: "Android Home Screen install",
    detail: "Shows Android browser steps for installing TruthLabel.",
    href: "/app/onboarding?review=1&install=1&installEnv=android-manual",
  },
];
```

Reusable card pattern:

```tsx
function FlowCard({ detail, href, label, tone = "neutral" }: FlowLink) {
  return (
    <Link
      href={href}
      className={
        tone === "primary"
          ? "border-green bg-green text-white"
          : "border bg-white text-dark"
      }
    >
      <span>{label}</span>
      <span>{detail}</span>
    </Link>
  );
}
```

Reuse note: this is intentionally simple. The admin page should be updated by adding or removing entries from the arrays.

## Onboarding Preview Query Params

The real onboarding route is:

```text
/app/onboarding
```

Preview modes:

```text
/app/onboarding?review=1&restart=1
/app/onboarding?review=1&install=1
/app/onboarding?review=1&install=1&installEnv=iphone
/app/onboarding?review=1&install=1&installEnv=ios-in-app
/app/onboarding?review=1&install=1&installEnv=android-in-app
/app/onboarding?review=1&install=1&installEnv=android-manual
/app/onboarding?review=1&install=1&installEnv=installed
```

Meaning:

```text
review=1       Allows admin/test replay behavior.
restart=1      Starts onboarding again from step 1.
install=1      Opens directly on the installation step.
installEnv     Forces a specific device/browser preview.
```

Code pattern:

```tsx
const searchParams = useSearchParams();
const reviewMode = searchParams.get("review") === "1";
const restartMode = searchParams.get("restart") === "1";
const installReviewMode = reviewMode && searchParams.get("install") === "1";
const installDeviceOverride = isAdminTester
  ? getInstallDeviceKindOverride(searchParams.get("installEnv"))
  : null;
```

Reuse note: only let trusted admin/test users use overrides. Real users should get automatic device detection.

## Install Device Detection

TruthLabel decides which install flow to show from browser/device signals.

```tsx
type InstallDeviceKind =
  | "ios_in_app"
  | "android_in_app"
  | "android_prompt"
  | "android_fallback"
  | "iphone_safari"
  | "iphone_other"
  | "browser_fallback"
  | "desktop"
  | "installed";
```

Core detection:

```tsx
function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isAppleMobileDevice() {
  const touchMac =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return /iPad|iPhone|iPod/i.test(navigator.userAgent) || touchMac;
}

function isAndroidDevice() {
  return /Android/i.test(navigator.userAgent);
}

function isSafariBrowser() {
  const userAgent = navigator.userAgent;

  return /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(userAgent);
}

function isInAppBrowser() {
  return /Instagram|FBAN|FBAV|FB_IAB|FBIOS|FB4A|TikTok|Bytedance|Line\/|MicroMessenger|Snapchat|Pinterest|LinkedInApp/i.test(
    navigator.userAgent,
  );
}
```

Decision function:

```tsx
function getInstallDeviceKind(
  deferredPrompt: BeforeInstallPromptEvent | null,
  override?: InstallDeviceKind | null,
): InstallDeviceKind {
  if (override) return override;
  if (isStandaloneMode()) return "installed";

  if (isInAppBrowser()) {
    if (isAppleMobileDevice()) return "ios_in_app";
    if (isAndroidDevice()) return "android_in_app";
    return "browser_fallback";
  }

  if (isAppleMobileDevice()) {
    return isSafariBrowser() ? "iphone_safari" : "iphone_other";
  }

  if (isAndroidDevice()) {
    return deferredPrompt ? "android_prompt" : "android_fallback";
  }

  return "desktop";
}
```

Override mapper:

```tsx
function getInstallDeviceKindOverride(value: string | null) {
  switch (value) {
    case "ios-in-app":
      return "ios_in_app";
    case "android-in-app":
      return "android_in_app";
    case "iphone":
      return "iphone_safari";
    case "android-manual":
      return "android_fallback";
    case "installed":
      return "installed";
    default:
      return null;
  }
}
```

Reuse note: this code must run in a client component because it reads `window` and `navigator`.

## Install Prompt Capture

Android/Chrome can fire `beforeinstallprompt`. Save that event and call `prompt()` only when the user clicks Install.

```tsx
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const [deferredPrompt, setDeferredPrompt] =
  useState<BeforeInstallPromptEvent | null>(null);

useEffect(() => {
  function handleInstallPrompt(event: Event) {
    event.preventDefault();
    setDeferredPrompt(event as BeforeInstallPromptEvent);
  }

  function handleInstalled() {
    setDeferredPrompt(null);
    setInstallCompleted(true);
  }

  window.addEventListener("beforeinstallprompt", handleInstallPrompt);
  window.addEventListener("appinstalled", handleInstalled);

  return () => {
    window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    window.removeEventListener("appinstalled", handleInstalled);
  };
}, []);
```

Prompt button:

```tsx
async function handlePromptInstall() {
  if (!deferredPrompt) {
    return;
  }

  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === "accepted") {
    setInstallCompleted(true);
  }

  setDeferredPrompt(null);
}
```

Reuse note: iPhone Safari does not give a native install prompt. It needs visual instructions for Share -> Add to Home Screen.

## Install Step Data Shape

TruthLabel stores install instructions as data so the UI can render iPhone and Android guides consistently.

```tsx
type InstallGuideStep = {
  id: string;
  progress: string;
  title: string;
  imageKey: string;
  imageSrc?: string;
  imageAlt: string;
  placeholderLabel: string;
  imageAspectRatio?: string;
  imageWidth?: number;
  imageHeight?: number;
  tip?: string;
};
```

iPhone example:

```tsx
const iosInstallSteps: InstallGuideStep[] = [
  {
    id: "share",
    progress: "Step 1 of 3",
    title: "Tap Safari's Share button",
    imageKey: "ios-share-button",
    imageSrc: "/onboarding-ios-safari-share-button.jpeg",
    imageAlt: "Safari showing the TruthLabel page and Share button",
    placeholderLabel: "Safari Share button image slot",
    imageAspectRatio: "3 / 4",
    imageWidth: 1080,
    imageHeight: 1440,
  },
  {
    id: "add-home-screen",
    progress: "Step 2 of 3",
    title: 'Choose "Add to Home Screen"',
    imageKey: "ios-add-to-home-screen",
    imageSrc: "/onboarding-ios-add-home-screen.jpeg",
    imageAlt: "Safari Share menu showing Add to Home Screen",
    placeholderLabel: "Add to Home Screen image slot",
    imageAspectRatio: "3 / 4",
    imageWidth: 1080,
    imageHeight: 1440,
    tip: 'If you do not see "Add to Home Screen" right away, keep scrolling down.',
  },
];
```

Android example:

```tsx
const androidInstallSteps: InstallGuideStep[] = [
  {
    id: "browser-menu",
    progress: "Step 1 of 4",
    title: "Open your browser menu",
    imageKey: "android-browser-menu",
    imageSrc: "/onboarding-android-browser-menu.jpeg",
    imageAlt: "Android browser showing its menu button",
    placeholderLabel: "Android browser menu image slot",
    imageAspectRatio: "2 / 3",
    imageWidth: 1024,
    imageHeight: 1536,
  },
  {
    id: "install-app",
    progress: "Step 2 of 4",
    title: 'Choose "Install app" or "Add to Home screen"',
    imageKey: "android-install-app",
    imageSrc: "/onboarding-android-install-menu.jpeg",
    imageAlt: "Android browser menu showing the install app option",
    placeholderLabel: "Android install option image slot",
    imageAspectRatio: "2 / 3",
    imageWidth: 1024,
    imageHeight: 1536,
    tip: "If Install is lower in the menu, scroll down until you see it.",
  },
];
```

Reuse note: replace image files and brand name, but keep this data-driven structure. It makes the guide easy to reorder and test.

## Install Image Component Pattern

Use a fixed image area so each step feels consistent.

```tsx
function InstallationImage({
  alt,
  height,
  src,
  width,
}: {
  alt: string;
  height: number;
  src: string;
  width: number;
}) {
  return (
    <figure className="overflow-hidden rounded-[24px] border bg-white p-2">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-full w-full object-contain"
      />
    </figure>
  );
}
```

Reuse note: use `object-contain`, not `cover`, because these are instruction screenshots and must not be cropped.

## Social Browser Handoff

Social browsers need a handoff before installation.

Preview links:

```text
/app/onboarding?review=1&install=1&installEnv=ios-in-app
/app/onboarding?review=1&install=1&installEnv=android-in-app
```

UI decision:

```tsx
if (deviceKind === "ios_in_app" || deviceKind === "android_in_app") {
  return (
    <section>
      <p>CONTINUE INSTALLATION</p>
      <h1>
        {deviceKind === "android_in_app"
          ? "Open in Chrome to install TruthLabel"
          : "Open in Safari to install TruthLabel"}
      </h1>
      <ol>
        <li>Tap the Instagram or Facebook browser menu</li>
        <li>
          {deviceKind === "android_in_app"
            ? 'Choose "Open in Chrome" or "Open in browser"'
            : 'Choose "Open in Safari" or "Open in external browser"'}
        </li>
        <li>Continue installing TruthLabel there</li>
      </ol>
    </section>
  );
}
```

Copy-link fallback:

```tsx
async function copyInstallLink() {
  await navigator.clipboard.writeText(window.location.href);
  setCopyStatus(
    "Install link copied. Open Safari or Chrome, paste the link, then continue installing TruthLabel.",
  );
}
```

Reuse note: the handoff should sound like part of installation, not like an optional workaround.

## Onboarding State

State helper file:

```text
src/lib/onboarding/truthlabelOnboardingState.ts
```

Important state fields:

```ts
type TruthlabelOnboardingState = {
  currentOnboardingStep: number;
  onboardingStartedAt: string | null;
  onboardingCompletedAt: string | null;
  allergySetupCompleted: boolean;
  installPromptSeen: boolean;
  installPromptOutcome: "accepted" | "dismissed" | "deferred" | "already_installed" | null;
  appInstallStatus: "not_installed" | "installed" | "already_installed";
};
```

Storage pattern:

```ts
const onboardingStoragePrefix = "truthlabel.onboarding.";

function getOnboardingStorageKey(userId: string) {
  return `${onboardingStoragePrefix}${userId || "anonymous"}`;
}
```

Reuse note: use the new app name in the storage key. Example: `myapp.onboarding.`. This avoids old data from one app affecting another.

## Cancellation Dialog

Customer route:

```text
/app/account
```

Direct anchor:

```text
/app/account#cancel-subscription
```

State:

```tsx
const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
const [cancelReceiptHelpOpen, setCancelReceiptHelpOpen] = useState(false);
const [cancelCheckoutEmail, setCancelCheckoutEmail] = useState("");
```

Open button:

```tsx
<button
  id="cancel-subscription"
  type="button"
  onClick={() => setCancelDialogOpen(true)}
>
  Cancel subscription
</button>
```

Dialog structure:

```tsx
{cancelDialogOpen ? (
  <section role="dialog" aria-modal="true" aria-labelledby="cancel-title">
    <h2 id="cancel-title">Need to cancel?</h2>
    <p>
      Open your receipt from your checkout email and click subscription settings
      or manage membership to cancel.
    </p>

    <div className="grid grid-cols-2 gap-2">
      <Image
        src="/cancel-receipt-email.jpeg"
        alt="Receipt email showing the subscription settings link"
        width={720}
        height={1280}
        className="h-[190px] w-full object-contain"
      />
      <Image
        src="/cancel-membership.jpeg"
        alt="Manage membership page showing the cancel membership button"
        width={720}
        height={1280}
        className="h-[190px] w-full object-contain"
      />
    </div>

    <a href={receiptInboxHref} target="_blank" rel="noreferrer">
      Go check my email
    </a>

    <button
      type="button"
      onClick={() => setCancelReceiptHelpOpen((isOpen) => !isOpen)}
      aria-expanded={cancelReceiptHelpOpen}
    >
      I cannot find my receipt
    </button>
  </section>
) : null}
```

Expanded receipt-help form:

```tsx
{cancelReceiptHelpOpen ? (
  <div>
    <p>Cannot find the receipt?</p>
    <p>
      No problem. Enter the email used at checkout and we will resend the receipt.
    </p>

    <input
      type="email"
      value={cancelCheckoutEmail}
      onChange={(event) => setCancelCheckoutEmail(event.target.value)}
      placeholder="email used at checkout"
    />

    <a href={cancellationSupportHref}>Request receipt resend</a>
  </div>
) : null}
```

Reuse note: the new app needs its own support destination and checkout/receipt wording. Do not hardcode TruthLabel support copy if the app name changes.

## Analytics Events

TruthLabel tracks these flow events:

```text
onboarding_started
install_instructions_viewed
install_prompt_shown
install_accepted
install_dismissed
install_deferred
onboarding_completed
subscription_cancel_started
subscription_cancel_email_started
```

Event call pattern:

```ts
trackTruthlabelEvent(
  "subscription_cancel_started",
  {
    access_status: accessStatus.label,
    subscription_status: subscription?.status ?? "unknown",
  },
  { userId: user?.id },
);
```

Reuse note: rename the analytics helper and event prefix for the new app. Keep event names consistent and simple.

## Assets To Copy

```text
public/onboarding-install-home-screen.jpeg
public/onboarding-ios-safari-share-button.jpeg
public/onboarding-ios-add-home-screen.jpeg
public/onboarding-ios-confirm-home-screen.jpeg
public/onboarding-ios-social-open-safari.jpeg
public/onboarding-android-browser-menu.jpeg
public/onboarding-android-install-menu.jpeg
public/onboarding-android-confirm-install.jpeg
public/onboarding-android-install-choice.jpeg
public/onboarding-android-social-open-chrome.jpeg
public/cancel-receipt-email.jpeg
public/cancel-membership.jpeg
```

Reuse note: if the new app has a different logo/domain, replace the screenshots. Do not reuse screenshots that show the wrong app name.

## Copy Checklist For Another App

1. Copy the admin Flow Lab route and component.
2. Replace the admin guard with the new app's admin check.
3. Copy the install detection functions into a client component.
4. Copy the install guide data shape.
5. Replace all image assets with the new app's screenshots.
6. Replace TruthLabel wording with the new app name.
7. Copy the cancellation dialog structure.
8. Replace support email and checkout provider wording.
9. Add analytics events for install, onboarding, and cancellation.
10. Test iPhone Safari, Android Chrome, Instagram browser, Facebook browser, installed PWA mode, and desktop fallback.

## Important Safety Notes

Do not copy local development bypass into production.

Do not expose admin pages by only hiding links.

Do not treat browser detection as perfect. Always keep manual fallback instructions.

Do not crop instruction screenshots.

Do not make cancellation hard to find. The customer should always have a clear route to cancel or request receipt help.

Do not make installation sound optional if the product is meant to behave like an app. Use wording like "Install on your Home Screen" and "Open like an app."
