# T-20260611-03 — Watchdog pc-in-rom detector

Status: done (2026-06-11)
Areas: src/core, src/cli, src/mcp, docs, templates

## Goal

Close the watchdog blind spot found by the Pong milestone: a program that
crashes into the BASIC editor ends up halt-synced (the ROM key wait executes
HALT with EI), so `finalize()` returned "healthy" and only screen
observability caught the crash.

## What was done

- `src/core/detect.ts`: new `HangKind` `'pc-in-rom'`. `beforeInstruction`
  records the last frame with a RAM PC (> 0x3FFF); `finalize` flags
  `pc-in-rom` (probable) when the program ran from RAM and then stayed in
  ROM for > 50 consecutive frames (~1 s). The check sits BEFORE the
  `haltSynced` early-return — that ordering IS the fix.
- Threshold is generous on purpose: long legitimate ROM calls exist (BEEP
  holds the CPU in ROM for the note's duration). Documented as the known
  false positive (remedy: raise `--frames`).
- Test (`tests/core/detect.test.ts`): RAM halt-loop for 5 frames, then
  `JP 0x12A2` (ROM MAIN-EXEC) — lands in the editor, verdict fires.
  Healthy/idle-BASIC cases still pass (ISR frames in ROM don't matter
  because the RAM main loop refreshes `lastRamExecFrame` every frame).
- Agent surfaces updated: `common-bugs.md` anchor `#pc-in-rom`, `zxs run`
  next-hint, MCP `zx_run` description, README, game template CLAUDE.md.

## Notes for the future

- An injected program that *intentionally* exits to BASIC will be flagged
  (probable). Acceptable: under zxs there is no caller to RET to, so that
  pattern is a bug in practice.
- `0x12A2` (MAIN-EXEC) is a handy deterministic "crash into editor" repro.
