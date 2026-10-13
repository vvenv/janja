// Snippets use VS Code's `${1:placeholder}` syntax in ordinary strings
/* eslint-disable no-template-curly-in-string */
import {
  filters as builtinFilters,
  formatTemplate,
  validateTemplate,
} from 'janja';

/**
 * Editor features as plain functions over text, independent of any editor
 * or protocol.
 */

export interface Diagnostic {
  severity: 'error' | 'warning';
  message: string;
  /** Zero-based */
  line: number;
  /** Zero-based */
  column: number;
  /** Number of characters to underline */
  length: number;
}

export interface Completion {
  label: string;
  kind: 'directive' | 'filter' | 'keyword';
  detail?: string;
  /** Snippet inserted instead of the label, with `$1`-style placeholders */
  snippet?: string;
}

const directives: Completion[] = [
  ['if', 'if ${1:condition} }}$0{{ endif'],
  ['elif', 'elif ${1:condition}'],
  ['else', 'else'],
  ['endif', 'endif'],
  ['for', 'for ${1:item} of ${2:items} }}$0{{ endfor'],
  ['endfor', 'endfor'],
  ['break', 'break'],
  ['continue', 'continue'],
  ['set', 'set ${1:name} = ${2:value}'],
  ['include', 'include "${1:path}"'],
  ['block', 'block ${1:name} }}$0{{ endblock'],
  ['endblock', 'endblock'],
  ['super', 'super'],
  ['macro', 'macro ${1:name}(${2:params}) }}$0{{ endmacro'],
  ['endmacro', 'endmacro'],
  ['caller', 'caller'],
  ['call', 'call ${1:name}(${2:args}) }}$0{{ endcall'],
  ['endcall', 'endcall'],
  ['capture', 'capture ${1:name} }}$0{{ endcapture'],
  ['endcapture', 'endcapture'],
  ['with', 'with ${1:value} }}$0{{ endwith'],
  ['endwith', 'endwith'],
].map(([label, snippet]) => ({ label, kind: 'directive', snippet }));

const keywords: Completion[] = [
  'and',
  'or',
  'not',
  'in',
  'ni',
  'is',
  'eq',
  'ne',
  'gt',
  'ge',
  'lt',
  'le',
  'if',
  'else',
  'true',
  'false',
  'null',
].map((label) => ({ label, kind: 'keyword' }));

const filters: Completion[] = Object.keys(builtinFilters)
  .filter((name) => name !== 'escape')
  .sort()
  .map((label) => ({ label, kind: 'filter', detail: 'built-in filter' }));

export async function getDiagnostics(text: string): Promise<Diagnostic[]> {
  const { errors, warnings } = await validateTemplate(text);
  const lines = text.split('\n');

  return [...errors, ...warnings].map(({ type, message, line, column }) => {
    const zeroLine = Math.max((line ?? 1) - 1, 0);
    const zeroColumn = Math.max((column ?? 1) - 1, 0);
    const rest = lines[zeroLine]?.slice(zeroColumn) ?? '';
    // Underline the tag the problem starts in, or else the word it is at
    const tag = /^\{\{[^]*?\}\}/.exec(rest) ?? /^[\w$]+/.exec(rest);

    return {
      severity: type,
      message,
      line: zeroLine,
      column: zeroColumn,
      length: Math.max(tag?.[0].length ?? 1, 1),
    };
  });
}

/**
 * What can be typed at `offset`: filter names after a pipe, directive names
 * at the start of a `{{ }}` tag, expression keywords elsewhere inside a tag,
 * and nothing in plain text or comments.
 */
export function getCompletions(text: string, offset: number): Completion[] {
  const before = text.slice(0, offset);
  const open = before.lastIndexOf('{{');

  if (open === -1 || before.lastIndexOf('}}') > open) {
    return [];
  }

  const inside = before.slice(open + 2);

  if (inside.startsWith('#')) {
    return [];
  }

  if (/\|\s*[\w$]*$/.test(inside)) {
    return filters;
  }

  if (!inside.startsWith('=') && /^-?\s*[A-Za-z_]*$/.test(inside)) {
    return directives;
  }

  return /(^|[\s(,])[A-Za-z_]*$/.test(inside) ? keywords : [];
}

/**
 * The formatted text, or `null` when there is nothing to change or the
 * template cannot be formatted (an unclosed tag, typically while typing).
 */
export function formatDocument(text: string): string | null {
  try {
    const formatted = formatTemplate(text);

    return formatted === text ? null : formatted;
  } catch {
    return null;
  }
}

export interface Hover {
  /** Markdown */
  contents: string;
  /** Zero-based offsets of the word the hover is for */
  start: number;
  end: number;
}

const directiveDocs: Record<string, string> = {
  if: '`{{ if test }}...{{ elif test }}...{{ else }}...{{ endif }}`\n\nRenders the first branch whose test is truthy.',
  for: '`{{ for item of items }}...{{ else }}...{{ endfor }}`\n\nIterates arrays, strings and other iterables. `loop.index`, `loop.first` and `loop.last` are available in the body; `else` renders when there is nothing to iterate.',
  set: '`{{ set name = expression }}`\n\nAssigns in the current scope. `{{ set (a, b) = value }}` reads properties.',
  include:
    '`{{ include "path" }}`\n\nRenders another template in place, loaded through the `loader` option.',
  block:
    '`{{ block name }}...{{ endblock }}`\n\nA replaceable region. The last definition of a name is rendered where the block first appears; `{{ super }}` renders the definition it replaced.',
  macro:
    '`{{ macro name(param, other = default) }}...{{ endmacro }}`\n\nA reusable piece of template, invoked with `{{ call name(args) }}...{{ endcall }}`. `{{ caller }}` renders the body of the call.',
  call: '`{{ call name(args) }}...{{ endcall }}`\n\nInvokes a macro; the body is rendered where the macro has `{{ caller }}`.',
  capture:
    '`{{ capture name }}...{{ endcapture }}`\n\nRenders the body into a variable instead of the output.',
  with: '`{{ with value }}...{{ endwith }}`\n\nRenders the body in a scope made of the properties of `value` only.',
  break: '`{{ break }}`\n\nEnds the innermost loop.',
  continue:
    '`{{ continue }}`\n\nSkips to the next iteration of the innermost loop.',
  super:
    '`{{ super }}`\n\nInside a block, renders the definition this block replaced.',
  caller:
    '`{{ caller }}`\n\nInside a macro, renders the body of the `call` that invoked it.',
};

/**
 * Documentation for the directive or built-in filter at `offset`.
 */
export function getHover(text: string, offset: number): Hover | null {
  const open = text.lastIndexOf('{{', offset);

  if (open === -1 || text.lastIndexOf('}}', offset - 1) > open) {
    return null;
  }

  let start = offset;
  let end = offset;

  while (start > 0 && /[\w$]/.test(text[start - 1])) {
    start--;
  }

  while (end < text.length && /[\w$]/.test(text[end])) {
    end++;
  }

  const word = text.slice(start, end);

  if (!word) {
    return null;
  }

  const before = text.slice(open + 2, start);

  if (/\|\s*$/.test(before)) {
    return word in builtinFilters
      ? { contents: `\`${word}\` — built-in filter`, start, end }
      : null;
  }

  if (/^-?\s*$/.test(before) && word in directiveDocs) {
    return { contents: directiveDocs[word], start, end };
  }

  return null;
}
