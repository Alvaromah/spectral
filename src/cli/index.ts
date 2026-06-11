import { Command } from 'commander';
import { benchCommand } from './commands/bench.js';
import { buildCommand } from './commands/build.js';
import { doctorCommand } from './commands/doctor.js';
import { keyCommand, typeCommand } from './commands/input-cmds.js';
import {
  memReadCommand,
  memWriteCommand,
  regsCommand,
  regsSetCommand,
} from './commands/inspect-cmds.js';
import { runCommand } from './commands/run.js';
import { screenCommand } from './commands/screen.js';
import {
  stateExportCommand,
  stateLoadCommand,
  stateResetCommand,
  stateSaveCommand,
} from './commands/state-cmds.js';
import { EXIT } from './output.js';

const program = new Command();

program
  .name('zxs')
  .description('Spectral — AI agent toolchain for the ZX Spectrum')
  .version('0.0.1');

const jsonOpt = ['--json', 'machine-readable JSON output', false] as const;
const stateOpt = ['--state <file>', 'session state file (default .zxs/state.zxstate)'] as const;

program
  .command('build')
  .description('Assemble a Z80 source file with sjasmplus (binary + SLD symbols)')
  .argument('<file>', 'entry .asm file')
  .option('--out-dir <dir>', 'output directory', 'build')
  .option(...jsonOpt)
  .action(async (file: string, opts) => {
    process.exitCode = await buildCommand(file, { outDir: opts.outDir, json: opts.json });
  });

program
  .command('run')
  .description('Run the Spectrum: resumes the session, or boots fresh when loading a program')
  .option('--bin <file>', 'raw binary to inject into RAM (fresh boot)')
  .option('--org <addr>', 'load address for --bin', '0x8000')
  .option('--pc <addr>', 'start address (defaults to --org)')
  .option('--sna <file>', '48K .sna snapshot to load (fresh boot)')
  .option('--z80 <file>', '.z80 v1 snapshot to load (fresh boot)')
  .option('--tap <file>', 'TAP/TZX tape to insert and play (drive the loader via keys)')
  .option('--frames <n>', 'frame budget (50 = 1 second)', '300')
  .option('--until-pc <addr>', 'stop when PC reaches this address')
  .option('--keys <spec>', 'scheduled keys, e.g. "60:O*30,120:SPACE*5"')
  .option('--fresh', 'ignore the session and boot clean', false)
  .option('--no-save', 'do not persist the session state after the run')
  .option('--no-detect-hangs', 'disable the hang/crash watchdog')
  .option(...stateOpt)
  .option('--screenshot <file>', 'save a PNG of the final screen')
  .option('--text', 'include the 32x24 character grid in the report', false)
  .option(...jsonOpt)
  .action(async (opts) => {
    process.exitCode = await runCommand(opts);
  });

program
  .command('screen')
  .description("Observe the session's screen: character grid, attributes, PNG")
  .option('--png <file>', 'save a PNG screenshot')
  .option('--attrs', 'include the attribute summary', false)
  .option('--text', '(default) include the character grid', true)
  .option(...stateOpt)
  .option(...jsonOpt)
  .action((opts) => {
    process.exitCode = screenCommand(opts);
  });

program
  .command('key')
  .description('Press a key in the session (down, hold, up, settle)')
  .argument('<key>', 'A-Z, 0-9, ENTER, SPACE, CAPS_SHIFT, SYMBOL_SHIFT')
  .option('--hold <frames>', 'frames to hold the key', '3')
  .option(...stateOpt)
  .option(...jsonOpt)
  .action((key: string, opts) => {
    process.exitCode = keyCommand(key, opts);
  });

program
  .command('type')
  .description('Type text into the session via the keyboard matrix')
  .argument('<text>')
  .option('--frames-per-key <n>', 'frames each key is held', '3')
  .option(...stateOpt)
  .option(...jsonOpt)
  .action((text: string, opts) => {
    process.exitCode = typeCommand(text, opts);
  });

const mem = program.command('mem').description('Read/write session memory');
mem
  .command('read')
  .argument('<addr>', 'address (0x8000, $8000 or 32768)')
  .option('--len <n>', 'bytes to read', '64')
  .option(...stateOpt)
  .option(...jsonOpt)
  .action((addr: string, opts) => {
    process.exitCode = memReadCommand(addr, opts);
  });
mem
  .command('write')
  .argument('<addr>')
  .argument('<hexBytes>', 'e.g. "3E42" or "3e 42 c9"')
  .option(...stateOpt)
  .option(...jsonOpt)
  .action((addr: string, bytes: string, opts) => {
    process.exitCode = memWriteCommand(addr, bytes, opts);
  });

const regs = program.command('regs').description('Inspect or set CPU registers');
regs
  .option(...stateOpt)
  .option(...jsonOpt)
  .action((opts) => {
    process.exitCode = regsCommand(opts);
  });
regs
  .command('set')
  .argument('<reg>', 'A..L, I, R, AF, BC, DE, HL, SP, IX, IY, PC, IM')
  .argument('<value>')
  .option(...stateOpt)
  .option(...jsonOpt)
  .action((reg: string, value: string, opts) => {
    process.exitCode = regsSetCommand(reg, value, opts);
  });

const state = program.command('state').description('Manage session state files');
state
  .command('save')
  .argument('<file>')
  .option(...stateOpt)
  .option(...jsonOpt)
  .action((file: string, opts) => {
    process.exitCode = stateSaveCommand(file, opts);
  });
state
  .command('load')
  .argument('<file>')
  .option(...stateOpt)
  .option(...jsonOpt)
  .action((file: string, opts) => {
    process.exitCode = stateLoadCommand(file, opts);
  });
state
  .command('reset')
  .option(...stateOpt)
  .option(...jsonOpt)
  .action((opts) => {
    process.exitCode = stateResetCommand(opts);
  });
state
  .command('export')
  .option('--z80 <file>', 'export as .z80 v1 snapshot')
  .option(...stateOpt)
  .option(...jsonOpt)
  .action((opts) => {
    process.exitCode = stateExportCommand(opts);
  });

program
  .command('doctor')
  .description('Check the toolchain: node, sjasmplus, ROM')
  .option(...jsonOpt)
  .action(async (opts) => {
    process.exitCode = await doctorCommand(opts);
  });

program
  .command('bench')
  .description('Measure headless emulation speed')
  .option('--frames <n>', 'frames to run', '2000')
  .option(...jsonOpt)
  .action((opts) => {
    process.exitCode = benchCommand(opts);
  });

program.parseAsync().catch((err: Error) => {
  console.error(`error: ${err.message}`);
  process.exitCode = EXIT.USER_ERROR;
});
