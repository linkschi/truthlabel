import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCameraConstraintProfiles,
  chooseBestVideoInputDevice,
  getScannerDiagnostics,
  getSourceRegionFromViewfinder,
  hasValidGtinCheckDigit,
  normalizeProductBarcode,
  scoreVideoInputDevice,
} from "./cameraBarcodeScanner";

function videoDevice(deviceId: string, label: string) {
  return {
    deviceId,
    groupId: "",
    kind: "videoinput",
    label,
    toJSON() {
      return {};
    },
  } as MediaDeviceInfo;
}

test("scoreVideoInputDevice prefers the main rear camera over front or ultra-wide labels", () => {
  const rear = scoreVideoInputDevice(videoDevice("rear-main", "Back Main Camera"));
  const ultraWide = scoreVideoInputDevice(
    videoDevice("rear-ultra", "Back Ultra Wide 0.5x Camera"),
  );
  const front = scoreVideoInputDevice(videoDevice("front", "Front Selfie Camera"));

  assert.equal(rear.isLikelyRear, true);
  assert.equal(front.isLikelyFront, true);
  assert.ok(rear.score > ultraWide.score);
  assert.ok(ultraWide.score > front.score);
});

test("chooseBestVideoInputDevice selects a plausible non-front rear camera", () => {
  const selected = chooseBestVideoInputDevice([
    videoDevice("front", "Front Camera"),
    videoDevice("ultra", "Back Ultra Wide Camera"),
    videoDevice("main", "Back Main Camera"),
  ]);

  assert.equal(selected.selected?.deviceId, "main");
  assert.equal(selected.candidates.length, 3);
});

test("buildCameraConstraintProfiles progressively falls back from high resolution to looser rear constraints", () => {
  const profiles = buildCameraConstraintProfiles("camera-main");

  assert.equal(profiles.length, 4);
  assert.deepEqual((profiles[0].video as MediaTrackConstraints).deviceId, {
    exact: "camera-main",
  });
  assert.deepEqual((profiles[0].video as MediaTrackConstraints).width, {
    ideal: 1920,
  });
  assert.deepEqual((profiles[0].video as MediaTrackConstraints).height, {
    ideal: 1440,
  });
  assert.deepEqual((profiles[2].video as MediaTrackConstraints).width, {
    ideal: 1280,
  });
  assert.equal((profiles[3].video as MediaTrackConstraints).width, undefined);
});

test("normalizeProductBarcode keeps supported numeric product codes and rejects text false positives", () => {
  assert.equal(normalizeProductBarcode(" 0123 4567 8901 2 "), "0123456789012");
  assert.equal(normalizeProductBarcode("0123-4567-8901-2"), "0123456789012");
  assert.equal(normalizeProductBarcode("LOT-ABC-123"), "");
  assert.equal(normalizeProductBarcode("123456"), "");
});

test("hasValidGtinCheckDigit validates common EAN and UPC product barcodes", () => {
  assert.equal(hasValidGtinCheckDigit("3017624010701"), true);
  assert.equal(hasValidGtinCheckDigit("012345678905"), true);
  assert.equal(hasValidGtinCheckDigit("3017624010702"), false);
});

test("getSourceRegionFromViewfinder maps a visible cover-cropped frame into source coordinates", () => {
  const region = getSourceRegionFromViewfinder({
    videoWidth: 1920,
    videoHeight: 1080,
    renderedWidth: 390,
    renderedHeight: 844,
    objectFit: "cover",
    viewfinderRect: {
      x: 30,
      y: 340,
      width: 330,
      height: 110,
    },
  });

  assert.ok(region.width > 400);
  assert.ok(region.height > 120);
  assert.ok(region.x >= 0);
  assert.ok(region.y >= 0);
  assert.ok(region.x + region.width <= 1920);
  assert.ok(region.y + region.height <= 1080);
});

test("getScannerDiagnostics returns safe structured camera data without requiring barcode values", () => {
  const diagnostics = getScannerDiagnostics({
    browser: {
      userAgent: "test-agent",
      platform: "test-platform",
    },
    selectedDeviceId: "camera-main",
    selectedDeviceLabel: "Back Main Camera",
    decoder: {
      inputWidth: 1280,
      inputHeight: 360,
      attempts: 4,
      successes: 1,
      averageDecodeDurationMs: 42,
      lastFormat: "ean_13",
      activeLoops: 0,
    },
  });

  const serialized = JSON.stringify(diagnostics);

  assert.match(serialized, /Back Main Camera/);
  assert.match(serialized, /ean_13/);
  assert.doesNotMatch(serialized, /0123456789012/);
  assert.equal(diagnostics.decoder.inputWidth, 1280);
});
