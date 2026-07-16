"use client";

import Link from "next/link";
import AppMenu from "@/components/AppMenu";
import { SectionLabel } from "@/components/ResultUi";
import {
  defaultDemoProductId,
  getDemoProductById,
  getPrimaryDemoProducts,
} from "@/data/demoProducts";
import { publicAppConfig } from "@/lib/appConfig";
import { saveProfile, useStoredProfile } from "@/lib/profileStorage";

const defaultProductHref = `/product?category=packaged-processed-foods&demo=${defaultDemoProductId}`;
const defaultDemoProduct = getDemoProductById(defaultDemoProductId);
const primaryDemoProducts = getPrimaryDemoProducts();
const featureFlags = publicAppConfig.flags;

const steps = [
  "Open the sample result or paste a real ingredient list.",
  "See the exposure score, quick overview, and deeper scanner checks.",
  "Tap flagged items and check rows to see why they were highlighted.",
] as const;

export default function HomeScreen() {
  const profile = useStoredProfile();
  const watchItems = [...profile.allergies, ...profile.avoid];
  const actions = [
    ...(featureFlags.enableDemoProducts
      ? [
          {
            href: defaultProductHref,
            label: "Open Sample",
            detail: "Open the demo scanner report for this design pass.",
            meta: "Design preview",
            style:
              "border-transparent bg-[#182b22] text-white shadow-[0_22px_52px_rgba(24,43,34,0.18)]",
            detailStyle: "text-white/76",
            metaStyle: "text-white/64",
          },
        ]
      : []),
    {
      href: "/manual",
      label: "Manual Scan",
      detail: featureFlags.enableBarcodeLookup
        ? "Type a barcode or paste a real ingredient list and run it through the current Truthlabel engine."
        : "Paste a real ingredient list and run it through the current Truthlabel engine.",
      meta: "Live input",
      style: "border-[#ddd4c3] bg-white/82 text-[#22342c]",
      detailStyle: "text-[#5a6960]",
      metaStyle: "text-[#7a705c]",
    },
    {
      href: "/manual",
      label: "Paste Real Label",
      detail: "Add product name, brand, category, allergens, and packaging text if you have them.",
      meta: "Manual flow",
      style: "border-[#ddd4c3] bg-white/82 text-[#22342c]",
      detailStyle: "text-[#5a6960]",
      metaStyle: "text-[#7a705c]",
    },
  ] as const;

  return (
    <main className="min-h-screen px-4 py-5 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-[440px] space-y-4">
        <header className="flex items-start justify-between gap-4 px-1 py-1">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c6d4f]">
              inside it
            </p>
            <h1 className="mt-1 font-heading text-[1.7rem] font-semibold text-[#17251f]">
              Home
            </h1>
            <p className="mt-2 max-w-sm text-[14px] leading-5 text-[#58665e]">
              Scan food products and expose what the label really contains.
            </p>
            <p className="mt-1 text-[13px] font-medium text-[#7a705c]">
              Scan before you trust it.
            </p>
          </div>
          <AppMenu />
        </header>

        <section className="rounded-[28px] border border-white/75 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]">
          <SectionLabel>Start a scan</SectionLabel>
          <p className="mt-1.5 text-[14px] leading-5 text-[#55645c]">
            {featureFlags.enableBarcodeLookup
              ? "Typed barcode lookup is live. The demo result is still available for quick testing."
              : "Manual ingredient scans are active. Demo results are still available for quick testing."}
          </p>

          <div className="mt-3 grid gap-2.5">
            {actions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                onClick={() => saveProfile(profile)}
                className={`rounded-[22px] border px-4 py-3.5 transition active:scale-[0.99] ${action.style}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-semibold">{action.label}</span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${action.metaStyle}`}
                  >
                    {action.meta}
                  </span>
                </div>
                <p className={`mt-1.5 text-[13px] leading-5 ${action.detailStyle}`}>
                  {action.detail}
                </p>
              </Link>
            ))}
          </div>

          <p className="mt-3 text-[12px] leading-5 text-[#6a776f]">
            {featureFlags.enableCameraBarcodeScan || featureFlags.enableOcrScan
              ? "Camera barcode scan and OCR ingredient scan are available from the scan page when you need them."
              : "Manual label entry stays available even when camera or OCR tools are unavailable on the device."}
          </p>
        </section>

        <section className="rounded-[24px] border border-white/72 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]">
          <SectionLabel>Trust note</SectionLabel>
          <p className="mt-1.5 text-[13px] leading-5 text-[#55645c]">
            Truthlabel helps explain ingredient labels and safety signals. It is not medical advice. Always check the product label, especially for allergies.
          </p>
        </section>

        <section className="rounded-[24px] border border-white/72 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Watch list</SectionLabel>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#66756d]">
              Open menu to edit
            </p>
          </div>
          {watchItems.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {watchItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex rounded-full border border-[#e1d8ca] bg-[#faf7f0] px-3 py-1 text-[12px] font-medium text-[#445249]"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[13px] leading-5 text-[#55645c]">
              No watch settings selected yet. Open the menu to choose allergies and
              food concerns.
            </p>
          )}
        </section>

        <section className="rounded-[24px] border border-white/72 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]">
          <SectionLabel>How it works</SectionLabel>
          <ol className="mt-3 space-y-2.5">
            {steps.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-3 rounded-[18px] border border-[#ebe3d7] bg-white/76 px-3.5 py-3"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#ddd2bf] bg-[#f8f3ea] text-[11px] font-semibold text-[#5d685f]">
                  {index + 1}
                </span>
                <p className="pt-0.5 text-[13px] leading-5 text-[#49584f]">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {featureFlags.enableDemoProducts ? (
        <section className="rounded-[24px] border border-white/72 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]">
          <SectionLabel>Sample product</SectionLabel>
          <div className="mt-3 rounded-[20px] border border-[#e7decf] bg-white/76 p-4">
            <h2 className="font-heading text-[1.1rem] font-semibold text-[#17251f]">
              {defaultDemoProduct.productName}
            </h2>
            <p className="mt-1.5 text-[13px] leading-5 text-[#55645c]">
              Open the redesigned sample result page and review the rule-driven
              exposure layout powered by demo ingredient data.
            </p>
            <p className="mt-2 text-[12px] font-medium text-[#7a705c]">
              Default demo category: {defaultDemoProduct.productCategory}
            </p>
            <Link
              href={defaultProductHref}
              onClick={() => saveProfile(profile)}
              className="mt-3 inline-flex rounded-full border border-[#ddd4c3] bg-[#faf7f0] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#33443c] transition hover:bg-white active:scale-[0.99]"
            >
              Open sample result
            </Link>
          </div>
        </section>
        ) : null}

        {featureFlags.enableDemoProducts ? (
        <section className="rounded-[24px] border border-white/72 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Try demo labels</SectionLabel>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#66756d]">
              Realistic test cases
            </p>
          </div>
          <div className="mt-3 grid gap-2.5">
            {primaryDemoProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product?demo=${product.id}`}
                onClick={() => saveProfile(profile)}
                className="rounded-[18px] border border-[#e7decf] bg-white/78 px-3.5 py-3 transition hover:bg-white active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-semibold text-[#1d2b24]">
                      {product.productName}
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-[#596860]">
                      {product.productCategory}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#ddd4c3] bg-[#faf7f0] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#33443c]">
                    Open
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        ) : null}
      </div>
    </main>
  );
}
