import { preservativesShelfLifeSystemsDataPack } from "./preservativesShelfLifeSystems";

export type PreservativesShelfLifeSystemsItem =
  (typeof preservativesShelfLifeSystemsDataPack.items)[number];

export const preservativesShelfLifeSystemsItemsById = Object.fromEntries(
  preservativesShelfLifeSystemsDataPack.items.map((item) => [item.id, item]),
) satisfies Record<string, PreservativesShelfLifeSystemsItem>;
