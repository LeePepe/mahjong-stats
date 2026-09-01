---
layer: database
paths: [supabase/**]
test_paths: []
gate_tier: ci-only
build: pnpm context:audit
test: pnpm typecheck
depends_on: [domain]
roles: [adapter]
owns: [relational schema, migrations, row-level access posture, seed player names]
red_lines: [No anonymous database policy may bypass the server query gate., Audit rows are append-only application history.]
---

# Database layer

Supabase/Postgres schema and deterministic seed inputs. Service-role access is restricted to server code.
