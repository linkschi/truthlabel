# Healthy Alternatives - Complete Implementation Spec

Below is the version I'd actually give Codex. It is intentionally specific so Codex implements rather than redesigns.

Build the Healthy Alternatives shopping/discovery experience described below.

The goal is to create a premium, clean, human-centered food alternative experience where users can quickly find better everyday products and understand why each product is recommended.

Do not treat this as a generic ecommerce template. Do not invent additional visual styles or sections unless technically necessary.

---

## 1. Product Purpose

Core promise:

Find healthier alternatives.

The app helps people find better alternatives to everyday food products without forcing them to research ingredient labels themselves.

The experience should feel:

- premium
- calm
- trustworthy
- simple
- intentional
- modern
- human-designed
- easy to use on mobile
- equally polished on desktop

It must NOT feel like:

- an AI dashboard
- a medical application
- a giant supermarket
- an Amazon clone
- a generic SaaS landing page
- a collection of unrelated cards
- a health-scoring spreadsheet

The product itself should remain the visual focus.

---

## 2. Core User Flow

Primary browsing flow:

Homepage -> Search/category -> Product -> Amazon

Alternative flow from another part of the app:

Product scan/result -> Recommended alternatives -> Product -> Amazon

Saved flow:

Product -> Save -> Saved products

The user should be able to understand what the app does within roughly five seconds of opening the homepage.

---

## 3. Visual System

Use one disciplined visual system across the entire feature.

Colors:

Background:

`#F8F8F5`

Main surface:

`#FFFFFF`

Primary text:

`#171917`

Secondary text:

`#686D68`

Muted text:

`#929792`

Primary green:

`#246B4A`

Soft green background:

`#EDF5F0`

Subtle border:

`#E5E7E3`

Image surface:

`#F3F3F0`

Hover surface:

`#F5F6F3`

Do not introduce lots of additional colors.

Red should generally NOT appear in the Healthy Alternatives experience.

This is a positive recommendation environment, not the scan warning interface.

---

## 4. Typography

Use the app's existing professional sans-serif font if one already exists.

Otherwise use:

Inter

Do not mix multiple decorative font families.

Typography hierarchy:

Hero:

44-56px desktop

34-40px mobile

600-700 weight

Page title:

34-44px desktop

28-34px mobile

600-700 weight

Section heading:

24-30px

600 weight

Product title:

18-22px

600 weight

Body:

15-17px

400-500 weight

Metadata:

13-14px

400-500 weight

Headings should have tight but natural line-height.

Body copy should have generous readable line-height.

Avoid excessive bold text.

---

## 5. Spacing

Spacing must be highly consistent.

Use an 8px-based spacing system.

Typical values:

- 4px
- 8px
- 12px
- 16px
- 24px
- 32px
- 48px
- 64px
- 80px

Mobile page gutters:

16-20px

Tablet:

24-32px

Desktop:

Maximum content width approximately:

1180-1240px

Center the content.

Large sections should have generous vertical breathing room.

Do not put every piece of content inside a card.

---

## 6. Corner Radius

Use consistent radius values.

Small controls:

10-12px

Product cards:

16px

Large image containers:

18-20px

Large content surfaces:

18px

Avoid excessive pill shapes.

Pills are reserved primarily for recommendation tags.

---

## 7. Shadows

Use shadows sparingly.

Product cards should primarily rely on:

- spacing
- subtle border
- background contrast

If a shadow is necessary, use an extremely subtle one.

No glowing cards.

No floating neon effects.

No heavy drop shadows.

---

## 8. Animation

Animations should make interactions feel polished, not flashy.

Allowed:

- 150-220ms hover transitions
- small card lift of about 1-2px
- image fade-in
- skeleton loading transitions
- subtle button feedback
- horizontal carousel snapping

Do NOT use:

- bouncing sections
- glowing buttons
- floating icons
- constant animation
- large entrance animations
- parallax

---

## 9. Header

Create a minimal global header.

Desktop:

Logo                              Search     Saved     Profile

Mobile:

Logo                                  Saved/Profile

The homepage already contains a large primary search field, so do not clutter the mobile header with another large input.

Header behavior:

