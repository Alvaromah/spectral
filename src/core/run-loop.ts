import type { HangVerdict, Watchdog } from './detect.js';
import type { Machine } from './machine.js';

export const TSTATES_PER_FRAME = 69888;

export type StopReason = 'frames' | 'tstates' | 'until-pc' | 'max-frames' | 'hang';

export interface RunOptions {
  /** Stop after this many complete frames. */
  frames?: number;
  /** Stop after at least this many T-states have elapsed. */
  tstates?: number;
  /** Stop when PC reaches this address (checked before each instruction). */
  untilPC?: number;
  /** Hard safety cap on frames per run() call. */
  maxFrames?: number;
  /** Called at each frame boundary with the frames-run count for this run. */
  onFrame?: (framesRun: number) => void;
  /** Hang/crash classifier; definite verdicts stop the run immediately. */
  watchdog?: Watchdog;
}

export interface RunOutcome {
  reason: StopReason;
  framesRun: number;
  tstatesRun: number;
  pc: number;
  hang?: HangVerdict;
}

const DEFAULT_MAX_FRAMES = 5000;

/**
 * Drives the machine exactly like ZXSpectrum.runFrame() does
 * (zx-generation@1.0.1 src/spectrum/spectrum.js:466), minus sound:
 * execute -> ula.addCycles -> tape.update -> setTapeInput -> interrupt.
 *
 * Unlike upstream, this loop can stop mid-frame (untilPC, hang verdicts);
 * the partial-frame position is kept in machine.tStatesIntoFrame so a later
 * run resumes the same frame where it left off.
 */
export function runMachine(m: Machine, opts: RunOptions = {}): RunOutcome {
  const maxFrames = opts.maxFrames ?? DEFAULT_MAX_FRAMES;
  const targetFrames =
    opts.frames !== undefined ? Math.min(opts.frames, maxFrames) : maxFrames;
  const targetTstates = opts.tstates;
  const untilPC = opts.untilPC;
  const wd = opts.watchdog;

  const { cpu, ula, tape } = m;
  let framesRun = 0;
  let tstatesRun = 0;

  const finish = (reason: StopReason): RunOutcome => {
    // Budget exhaustion is when probable hangs (tight-loop, sp-corrupt) show.
    if (wd && (reason === 'frames' || reason === 'max-frames' || reason === 'tstates')) {
      const verdict = wd.finalize(m, framesRun);
      if (verdict) {
        return { reason: 'hang', framesRun, tstatesRun, pc: cpu.registers.getPC(), hang: verdict };
      }
    }
    return { reason, framesRun, tstatesRun, pc: cpu.registers.getPC() };
  };

  for (;;) {
    const pc = cpu.registers.getPC();
    if (untilPC !== undefined && pc === untilPC) {
      return { reason: 'until-pc', framesRun, tstatesRun, pc };
    }
    if (targetTstates !== undefined && tstatesRun >= targetTstates) {
      return finish('tstates');
    }

    if (wd) {
      const verdict = wd.beforeInstruction(pc, m);
      if (verdict) {
        return { reason: 'hang', framesRun, tstatesRun, pc, hang: verdict };
      }
    }

    const elapsed = cpu.execute();
    ula.addCycles(elapsed);
    ula.setTapeInput(tape.update(cpu.cycles));
    if (ula.shouldGenerateInterrupt()) {
      cpu.interrupt();
    }

    if (wd) {
      const verdict = wd.afterInstruction(cpu);
      if (verdict) {
        return {
          reason: 'hang',
          framesRun,
          tstatesRun: tstatesRun + elapsed,
          pc: cpu.registers.getPC(),
          hang: verdict,
        };
      }
    }

    tstatesRun += elapsed;
    m.tStatesIntoFrame += elapsed;

    if (m.tStatesIntoFrame >= TSTATES_PER_FRAME) {
      m.tStatesIntoFrame -= TSTATES_PER_FRAME;
      m.frameCount++;
      framesRun++;
      wd?.onFrame();
      opts.onFrame?.(framesRun);

      if (opts.frames !== undefined && framesRun >= targetFrames) {
        return finish('frames');
      }
      if (framesRun >= maxFrames) {
        return finish('max-frames');
      }
    }
  }
}
