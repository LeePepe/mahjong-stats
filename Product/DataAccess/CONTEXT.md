---
layer: data-access
paths: [src/data-access/**]
test_paths: [tests/data-access/**]
gate_tier: local-fast
build: pnpm typecheck
test: pnpm test -- tests/data-access
depends_on: [domain]
roles: [adapter]
owns: [query-key verification, encrypted token handling, GitHub Contents API mapping]
red_lines: [The plaintext token is never committed or logged., The token may only grant contents access to the dedicated data repository.]
---

# Data-access layer

Browser adapter for capability-link access, token decryption, public JSON reads, and committed GitHub writes.
