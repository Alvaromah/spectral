# Task Queue

Last updated: 2026-06-11

## Policy

- Execute tasks from top to bottom.
- After completing a task, update this queue, `recent.md`, and `handoff.md`.
- If a task is blocked, list it under `Blocked` and stop dependent tasks.

## Next (Phase 5 — hardening & launch)

Nothing agent-executable left — everything below needs the owner.

## Owner-gated (agent sessions skip these; owner triggers)

- `T-20260611-02` - Upstream PRs to zx-generation: (a) src/index.js re-exports + package.json exports map, (b) shadow registers in Z80.getState()/setState(), (c) typeof guards for HTMLCanvasElement/document/ImageData, (d) .z80 loader border bits read as `&0x07` instead of `>>1 & 7`
- `T-20260611-05` - npm publish `@spectral-zx/toolkit` v0.1.0 (after T-01; verify `npx zxs doctor` works from a clean install)
- `T-20260611-07` - The money-shot video: re-run the Pong experiment recording the terminal (time-lapse, visible self-correction moment)

## Pending

- Windows CI lane (sjasmplus .win.zip path in ci.yml)
- `zxs run --tap` ergonomics: document/automate the J + SYM-P SYM-P LOAD"" dance
- MCP: decide whether zxs-mcp shares `.zxs/session.json` breakpoints (see state.md open questions)

## Blocked

None.

## Done recently

- `T-20260611-01` - Published: https://github.com/Alvaromah/spectral (public), CI green on ubuntu+macos+canary, Pages live at https://alvaromah.github.io/spectral/ (2026-06-11)
- `T-20260611-06` - Gallery site, verified in headless Chrome (see `tasks/done/T-20260611-06-gallery.md`)
- `T-20260611-04` - Recipes 05 + 08-12, `zxs test recipes` 12/12 (see `tasks/done/T-20260611-04-recipes.md`)
- `T-20260611-03` - Watchdog `pc-in-rom` detector (see `tasks/done/T-20260611-03-watchdog-pc-in-rom.md`)
- Phases 0-4 complete — see `recent.md` and git history.
