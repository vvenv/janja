import type { Parser } from '../parser'
import type { ASTNode, Tag } from '../types'
import { ROOT } from '../config'

const BLOCK = 'block'
const END_BLOCK = 'end_block'
const SUPER = 'super'
const END_SUPER = 'end_super'

/**
 * @example {{ #block title }}{{ super }}...{{ /block }}
 *             ^^^^^^ ^^^^^      ^^^^^         ^^^^^^
 */
export const tag: Tag = {
  names: [BLOCK, SUPER],

  parse({ parser, base }) {
    if (base.isEnd) {
      const node = {
        ...base,
        name: END_BLOCK,
      }

      if (parser.checkStartNode(BLOCK, node)) {
        parser.end(node)
      }

      return
    }

    if (base.identifier === SUPER) {
      const node = {
        ...base,
        name: SUPER,
      }

      if (parser.checkStartNode(BLOCK, node)) {
        parser.start(node)

        // Self closing
        parser.end({
          ...base,
          startIndex: base.endIndex,
          name: END_SUPER,
        })
      }

      return
    }

    if (base.data) {
      const node = {
        ...base,
        name: BLOCK,
      }

      if (parser.checkStartNode(ROOT, node)) {
        const startNode = parser.start(node)

        if (startNode) {
          addTag(parser, startNode)
        }
      }

      return
    }

    return false
  },

  async compile({ template, node, context, parser, out }, compileContent) {
    if (node.name === BLOCK) {
      let loc
      const nodes = getNodes(node, parser)
      if (nodes.indexOf(node) === 0) {
        const { level, index } = node.tag
        const affix = `${level.toString(32)}_${index.toString(32)}`
        let curry = ''
        for (let i = 0; i < nodes.length; i++) {
          const _node = nodes[i]
          parser.goto(_node)
          const variable = `_b_${affix}_${_node.startIndex.toString(32)}`
          out.pushLine(`const ${variable}=async(_s)=>{`)
          await compileContent({ template, node: _node, context, out })
          out.pushStr(
            template.slice(
              parser.cursor.endIndex,
              (_node.nextSibling!).startIndex,
            ),
            {
              trimStart: parser.cursor.stripAfter,
              trimEnd: parser.cursor.next?.stripBefore ?? false,
            },
          )
          parser.goto(_node.nextSibling!)
          out.pushLine('};')
          curry = `async()=>await ${variable}(${curry})`
        }

        loc = out.pushLine(`await(${curry})();`)
        delNodes(node, parser)
      }
      else {
        parser.goto(node.nextSibling!)
      }
      return loc
    }

    if (node.name === SUPER) {
      out.pushLine(`await _s?.();`)
    }
  },
}

const blockNodesMap = new WeakMap<Parser, Record<string, ASTNode[]>>()

function hasParser(parser: Parser) {
  return blockNodesMap.has(parser)
}

function getParser(parser: Parser) {
  return blockNodesMap.get(parser)
}

function setParser(parser: Parser, value: Record<string, ASTNode[]>) {
  return blockNodesMap.set(parser, value)
}

function addTag(parser: Parser, node: ASTNode) {
  if (!hasParser(parser)) {
    setParser(parser, {})
  }

  const nodesMap = getParser(parser)!

  const { data } = node

  if (!nodesMap[data!]) {
    nodesMap[data!] = []
  }

  nodesMap[data!].push(node)
}

function getNodes(node: ASTNode, parser: Parser) {
  return getParser(parser)![node.data!]
}

function delNodes(node: ASTNode, parser: Parser) {
  return (getParser(parser)![node.data!] = [])
}
