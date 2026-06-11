# Current State

Last updated: 2026-06-11 (end of launch day)

## Solution summary

**Spectral** (`@spectral-zx/toolkit`): an AI-agent toolchain for ZX Spectrum
48K game development. Agents (Claude Code, Codex...) assemble Z80 with
sjasmplus, run it on a headless in-process emulator (zx-generation, the
author's own LLM-generated emulator), observe via PNG screenshots + ROM-font
text OCR, debug with source-level breakpoints, and iterate. Ships as a `zxs`
CLI (one-shot, session state in `.zxs/`) + `zxs-mcp` MCP server (persistent
machine, screen as image content). Community goal: gallery of agent-made
games playable in the browser, game jams, full transparency.

## Main areas

- `src/core/` — headless Machine, run loop, state, screen/OCR, watchdog, disasm, symbols, trace, input
- `src/build/` — sjasmplus subprocess wrapper (JSON diagnostics)
- `src/cli/` — `zxs` commands + `.zxs/` session conventions
- `src/mcp/` — `zxs-mcp` server (7 tools)
- `docs/reference/` + `recipes/` + `templates/game/` — the agent-facing knowledge layer

## Current architecture

Single TypeScript ESM package. zx-generation@1.0.1 (EXACT pin) consumed via
deep imports confined to `src/core/machine.ts` + `src/types/zx-generation.d.ts`.
CLI is one-shot with `.zxstate` JSON state files; MCP server is the live
session. Everything emits one JSON document; exit codes 0 ok / 1 user / 2
hang / 3 environment. CI: ubuntu+macos (builds sjasmplus from source,
cached) + canary job against zx-generation@latest.

## Current focus

- Phases 0–4 COMPLETE; milestone passed: an agent built
  `examples/pong-by-agent/` unassisted.
- Phase 5: pc-in-rom watchdog ✓, recipes 12/12 ✓, gallery ✓, and
  **PUBLISHED (2026-06-11)**: https://github.com/Alvaromah/spectral
  (public), CI green on ubuntu+macos+canary, Pages live at
  https://alvaromah.github.io/spectral/ (deployed from `gallery/` via
  pages.yml). History was rewritten pre-push to the owner's GitHub
  noreply identity (`16006835+Alvaromah@users.noreply.github.com`,
  set in local git config). gh CLI authed with `workflow` scope; npm
  still needs `npm login`.
- Upstream (T-02) MERGED into alvaromah/zx-generation main (`9c300e4`):
  .z80 header fixes, shadow registers in get/setState, Node-safe guards,
  entry point + exports map, plus a full CI repair (first green CI in
  that repo's history). NOT yet released to npm — Spectral's pin stays
  1.0.1 until the owner tags a release. Left: npm v0.1.0 (T-05, needs
  `npm login`), video (T-07, runbook ready) — see `tasks/queue.md`.
- Owner-facing docs grew: `docs/spectral-guia-completa.{md,html}` (the
  whole journey, Spanish) and `docs/quickstart-arkanoid.{md,html}`
  (step-by-step tutorial; its verified code is
  `examples/arkanoid-quickstart/`, 2/2 specs, second gallery game).

## Stable constraints

- **Determinism is sacred**: same boot + inputs ⇒ bit-identical RAM. No
  `Date.now()`/`Math.random()` in `src/core/`. Golden tests depend on it.
- `src/core/run-loop.ts` replicates upstream `runFrame()`
  (zx-generation src/spectrum/spectrum.js:466 @1.0.1) exactly — do not
  "improve" the loop order.
- Frame = 69,888 T-states (312×224). Runs stop at frame boundaries right
  after interrupt acceptance ⇒ `iff1` is usually false there; never assert it.
- Deep-import surface must stay confined to machine.ts + the .d.ts; if the
  pin ever moves, re-verify every signature in `src/types/zx-generation.d.ts`.
- The CLI bin is `zxs`, never `zx` (collides with Google's zx package).

## Known facts

- sjasmplus prints its version banner AND diagnostics to **stderr**; format
  `file(line): error: message`. v1.23.1 built from source at
  `/opt/homebrew/bin/sjasmplus` (no brew formula; macOS = build from source).
- Bench: ~6,600 fps headless ≈ 132× real hardware (~463 MHz equivalent).
- `--raw=` works in DEVICE mode; SLD output requires the DEVICE directive.
- Golden PNGs: regenerate with `UPDATE_GOLDEN=1 npm test`.
- Watchdog `pc-in-rom` (added 2026-06-11) closes the Pong-milestone blind
  spot: crashes into the halt-synced BASIC editor are flagged at budget end
  after >50 frames of ROM-only execution following RAM execution. The check
  runs BEFORE the haltSynced early-return in `finalize()` — that order is
  the fix. Known false positive: deliberately long ROM calls (BEEP) — raise
  `--frames`. Deterministic repro for tests: `JP 0x12A2` (ROM MAIN-EXEC).
- Kempston (port 0x1F) is NOT emulated; unselected ports read 0xFF (a
  Kempston routine reads "all pressed"). Keyboard only.
- RECURRING TRAP (bit the Pong agent AND the quickstart authoring): a
  zero-terminated print_string eats `AT y,x` control operands when y or
  x is 0 — the string silently truncates. Cure: send controls via
  registers (`print_at` helper in examples/arkanoid-quickstart). Queued:
  document in docs/reference/common-bugs.md.
- Gallery snapshots show a YELLOW border in the browser until the
  zx-generation release ships: upstream 1.0.1's .z80 loader reads border
  from the wrong bits (fixed in upstream main, unreleased). Re-vendor
  `gallery/zxgeneration.esm.js` after the release.

## Open questions

- Whether `zxs-mcp` should also honor `.zxs/session.json` breakpoints (currently in-memory only).
