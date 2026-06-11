# Handoff

Last updated: 2026-06-11 (end of launch day: published + upstream merged +
guide + arkanoid quickstart)

## Mode for next session

owner-gated launch steps; small pending items available if the owner is absent

## Next action

Everything queued for agents is DONE. The three remaining keys are the
owner's (ask, don't start without them):

1. `T-05` npm publish v0.1.0 — owner types `! npm login`, then publish
   `@spectral-zx/toolkit` and verify `npx zxs doctor` from a clean install.
2. zx-generation release — owner tags (`git tag v1.1.0 && git push --tags`
   in the upstream clone; release.yml does the rest). AFTERWARDS, agent
   work unlocks: bump Spectral's pin (re-verify EVERY signature in
   `src/types/zx-generation.d.ts`), drop the `regs.data['A_']` workaround
   in `src/core/state.ts`, consider entry-point imports (upstream now has
   an exports map), re-vendor `gallery/zxgeneration.esm.js` + `48k.rom`
   (fixes the yellow-border cosmetic bug on gallery snapshots).
3. `T-07` video — owner records; runbook ready in
   `tasks/pending/T-20260611-07-video-runbook.md`.

If the owner is absent, `tasks/queue.md` → Pending has self-contained
items (common-bugs entry for the zero-terminator trap, Windows CI lane,
tap ergonomics).

## Read order

1. `.harness/README.md`
2. `.harness/state.md`
3. `.harness/tasks/queue.md`

## Pointers

- `recent.md` — full launch-day narrative, newest first (arkanoid
  quickstart, upstream merge + CI repair, publish, gallery, hardening)
- `tasks/done/T-20260611-06-gallery.md` — zx-generation browser API facts
  (onReady callback, ROM CDN default) — read before touching the gallery
- `docs/quickstart-arkanoid.md` — the human tutorial; its code lives in
  `examples/arkanoid-quickstart/` (must stay 2/2 green)
- `docs/spectral-guia-completa.{md,html}` — owner-facing project guide
- `decisions.md` — all entries load-bearing

## Assumptions to verify

- sjasmplus at `/opt/homebrew/bin/sjasmplus` (`zxs doctor`)
- dist/ fresh before driving the CLI manually (`npm run build`)
- gh CLI authed as Alvaromah with `workflow` scope; npm NOT authed
- upstream zx-generation main is `9c300e4` (CI green); npm still 1.0.1

## Validation expectations

- `npm test` → 71 tests green (builds dist first)
- `node dist/cli/index.js test recipes` → 12/12
- `node dist/cli/index.js test examples/pong-by-agent` → 2/2
- `node dist/cli/index.js test examples/arkanoid-quickstart` → 2/2
- GitHub CI green on push; Pages live:
  https://alvaromah.github.io/spectral/ (gallery, 2 games) and
  https://alvaromah.github.io/zx-generation/ (upstream docs)

## Risks or warnings

- zx-generation pin EXACT 1.0.1 until the owner releases; the canary CI
  job will light up when a new version ships — that's the signal, not an
  error.
- Determinism invariant: no wall-clock/randomness in `src/core/`.
- Recipe/example tests pin deterministic outcomes; if a demo changes,
  re-derive its pinned values empirically.
- `.gitignore` negates `/src/build/` + `/tests/build/` from the blanket
  `build/` pattern — remember when adding source dirs named `build`.
- The zero-terminator vs control-operand trap (print_string eats `AT y,x`
  when y or x is 0) has now bitten TWICE — see state.md Known facts.
