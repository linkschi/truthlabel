import type { Metadata } from "next";
import HomeScreen from "@/components/HomeScreen";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Start a scan, review demo products, and open the Truthlabel ingredient scanner.",
};

export default function Home() {
  return <HomeScreen />;
}
