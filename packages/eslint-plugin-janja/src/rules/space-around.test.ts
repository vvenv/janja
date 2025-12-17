import { RuleTester } from 'eslint';
import { describe } from 'vitest';
import plugin from '../index';
import { spaceAround } from './space-around';

const ruleTester = new RuleTester({
  plugins: { janja: plugin as any },
  language: 'janja/janja',
});

describe('space-around rule', () => {
  ruleTester.run('space-around [always]', spaceAround, {
    valid: [
      { code: '{{ x }}' },
      { code: '{{- x -}}' },
      { code: `{{ include "head" }}` },
    ],
    invalid: [
      { code: '{{x}}', errors: [{ messageId: 'oneSpace' }], output: '{{ x }}' },
      {
        code: '{{x }}',
        errors: [{ messageId: 'oneSpace' }],
        output: '{{ x }}',
      },
      {
        code: '{{ x}}',
        errors: [{ messageId: 'oneSpace' }],
        output: '{{ x }}',
      },
      {
        code: '{{-x-}}',
        errors: [{ messageId: 'oneSpace' }],
        output: '{{- x -}}',
      },
    ],
  });

  ruleTester.run('space-around [never]', spaceAround, {
    valid: [
      { code: '{{x}}', options: ['never'] },
      { code: '{{-x-}}', options: ['never'] },
      { code: `{{include "head"}}`, options: ['never'] },
    ],
    invalid: [
      {
        code: '{{ x }}',
        options: ['never'],
        errors: [{ messageId: 'noSpaces' }],
        output: '{{x}}',
      },
      {
        code: '{{- x -}}',
        options: ['never'],
        errors: [{ messageId: 'noSpaces' }],
        output: '{{-x-}}',
      },
      {
        code: `{{ include "head" }}`,
        options: ['never'],
        errors: [{ messageId: 'noSpaces' }],
        output: `{{include "head"}}`,
      },
    ],
  });
});
