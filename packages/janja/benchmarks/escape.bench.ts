import { bench, describe } from 'vitest';
import { escape } from '../src/escape';

describe('escape function benchmarks', () => {
  const testStrings = {
    simple: 'Hello World',
    withQuotes: 'He said "Hello" to her',
    withTags: '<div>Hello</div>',
    withAmpersand: 'Tom & Jerry',
    withMixed: '<script>alert("XSS & attack")</script>',
    longString: `${'A'.repeat(1000)}<&>"${'B'.repeat(1000)}`,
  };

  bench('escape simple string', () => {
    escape(testStrings.simple);
  });

  bench('escape string with quotes', () => {
    escape(testStrings.withQuotes);
  });

  bench('escape string with HTML tags', () => {
    escape(testStrings.withTags);
  });

  bench('escape string with ampersand', () => {
    escape(testStrings.withAmpersand);
  });

  bench('escape string with mixed special characters', () => {
    escape(testStrings.withMixed);
  });

  bench('escape long string', () => {
    escape(testStrings.longString);
  });

  bench('escape string with no special characters', () => {
    escape('No special characters here');
  });

  bench('escape empty string', () => {
    escape('');
  });

  bench('escape null', () => {
    escape(null);
  });

  bench('escape undefined', () => {
    escape(undefined);
  });

  bench('escape number', () => {
    escape(12345);
  });

  bench('escape object', () => {
    escape({ key: 'value' });
  });
});
