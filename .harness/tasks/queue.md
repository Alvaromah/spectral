# Task Queue

Last updated: 2026-06-11

## Policy

- Execute tasks from top to bottom.
- After completing a task, update this queue, `recent.md`, and `handoff.md`.
- If a task is blocked, list it under `Blocked` and stop dependent tasks.

## Next (Phase 5 — hardening & launch)

1. `T-20260611-01` - Publish: create the GitHub repo (`spectral`), push the 8 commits, verify CI goes green on both runners (owner triggers; needs their GitHub account)
2. `T-20260611-02` - Upstream PRs to zx-generation: (a) src/index.js re-exports + package.json exports map, (b) shadow registers in Z80.getState()/setState(), (c) typeof guards for HTMLCanvasElement/document/ImageData, (d) .z80 loader border bits read as `&0x07` instead of `>>1 & 7`
3. `T-20260611-03` - Watchdog `pc-in-rom` detector: flag sustained PC residence in 0x0000-0x3FFF when the program was injected at 0x8000+ (closes the BASIC-editor blind spot found by the Pong milestone)
4. `T-20260611-04` - Remaining recipes: 05-sprite-masked-16x16, 08-im2-isr, 09-beeper-fx, 10-score-bcd, 11-prng, 12-attr-effects (each with test.json)
5. `T-20260611-05` - npm publish `@spectral-zx/toolkit` v0.1.0 (after T-01; verify `npx zxs doctor` works from a clean install)
6. `T-20260611-06` - Gallery site: static page, each game = prompt + model + iterations + transcript + TAP download + "Play in browser" via zx-generation; seed with pong-by-agent
7. `T-20260611-07` - The money-shot video: re-run the Pong experiment recording the terminal (time-lapse, visible self-correction moment)

## Pending

- Windows CI lane (sjasmplus .win.zip path in ci.yml)
- `zxs run --tap` ergonomics: document/automate the J + SYM-P SYM-P LOAD"" dance
- MCP: decide whether zxs-mcp shares `.zxs/session.json` breakpoints (see state.md open questions)

## Blocked

None.

## Done recently

- Phases 0-4 complete — see `recent.md` and git history.
