import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "InsideIt",
    short_name: "InsideIt",
    description:
      "InsideIt scans ingredient labels, barcodes, and safety signals before you trust the product.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe6",
    theme_color: "#182b22",
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
