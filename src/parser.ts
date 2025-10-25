import type {
  AST,
  Config,
  IdExp,
  StrExp,
  TagToken,
} from './types'
import { parser } from './expression'
import { BLOCK, ENDBLOCK, INCLUDE, LAYOUT, STR, SUPER } from './identifiers'
import { ParseError } from './utils/parse-error'
import { unescapeTag } from './utils/unescape-tag'

export class Parser implements AST {
  private template = ''
  private index = 0

  private first: TagToken | null = null

  private group = ''

  private blocks: Record<string, TagToken[][]> = {}

  cursor: TagToken | null = null

  constructor(public options: Required<Config>) {}

  async parse(
    template: string,
  ) {
    this.template = template
    this.index = 0
    this.blocks = {}

    const tagRe = /\{\{(-)?([=#])?((?:\\[{}]|(?!\{\}).)+?)(-)?\}\}/gs

    let match

    while ((match = tagRe.exec(template))) {
      if (match.index > this.index) {
        this.strToken(this.index, match.index)
      }

      await this.tagToken(match)
      this.index = match.index + match[0].length
    }

    if (this.index < template.length) {
      this.strToken(this.index, template.length)
    }

    this.cursor = this.first

    this.rebuildBlocks()

    return this.cursor
  }

  private strToken(start: number, end: number) {
    const raw = this.template.slice(start, end)

    this.push({
      name: STR,
      raw,
      previous: null,
      next: null,
      start,
      end,
    })
  }

  private async tagToken(match: RegExpExecArray) {
    const start = match.index
    const end = start + match[0].length

    const base = {
      raw: match[0],
      previous: null,
      next: null,
      stripBefore: match[1] === '-',
      stripAfter: match[4] === '-',
      start,
      end,
    }

    if (match[2] === '#') {
      this.push({
        ...base,
        name: match[2],
        value: {
          type: 'STR',
          value: unescapeTag(match[3]),
        } as StrExp,
      })
    }
    else if (match[2] === '=') {
      this.push({
        ...base,
        name: match[2],
        value: parser.parse(unescapeTag(match[3])),
      })
    }
    else {
      const [, name, value = '']
        = match[3].trim().match(/^([a-z]+)(?: (.+))?$/) ?? []

      if (name === LAYOUT) {
        await this.layout(value)
      }
      else if (name === INCLUDE) {
        await this.include(value)
      }
      else {
        this.push({
          ...base,
          name,
          value: parser.parse(unescapeTag(value)),
        })
      }
    }
  }

  private async layout(value: string) {
    const [,,path] = value.match(/^(['"`])(.+)\1$/) ?? []

    if (!path) {
      throw new ParseError('missing file path', {
        source: this.template,
        range: {
          start: this.index,
          end: this.index + value.length,
        },
      })
    }

    await this.child(`layouts/${path}.jianjia`)
  }

  private async include(value: string) {
    const [,,path, optional] = value.match(/^(['"`])(.+)\1(\?)?$/) ?? []

    if (!path) {
      throw new ParseError('missing file path', {
        source: this.template,
        range: {
          start: this.index,
          end: this.index + value.length,
        },
      })
    }

    await this.child(`partials/${path}.jianjia`, !!optional)
  }

  private async child(path: string, optional?: boolean) {
    let content

    try {
      content = await this.options.loader!(path)
    }
    catch (error: any) {
      if (optional) {
        return
      }

      throw error
    }

    if (!content) {
      return
    }

    let cursor = await new Parser(this.options).parse(content)

    while (cursor) {
      this.push(cursor)
      cursor = cursor.next
    }
  }

  private push(token: TagToken) {
    if (token.name === BLOCK) {
      const { type, value } = token.value! as IdExp

      if (type !== 'ID') {
        throw new ParseError('"block" tag must have a title', {
          source: this.template,
          range: {
            start: this.index,
            end: this.index + value.length,
          },
        })
      }

      this.group = value

      // child blocks
      if (this.blocks[value]) {
        this.blocks[value].push([token])

        return
      }

      // parent block
      this.blocks[value] = [[token]]
    }
    else if (this.group) {
      const chunks = this.blocks[this.group]

      if (token.name === ENDBLOCK) {
        this.group = ''
      }

      chunks.at(-1)!.push(token)

      // child blocks
      if (chunks.length > 1) {
        return
      }
    }

    if (this.cursor) {
      token.previous = this.cursor
      this.cursor.next = token
    }
    else {
      this.first = token
    }

    this.cursor = token
  }

  /**
   * @note Block tags are hoisted to top level
   */
  private rebuildBlocks() {
    for (const chunks of Object.values(this.blocks)) {
      if (chunks.length < 2) {
        continue
      }

      const [[{ previous }]] = chunks
      const { next } = chunks[0].at(-1)!

      // break the chain
      if (previous) {
        if (previous.next) {
          previous.next.previous = null
        }

        previous.next = null
      }
      else {
        this.first = null
        this.cursor = null
      }

      if (next) {
        if (next.previous) {
          next.previous.next = null
        }

        next.previous = null
      }

      const body = this.rebuildBlockBody(chunks.pop(), chunks)
      this.rebuildBlockChain(body, previous, next)
    }
  }

  private rebuildBlockBody(child: TagToken[] | undefined, parents: TagToken[][]) {
    if (!child) {
      return []
    }

    const chunk: TagToken[] = []

    child.forEach((token) => {
      if (token.name === SUPER) {
        this.rebuildBlockBody(
          parents.pop(),
          parents,
        ).forEach(t => chunk.push(t))
      }
      else {
        chunk.push(token)
      }
    })

    return chunk
  }

  private rebuildBlockChain(
    tokens: TagToken[],
    previous: TagToken | null,
    next: TagToken | null,
  ) {
    for (let i = 0; i < tokens.length; i++) {
      tokens[i].previous = tokens[i - 1] || previous
      tokens[i].next = tokens[i + 1] || next
    }

    if (previous) {
      [previous.next] = tokens
    }

    if (next) {
      next.previous = tokens[tokens.length - 1]
    }

    if (!this.first) {
      [this.first] = tokens
      this.cursor = this.first
    }
  }
}
