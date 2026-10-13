import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import pkg from './package.json' with { type: 'json' }

// Only reached through dynamic imports, by the Node-only i18n file loader
const external = [/^node:/]

export default defineConfig([
  {
    input: 'src/index.ts',
    external,
    output: [
      {
        name: 'janja',
        file: pkg.browser,
        format: 'iife',
        extend: true,
      },
      {
        name: 'janja',
        file: pkg.unpkg,
        format: 'iife',
        extend: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ noEmitOnError: true }),
    ],
  },
  {
    input: 'src/index.ts',
    external,
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ noEmitOnError: true }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      format: 'esm',
      file: pkg.types,
    },
    plugins: [dts()],
  },
])
