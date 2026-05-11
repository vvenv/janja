import { describe, expect, it } from 'vitest';
import { escape } from './escape';

describe('escape performance regression tests', () => {
  const iterations = 10000;

  it('should escape simple strings within performance threshold', () => {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      escape('Hello World');
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    // Should complete in less than 0.015ms per escape on average
    expect(avgTime).toBeLessThan(0.015);
  });

  it('should escape strings with special characters within performance threshold', () => {
    const testStr = '<script>alert("XSS & attack")</script>';
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      escape(testStr);
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    // Should complete in less than 0.02ms per escape on average
    expect(avgTime).toBeLessThan(0.02);
  });

  it('should escape long strings within performance threshold', () => {
    const longStr = `${'A'.repeat(1000)}<&>"${'B'.repeat(1000)}`;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      escape(longStr);
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    // Should complete in less than 0.05ms per escape on average
    expect(avgTime).toBeLessThan(0.05);
  });

  it('should handle batch escapes efficiently', () => {
    const strings = [
      'Hello',
      '<div>World</div>',
      'Tom & Jerry',
      '<script>alert("test")</script>',
      'A'.repeat(100),
    ];
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      for (const str of strings) {
        escape(str);
      }
    }

    const duration = performance.now() - start;
    const avgTime = duration / (iterations * strings.length);

    // Should complete in less than 0.015ms per escape on average
    expect(avgTime).toBeLessThan(0.015);
  });
});
