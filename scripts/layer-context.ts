import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { minimatch } from "minimatch";
import { parse } from "yaml";

type Route = { paths: string[]; context: string; kind: "index" | "layer" };
type Exclusion = { paths: string[]; kind: string; reason: string };
type Context = { scope?: string; layer?: string; routes?: Route[]; support_exclusions?: Exclusion[]; paths?: string[]; test_paths?: string[]; gate_tier?: "local-fast" | "ci-only"; build?: string; test?: string; depends_on?: string[]; roles?: string[]; canonical_roles?: string[] };
const root = process.cwd();

function load(file: string): Context {
  const source = readFileSync(resolve(root, file), "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`${file}: missing YAML front matter`);
  return parse(match[1]);
}
const matching = (path: string, patterns: string[] = []) => patterns.some((pattern) => minimatch(path, pattern, { dot: true }));

export function resolvePath(path: string, contextFile = "tech-context.md", seen: string[] = []): { layer?: string; excluded?: string; context?: string } {
  if (seen.includes(contextFile)) throw new Error(`cycle: ${[...seen, contextFile].join(" -> ")}`);
  const context = load(contextFile);
  const routes = (context.routes ?? []).filter((route) => matching(path, route.paths));
  const exclusions = (context.support_exclusions ?? []).filter((item) => matching(path, item.paths));
  if (routes.length + exclusions.length === 0) throw new Error(`unmapped: ${path} at ${contextFile}`);
  if (routes.length + exclusions.length > 1) throw new Error(`overlap: ${path} at ${contextFile}`);
  if (exclusions.length) return { excluded: exclusions[0].kind };
  const route = routes[0];
  if (route.kind === "index") return resolvePath(path, route.context, [...seen, contextFile]);
  const leaf = load(route.context);
  if (!leaf.layer) throw new Error(`${route.context}: leaf has no layer ID`);
  if (!matching(path, [...(leaf.paths ?? []), ...(leaf.test_paths ?? [])])) throw new Error(`parent/leaf mismatch: ${path} -> ${route.context}`);
  return { layer: leaf.layer, context: route.context };
}

function files() {
  return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" }).trim().split("\n").filter((path) => path && existsSync(resolve(root, path)));
}

function collectLeaves(contextFile = "tech-context.md", seen = new Set<string>(), output = new Map<string, string>()): Map<string, string> {
  if (seen.has(contextFile)) throw new Error(`cycle: ${contextFile}`);
  seen.add(contextFile);
  const context = load(contextFile);
  for (const route of context.routes ?? []) {
    if (route.kind === "index") collectLeaves(route.context, new Set(seen), output);
    else {
      const leaf = load(route.context);
      if (!leaf.layer) throw new Error(`${route.context}: missing layer`);
      if (output.has(leaf.layer)) throw new Error(`duplicate layer ID: ${leaf.layer}`);
      const parentPaths = [...route.paths].sort().join("|");
      const leafPaths = [...(leaf.paths ?? []), ...(leaf.test_paths ?? [])].sort().join("|");
      if (parentPaths !== leafPaths) throw new Error(`parent/leaf mismatch: ${route.context}`);
      if (!leaf.gate_tier || !leaf.build || !leaf.test) throw new Error(`${route.context}: incomplete gate fields`);
      output.set(leaf.layer, route.context);
    }
  }
  return output;
}

function audit() {
  const leaves = collectLeaves();
  const roles = new Set(load("tech-context.md").canonical_roles ?? []);
  for (const [id, contextFile] of leaves) {
    const leaf = load(contextFile);
    for (const dependency of leaf.depends_on ?? []) if (!leaves.has(dependency)) throw new Error(`${id}: ghost dependency ${dependency}`);
    for (const role of leaf.roles ?? []) if (!roles.has(role)) throw new Error(`${id}: unknown role ${role}`);
  }
  const counts = new Map<string, number>(); let excluded = 0;
  for (const file of files()) { const result = resolvePath(file); if (result.layer) counts.set(result.layer, (counts.get(result.layer) ?? 0) + 1); else excluded += 1; }
  console.log(`context audit: ${leaves.size} leaves, ${files().length} paths, ${excluded} support exclusions, unmapped=0, overlap=0`);
  for (const [layer, count] of counts) console.log(`  ${layer}: ${count} paths`);
}

function field(layer: string, name: string) {
  const contextFile = collectLeaves().get(layer); if (!contextFile) throw new Error(`unknown layer: ${layer}`);
  const value = load(contextFile)[name as keyof Context]; console.log(typeof value === "string" ? value : JSON.stringify(value));
}

function run(layer: string, gate: "build" | "test") {
  const contextFile = collectLeaves().get(layer); if (!contextFile) throw new Error(`unknown layer: ${layer}`);
  const command = load(contextFile)[gate]; if (typeof command !== "string") throw new Error(`${layer}: missing ${gate}`);
  const result = spawnSync(command, { cwd: root, shell: true, stdio: "inherit" }); if (result.status) process.exit(result.status);
}

function selftest() {
  const cases: [string, string, string][] = [
    ["src/domain/ranking.ts", "domain", "H1/C1"], ["src/app/page.tsx", "web-ui", "H2"], ["src/data-access/github-store.ts", "data-access", "C1"], ["scripts/layer-context.ts", "repo-infra", "R1"],
  ];
  for (const [path, expected, label] of cases) { const actual = resolvePath(path).layer; if (actual !== expected) throw new Error(`${label}: ${path} resolved to ${actual}`); }
  try { resolvePath("src/unowned/file.ts"); throw new Error("F1: expected unmapped"); } catch (error) { if (!String(error).includes("unmapped")) throw error; }
  console.log(`context selftest: ${cases.length + 1} cases passed`);
}

const [command, ...args] = process.argv.slice(2);
try {
  if (command === "audit") audit();
  else if (command === "resolve" || command === "layers") { const results = args.map((path) => resolvePath(path)); const values = command === "layers" ? [...new Set(results.flatMap((item) => item.layer ? [item.layer] : []))] : results; console.log(JSON.stringify(values, null, 2)); }
  else if (command === "field") field(args[0], args[1]);
  else if (command === "run") run(args[0], args[1] as "build" | "test");
  else if (command === "selftest") selftest();
  else throw new Error("usage: layer-context <audit|resolve|layers|field|run|selftest>");
} catch (error) { console.error(`::layered-signal::${JSON.stringify({ layer: "routing", kind: "context", detail: error instanceof Error ? error.message : String(error), red_lines: [] })}`); process.exit(1); }
