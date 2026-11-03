#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

// Never print key material. Only the ignored local env file is supported.
const target = ".env.local";
try {
  execFileSync("git", ["check-ignore", "--quiet", target]);
  let existing = "";
  try {
    existing = readFileSync(target, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (
    /^\s*(?:export\s+)?DOCUMENT_ENCRYPTION_(?:KEY_V1|ACTIVE_KEY_ID)\s*=/m.test(existing)
  ) {
    throw new Error("Encryption configuration already exists; refusing to overwrite.");
  }
  const addition = `\nDOCUMENT_ENCRYPTION_ACTIVE_KEY_ID=v1\nDOCUMENT_ENCRYPTION_KEY_V1=${randomBytes(32).toString("base64")}\n`;
  if (existing) appendFileSync(target, addition);
  else writeFileSync(target, addition, { flag: "wx", mode: 0o600 });
  console.log(
    "Encryption configuration written to ignored .env.local. Back it up securely.",
  );
} catch {
  console.error(
    "Key provisioning stopped: file must be ignored, writable, and have no existing encryption configuration.",
  );
  process.exitCode = 1;
}
