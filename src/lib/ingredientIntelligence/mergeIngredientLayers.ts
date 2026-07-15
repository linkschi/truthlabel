type IngredientLayerItem = {
  id: string;
};

type MergeIngredientLayersOptions = {
  datasetName?: string;
  requireOverlayForEveryStarter?: boolean;
};

export function mergeIngredientLayers<
  StarterItem extends IngredientLayerItem,
  OverlayItem extends IngredientLayerItem,
>(
  starterItems: StarterItem[],
  overlayItems: OverlayItem[],
  options: MergeIngredientLayersOptions = {},
) {
  const datasetName = options.datasetName ?? "ingredient layer";
  const starterById = new Map(starterItems.map((item) => [item.id, item]));
  const overlayById = new Map(overlayItems.map((item) => [item.id, item]));

  overlayItems.forEach((item) => {
    if (!starterById.has(item.id)) {
      throw new Error(
        `Overlay item "${item.id}" does not exist in starter data for ${datasetName}.`,
      );
    }
  });

  if (options.requireOverlayForEveryStarter) {
    starterItems.forEach((item) => {
      if (!overlayById.has(item.id)) {
        throw new Error(
          `Starter item "${item.id}" is missing an overlay entry for ${datasetName}.`,
        );
      }
    });
  }

  return starterItems.map((starterItem) => ({
    ...starterItem,
    ...overlayById.get(starterItem.id),
  })) as Array<StarterItem & Partial<OverlayItem>>;
}
