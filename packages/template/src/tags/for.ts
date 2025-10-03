import type { Tag } from '../types'
import { HELPERS } from '../config'
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

  async compile({ token: { name, value }, index, ctx, out, validator }) {
    if (name === FOR) {
      if (!value) {
        throw new Error('for tag must have a value')
      }

      validator.expect(END_FOR)

      const [{ value: v }, , ...right] = parseStatement(value)
      const { context } = ctx
      const items = compileStatement(right, context)
      const names = v.split(/, +/)
      const lines: string[] = []

      lines.push(
        `const o_${index}=${items};`,
        `const a_${index}=Array.isArray(o_${index});`,
        `const k_${index}=Object.keys(o_${index});`,
        `const l_${index}=k_${index}.length;`,
        `for(let i_${index}=0;i_${index}<l_${index};i_${index}++){`,
        `const _item=o_${index}[k_${index}[i_${index}]];`,
      )

      lines.push(
        `const ${ctx.affix(index)}={`,
        `...${context},`,
      )

      if (names.length > 1) {
        names.forEach((n, i) => {
          lines.push(
            `${n}:a_${index}?${HELPERS}.getIn(_item,${i},"${n}"):${i === 0 ? `k_${index}[i_${index}]` : '_item'},`,
          )
        })
      }
      else {
        lines.push(`${v}:_item,`)
      }

      lines.push(
        'loop:{',
        `index:i_${index},`,
        `first:i_${index}===0,`,
        `last:i_${index}===l_${index},`,
        `length:l_${index}`,
        '}',
        '};',
      )

      return out.pushLine(...lines)
    }

    if (name === BREAK) {
      if (!validator.matchAny(END_FOR)) {
        throw new Error('break tag must be inside a for loop')
      }

      return out.pushLine('break;')
    }

    if (name === CONTINUE) {
      if (!validator.matchAny(END_FOR)) {
        throw new Error('continue tag must be inside a for loop')
      }

      return out.pushLine('continue;')
    }

    if (name === END_FOR) {
      if (!validator.consume(END_FOR)) {
        throw new Error(`unexpected ${name}`)
      }

      ctx.reset()

      return out.pushLine('}')
    }
  },
}
