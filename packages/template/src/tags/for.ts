import { StartTag } from '../ast';
import { Tag } from '../types';

export const FOR = 'for';
const ELSE = 'else';
const END_FOR = 'end_for';

/**
 * @example {{ #for item in items }}{{ item }}{{ /for }}
 * @example {{ #for key, value in items }}{{ key }}:{{ value }}{{ /for }}
 */
export const tag: Tag = {
  names: [FOR, ELSE],

  parse({ ast, base }) {
    if (base.isEnd) {
      const tag = {
        ...base,
        name: END_FOR,
      };

      if (ast.checkStartTag(FOR, tag)) {
        ast.end(tag);
      }

      return;
    }

    if (base.identifier === ELSE) {
      const tag = {
        ...base,
        name: ELSE,
      };

      if (ast.checkStartTag(FOR, tag, false)) {
        ast.between(tag);
        return;
      }
    }

    if (base.data) {
      ast.start({
        ...base,
        name: FOR,
        rawStatement: base.data,
      });

      return;
    }

    return false;
  },

  async compile({ template, tag, context, out }, compileContent) {
    if (tag.name === FOR) {
      const { level, index } = (tag as StartTag).node;
      const affix = `${level.toString(32)}_${index.toString(32)}`;
      const [{ value }, , ...right] = (tag as StartTag).statement!;
      const items = out.compileStatement(right, context);
      const names = value.split(/,\s+/);
      const lines: string[] = [];
      lines.push(`const o_${affix}=${items};`);
      lines.push(`const a_${affix}=Array.isArray(o_${affix});`);
      lines.push(`const k_${affix}=Object.keys(o_${affix});`);
      lines.push(`const l_${affix}=k_${affix}.length;`);
      if ((tag.nextSibling as StartTag).name === ELSE) {
        lines.push(`if(l_${affix}){`);
      }
      if (names.length > 1) {
        lines.push(
          `const _get_in_${affix}=(c,i,k)=>Array.isArray(c)?c[i]:c[k];`,
        );
      }
      lines.push(
        `for(let i_${affix}=0;i_${affix}<l_${affix};i_${affix}++){`,
        `const _item=o_${affix}[k_${affix}[i_${affix}]];`,
        `const ${context}_i_${affix}={`,
        `...${context},`,
      );
      if (names.length > 1) {
        names.forEach((name, index) => {
          lines.push(
            `${name}:a_${affix}?_get_in_${affix}(_item,${index},"${name}"):${index === 0 ? `k_${affix}[i_${affix}]` : '_item'},`,
          );
        });
      } else {
        lines.push(`${value}:_item,`);
      }
      lines.push(
        `loop:{`,
        `index:i_${affix},`,
        `first:i_${affix}===0,`,
        `last:i_${affix}===l_${affix},`,
        `length:l_${affix}`,
        `}`,
        `};`,
      );
      const loc = out.pushLine(...lines);
      await compileContent({
        template,
        tag: tag as StartTag,
        context: `${context}_i_${affix}`,
        out,
      });
      return loc;
    }

    if (tag.name === ELSE) {
      if (tag.previousSibling?.name === FOR) {
        out.pushLine('}');
        const loc = out.pushLine('}else{');
        await compileContent({ template, tag: tag as StartTag, context, out });
        return loc;
      }
    }

    if (tag.name === END_FOR) {
      return out.pushLine('}');
    }

    return false;
  },
};