- sticky
- subtle background blur only if appropriate
- thin bottom border appears when scrolling
- approximately 64-72px height
- never visually dominate the page

---

## 10. Mobile Bottom Navigation

If the app already uses bottom navigation, integrate into it.

Recommended destinations:

- Home
- Explore
- Saved
- Profile

Do not create more than four main destinations for this feature.

---

## 11. Homepage

The homepage is recommendation-first.

It should NOT start with a giant marketing illustration.

The products and search functionality are the hero.

---

## 12. Homepage Hero

Desktop layout should be centered and spacious.

Mobile should remain compact.

Copy:

Find healthier alternatives.

Supporting text:

Better everyday products, carefully selected to make shopping simpler.

Do not add exaggerated language such as:

- transform your health
- unlock a better you
- revolutionize your wellness
- AI-powered nutrition
- supercharge your lifestyle

Below the copy place the primary search input.

Placeholder:

Search a product, brand, or category

Search icon on left.

Clear button appears on right when typing.

Desktop maximum search width approximately 680px.

Search results should start appearing after 2 characters.

---

## 13. Search Logic

Search these fields:

- productName
- brand
- category
- subcategory
- productType
- recommendationTags
- dietaryTags

Normalize:

- lowercase
- punctuation
- apostrophes
- extra spaces

Ranking priority:

1. Exact product-name match
2. Product name begins with query
3. Product name contains query
4. Exact brand match
5. Product type match
6. Subcategory match
7. Category match
8. Tag match

Maximum autocomplete results:

6

Each suggestion shows:

- small product image
- product name
- brand
- category

Clicking the result opens the product page.

If the query represents a category such as:

- chips
- bread
- milk
- cereal
- salmon

provide:

View all [category] alternatives

---

## 14. Empty Search

Never show an empty blank page.

Use:

No alternatives found yet

Supporting copy:

Try another product, brand, or category. We're continuing to expand the catalog.

Then show:

Browse categories

Do not invent fake products.

---

## 15. Shop By Category

Heading:

Shop by category

The official 15 categories are:

1. Bread & Bakery
2. Breakfast
3. Dairy
4. Eggs
5. Meat
6. Seafood
7. Snacks
8. Drinks
9. Sauces & Condiments
10. Frozen Foods
11. Rice & Pasta
12. Cooking Oils
13. Chocolate & Sweets
14. Baby & Kids Foods
15. Plant-Based Alternatives

Homepage:

Show approximately 8 categories initially.

Then:

View all categories ->

Do not place 15 enormous category cards above the fold.

---

## 16. Category Card Design

Cards should feel editorial rather than like app-dashboard widgets.

Each contains:

- category image or subtle icon
- category name
- small product count if available

Example:

[image]

Snacks

24 better options

Use high-quality food photography where available.

Avoid random emojis.

If photography is unavailable, use a simple consistent icon system.

---

## 17. Better Everyday Choices

After categories:

Better everyday choices

This is a curated product rail.

Desktop:

4 products visible.

Mobile:

approximately 1.5 products visible to signal horizontal scrolling.

Use CSS scroll snapping.

Do not automatically move the carousel.

Users control it.

---

## 18. Product Card

The card must remain visually restrained.

Structure:

IMAGE

Brand

Product name

Reason/tag

Reason/tag

View product ->

Example:

[product image]

Pacha

Buckwheat Sourdough

Simple ingredients

Seed oil free

View product ->

Rules:

Maximum visible recommendation tags:

2

If more exist, do NOT show all of them on the card.

Do not show giant numerical health scores on cards.

Do not show ingredient paragraphs.

Do not show more than approximately two lines of product name.

Image area should have a fixed ratio and use:

object-fit: contain

Never crop off product packaging.

---

## 19. Product Card Interaction

Entire card is clickable.

Hover on desktop:

- border becomes slightly darker
- image can scale approximately 1.01-1.02
- card moves upward 1-2px

Nothing dramatic.

Saved-heart button should remain independently clickable.

---

## 20. Popular Swaps

Create a section:

Popular swaps

This is important because the app is about alternatives rather than generic shopping.

Use simple rows or editorial tiles.

Examples:

