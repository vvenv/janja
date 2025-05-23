import { EndTag, StartTag } from '../ast';
import { Tag } from '../types';

const COMMENT = 'comment';
const END_COMMENT = 'end_comment';

/**
 * @example {{ #comment }} This is a comment {{ /comment }}
 *                         ^^^^^^^^^^^^^^^^^
 */
export const tag: Tag = {
  names: [COMMENT],

  parse({ ast, base }) {
    if (base.isEnd) {
      const tag = {
        ...base,
        name: END_COMMENT,
      };

      if (ast.checkStartTag(COMMENT, tag)) {
        ast.end(tag);
      }

      return;
    }

    ast.start({
      ...base,
      name: COMMENT,
    });
  },

  async compile({ template, tag, context, ast, out }, compileContent) {
    if (tag.name === COMMENT) {
      if (out.options.stripComments) {
        ast.goto(tag.nextSibling as EndTag);
      } else {
        const { data } = tag as StartTag;
        if (data) {
          out.pushStr(`<!--${data}-->`);
        } else {
          out.pushStr('<!--');
          await compileContent({
            template,
            tag: tag as StartTag,
            context,
            out,
          });
        }
      }

      return;
    }

    if (tag.name === END_COMMENT) {
      if (!out.options.stripComments) {
        if (!tag.previousSibling?.data) {
          out.pushStr('-->');
        }
      }

      return;
    }

    return false;
  },
};
