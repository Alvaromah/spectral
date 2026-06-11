import { existsSync, statSync } from 'node:fs';
import { checkToolchain } from '../../build/sjasmplus.js';
import { romPath } from '../../core/rom.js';
import { EXIT, emit } from '../output.js';

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

export async function doctorCommand(opts: { json: boolean }): Promise<number> {
  const checks: Check[] = [];

  const nodeMajor = parseInt(process.versions.node.split('.')[0]!, 10);
  checks.push({
    name: 'node',
    ok: nodeMajor >= 20,
    detail: `v${process.versions.node}` + (nodeMajor >= 20 ? '' : ' (need >= 20)'),
  });

  const toolchain = await checkToolchain();
  checks.push({
    name: 'sjasmplus',
    ok: toolchain.found,
    detail: toolchain.found
      ? `v${toolchain.version ?? 'unknown'}`
      : toolchain.installHint ?? 'not found',
  });

  let romDetail: string;
  let romOk = false;
  try {
    const p = romPath();
    romOk = existsSync(p) && statSync(p).size === 16384;
    romDetail = romOk ? p : `unexpected ROM at ${p}`;
  } catch (err) {
    romDetail = `cannot resolve zx-generation ROM: ${(err as Error).message}`;
  }
  checks.push({ name: '48k.rom', ok: romOk, detail: romDetail });

  const allOk = checks.every((c) => c.ok);
  emit({ ok: allOk, stage: 'doctor', checks }, opts.json, () =>
    checks.map((c) => `${c.ok ? '✓' : '✗'} ${c.name}: ${c.detail}`).join('\n')
  );

  return allOk ? EXIT.OK : EXIT.ENV_ERROR;
}
