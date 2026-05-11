import { describe, expect, it } from 'vitest';
import { OutScript } from './out-script';

describe('OutScript performance regression tests', () => {
  const iterations = 10000;

  it('should pushStr simple strings within performance threshold', () => {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const outScript = new OutScript();

      outScript.pushStr(null, 'Hello World');
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    // Should complete in less than 0.05ms per operation on average
    expect(avgTime).toBeLessThan(0.05);
  });

  it('should pushRaw within performance threshold', () => {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const outScript = new OutScript();

      outScript.pushRaw(null, 's+="hello";');
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    // Should complete in less than 0.03ms per operation on average
    expect(avgTime).toBeLessThan(0.03);
  });

  it('should handle multiple operations efficiently', () => {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const outScript = new OutScript();

      outScript.pushStr(null, '<div>');
      outScript.pushRaw(null, 's+=escape(x);');
      outScript.pushStr(null, '</div>');
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    // Should complete in less than 0.1ms per template on average
    expect(avgTime).toBeLessThan(0.1);
  });

  it('should generate code efficiently', () => {
    const outScript = new OutScript();

    outScript.start();
    outScript.pushStr(null, '<div>');
    outScript.pushRaw(null, 's+=escape(title);');
    outScript.pushStr(null, '</div>');
    outScript.end();

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      void outScript.code;
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    // Should complete in less than 0.001ms per code generation on average
    expect(avgTime).toBeLessThan(0.001);
  });

  it('should handle complex templates efficiently', () => {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const outScript = new OutScript();

      outScript.start();

      for (let j = 0; j < 10; j++) {
        outScript.pushStr(null, `<div>${j}</div>`);
        outScript.pushRaw(null, `s+=escape(var${j});`);
      }

      outScript.end();
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    // Should complete in less than 0.5ms per template on average
    expect(avgTime).toBeLessThan(0.5);
  });
});
