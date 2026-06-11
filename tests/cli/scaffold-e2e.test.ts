import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const cliPath = join(root, 'dist', 'cli', 'index.js');

function zxs(cwd: string, ...args: string[]) {
  const res = spawnSync('node', [cliPath, ...args], { cwd, encoding: 'utf8' });
  return { status: res.status ?? -1, stdout: res.stdout, stderr: res.stderr };
}

describe('zxs new (scaffold)', () => {
  it('creates a working game that passes its own smoke test', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'zxs-new-'));
    const created = zxs(cwd, 'new', 'mygame');
    expect(created.status).toBe(0);

    const project = join(cwd, 'mygame');
    expect(existsSync(join(project, '.gitignore'))).toBe(true); // renamed from 'gitignore'
    expect(existsSync(join(project, 'docs', 'screen-layout.md'))).toBe(true);
    const claudeMd = readFileSync(join(project, 'CLAUDE.md'), 'utf8');
    expect(claudeMd).toContain('mygame');
    expect(claudeMd).toContain('zxs run');

    // The skeleton must build, run HALT-synced, and move under scheduled keys.
    const test = zxs(project, 'test', 'tests', '--json');
    expect(test.status, test.stdout + test.stderr).toBe(0);
  });

  it('rejects existing directories and bad names', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'zxs-new-'));
    expect(zxs(cwd, 'new', 'ok-name').status).toBe(0);
    expect(zxs(cwd, 'new', 'ok-name').status).toBe(1); // already exists
    expect(zxs(cwd, 'new', '../evil').status).toBe(1);
  });
});

describe('zxs test (runner)', () => {
  it('the recipe suite passes', () => {
    const res = zxs(root, 'test', 'recipes', '--json');
    expect(res.status, res.stdout).toBe(0);
    const json = JSON.parse(res.stdout) as { total: number; passed: number };
    expect(json.total).toBeGreaterThanOrEqual(6);
    expect(json.passed).toBe(json.total);
  });
});
