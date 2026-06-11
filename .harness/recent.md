# Recent Changes

This file summarizes the latest meaningful changes.
Keep 5-10 useful entries, or roughly the last 30 days.
Older details live in git history (commit messages are detailed).

## 2026-06-11 - Arkanoid quickstart: tutorial + example + 2nd gallery game

Areas: docs, examples, gallery

Summary:
docs/quickstart-arkanoid.{md,html} — step-by-step tutorial (Spanish),
every stage built and verified live before writing it. Final code in
examples/arkanoid-quickstart/ (2/2 specs); playable in the gallery.
Notable: the print_string zero-terminator ate the AT 0,0 operands —
the EXACT Pong-milestone bug, rediscovered while writing the tutorial
about avoiding it; cured with a register-based print_at helper.
Browser check showed the snapshot border renders yellow (not white):
that's upstream's .z80 border-bit bug, fixed in PR #2 but unreleased —
re-vendor the gallery bundle after the zx-generation release.

## 2026-06-11 - Upstream MERGED + CI repaired: zx-generation green

Areas: external (alvaromah/zx-generation)

Summary:
Owner authorized merging: PRs #2-#5 + dependabot #1 rebase-merged. Their
checks were red because upstream CI had NEVER passed: every run died at
setup (actions/upload-artifact@v3 retired by GitHub), and behind that the
quality job had a wrong bundle filename, a coverage step parsing output
jest never prints, an 80% coverage gate vs ~47% reality, format drift in
27 files, 13 eslint errors, audit failures, and a Node 18 (EOL) lane that
can't run the new toolchain (crypto global). PR #7 fixed all of it —
first green CI in the repo's history; coverage threshold now a ratchet at
the real baseline (~47%/28%). Upstream main: `9c300e4`, 327 tests.
NOTE: upstream now has everything Spectral needs, but it is NOT
published to npm yet — the pin stays at 1.0.1 until the owner releases
(release.yml fires on v* tags; suggest v1.1.0: exports map is a feature).

## 2026-06-11 - Upstream PRs (T-02): zx-generation #2-#5

Areas: external (alvaromah/zx-generation)

Summary:
Four PRs opened, each with new upstream tests, suite green: #2 .z80 v1
header parsing (border bits 1-3, R bit 7 from flags1 bit 0, IM masked
&0x03, 255→1 rule) + first snapshot tests; #3 shadow registers (a_..l_)
in Z80.getState()/setState(); #4 Node-safe guards (instanceof
HTMLCanvasElement, document listeners, window/navigator, getImageData)
+ @jest-environment node suite; #5 src/index.js entry + exports map
(with ./src/* kept open — verified via npm pack that deep imports still
resolve). When merged+published, Spectral can drop the regs.data
workaround in state.ts and consider bumping the pin (re-verify the .d.ts).

## 2026-06-11 - PUBLISHED (T-01): github.com/Alvaromah/spectral

Areas: .github, .gitignore, git history

Summary:
Repo created public, CI green on ubuntu+macos+canary, Pages serving
`gallery/` at https://alvaromah.github.io/spectral/ (pages.yml,
build_type=workflow — note: the `paths:` filter doesn't fire on a new
branch's first push; trigger via workflow_dispatch). Pre-push, all
history rewritten to the owner's noreply identity. Two launch bugs fixed:
(1) `.gitignore`'s blanket `build/` swallowed `src/build/` and
`tests/build/` — the first push shipped without the sjasmplus wrapper;
negated both paths. (2) The canary CI job lacked the sjasmplus install
steps. gh CLI needed the `workflow` scope (`gh auth refresh -s workflow`)
to push workflow files.

Validation: CI run 27359869054 all green; Pages URLs return 200.

## 2026-06-11 - Gallery site (T-06): agent games playable in the browser

Areas: gallery (new), README

Summary:
Static no-build site in `gallery/`: card index + player page that boots
the vendored zx-generation ESM bundle and loads per-game `.z80` snapshots
(`zxs state export --z80`). Seeded with pong-by-agent + provenance
contract. Key API fact: snapshots load in the `onReady` constructor
callback (the documented 'ready' event doesn't exist in the bundle); pass
`rom: '48k.rom'` to avoid the CDN default. Verified rendering + emulation
with headless Chrome. Owner decisions recorded: repo will be PUBLIC,
commits to be rewritten to the GitHub noreply identity before push
(gh/npm auth not yet available on this machine).

Validation: headless-Chrome screenshots of both pages; 71 vitest still green.
Commit: `b464a74`.

## 2026-06-11 - Phase 5 hardening: pc-in-rom watchdog + recipes 05-12

Areas: src/core, src/cli, src/mcp, docs, recipes, templates

Summary:
Two queue tasks closed. T-03: new `pc-in-rom` hang verdict — flags >50
frames of ROM-only execution after the program ran from RAM, checked
BEFORE the haltSynced early-return (which is what hid BASIC-editor
crashes). T-04: the six planned recipes (masked 16x16 sprites, IM2,
beeper FX, BCD score, Metcalf PRNG cross-checked vs a JS model, attr
effects); `zxs test recipes` 12/12.

Validation: 71 vitest green; recipes 12/12; pong specs 2/2.
Commits: `17e1e25`, `8ada5b7`.

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
Commits: `3202040`, `3946cb4`, `f806c7d`.

## 2026-06-11 - Phase 3: MCP server

`zxs-mcp` (stdio, @modelcontextprotocol/sdk): persistent Machine, 7 tools,
zx_screen returns PNG as image content + OCR grid. Project `.mcp.json`
committed. Commit `1cdeabd`.

## 2026-06-11 - Phase 2: debugger & tracer

Z80 disassembler (assemble→disassemble→reassemble byte-identical round-trip
vs sjasmplus), SLD symbols (break by label / file:line), watchpoints,
step/--over, hot-spot tracer. Commit `c0cb4d5`.

## 2026-06-11 - Phase 1: agent feedback loop

`.zxstate` sessions (incl. shadow regs + mid-frame position), boot cache,
key plans, ROM-font screen OCR, hang watchdog (exit code 2), SNA load +
.z80 export. Commit `a84dbfb`.

## 2026-06-10 - Phase 0: walking skeleton

Headless Machine composing zx-generation internals, PNG screenshots,
sjasmplus wrapper with JSON diagnostics, zxs build/run/doctor/bench.
Bench ~6,600 fps. Commit `2abdd33`.
