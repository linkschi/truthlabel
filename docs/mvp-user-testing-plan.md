# Truthlabel MVP User Testing Plan

## 1. Testing goal

> Find bugs, confusing warnings, bad matches, missed ingredients, unclear result sections, and mobile usability issues before public launch.

This phase is not about proving every score is perfect. It is about catching obvious product-scanning problems before more features are added.

## 2. Who should test

- Everyday shoppers who read ingredient labels
- One or two allergy-aware testers who can review milk, nut, soy, egg, wheat, and sesame warnings carefully
- At least one tester using iPhone Safari
- At least one tester using Android Chrome
- At least one desktop tester for manual paste and barcode typing fallback

## 3. What users should scan

- Real packaged foods from home, a supermarket, or a pantry shelf
- Products with short clean labels
- Products with long additive-heavy labels
- At least a few barcode-only lookups where the ingredient list is missing
- OCR photos taken in both good and bad lighting
- Products likely to trigger allergy, preservative, sweetener, oil, and processed-food warnings

## 4. What feedback to collect

- Wrong ingredient match
- Missed ingredient
- Confusing warning wording
- Score feels too high or too low
- Barcode product data wrong or incomplete
- OCR text wrong or incomplete
- Allergy warning issue
- App bug, crash, loading problem, or mobile layout issue

## 5. Known limitations

- Open Food Facts data may be incomplete or user-submitted.
- OCR can misread labels, especially with glare, curved packaging, or blurry text.
- External recall and safety checks depend on available official data and match confidence.
- Missing data is not proof of absence.
- Truthlabel is not medical advice and should not replace the package label.

## 6. Safety and trust reminders

- Always check the package label, especially for allergies.
- Do not treat a green result as a guarantee that the product is safe.
- Do not treat Cancer-linked Watch as proof that a product causes cancer.
- Do not treat external safety silence as proof that no recall exists.
- Use real product packaging when reporting OCR or barcode issues.

## 7. Bug report format

Use this structure for every tester report:

```ts
{
  issueType: "",
  productName: "",
  brandName: "",
  barcode: "",
  scanMethod: "manual" | "barcode" | "camera_barcode" | "ocr",
  message: "",
  ingredientText: "",
  optionalContact: ""
}
```

## 8. Product test checklist

Record each product with this structure:

```ts
{
  productName: "",
  brandName: "",
  barcode: "",
  productCategory: "",
  scanMethod: "manual" | "barcode" | "camera_barcode" | "ocr",
  expectedMainWarnings: [],
  actualMainWarnings: [],
  scoreLooksReasonable: true,
  falsePositiveIssues: [],
  missedIngredientIssues: [],
  confusingWording: [],
  UIProblems: [],
  notes: ""
}
```

### 30-product checklist

| Slot | Category | Product example to test | Scan method | Done | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Simple foods | Plain oats or plain rice | manual |  |  |
| 2 | Simple foods | Plain yogurt or plain beans | barcode |  |  |
| 3 | Drinks | Regular soda | barcode |  |  |
| 4 | Drinks | Flavored sparkling water | manual |  |  |
| 5 | Diet / zero sugar drinks | Zero sugar soda | barcode |  |  |
| 6 | Diet / zero sugar drinks | Sugar-free energy drink | ocr |  |  |
| 7 | Processed snacks | Cheese puffs or chips | barcode |  |  |
| 8 | Processed snacks | Cracker or savory snack mix | manual |  |  |
| 9 | Sweets / candy | Colored candy | barcode |  |  |
| 10 | Sweets / candy | Chewy sweet with artificial flavouring | ocr |  |  |
| 11 | Breakfast cereals | Sweetened cereal | barcode |  |  |
| 12 | Breakfast cereals | Granola or cereal bar | manual |  |  |
| 13 | Sauces | Shelf-stable sauce | barcode |  |  |
| 14 | Sauces | Salad dressing or dip | ocr |  |  |
| 15 | Frozen meals | Frozen pizza or pasta meal | barcode |  |  |
| 16 | Frozen meals | Frozen snack item | manual |  |  |
| 17 | Processed meat | Sausage or deli meat | barcode |  |  |
| 18 | Processed meat | Nuggets or meat patties | camera_barcode |  |  |
| 19 | Dairy / egg products | Flavored milk or yogurt drink | barcode |  |  |
| 20 | Dairy / egg products | Dessert with dairy stabilisers | ocr |  |  |
| 21 | Baby / kids foods | Rice puff snack | barcode |  |  |
| 22 | Baby / kids foods | Baby puree pouch | manual |  |  |
| 23 | Seafood | Tuna or fish fingers | barcode |  |  |
| 24 | Seafood | Breaded frozen seafood | manual |  |  |
| 25 | Bottled water | PET bottled water | barcode |  |  |
| 26 | Bottled water | Flavored bottled water | manual |  |  |
| 27 | Chocolate / cocoa products | Dark chocolate | barcode |  |  |
| 28 | Chocolate / cocoa products | Cocoa drink mix | ocr |  |  |
| 29 | Imported products | Imported drink or snack | barcode |  |  |
| 30 | Imported products | Imported candy or sauce with E-numbers | manual |  |  |