Potato chips

Find better options ->

Breakfast cereal

Find better options ->

Deli meat

Find better options ->

Cooking oils

Find better options ->

Soda

Find better options ->

Selecting one opens the relevant search/category page.

This data should come from configuration, not hardcoded UI markup.

---

## 21. Trust / Explanation Section

Keep this small.

Heading:

You shouldn't need to research every label.

Copy:

We look at product information and ingredients to help surface better everyday alternatives.

Three short points:

Simple information

Understand why a product was selected.

Curated choices

We prioritize useful everyday alternatives.

Easy shopping

Find an option and continue to the retailer.

Do not turn this into a huge marketing section.

---

## 22. Category / Explore Page

Build a reusable results page.

Header:

Bread & Bakery

Better options for everyday breads, buns, wraps and bakery staples.

Underneath:

Search within category.

Then optional lightweight filter button.

Then products.

Desktop:

3-4 column grid.

Tablet:

2-3 columns.

Mobile:

2 columns where comfortable.

For narrow phones use a visually spacious 2-column layout, not tiny compressed cards.

---

## 23. Filters

Do not launch with dozens of filters.

Initial filters:

- Best Overall
- Simple Ingredients
- Seed Oil Free
- Organic
- No Artificial Colors
- No Artificial Sweeteners
- Non-GMO
- Lower Sugar
- Lower Sodium
- Wild Caught
- Grass Fed

Only show filters that actually exist within the current category.

Filters are additive OR filters inside one group.

Example:

Selecting:

Seed Oil Free

Organic

shows products matching either selected recommendation preference unless later product strategy specifically requires AND filtering.

Always show:

Clear filters

---

## 24. Sorting

Default:

Recommended

Other optional sorting:

A-Z

Newest

Do NOT implement:

- fake popularity
- fake trending
- fake sales ranking
- price sorting without live pricing

---

## 25. Product Detail Page

This is the most important page.

The page should answer quickly:

1. What product is this?
2. Why is it recommended?
3. Where can I buy it?

---

## 26. Product Page - Desktop

Use approximately a 45/55 split hero.

Left:

Large product image/gallery.

Right:

breadcrumb

brand

product name

short recommendation tags

short description

primary retailer CTA

save button

Do not put the entire page inside one giant card.

---

## 27. Product Page - Mobile

Order:

Back

Save

Product image

Category breadcrumb

Brand

Product title

Recommendation tags

Short description

Why we recommend it

Primary Amazon CTA

Key facts

Ingredients

Good to know

Similar alternatives

Keep the primary action easy to reach.

---

## 28. Product Image Gallery

Primary image should be large.

Background:

soft neutral.

Image behavior:

object-fit: contain;

If multiple gallery images exist:

Desktop:

small thumbnails below or beside image.

Mobile:

swipeable gallery.

Use dots only if useful.

Do not auto-rotate.

Image fallback:

Use a neutral product placeholder with the product name.

Never show broken-image icons.

Lazy-load non-primary images.

---

## 29. Product Identity Area

Display:

Bread & Bakery > Bread

Pacha

PACHA Organic Buckwheat
Sourdough Bread

Brand is smaller and muted.

Product name is visually dominant.

---

## 30. Recommendation Tags

Examples:

- Best Overall
- Simple Ingredients
- Seed Oil Free
- Organic
- Grass Fed
- Wild Caught
- Non-GMO
- No Artificial Colors
- Lower Sugar
- Lower Sodium
- Budget Pick
- Premium Pick
- Kids Pick

Product page maximum visible tags initially:

4

If more exist:

+2 more

Do not create a wall of badges.

Tags use soft neutral/green backgrounds.

---

## 31. Short Description

Maximum approximately:

2-3 sentences

Example:

A simple gluten-free sourdough made with a short ingredient list. A strong everyday option for shoppers looking to avoid seed oils.

Avoid claims such as:

- healthiest bread
- guaranteed healthier
- prevents disease
- detoxifying
- medically superior

Descriptions should explain the product, not sell miracles.

---

## 32. Why We Recommend It

This should be one of the most prominent sections.

Heading:

Why we recommend it

Example:

