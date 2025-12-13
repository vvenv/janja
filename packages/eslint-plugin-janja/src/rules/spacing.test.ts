import { RuleTester } from 'eslint';
import { describe } from 'vitest';
import plugin from '../index';
import { spacing } from './spacing';

const ruleTester = new RuleTester({
  plugins: { janja: plugin as any },
  language: 'janja/janja',
});

describe('spacing rule', () => {
  ruleTester.run('spacing', spacing, {
    valid: [
      {
        code: '{{ x }}',
      },
      {
        code: '{{- x -}}',
      },
    ],

    invalid: [
      {
        code: '{{x}}',
        errors: [
          {
            messageId: 'oneSpace',
          },
        ],
        output: '{{ x }}',
      },
      {
        code: '{{x }}',
        errors: [
          {
            messageId: 'oneSpace',
          },
        ],
        output: '{{ x }}',
      },
      {
        code: '{{ x}}',
        errors: [
          {
            messageId: 'oneSpace',
          },
        ],
        output: '{{ x }}',
      },
      {
        code: '{{-x-}}',
        errors: [
          {
            messageId: 'oneSpace',
          },
        ],
        output: '{{- x -}}',
      },
      {
        code: `1234
        {{-include "head"-}}
        5678`,
        errors: [
          {
            messageId: 'oneSpace',
          },
        ],
        output: `1234
        {{- include "head" -}}
        5678`,
      },
    ],
  });

  // always mode: require one space around content
  ruleTester.run('spacing (always)', spacing, {
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

  // never mode: disallow spaces around content
  ruleTester.run('spacing (never)', spacing, {
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
