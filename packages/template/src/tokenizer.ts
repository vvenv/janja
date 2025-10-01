import type {
  AST,
  Config,
  Token,
} from './types'
import { BLOCK, END_BLOCK, SUPER } from './tags/block'

export class Tokenizer implements AST {
  private template = ''

  private first: Token | null = null

  private expect = ''

  private blocks: Record<string, Token[][]> = {}

  cursor: Token | null = null

  constructor(public options: Required<Config>) {}

  async parse(
    template: string,
  ) {
    this.template = template
    this.blocks = {}

    const tagRe = /\{\{(-)?(=|!)? (.+?) (-)?\}\}/gs

    let match
    let index = 0

    while ((match = tagRe.exec(template))) {
      if (match.index > index) {
        this.slice(index, match.index)
      }

      await this.token(match)
      index = match.index + match[0].length
    }

    if (index < template.length) {
      this.slice(index, template.length)
    }

    this.cursor = this.first

    this.rebuildBlocks()

    return this.cursor
  }

  private slice(start: number, end: number) {
    const value = this.template.slice(start, end)

    this.push({
      name: 'str',
      value,
      raw: value,
      start,
      end,
    })
  }

  private async token(match: RegExpExecArray) {
    const start = match.index
    const end = start + match[0].length

    const base = {
      raw: match[0],
      stripBefore: match[1] === '-',
      stripAfter: match[4] === '-',
      start,
      end,
    }

    if (match[2] === '=') {
      this.push ({
        ...base,
        name: '=',
        value: match[3],
      })
    }
    else if (match[2] === '!') {
      this.push({
        ...base,
        name: '!',
        value: match[3],
      })
    }
    else {
      const [, identifier, value = null]
        = match[3].match(/^([#/]?[a-z]+)(?: (.+))?$/) ?? []

      if (identifier === 'layout') {
        await this.layout(value)
      }
      else if (identifier === 'include') {
        await this.include(value)
      }
      else {
        this.push({
          ...base,
          name: identifier,
          value,
        })
      }
    }
  }

  private async layout(value: string | null) {
    if (!value) {
      throw new Error('missing layout file path')
    }

    const [,,path] = value.match(/^(['"`])(.+)\1$/) ?? []

    if (!path) {
      throw new Error('missing layout file path')
    }

    const content = await this.options.loader!(`layouts/${path}.jianjia`)

    let cursor = await new Tokenizer(this.options).parse(content)

    while (cursor) {
      this.push(cursor)
      cursor = cursor.next
    }
  }

  private async include(value: string | null) {
    if (!value) {
      throw new Error('missing include file path')
    }

    const [,,path, optional] = value.match(/^(['"`])(.+)\1(\?)?$/) ?? []

    if (!path) {
      throw new Error('missing include file path')
    }

    let content

    try {
      content = await this.options.loader!(`partials/${path}.jianjia`)
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

    let cursor = await new Tokenizer(this.options).parse(content)

    while (cursor) {
      this.push(cursor)
      cursor = cursor.next
    }
  }

  private push(_token: Omit<Token, 'previous' | 'next'>) {
    const token: Token = { ..._token, previous: null, next: null }

    if (BLOCK.includes(token.name)) {
      if (!token.value) {
        throw new Error('block tag must have a value')
      }

      this.expect = token.value

      // child blocks
      if (this.blocks[token.value]) {
        this.blocks[token.value].push([token])

        return
      }

      // parent block
      this.blocks[token.value] = [[token]]
    }
    else if (this.expect) {
      const chunks = this.blocks[this.expect]

      if (END_BLOCK.includes(token.name)) {
        this.expect = ''
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

      const body = this.createBlockBody(chunks.pop(), chunks)

      this.rebuildChain(body, previous, next)
    }
  }

  private createBlockBody(child: Token[] | undefined, parents: Token[][]) {
    if (!child) {
      return []
    }

    const chunk: Token[] = []

    child.forEach((token) => {
      if (SUPER.includes(token.name)) {
        this.createBlockBody(
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

  private rebuildChain(
    tokens: Token[],
    previous: Token | null,
    next: Token | null,
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