Selected for its short ingredient list, simple formulation, and lack of seed oils.

Below it display up to three quick facts:

2 ingredients

Seed oil free

Gluten free

This content comes from product data.

Codex must NOT invent recommendation reasons.

---

## 33. Buy Button

Primary CTA:

View on Amazon

Use:

affiliateUrl

when available.

Otherwise fallback to:

amazon.url

If neither exists:

Do not render a dead button.

Instead show:

Retailer link currently unavailable

Open external retailer links safely.

Use appropriate:

rel="sponsored noopener noreferrer"

when affiliate links are involved.

Do not expose Scout affiliate tags.

Affiliate links must belong to the new app's affiliate configuration.

---

## 34. Affiliate Disclosure

Near the CTA or footer use subtle copy:

We may earn a commission from qualifying purchases at no additional cost to you.

Do not make this visually aggressive, but do not hide it.

---

## 35. Do Not Display Static Amazon Prices

Unless the app has a live approved pricing source, do not hardcode Amazon prices.

Prices change.

If no live price integration exists, simply show:

View on Amazon

This prevents stale or misleading information.

---

## 36. Key Facts

Create a compact facts row/card.

Only show facts with actual data.

Possible examples:

2 ingredients

13 oz

Seed oil free

Group 1

Minimally processed

Never show placeholders like:

Processing: Unknown

Ingredient count: N/A

Hide unavailable information.

---

## 37. Ingredients Section

Heading:

Ingredients

Display ingredient list cleanly.

For short lists:

Sprouted buckwheat

Sea salt

For long lists:

Show first portion with:

Show all ingredients

Do not overwhelm the initial page.

If ingredients are unavailable:

Ingredients

Full ingredient information is not currently available. Check the product label before purchase.

Do not invent ingredients.

---

## 38. Good To Know

Heading:

Good to know

Use this for balanced information.

Examples:

- Short ingredient list
- No seed oils
- No artificial colors

Potential neutral note:

This is still a packaged processed food.

The purpose is trust.

Recommended products do not have to be presented as perfect.

---

## 39. Why It's A Better Alternative

Optional section when data exists.

Heading:

Why it's a better alternative

Example:

Compared with many conventional packaged breads:

Fewer ingredients

No seed oils

No artificial preservatives

This must be driven by supplied product metadata.

Codex should not calculate medical or nutritional superiority.

---

## 40. Similar Alternatives

Heading:

More good options

Algorithm:

1. Exclude the current product.
2. Search same "subcategory".
3. Prefer same "productType".
4. Prefer products sharing recommendation tags.
5. Sort using "selection.rank".
6. Return maximum 4.
7. If fewer than 4 exist, fill remaining slots using products from the parent category.
8. Never show duplicate products.

Mobile:

horizontal rail.

Desktop:

3-4 card row.

Below:

See all [subcategory] alternatives ->

---

## 41. Saved Products

Heart icon appears:

- product cards
- product detail page

MVP persistence:

Use existing user account storage if available.

If no account system exists yet:

Use localStorage.

Key:

savedAlternativeProductIds

Do not duplicate entire product objects in localStorage.

Store IDs only.

Saved page:

Saved alternatives

If empty:

Nothing saved yet

Save products you want to come back to later.

Button:

Explore alternatives

---

## 42. Product Data Contract

Codex should consume product records in approximately this form:

```json
{
  "id": "pacha-buckwheat-sourdough",
  "slug": "pacha-organic-buckwheat-sourdough",
  "productName": "PACHA Organic & Gluten Free Buckwheat Sourdough Bread",
  "brand": "Pacha",
  "category": "Bread & Bakery",
  "subcategory": "Bread",
  "productType": "Sourdough Bread",
  "shortDescription": "A simple gluten-free sourdough made with a short ingredient list and no seed oils.",
  "whyRecommended": "Selected for its short ingredient list and simple formulation.",
  "recommendationTags": [
    "Best Overall",
    "Simple Ingredients",
    "Seed Oil Free",
    "Gluten Free"
  ],
  "ingredients": [
    "Sprouted buckwheat",
    "Sea salt"
  ],
  "ingredientCount": 2,
  "processingLevel": {
    "group": 3,
    "label": "Processed"
  },
  "keyBenefits": [
    "Short ingredient list",
    "No seed oils",
    "Gluten free"
  ],
  "thingsToKnow": [
    "Packaged processed food"
  ],
  "dietaryTags": [
    "Gluten Free"
  ],
  "packageSize": "13 oz",
  "amazon": {
    "asin": "B0C2J6FN6Z",
    "url": "https://www.amazon.com/dp/B0C2J6FN6Z",
    "affiliateUrl": null
  },
  "images": {
    "primary": "",
    "gallery": []
  },
  "source": {
    "sourceUrl": "",
    "sourceScore": null
  },
  "selection": {
    "recommended": true,
    "rank": 1,
    "reason": "Strong everyday bread alternative."
  }
}
```

