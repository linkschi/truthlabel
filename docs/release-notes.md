# Release Notes

## Version

MVP Launch Candidate

## Major features included

- Manual ingredient scan
- Barcode lookup
- Camera barcode scan
- OCR ingredient label scan with editable review
- Ingredient intelligence matcher and category summaries
- Exposure Risk scoring
- Allergy profile and local settings
- External recall and safety lookup
- Result page confidence notes
- Tester feedback report

## Major bugs fixed

- Added a tester-only report flow for wrong matches, OCR issues, barcode issues, and confusing wording
- Added a copyable feedback report with scan context, warnings, score, and build info
- Added regression coverage for nutritional yeast, soy-free, and oil-free false-positive cases
- Added wording-guard coverage for allergy and recall messaging

## Known limitations

- Product database data may be incomplete
- OCR can misread labels
- External safety data depends on available official records
- Missing data is not proof of absence
- InsideIt is not medical advice
- Allergy users should always check product packaging

## Testing completed

- Typecheck, lint, full test suite, and production build passed
- Automated coverage exists for manual scan, barcode lookup, OCR flow, camera barcode flow, matcher logic, scoring, and external safety behavior
- Real-device iPhone Safari and Android Chrome validation still needs completion

## Not included yet

- Better Options
- affiliates
- product recommendations
- user accounts
- saved scan history
- advanced nutrition analysis
- native app packaging

## Next recommended phase

- Run the launch candidate through the real-product checklist with controlled testers
- Review incoming feedback reports
- Fix only real, repeated launch issues before wider rollout
