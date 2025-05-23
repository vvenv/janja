import { StartTag } from '../ast';
import { Tag } from '../types';

const IF = 'if';
const ELIF = 'elif';
const ELSE = 'else';
const ENDIF = 'endif';
const RE = /^(?:(el|#)if\s+(.+))|(else)|(\/if)$/;

/**
 * @example {{ #if my_var | my_filter }}yes{{ else }}no{{ /if }}
 *             ^^ ^^^^^^^^^^^^^^^^^^       ^^^^      ^^^
 */
export const tag: Tag = {
  parse(base, content) {
    const [, start, rawStatement, _else, end] = content.match(RE) ?? [];

    if (end) {
      const tag = {
        ...base,
        name: ENDIF,
      };

      if (this.verifyFirstTag(IF, tag)) {
        this.end(tag);
      }

      return;
    }

    if (_else) {
      const tag = {
        ...base,
        name: ELSE,
      };

      if (this.verifyFirstTag(IF, tag, false)) {
        this.between(tag);
        return;
      }
    }

    if (start === 'el') {
      const tag = {
        ...base,
        name: ELIF,
        rawStatement,
      };

      if (this.verifyFirstTag(IF, tag)) {
        this.between(tag);
      }

      return;
    }

    // start === '#'
    if (rawStatement) {
      this.start({
        ...base,
        name: IF,
        rawStatement,
      });

      return;
    }

    return false;
  },

  async compile(template, tag, context, out, compileContent) {
    if (tag.name === IF) {
      const loc = out.pushLine(
        `if(${out.compileStatement((tag as StartTag).statement!, context)}){`,
      );
      await compileContent(template, tag as StartTag, context, this, out);
      return loc;
    }

    if (tag.name === ELIF) {
      const loc = out.pushLine(
        `}else if(${out.compileStatement((tag as StartTag).statement!, context)}){`,
      );
      await compileContent(template, tag as StartTag, context, this, out);
      return loc;
    }

    if (tag.name === ELSE) {
      if (tag.prev?.name === IF || tag.prev?.name === ELIF) {
        const loc = out.pushLine('}else{');
        await compileContent(template, tag as StartTag, context, this, out);
        return loc;
      }
    }

    if (tag.name === ENDIF) {
      out.pushLine('}');
      return;
    }

    return false;
  },
};
