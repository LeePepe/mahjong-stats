# Mahjong statistics MVP

## Intent

A phone-first group link shows monthly standings, single-game win/loss top three, tianhu counts and dates. Anyone holding the shared query link can add records without an account. The static site and dedicated data repository are public GitHub repositories.

## Acceptance

- Missing or wrong `?key=` renders no data in the site. Raw JSON remains public by explicit product choice.
- Four unique players and numeric scores create one match.
- Anyone with the link can add or freely rename a current-month leaderboard entry and update its score.
- Monthly totals and top-three values recompute from match results.
- A directly synced monthly leaderboard is authoritative when present; closed historical screenshots remain separate published standings.
- A named actor is recorded for every mutation.
- Deleted matches disappear from rankings and can be restored from history.
- Every accepted edit updates the JSON file in a Git commit.
- Player names from the supplied announcement are available after seeding.
- The primary workflow is comfortable at 390 CSS pixels wide.

## Deferred

OCR, custom scoring formulas, aliases UI, native image upload, hard identity, and multi-group tenancy.
