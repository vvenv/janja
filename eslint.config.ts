import { defineConfig } from 'eslint/config';
import _import from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import { parser as tsParser, plugin as tsPlugin } from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['**/coverage/**', '**/dist/**', '**/*.yml'],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      prettier,
      import: _import,
      '@typescript-eslint': tsPlugin,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        requireConfigFile: true,
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts'],
      },

      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: '.',
        },
      },
    },
    rules: {
      'array-bracket-newline': ['error', 'consistent'],
      'array-bracket-spacing': 'error',
      'array-callback-return': 'error',
      'arrow-parens': ['error', 'always'],
      'arrow-spacing': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'comma-spacing': 'error',

      complexity: [
        'error',
        {
          max: 50,
        },
      ],

      curly: 'error',

      'default-case': [
        'error',
        {
          commentPattern: '^no default$',
        },
      ],

      'dot-location': ['error', 'property'],
      'eol-last': ['error', 'always'],
      eqeqeq: ['error', 'smart'],
      'getter-return': 'error',

      indent: 'off',

      'keyword-spacing': 'error',
      'linebreak-style': 'error',
      'lines-between-class-members': 'error',
      'max-classes-per-file': 'off',

      'max-depth': [
        'error',
        {
          max: 5,
        },
      ],

      'max-len': [
        'error',
        {
          code: 80,
          ignoreComments: true,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreUrls: true,
          tabWidth: 2,
        },
      ],

      'max-lines': [
        'error',
        {
          max: 500,
        },
      ],

      'max-lines-per-function': [
        'error',
        {
          max: 300,
        },
      ],

      'max-statements-per-line': [
        'error',
        {
          max: 1,
        },
      ],

      'new-parens': 'error',
      'no-caller': 'error',
      'no-cond-assign': ['error', 'except-parens'],
      'no-const-assign': 'error',

      'no-constant-condition': [
        'error',
        {
          checkLoops: false,
        },
      ],

      'no-control-regex': 'error',
      'no-delete-var': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-duplicate-imports': 'error',
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-eval': 'error',
      'no-ex-assign': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-label': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-implied-eval': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-iterator': 'error',
      'no-label-var': 'error',

      'no-labels': [
        'error',
        {
          allowLoop: true,
          allowSwitch: false,
        },
      ],

      'no-lone-blocks': 'error',
      'no-loop-func': 'error',

      'no-mixed-operators': [
        'error',
        {
          allowSamePrecedence: false,

          groups: [
            ['&', '|', '^', '~', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof'],
          ],
        },
      ],

      'no-multi-assign': 'error',
      'no-multi-spaces': 'error',
      'no-multi-str': 'error',

      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
        },
      ],

      'no-native-reassign': 'error',
      'no-negated-in-lhs': 'error',
      'no-new-func': 'error',
      'no-new-object': 'error',
      'no-new-symbol': 'error',
      'no-new-wrappers': 'error',
      'no-obj-calls': 'error',
      'no-octal': 'error',
      'no-octal-escape': 'error',
      'no-regex-spaces': 'error',
      'no-restricted-globals': 'error',

      'no-restricted-properties': [
        'error',
        {
          message: 'Please use import() instead.',
          object: 'require',
          property: 'ensure',
        },
        {
          message: 'Please use import() instead.',
          object: 'System',
          property: 'import',
        },
      ],

      'no-restricted-syntax': ['error', 'WithStatement'],
      'no-script-url': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-shadow-restricted-names': 'error',
      'no-sparse-arrays': 'error',
      'no-template-curly-in-string': 'error',
      'no-this-before-super': 'error',
      'no-throw-literal': 'error',
      'no-undef': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-unused-labels': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',

      'no-useless-rename': [
        'error',
        {
          ignoreDestructuring: false,
          ignoreExport: false,
          ignoreImport: false,
        },
      ],

      'no-var': 'error',
      'no-whitespace-before-property': 'error',
      'no-with': 'error',

      'object-curly-newline': [
        'error',
        {
          consistent: true,
          multiline: true,
        },
      ],

      'object-curly-spacing': ['error', 'always'],

      'object-property-newline': [
        'error',
        {
          allowAllPropertiesOnSameLine: true,
        },
      ],

      'object-shorthand': [
        'error',
        'always',
        {
          avoidQuotes: true,
          ignoreConstructors: false,
        },
      ],

      'one-var': ['error', 'never'],
      'one-var-declaration-per-line': ['error', 'always'],
      'operator-linebreak': 'error',

      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          next: '*',
          prev: '*',
        },
        {
          blankLine: 'any',
          next: 'import',
          prev: 'import',
        },
        {
          blankLine: 'any',
          next: 'export',
          prev: 'export',
        },
        {
          blankLine: 'any',
          next: 'const',
          prev: 'const',
        },
        {
          blankLine: 'any',
          next: 'let',
          prev: 'let',
        },
        {
          blankLine: 'any',
          next: 'expression',
          prev: 'expression',
        },
        {
          blankLine: 'any',
          next: ['case', 'default'],
          prev: '*',
        },
      ],

      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'prefer-destructuring': 'error',
      'prefer-regex-literals': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      'quote-props': ['error', 'as-needed'],

      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],

      radix: 'error',
      'require-yield': 'error',
      'rest-spread-spacing': ['error', 'never'],
      semi: ['error', 'always'],
      'semi-spacing': 'error',
      'semi-style': ['error', 'last'],

      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],

      'space-in-parens': 'error',
      'space-infix-ops': 'error',

      'spaced-comment': [
        'error',
        'always',
        {
          markers: ['/'],
        },
      ],

      strict: ['error', 'never'],
      'template-curly-spacing': ['error', 'never'],
      'unicode-bom': ['error', 'never'],
      'use-isnan': 'error',
      'valid-typeof': 'error',
      'import/first': 'error',
      'import/no-amd': 'error',
      'import/no-cycle': 'error',
      'import/no-default-export': 'error',
      'import/no-deprecated': 'warn',
      'import/no-duplicates': 'error',
      'import/no-extraneous-dependencies': 'error',
      'import/no-unresolved': 'error',
      'import/no-unused-modules': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-webpack-loader-syntax': 'error',

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],

          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
          },

          'newlines-between': 'never',
        },
      ],

      '@typescript-eslint/consistent-type-assertions': 'error',
      'no-array-constructor': 'off',
      '@typescript-eslint/no-array-constructor': 'error',
      'no-use-before-define': 'off',

      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: false,
          variables: false,
          typedefs: false,
        },
      ],

      'no-unused-expressions': 'off',

      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],

      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
          ignoreRestSiblings: true,
        },
      ],

      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'error',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',

      'prettier/prettier': 'error',

      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'max-classes-per-file': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
    },
  },
  {
    files: ['**/*.config.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
]);
