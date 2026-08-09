import { isThiislincornOnboardingTestAccount } from "@/lib/onboarding/onboardingTestMode";

const defaultAdminEmails = ["thiislincorn@gmail.com"];

export function getTruthlabelAdminEmails() {
  return new Set(
    [...defaultAdminEmails, ...(process.env.TRUTHLABEL_ADMIN_EMAILS ?? "").split(",")]
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isTruthlabelAdminEmail(email: string | null | undefined) {
  const normalizedEmail = email?.trim().toLowerCase() ?? "";

  return (
    normalizedEmail.length > 0 &&
    (getTruthlabelAdminEmails().has(normalizedEmail) ||
      isThiislincornOnboardingTestAccount(normalizedEmail))
  );
}
