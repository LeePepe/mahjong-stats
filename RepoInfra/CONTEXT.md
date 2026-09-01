---
layer: repo-infra
paths: [.github/**, .githooks/**, scripts/**]
test_paths: []
gate_tier: local-fast
build: pnpm context:audit
test: pnpm lint
depends_on: []
roles: [automation]
owns: [recursive context resolver, local hooks, required CI policy, GitHub Pages deployment]
red_lines: [Hooks and CI resolve layers through the shared resolver only., Advisory jobs never satisfy a required check.]
---

# Repository infrastructure layer

Automation and context-integrity machinery. Required checks are declared in-repo and mirrored to GitHub rulesets when available.
