# Recipes — tested, copyable Z80 building blocks

Every recipe is **executable documentation**: `recipe.asm` is the includable
routine (documented in/out/clobbers), `demo.asm` builds standalone, and
`test.json` asserts its behavior in CI via `zxs test recipes`. If it's here,
it works.

| Recipe | Gives you |
|---|---|
| `01-clear-screen` | `clear_screen` — bitmap + attributes in one call |
| `02-print-rom` | `print_init` + `print_string` — ROM printing with AT/INK codes |
| `03-pixel-address` | `pixel_addr` + `plot_pixel` — the interleave formula as code |
| `04-sprite-xor-8x8` | `cell_addr` + `sprite_xor_8x8` — no-trails XOR sprites |
| `06-keyboard-qaop` | `read_qaop` — QAOP+Space into one byte (CPL done for you) |
| `07-game-loop` | The HALT-synced loop structure, demoed with all of the above |

Planned next: masked 16×16 sprites, IM2 setup, beeper SFX, BCD score,
PRNG, attribute effects.

Usage from your game: `INCLUDE "path/to/recipe.asm"` (labels are global —
include each recipe once). The numbering leaves gaps for the planned set.
