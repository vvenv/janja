import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: ['**/coverage/**', '**/dist/**', '**/perf/**', '**/*.yml'],
  },
  {
    rules: {
      'no-cond-assign': 'off',
      'no-new-func': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'ts/no-unsafe-function-type': 'off',
      'antfu/consistent-chaining': 'error',
      'antfu/top-level-function': 'off',
    },
  },
)
