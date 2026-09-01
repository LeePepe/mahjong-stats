<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository context index

Every task starts with [constitution.md](constitution.md) and [tech-context.md](tech-context.md).
Feature changes also read the matching document under `docs/specs/`.

| Change scope | Read first |
|---|---|
| Product source, tests, assets, or build config | `Product/CONTEXT.md` |
| `supabase/**` | `Database/CONTEXT.md` |
| `.github/**`, `.githooks/**`, `scripts/**` | `RepoInfra/CONTEXT.md` |

Follow index contexts recursively until one leaf layer owns the changed path.
