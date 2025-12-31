import { ExpFormatter } from './exp/exp-formatter';
import type { SyntaxNode } from './syntax-nodes';
import { type FormatterOptions, TokenType } from './types';

export class Formatter {
  private expFormatter = new ExpFormatter();

  constructor(public options: Required<FormatterOptions>) {}

  format(node?: SyntaxNode) {
    if (!node) {
      return '';
    }

    const arr = [];

    if (node.type === TokenType.COMMENT) {
      arr.push(this.options.commentOpen);
    } else if (node.type === TokenType.DIRECTIVE) {
      arr.push(this.options.directiveOpen);
    } else if (node.type === TokenType.OUTPUT) {
      arr.push(this.options.outputOpen);
    }

    if (node.strip?.before) {
      arr.push('-');
    }

    if (node.type !== TokenType.TEXT) {
      arr.push(' ');
    }

    if (node.val) {
      if (typeof node.val === 'string') {
        arr.push(node.val.trim());
      } else {
        arr.push(this.expFormatter.format(node.val));
      }
    }

    if (node.type !== TokenType.TEXT) {
      arr.push(' ');
    }

    if (node.strip?.after) {
      arr.push('-');
    }

    if (node.type === TokenType.COMMENT) {
      arr.push(this.options.commentClose);
    } else if (node.type === TokenType.DIRECTIVE) {
      arr.push(this.options.directiveClose);
    } else if (node.type === TokenType.OUTPUT) {
      arr.push(this.options.outputClose);
    }

    return arr.join('');
  }
}
