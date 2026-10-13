import resolve from '@rollup/plugin-node-resolve';
import janja from 'vite-plugin-janja';

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [resolve(), janja()],
};