---

## 43. Important Data Rule

The UI must be fully data-driven.

Do NOT hardcode individual products into components.

All cards/pages should render from product objects.

Adding new products later should require:

adding product data only

not rewriting UI.

---

## 44. Category Configuration

Create a separate category configuration.

Example:

```json
{
  "id": "bread-bakery",
  "name": "Bread & Bakery",
  "slug": "bread-bakery",
  "description": "Better options for breads, wraps and everyday bakery staples.",
  "order": 1
}
```

Keep visual category configuration separate from individual products.

---

## 45. Popular Swaps Configuration

Do the same for swaps.

Example:

```json
{
  "title": "Potato chips",
  "subtitle": "Find better chip options",
  "destination": "/explore/snacks?type=chips"
}
```

Do not hardcode swap cards individually throughout the UI.

---

## 46. Missing Data Rules

Codex must gracefully handle incomplete records.

If no image:

Use placeholder.

If no ingredients:

Show ingredient-unavailable message.

If no processing level:

Hide section.

If no Amazon URL:

Hide CTA and show unavailable state.

If no recommendation tags:

Do not show empty tag container.

If no "thingsToKnow":

Hide section.

If no gallery:

Show primary image only.

The interface must never expose:

- null
- undefined
- N/A
- []

to users.

---

## 47. Loading States

Use skeleton components.

Homepage:

- category skeletons
- product-card skeletons

Product page:

- image skeleton
- product text skeleton
- CTA skeleton

Skeletons should match final layout dimensions.

Avoid generic spinning loaders for page-level content.

---

## 48. Error States

If product lookup fails:

Product unavailable

We couldn't load this product right now.

Buttons:

Try again

Browse alternatives

If search data fails:

Keep category navigation usable where possible.

Do not crash the entire page because one product request fails.

---

## 49. Image Failure

Use "onError".

Replace broken image with neutral placeholder.

Do not repeatedly retry an invalid image URL.

---

## 50. URL Structure

Recommended:

- /
- /explore
- /explore/bread-bakery
- /explore/snacks
- /product/pacha-organic-buckwheat-sourdough
- /saved

Use readable slugs.

Do not expose internal database IDs in URLs unless necessary.

---

## 51. Browser History

Search/category/filter navigation should behave normally with browser back.

Do not create a SPA interaction where Back unexpectedly throws the user to the homepage.

Preserve:

- search query
- selected category
- filters
- scroll position where practical

---

## 52. Mobile Buy Experience

On product detail mobile, once the user scrolls past the main CTA, allow a subtle sticky bottom CTA:

View on Amazon ->

Height approximately 60-68px.

Do not show this immediately on page load if it duplicates the visible hero CTA.

Only activate after scrolling beyond the original button.

---

## 53. Accessibility

Minimum standards:

- semantic headings
- keyboard navigation
- visible focus states
- descriptive button labels
- product image alt text
- sufficient contrast
- no information communicated only through color
- tap targets at least approximately 44px
- respect "prefers-reduced-motion"

Heart buttons must have labels like:

Save PACHA Buckwheat Sourdough

not simply:

heart button

---

## 54. Performance

This is product-image heavy.

Implement:

- lazy loading
- responsive image sizing
- image dimensions to prevent layout shift
- avoid loading full galleries on homepage
- defer below-fold sections
- memoize/filter product arrays where appropriate
- avoid huge client-side bundles

