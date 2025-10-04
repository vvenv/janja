import type { Tag } from '../types'
import { HELPERS } from '../identifiers'
import { compileStatement } from '../utils/compile-statement'
import { parseStatement } from '../utils/parse-statement'

const FOR = 'for'
const BREAK = 'break'
const CONTINUE = 'continue'
const END_FOR = 'endfor'

/**
 * @example {{ for item in items }}{{= item }}{{ endfor }}
 * @example {{ for key, value in items }}{{= key }}:{{= value }}{{ endfor }}
 */
export const tag: Tag = {
  names: [FOR, BREAK, CONTINUE, END_FOR],

  async compile({ token: { name, value }, ctx, out }) {
    if (name === FOR) {
      if (!value) {
        throw new Error('for tag must have a value')
      }

      ctx.expect(END_FOR)

      const [{ value: v }, , ...right] = parseStatement(value)
      const { context } = ctx
      const items = compileStatement(right, context)
      const names = v.split(/, +/)
      const lines: string[] = []

      const nested = ctx.in()
      lines.push(
        `const o_${nested}=${items};`,
        `const a_${nested}=Array.isArray(o_${nested});`,
        `const k_${nested}=Object.keys(o_${nested});`,
        `const l_${nested}=k_${nested}.length;`,
        `for(let i_${nested}=0;i_${nested}<l_${nested};i_${nested}++){`,
        `const _item=o_${nested}[k_${nested}[i_${nested}]];`,
      )

      lines.push(
        `const ${nested}={`,
        `...${context},`,
      )

      if (names.length > 1) {
        names.forEach((n, i) => {
          lines.push(
            `${n}:a_${nested}?${HELPERS}.getIn(_item,${i},"${n}"):${i === 0 ? `k_${nested}[i_${nested}]` : '_item'},`,
          )
        })
      }
      else {
        lines.push(`${v}:_item,`)
      }

      lines.push(
        'loop:{',
        `index:i_${nested},`,
        `first:i_${nested}===0,`,
        `last:i_${nested}===l_${nested},`,
        `length:l_${nested}`,
        '}',
        '};',
      )

      return out.pushLine(...lines)
    }

    if (name === BREAK) {
      if (!ctx.matchAny(END_FOR)) {
        throw new Error('break tag must be inside a for loop')
      }

      return out.pushLine('break;')
    }

    if (name === CONTINUE) {
      if (!ctx.matchAny(END_FOR)) {
        throw new Error('continue tag must be inside a for loop')
      }

      return out.pushLine('continue;')
    }

    if (name === END_FOR) {
      if (!ctx.consume(END_FOR)) {
        throw new Error(`unexpected ${name}`)
      }

      ctx.out()

      return out.pushLine('}')
    }
  },
}
