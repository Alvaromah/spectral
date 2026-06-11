import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { build, checkToolchain } from '../../src/build/sjasmplus.js';
import { Machine } from '../../src/core/machine.js';

const fixtures = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const outDir = () => mkdtempSync(join(tmpdir(), 'zxs-build-'));

beforeAll(async () => {
  const status = await checkToolchain();
  if (!status.found) {
    throw new Error('sjasmplus is required for build tests. ' + status.installHint);
  }
});

describe('checkToolchain', () => {
  it('reports the installed version', async () => {
    const status = await checkToolchain();
    expect(status.found).toBe(true);
    expect(status.version).toMatch(/^\d+\.\d+/);
  });

  it('reports a missing assembler with install instructions', async () => {
    const status = await checkToolchain('definitely-not-sjasmplus');
    expect(status.found).toBe(false);
    expect(status.installHint).toContain('github.com/z00m128/sjasmplus');
  });
});

describe('build', () => {
  it('assembles hello.asm into a binary plus SLD', async () => {
    const result = await build(join(fixtures, 'hello.asm'), { outDir: outDir() });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.outputs.bin).toBeDefined();
    expect(result.outputs.sld).toBeDefined();

    const bin = readFileSync(result.outputs.bin!);
    expect(bin.length).toBe(27);
    expect(bin[0]).toBe(0x3e); // ld a,2

    const sld = readFileSync(result.outputs.sld!, 'utf8');
    expect(sld).toContain('|start');
  });

  it('parses diagnostics with source line and did-you-mean hint', async () => {
    const result = await build(join(fixtures, 'bad-label.asm'), { outDir: outDir() });
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(1);
    const err = result.errors[0]!;
    expect(err.file).toContain('bad-label.asm');
    expect(err.line).toBe(5);
    expect(err.severity).toBe('error');
    expect(err.message).toContain('draw_sprtie');
    expect(err.sourceLine).toContain('call draw_sprtie');
    expect(err.hint).toBe("Did you mean 'draw_sprite'?");
  });
});

describe('assemble + execute end-to-end', () => {
  it('runs the assembled hello.asm and prints HELLO ZX to screen memory', async () => {
    const result = await build(join(fixtures, 'hello.asm'), { outDir: outDir() });
    expect(result.ok).toBe(true);

    const m = Machine.boot();
    m.run({ frames: 250 }); // boot to BASIC so ROM channels are initialized
    const bin = new Uint8Array(readFileSync(result.outputs.bin!));
    m.loadBinary(bin, 0x8000);
    m.run({ frames: 10 });

    // The top screen row's first character cells must now contain pixels
    // (HELLO ZX rendered by the ROM font at line 0).
    const screen = m.memory.getScreenMemory();
    let setBytes = 0;
    for (let charRow = 0; charRow < 8; charRow++) {
      for (let col = 0; col < 8; col++) {
        if (screen[charRow * 256 + col] !== 0) setBytes++;
      }
    }
    expect(setBytes).toBeGreaterThan(8);
  });
});
