import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Truthlabel",
    short_name: "Truthlabel",
    description:
      "Truthlabel scans ingredient labels, barcodes, and safety signals before you trust the product.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0E4C37",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
