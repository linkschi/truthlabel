import type { BarcodeExternalSignal } from "@/lib/productDatabase/productDatabaseTypes";

export type DemoProduct = {
  id: string;
  productName: string;
  brandName: string;
  barcode: string;
  productCategory: string;
  ingredients: string[];
  allergenStatement: string;
  packagingText: string;
  scanSource: "demo";
  externalSignals: BarcodeExternalSignal[];
};

export const defaultDemoProductId = "chocolate-cereal-bar";

export const demoProducts: DemoProduct[] = [
  {
    id: "chocolate-cereal-bar",
    productName: "Chocolate Cereal Bar",
    brandName: "Example Foods",
    barcode: "1234567890123",
    productCategory: "Packaged / Processed Foods",
    ingredients: [
      "Oats",
      "Cocoa powder",
      "Milk powder",
      "Soy lecithin",
      "Maltodextrin",
      "Artificial flavour",
      "Red No. 3",
      "Palm oil",
      "Modified corn starch",
      "Natural flavouring",
      "Spice extract",
      "Salt",
    ],
    allergenStatement: "Contains milk and soy",
    packagingText: "Wrapped snack bar",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "simple-rolled-oats",
    productName: "Simple Rolled Oats",
    brandName: "Whole Pantry",
    barcode: "1000000000001",
    productCategory: "Fresh / Simple Foods",
    ingredients: ["Rolled oats"],
    allergenStatement: "",
    packagingText: "Paper bag",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "red-berry-soda",
    productName: "Red Berry Soda",
    brandName: "Bright Sip",
    barcode: "1000000000002",
    productCategory: "Drinks / Beverages",
    ingredients: [
      "Carbonated water",
      "Sugar",
      "Citric acid",
      "Natural flavour",
      "Red No. 3",
      "Sodium benzoate",
    ],
    allergenStatement: "",
    packagingText: "Aluminium can",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "zero-sugar-citrus-drink",
    productName: "Zero Sugar Citrus Drink",
    brandName: "Bright Sip Zero",
    barcode: "1000000000003",
    productCategory: "Drinks / Beverages",
    ingredients: [
      "Carbonated water",
      "Citric acid",
      "Aspartame",
      "Acesulfame potassium",
      "Sucralose",
      "Natural flavour",
      "Sodium benzoate",
    ],
    allergenStatement: "",
    packagingText: "Aluminium can",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "crunchy-cheese-snack",
    productName: "Crunchy Cheese Snack",
    brandName: "Snack Forge",
    barcode: "1000000000004",
    productCategory: "Packaged / Processed Foods",
    ingredients: [
      "Corn meal",
      "Vegetable oil",
      "Cheese seasoning",
      "Maltodextrin",
      "Monosodium glutamate",
      "Artificial flavour",
      "Yellow 5",
      "Yellow 6",
      "Disodium guanylate",
      "Disodium inosinate",
    ],
    allergenStatement: "Contains milk",
    packagingText: "Foil snack bag",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "chicken-sausage",
    productName: "Chicken Sausage",
    brandName: "Quick Grill",
    barcode: "1000000000005",
    productCategory: "Meat / Fast Food",
    ingredients: [
      "Mechanically separated chicken",
      "Water",
      "Soy protein",
      "Modified starch",
      "Sodium phosphate",
      "Sodium nitrite",
      "Smoke flavouring",
      "Spices",
    ],
    allergenStatement: "Contains soy",
    packagingText: "Plastic sausage casing",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "baby-rice-puffs",
    productName: "Baby Rice Puffs",
    brandName: "Little Start",
    barcode: "1000000000006",
    productCategory: "Baby / Kids Food",
    ingredients: [
      "Rice flour",
      "Apple powder",
      "Sunflower oil",
      "Natural flavour",
      "Mixed tocopherols",
    ],
    allergenStatement: "",
    packagingText: "Resealable pouch",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "dark-chocolate-bar",
    productName: "Dark Chocolate Bar",
    brandName: "Cocoa House",
    barcode: "1000000000007",
    productCategory: "Packaged / Processed Foods",
    ingredients: [
      "Cocoa mass",
      "Cane sugar",
      "Cocoa butter",
      "Soy lecithin",
      "Natural vanilla flavour",
    ],
    allergenStatement: "Contains soy",
    packagingText: "Paper-wrapped bar",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "spring-water",
    productName: "Spring Water",
    brandName: "Clear Spring",
    barcode: "1000000000008",
    productCategory: "Drinks / Beverages",
    ingredients: ["Spring water"],
    allergenStatement: "",
    packagingText: "PET bottle",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "canned-tuna",
    productName: "Canned Tuna",
    brandName: "Harbor Catch",
    barcode: "1000000000013",
    productCategory: "Seafood",
    ingredients: ["Tuna", "Water", "Salt"],
    allergenStatement: "Contains fish",
    packagingText: "Metal can",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "chocolate-milk-drink",
    productName: "Chocolate Milk Drink",
    brandName: "Dairy Day",
    barcode: "1000000000009",
    productCategory: "Drinks / Beverages",
    ingredients: [
      "Milk",
      "Sugar",
      "Cocoa powder",
      "Carrageenan",
      "Natural flavour",
    ],
    allergenStatement: "Contains milk",
    packagingText: "Plastic bottle",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "old-formula-citrus-drink",
    productName: "Old Formula Citrus Drink",
    brandName: "Classic Fizz",
    barcode: "1000000000010",
    productCategory: "Drinks / Beverages",
    ingredients: [
      "Water",
      "Sugar",
      "Brominated vegetable oil",
      "Natural flavour",
    ],
    allergenStatement: "",
    packagingText: "Plastic bottle",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "shelf-stable-sauce",
    productName: "Shelf Stable Sauce",
    brandName: "Pantry Pour",
    barcode: "1000000000011",
    productCategory: "Packaged / Processed Foods",
    ingredients: [
      "Water",
      "Tomato paste",
      "Sugar",
      "Salt",
      "Sodium benzoate",
      "Potassium sorbate",
      "Calcium propionate",
      "Natural flavour",
      "Modified starch",
    ],
    allergenStatement: "",
    packagingText: "Plastic squeeze bottle",
    scanSource: "demo",
    externalSignals: [],
  },
  {
    id: "mystery-protein-bar",
    productName: "Mystery Protein Bar",
    brandName: "Opaque Fuel",
    barcode: "1000000000012",
    productCategory: "Packaged / Processed Foods",
    ingredients: [
      "Protein blend",
      "Vegetable oil",
      "Natural flavour",
      "Flavouring",
      "Gum blend",
      "Modified starch",
      "Sweetener blend",
      "Preservatives",
    ],
    allergenStatement: "",
    packagingText: "Wrapper",
    scanSource: "demo",
    externalSignals: [],
  },
];

export const primaryDemoProductIds = [
  "simple-rolled-oats",
  "red-berry-soda",
  "zero-sugar-citrus-drink",
  "chicken-sausage",
  "baby-rice-puffs",
  "chocolate-milk-drink",
] as const;

const defaultDemoProductIdByCategorySlug: Record<string, string> = {
  "packaged-processed-foods": defaultDemoProductId,
  "meat-fast-food": "chicken-sausage",
  "drinks-beverages": "red-berry-soda",
  "baby-kids-food": "baby-rice-puffs",
  seafood: "canned-tuna",
  "dairy-egg-products": "chocolate-milk-drink",
  "fresh-simple-foods": "simple-rolled-oats",
  "general-unknown": defaultDemoProductId,
};

export function getDemoProductById(productId?: string | null) {
  return (
    demoProducts.find((product) => product.id === productId) ??
    demoProducts.find((product) => product.id === defaultDemoProductId)!
  );
}

export function getDefaultDemoProductIdForCategorySlug(
  categorySlug?: string | null,
) {
  return defaultDemoProductIdByCategorySlug[categorySlug ?? ""] ?? defaultDemoProductId;
}

export function getPrimaryDemoProducts() {
  return primaryDemoProductIds.map((id) => getDemoProductById(id));
}
