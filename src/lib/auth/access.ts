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

export type AccessState = "loading" | "signed_out" | "inactive" | "active";

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
    return new Date(subscription.access_ends_at).getTime() > Date.now();
  }

  return false;
}

export function getAccessState(args: {
  authLoading: boolean;
  userPresent: boolean;
  subscription: TruthlabelSubscription | null;
}): AccessState {
  if (args.authLoading) {
    return "loading";
  }

  if (!args.userPresent) {
    return "signed_out";
  }

  return hasPaidAccess(args.subscription) ? "active" : "inactive";
}
