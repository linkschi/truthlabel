import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

async function readPngDimensions(fileName: string) {
  const file = await readFile(path.join(process.cwd(), "public", fileName));

  assert.equal(file.toString("ascii", 1, 4), "PNG");
  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
  };
}

test("PWA icons include the required Android and Apple dimensions", async () => {
  assert.deepEqual(await readPngDimensions("icon-192x192.png"), {
    width: 192,
    height: 192,
  });
  assert.deepEqual(await readPngDimensions("icon-512x512.png"), {
    width: 512,
    height: 512,
  });
  assert.deepEqual(await readPngDimensions("icon-maskable-512x512.png"), {
    width: 512,
    height: 512,
  });
  assert.deepEqual(await readPngDimensions("apple-touch-icon.png"), {
    width: 180,
    height: 180,
  });
});

test("service worker excludes API routes and provides an offline fallback", async () => {
  const serviceWorker = await readFile(
    path.join(process.cwd(), "public", "sw.js"),
    "utf8",
  );
  const offlinePage = await readFile(
    path.join(process.cwd(), "public", "offline.html"),
    "utf8",
  );

  assert.match(serviceWorker, /pathname\.startsWith\("\/api\/"\)/);
  assert.match(serviceWorker, /request\.mode === "navigate"/);
  assert.match(serviceWorker, /offline\.html/);
  assert.match(offlinePage, /needs an internet connection/i);
  assert.match(offlinePage, /Missing live data is not treated as proof/i);
});
