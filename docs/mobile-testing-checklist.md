# Truthlabel Mobile Testing Checklist

## Scope

This checklist is for real-device MVP validation after local build, lint, typecheck, and automated tests pass.

## Actual coverage completed in this phase

- Local desktop build completed
- Automated scan-flow tests completed
- Automated OCR, barcode, matcher, scoring, and storage fallback tests completed
- Desktop browser layout reviewed during implementation

## Still needs physical-device testing

- iPhone Safari camera barcode scan
- iPhone Safari OCR image upload and review flow
- Android Chrome camera barcode scan
- Android Chrome OCR upload and review flow
- Mobile keyboard overlap on long text inputs
- Mobile scrolling on long result pages

## Device/browser checklist

### iPhone Safari

- [ ] Home page loads cleanly
- [ ] Manual scan page spacing feels readable
- [ ] Camera permission prompt behaves clearly
- [ ] Camera barcode scan opens and closes cleanly
- [ ] OCR upload works from photo library
- [ ] OCR review text area is editable
- [ ] Result page scrolls without clipped sections
- [ ] Feedback report can be copied or manually selected

### Android Chrome

- [ ] Home page loads cleanly
- [ ] Manual scan page spacing feels readable
- [ ] Camera barcode scan works
- [ ] OCR upload works from gallery
- [ ] OCR review flow keeps the confirm button visible
- [ ] Long ingredient lists wrap without overflow
- [ ] Long warning messages remain readable
- [ ] Feedback report can be copied or manually selected

### Desktop Chrome

- [ ] Manual paste scan works
- [ ] Typed barcode lookup works
- [ ] OCR upload works
- [ ] Result page sections expand and collapse correctly
- [ ] Settings save and reset correctly
- [ ] Feedback report preview remains readable

## Layout and interaction checks

- [ ] Small screen width does not clip headings or badges
- [ ] Red/yellow/green badges always include text labels
- [ ] Buttons remain tappable with one thumb
- [ ] Fixed or sticky UI does not cover content
- [ ] Error messages are visible and understandable
- [ ] Loading states do not trap the user

## Camera and OCR checks

- [ ] Camera permission denied message is clear
- [ ] No camera found message is clear
- [ ] Barcode not detected message is clear
- [ ] OCR no-text-detected message suggests manual fallback
- [ ] OCR failed message suggests manual fallback
- [ ] OCR low-confidence note is visible before scanning

## Result page checks

- [ ] Quick Overview makes sense on first read
- [ ] Ingredient Breakdown stays readable on mobile
- [ ] Deep Exposure Checks do not falsely look green when not checked
- [ ] Confidence notes stay visible when needed
- [ ] Feedback panel does not overwhelm the result page

## Settings checks

- [ ] Allergy profile saves locally
- [ ] Saved settings are reused in later scans
- [ ] Local storage unavailable message is readable if triggered
- [ ] Reset settings action is clear

## If a real device is unavailable

Document which flows were only desktop-tested and leave the matching boxes unchecked. Do not mark a camera, OCR, or permission flow as passed without real-device verification.
