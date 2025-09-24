import type { Tag } from '../types'
import { HELPERS } from '../config'
import { compileStatement } from '../utils/compile-statement'
import { parseStatement } from '../utils/parse-statement'

export const FOR = 'for'
const ELSE = 'else'
const END_FOR = 'end_for'

/**
 * @example {{ #for item in items }}{{= item }}{{ /for }}
 * @example {{ #for key, value in items }}{{= key }}:{{= value }}{{ /for }}
 */
export const tag: Tag = {
  names: [FOR, ELSE],

  parse({ parser, base }) {
    if (base.isEnd) {
      const node = {
        ...base,
        name: END_FOR,
      }

      if (parser.checkStartNode(FOR, node)) {
        parser.end(node)
      }

      return
    }

    if (base.identifier === ELSE) {
      const node = {
        ...base,
        name: ELSE,
      }

      if (parser.checkStartNode(FOR, node, false)) {
        parser.between(node)
        return
      }
    }

    if (base.data) {
      parser.start({
        ...base,
        name: FOR,
      })

      return
    }

    return false
  },

  async compile({ template, node, context, out }, compileContent) {
    if (node.name === FOR) {
      const { level, index } = node.tag
      const affix = `${level.toString(32)}_${index.toString(32)}`
      const [{ value }, , ...right] = parseStatement(node.data!)
      const items = compileStatement(right, context)
      const names = value.split(/, +/)
      const lines: string[] = []
      lines.push(`const o_${affix}=${items};`)
      lines.push(`const a_${affix}=Array.isArray(o_${affix});`)
      lines.push(`const k_${affix}=Object.keys(o_${affix});`)
      lines.push(`const l_${affix}=k_${affix}.length;`)
      if (node.nextSibling!.name === ELSE) {
        lines.push(`if(l_${affix}){`)
      }
      const _context = `${context}_${affix}`
      lines.push(
        `for(let i_${affix}=0;i_${affix}<l_${affix};i_${affix}++){`,
        `const _item=o_${affix}[k_${affix}[i_${affix}]];`,
        `const ${_context}={`,
        `...${context},`,
      )
      if (names.length > 1) {
        names.forEach((name, index) => {
          lines.push(
            `${name}:a_${affix}?${HELPERS}.getIn(_item,${index},"${name}"):${index === 0 ? `k_${affix}[i_${affix}]` : '_item'},`,
          )
        })
      }
      else {
        lines.push(`${value}:_item,`)
      }
      lines.push(
        `loop:{`,
        `index:i_${affix},`,
        `first:i_${affix}===0,`,
        `last:i_${affix}===l_${affix},`,
        `length:l_${affix}`,
        `}`,
        `};`,
      )
      const loc = out.pushLine(...lines)
      await compileContent({
        template,
        node,
        context: _context,
        out,
      })
      return loc
    }

    if (node.name === ELSE) {
      // checking is required here because of ELSE can be used for IF tag too
      if (node.previousSibling?.name === FOR) {
        out.pushLine('}')
        const loc = out.pushLine('}else{')
        await compileContent({ template, node, context, out })
        return loc
      }

      return false
    }

    if (node.name === END_FOR) {
      return out.pushLine('}')
    }
  },
}
