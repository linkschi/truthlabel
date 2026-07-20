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

export default async function ManualRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string | string[];
    scan?: string | string[];
    scannerDebug?: string | string[];
  }>;
}) {
  redirect(appendQuery("/app/manual", await searchParams));
}
