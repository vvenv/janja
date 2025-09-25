import type {
  ASTNode,
  ASTNodeBase,
  ASTTag,
  EngineOptions,
  Location,
} from './types'
import { END_ROOT, ROOT } from './config'
import { ParserError } from './parser-error'
import { COMMENT } from './tags/comment'

/**
 * - ASTTag
 *   - body
 *     - ASTNode
 *       - tags
 *         - ASTTag
 *           - body
 *             - ASTNode
 *         - ASTTag
 *           - body
 *             - ASTNode
 *     - ASTNode
 *       - tags
 *         - ASTTag
 *           - body
 *             - ASTNode
 *         - ASTTag
 *           - body
 *             - ASTNode
 *     - ASTNode
 */
export class Parser implements ASTTag {
  template = ''
  /**
   * Current active tag while parsing
   */
  current: ASTTag
  /**
   * Current node cursor while consuming
   */
  cursor!: ASTNode
  /**
   * Next node that is expected to be parsed.
   */
  nextNode: string | null = null

  body: ASTNode[]
  parent: null
  previousSibling: null
  nextSibling: null
  level: number
  index: number

  constructor(public options: Required<EngineOptions>) {
    this.body = []
    this.parent = null
    this.previousSibling = null
    this.nextSibling = null
    this.level = 0
    this.index = 0

    this.current = this
  }

  get valid() {
    return this.body.length % 2 === 0
  }

  get tags() {
    return this.body[0]?.tags ?? []
  }

  async parse(
    template: string,
  ) {
    this.template = template

    const root = this.start({
      name: ROOT,
      startIndex: 0,
      endIndex: 0,
    })!

    this.cursor = root

    const tagRe = /\{\{(-)?(=|!)? (.+?) (-)?\}\}/gs
    let match
    // eslint-disable-next-line no-cond-assign
    while ((match = tagRe.exec(template))) {
      const base = this.baseNode(match)
      const tags = this.options.tags[base.identifier] ?? []
      for (const tag of tags) {
        if (
          (await tag.parse({
            parser: this,
            base,
          })) !== false
        ) {
          break
        }
      }
    }

    this.end({
      name: END_ROOT,
      startIndex: template.length,
      endIndex: template.length,
    })

    // Reset cursor after parsed
    this.cursor = root

    return this
  }

  private baseNode(match: RegExpExecArray): ASTNodeBase {
    const base = {
      original: match[0],
      stripBefore: match[1] === '-',
      stripAfter: match[4] === '-',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      previous: null,
      next: null,
    }

    if (match[2] === '=') {
      return {
        ...base,
        identifier: '=',
        data: match[3],
      }
    }

    if (match[2] === '!') {
      return {
        ...base,
        identifier: COMMENT,
        data: match[3],
      }
    }

    const [, prefix, identifier, data]
      = match[3].match(/^([#/])?([a-z]+)(?: (.+))?$/) ?? []

    return {
      ...base,
      identifier,
      data,
      isStart: prefix === '#',
      isEnd: prefix === '/',
    }
  }

  goto(node: ASTNode) {
    if (this.cursor) {
      this.cursor.next = node
      node.previous = this.cursor
    }
    return this.cursor = node
  }

  /**
   * If the current ast:
   * 1. no body, add it.
   * 2. has body, add a new ast with the node to the tags of the last node.
   */
  start(baseNode: Partial<ASTNode> & Location) {
    if (!this.verifyNextNode(baseNode)) {
      return
    }

    this.nextNode = null

    const { body } = this.current

    const node = {
      ...baseNode,
      previousSibling: null,
      nextSibling: null,
      previous: null,
      next: null,
      tags: [],
    } as ASTNode

    if (body.length === 0) {
      node.tag = this.current
      body.push(node)
      return this.goto(node)
    }

    const { tags } = this.current.body.at(-1)!
    const lastAST = tags.at(-1)
    const tag = {
      body: [node],
      parent: this.current,
      previousSibling: lastAST ?? null,
      nextSibling: null,
      level: this.current.level + 1,
      index: tags.length,
    } satisfies ASTTag
    if (lastAST) {
      lastAST.nextSibling = tag
    }
    node.tag = tag
    tags.push(tag)

    this.current = tag

    return this.goto(node)
  }

  between(baseNode: Partial<ASTNode> & Location) {
    if (!this.verifyNextNode(baseNode)) {
      return
    }

    this.nextNode = null

    const { body } = this.current

    // For testing purposes
    if (!body.length) {
      return
    }

    const lastNode = body.at(-1)!
    const node = {
      ...baseNode,
      tag: lastNode.tag,
      previousSibling: lastNode,
      nextSibling: null,
      previous: null,
      next: null,
      tags: [],
    } as ASTNode

    lastNode.nextSibling = node
    body.push(node)

    return this.goto(node)
  }

  end(baseNode: Partial<ASTNode> & Location) {
    if (!this.verifyNextNode(baseNode)) {
      return
    }

    this.nextNode = null

    const { body } = this.current

    // For testing purposes
    if (!body.length) {
      return
    }

    const lastNode = body.at(-1)!
    const node = {
      ...baseNode,
      previousSibling: lastNode,
      nextSibling: null,
      previous: null,
      next: null,
    } as ASTNode

    lastNode.nextSibling = node
    body.push(node)

    // It's a close block, so we need to move the cursor to the parent
    this.current = this.current.parent ?? this

    return this.goto(node)
  }

  private verifyNextNode(node: Partial<ASTNode> & Location) {
    if (!this.nextNode || node.name === this.nextNode) {
      return true
    }
    this.throwError(`expect "${this.nextNode}", "${node.name}" found.`, [node])
    return false
  }

  /**
   * Check if the start node in current ast matches the given name.
   */
  checkStartNode(
    name: string,
    node: Partial<ASTNode> & Location,
    required = true,
  ) {
    if (!this.verifyNextNode(node)) {
      return true
    }
    const startNode = this.current.body.at(0)!
    if (startNode.name === name) {
      return true
    }
    if (required) {
      this.throwError(`"${node.name}" must follow "${name}", not "${startNode.name}".`, [startNode, node])
    }
    return false
  }

  /**
   * Check if the start nide in current ast or its ancestor matches the given name.
   */
  checkAncestorStartNode(
    name: string,
    node: Partial<ASTNode> & Location,
  ) {
    if (!this.verifyNextNode(node)) {
      return true
    }
    let ast = this.current
    while (ast) {
      if (ast.body.at(0)!.name === name) {
        return true
      }
      ast = ast.parent!
    }
    this.throwError(`"${node.name}" must be a descendant of "${name}".`, [node])
    return false
  }

  throwError(message: string, nodes: Location[]) {
    if (this.options.debug) {
      throw new ParserError(message, {
        template: this.template,
        nodes,
      })
    }
  }
}
