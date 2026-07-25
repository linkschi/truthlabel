/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Brand Assets",
  description: "Download local Truthlabel logo files.",
};

const assets = [
  {
    title: "Full Logo",
    fileName: "truthlabel-logo.svg",
    pngFileName: "truthlabel-logo.png",
    href: "/brand-assets/file/truthlabel-logo.svg",
    pngHref: "/brand-assets/file/truthlabel-logo.png",
    note: "Best for website headers, pitch decks, and wide layouts.",
  },
  {
    title: "Logo Mark",
    fileName: "truthlabel-mark.svg",
    pngFileName: "truthlabel-mark.png",
    href: "/brand-assets/file/truthlabel-mark.svg",
    pngHref: "/brand-assets/file/truthlabel-mark.png",
    note: "Best for profile images, square placements, and compact branding.",
  },
  {
    title: "App Icon",
    fileName: "truthlabel-icon.svg",
    pngFileName: "truthlabel-icon.png",
    href: "/brand-assets/file/truthlabel-icon.svg",
    pngHref: "/brand-assets/file/truthlabel-icon.png",
    note: "Best for app-style icon previews and install prompts.",
  },
  {
    title: "Thumbnail",
    fileName: "truthlabel-thumbnail.png",
    pngFileName: "truthlabel-thumbnail.png",
    href: "/brand-assets/file/truthlabel-thumbnail.png",
    pngHref: "/brand-assets/file/truthlabel-thumbnail.png",
    note: "Logo-only PNG thumbnail for quick downloads and previews.",
  },
] as const;

export default function BrandAssetsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F7F4EC] px-4 py-8 text-[#12261D]">
      <section className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex rounded-full border border-[#D7E7DD] bg-white px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-[#0E5A3F]"
        >
          Back to Truthlabel
        </Link>

        <div className="mt-6 rounded-[36px] border border-[#D7E7DD] bg-white p-5 shadow-[0_28px_80px_rgba(18,38,29,0.12)] sm:p-8">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#15803D]">
            Local brand assets
          </p>
          <h1 className="mt-3 font-heading text-[2.7rem] font-semibold leading-none tracking-[-0.06em] sm:text-[4.4rem]">
            Truthlabel logo downloads.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-7 text-[#506159]">
            Click a logo preview to download the SVG file. These are local MVP
            assets, so we can refine the final brand system later without
            blocking the app.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {assets.map((asset) => (
            <article
              key={asset.fileName}
              className="rounded-[28px] border border-[#D7E7DD] bg-white p-4 shadow-[0_16px_42px_rgba(18,38,29,0.08)]"
            >
              <a
                href={`${asset.href}?download=1`}
                download={asset.fileName}
                className="group block overflow-hidden rounded-[22px] border border-[#E7EFEA] bg-[#F8FBF9] p-4 transition hover:-translate-y-0.5 hover:border-[#15803D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2"
                aria-label={`Download ${asset.title}`}
              >
                <img
                  src={asset.href}
                  alt={`${asset.title} preview`}
                  className="mx-auto h-44 w-full object-contain transition group-hover:scale-[1.02]"
                />
              </a>
              <h2 className="mt-4 text-[18px] font-black">{asset.title}</h2>
              <p className="mt-1 text-[13px] font-semibold leading-6 text-[#506159]">
                {asset.note}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {asset.fileName.endsWith(".svg") ? (
                  <a
                    href={`${asset.href}?download=1`}
                    download={asset.fileName}
                    className="inline-flex rounded-full bg-[#12261D] px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-white"
                  >
                    Download SVG
                  </a>
                ) : null}
                <a
                  href={`${asset.pngHref}?download=1`}
                  download={asset.pngFileName}
                  className="inline-flex rounded-full border border-[#D7E7DD] bg-[#F3FAF6] px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-[#0E5A3F]"
                >
                  Download PNG
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
