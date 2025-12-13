import type { Rule } from 'eslint';
import type { Token } from 'janja';
import type { AST } from 'src/language';
import type { Parser } from '../parser';

type Mode = 'always' | 'never';

function checkSpacing(token: Token, mode: Mode) {
  const { val } = token;

  const trimmed = val.trim();

  if (trimmed === '') {
    return { valid: true };
  }

  if (mode === 'always') {
    const correctLeadingSpace = val.startsWith(' ') && !val.startsWith('  ');
    const correctTrailingSpace = val.endsWith(' ') && !val.endsWith('  ');

    if (correctLeadingSpace && correctTrailingSpace) {
      return { valid: true };
    }

    const expected = ` ${trimmed} `;

    return { valid: false, expected };
  }

  // mode === 'never'
  const hasLeadingSpace = val.startsWith(' ');
  const hasTrailingSpace = val.endsWith(' ');

  if (!hasLeadingSpace && !hasTrailingSpace) {
    return { valid: true };
  }

  return { valid: false, expected: trimmed };
}

export const spacing: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent spacing in Janja template expressions',
      recommended: true,
    },
    fixable: 'whitespace',
    schema: [
      {
        type: 'string',
        enum: ['always', 'never'],
        default: 'always',
      },
    ],
    messages: {
      oneSpace: 'should have exactly one space around content',
      noSpaces: 'should not have spaces around content',
    },
  },

  // @ts-ignore
  create(context) {
    const mode: Mode = (context.options && context.options[0]) || 'always';

    return {
      ROOT() {},
      DIRECTIVE(token: Token, _ast: AST, parser: Parser) {
        const check = checkSpacing(token, mode);

        if (!check.valid && check.expected) {
          context.report({
            loc: token.loc,
            messageId: mode === 'always' ? 'oneSpace' : 'noSpaces',
            fix(fixer) {
              const start = context.sourceCode.getIndexFromLoc(token.loc.start);
              const end = context.sourceCode.getIndexFromLoc(token.loc.end);

              return fixer.replaceTextRange(
                [start, end],
                parser.format({
                  ...token,
                  val: check.expected,
                }),
              );
            },
          });
        }
      },
    };
  },
};
