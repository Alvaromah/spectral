# T-20260611-07 — Video runbook (owner records; prep is ready)

Status: pending (owner must record)

## Goal

Time-lapse of an agent building Pong unassisted, with one clearly visible
self-correction moment. ~60-90s final cut.

## Setup (5 min)

1. `mkdir /tmp/pong-take2 && cd /tmp/pong-take2 && zxs new pong` —
   fresh scaffold, NOT the existing example.
2. Terminal: big font (18pt+), dark theme, window sized 16:9-ish.
3. Recorder, either:
   - `brew install asciinema agg` → `asciinema rec pong.cast` (best:
     re-renderable, speed-adjustable with `agg --speed 8 pong.cast out.gif`)
   - or macOS Cmd+Shift+5 screen recording of the terminal window.
4. Start Claude Code in the scaffold dir. Prompt (same spirit as the
   milestone — minimal, no hand-holding):
   > Build a playable Pong. Follow CLAUDE.md.

## What to capture

- The loop: build → run → screenshot/OCR → fix. Every cycle on camera.
- THE moment: a failure verdict (exit 2 / hang report / wrong screen)
  followed by the agent diagnosing and fixing it. With `pc-in-rom` live,
  a crash into the BASIC editor now gets named on screen — gold.
- Finale: `zxs test tests` green + the game playing (`--keys` demo run
  + `zxs screen --png final.png`).

## Post

- Time-lapse everything except the self-correction (play that at 1x).
- Keep the FULL transcript — it becomes `transcript.md` in the gallery.
- Gallery entry per `gallery/README.md`: meta.json (prompt, model,
  cycles, tool calls, wall clock), `zxs state export --z80 game.z80`,
  screen.png, transcript.md; append id to `games/index.json`.
- README: embed the gif near the milestone bullet.
