---
scope: product
routes:
  - paths: [src/domain/**, tests/domain/**]
    context: Product/Domain/CONTEXT.md
    kind: layer
  - paths: [src/data-access/**, tests/data-access/**]
    context: Product/DataAccess/CONTEXT.md
    kind: layer
  - paths: [src/app/**, public/**, package.json, pnpm-lock.yaml, pnpm-workspace.yaml, next.config.ts, tsconfig.json, eslint.config.mjs, vitest.config.ts]
    context: Product/WebUI/CONTEXT.md
    kind: layer
---

# Product index

This index partitions product code into pure scoring rules, GitHub data adapters, and the rendered static web shell.
