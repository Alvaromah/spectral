import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { Machine } from '../core/machine.js';
import { EMULATOR_ID, type ZxState } from '../core/state.js';

/** Frames to boot the ROM before the machine is usable (RAM test + banner). */
export const BOOT_FRAMES = 250;

export function sessionStatePath(stateFile?: string): string {
  return stateFile ?? join(process.cwd(), '.zxs', 'state.zxstate');
}

export function readStateFile(path: string): ZxState {
  return JSON.parse(readFileSync(path, 'utf8')) as ZxState;
}

/** Atomic write (tmp + rename) so a crashed command never corrupts the session. */
export function writeStateFile(path: string, state: ZxState): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(state));
  renameSync(tmp, path);
}

export function loadSessionMachine(stateFile?: string): Machine | null {
  const path = sessionStatePath(stateFile);
  if (!existsSync(path)) return null;
  return Machine.fromState(readStateFile(path));
}

export function saveSessionMachine(m: Machine, stateFile?: string): string {
  const path = sessionStatePath(stateFile);
  writeStateFile(path, m.saveState());
  return path;
}

export function resetSession(stateFile?: string): void {
  rmSync(sessionStatePath(stateFile), { force: true });
}

/* ───────────────────────── boot cache ───────────────────────── */

function bootCachePath(): string {
  const base = process.env['XDG_CACHE_HOME'] ?? join(homedir(), '.cache');
  return join(base, 'zxs', `boot-48k-${EMULATOR_ID.version}-v1.zxstate`);
}

/**
 * A freshly booted machine (ROM banner visible). The boot is deterministic,
 * so it is computed once and cached under ~/.cache/zxs.
 */
export function bootCachedMachine(): Machine {
  const cache = bootCachePath();
  if (existsSync(cache)) {
    try {
      return Machine.fromState(readStateFile(cache));
    } catch {
      rmSync(cache, { force: true }); // stale/corrupt cache: fall through to re-boot
    }
  }
  const m = Machine.boot();
  m.run({ frames: BOOT_FRAMES });
  try {
    writeStateFile(cache, m.saveState());
  } catch {
    // Cache is an optimization; never fail a run because of it.
  }
  return m;
}
