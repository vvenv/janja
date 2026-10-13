import { ExpFormatter } from './exp/exp-formatter';
import { ExpParser } from './exp/exp-parser';
import type { Exp } from './exp/exp-types';
import { parserOptions } from './options';
import { Tokenizer } from './tokenizer';
import {
  type DirectiveToken,
  type Loc,
  type ParserOptions,
  type Pos,
  type Token,
  TokenType,
} from './types';

export type FormatOptions = Pick<
  ParserOptions,
  | 'commentOpen'
  | 'commentClose'
  | 'directiveOpen'
  | 'directiveClose'
  | 'outputOpen'
  | 'outputClose'
>;

// An expression without the positions and spellings that formatting changes
const shape = (exp: Exp | null) =>
  JSON.stringify(exp, (key, value) =>
    key === 'loc' || key === 'raw' ? undefined : (value ?? null),
  );

/**
 * Normalise the tags of a template:
 *
 *     {{=name|upper}}  ->  {{= name | upper }}
 *     {{if a  eq 1}}   ->  {{ if a eq 1 }}
 *     {{#note#}}       ->  {{# note #}}
 *
 * Only what is inside tags changes. Text between tags, where whitespace may
 * matter, is kept byte for byte, as are whitespace-control markers. A tag is
 * left exactly as written whenever its expression does not parse or
 * reformatting would not provably keep its meaning. Formatting twice gives
 * the same result as formatting once.
 *
 * Throws a `CompileError` for templates with an unclosed tag.
 */
export function formatTemplate(template: string, options: FormatOptions = {}) {
  const merged = { ...parserOptions, ...options };
  const tokens = new Tokenizer(merged).tokenize(template);

  // Positions are line/column; slicing the source needs offsets
  const lineStarts = [0];

  for (let i = 0; i < template.length; i++) {
    if (template[i] === '\n') {
      lineStarts.push(i + 1);
    }
  }

  const offset = ({ line, column }: Pos) => lineStarts[line - 1] + column - 1;

  const expParser = new ExpParser();
  const expFormatter = new ExpFormatter();

  const formatExpression = (val: string, loc: Loc) => {
    try {
      const exp = expParser.parse(val, loc);
      const formatted = expFormatter.format(exp);

      // Proof that nothing changed: the result parses to the same expression
      if (shape(expParser.parse(formatted, loc)) !== shape(exp)) {
        return null;
      }

      // Braces only occur in string literals, where they must stay escaped
      // so that they cannot end the tag
      return formatted.replace(/[{}]/g, '\\$&');
    } catch {
      return null;
    }
  };

  const formatTag = (token: Token) => {
    const before = token.strip.before ? '-' : '';
    const after = token.strip.after ? '-' : '';

    if (token.type === TokenType.COMMENT) {
      return `${merged.commentOpen}${before} ${token.val.trim()} ${after}${merged.commentClose}`;
    }

    if (token.type === TokenType.OUTPUT) {
      const expression = formatExpression(token.val, token.loc);

      return (
        expression &&
        `${merged.outputOpen}${before} ${expression} ${after}${merged.outputClose}`
      );
    }

    const { name, expression } = token as DirectiveToken;

    if (!name) {
      return null;
    }

    const formatted = expression
      ? formatExpression(expression.val, expression.loc)
      : '';

    return (
      formatted !== null &&
      `${merged.directiveOpen}${before} ${name}${formatted && ` ${formatted}`} ${after}${merged.directiveClose}`
    );
  };

  return tokens
    .map((token) => {
      const source = template.slice(
        offset(token.loc.start),
        offset(token.loc.end),
      );

      if (token.type === TokenType.TEXT) {
        return source;
      }

      // Comments spanning several lines are laid out by hand; leave them
      if (token.type === TokenType.COMMENT && token.val.includes('\n')) {
        return source;
      }

      return formatTag(token) || source;
    })
    .join('');
}
