import { artificialSweetenersDataPack } from "./artificialSweetenersSugarSubstitutes";

export type ArtificialSweetenersItem =
  (typeof artificialSweetenersDataPack.items)[number];

export const artificialSweetenersItemsById = Object.fromEntries(
  artificialSweetenersDataPack.items.map((item) => [item.id, item]),
) satisfies Record<string, ArtificialSweetenersItem>;
