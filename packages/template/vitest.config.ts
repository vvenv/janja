import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    test: {
      env: loadEnv(mode, process.cwd(), ''),
      include: ['**/*.test.ts'],
      exclude: ['**/node_modules/**'],
      coverage: {
        enabled: true,
        reporter: [['html'], ['json-summary'], ['json']],
      },
    },
  };
});
