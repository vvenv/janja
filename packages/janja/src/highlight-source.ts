import type { Loc } from './types';

export function highlightSource(
  message: string,
  source: string,
  { start: { line: l1, column: c1 }, end: { line: l2, column: c2 } }: Loc,
) {
  const output: string[] = [];
  const caretLines = new Set<number>();

  const addCaretLine = (index: number) => {
    caretLines.add(index - 2);
    caretLines.add(index - 1);
    caretLines.add(index);
    caretLines.add(index + 1);
    caretLines.add(index + 2);
  };

  const lines = source.split('\n');
  const indentWidth = String(lines.length).length + 2;

  let caretLinesCount = 0;

  lines.forEach((line, index) => {
    if (!line) {
      return;
    }

    output.push(`${`${index + 1}｜ `.padStart(indentWidth, ' ')}${line}`);

    if (l1 === index + 1) {
      const caretLine = `${' '.repeat(indentWidth - 2)}｜ ${' '.repeat(c1 - 1)}^${l1 === l2 && c2 > c1 + 1 ? `${' '.repeat(c2 - c1 - 2)}^` : ''}`;

      if (/\S/.test(caretLine)) {
        output.push(caretLine);
      }

      addCaretLine(++caretLinesCount + index);
    }

    if (l1 !== l2 && l2 === index + 1) {
      const caretLine = `${' '.repeat(indentWidth - 2)}｜ ${' '.repeat(c2 - 1)}${'^'.repeat(1)}`;

      if (/\S/.test(caretLine)) {
        output.push(caretLine);
      }

      addCaretLine(++caretLinesCount + index);
    }
  });

  const emptyLine = `${' '.repeat(indentWidth)}...`;

  return `${message}

${output
  .map((line, index) => (caretLines.has(index) ? line : emptyLine))
  .reduce(
    (acc, line) =>
      line === emptyLine && acc.at(-1) === line ? acc : [...acc, line],
    [] as string[],
  )
  .join('\n')}
`;
}
