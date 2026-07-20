import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import PwaServiceWorkerRegistration from "@/components/PwaServiceWorkerRegistration";
import "./globals.css";

const deploymentUrl = process.env.NEXT_PUBLIC_DEPLOYMENT_URL?.trim();

export const metadata: Metadata = {
  title: {
    default: "Truthlabel",
    template: "%s | Truthlabel",
  },
  description:
    "Scan ingredient labels, barcodes, and official safety signals before you trust the product.",
  applicationName: "Truthlabel",
  manifest: "/manifest.webmanifest",
  metadataBase: deploymentUrl ? new URL(deploymentUrl) : undefined,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Truthlabel",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0E4C37",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full">
        <AuthProvider>
          <PwaServiceWorkerRegistration />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
