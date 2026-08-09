import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scout scrape test",
  description: "Local Truthlabel test for extracting one Scout product image.",
};

export const dynamic = "force-dynamic";

const scoutProductUrls = [
  "https://scouthealthapp.com/p/only-plastic-free-spring-salt",
  "https://scouthealthapp.com/p/oreo",
];

type JsonObject = Record<string, unknown>;

type ScrapedScoutProduct = {
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  mainImageUrl: string;
  productUrl: string;
  amazonUrl: string;
  ingredients: ScrapedScoutIngredient[];
};

type ScrapedScoutIngredient = {
  name: string;
  tone: string;
  reason: string;
};

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNumberOrString(value: unknown) {
  if (typeof value === "number") {
    return String(value);
  }

  return asString(value);
}

function extractJsonLdScripts(html: string) {
  return Array.from(
    html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
    (match) => match[1],
  );
}

function findProductJsonLd(html: string) {
  for (const script of extractJsonLdScripts(html)) {
    try {
      const parsed = JSON.parse(script) as unknown;
      const root = asObject(parsed);
      const graph = Array.isArray(root?.["@graph"]) ? root["@graph"] : [parsed];

      for (const entry of graph) {
        const item = asObject(entry);
        const type = item?.["@type"];

        if (type === "Product") {
          return item;
        }
      }
    } catch {
      // Ignore broken JSON-LD blocks and continue probing the page.
    }
  }

  return null;
}

function extractFirstAmazonImage(html: string) {
  return (
    html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[^"'<>\s]+/i)?.[0] ??
    ""
  );
}

function decodeHtml(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
    rsquo: "'",
    lsquo: "'",
    rdquo: '"',
    ldquo: '"',
  };

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&([a-z]+);/gi, (match, entity: string) =>
      namedEntities[entity] ?? match,
    )
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " "));
}

function extractField(block: string, className: string) {
  const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(
    new RegExp(
      `<[^>]+class=["'][^"']*${escapedClassName}[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`,
      "i",
    ),
  );

  return match ? stripTags(match[1]) : "";
}

function extractScoutIngredients(html: string): ScrapedScoutIngredient[] {
  return Array.from(html.matchAll(/<details class="ing-acc">([\s\S]*?)<\/details>/gi))
    .map((match) => {
      const block = match[1];

      return {
        name: extractField(block, "ing-name"),
        tone: extractField(block, "ing-tone"),
        reason: extractField(block, "ing-reason"),
      };
    })
    .filter((ingredient) => ingredient.name);
}

async function fetchScoutProduct(scoutProductUrl: string): Promise<{
  product: ScrapedScoutProduct | null;
  error: string;
}> {
  try {
    const response = await fetch(scoutProductUrl, {
      cache: "no-store",
      headers: {
        "user-agent": "Truthlabel local image import probe",
      },
    });

    if (!response.ok) {
      return {
        product: null,
        error: `Scout returned HTTP ${response.status}.`,
      };
    }

    const html = await response.text();
    const product = findProductJsonLd(html);

    if (!product) {
      return {
        product: null,
        error: "No Product JSON-LD block was found on this page.",
      };
    }

    const brand = asObject(product.brand);
    const offer = asObject(product.offers);
    const structuredImageUrl = asString(product.image);

    return {
      error: "",
      product: {
        name: asString(product.name),
        brand: asString(brand?.name),
        category: asString(product.category),
        description: asString(product.description),
        price: asNumberOrString(offer?.price),
        mainImageUrl: structuredImageUrl || extractFirstAmazonImage(html),
        productUrl: asString(product.url) || scoutProductUrl,
        amazonUrl: asString(offer?.url),
        ingredients: extractScoutIngredients(html),
      },
    };
  } catch (error) {
    return {
      product: null,
      error:
        error instanceof Error
          ? error.message
          : "Truthlabel could not fetch the Scout product page.",
    };
  }
}

