import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Opening Truthlabel",
  description: "Continue into the Truthlabel app.",
};

export default function ActivatePage() {
  redirect("/app");
}
