# Handoff

Last updated: 2026-06-11 (post T-01 publish)

## Mode for next session

owner-gated launch steps

## Next action

PUBLISHED: https://github.com/Alvaromah/spectral · Pages:
https://alvaromah.github.io/spectral/ · CI green (ubuntu+macos+canary).

Remaining:

1. `T-02` upstream PRs to alvaromah/zx-generation (gh CLI is authed with
   `workflow` scope; the owner OWNS upstream, so branch + PR directly, no
   fork). Verify each claimed bug against upstream source before fixing —
   especially (d): confirm which way the .z80 border-bit read is wrong.
2. `T-05` npm publish v0.1.0 — owner must `npm login` first.
3. `T-07` video — owner records.

## Read order

1. `.harness/README.md`
2. `.harness/state.md`
3. `.harness/tasks/queue.md`

## Pointers

- `recent.md` — publish (T-01), gallery (T-06), hardening (T-03/T-04)
- `tasks/done/T-20260611-06-gallery.md` — zx-generation browser API facts
- `decisions.md` — all entries load-bearing

## Assumptions to verify

- sjasmplus at `/opt/homebrew/bin/sjasmplus` (`zxs doctor`)
- dist/ fresh before driving the CLI manually (`npm run build`)
- gh authed as Alvaromah (workflow scope); npm NOT authed

## Validation expectations

- `npm test` → 71 tests green; recipes 12/12; pong 2/2
- CI on GitHub must stay green on both runners
- Pages: https://alvaromah.github.io/spectral/ returns 200

## Risks or warnings

- zx-generation pin EXACT 1.0.1; canary CI catches upstream drift. If
  T-02 PRs merge and a new upstream version ships, bumping the pin means
  re-verifying every signature in `src/types/zx-generation.d.ts`.
- Determinism invariant: no wall-clock/randomness in `src/core/`.
- `.gitignore` negates `/src/build/` + `/tests/build/` from the blanket
  `build/` pattern — keep that in mind when adding source dirs.
