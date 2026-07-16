# Truthlabel Known Issues

## 1. Product database ingredient data can be missing

- Issue: Open Food Facts sometimes returns a product record without a usable ingredient list.
- Severity: Medium
- Affected flow: Typed barcode lookup, camera barcode lookup
- Status: Expected limitation
- Workaround: Paste the ingredient list manually.
- Planned fix phase: Post-MVP data-quality improvements

## 2. OCR can misread curved, reflective, or blurry labels

- Issue: OCR accuracy drops with glare, low light, or curved packaging.
- Severity: Medium
- Affected flow: OCR ingredient label scan
- Status: Expected limitation
- Workaround: Retake the photo in better light or paste the label manually.
- Planned fix phase: OCR tuning after user-testing feedback

## 3. External safety lookup depends on official source coverage

- Issue: A product may not return a verified recall or safety match even when users expect one.
- Severity: Medium
- Affected flow: Brand Trust / Safety, Heavy Metals, Microplastics
- Status: Expected limitation
- Workaround: Treat missing data as not checked or clear checked only for the exact sources queried.
- Planned fix phase: Source expansion and matching improvements

## 4. Camera barcode scan depends on browser and device support

- Issue: Some browsers or devices may block camera access or fail to detect barcodes reliably.
- Severity: Medium
- Affected flow: Camera barcode scan
- Status: Expected limitation
- Workaround: Type the barcode or use manual ingredient paste.
- Planned fix phase: Real-device tuning after MVP testing

## 5. Feedback reports are copy-first in MVP

- Issue: Tester feedback is not automatically sent to a backend in the MVP build.
- Severity: Low
- Affected flow: Report an issue
- Status: MVP design choice
- Workaround: Copy the generated report into email, chat, or an issue tracker.
- Planned fix phase: Only if a lightweight feedback backend becomes necessary

## 6. Ingredient intelligence coverage is still expanding

- Issue: Some niche ingredients, regional aliases, or new additives may not be recognized yet.
- Severity: Medium
- Affected flow: Matcher, category summaries, score reasonableness
- Status: Known limitation
- Workaround: Report the missed ingredient with the exact label wording.
- Planned fix phase: Ongoing data-pack expansion

## 7. Low-confidence safety matches are intentionally conservative

- Issue: Broad or weak recall matches may stay yellow or hidden instead of turning red.
- Severity: Low
- Affected flow: External safety lookup
- Status: Intentional safety wording safeguard
- Workaround: Check lot code, region, and official source details manually.
- Planned fix phase: Matching-quality improvements without overclaiming
