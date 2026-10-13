import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'

// One CommonJS file with janja bundled in, which is what VS Code loads
export default defineConfig({
  input: 'src/extension.ts',
  external: ['vscode', /^node:/],
  output: {
    file: 'dist/extension.cjs',
    format: 'cjs',
    inlineDynamicImports: true,
  },
  plugins: [resolve(), typescript({ noEmitOnError: true })],
})
