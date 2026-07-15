export type ProductDataSource = "sample" | "openfoodfacts";

export type NormalizedIngredient = {
  name: string;
  text?: string;
  source?: "openfoodfacts";
};

export type NormalizedNutrient = {
  name: string;
  value?: number;
  unit?: string;
  per?: "100g" | "serving" | "unknown";
};

export type NormalizedProduct = {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  ingredientsText?: string;
  ingredients: NormalizedIngredient[];
  nutrients: NormalizedNutrient[];
  allergens: string[];
  additives: string[];
  novaGroup?: number;
  nutritionGrade?: string;
  rawSource?: "openfoodfacts";
};
