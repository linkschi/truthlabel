export async function createCapturedImageThumbnail(
  image: Blob,
  options: { maxSize?: number; quality?: number } = {},
) {
  const maxSize = options.maxSize ?? 360;
  const quality = options.quality ?? 0.72;
  const timeoutMs = 1500;
  let objectUrl = "";

  try {
    if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
      return "";
    }

    objectUrl = URL.createObjectURL(image);

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      const timeout = window.setTimeout(
        () => reject(new Error("Captured image preview timed out.")),
        timeoutMs,
      );
      element.onload = () => {
        window.clearTimeout(timeout);
        resolve(element);
      };
      element.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("Captured image preview failed."));
      };
      element.src = objectUrl;
    });

    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return "";
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return "";
  } finally {
    if (
      objectUrl &&
      typeof URL !== "undefined" &&
      typeof URL.revokeObjectURL === "function"
    ) {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // Preview cleanup should not block camera or OCR recovery.
      }
    }
  }
}
