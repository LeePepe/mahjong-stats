---
layer: web-ui
paths: [src/app/**, public/**, package.json, pnpm-lock.yaml, pnpm-workspace.yaml, next.config.ts, tsconfig.json, eslint.config.mjs, vitest.config.ts]
test_paths: []
gate_tier: ci-only
build: pnpm build
test: pnpm lint
depends_on: [domain, data-access]
roles: [api, view]
owns: [mobile web experience, client-side query gate, static export, product build configuration]
red_lines: [A page without the correct query key renders no mahjong data., Editing remains usable on a narrow mobile viewport.]
---

# Web UI layer

Next.js App Router pages, styling, metadata, GitHub Pages export, and product-level build inputs.
