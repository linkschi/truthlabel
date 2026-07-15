# InsideIt MVP

InsideIt is a mobile-first Next.js app that helps people scan food products and review ingredient-label signals, barcode product data, OCR-extracted labels, and official recall-style safety signals in one place.

## What InsideIt does

- Manual ingredient scans for pasted label text
- Barcode lookup with Open Food Facts
- Camera barcode scanning in supported browsers
- OCR ingredient-label scanning with local browser OCR
- Rule-based ingredient intelligence and category summaries
- Optional external safety lookup for official recall and safety signals
- Demo products for QA, design review, and onboarding

InsideIt helps explain ingredient labels and safety signals. It is not medical advice. Always check the product label, especially for allergies.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- `@zxing/browser` for barcode scanning
- `tesseract.js` for local OCR

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local` if you want to override defaults.

InsideIt MVP currently does not require private API keys for core scanning.

### Public config

- `NEXT_PUBLIC_DEPLOYMENT_URL`
  Use the deployed app URL for metadata when available.
- `NEXT_PUBLIC_APP_VERSION`
  Optional public version label for MVP testing reports.
- `NEXT_PUBLIC_BUILD_DATE`
  Optional public build-date label for MVP testing reports.
- `NEXT_PUBLIC_DEFAULT_REGION`
  Default region label for MVP builds.
- `NEXT_PUBLIC_OPEN_FOOD_FACTS_API_BASE_URL`
  Public product-database base URL. Defaults to Open Food Facts.
- `NEXT_PUBLIC_EXTERNAL_SAFETY_ROUTE_PATH`
  Client route used for external safety lookups.
- `NEXT_PUBLIC_OCR_LANGUAGE`
  OCR language code for local label scanning.

### Feature flags

- `NEXT_PUBLIC_ENABLE_BARCODE_LOOKUP`
- `NEXT_PUBLIC_ENABLE_CAMERA_BARCODE_SCAN`
- `NEXT_PUBLIC_ENABLE_OCR_SCAN`
- `NEXT_PUBLIC_ENABLE_EXTERNAL_SAFETY_LOOKUP`
- `NEXT_PUBLIC_ENABLE_DEMO_PRODUCTS`
- `NEXT_PUBLIC_ENABLE_TEST_FEEDBACK`
- `NEXT_PUBLIC_ENABLE_DEBUG_OUTPUT`

`NEXT_PUBLIC_ENABLE_DEBUG_OUTPUT` should stay `false` in production.

## MVP behavior and trust notes

- OCR runs locally in the browser and can make mistakes. Users should review extracted text before scanning.
- Barcode product data may be incomplete or user-submitted. Always check the package label if something looks missing.
- Recall and safety checks depend on available official data. Missing data is not proof of absence.
- Allergy profile matching helps surface likely conflicts, but allergy users should always check the package label themselves.
- Camera access is only used to read barcodes. Allergy profile data is stored locally on the device for MVP testing.

## Known limitations

- Product database data may be incomplete.
- OCR can misread labels.
- External safety checks depend on available official data and match confidence.
- Missing data is not proof of absence.
- InsideIt is not medical advice.
- Allergy users should always check the package label.
- Some browser/device combinations may not support camera barcode scan or OCR equally well.

## Deployment notes

InsideIt is currently best suited to a standard Node-capable Next.js deployment.

Recommended platform:

- Vercel for the simplest MVP deployment and App Router support

Also viable:

- Render
- Railway
- Docker-based Node hosting

### Build for production

```bash
npm run build
npm run start
```

### Safe production defaults

- Keep debug output off
- Keep external safety lookup optional and failure-safe
- Keep demo products enabled for QA unless you want a tighter pilot build
- Review feature flags before each deployment

## Real-world testing checklist

- Test manual ingredient scans on phone-sized screens
- Test barcode typing and camera barcode scanning on real devices
- Test OCR with real labels in good and bad lighting
- Test saved allergy-profile behavior
- Test at least one clean product, one additive-heavy product, one allergy match, and one missing-data barcode record
