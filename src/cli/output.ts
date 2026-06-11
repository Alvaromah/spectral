/** CLI exit codes, branchable by agents via $?. */
export const EXIT = {
  OK: 0,
  USER_ERROR: 1, // build errors, bad arguments
  HANG: 2, // reserved for Phase 1 hang detection
  ENV_ERROR: 3, // missing toolchain, unreadable ROM
} as const;

export function hex(n: number, width = 4): string {
  return `0x${n.toString(16).toUpperCase().padStart(width, '0')}`;
}

/** Parses 0x8000, $8000, 8000h or decimal 32768. */
export function parseAddress(value: string): number {
  let n: number;
  if (/^0x[0-9a-f]+$/i.test(value)) n = parseInt(value, 16);
  else if (/^\$[0-9a-f]+$/i.test(value)) n = parseInt(value.slice(1), 16);
  else if (/^[0-9a-f]+h$/i.test(value)) n = parseInt(value.slice(0, -1), 16);
  else if (/^\d+$/.test(value)) n = parseInt(value, 10);
  else n = NaN;
  if (Number.isNaN(n) || n < 0 || n > 0xffff) {
    throw new Error(`Invalid 16-bit address: '${value}' (use 0x8000, $8000 or 32768)`);
  }
  return n;
}

/**
 * Prints the result as JSON (machine mode) or human-readable lines.
 * Every command goes through this so agents always get one JSON document.
 */
export function emit(result: object, json: boolean, pretty: () => string): void {
  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(pretty());
  }
}
