---
scope: repo
canonical_roles: [entity, policy, use-case, adapter, api, view, automation]
routes:
  - paths: [src/**, tests/**, public/**, package.json, pnpm-lock.yaml, pnpm-workspace.yaml, next.config.ts, tsconfig.json, eslint.config.mjs, vitest.config.ts]
    context: Product/CONTEXT.md
    kind: index
  - paths: [supabase/**]
    context: Database/CONTEXT.md
    kind: layer
  - paths: [.github/**, .githooks/**, scripts/**]
    context: RepoInfra/CONTEXT.md
    kind: layer
support_exclusions:
  - paths: [docs/**, README.md, constitution.md, tech-context.md, AGENTS.md, CLAUDE.md, '**/CONTEXT.md', .gitignore, .env.example]
    kind: documentation
    reason: Human and agent guidance or local-secret template; not executable product input.
---

# Repository technical context

Next.js serves the mobile web UI and server-only JSON endpoints. Supabase stores normalized match data and the append-only audit trail. Paths descend through the routes above; child facts are not duplicated here.
