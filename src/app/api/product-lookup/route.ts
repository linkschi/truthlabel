import {
  buildOpenFoodFactsProductUrl,
  OPEN_FOOD_FACTS_FIELDS,
} from "@/lib/productDatabase/openFoodFactsClient";
import { publicAppConfig } from "@/lib/appConfig";

const PRODUCT_LOOKUP_ROUTE_TIMEOUT_MS = 18000;

function normalizeBarcode(value: string | null) {
  const normalized = value?.replace(/[\s-_]+/g, "").trim() ?? "";

  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(normalized)) {
    return "";
  }

  return normalized;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const barcode = normalizeBarcode(requestUrl.searchParams.get("barcode"));

  if (!barcode) {
    return Response.json(
      {
        status: 0,
        status_verbose: "Enter a valid product barcode.",
      },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort("timeout"),
    PRODUCT_LOOKUP_ROUTE_TIMEOUT_MS,
  );
  const upstreamUrl = new URL(
    buildOpenFoodFactsProductUrl(
      publicAppConfig.openFoodFactsApiBaseUrl,
      barcode,
    ),
  );

  upstreamUrl.searchParams.set("fields", OPEN_FOOD_FACTS_FIELDS.join(","));

  try {
    const response = await fetch(upstreamUrl.toString(), {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return Response.json(
        {
          status: 0,
          status_verbose: "Product lookup failed at the product database.",
        },
        { status: 502 },
      );
    }

    const payload = await response.json();

    return Response.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=600",
      },
    });
  } catch {
    return Response.json(
      {
        status: 0,
        status_verbose: "Product lookup timed out or failed.",
      },
      { status: 504 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
