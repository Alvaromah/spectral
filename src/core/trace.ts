import type { Machine } from './machine.js';

/**
 * Instruction-level tracer: a full PC histogram (Uint32Array(65536), ~256KB)
 * plus a ring buffer of the most recent PCs. Cheap enough to run for
 * thousands of frames; disassembly happens post-hoc from current memory
 * (self-modifying code may therefore disassemble differently than executed).
 */
export class Tracer {
  private readonly hist = new Uint32Array(0x10000);
  private readonly ring: Uint16Array;
  private idx = 0;
  private total = 0;

  constructor(ringSize = 256) {
    this.ring = new Uint16Array(ringSize);
  }

  onInstruction(pc: number): void {
    const i = pc & 0xffff;
    this.hist[i] = (this.hist[i] ?? 0) + 1;
    this.ring[this.idx] = pc;
    this.idx = (this.idx + 1) % this.ring.length;
    this.total++;
  }

  get instructionCount(): number {
    return this.total;
  }

  /** The last `k` executed PCs, oldest first. */
  lastPCs(k: number): number[] {
    const n = Math.min(k, this.total, this.ring.length);
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      out.push(this.ring[(this.idx - n + i + this.ring.length * 2) % this.ring.length]!);
    }
    return out;
  }

  /** Hottest PCs by execution count. */
  topHot(n: number): { pc: number; count: number }[] {
    const entries: { pc: number; count: number }[] = [];
    for (let pc = 0; pc < 0x10000; pc++) {
      const count = this.hist[pc]!;
      if (count > 0) entries.push({ pc, count });
    }
    entries.sort((a, b) => b.count - a.count);
    return entries.slice(0, n);
  }
}

/* ───────────────────── watchpoints ───────────────────── */

export interface Watchpoint {
  id: number;
  type: 'read' | 'write';
  from: number;
  to: number;
}

export interface WatchHit {
  id: number;
  type: 'read' | 'write';
  addr: number;
  value: number;
  /** PC of the instruction that triggered the access (filled by the run loop). */
  pc?: number;
}

/**
 * Patches memory.read/write on the machine instance to detect accesses to
 * watched ranges. The run loop checks `hit` after each instruction and stops.
 * Note: read watchpoints on code ranges also fire on opcode fetches — every
 * CPU memory access flows through these two methods.
 */
export class WatchpointMonitor {
  hit: WatchHit | null = null;
  private origRead: ((addr: number) => number) | undefined;
  private origWrite: ((addr: number, value: number) => void) | undefined;
  private machine: Machine | undefined;

  constructor(private readonly points: readonly Watchpoint[]) {}

  attach(m: Machine): void {
    this.machine = m;
    const mem = m.memory;
    this.origRead = mem.read.bind(mem);
    this.origWrite = mem.write.bind(mem);
    const reads = this.points.filter((p) => p.type === 'read');
    const writes = this.points.filter((p) => p.type === 'write');
    const self = this;

    if (reads.length > 0) {
      mem.read = function (addr: number): number {
        const value = self.origRead!(addr);
        if (!self.hit) {
          const a = addr & 0xffff;
          for (const p of reads) {
            if (a >= p.from && a <= p.to) {
              self.hit = { id: p.id, type: 'read', addr: a, value };
              break;
            }
          }
        }
        return value;
      };
    }
    if (writes.length > 0) {
      mem.write = function (addr: number, value: number): void {
        if (!self.hit) {
          const a = addr & 0xffff;
          for (const p of writes) {
            if (a >= p.from && a <= p.to) {
              self.hit = { id: p.id, type: 'write', addr: a, value: value & 0xff };
              break;
            }
          }
        }
        self.origWrite!(addr, value);
      };
    }
  }

  detach(): void {
    if (this.machine) {
      if (this.origRead) this.machine.memory.read = this.origRead;
      if (this.origWrite) this.machine.memory.write = this.origWrite;
    }
    this.machine = undefined;
    this.origRead = undefined;
    this.origWrite = undefined;
  }

  takeHit(): WatchHit | null {
    const h = this.hit;
    this.hit = null;
    return h;
  }
}
