# Handoff

Last updated: 2026-06-11 (post T-03 + T-04)

## Mode for next session

execute queue

## Next action

The only agent-executable queue item left is `T-20260611-06` (gallery
site). Everything else in Phase 5 is owner-gated (GitHub publish, upstream
PRs, npm, video) — don't start those without the owner. Tree is clean at
commit `8ac66b6`, 71 vitest + 12/12 recipes green.

## Read order

1. `.harness/README.md`
2. `.harness/state.md`
3. `.harness/tasks/queue.md` if executing queued work

## Pointers

Relevant recent entries:

- `recent.md` — Phase 5 hardening (pc-in-rom + recipes), Phase 4 + Pong
  milestone (2026-06-11)

Relevant decisions:

- `decisions.md` — all 8 entries are load-bearing; skim before architectural changes

## Assumptions to verify

- sjasmplus still at `/opt/homebrew/bin/sjasmplus` (`zxs doctor`)
- dist/ is fresh before driving the CLI manually (`npm run build`)

## Validation expectations

- `npm test` → 71 tests green (builds dist first)
- `node dist/cli/index.js test recipes` → 12/12
- `node dist/cli/index.js test examples/pong-by-agent` → 2/2

## Risks or warnings

- Deep imports into zx-generation are pinned to EXACT 1.0.1 — if anything
  upstream changes, the canary CI job fails first; re-verify
  `src/types/zx-generation.d.ts` before bumping the pin.
- Determinism is a test invariant: no wall-clock/randomness in `src/core/`.
- Recipe tests pin emulator-deterministic outcomes (golden-style); if a
  recipe demo changes, re-derive its pinned bytes empirically.
