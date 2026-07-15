import { seedOilsProcessedOilsDataPack } from "./seedOilsProcessedOils";

export type SeedOilsProcessedOilsItem =
  (typeof seedOilsProcessedOilsDataPack.items)[number];

export const seedOilsProcessedOilsItemsById = Object.fromEntries(
  seedOilsProcessedOilsDataPack.items.map((item) => [item.id, item]),
) satisfies Record<string, SeedOilsProcessedOilsItem>;
