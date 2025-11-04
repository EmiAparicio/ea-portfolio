import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/node.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  clean: true,
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    };
  },
});
