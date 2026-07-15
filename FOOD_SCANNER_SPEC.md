# Inside It Food Scanner Spec

## Working Name

- Current app name: `insideit`
- Future rename possible: `Truth Label`

## Project Concept

This is a mobile-first food scanner web app/PWA. Users will eventually scan or enter a food barcode, pull product data, list ingredients and nutrients, color-code concerns, tap items for short explanations, check allergies and avoid-list items, and get an overall concern result.

For Phase 1, the app must not connect to real barcode scanning or product APIs. It uses fake product data to build and test the UI shell.

## Core Rules

- Do not build product recommendations.
- Do not build affiliate links.
- Do not build a full AI assistant.
- Do not build native app features yet.
- Build the fake-data UI shell first.

## Color System

- Green = low/normal concern
- Yellow = review/medium concern
- Red = serious warning

Red only appears for:

- allergy match
- serious banned/restricted ingredient
- extremely high content level

## Phase 1 Requirements

### Home Screen

Create a mobile-first app layout that feels like a clean phone app.

Include:

- app name placeholder
- tagline: "Scan before you trust it."
- main action buttons:
  - Scan Barcode
  - Enter Barcode
  - Search Product

For Phase 1, buttons may lead to the fake product result page or placeholder states.

### Allergy Concerns Section

Title:

- "Tell us what to watch for"

Allergy options:

- Milk
- Egg
- Peanuts
- Tree nuts
- Wheat / gluten
- Soy
- Fish
- Shellfish
- Sesame

Avoid-list options:

- Artificial colours
- Artificial sweeteners
- Preservatives
- High sugar
- High sodium
- Palm oil

For Phase 1:

- Store selected allergy and avoid-list items in local state or localStorage.
- Show selected items clearly.
- No backend yet.

### Fake Product Result Page

Use fake product data:

- Product name: Chocolate Cereal Bar
- Brand: Example Foods
- Barcode: 123456789
- Image placeholder

Fake ingredients:

- Sugar - yellow/review
- Wheat flour - green/normal
- Milk powder - red/allergy warning
- Soy lecithin - yellow/review
- Red No. 3 - red/regulatory watch
- Natural flavouring - green/normal

Fake nutrients:

- Sugar: 32g - red/very high
- Sodium: medium - yellow/review
- Saturated fat: low - green
- Protein: normal - green
- Fibre: low - yellow/review

### Phase 1 UI Behavior

- Every ingredient and nutrient is tappable.
- Each item shows a green, yellow, or red dot.
- Normal pop-up shows:
  - Name
  - What it is
  - Why it is used / what it does
  - Concern level
- Warning pop-up shows:
  - Name
  - What it is
  - Why it was flagged
  - What it means
  - What to do
- Pop-up must:
  - open on tap
  - have a clear X close button
  - close when tapping outside
  - stay short and mobile-friendly

### Immediate Warnings

Show at the top of the fake result page:

- Personal Allergy Warning: Contains milk powder
- Regulatory Watch: Contains Red No. 3
- High Sugar Warning: Sugar level is very high

### Checklist

Create checklist cards for:

- Allergy Match: Yes
- High Content Concern: Yes
- Banned/Restricted Ingredient: Yes
- High-Risk Ingredients: Yes
- Nutrition Concern: Yes

Rules:

- Yes items are highlighted
- Yes items are tappable
- No items stay simple and quiet

### Concern Score

Use:

- Concern Score: 8/10
- Label: High Concern

Never call it "Danger Score".

### Overall Result

Show:

- Overall Result: High Concern
- Based on available label data, this product has multiple concerns.
- Main reasons:
  - Very high sugar
  - Contains milk powder, which may matter for milk allergy users
  - Contains Red No. 3, a flagged ingredient
- Recommendation:
  - Review the highlighted warnings before buying or eating this product.
  - Avoid this product if you are allergic to milk.

## Project Structure Target

```text
src/components/
- HomeScreen.tsx
- AllergyProfile.tsx
- ProductResult.tsx
- IngredientList.tsx
- NutrientList.tsx
- ConcernDot.tsx
- InfoModal.tsx
- Checklist.tsx
- ConcernScore.tsx
- OverallSummary.tsx

src/data/
- fakeProduct.ts
- ingredientDefinitions.ts
- nutrientDefinitions.ts
- warningTemplates.ts
- allergenAliases.ts
- bannedRestricted.ts

src/lib/
- analyzeProduct.ts
- scoring.ts
- summaryEngine.ts
```

## Build Principles

- Keep the code ready for later phases.
- Use reusable components instead of one large page.
- Use fake data first, then replace with real barcode and API data later.
- No product recommendation section in MVP.

## Phase 1 Success Check

The local app should show:

- a clean mobile-first home screen
- allergy and avoid-list selection
- a fake product result page
- ingredients with green/yellow/red dots
- nutrients with green/yellow/red dots
- tap pop-ups for every item
- immediate warning cards
- checklist cards
- concern score
- overall result summary

## Main Checklist We Must Not Forget

- No product recommendations in MVP.
- Green = low/normal.
- Yellow = review.
- Red = serious warning only.
- Red only for allergy, serious banned/restricted item, or extremely high content.
- Every ingredient/nutrient can be tapped.
- Normal tap = short definition.
- Warning tap = definition + why flagged + what to do.
- Checklist No = quiet.
- Checklist Yes = highlighted and tappable.
- Overall summary comes from templates.
- Ingredient/nutrient data comes from stored records.
- Use fake data first, then real barcode data.
