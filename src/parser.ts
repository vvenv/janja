import type {
  Config,
  IdExp,
  LitExp,
  Tag,
} from './types'
import { parser } from './exp'
import { BLOCK, ENDBLOCK, INCLUDE, LAYOUT, RAW, SUPER } from './identifiers'
import { ParseError } from './parse-error'
import { unescapeTag } from './unescape-tag'

export class Parser {
  private template = ''
  private index = 0
  private first: Tag | null = null
  private group = ''
  private blocks: Record<string, Tag[][]> = {}
  private cursor: Tag | null = null

  constructor(public options: Config) {}

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
        this.addRaw(this.index, match.index)
      }

      await this.addTag(match)
      this.index = match.index + match[0].length
    }

    if (this.index < template.length) {
      this.addRaw(this.index, template.length)
    }

    this.cursor = this.first

    this.rebuildBlocks()

    return this.cursor
  }

  private addRaw(start: number, end: number) {
    this.push({
      name: RAW,
      raw: this.template.slice(start, end),
      previous: null,
      next: null,
      start,
      end,
    })
  }

  private async addTag(match: RegExpExecArray) {
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
          type: 'LIT',
          value: unescapeTag(match[3]),
        } as LitExp,
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
    const exp = parser.parse(value)

    if (exp?.type !== 'LIT' || typeof exp.value !== 'string' || !exp.value) {
      throw new ParseError(`"layout" tag must have a file path`, {
        source: this.template,
        range: {
          start: this.index,
          end: this.index + value.length,
        },
      })
    }

    await this.child(`layouts/${exp.value}.janja`)
  }

  private async include(value: string) {
    const exp = parser.parse(value.replace(/\?$/, ''))

    if (exp?.type !== 'LIT' || typeof exp.value !== 'string' || !exp.value) {
      throw new ParseError(`"include" tag must have a file path`, {
        source: this.template,
        range: {
          start: this.index,
          end: this.index + value.length,
        },
      })
    }

    await this.child(`partials/${exp.value}.janja`, value.endsWith('?'))
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

  private push(tag: Tag) {
    if (tag.name === BLOCK) {
      const { type, value } = tag.value! as IdExp

      if (type !== 'ID') {
        throw new ParseError(`"${BLOCK}" tag must have a title`, {
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
        this.blocks[value].push([tag])

        return
      }

      // parent block
      this.blocks[value] = [[tag]]
    }
    else if (this.group) {
      const chunks = this.blocks[this.group]

      if (tag.name === ENDBLOCK) {
        this.group = ''
      }

      chunks.at(-1)!.push(tag)

      // child blocks
      if (chunks.length > 1) {
        return
      }
    }

    if (this.cursor) {
      tag.previous = this.cursor
      this.cursor.next = tag
    }
    else {
      this.first = tag
    }

    this.cursor = tag
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

  private rebuildBlockBody(child: Tag[] | undefined, parents: Tag[][]) {
    if (!child) {
      return []
    }

    const chunk: Tag[] = []

    child.forEach((tag) => {
      if (tag.name === SUPER) {
        this.rebuildBlockBody(
          parents.pop(),
          parents,
        ).forEach(t => chunk.push(t))
      }
      else {
        chunk.push(tag)
      }
    })

    return chunk
  }

  private rebuildBlockChain(
    tags: Tag[],
    previous: Tag | null,
    next: Tag | null,
  ) {
    for (let i = 0; i < tags.length; i++) {
      tags[i].previous = tags[i - 1] || previous
      tags[i].next = tags[i + 1] || next
    }

    if (previous) {
      [previous.next] = tags
    }

    if (next) {
      next.previous = tags[tags.length - 1]
    }

    if (!this.first) {
      [this.first] = tags
      this.cursor = this.first
    }
  }
}
