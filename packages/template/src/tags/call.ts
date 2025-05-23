import { StartTag } from '../ast';
import { parseActualArgs } from '../utils/parse-actual-args';
import { Tag } from '../types';

const CALL = 'call';
const END_CALL = 'end_call';

/**
 * @example {{ #call my_macro "foo" "bar" }}...{{ /call }}
 */
export const tag: Tag = {
  names: [CALL],

  parse({ ast, base }) {
    if (base.isEnd) {
      const tag = {
        ...base,
        name: END_CALL,
      };

      if (ast.checkStartTag(CALL, tag)) {
        ast.end(tag);
      }

      return;
    }

    if (base.data) {
      ast.start({
        ...base,
        name: CALL,
      });

      return;
    }

    return false;
  },

  async compile({ template, tag, context, out }, compileContent) {
    if (tag.name === CALL) {
      const name = parseMacroName(tag as StartTag);
      const loc = out.pushLine(`await ${context}.${name}(async()=>{`);
      await compileContent({ template, tag: tag as StartTag, context, out });
      return loc;
    }

    if (tag.name === END_CALL) {
      const args = parseMacroActualArgs(tag.previousSibling!, context);
      return args.length
        ? out.pushLine(`},${args.join(',')});`)
        : out.pushLine(`});`);
    }

    return false;
  },
};

function parseMacroName(tag: StartTag) {
  const [name] = tag.data!.match(/^\S+/)!;

  return name;
}

function parseMacroActualArgs(tag: StartTag, context: string) {
  const [, args] = tag.data!.match(/^\S+\s+(.+)$/) ?? [];

  return parseActualArgs(args, context);
}
