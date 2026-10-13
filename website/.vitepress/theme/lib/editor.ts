import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { syntaxHighlighting } from '@codemirror/language';
import { EditorState, type Extension, type Range } from '@codemirror/state';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import { classHighlighter } from '@lezer/highlight';
import { minimalSetup } from 'codemirror';

const mark = (name: string) => Decoration.mark({ class: `janja-${name}` });
const marks = {
  comment: mark('comment'),
  delimiter: mark('delimiter'),
  keyword: mark('keyword'),
  operator: mark('operator'),
  string: mark('string'),
  number: mark('number'),
  filter: mark('filter'),
  name: mark('name'),
};

const tagRE = /\{\{#[^]*?#\}\}|\{\{[^]*?\}\}/g;
const partRE =
  /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(-?\d+(?:\.\d+)?)|(\|\s*)([A-Za-z_$][\w$]*)|([A-Za-z_$][\w$]*)|([=+\-*/%|.,()])/g;
const operators = new Set(
  'and or not eq ne gt ge lt le in ni is if else of true false null undefined'.split(
    ' ',
  ),
);

/**
 * Janja tags on top of whatever the HTML highlighter makes of the rest. The
 * first word of a directive is its name; everything else is an expression.
 */
function decorate(view: EditorView) {
  const ranges: Range<Decoration>[] = [];
  const text = view.state.doc.toString();

  for (const match of text.matchAll(tagRE)) {
    const [tag] = match;
    const start = match.index;

    // an escaped brace is text
    if (text[start - 1] === '\\') {
      continue;
    }

    if (tag.startsWith('{{#')) {
      ranges.push(marks.comment.range(start, start + tag.length));

      continue;
    }

    const open = /^\{\{=?-?/.exec(tag)![0].length;
    const close = /-?\}\}$/.exec(tag)![0].length;
    const body = tag.slice(open, tag.length - close);
    const isDirective = tag[2] !== '=';

    let seenName = !isDirective;

    ranges.push(marks.delimiter.range(start, start + open));

    for (const part of body.matchAll(partRE)) {
      const from = start + open + part.index;
      const [whole, string, number, pipe, filter, word, symbol] = part;

      if (string) {
        ranges.push(marks.string.range(from, from + whole.length));
      } else if (number) {
        ranges.push(marks.number.range(from, from + whole.length));
      } else if (filter) {
        ranges.push(marks.operator.range(from, from + 1));
        ranges.push(
          marks.filter.range(from + pipe.length, from + whole.length),
        );
      } else if (word) {
        const type = !seenName || operators.has(word) ? 'keyword' : 'name';

        ranges.push(marks[type].range(from, from + whole.length));
        seenName = true;
      } else if (symbol) {
        ranges.push(marks.operator.range(from, from + whole.length));
      }
    }

    ranges.push(
      marks.delimiter.range(start + tag.length - close, start + tag.length),
    );
  }

  return Decoration.set(ranges, true);
}

const janjaTags = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = decorate(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = decorate(update.view);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);

const languages: Record<string, () => Extension> = {
  janja: () => [html({ matchClosingTags: false }), janjaTags],
  json: () => json(),
  javascript: () => javascript(),
  text: () => [],
};

export interface EditorOptions {
  parent: HTMLElement;
  doc: string;
  language: keyof typeof languages;
  readonly: boolean;
  label?: string;
  onChange: (value: string) => void;
}

export function createEditor({
  parent,
  doc,
  language,
  readonly,
  label,
  onChange,
}: EditorOptions) {
  return new EditorView({
    parent,
    state: EditorState.create({
      doc,
      extensions: [
        minimalSetup,
        // colours come from the site's stylesheet, so they follow its theme
        syntaxHighlighting(classHighlighter),
        languages[language](),
        EditorView.lineWrapping,
        EditorState.readOnly.of(readonly),
        EditorView.editable.of(!readonly),
        EditorState.tabSize.of(2),
        EditorView.contentAttributes.of({
          ...(label ? { 'aria-label': label } : {}),
          spellcheck: 'false',
          autocapitalize: 'off',
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    }),
  });
}
