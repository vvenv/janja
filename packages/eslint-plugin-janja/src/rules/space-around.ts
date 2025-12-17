import type { Rule } from 'eslint';
import type { Token } from 'janja';
import type { AST } from '../language';
import type { Parser } from '../parser';

type Mode = 'always' | 'never';

function checkSpaceAround(token: Token, mode: Mode) {
  const { val } = token;

  const hasLeadingSpace = val.startsWith(' ');
  const hasTrailingSpace = val.endsWith(' ');

  if (mode === 'always') {
    const correctLeadingSpace = hasLeadingSpace && !val.startsWith('  ');
    const correctTrailingSpace = hasTrailingSpace && !val.endsWith('  ');

    if (correctLeadingSpace && correctTrailingSpace) {
      return {};
    }

    return { error: 'oneSpace', expected: ` ${val.trim()} ` };
  }

  // mode === 'never'
  if (!hasLeadingSpace && !hasTrailingSpace) {
    return {};
  }

  return { error: 'noSpaces', expected: val.trim() };
}

export const spaceAround: Rule.RuleModule = {
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
    const mode: Mode = context.options[0] || 'always';

    function checker(token: Token, _ast: AST, parser: Parser) {
      const { error, expected } = checkSpaceAround(token, mode);

      if (error) {
        context.report({
          loc: token.loc,
          messageId: error,
          fix(fixer) {
            return fixer.replaceTextRange(
              [
                context.sourceCode.getIndexFromLoc(token.loc.start),
                context.sourceCode.getIndexFromLoc(token.loc.end),
              ],
              parser.format({
                ...token,
                val: expected,
              }),
            );
          },
        });
      }
    }

    return {
      COMMENT: checker,
      DIRECTIVE: checker,
      OUTPUT: checker,
    };
  },
};
