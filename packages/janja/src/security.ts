import { escape } from './escape';
import { Safe } from './safe';
import type { ObjectType } from './types';

export interface SecurityOptions {
  sandbox?: boolean;
  allowedGlobals?: string[];
  deepEscape?: boolean;
  cspNonce?: string;
  cspHeaders?: Record<string, string>;
  /**
   * Maximum nest depth of `include` while rendering. Defaults to 100.
   * Cycles that never end become an error instead of a stack overflow.
   */
  maxIncludeDepth?: number;
  /**
   * Maximum number of `for` loop iterations across one render. Off by default.
   * Enable when templates may be untrusted.
   */
  maxLoopIterations?: number;
  /**
   * Maximum nest depth of macro invocations across one render. Off by default.
   */
  maxCallDepth?: number;
  /**
   * Wall-clock budget for one `render` / `renderCompiled` call, in
   * milliseconds. Off by default. The running script is not aborted; the
   * promise rejects when the budget is exceeded. Prefer a separate process
   * for truly hostile templates.
   */
  timeoutMs?: number;
}

/** Defaults and resolved limits used by the compiler and renderer. */
export function resolveSecurityLimits(security: SecurityOptions = {}) {
  return {
    maxIncludeDepth: security.maxIncludeDepth ?? 100,
    maxLoopIterations: security.maxLoopIterations,
    maxCallDepth: security.maxCallDepth,
    timeoutMs: security.timeoutMs,
  };
}

export class SecuritySandbox {
  private allowedGlobals: Set<string>;

  private cspNonce?: string;

  constructor(options: SecurityOptions = {}) {
    this.allowedGlobals = new Set(options.allowedGlobals || []);
    this.cspNonce = options.cspNonce;
  }

  sanitizeGlobals(globals: ObjectType): ObjectType {
    const sanitized: ObjectType = {};

    for (const [key, value] of Object.entries(globals)) {
      if (this.allowedGlobals.has(key)) {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  validateExpression(expression: string): boolean {
    // Prevent access to dangerous globals
    const dangerousPatterns = [
      /\bprocess\b/,
      /\brequire\b/,
      /\bimport\b/,
      /\bexport\b/,
      /\beval\b/,
      /\bFunction\b/,
      /\b__proto__\b/,
      /\bconstructor\b/,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(expression)) {
        return false;
      }
    }

    return true;
  }

  createSecureContext(globals: ObjectType): ObjectType {
    const sanitized = this.sanitizeGlobals(globals);

    // Add safe utility functions
    return {
      ...sanitized,
      Math,
      Date,
      JSON,
      // Add other safe built-ins as needed
    };
  }

  getCSPNonce(): string | undefined {
    return this.cspNonce;
  }

  generateCSPHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.cspNonce) {
      headers['Content-Security-Policy'] =
        `script-src 'nonce-${this.cspNonce}'`;
    }

    return headers;
  }
}

export function deepEscape(value: unknown, seen = new WeakSet()): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Safe) {
    return `${value}`;
  }

  if (typeof value === 'object') {
    // Guard against circular references
    if (seen.has(value)) {
      return '';
    }

    seen.add(value);

    const values = Array.isArray(value)
      ? value
      : Object.values(value as ObjectType);

    return values.map((v) => deepEscape(v, seen)).join('');
  }

  return escape(value);
}

export interface SecurityAuditResult {
  issues: SecurityIssue[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityIssue {
  type: string;
  message: string;
  location?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityAuditor {
  auditTemplate(template: string): SecurityAuditResult {
    const issues: SecurityIssue[] = [];

    // Check for dangerous patterns
    const dangerousPatterns = [
      {
        pattern: /\beval\s*\(/,
        type: 'dangerous-eval',
        message: 'Use of eval() is dangerous and should be avoided',
        severity: 'critical' as const,
      },
      {
        pattern: /\bFunction\s*\(/,
        type: 'dangerous-function',
        message: 'Use of Function constructor is dangerous',
        severity: 'critical' as const,
      },
      {
        pattern: /\brequire\s*\(/,
        type: 'require-usage',
        message: 'Direct require() usage in templates is unsafe',
        severity: 'high' as const,
      },
      {
        pattern: /\bimport\s*\(/,
        type: 'dynamic-import',
        message: 'Dynamic import() usage in templates may be unsafe',
        severity: 'high' as const,
      },
    ];

    for (const { pattern, type, message, severity } of dangerousPatterns) {
      const match = template.match(pattern);

      if (match) {
        issues.push({
          type,
          message,
          location: `at index ${match.index}`,
          severity,
        });
      }
    }

    // Calculate overall severity
    const overallSeverity = this.calculateOverallSeverity(issues);

    return {
      issues,
      severity: overallSeverity,
    };
  }

  private calculateOverallSeverity(
    issues: SecurityIssue[],
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (issues.length === 0) {
      return 'low';
    }

    const severityMap = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const maxSeverity = Math.max(
      ...issues.map((issue) => severityMap[issue.severity]),
    );

    return Object.entries(severityMap).find(
      ([, value]) => value === maxSeverity,
    )![0] as 'low' | 'medium' | 'high' | 'critical';
  }
}
