import { EndTag } from '../ast';
import { Tag } from '../types';

const RAW = 'raw';
const ENDRAW = 'endraw';
const RE = /^(#|\/)raw$/m;

/**
 * @example {{ #raw }} <script>{{ #if x }}foo{{ /if }}</script> {{ /raw }}
 *                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export const tag: Tag = {
  parse(base, content) {
    const [, start] = content.match(RE) ?? [];

    if (start === '/') {
      const tag = {
        ...base,
        name: ENDRAW,
      };

      if (this.verifyFirstTag(RAW, tag)) {
        this.end(tag);
      }

      return;
    }

    if (start === '#') {
      this.start({
        ...base,
        name: RAW,
      });

      this.nextTag = ENDRAW;

      return;
    }

    return false;
  },

  async compile(template, tag, _context, out) {
    if (tag.name === RAW) {
      const loc = out.pushStr(
        template.slice(tag.endIndex, (tag.next as EndTag).startIndex),
      );
      this.goto(tag.next as EndTag);
      return loc;
    }

    if (tag.name === ENDRAW) {
      return;
    }

    return false;
  },
};
