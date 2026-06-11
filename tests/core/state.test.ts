import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { Machine } from '../../src/core/machine.js';
import { writeZ80v1 } from '../../src/core/state.js';

function fingerprint(m: Machine): string {
  const h = createHash('sha256');
  h.update(m.memory.ram);
  h.update(JSON.stringify(m.getRegisters()));
  h.update(`${m.frameCount}:${m.tStatesIntoFrame}`);
  return h.digest('hex');
}

describe('.zxstate round-trip', () => {
  it('run 100 + save/restore + run 100 ≡ run 200 straight', () => {
    const straight = Machine.boot();
    straight.run({ frames: 200 });

    const first = Machine.boot();
    first.run({ frames: 100 });
    const resumed = Machine.fromState(first.saveState());
    resumed.run({ frames: 100 });

    expect(fingerprint(resumed)).toBe(fingerprint(straight));
  });

  it('preserves shadow registers (the upstream getState() gap)', () => {
    const m = Machine.boot();
    m.run({ frames: 10 });
    m.cpu.registers.data['A_'] = 0xab;
    m.cpu.registers.data['H_'] = 0xcd;
    m.cpu.registers.data['L_'] = 0xef;

    const restored = Machine.fromState(m.saveState());
    const regs = restored.getRegisters();
    expect(regs.afPrime >> 8).toBe(0xab);
    expect(regs.hlPrime).toBe(0xcdef);
  });

  it('preserves mid-frame position', () => {
    const m = Machine.boot();
    m.run({ tstates: 100_000 }); // stops mid-frame
    expect(m.tStatesIntoFrame).toBeGreaterThan(0);

    const restored = Machine.fromState(m.saveState());
    expect(restored.tStatesIntoFrame).toBe(m.tStatesIntoFrame);
    expect(restored.frameCount).toBe(m.frameCount);
  });
});

describe('.z80 v1 export', () => {
  it('round-trips through the upstream loader (registers + RAM)', () => {
    const m = Machine.boot();
    m.run({ frames: 120 });
    const program = new Uint8Array([0x3e, 0x42, 0x18, 0xfe]); // LD A,0x42 ; JR $
    m.loadBinary(program, 0x8000);
    m.run({ tstates: 100 });
    m.cpu.registers.data['B_'] = 0x99; // exercise a shadow register

    const snapshot = writeZ80v1(m);
    expect(snapshot.length).toBe(30 + 49152);

    const loaded = Machine.boot();
    loaded.loadZ80(snapshot);

    const a = m.getRegisters();
    const b = loaded.getRegisters();
    expect(b.pc).toBe(a.pc);
    expect(b.sp).toBe(a.sp);
    expect(b.af).toBe(a.af);
    expect(b.hl).toBe(a.hl);
    expect(b.bcPrime).toBe(a.bcPrime);
    expect(b.im).toBe(a.im);
    expect(Buffer.from(loaded.memory.ram).equals(Buffer.from(m.memory.ram))).toBe(true);
  });
});
