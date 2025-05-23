import { Tag } from '../types';
import { FOR } from './for';

const BREAK = 'break';
const ENDBREAK = 'endbreak';
const RE = /^break$/;

/**
 * @example {{ break }}
 */
export const tag: Tag = {
  parse(base, content) {
    if (content.match(RE)) {
      const tag = {
        ...base,
        name: BREAK,
      };

      if (this.verifyStartTag(FOR, tag)) {
        this.start(tag);

        // Self closing
        this.end({
          ...base,
          startIndex: base.endIndex,
          name: ENDBREAK,
        });

        return;
      }
    }

    return false;
  },

  compile(_template, tag, _context, out) {
    if (tag.name === BREAK) {
      return out.pushLine('break;');
    }

    if (tag.name === ENDBREAK) {
      return;
    }

    return false;
  },
};
