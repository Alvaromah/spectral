# Decisions

Important accepted, rejected, superseded, or reverted decisions that should
not be rediscovered repeatedly. Newest first.

## 2026-06-11 - Watchdog stays conservative; observability covers the gap

Status: accepted

Context: the Pong milestone showed that a crash into the BASIC editor is
HALT-synced, so the watchdog issues no hang verdict.

Decision: don't make the watchdog guess. Agents catch this class via
`screen.nonBlankCells` + OCR (which is what happened). A `pc-in-rom`
detector is queued as an enhancement, not a hotfix.

## 2026-06-11 - Recipes are executable documentation

Status: accepted

Every `recipes/*/recipe.asm` ships with a standalone demo and a declarative
`test.json` run by `zxs test` in CI. The assertion vocabulary deliberately
mirrors the agent observation primitives (haltSynced, pixelAt,
screenIncludes...). Docs that can rot don't get merged.

## 2026-06-10 - One-shot CLI + state files; the MCP server IS the session

Status: accepted

No daemon. `.zxstate` (JSON ~64KB, includes shadow registers and mid-frame
position) makes one-shot `zxs` commands resumable across processes; `zxs-mcp`
holds a live Machine for persistent sessions. Both interoperate via the same
state files. Rejected: a debugging daemon/socket (DeZog-style) — needless
lifecycle complexity at our speeds (~150ms per one-shot command).

## 2026-06-10 - Compose zx-generation internals; never the ZXSpectrum facade

Status: accepted

The facade is browser-only (HTMLCanvasElement, rAF, ImageData). We deep-import
Z80/SpectrumMemory/SpectrumULA/SpectrumDisplay/Tape and replicate `runFrame()`
verbatim (spectrum.js:466 @1.0.1). Pin EXACT 1.0.1; a canary CI job tests
against @latest; upstream PRs queued (exports map, shadow-register getState
fix, Node typeof guards, .z80 border-bit read fix) to legitimize the imports.

## 2026-06-10 - Names: Spectral / @spectral-zx / bin `zxs` (never `zx`)

Status: accepted (owner's call)

`zx` collides with Google's popular npm package. Tagline: "AI agents for the
ZX Spectrum".

## 2026-06-10 - sjasmplus as the only assembler (subprocess)

Status: accepted

BSD license, de-facto scene standard, SLD source-level debug output, direct
SAVETAP/SAVESNA. No assembler abstraction until a second assembler is wanted.
Rejected: @andrivet/z80-assembler (GPLv3, less adoption); Pasmo (no SLD).

## 2026-06-10 - CLI-first; MCP as a thin layer over the same core

Status: accepted (owner's call)

Any agent drives `zxs` via bash; MCP adds image content + a persistent
machine for MCP clients. Same JSON report shapes in both.

## 2026-06-10 - Scope: ZX Spectrum 48K, Z80 ASM only

Status: accepted (owner's call)

BASIC (zmakebas/ZXBasic) and C (z88dk) are explicitly later phases. The
emulator is 48K-only anyway; 128K/AY is future work.
