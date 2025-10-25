import { cwd, env } from 'node:process'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  test: {
    env: loadEnv(mode, cwd(), ''),
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
    reporters: env.GITHUB_ACTIONS ? ['github-actions'] : ['default'],
    coverage: {
      enabled: true,
      include: ['src/**/*.ts'],
      reporter: env.GITHUB_ACTIONS ? ['text'] : ['html'],
    },
  },
}))
