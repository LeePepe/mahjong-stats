import type { MahjongState } from "@/domain/model";
import { applyMutation, type Mutation } from "@/domain/mutation";

type AccessEnvelope = { version: 1; owner: string; repo: string; branch: string; path: string; keyHash: string; iterations: number; salt: string; iv: string; ciphertext: string };
export type GithubSession = { config: AccessEnvelope; token: string };
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const bytesToBase64 = (bytes: Uint8Array) => { let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); }); return btoa(binary); };
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
const hex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

async function sha256(value: string) { return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))); }

async function decryptToken(key: string, config: AccessEnvelope) {
  if (!config.ciphertext) return "";
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), "PBKDF2", false, ["deriveKey"]);
  const aesKey = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: base64ToBytes(config.salt), iterations: config.iterations, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  const clear = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(config.iv) }, aesKey, base64ToBytes(config.ciphertext));
  return new TextDecoder().decode(clear);
}

export async function openSession(accessKey: string): Promise<GithubSession> {
  const response = await fetch(`${basePath}/access.json`, { cache: "no-store" });
  if (!response.ok) throw new Error("访问配置不存在");
  const config = await response.json() as AccessEnvelope;
  if (!config.keyHash || await sha256(accessKey) !== config.keyHash) throw new Error("访问链接无效");
  try { return { config, token: await decryptToken(accessKey, config) }; }
  catch { throw new Error("访问链接无效"); }
}

export async function loadState(session: GithubSession): Promise<MahjongState> {
  const { owner, repo, branch, path } = session.config;
  const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("读取 GitHub 数据失败");
  return response.json();
}

async function githubFile(session: GithubSession) {
  const { owner, repo, branch, path } = session.config;
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${session.token}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 401 ? "写入 Token 已失效" : "读取最新版本失败");
  return response.json() as Promise<{ sha: string; content: string }>;
}

export async function commitMutation(session: GithubSession, mutation: Mutation): Promise<MahjongState> {
  if (!session.token) throw new Error("写入 Token 尚未配置");
  const latest = await githubFile(session);
  const current = JSON.parse(new TextDecoder().decode(base64ToBytes(latest.content.replace(/\n/g, "")))) as MahjongState;
  const next = applyMutation(current, mutation);
  const content = bytesToBase64(new TextEncoder().encode(`${JSON.stringify(next, null, 2)}\n`));
  const { owner, repo, branch, path } = session.config;
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { method: "PUT", headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${session.token}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" }, body: JSON.stringify({ message: `data: ${mutation.actor} ${mutation.type}`, content, sha: latest.sha, branch }) });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(response.status === 409 ? "刚刚有人同时编辑，请重试" : (body.message ?? "写入 GitHub 失败")); }
  return next;
}
