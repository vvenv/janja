import { StartTag } from '../ast';
import { Tag } from '../types';

const UNCLAIMED = 'unclaimed';
const ENDUNCLAIMED = 'endunclaimed';

/**
 * A fallback tag for unclaimed tags.
 */
export const tag: Tag = {
  priority: -20,

  parse(base, _content, original) {
    this.start({
      ...base,
      name: UNCLAIMED,
      rawStatement: original,
    });

    // Self closing
    this.end({
      ...base,
      startIndex: base.endIndex,
      name: ENDUNCLAIMED,
    });
  },

  compile(_template, tag, _context, out) {
    if (tag.name === UNCLAIMED) {
      return out.pushVar(
        `"${(tag as StartTag)
          .rawStatement!.replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/[\n\r]/g, '\\n')}"`,
      );
    }
  },
};
