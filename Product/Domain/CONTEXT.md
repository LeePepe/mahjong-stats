---
layer: domain
paths: [src/domain/**]
test_paths: [tests/domain/**]
gate_tier: local-fast
build: pnpm typecheck
test: pnpm test -- tests/domain
depends_on: []
roles: [entity, policy]
owns: [match model, monthly aggregation, single-game top-three, tianhu aggregation]
red_lines: [Rankings must remain derivable from source match and event records., Domain code must not import framework or database modules.]
---

# Domain layer

Pure TypeScript data types and deterministic statistics. It is safe to test without Next.js or Supabase.
