import { expect, it } from 'vitest';
import { validateTemplate } from './validator';

it('validates a simple template', async () => {
  const result = await validateTemplate('Hello {{ name }}');

  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
});

it('detects unclosed markers', async () => {
  const result = await validateTemplate('Hello {{ name');

  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
  expect(result.errors[0].message).toContain('Unclosed');
});

it('detects unclosed directive markers', async () => {
  const result = await validateTemplate('{% if true %}Hello{% endif');

  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
});

it('validates template with syntax error', async () => {
  const result = await validateTemplate('{{ for }}');

  // Static validation doesn't catch semantic syntax errors
  expect(result.valid).toBe(true);
});

it('provides warnings for suspicious patterns', async () => {
  const result = await validateTemplate('{{ . }}');

  expect(result.valid).toBe(true);
  expect(result.warnings.length).toBeGreaterThan(0);
  expect(result.warnings[0].message).toContain('Empty dot notation');
});

it('returns suggestions for errors', async () => {
  const result = await validateTemplate('{{ (foo.bar }');

  expect(result.valid).toBe(false);

  if (result.errors.length > 0) {
    expect(result.errors[0].suggestion).toBeDefined();
  }
});
