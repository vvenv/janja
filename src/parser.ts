import type { ASTNode } from './ast'
import type {
  CommentToken,
  DirectiveExpression,
  DirectiveToken,
  OutputToken,
  TextToken,
  Token,
} from './types'
import {
  CommentNode,
  OutputNode,
  TemplateNode,
  TextNode,
  UnexpectedDirectiveNode,
  UnknownDirectiveNode,
} from './ast'
import { CompileError } from './compile-error'
import { ExpParser } from './exp-parser'
import { Tokenizer } from './tokenizer'
import { TokenType } from './types'

export class Parser extends Tokenizer {
  private expParser!: ExpParser
  protected cursor!: number

  parse(template: string) {
    this.tokenize(template)
    const start = this.tokens[0]?.loc.start ?? { line: 1, column: 1 }
    const end = this.tokens.at(-1)?.loc.end ?? { line: 1, column: 1 }

    this.expParser = new ExpParser(template)

    this.cursor = 0
    return new TemplateNode(this.parseUntil(), { start, end })
  }

  parseUntil(names?: string[]) {
    const nodes: ASTNode[] = []
    let prevToken: Token | null = null

    while (true) {
      const token = this.peek()

      if (!token
        || (
          token.type === TokenType.DIRECTIVE
          && names?.includes((token as DirectiveToken).name.toLowerCase()))
      ) {
        break
      }

      if (prevToken?.strip?.after && token.type === TokenType.TEXT) {
        token.strip.start = true
      }

      if (token.strip?.before && prevToken?.type === TokenType.TEXT) {
        prevToken.strip.end = true
      }

      switch (token.type) {
        case TokenType.COMMENT:
          nodes.push(this.createComment(token as CommentToken))
          break
        case TokenType.DIRECTIVE:
          nodes.push(this.createDirective(token as DirectiveToken))
          break
        case TokenType.OUTPUT:
          nodes.push(this.createOutput(token as OutputToken))
          break
        case TokenType.TEXT:
          nodes.push(this.createText(token as TextToken))
          break
      }

      prevToken = token
    }

    return nodes
  }

  private createComment({ val, loc, strip }: CommentToken) {
    this.advance()
    return new CommentNode(val, loc, strip)
  }

  private createOutput({ val, loc, strip }: OutputToken) {
    this.advance()
    return new OutputNode(val, loc, strip, this.parseExp({ val, loc })!)
  }

  private createText({ val, loc, strip }: TextToken) {
    this.advance()
    return new TextNode(val, loc, strip)
  }

  private createDirective(token: DirectiveToken) {
    return this.options.parsers[token.name.toLowerCase()]?.(token, this)
      ?? this.createUnknownDirective(token)
  }

  createUnexpectedDirective(token: DirectiveToken) {
    this.options.debug?.(
      new CompileError(
        `Unexpected "${token.name}" directive`,
        this.template,
        token.loc,
      ),
    )

    this.advance()
    return new UnexpectedDirectiveNode(
      token.name,
      token.val,
      token.loc,
      token.strip,
    )
  }

  private createUnknownDirective(token: DirectiveToken) {
    this.options.debug?.(
      new CompileError(
        `Unknown "${token.name}" directive`,
        this.template,
        token.loc,
      ),
    )

    this.advance()
    return new UnknownDirectiveNode(
      token.name,
      token.val,
      token.loc,
      token.strip,
    )
  }

  parseExp({ val, loc }: DirectiveExpression) {
    return this.expParser.parse(val, loc)!
  }

  peek() {
    return this.tokens.at(this.cursor) ?? null
  }

  advance() {
    this.cursor++
  }

  match(name: string) {
    return (this.peek() as DirectiveToken)?.name === name
  }

  isDirective(names: string[]) {
    const token = this.peek()
    if (token?.type !== TokenType.DIRECTIVE) {
      return false
    }

    return names.includes((token as DirectiveToken).name.toLowerCase())
  }

  requireExpression({ expression, name, loc }: DirectiveToken) {
    if (!expression) {
      throw this.options.debug?.(
        new CompileError(
          `"${name}" requires expression`,
          this.template,
          loc,
        ),
      )
    }
  }

  requireNoExpression({ expression, name, loc }: DirectiveToken) {
    if (expression) {
      throw this.options.debug?.(
        new CompileError(
          `"${name}" should not have expression`,
          this.template,
          loc,
        ),
      )
    }
  }
}
