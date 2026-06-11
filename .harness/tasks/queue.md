# Task Queue

Last updated: 2026-06-11

## Policy

- Execute tasks from top to bottom.
- After completing a task, update this queue, `recent.md`, and `handoff.md`.
- If a task is blocked, list it under `Blocked` and stop dependent tasks.

## Next (Phase 5 — hardening & launch)

Nothing agent-executable left — everything below needs the owner.

## Owner-gated (agent sessions skip these; owner triggers)

- `T-20260611-07` - The money-shot video: re-run the Pong experiment recording the terminal (time-lapse, visible self-correction moment) — runbook ready: `tasks/pending/T-20260611-07-video-runbook.md`

## Pending

- common-bugs.md: document the zero-terminator vs control-operand trap (`AT y,x` with 0s truncates print_string) — it has bitten twice; the `print_at` cure lives in examples/arkanoid-quickstart
- AFTER the zx-generation release (owner tags v1.1.0): bump the pin (re-verify the .d.ts), drop the `regs.data['A_']` workaround in state.ts, consider entry-point imports, re-vendor gallery bundle + ROM (fixes the yellow border)
- Windows CI lane (sjasmplus .win.zip path in ci.yml)
- `zxs run --tap` ergonomics: document/automate the J + SYM-P SYM-P LOAD"" dance
- MCP: decide whether zxs-mcp shares `.zxs/session.json` breakpoints (see state.md open questions)

## Blocked

None.

## Done recently

- `T-20260611-05` - PUBLISHED `@spectral-zx/toolkit@0.1.0` to npm (public). Clean-install-from-registry verified: bins linked, `zxs doctor` green, `zxs new` scaffolds. See `recent.md` (incl. the misleading bin warning + token/bypass-2FA publish path).
- `T-20260611-02` - zx-generation: PRs #2-#5 + dependabot #1 + #7 (CI repair) MERGED; upstream CI green for the first time. Pending owner: tag a release (suggest v1.1.0)
- `T-20260611-01` - Published: https://github.com/Alvaromah/spectral (public), CI green on ubuntu+macos+canary, Pages live at https://alvaromah.github.io/spectral/ (2026-06-11)
- `T-20260611-06` - Gallery site, verified in headless Chrome (see `tasks/done/T-20260611-06-gallery.md`)
- `T-20260611-04` - Recipes 05 + 08-12, `zxs test recipes` 12/12 (see `tasks/done/T-20260611-04-recipes.md`)
- `T-20260611-03` - Watchdog `pc-in-rom` detector (see `tasks/done/T-20260611-03-watchdog-pc-in-rom.md`)
- Phases 0-4 complete — see `recent.md` and git history.
