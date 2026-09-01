import { createCipheriv, createHash, pbkdf2Sync, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const accessKey = process.env.MAHJONG_ACCESS_KEY;
const token = process.env.GITHUB_DATA_TOKEN;
if (!accessKey || accessKey.length < 16) throw new Error("MAHJONG_ACCESS_KEY must be at least 16 characters");
if (!token?.startsWith("github_pat_")) throw new Error("GITHUB_DATA_TOKEN must be a fine-grained personal access token");
const path = resolve("public/access.json");
const current = JSON.parse(readFileSync(path, "utf8"));
const iterations = 250_000; const salt = randomBytes(16); const iv = randomBytes(12);
const key = pbkdf2Sync(accessKey, salt, iterations, 32, "sha256");
const cipher = createCipheriv("aes-256-gcm", key, iv);
const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final(), cipher.getAuthTag()]);
const next = { ...current, keyHash: createHash("sha256").update(accessKey).digest("hex"), iterations, salt: salt.toString("base64"), iv: iv.toString("base64"), ciphertext: encrypted.toString("base64") };
writeFileSync(path, `${JSON.stringify(next)}\n`, { mode: 0o644 });
console.log("public/access.json updated; plaintext token was not written.");
