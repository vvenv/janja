import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: ['**/benchmark/**', '**/coverage/**', '**/dist/**'],
  },
  {
    rules: {
      'no-cond-assign': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'antfu/consistent-chaining': 'error',
    },
  },
)
