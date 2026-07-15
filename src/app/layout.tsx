import type { Metadata, Viewport } from "next";
import "./globals.css";

const deploymentUrl = process.env.NEXT_PUBLIC_DEPLOYMENT_URL?.trim();

export const metadata: Metadata = {
  title: {
    default: "InsideIt",
    template: "%s | InsideIt",
  },
  description:
    "Scan ingredient labels, barcodes, and official safety signals before you trust the product.",
  applicationName: "InsideIt",
  manifest: "/manifest.webmanifest",
  metadataBase: deploymentUrl ? new URL(deploymentUrl) : undefined,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#182b22",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full">
        {children}
      </body>
    </html>
  );
}
