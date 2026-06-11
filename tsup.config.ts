import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'cli/index': 'src/cli/index.ts',
    'mcp/server': 'src/mcp/server.ts',
  },
  format: ['esm'],
  target: 'node20',
  dts: { entry: { index: 'src/index.ts' } },
  sourcemap: true,
  clean: true,
  splitting: false,
  banner({ format }) {
    // bin entries need a shebang; harmless on the library entry too since
    // tsup cannot scope banners per-entry
    return format === 'esm' ? { js: '#!/usr/bin/env node' } : {};
  },
});
