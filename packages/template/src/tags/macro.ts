import { StartTag } from '../ast';
import { parseFormalArgs } from '../utils/parse-formal-args';
import { Tag } from '../types';

const MACRO = 'macro';
const ENDMACRO = 'endmacro';
const CALLER = 'caller';
const ENDCALLER = 'endcaller';
const RE = /^(?:#macro\s+(.+))|(caller\(\))|(\/macro)$/;

/**
 * @example {{ #macro my_macro x y }}...{{ caller() }}{{ /macro }}{{ my_macro "foo" 1 }}
 */
export const tag: Tag = {
  parse(base, content) {
    const [, rawStatement, caller, end] = content.match(RE) ?? [];

    if (end) {
      const tag = {
        ...base,
        name: ENDMACRO,
      };

      if (this.verifyFirstTag(MACRO, tag)) {
        this.end(tag);
      }

      return;
    }

    if (caller) {
      const tag = {
        ...base,
        name: CALLER,
        rawStatement,
      };

      if (this.verifyFirstTag(MACRO, tag)) {
        this.start(tag);

        // Self closing
        this.end({
          ...base,
          startIndex: base.endIndex,
          name: ENDCALLER,
        });
      }

      return;
    }

    if (rawStatement) {
      this.start({
        ...base,
        name: MACRO,
        rawStatement,
      });

      return;
    }

    return false;
  },

  async compile(template, tag, context, out, compileContent) {
    if (tag.name === MACRO) {
      const affix = `${(tag as StartTag).node.level}_${(tag as StartTag).node.index}`;
      const { name, args } = parseStatement(tag as StartTag);
      const lines: string[] = [];
      lines.push(`${context}.${name}=async(${['_c', ...args].join(',')})=>{`);
      if (args.length) {
        lines.push(`const ${context}_m_${affix}={`, `...${context},`);
        args.forEach((param) => {
          lines.push(`${param.replace(/(\w+)=.+/, '$1')},`);
        });
        lines.push(`};`);
      }
      const loc = out.pushLine(...lines);
      await compileContent(
        template,
        tag as StartTag,
        `${context}_m_${affix}`,
        this,
        out,
      );
      return loc;
    }

    if (tag.name === CALLER) {
      const loc = out.pushLine(`await _c?.();`);
      await compileContent(template, tag as StartTag, context, this, out);
      return loc;
    }

    if (tag.name === ENDCALLER) {
      return;
    }

    if (tag.name === ENDMACRO) {
      out.pushLine('};');
      return;
    }

    return false;
  },
};

function parseStatement(tag: StartTag) {
  const [, name, args] = tag.rawStatement!.match(/^(\w+?)(?:\s+(.+?))?$/)!;

  return {
    name,
    args: parseFormalArgs(args),
  };
}
