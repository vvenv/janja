import { EndTag, StartTag } from '../ast';
import { Tag } from '../types';

const COMMENT = 'comment';
const ENDCOMMENT = 'endcomment';
const RE = /^(?:!\s(.+)|#\s(.+?)\s#|(#comment)|(\/comment))$/ms;

/**
 * @example {{ ! This is a comment }}
 *              ^^^^^^^^^^^^^^^^^
 * @example {{ # This is a comment # }}
 *              ^^^^^^^^^^^^^^^^^
 * @example {{ #comment }} This is a comment {{ /comment }}
 *                       ^^^^^^^^^^^^^^^^^
 */
export const tag: Tag = {
  parse(base, content) {
    const [, __, rawStatement = __, start, end] = content.match(RE) ?? [];

    if (end) {
      const tag = {
        ...base,
        name: ENDCOMMENT,
      };

      if (this.verifyFirstTag(COMMENT, tag)) {
        this.end(tag);
      }

      return;
    }

    if (start) {
      this.start({
        ...base,
        name: COMMENT,
      });

      return;
    }

    if (rawStatement) {
      this.start({
        ...base,
        name: COMMENT,
        rawStatement,
      });

      // Self closing
      this.end({
        ...base,
        startIndex: base.endIndex,
        name: ENDCOMMENT,
      });

      return;
    }

    return false;
  },

  async compile(template, tag, context, out, compileContent) {
    if (tag.name === COMMENT) {
      if (out.options.stripComments) {
        this.goto(tag.next as EndTag);
      } else {
        const { rawStatement } = tag as StartTag;
        if (rawStatement) {
          out.pushStr(`<!--${rawStatement}-->`);
        } else {
          out.pushStr('<!--');
          await compileContent(template, tag as StartTag, context, this, out);
        }
      }

      return;
    }

    if (tag.name === ENDCOMMENT) {
      if (!out.options.stripComments) {
        if (!tag.prev?.rawStatement) {
          out.pushStr('-->');
        }
      }

      return;
    }

    return false;
  },
};
