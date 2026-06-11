import { relative } from 'node:path';
import { build } from '../../build/sjasmplus.js';
import { EXIT, emit } from '../output.js';
import { loadSessionMeta, saveSessionMeta } from '../session.js';

export interface BuildCommandOptions {
  outDir: string;
  json: boolean;
}

export async function buildCommand(entry: string, opts: BuildCommandOptions): Promise<number> {
  const result = await build(entry, { outDir: opts.outDir });

  // Record the SLD path so break/disasm/trace can resolve labels and lines.
  if (result.ok && result.outputs.sld) {
    const meta = loadSessionMeta();
    meta.symbolsPath = result.outputs.sld;
    saveSessionMeta(meta);
  }

  const summary = {
    ok: result.ok,
    stage: 'build',
    entry,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    errors: result.errors,
    warnings: result.warnings,
    outputs: result.outputs,
    durationMs: result.durationMs,
    next: result.ok
      ? [`zxs run --bin ${rel(result.outputs.bin)} --org 0x8000 --frames 300 --screenshot screen.png`]
      : [`fix ${result.errors[0]?.file}:${result.errors[0]?.line}, then rerun zxs build`],
  };

  emit(summary, opts.json, () => {
    if (result.ok) {
      const lines = [`OK  ${rel(result.outputs.bin)} (${result.durationMs}ms)`];
      if (result.outputs.sld) lines.push(`    symbols: ${rel(result.outputs.sld)}`);
      for (const w of result.warnings) {
        lines.push(`warning ${w.file}:${w.line}: ${w.message}`);
      }
      return lines.join('\n');
    }
    return result.errors
      .map((e) => {
        let s = `${e.file}:${e.line}: error: ${e.message}`;
        if (e.sourceLine) s += `\n    ${e.sourceLine.trim()}`;
        if (e.hint) s += `\n    hint: ${e.hint}`;
        return s;
      })
      .join('\n');
  });

  return result.ok ? EXIT.OK : EXIT.USER_ERROR;
}

function rel(p: string | undefined): string {
  return p ? relative(process.cwd(), p) : '';
}
