import { StartTag } from '../ast';
import { Tag } from '../types';

const UNCLAIMED = 'unclaimed';
const END_UNCLAIMED = 'end_unclaimed';

/**
 * A fallback tag for unclaimed tags.
 */
export const tag: Tag = {
  priority: -20,

  names: [],

  parse({ ast, base }) {
    ast.start({
      ...base,
      name: UNCLAIMED,
      data: base.original,
    });

    // Self closing
    ast.end({
      ...base,
      startIndex: base.endIndex,
      name: END_UNCLAIMED,
    });
  },

  compile({ tag, out }) {
    if (tag.name === UNCLAIMED) {
      return out.pushVar(
        `"${(tag as StartTag)
          .data!.replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/[\n\r]/g, '\\n')}"`,
      );
    }
  },
};
