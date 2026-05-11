import { describe, expect, it } from 'vitest';
import { deepEscape, SecurityAuditor, SecuritySandbox } from './security';

describe('SecuritySandbox', () => {
  it('should sanitize globals based on allowed list', () => {
    const sandbox = new SecuritySandbox({
      allowedGlobals: ['Math', 'Date'],
    });

    const result = sandbox.sanitizeGlobals({
      Math: {},
      Date: {},
      process: {},
    });

    expect(result).toHaveProperty('Math');
    expect(result).toHaveProperty('Date');
    expect(result).not.toHaveProperty('process');
  });

  it('should validate safe expressions', () => {
    const sandbox = new SecuritySandbox();

    expect(sandbox.validateExpression('const x = 1')).toBe(true);
    expect(sandbox.validateExpression('const y = 2 + 3')).toBe(true);
  });

  it('should reject dangerous expressions', () => {
    const sandbox = new SecuritySandbox();

    expect(sandbox.validateExpression('eval("code")')).toBe(false);
    expect(sandbox.validateExpression('new Function("code")')).toBe(false);
    expect(sandbox.validateExpression('require("fs")')).toBe(false);
  });

  it('should create secure context', () => {
    const sandbox = new SecuritySandbox({
      allowedGlobals: ['Math', 'Date'],
    });

    const context = sandbox.createSecureContext({
      Math: {},
      Date: {},
    });

    expect(context).toHaveProperty('Math');
    expect(context).toHaveProperty('Date');
    expect(context).toHaveProperty('JSON');
  });

  it('should get CSP nonce', () => {
    const sandbox = new SecuritySandbox({
      cspNonce: 'test-nonce',
    });

    expect(sandbox.getCSPNonce()).toBe('test-nonce');
  });

  it('should generate CSP headers', () => {
    const sandbox = new SecuritySandbox({
      cspNonce: 'test-nonce',
    });

    const headers = sandbox.generateCSPHeaders();

    expect(headers).toHaveProperty('Content-Security-Policy');
    expect(headers['Content-Security-Policy']).toContain('test-nonce');
  });

  it('should not generate CSP headers without nonce', () => {
    const sandbox = new SecuritySandbox();

    const headers = sandbox.generateCSPHeaders();

    expect(headers).toEqual({});
  });
});

describe('deepEscape', () => {
  it('should escape strings', () => {
    expect(deepEscape('test')).toBe('test');
    expect(deepEscape('<script>')).toBe('<script>');
  });

  it('should handle null and undefined', () => {
    expect(deepEscape(null)).toBe('');
    expect(deepEscape(undefined)).toBe('');
  });

  it('should handle numbers', () => {
    expect(deepEscape(123)).toBe('123');
  });

  it('should handle arrays', () => {
    const result = deepEscape(['hello', 'world']);

    expect(result).toBe('helloworld');
  });

  it('should handle objects', () => {
    const result = deepEscape({ a: 'hello', b: 'world' });

    expect(result).toBe('helloworld');
  });

  it('should handle nested objects', () => {
    const result = deepEscape({ a: { b: 'test' } });

    expect(result).toBe('test');
  });
});

describe('SecurityAuditor', () => {
  it('should audit safe template', () => {
    const auditor = new SecurityAuditor();
    const result = auditor.auditTemplate('{{= name }}');

    expect(result.issues).toHaveLength(0);
    expect(result.severity).toBe('low');
  });

  it('should detect eval usage', () => {
    const auditor = new SecurityAuditor();
    const result = auditor.auditTemplate('eval("code")');

    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].type).toBe('dangerous-eval');
    expect(result.severity).toBe('critical');
  });

  it('should detect Function constructor', () => {
    const auditor = new SecurityAuditor();
    const result = auditor.auditTemplate('new Function("code")');

    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].type).toBe('dangerous-function');
    expect(result.severity).toBe('critical');
  });

  it('should detect require usage', () => {
    const auditor = new SecurityAuditor();
    const result = auditor.auditTemplate('require("fs")');

    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].type).toBe('require-usage');
    expect(result.severity).toBe('high');
  });

  it('should detect dynamic import', () => {
    const auditor = new SecurityAuditor();
    const result = auditor.auditTemplate('import("module")');

    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].type).toBe('dynamic-import');
    expect(result.severity).toBe('high');
  });

  it('should calculate overall severity correctly', () => {
    const auditor = new SecurityAuditor();

    const safeResult = auditor.auditTemplate('{{= name }}');

    expect(safeResult.severity).toBe('low');

    const criticalResult = auditor.auditTemplate('eval("code")');

    expect(criticalResult.severity).toBe('critical');
  });

  it('should provide issue location', () => {
    const auditor = new SecurityAuditor();
    const result = auditor.auditTemplate('test eval("code")');

    expect(result.issues[0]).toHaveProperty('location');
    expect(result.issues[0].location).toContain('index');
  });
});
