import type { Range } from './types'

export function highlightSource(
  message: string,
  source: string,
  ranges: Range[],
) {
  const output: string[] = []
  const caretLines = new Set<number>()

  const addCaretLine = (index: number) => {
    caretLines.add(index - 2)
    caretLines.add(index - 1)
    caretLines.add(index)
    caretLines.add(index + 1)
    caretLines.add(index + 2)
  }

  const lines = source.split('\n')
  const indentWidth = String(lines.length).length + 2

  // Copy to avoid mutation
  ranges = [...ranges]

  let cursor = 0
  let caretLinesCount = 0

  lines.forEach((line, index) => {
    if (!line) {
      return
    }

    output.push(
      `${`${index + 1}: `.padStart(indentWidth, ' ')}${line}`,
    )

    ranges.forEach((tag) => {
      if (tag.start! < cursor) {
        ranges.splice(ranges.indexOf(tag), 1)

        return
      }

      if (tag.start! >= cursor + line.length + 1) {
        return
      }

      const offset = tag.start! - cursor + indentWidth
      const end = Math.min(tag.end!, cursor + line.length)
      const count = end - tag.start!

      const caretLine = `${' '.repeat(offset)}${'^'.repeat(count)}`

      if (/\S/.test(caretLine)) {
        output.push(caretLine)
      }

      if (end < tag.end!) {
        tag.start! += count + 1
      }

      addCaretLine(++caretLinesCount + index)
    })

    cursor += line.length + 1
  })

  const emptyLine = `${' '.repeat(indentWidth)}...`

  return `${message}

${output
  .map((line, index) => (caretLines.has(index) ? line : emptyLine))
  .reduce(
    (acc, line) =>
      line === emptyLine && acc.at(-1) === line ? acc : [...acc, line],
    [] as string[],
  )
  .join('\n')}
`
}
