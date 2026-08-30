# Reusable TruthLabel Onboarding, Install, Handoff, and Cancellation Flows

This document explains how the current TruthLabel flows are built so they can be reused in another app later.

## Admin Preview Hub

- Route: `/app/admin/flow-lab`
- Page file: `src/app/app/admin/flow-lab/page.tsx`
- UI component: `src/components/admin/AdminFlowLab.tsx`
- Access: server-side admin guard through `getAuthorizedTruthlabelAdminEmailFromCookies`
- Local development: `NEXT_PUBLIC_ENABLE_LOCAL_DEV_BYPASS` allows local admin access only outside production

The Flow Lab links to the real screens with query parameters instead of rebuilding duplicate versions. That keeps the preview close to the customer experience.

## Full Onboarding

- Route: `/app/onboarding`
- Component: `src/components/onboarding/TruthlabelOnboardingScreen.tsx`
- State helpers: `src/lib/onboarding/truthlabelOnboardingState.ts`
- Thiislincorn test helpers: `src/lib/onboarding/onboardingTestMode.ts`

Useful preview links:

- `/app/onboarding?review=1&restart=1`
- `/app/onboarding?review=1&install=1`

How it works:

- The user must be signed in for normal onboarding.
- Onboarding progress is stored locally and, when available, in the user settings row.
- `review=1` lets the screen open for admin/test replay.
- `restart=1` resets the onboarding progress for preview.
- `install=1` jumps directly to the installation step.

## Home Screen Installation

The wording should treat Add to Home Screen as installing the app.

Core message:

> Install TruthLabel on your Home Screen so it opens like an app whenever you shop.

Device handling lives in `TruthlabelOnboardingScreen.tsx`.

Detection rules:

- Installed app: `display-mode: standalone` or `navigator.standalone`
- Social/in-app browser: Instagram, Facebook, TikTok, Line, WeChat, Snapchat, Pinterest, LinkedIn app user agents
- iPhone/iPad Safari: manual Add to Home Screen guide
- Android Chrome/browser: native `beforeinstallprompt` when available, otherwise manual install guide
- Desktop: browser fallback message

Admin preview overrides:

- iPhone Safari: `/app/onboarding?review=1&install=1&installEnv=iphone`
- Android manual install: `/app/onboarding?review=1&install=1&installEnv=android-manual`
- Already installed: `/app/onboarding?review=1&install=1&installEnv=installed`

Image assets:

- `/onboarding-install-home-screen.jpeg`
- `/onboarding-ios-safari-share-button.jpeg`
- `/onboarding-ios-add-home-screen.jpeg`
- `/onboarding-ios-confirm-home-screen.jpeg`
- `/onboarding-android-browser-menu.jpeg`
- `/onboarding-android-install-menu.jpeg`
- `/onboarding-android-confirm-install.jpeg`
- `/onboarding-android-install-choice.jpeg`

## Social Browser Handoff

Purpose: Instagram and Facebook browsers often cannot complete installation, so users need to open the same link in Safari or Chrome.

Preview links:

- iPhone social browser: `/app/onboarding?review=1&install=1&installEnv=ios-in-app`
- Android social browser: `/app/onboarding?review=1&install=1&installEnv=android-in-app`

Customer behavior:

- If the app detects an in-app social browser, it shows a handoff screen first.
- iPhone copy tells the user to open in Safari to install TruthLabel.
- Android copy tells the user to open in Chrome or an external browser to install TruthLabel.
- If direct opening is unreliable, the user can copy the install link.

Image assets:

- `/onboarding-ios-social-open-safari.jpeg`
- `/onboarding-android-social-open-chrome.jpeg`

Reusable implementation pieces:

- `isInAppBrowser()`
- `isAppleMobileDevice()`
- `isAndroidDevice()`
- `getInstallDeviceKind()`
- `getInstallDeviceKindOverride()`

## Cancellation Help Flow

- Customer location: `/app/account`
- Direct anchor: `/app/account#cancel-subscription`
- Main component: `src/components/AccountScreen.tsx`
- Analytics events:
  - `subscription_cancel_started`
  - `subscription_cancel_email_started`

Customer flow:

- User opens Account.
- User clicks Cancel subscription.
- A large dialog shows two screenshots.
- Primary button opens their email inbox/search.
- Secondary button expands the "I cannot find my receipt" help form.
- If they cannot find the receipt, they enter the checkout email so support can resend the receipt.

Copy:

> Open your receipt from your checkout email and click subscription settings or manage membership to cancel.

Image assets:

- `/cancel-receipt-email.jpeg`
- `/cancel-membership.jpeg`

## What To Copy Into Another App

Minimum reusable package:

- The install device detection functions from `TruthlabelOnboardingScreen.tsx`
- The install guide arrays: `iosInstallSteps` and `androidInstallSteps`
- The social handoff screen logic
- The install image placeholder/card component
- The onboarding state helpers if the new app needs repeat/restart behavior
- The cancellation dialog copy and screenshot layout from `AccountScreen.tsx`
- The admin Flow Lab route if the new app also needs internal QA shortcuts

Keep app-specific parts separate:

- Brand name
- Logo and colors
- Support email
- Checkout provider wording
- Analytics event names
- Admin email list
- Product/app-specific onboarding steps

## QA Checklist

- Open Flow Lab as an admin.
- Test full onboarding replay.
- Test iPhone Safari install preview.
- Test Android install preview.
- Test iPhone social handoff preview.
- Test Android social handoff preview.
- Test installed completion state.
- Open Account cancellation flow from Flow Lab.
- Confirm the two cancellation screenshots fit on mobile.
- Confirm normal users cannot access `/app/admin/flow-lab`.
