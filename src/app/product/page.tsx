import { redirect } from "next/navigation";

function appendQuery(path: string, params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
      return;
    }

    if (value) {
      query.set(key, value);
    }
  });

  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
}

export default async function ProductRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{
    barcode?: string | string[];
    category?: string | string[];
    demo?: string | string[];
    fresh?: string | string[];
    manual?: string | string[];
  }>;
}) {
  redirect(appendQuery("/app/results", await searchParams));
}
