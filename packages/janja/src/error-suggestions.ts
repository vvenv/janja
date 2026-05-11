export interface ErrorSuggestion {
  message: string;
  fix?: string;
  example?: string;
}

export function getSuggestions(
  errorType: string,
  message: string,
  context?: string,
): ErrorSuggestion[] {
  const suggestions: ErrorSuggestion[] = [];

  // Expression parsing errors
  if (errorType === 'ExpError') {
    if (message.includes('Unexpected end of expression')) {
      suggestions.push({
        message:
          'The expression is incomplete. Make sure you have closed all parentheses, brackets, and quotes.',
        fix: 'Check for missing closing characters: ), ], }',
      });
    }

    if (message.includes('Expected "RP" after "LP"')) {
      suggestions.push({
        message: 'Missing closing parenthesis in your expression.',
        fix: 'Add a closing parenthesis ) to match the opening one.',
        example: '(foo.bar) instead of (foo.bar',
      });
    }

    if (message.includes('No left operand')) {
      suggestions.push({
        message: 'An operator is missing its left operand.',
        fix: 'Add a value or variable before the operator.',
        example: 'x + 1 instead of + 1',
      });
    }

    if (message.includes('No right operand')) {
      suggestions.push({
        message: 'An operator is missing its right operand.',
        fix: 'Add a value or variable after the operator.',
        example: 'x + 1 instead of x +',
      });
    }

    if (message.includes('Expected "ID" after "PIPE"')) {
      suggestions.push({
        message: 'The pipe operator | must be followed by a filter name.',
        fix: 'Add a filter name after the pipe.',
        example: 'value|upper instead of value|',
      });
    }

    if (message.includes('Expected "ID" after "DOT"')) {
      suggestions.push({
        message: 'The dot operator . must be followed by a property name.',
        fix: 'Add a property name after the dot.',
        example: 'object.property instead of object.',
      });
    }

    if (message.includes('Left operand of assignment must be an identifier')) {
      suggestions.push({
        message: 'Assignment targets must be valid identifiers.',
        fix: 'Use a simple variable name or sequence of variable names.',
        example: 'x = 1 or (a, b) = [1, 2]',
      });
    }

    if (message.includes('Expected test expression')) {
      suggestions.push({
        message: 'The conditional expression is missing its test condition.',
        fix: 'Add a condition after the if keyword.',
        example: 'if x > 0 then y else z',
      });
    }

    if (message.includes('Expected alternative expression')) {
      suggestions.push({
        message: 'The conditional expression is missing its else clause.',
        fix: 'Add an alternative expression after then.',
        example: 'if x > 0 then y else z',
      });
    }

    if (message.startsWith('Unexpect')) {
      suggestions.push({
        message: 'An unexpected character was found in the expression.',
        fix: 'Check for typos or invalid characters in your expression.',
      });
    }
  }

  // Template compilation errors
  if (errorType === 'CompileError') {
    if (message.includes('Unclosed')) {
      const match = message.match(/Unclosed "([^"]+)"/);
      const marker = match ? match[1] : 'marker';

      suggestions.push({
        message: `The ${marker} marker is not closed properly.`,
        fix: `Add the closing marker for ${marker}.`,
        example:
          marker === '{%'
            ? '{% ... %}'
            : marker === '{#'
              ? '{# ... #}'
              : '{{ ... }}',
      });
    }

    if (message.includes('Unexpected')) {
      suggestions.push({
        message: 'An unexpected token was found in the template.',
        fix: 'Check your template syntax and ensure all markers are properly formatted.',
      });
    }
  }

  // General suggestions for all errors
  if (context) {
    suggestions.push({
      message: 'Context information:',
      fix: context,
    });
  }

  return suggestions;
}

export function formatErrorWithSuggestions(
  errorType: string,
  message: string,
  details: string,
  context?: string,
): string {
  const suggestions = getSuggestions(errorType, message, context);

  if (suggestions.length === 0) {
    return details;
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

  return `${details}

Suggestions:
${suggestionText}`;
}
