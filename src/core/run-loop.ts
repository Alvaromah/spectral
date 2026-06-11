import type { Machine } from './machine.js';

export const TSTATES_PER_FRAME = 69888;

export type StopReason = 'frames' | 'tstates' | 'until-pc' | 'max-frames';

export interface RunOptions {
  /** Stop after this many complete frames. */
  frames?: number;
  /** Stop after at least this many T-states have elapsed. */
  tstates?: number;
  /** Stop when PC reaches this address (checked before each instruction). */
  untilPC?: number;
  /** Hard safety cap on frames per run() call. */
  maxFrames?: number;
  /** Called at each frame boundary with the new frame count. */
  onFrame?: (frameCount: number) => void;
}

export interface RunOutcome {
  reason: StopReason;
  framesRun: number;
  tstatesRun: number;
  pc: number;
}

const DEFAULT_MAX_FRAMES = 5000;

/**
 * Drives the machine exactly like ZXSpectrum.runFrame() does
 * (zx-generation@1.0.1 src/spectrum/spectrum.js:466), minus sound:
 * execute -> ula.addCycles -> tape.update -> setTapeInput -> interrupt.
 *
 * Unlike upstream, this loop can stop mid-frame (untilPC); the partial-frame
 * position is kept in machine.tStatesIntoFrame so a later run resumes the
 * same frame where it left off.
 */
export function runMachine(m: Machine, opts: RunOptions = {}): RunOutcome {
  const maxFrames = opts.maxFrames ?? DEFAULT_MAX_FRAMES;
  const targetFrames =
    opts.frames !== undefined ? Math.min(opts.frames, maxFrames) : maxFrames;
  const targetTstates = opts.tstates;
  const untilPC = opts.untilPC;

  const { cpu, ula, tape } = m;
  let framesRun = 0;
  let tstatesRun = 0;

  for (;;) {
    if (untilPC !== undefined && cpu.registers.getPC() === untilPC) {
      return { reason: 'until-pc', framesRun, tstatesRun, pc: untilPC };
    }
    if (targetTstates !== undefined && tstatesRun >= targetTstates) {
      return { reason: 'tstates', framesRun, tstatesRun, pc: cpu.registers.getPC() };
    }

    const elapsed = cpu.execute();
    ula.addCycles(elapsed);
    ula.setTapeInput(tape.update(cpu.cycles));
    if (ula.shouldGenerateInterrupt()) {
      cpu.interrupt();
    }

    tstatesRun += elapsed;
    m.tStatesIntoFrame += elapsed;

    if (m.tStatesIntoFrame >= TSTATES_PER_FRAME) {
      m.tStatesIntoFrame -= TSTATES_PER_FRAME;
      m.frameCount++;
      framesRun++;
      opts.onFrame?.(m.frameCount);

      if (opts.frames !== undefined && framesRun >= targetFrames) {
        return { reason: 'frames', framesRun, tstatesRun, pc: cpu.registers.getPC() };
      }
      if (framesRun >= maxFrames) {
        return { reason: 'max-frames', framesRun, tstatesRun, pc: cpu.registers.getPC() };
      }
    }
  }
}
