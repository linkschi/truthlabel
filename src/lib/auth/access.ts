export type SubscriptionStatus =
  | "inactive"
  | "active"
  | "active_until_end"
  | "payment_failed"
  | "expired"
  | "refunded"
  | "disputed"
  | "chargebacked";

export type TruthlabelSubscription = {
  status: SubscriptionStatus;
  access_ends_at: string | null;
  last_verified_at?: string | null;
};

export type TruthlabelTrialAccess = {
  trial_started_at: string | null;
  trial_ends_at: string | null;
};

export type AccessState = "loading" | "signed_out" | "inactive" | "active";

export type AccessKind = "none" | "trial" | "paid";

function isFutureDate(value: string | null | undefined, now = Date.now()) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) && timestamp > now;
}

export function hasPaidAccess(subscription: TruthlabelSubscription | null) {
  if (!subscription) {
    return false;
  }

  if (subscription.status === "active") {
    return true;
  }

  if (
    subscription.status === "active_until_end" &&
    subscription.access_ends_at
  ) {
    return isFutureDate(subscription.access_ends_at);
  }

  return false;
}

export function hasTrialAccess(trialAccess: TruthlabelTrialAccess | null) {
  void trialAccess;

  // Truthlabel now uses Gumroad's card-backed membership trial as the source of
  // trial access. Legacy account-created trial rows must not unlock the app.
  return false;
}

export function getTrialDaysRemaining(
  trialAccess: TruthlabelTrialAccess | null,
  now = Date.now(),
) {
  if (!trialAccess?.trial_ends_at) {
    return 0;
  }

  const trialEnd = new Date(trialAccess.trial_ends_at).getTime();

  if (!Number.isFinite(trialEnd) || trialEnd <= now) {
    return 0;
  }

  return Math.max(1, Math.ceil((trialEnd - now) / 86_400_000));
}

export function getAccessKind(args: {
  subscription: TruthlabelSubscription | null;
  trialAccess: TruthlabelTrialAccess | null;
}): AccessKind {
  if (hasPaidAccess(args.subscription)) {
    return "paid";
  }

  return "none";
}

export function getAccessState(args: {
  authLoading: boolean;
  userPresent: boolean;
  subscription: TruthlabelSubscription | null;
  trialAccess: TruthlabelTrialAccess | null;
}): AccessState {
  if (args.authLoading) {
    return "loading";
  }

  if (!args.userPresent) {
    return "signed_out";
  }

  return getAccessKind(args) === "none" ? "inactive" : "active";
}
