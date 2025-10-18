import { cwd, env } from 'node:process'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  test: {
    env: loadEnv(mode, cwd(), ''),
    include: ['packages/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
    reporters: env.GITHUB_ACTIONS ? ['github-actions'] : ['default'],
    coverage: {
      enabled: true,
      include: ['packages/**/*.ts'],
      reporter: env.GITHUB_ACTIONS ? ['text'] : ['html'],
    },
    resolve: {
      alias: {
        '@jj/expression': '../packages/expression',
        '@jj/template': '../packages/template',
        '@jj/utils': '../packages/utils',
      },
    },
  },
}))