Primary homepage content should feel immediate.

---

## 55. Search Performance

Do not repeatedly perform expensive full-array work on every render.

Build normalized searchable strings once when product data loads.

Debounce search:

approximately:

120-180ms

For the expected initial catalog size, local search is sufficient.

Architecture should allow server/API search later without redesigning the UI.

---

## 56. Analytics Events

If analytics infrastructure already exists, add:

- alternatives_home_view
- alternatives_search
- alternatives_category_open
- alternative_product_view
- alternative_save
- alternative_unsave
- alternative_amazon_click
- alternative_filter_used
- alternative_similar_product_click

Do not block user interactions waiting for analytics.

---

## 57. External Retailer Tracking

For Amazon clicks include internally:

- productId
- category
- subcategory
- productType
- sourceLocation

"sourceLocation" examples:

- homepage
- search
- category
- product_page
- similar_products
- scan_result

This will later show which recommendation placements actually work.

---

## 58. Disclaimer

Footer/product area should contain concise wording such as:

Product information may change. Always check the current package label for the most accurate ingredient and allergen information. Recommendations are informational and are not medical advice.

Do not cover every page in disclaimers.

Keep them accessible but visually secondary.

---

## 59. Human-Centered Copy Rules

Copy must sound like a person made deliberate choices.

Use:

- Why we recommend it
- Good to know
- More good options
- Find better options
- Simple ingredients
- View on Amazon

Avoid:

- Optimize your nutrition journey
- AI-powered wellness
- Unlock healthier living
- Discover smarter consumption
- Revolutionary clean eating

Do not over-explain obvious actions.

---

## 60. Do Not Over-Design

Explicitly avoid these patterns:

- gradient backgrounds everywhere
- giant colored blobs
- excessive icons
- every section inside a card
- giant score circles
- 10+ badges per product
- glassmorphism
- unnecessary charts
- animated statistics
- huge testimonial sections
- emoji-heavy interfaces
- excessive green checkmarks
- random illustration styles
- multiple unrelated card designs
- excessive rounded pills
- dense dashboards

The restraint is intentional.

---

## 61. Important Design Principle

The site should feel as though one experienced product designer made every decision.

That means:

- one spacing system
- one color system
- one typography system
- one card system
- one image style
- one button system
- one tag system
- one interaction pattern

Do not redesign individual sections independently.

---

## 62. Component Architecture

Reuse components instead of duplicating markup.

Create equivalents of:

- AlternativesHeader
- AlternativesSearch
- CategoryTile
- AlternativeProductCard
- RecommendationTag
- AlternativeProductGrid
- ProductImageGallery
- WhyRecommended
- IngredientList
- ProductFacts
- GoodToKnow
- AmazonCTA
- SimilarAlternatives
- SaveButton
- EmptyState
- ProductCardSkeleton
- CategorySkeleton

Adapt naming to the existing codebase.

Do not introduce a new framework if the current application already has one.

---

## 63. Product Card Must Be Reused

The same core product card should power:

- homepage recommendations
- category results
- search results
- saved products
- similar alternatives

Allow small layout variants, but keep visual identity consistent.

---

## 64. Scanner Integration Preparation

Do not build complex recommendation AI yet.

Prepare product objects to optionally support:

```json
{
  "alternativeForMarkers": [
    "seedOils",
    "artificialColors",
    "phosphates"
  ],
  "replaces": [
    "potato-chips",
    "packaged-snacks"
  ]
}
```

Later the scanner can pass detected markers and retrieve relevant alternatives.

Do not make this mandatory for the current shop to work.

---

## 65. Future Recommendation Matching

When scanner integration is added:

1. Identify scanned product category/product type.
2. Identify flagged markers.
3. Find alternatives with matching "alternativeForMarkers".
4. Prefer same product type.
5. Exclude scanned product.
6. Sort using curated ranking.
7. Return 3-5 alternatives.

Do NOT allow an AI model to arbitrarily decide which products are healthier at runtime.

Recommendations should come from curated product data.

---

## 66. Product Selection Philosophy

The alternatives catalog is curated.

The UI should communicate:

Here are several strong options.

Not:

