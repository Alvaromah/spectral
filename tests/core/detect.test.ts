import { describe, expect, it } from 'vitest';
import { Watchdog } from '../../src/core/detect.js';
import { Machine } from '../../src/core/machine.js';
import type { RunOutcome } from '../../src/core/run-loop.js';

function runWithWatchdog(program: number[], frames = 100): { outcome: RunOutcome; m: Machine } {
  const m = Machine.boot();
  m.run({ frames: 250 });
  m.loadBinary(new Uint8Array(program), 0x8000);
  const wd = new Watchdog();
  wd.attach(m);
  const outcome = m.run({ frames, watchdog: wd });
  wd.detach();
  return { outcome, m };
}

describe('Watchdog', () => {
  it('di-halt: DI;HALT stops immediately with a definite verdict', () => {
    const { outcome } = runWithWatchdog([0xf3, 0x76]); // DI ; HALT
    expect(outcome.reason).toBe('hang');
    expect(outcome.hang).toMatchObject({ kind: 'di-halt', confidence: 'definite' });
    expect(outcome.framesRun).toBe(0); // caught right away, not after the budget
  });

  it('tight-loop: JR $ is flagged as probable after the budget', () => {
    const { outcome } = runWithWatchdog([0x18, 0xfe]); // JR $
    expect(outcome.reason).toBe('hang');
    expect(outcome.hang).toMatchObject({ kind: 'tight-loop', confidence: 'probable' });
    expect(outcome.hang!.detail).toContain('0x8000');
  });

  it('rom-error: RST 8 from RAM is a definite crash', () => {
    const { outcome } = runWithWatchdog([0xcf, 0x02]); // RST 8 ; error code 2
    expect(outcome.reason).toBe('hang');
    expect(outcome.hang).toMatchObject({ kind: 'rom-error', confidence: 'definite' });
    expect(outcome.hang!.detail).toContain('0x8000');
  });

  it('sp-corrupt: stack pointed into ROM is flagged at budget end', () => {
    // LD SP,0x2000 ; JR $
    const { outcome } = runWithWatchdog([0x31, 0x00, 0x20, 0x18, 0xfe]);
    expect(outcome.reason).toBe('hang');
    expect(outcome.hang!.kind).toBe('sp-corrupt');
  });

  it('healthy HALT-synced loop is NOT flagged', () => {
    // EI ; loop: HALT ; LD A,2 ; OUT (0xFE),A ; JR loop — a normal frame-synced loop
    // (JR offset 0xF9: from 0x8008 back to the HALT at 0x8001)
    const { outcome } = runWithWatchdog([0xfb, 0x76, 0x3e, 0x02, 0xd3, 0xfe, 0x18, 0xf9], 50);
    expect(outcome.reason).toBe('frames');
    expect(outcome.hang).toBeUndefined();
  });

  it('the idle BASIC prompt is NOT flagged (ROM waits are legitimate)', () => {
    const m = Machine.boot();
    m.run({ frames: 250 });
    const wd = new Watchdog();
    wd.attach(m);
    const outcome = m.run({ frames: 100, watchdog: wd });
    wd.detach();
    expect(outcome.reason).toBe('frames');
    expect(outcome.hang).toBeUndefined();
  });
});