function ProductImageCard({
  imageUrl,
}: {
  imageUrl: string;
}) {
  return (
    <article className="rounded-[28px] border border-[#DCE5DF] bg-white p-4 shadow-[0_18px_46px_rgba(15,40,28,0.08)]">
      <p className="mb-3 text-[12px] font-black uppercase tracking-[0.14em] text-[#0E5A3F]">
        Main product image
      </p>
      {imageUrl ? (
        <>
          <div className="overflow-hidden rounded-[22px] bg-[#F3F7F4]">
            <img
              src={imageUrl}
              alt="Scraped product preview"
              className="h-[320px] w-full object-contain p-4"
            />
          </div>
          <p className="mt-3 break-all text-[11px] font-semibold leading-5 text-[#66716B]">
            {imageUrl}
          </p>
        </>
      ) : (
        <p className="rounded-[18px] border border-[#F4C7C9] bg-[#FFF6F6] p-4 text-[13px] font-bold text-[#B42318]">
          No image URL found for this source.
        </p>
      )}
    </article>
  );
}

export default async function ScoutScrapeTestPage() {
  const results = await Promise.all(scoutProductUrls.map(fetchScoutProduct));

  return (
    <main className="min-h-screen bg-[#F7F9F7] px-4 py-6 text-[#101613]">
      <section className="mx-auto max-w-[980px]">
        <div className="rounded-[32px] border border-[#DCE5DF] bg-white p-5 shadow-[0_22px_60px_rgba(15,40,28,0.08)]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
            Local import test
          </p>
          <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em] sm:text-[44px]">
            Scout image scrape preview
          </h1>
          <p className="mt-3 max-w-[680px] text-[15px] font-semibold leading-7 text-[#56635C]">
            This is a temporary local-only test. It fetches public Scout product
            pages, reads structured product data, and extracts main image,
            brand, description, and ingredient rows for a possible Truthlabel
            importer.
          </p>
        </div>

        <div className="mt-5 grid gap-6">
          {results.map(({ product, error }, index) => (
            <section
              key={scoutProductUrls[index]}
              className="rounded-[32px] border border-[#DCE5DF] bg-white p-5 shadow-[0_14px_34px_rgba(15,40,28,0.06)]"
            >
              {error || !product ? (
                <div className="rounded-[24px] border border-[#F4C7C9] bg-[#FFF6F6] p-5 text-[#B42318]">
                  <h2 className="text-[20px] font-black">Scrape failed</h2>
                  <p className="mt-2 text-[14px] font-semibold">{error}</p>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
                  <ProductImageCard imageUrl={product.mainImageUrl} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#F4C7C9] bg-[#FFF6F6] px-3 py-2 text-[12px] font-black uppercase tracking-[0.12em] text-[#B42318]">
                        {product.category}
                      </span>
                      {product.price ? (
                        <span className="rounded-full border border-[#DCE5DF] bg-[#F7F9F7] px-3 py-2 text-[12px] font-black text-[#0E5A3F]">
                          ${product.price}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 text-[28px] font-black tracking-[-0.04em]">
                      {product.name}
                    </h2>
                    <p className="mt-1 text-[15px] font-bold text-[#56635C]">
                      Brand: {product.brand || "Not found"}
                    </p>
                    <p className="mt-4 text-[14px] font-semibold leading-7 text-[#56635C]">
                      {product.description || "No description found."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={product.productUrl}
                        className="inline-flex min-h-10 items-center rounded-full bg-[#0E5A3F] px-4 text-[12px] font-black text-white"
                      >
                        Source page
                      </a>
                      {product.amazonUrl ? (
                        <a
                          href={product.amazonUrl}
                          className="inline-flex min-h-10 items-center rounded-full border border-[#DCE5DF] bg-white px-4 text-[12px] font-black text-[#0E5A3F]"
                        >
                          Product listing
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <h3 className="text-[18px] font-black">
                      Ingredients extracted: {product.ingredients.length}
                    </h3>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {product.ingredients.length ? (
                        product.ingredients.map((ingredient) => (
                          <article
                            key={`${product.productUrl}-${ingredient.name}`}
                            className="rounded-[18px] border border-[#DCE5DF] bg-[#F7F9F7] p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <strong className="text-[14px] text-[#101613]">
                                {ingredient.name}
                              </strong>
                              <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#B42318]">
                                {ingredient.tone || "Unknown"}
                              </span>
                            </div>
                            {ingredient.reason ? (
                              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#56635C]">
                                {ingredient.reason}
                              </p>
                            ) : null}
                          </article>
                        ))
                      ) : (
                        <p className="rounded-[18px] border border-[#F1DDAD] bg-[#FFF8E1] p-4 text-[13px] font-bold text-[#8A6500]">
                          No ingredient rows found on this product page.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
