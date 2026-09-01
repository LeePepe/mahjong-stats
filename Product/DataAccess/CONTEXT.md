---
layer: data-access
paths: [src/server/**]
test_paths: [tests/server/**]
gate_tier: local-fast
build: pnpm typecheck
test: pnpm test -- tests/server
depends_on: [domain]
roles: [adapter]
owns: [query-key verification, Supabase mapping, audited mutations]
red_lines: [The access key and service-role key never enter browser code or logs., Mutations must append audit history and deletes remain recoverable.]
---

# Data-access layer

Server-only boundary for access control, persistence mapping, and audit writes.
