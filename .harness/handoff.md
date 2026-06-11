# Handoff

Last updated: 2026-06-11

## Mode for next session

execute queue

## Next action

Pick the top item from `tasks/queue.md` (Phase 5: publish + upstream PRs),
unless the owner asks for something else. Nothing is half-finished; the tree
is clean at commit `069ede6` with 70 tests green.

## Read order

1. `.harness/README.md`
2. `.harness/state.md`
3. `.harness/tasks/queue.md` if executing queued work

## Pointers

Relevant recent entries:

- `recent.md` — Phase 4 + the Pong milestone (2026-06-11)

Relevant decisions:

- `decisions.md` — all 8 entries are load-bearing; skim before architectural changes

## Assumptions to verify

- sjasmplus still at `/opt/homebrew/bin/sjasmplus` (`zxs doctor`)
- dist/ is fresh before driving the CLI manually (`npm run build`)

## Validation expectations

- `npm test` → 70 tests green (builds dist first)
- `node dist/cli/index.js test recipes` → 6/6
- `node dist/cli/index.js test examples/pong-by-agent` → 2/2

## Risks or warnings

- Deep imports into zx-generation are pinned to EXACT 1.0.1 — if anything
  upstream changes, the canary CI job fails first; re-verify
  `src/types/zx-generation.d.ts` before bumping the pin.
- Determinism is a test invariant: no wall-clock/randomness in `src/core/`.
