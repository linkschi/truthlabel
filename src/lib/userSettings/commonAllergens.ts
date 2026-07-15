export type CommonAllergen = {
  id: string;
  label: string;
  aliases: string[];
};

export const commonAllergens: CommonAllergen[] = [
  {
    id: "milk",
    label: "Milk",
    aliases: ["milk", "dairy", "whey", "casein", "lactose"],
  },
  {
    id: "egg",
    label: "Egg",
    aliases: ["egg", "eggs", "albumen", "ovalbumin"],
  },
  {
    id: "peanut",
    label: "Peanut",
    aliases: ["peanut", "peanuts", "groundnut", "arachis oil"],
  },
  {
    id: "tree nuts",
    label: "Tree nuts",
    aliases: ["tree nuts", "mixed nuts"],
  },
  {
    id: "almond",
    label: "Almond",
    aliases: ["almond", "almonds", "marzipan"],
  },
  {
    id: "cashew",
    label: "Cashew",
    aliases: ["cashew", "cashews"],
  },
  {
    id: "walnut",
    label: "Walnut",
    aliases: ["walnut", "walnuts"],
  },
  {
    id: "hazelnut",
    label: "Hazelnut",
    aliases: ["hazelnut", "hazelnuts", "filbert"],
  },
  {
    id: "pistachio",
    label: "Pistachio",
    aliases: ["pistachio", "pistachios"],
  },
  {
    id: "pecan",
    label: "Pecan",
    aliases: ["pecan", "pecans"],
  },
  {
    id: "macadamia",
    label: "Macadamia",
    aliases: ["macadamia", "macadamia nut", "macadamia nuts"],
  },
  {
    id: "brazil nut",
    label: "Brazil nut",
    aliases: ["brazil nut", "brazil nuts"],
  },
  {
    id: "wheat",
    label: "Wheat",
    aliases: ["wheat", "wheat flour", "wheat gluten"],
  },
  {
    id: "gluten",
    label: "Gluten",
    aliases: ["gluten", "vital wheat gluten", "barley", "rye"],
  },
  {
    id: "soy",
    label: "Soy",
    aliases: ["soy", "soya", "soybean", "soy lecithin"],
  },
  {
    id: "fish",
    label: "Fish",
    aliases: ["fish", "anchovy", "salmon", "tuna"],
  },
  {
    id: "crustacean shellfish",
    label: "Crustacean shellfish",
    aliases: ["shellfish", "crustacean shellfish", "shrimp", "prawn", "crab", "lobster"],
  },
  {
    id: "sesame",
    label: "Sesame",
    aliases: ["sesame", "tahini", "gingelly", "benne"],
  },
  {
    id: "mustard",
    label: "Mustard",
    aliases: ["mustard", "mustard seed", "dijon mustard"],
  },
  {
    id: "celery",
    label: "Celery",
    aliases: ["celery", "celeriac", "celery seed"],
  },
  {
    id: "lupin",
    label: "Lupin",
    aliases: ["lupin", "lupine"],
  },
  {
    id: "molluscs",
    label: "Molluscs",
    aliases: ["molluscs", "mollusks", "clam", "mussel", "oyster", "scallop"],
  },
  {
    id: "sulphites",
    label: "Sulphites",
    aliases: [
      "sulphites",
      "sulfites",
      "sulfur dioxide",
      "sulphur dioxide",
      "E220",
      "E221",
      "E222",
      "E223",
      "E224",
      "E226",
      "E227",
      "E228",
    ],
  },
];
