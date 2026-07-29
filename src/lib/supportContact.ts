const fallbackSupportEmail = "support@truthlabel.app";
const defaultSubject = "Truthlabel support request";

function getCleanSupportEmail() {
  const configuredEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();

  return configuredEmail || fallbackSupportEmail;
}

export function buildSupportMailtoHref({
  subject = defaultSubject,
  body,
}: {
  subject?: string;
  body?: string;
} = {}) {
  const params = new URLSearchParams();
  params.set("subject", subject.trim() || defaultSubject);

  if (body?.trim()) {
    params.set("body", body.trim());
  }

  return `mailto:${getCleanSupportEmail()}?${params.toString()}`;
}
