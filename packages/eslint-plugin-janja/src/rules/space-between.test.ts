import { RuleTester } from 'eslint';
import { describe } from 'vitest';
import plugin from '../index';
import { spaceBetween } from './space-between';

const ruleTester = new RuleTester({
  plugins: { janja: plugin as any },
  language: 'janja/janja',
});

describe('space-between rule', () => {
  ruleTester.run('space-between [always]', spaceBetween, {
    valid: [{ code: `{{ include "head" }}` }],
    invalid: [
      {
        code: `{{ include  "head" }}`,
        errors: [{ messageId: 'noSpaces' }],
        output: '{{ include "head" }}',
      },
      {
        code: `{{ include   "head" }}`,
        errors: [{ messageId: 'noSpaces' }],
        output: '{{ include "head" }}',
      },
    ],
  });
});
