import { getSuggestions } from '../error-suggestions';
import type { Loc } from '../types';

export class ExpError extends SyntaxError {
  constructor(
    message: string,
    public loc: Loc,
    private context?: string,
  ) {
    super(message);
    this.name = 'ExpError';
    ExpError.captureStackTrace?.(this, this.constructor);
  }

  get suggestions() {
    return getSuggestions(this.name, this.message, this.context);
  }

  get details() {
    const { suggestions } = this;

    if (suggestions.length === 0) {
      return this.message;
    }

    const suggestionText = suggestions
      .map((s, i) => {
        let text = `  ${i + 1}. ${s.message}`;

        if (s.fix) {
          text += `\n     Fix: ${s.fix}`;
        }

        if (s.example) {
          text += `\n     Example: ${s.example}`;
        }

        return text;
      })
      .join('\n');

    return `${this.message}

Suggestions:
${suggestionText}`;
  }
}
