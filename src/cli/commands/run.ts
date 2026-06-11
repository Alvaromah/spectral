import { readFileSync, writeFileSync } from 'node:fs';
import { Machine } from '../../core/machine.js';
import { screenshotPNG } from '../../core/screen.js';
import { EXIT, emit, hex, parseAddress } from '../output.js';

export interface RunCommandOptions {
  bin?: string;
  org: string;
  pc?: string;
  tap?: string;
  frames: string;
  untilPc?: string;
  bootFrames: string;
  screenshot?: string;
  json: boolean;
}

/**
 * Phase 0 run: boot fresh, optionally inject a binary (or load a TAP),
 * run a frame budget, report state and optionally capture a screenshot.
 * Session/state-file persistence arrives in Phase 1.
 */
export async function runCommand(opts: RunCommandOptions): Promise<number> {
  const bootFrames = parseInt(opts.bootFrames, 10);
  const frames = parseInt(opts.frames, 10);

  const m = Machine.boot();
  m.run({ frames: bootFrames });

  let loaded: string | undefined;
  if (opts.bin) {
    const org = parseAddress(opts.org);
    const data = new Uint8Array(readFileSync(opts.bin));
    m.loadBinary(data, org, opts.pc !== undefined ? { pc: parseAddress(opts.pc) } : {});
    loaded = `${opts.bin} @ ${hex(org)}`;
  } else if (opts.tap) {
    m.loadTap(new Uint8Array(readFileSync(opts.tap)), opts.tap);
    m.playTape();
    loaded = opts.tap;
  }

  const started = performance.now();
  const outcome = m.run({
    frames,
    ...(opts.untilPc !== undefined ? { untilPC: parseAddress(opts.untilPc) } : {}),
  });
  const wallTimeMs = Math.round(performance.now() - started);

  let screenshotPath: string | undefined;
  if (opts.screenshot) {
    writeFileSync(opts.screenshot, screenshotPNG(m));
    screenshotPath = opts.screenshot;
  }

  const screen = m.memory.getScreenMemory();
  let nonBlankBytes = 0;
  for (const b of screen) if (b !== 0) nonBlankBytes++;

  const regs = m.getRegisters();
  const result = {
    ok: true,
    stage: 'run',
    status: 'ok',
    ...(loaded !== undefined ? { loaded } : {}),
    exit: { reason: outcome.reason, pc: hex(outcome.pc) },
    framesRun: outcome.framesRun,
    tstatesRun: outcome.tstatesRun,
    wallTimeMs,
    registers: {
      pc: hex(regs.pc),
      sp: hex(regs.sp),
      af: hex(regs.af),
      bc: hex(regs.bc),
      de: hex(regs.de),
      hl: hex(regs.hl),
      ix: hex(regs.ix),
      iy: hex(regs.iy),
      im: regs.im,
      iff1: regs.iff1,
      halted: regs.halted,
    },
    screen: {
      nonBlankBytes,
      borderColor: m.ula.getBorderColor(),
      ...(screenshotPath !== undefined ? { png: screenshotPath } : {}),
    },
    next: screenshotPath
      ? [`inspect ${screenshotPath}`]
      : ['rerun with --screenshot screen.png to see the display'],
  };

  emit(result, opts.json, () =>
    [
      `ran ${outcome.framesRun} frames (${outcome.tstatesRun} T-states) in ${wallTimeMs}ms — stopped: ${outcome.reason}`,
      `PC=${hex(regs.pc)} SP=${hex(regs.sp)} AF=${hex(regs.af)} HL=${hex(regs.hl)} halted=${regs.halted}`,
      `screen: ${nonBlankBytes} non-blank bitmap bytes, border ${m.ula.getBorderColor()}` +
        (screenshotPath ? `, saved ${screenshotPath}` : ''),
    ].join('\n')
  );

  return EXIT.OK;
}
