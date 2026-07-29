import type { ReactNode } from "react";
import { buildSupportMailtoHref } from "@/lib/supportContact";

export default function SupportContactLink({
  children = "Contact support",
  className,
  context = "Truthlabel app",
}: {
  children?: ReactNode;
  className?: string;
  context?: string;
}) {
  return (
    <a
      href={buildSupportMailtoHref({
        subject: `Truthlabel support - ${context}`,
        body: `Hi Truthlabel,\n\nI need help with:\n\nPage or area: ${context}\n\nWhat happened:\n`,
      })}
      className={className}
    >
      {children}
    </a>
  );
}
