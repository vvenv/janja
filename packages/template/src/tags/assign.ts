import { StartTag } from '../ast';
import { Tag } from '../types';

const ASSIGN = 'assign';
const ENDASSIGN = 'endassign';
const RE = /^assign\s+(.+\s+=\s+.+)$/;

/**
 * @example {{ assign my_var = my_obj }}
 */
export const tag: Tag = {
  parse(base, content) {
    const [, rawStatement] = content.match(RE) ?? [];

    if (rawStatement) {
      this.start({
        ...base,
        name: ASSIGN,
        rawStatement,
      });

      // Self closing
      this.end({
        ...base,
        startIndex: base.endIndex,
        name: ENDASSIGN,
      });

      return;
    }

    return false;
  },

  compile(_template, tag, context, out) {
    if (tag.name === ASSIGN) {
      const [{ value }, , ...right] = (tag as StartTag).statement!;
      const object = out.compileStatement(right, context);
      const names = value.split(/,\s+/);
      const lines: string[] = [];
      lines.push(`Object.assign(${context},{`);
      if (names.length > 1) {
        names.forEach((key) => {
          lines.push(`${key}:${object}.${key},`);
        });
      } else {
        lines.push(`${value}:${object},`);
      }
      lines.push(`});`);
      return out.pushLine(...lines);
    }

    if (tag.name === ENDASSIGN) {
      return;
    }

    return false;
  },
};
