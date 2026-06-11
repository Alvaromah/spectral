# Spectral

**AI agents for the ZX Spectrum.**

Spectral is a toolchain that lets AI coding agents (Claude Code, Codex, and
friends) write ZX Spectrum 48K games autonomously, with a real feedback loop:

```
assemble → run headless → observe (screenshot + state) → debug → iterate
```

It is built on [zx-generation](https://github.com/alvaromah/zx-generation), a
cycle-accurate ZX Spectrum emulator in pure JavaScript — itself 100%
LLM-generated. An LLM-written emulator, running LLM-written games.

## Quick start

```bash
npm install
npm run build
node dist/cli/index.js doctor          # check toolchain (needs sjasmplus)

# The agent loop, end to end:
node dist/cli/index.js build game.asm
node dist/cli/index.js run --bin build/game.bin --org 0x8000 \
    --frames 300 --screenshot screen.png --json
```

Every command supports `--json` for machine-readable output. Exit codes:
`0` ok · `1` build/user error · `2` hang detected · `3` environment problem.

You need [sjasmplus](https://github.com/z00m128/sjasmplus) ≥ 1.20 on your
PATH (`zxs doctor` tells you how to install it).

## How fast?

The emulator runs headless in-process — no sockets, no external emulator
binaries. On an Apple Silicon laptop: **~6,600 frames/second, 132× real
hardware (~463 MHz Z80-equivalent)**. Running 5 emulated seconds of a game
costs ~40ms.

## Status

Phase 0 (walking skeleton) — done:

- ✅ Headless 48K Spectrum in Node (boots the real ROM to `© 1982 Sinclair Research Ltd`)
- ✅ `zxs build` — sjasmplus wrapper with structured JSON diagnostics and did-you-mean hints
- ✅ `zxs run` — binary/TAP injection, frame budgets, `--until-pc`, PNG screenshots
- ✅ `zxs doctor` / `zxs bench`
- ✅ Deterministic execution (golden-screenshot tests)

Coming next (see the roadmap): session state files, hang/crash watchdog,
text-mode screen OCR for cheap agent observation, source-level debugger (SLD),
tracer, MCP server (Claude literally *sees* the Spectrum screen), `zxs new`
game scaffolding, agent-optimized reference docs, and a cookbook of CI-tested
Z80 recipes.

## License

MIT. The bundled 48K ROM ships with zx-generation under Amstrad's
long-standing emulator-distribution permission.
