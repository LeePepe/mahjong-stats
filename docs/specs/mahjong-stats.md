# Mahjong statistics MVP

## Intent

A phone-first group link shows monthly standings, single-game win/loss top three, tianhu counts and dates. Anyone holding the shared query link can add records. The source repository is public; data access is link-restricted.

## Acceptance

- Missing or wrong `?key=` reveals no data.
- Four unique players and numeric scores create one match.
- Monthly totals and top-three values recompute from match results.
- A named actor is recorded for every mutation.
- Deleted matches disappear from rankings and can be restored from history.
- Player names from the supplied announcement are available after seeding.
- The primary workflow is comfortable at 390 CSS pixels wide.

## Deferred

OCR, custom scoring formulas, aliases UI, native image upload, hard identity, and multi-group tenancy.
