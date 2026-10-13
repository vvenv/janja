import { defineConfig } from 'vite';
import janja from 'vite-plugin-janja';

export default defineConfig({
  plugins: [janja()],
});
