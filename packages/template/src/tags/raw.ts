import type { Tag } from '../types'

const RAW = 'raw'
const END_RAW = 'end_raw'

/**
 * @example {{ #raw }} <script>{{ #if x }}foo{{ /if }}</script> {{ /raw }}
 *                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const tag: Tag = {
  names: [RAW],

  parse({ parser, base }) {
    if (base.isEnd) {
      const node = {
        ...base,
        name: END_RAW,
      }

      if (parser.startMatch(RAW, node)) {
        parser.end(node)
      }

      return
    }

    parser.start({
      ...base,
      name: RAW,
    })

    parser.expect(END_RAW)
  },

  async compile({ template, node, parser, out }) {
    if (node.name === RAW) {
      const loc = out.pushStr(
        template.slice(node.endIndex, node.nextSibling!.startIndex),
      )
      parser.goto(node.nextSibling!)
      return loc
    }
  },
}