This is objectively the healthiest product in existence.

Multiple options can be valid for different reasons:

- Best Overall
- Simple Ingredients
- Organic
- Budget Pick
- Premium Pick
- Lower Sugar
- Seed Oil Free

---

## 67. Homepage Content Order

Use this exact overall hierarchy unless an existing layout constraint requires otherwise:

Header

Hero

Search

Shop by category

Better everyday choices

Popular swaps

Why this exists / trust explanation

Final search CTA

Footer

Do not add six additional marketing sections.

---

## 68. Product Page Content Order

Use:

Header/back

Product image/gallery

Category + brand + product name

Recommendation tags

Short description

Primary Amazon CTA

Why we recommend it

Key facts

Ingredients

Good to know

Why it's a better alternative
(if data exists)

More good options

Disclaimer/footer

---

## 69. Final Homepage Feel

The first viewport should approximately feel like:

```text
LOGO                                   Saved


Find healthier alternatives.

Better everyday products,
carefully selected to make
shopping simpler.

[ Search a product, brand, or category ]


Shop by category

[Bread]       [Breakfast]
[Dairy]       [Snacks]
```

It should feel calm.

Do not try to fill every empty space.

Whitespace is part of the design.

---

## 70. Final Product Page Feel

Approximately:

```text
<- Bread & Bakery                         Save


          [ LARGE PRODUCT IMAGE ]


Pacha

PACHA Organic Buckwheat
Sourdough Bread

[Simple Ingredients] [Seed Oil Free]


A simple sourdough made with
a short ingredient list and
no seed oils.


[ View on Amazon -> ]


WHY WE RECOMMEND IT

Selected for its short ingredient
list and simple formulation.

2 ingredients
Seed oil free
Gluten free


INGREDIENTS

Sprouted buckwheat
Sea salt


GOOD TO KNOW

- Short ingredient list
- No artificial colors
- No seed oils


MORE GOOD OPTIONS

[product] [product] [product]
```

---

## 71. Build Order

Implement in this order:

1. Design tokens / global styles
2. Product data types/schema
3. Category configuration
4. Product card
5. Search component
6. Homepage
7. Explore/category page
8. Product detail page
9. Saved products
10. Similar-product logic
11. Loading/error/empty states
12. Responsive polish
13. Accessibility pass
14. Analytics hooks
15. Final visual QA

Do not import hundreds of products until the shell looks correct with a small set of representative demo products.

Use approximately 8-12 demo records covering:

- simple product
- long ingredient product
- missing ingredient data
- multiple images
- one image
- missing Amazon link
- many tags
- few tags
- different categories

Once every layout state works, replace demo data with the real alternatives JSON.

---

## 72. Acceptance Criteria

The implementation is complete only when:

- Homepage clearly communicates "Find healthier alternatives."
- Search works on mobile and desktop.
- All 15 categories are supported.
- Products render entirely from data.
- Product cards are visually consistent everywhere.
- Cards never show more than two recommendation tags.
- Product pages never expose null/undefined data.
- Broken images have graceful fallback.
- Missing ingredients have a proper message.
- Amazon CTA uses affiliate URL when provided.
- Static Amazon prices are not displayed.
- Saved products persist.
- Similar products exclude the current product.
- Similar products prioritize same subcategory/product type.
- Mobile layout feels intentionally designed, not compressed desktop.
- Desktop layout does not become excessively wide.
- Keyboard navigation works.
- Reduced-motion preference is respected.
- Loading states use skeletons.
- Search/category empty states are useful.
- The interface does not look like an AI-generated dashboard.
- The visual system remains restrained and consistent.
- Product photography remains the main visual element.
- No unnecessary sections have been added.

---

## Final Instruction

Do not reinterpret this into a different design concept.

Implement this design system and behavior faithfully using the application's existing architecture.

Prioritize:

clarity -> usability -> consistency -> polish -> speed

over decorative complexity.

The finished experience should feel like a thoughtfully designed premium consumer product whose purpose is immediately obvious:

Find healthier alternatives.

That is the shell I'd build before importing the large alternatives catalog. Once this is working and visually polished, we can feed Codex the product JSON without asking it to redesign anything.
