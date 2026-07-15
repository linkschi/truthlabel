import { emulsifiersStabilisersGumsDataPack } from "./emulsifiersStabilisersGums";

export type EmulsifiersStabilisersGumsItem =
  (typeof emulsifiersStabilisersGumsDataPack.items)[number];

export const emulsifiersStabilisersGumsItemsById = Object.fromEntries(
  emulsifiersStabilisersGumsDataPack.items.map((item) => [item.id, item]),
) satisfies Record<string, EmulsifiersStabilisersGumsItem>;
