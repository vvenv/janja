import {
  parserOptions,
  type ParserOptions,
  type Token,
  Tokenizer,
  TokenType,
} from 'janja';

export class Parser {
  private options: Required<ParserOptions>;

  private tokenizer: Tokenizer;

  constructor(options = {}) {
    this.options = { ...parserOptions, ...options };
    this.tokenizer = new Tokenizer(this.options);
  }

  parse(source: string) {
    return this.tokenizer
      .tokenize(source)
      .filter(
        (token) =>
          token.type === TokenType.OUTPUT ||
          token.type === TokenType.DIRECTIVE ||
          token.type === TokenType.COMMENT,
      );
  }

  format(token: Token) {
    const arr = [];

    if (token.type === TokenType.COMMENT) {
      arr.push(this.options.commentOpen);
    } else if (token.type === TokenType.DIRECTIVE) {
      arr.push(this.options.directiveOpen);
    } else if (token.type === TokenType.OUTPUT) {
      arr.push(this.options.outputOpen);
    }

    if (token.strip.before) {
      arr.push('-');
    }

    arr.push(token.val);

    if (token.strip.after) {
      arr.push('-');
    }

    if (token.type === TokenType.COMMENT) {
      arr.push(this.options.commentClose);
    } else if (token.type === TokenType.DIRECTIVE) {
      arr.push(this.options.directiveClose);
    } else if (token.type === TokenType.OUTPUT) {
      arr.push(this.options.outputClose);
    }

    return arr.join('');
  }
}
