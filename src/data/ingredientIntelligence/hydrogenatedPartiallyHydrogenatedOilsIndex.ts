import { hydrogenatedPartiallyHydrogenatedOilsDataPack } from "./hydrogenatedPartiallyHydrogenatedOils";

export type HydrogenatedPartiallyHydrogenatedOilsItem =
  (typeof hydrogenatedPartiallyHydrogenatedOilsDataPack.items)[number];

export const hydrogenatedPartiallyHydrogenatedOilsItemsById =
  Object.fromEntries(
    hydrogenatedPartiallyHydrogenatedOilsDataPack.items.map((item) => [
      item.id,
      item,
    ]),
  ) satisfies Record<string, HydrogenatedPartiallyHydrogenatedOilsItem>;
