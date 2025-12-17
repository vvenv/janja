import type { Rule } from 'eslint';
import type { DirectiveToken } from 'janja';
import type { AST } from '../language';
import type { Parser } from '../parser';

function checkSpaceBetween(token: DirectiveToken) {
  const { val, name, expression } = token;

  if (!expression?.val.startsWith(' ')) {
    return {};
  }

  const [leadingSpaces] = val.match(/^\s+/) || [];
  const [trailingSpaces] = val.match(/\s+$/) || [];

  return {
    error: 'noSpaces',
    expected: `${leadingSpaces || ''}${name} ${expression.val.trim()}${trailingSpaces || ''}`,
  };
}

export const spaceBetween: Rule.RuleModule = {
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
    function checker(token: DirectiveToken, _ast: AST, parser: Parser) {
      const { error, expected } = checkSpaceBetween(token);

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
      DIRECTIVE: checker,
    };
  },
};
