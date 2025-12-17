import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import pkg from './package.json' with { type: 'json' }


export default defineConfig([{
  input: 'src/index.ts',
    output: [
      { file: pkg.main, format: 'cjs', exports: 'named' },
      { file: pkg.module, format: 'es', exports: 'named' },
    ],
  external: ['eslint', /^janja\//],
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
  ],
},
  {
    input: 'src/index.ts',
    output: {
      format: 'esm',
      file: pkg.types,
    },
    plugins: [dts()],
  },]);
