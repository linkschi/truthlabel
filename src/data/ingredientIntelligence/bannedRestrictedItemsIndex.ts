import { bannedRestrictedItems } from "./bannedRestrictedItems";

export type BannedRestrictedItem = (typeof bannedRestrictedItems)[number];

export const bannedRestrictedItemsById = Object.fromEntries(
  bannedRestrictedItems.map((item) => [item.id, item]),
) satisfies Record<string, BannedRestrictedItem>;
