import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import pkg from './package.json' with { type: 'json' }

export default defineConfig([
  {
    input: 'index.ts',
    output: {
      name: 'janja',
      file: pkg.browser,
      format: 'iife',
      extend: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
    ],
  },
  {
    input: 'index.ts',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
    ],
  },
  {
    input: 'index.ts',
    output: {
      format: 'esm',
      file: pkg.types,
    },
    plugins: [dts()],
  },
])
