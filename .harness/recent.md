# Recent Changes

This file summarizes the latest meaningful changes.
Keep 5-10 useful entries, or roughly the last 30 days.
Older details live in git history (commit messages are detailed).

## 2026-06-11 - Phase 4 + milestone: agent builds Pong unassisted

Areas: docs, recipes, templates, src/cli, examples

Summary:
Knowledge layer complete: 8 reference docs (docs/reference/), 6 CI-tested
recipes + `zxs test` declarative runner, `zxs new` scaffold (working QAOP
skeleton + CLAUDE.md/AGENTS.md playbook + local docs copy). Milestone: a
general-purpose agent built a playable Pong from the scaffold in ~8 cycles —
artifact with provenance in `examples/pong-by-agent/`. Found a watchdog
blind spot: crashes into the (halt-synced) BASIC editor produce no hang
verdict; screen observability caught it instead.

Validation: 70 tests green; `zxs test recipes` 6/6; pong specs 2/2.
Commits: `4bfb462`, `c891955`, `069ede6`.

## 2026-06-11 - Phase 3: MCP server

`zxs-mcp` (stdio, @modelcontextprotocol/sdk): persistent Machine, 7 tools,
zx_screen returns PNG as image content + OCR grid. Project `.mcp.json`
committed. Commit `f890711`.

## 2026-06-11 - Phase 2: debugger & tracer

Z80 disassembler (assemble→disassemble→reassemble byte-identical round-trip
vs sjasmplus), SLD symbols (break by label / file:line), watchpoints,
step/--over, hot-spot tracer. Commit `93f9636`.

## 2026-06-11 - Phase 1: agent feedback loop

`.zxstate` sessions (incl. shadow regs + mid-frame position), boot cache,
key plans, ROM-font screen OCR, hang watchdog (exit code 2), SNA load +
.z80 export. Commit `915277d`.

## 2026-06-10 - Phase 0: walking skeleton

Headless Machine composing zx-generation internals, PNG screenshots,
sjasmplus wrapper with JSON diagnostics, zxs build/run/doctor/bench.
Bench ~6,600 fps. Commit `aea5037`.
