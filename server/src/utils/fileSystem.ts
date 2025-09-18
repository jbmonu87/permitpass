import { mkdirSync } from "fs";
import { dirname, isAbsolute, resolve } from "path";
import { fileURLToPath } from "url";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(moduleDir, "../../..");

export const toAbsolutePath = (targetPath: string) =>
  isAbsolute(targetPath) ? targetPath : resolve(projectRoot, targetPath);

export const ensureDirectoryExists = (path: string) => {
  mkdirSync(path, { recursive: true });
};

export const ensureFileDirectoryExists = (filePath: string) => {
  ensureDirectoryExists(dirname(filePath));
};
