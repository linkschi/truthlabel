import { ultraProcessedIndicatorsDataPack } from "./ultraProcessedIndicators";

export type UltraProcessedIndicatorsItem =
  (typeof ultraProcessedIndicatorsDataPack.items)[number];

export const ultraProcessedIndicatorsItemsById = Object.fromEntries(
  ultraProcessedIndicatorsDataPack.items.map((item) => [item.id, item]),
) satisfies Record<string, UltraProcessedIndicatorsItem>;
