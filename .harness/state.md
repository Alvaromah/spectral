# Current State

Last updated: 2026-06-11

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

- Phases 0–4 COMPLETE (70 tests green, last commit `069ede6`). Milestone passed:
  an agent built `examples/pong-by-agent/` unassisted.
- Next: Phase 5 — see `tasks/queue.md` (publish, upstream PRs, gallery, video).

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
- Watchdog blind spot (found by the Pong milestone): crashes into the BASIC
  editor are halt-synced, so no hang verdict — screen observability
  (nonBlankCells, OCR) is what catches them. Candidate fix: pc-in-rom detector.
- Kempston (port 0x1F) is NOT emulated; unselected ports read 0xFF (a
  Kempston routine reads "all pressed"). Keyboard only.

## Open questions

- When to publish: GitHub repo + npm v0.1.0 are ready but the owner decides timing.
- Whether `zxs-mcp` should also honor `.zxs/session.json` breakpoints (currently in-memory only).
