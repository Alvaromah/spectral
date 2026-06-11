import { Command } from 'commander';
import { benchCommand } from './commands/bench.js';
import { buildCommand } from './commands/build.js';
import { doctorCommand } from './commands/doctor.js';
import { runCommand } from './commands/run.js';
import { EXIT } from './output.js';

const program = new Command();

program
  .name('zxs')
  .description('Spectral — AI agent toolchain for the ZX Spectrum')
  .version('0.0.1');

program
  .command('build')
  .description('Assemble a Z80 source file with sjasmplus (binary + SLD symbols)')
  .argument('<file>', 'entry .asm file')
  .option('--out-dir <dir>', 'output directory', 'build')
  .option('--json', 'machine-readable JSON output', false)
  .action(async (file: string, opts) => {
    process.exitCode = await buildCommand(file, { outDir: opts.outDir, json: opts.json });
  });

program
  .command('run')
  .description('Boot a headless Spectrum, optionally inject a binary or TAP, run frames')
  .option('--bin <file>', 'raw binary to inject into RAM')
  .option('--org <addr>', 'load address for --bin', '0x8000')
  .option('--pc <addr>', 'start address (defaults to --org)')
  .option('--tap <file>', 'TAP/TZX tape to load and play')
  .option('--frames <n>', 'frame budget (50 = 1 second)', '300')
  .option('--until-pc <addr>', 'stop when PC reaches this address')
  .option('--boot-frames <n>', 'frames to boot the ROM before loading', '250')
  .option('--screenshot <file>', 'save a PNG of the final screen')
  .option('--json', 'machine-readable JSON output', false)
  .action(async (opts) => {
    process.exitCode = await runCommand(opts);
  });

program
  .command('doctor')
  .description('Check the toolchain: node, sjasmplus, ROM')
  .option('--json', 'machine-readable JSON output', false)
  .action(async (opts) => {
    process.exitCode = await doctorCommand(opts);
  });

program
  .command('bench')
  .description('Measure headless emulation speed')
  .option('--frames <n>', 'frames to run', '2000')
  .option('--json', 'machine-readable JSON output', false)
  .action((opts) => {
    process.exitCode = benchCommand(opts);
  });

program.parseAsync().catch((err: Error) => {
  console.error(`error: ${err.message}`);
  process.exitCode = EXIT.USER_ERROR;
});
