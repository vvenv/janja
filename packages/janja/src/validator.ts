export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class TemplateValidator {
  async validate(template: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Static validation checks only
    this.checkUnclosedMarkers(template, errors);
    this.checkFilterUsage(template, warnings);
    this.checkVariableSyntax(template, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private checkUnclosedMarkers(template: string, errors: ValidationError[]) {
    const markers = [
      { open: '{{', close: '}}' },
      { open: '{%', close: '%}' },
      { open: '{#', close: '#}' },
    ];

    for (const { open, close } of markers) {
      let openCount = 0;
      let closeCount = 0;

      for (let i = 0; i < template.length; i++) {
        if (template.slice(i, i + open.length) === open) {
          openCount++;
        }

        if (template.slice(i, i + close.length) === close) {
          closeCount++;
        }
      }

      if (openCount !== closeCount) {
        const line = this.findLine(template, open);

        errors.push({
          type: 'error',
          message: `Unclosed ${open} marker: found ${openCount} opening but ${closeCount} closing`,
          line,
          suggestion: `Add missing ${close} marker(s)`,
        });
      }
    }
  }

  private checkFilterUsage(template: string, warnings: ValidationError[]) {
    // Find all filter usages like {{ value|filter }}
    const filterRegex = /\|\s*([a-zA-Z_][a-zA-Z0-9_]*)/g;

    let match;

    while ((match = filterRegex.exec(template)) !== null) {
      const [filterName] = match;
      const line = this.findLine(template, filterName);

      // Check if this is a common filter that might not exist
      // This is a basic check - in a real implementation, you'd check against the actual filter registry
      if (filterName.length > 20) {
        warnings.push({
          type: 'warning',
          message: `Unusually long filter name: "${filterName}" - possible typo?`,
          line,
        });
      }
    }
  }

  private checkVariableSyntax(template: string, warnings: ValidationError[]) {
    // Check for common variable syntax issues
    const issues = [
      {
        regex: /\{\{\s*\.\s*\}\}/,
        message: 'Empty dot notation - likely missing property name',
      },
      {
        regex: /\{\{\s*\|\s*[a-zA-Z]/,
        message: 'Pipe operator without left operand',
      },
      {
        regex: /\{\{[^}]*$/,
        message: 'Possible unclosed expression',
      },
    ];

    for (const { regex, message } of issues) {
      const match = regex.exec(template);

      if (match) {
        const line = this.findLine(template, match[0]);

        warnings.push({
          type: 'warning',
          message,
          line,
        });
      }
    }
  }

  private findLine(template: string, substring: string): number | undefined {
    const index = template.indexOf(substring);

    if (index === -1) {
      return undefined;
    }

    const before = template.slice(0, index);

    return before.split('\n').length;
  }
}

export async function validateTemplate(
  template: string,
): Promise<ValidationResult> {
  const validator = new TemplateValidator();

  return validator.validate(template);
}
