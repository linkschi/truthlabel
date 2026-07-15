import { flavourEnhancersFlavouringsDataPack } from "./flavourEnhancersFlavourings";

export type FlavourEnhancersFlavouringsItem =
  (typeof flavourEnhancersFlavouringsDataPack.items)[number];

export const flavourEnhancersFlavouringsItemsById = Object.fromEntries(
  flavourEnhancersFlavouringsDataPack.items.map((item) => [item.id, item]),
) satisfies Record<string, FlavourEnhancersFlavouringsItem>;
