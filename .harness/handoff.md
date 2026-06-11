# Handoff

Last updated: 2026-06-11 (post T-03 + T-04 + T-06)

## Mode for next session

owner-gated launch steps

## Next action

All agent-executable Phase 5 work is DONE. What remains needs the owner
present:

1. `T-01` publish: owner runs `gh auth login` first. Then, per owner's
   recorded decisions: rewrite the commit author to
   `<username>@users.noreply.github.com` (derive username from
   `gh api user`) across all commits BEFORE pushing, create PUBLIC repo
   `spectral`, push, verify CI on both runners, enable Pages → `gallery/`.
2. `T-02` upstream PRs to zx-generation (owner's own repo, alvaromah).
3. `T-05` npm publish (owner runs `npm login` first).
4. `T-07` video (owner records).

Tree clean at `<harness close commit>`; code at `b4fe244`.

## Read order

1. `.harness/README.md`
2. `.harness/state.md`
3. `.harness/tasks/queue.md`

## Pointers

- `recent.md` — gallery, Phase 5 hardening, Pong milestone (all 2026-06-11)
- `tasks/done/T-20260611-06-gallery.md` — zx-generation browser API facts
  (onReady callback, ROM CDN default) — read before touching the gallery
- `decisions.md` — all entries load-bearing

## Assumptions to verify

- sjasmplus still at `/opt/homebrew/bin/sjasmplus` (`zxs doctor`)
- dist/ fresh before driving the CLI manually (`npm run build`)
- gh/npm auth: NOT configured as of 2026-06-11

## Validation expectations

- `npm test` → 71 tests green (builds dist first)
- `node dist/cli/index.js test recipes` → 12/12
- `node dist/cli/index.js test examples/pong-by-agent` → 2/2
- gallery: `npx serve gallery`, check index + `player.html?game=pong-by-agent`

## Risks or warnings

- zx-generation pin EXACT 1.0.1; canary CI catches upstream drift.
- Determinism invariant: no wall-clock/randomness in `src/core/`.
- Recipe tests pin deterministic outcomes; re-derive empirically if demos change.
- `gallery/zxgeneration.esm.js` + `48k.rom` are vendored copies — re-copy
  from node_modules if the pin ever moves.
