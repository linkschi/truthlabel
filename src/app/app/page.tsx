import type { Metadata } from "next";
import HomeScreen from "@/components/HomeScreen";

export const metadata: Metadata = {
  title: "App",
  description: "Open the protected Truthlabel scanner home.",
};

export default function AppHomePage() {
  return <HomeScreen />;
}
