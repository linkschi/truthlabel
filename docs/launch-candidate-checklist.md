# InsideIt Launch Candidate Checklist

- [x] build passes
- [x] tests pass
- [x] lint passes
- [x] typecheck passes
- [x] manual scan works in automated and local verification
- [x] barcode lookup works in automated and local verification
- [x] camera barcode fallback works in automated coverage
- [x] OCR review step works in automated coverage
- [x] allergy profile works in manual, barcode, OCR, and existing demo coverage
- [x] result page renders cleanly in local verification
- [x] external safety lookup fails gracefully
- [x] confidence notes appear
- [x] overclaiming wording is guarded
- [ ] mobile layout checked on real iPhone Safari
- [ ] mobile layout checked on real Android Chrome
- [x] privacy notes present
- [x] known issues documented
- [x] deployment instructions present

## Release gate notes

- The unchecked mobile items do not block a controlled launch candidate review, but they should be completed before a broader public rollout.
- Manual ingredient entry remains available as the fallback path for barcode, camera, and OCR issues.
