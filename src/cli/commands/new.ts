import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT, emit } from '../output.js';

/** Walks up from this module to the package root (the dir holding templates/). */
function toolkitRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'templates', 'game'))) return dir;
    dir = dirname(dir);
  }
  throw new Error('Cannot locate the Spectral templates directory');
}

function copyTemplate(src: string, dest: string, name: string): void {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const from = join(src, entry);
    // npm strips .gitignore from packages; the template ships it unprefixed.
    const to = join(dest, entry === 'gitignore' ? '.gitignore' : entry);
    if (statSync(from).isDirectory()) {
      copyTemplate(from, to, name);
    } else {
      const content = readFileSync(from, 'utf8').replaceAll('__NAME__', name);
      writeFileSync(to, content);
    }
  }
}

export function newCommand(name: string, opts: { json: boolean }): number {
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(name)) {
    console.error(`Invalid project name '${name}' (use letters, digits, - and _)`);
    return EXIT.USER_ERROR;
  }
  const dest = join(process.cwd(), name);
  if (existsSync(dest)) {
    console.error(`Directory already exists: ${dest}`);
    return EXIT.USER_ERROR;
  }

  const root = toolkitRoot();
  copyTemplate(join(root, 'templates', 'game'), dest, name);

  // Same playbook under the name Codex-style agents look for.
  writeFileSync(join(dest, 'AGENTS.md'), readFileSync(join(dest, 'CLAUDE.md'), 'utf8'));

  // Local copy of the reference docs so the agent reads files, not URLs.
  const docsSrc = join(root, 'docs', 'reference');
  if (existsSync(docsSrc)) {
    cpSync(docsSrc, join(dest, 'docs'), { recursive: true });
  }

  const next = [
    `cd ${name}`,
    'zxs build src/main.asm',
    'zxs run --bin build/main.bin --org 0x8000 --frames 300 --screenshot screen.png',
    'zxs test tests',
  ];
  emit(
    { ok: true, stage: 'new', project: dest, next },
    opts.json,
    () =>
      [
        `Created ${name}/ — a working QAOP skeleton game.`,
        'The agent playbook is in CLAUDE.md; reference docs in docs/.',
        '',
        ...next.map((n) => `  ${n}`),
      ].join('\n')
  );
  return EXIT.OK;
}
