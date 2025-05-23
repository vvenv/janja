import { Tag } from '../types';
import { FOR } from './for';

const CONTINUE = 'continue';
const ENDCONTINUE = 'endcontinue';
const RE = /^continue$/;

/**
 * @example {{ continue }}
 */
export const tag: Tag = {
  parse(base, content) {
    if (content.match(RE)) {
      const tag = {
        ...base,
        name: CONTINUE,
      };

      if (this.verifyStartTag(FOR, tag)) {
        this.start(tag);

        // Self closing
        this.end({
          ...base,
          startIndex: base.endIndex,
          name: ENDCONTINUE,
        });

        return;
      }
    }

    return false;
  },

  compile(_template, tag, _context, out) {
    if (tag.name === CONTINUE) {
      return out.pushLine('continue;');
    }

    if (tag.name === ENDCONTINUE) {
      return;
    }

    return false;
  },
};
