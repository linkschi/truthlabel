import { readFile } from "node:fs/promises";
import path from "node:path";

const allowedFiles = new Set([
  "truthlabel-logo.svg",
  "truthlabel-logo.png",
  "truthlabel-mark.svg",
  "truthlabel-mark.png",
  "truthlabel-icon.svg",
  "truthlabel-icon.png",
  "truthlabel-thumbnail.png",
]);

const contentTypes: Record<string, string> = {
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
};

function notFoundResponse() {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ fileName: string }> },
) {
  if (process.env.NODE_ENV === "production") {
    return notFoundResponse();
  }

  const { fileName } = await context.params;

  if (!allowedFiles.has(fileName)) {
    return notFoundResponse();
  }

  const extension = path.extname(fileName);
  const filePath = path.join(process.cwd(), "local-assets", "brand", fileName);
  const file = await readFile(filePath);
  const download = new URL(request.url).searchParams.get("download") === "1";

  return new Response(file, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
    },
  });
}
