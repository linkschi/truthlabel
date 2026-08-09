import {
  healthyAlternativeCategories,
  healthyAlternativeProducts,
} from "@/lib/healthyAlternatives";

import AlternativesExploreClient from "../_components/AlternativesExploreClient";

export default async function AlternativesExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const queryParam = (await searchParams).q;
  const initialQuery = Array.isArray(queryParam) ? queryParam[0] ?? "" : queryParam ?? "";
  const categories = healthyAlternativeCategories
    .slice()
    .sort((categoryA, categoryB) => categoryA.order - categoryB.order);

  return (
    <AlternativesExploreClient
      categories={categories}
      products={healthyAlternativeProducts}
      initialQuery={initialQuery}
    />
  );
}
