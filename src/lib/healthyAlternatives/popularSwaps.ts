export type HealthyAlternativePopularSwap = {
  id: string;
  from: string;
  category: string;
  href: string;
};

export const healthyAlternativePopularSwaps: HealthyAlternativePopularSwap[] = [
  {
    id: "potato-chips",
    from: "Potato chips",
    category: "Snacks",
    href: "/alternatives/category/snacks",
  },
  {
    id: "breakfast-cereal",
    from: "Breakfast cereal",
    category: "Breakfast",
    href: "/alternatives/category/breakfast",
  },
  {
    id: "deli-meat",
    from: "Deli meat",
    category: "Meat",
    href: "/alternatives/category/meat",
  },
  {
    id: "cooking-oils",
    from: "Cooking oils",
    category: "Cooking Oils",
    href: "/alternatives/category/cooking-oils",
  },
  {
    id: "soda",
    from: "Soda",
    category: "Drinks",
    href: "/alternatives/category/drinks",
  },
];
