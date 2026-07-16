import { constants } from "node:fs";
import { access, copyFile, cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const distDir = path.join(cwd, "dist");

const filesToCopy = [
  { from: ".open-next", to: ".open-next", recursive: true },
  { from: ".openai/hosting.json", to: ".openai/hosting.json" },
  { from: "wrangler.jsonc", to: "wrangler.jsonc" },
  { from: "open-next.config.ts", to: "open-next.config.ts" },
  { from: "package.json", to: "package.json" },
];

async function ensureExists(filePath) {
  await access(filePath, constants.F_OK);
}

async function copyIntoDist(entry) {
  const sourcePath = path.join(cwd, entry.from);
  const destinationPath = path.join(distDir, entry.to);

  await ensureExists(sourcePath);
  await mkdir(path.dirname(destinationPath), { recursive: true });

  if (entry.recursive) {
    await cp(sourcePath, destinationPath, { recursive: true, force: true });
    return;
  }

  await copyFile(sourcePath, destinationPath);
}

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  for (const entry of filesToCopy) {
    await copyIntoDist(entry);
  }

  console.log("Prepared dist/ with OpenNext deployment files.");
}

main().catch((error) => {
  console.error("Failed to prepare dist/ from OpenNext output.", error);
  process.exitCode = 1;
});
