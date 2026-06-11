# Spectral — toolkit development notes

AI-agent toolchain for ZX Spectrum 48K game development. TypeScript, ESM-only,
single package. Full plan: see the approved plan in the repo owner's notes.

## Commands

- `npm test` — vitest (needs `sjasmplus` on PATH for tests/build)
- `npm run typecheck` — tsc --noEmit
- `npm run build` — tsup → dist/ (CLI: `node dist/cli/index.js`)

## Architecture rules

- `zx-generation` is pinned to **exact 1.0.1** and consumed via deep imports
  (`zx-generation/src/...`). Those imports are NOT semver-protected: they are
  confined to `src/core/machine.ts` and typed in `src/types/zx-generation.d.ts`.
  If you touch the pin, re-verify every signature in the .d.ts.
- `src/core/run-loop.ts` replicates upstream `runFrame()`
  (zx-generation src/spectrum/spectrum.js:466 @1.0.1) exactly, minus sound.
  Do not "improve" the loop order — determinism tests depend on it.
- Frame = 69,888 T-states (312 scanlines × 224). Runs stop at frame
  boundaries right after the interrupt is accepted, so `iff1` is usually
  false there — never assert on it at frame boundaries.
- Every CLI command emits one JSON document with `--json`; exit codes:
  0 ok, 1 user/build error, 2 hang, 3 environment. Agents branch on these.
- sjasmplus writes its version banner and diagnostics to **stderr**;
  diagnostic format: `file(line): error: message`.

## Testing conventions

- Golden PNGs live in tests/golden/; regenerate with `UPDATE_GOLDEN=1 npm test`.
- Emulation is deterministic: identical boot + inputs ⇒ byte-identical RAM.
  New features must keep it that way (no Date.now()/Math.random() in core).
