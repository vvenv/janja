import { bench, describe, expect, it } from 'vitest';
import { render } from '../src';

describe('Rendering Performance Benchmarks', () => {
  const simpleTemplate = 'Hello {{ name }}!';
  const complexTemplate = `
    <html>
      <head><title>{{ title }}</title></head>
      <body>
        <h1>{{ header }}</h1>
        {{ for item of items }}
          <div>{{= item.name }}</div>
          <p>{{= item.description | truncate(100) }}</p>
        {{ endfor }}
      </body>
    </html>
  `;

  const simpleData = { name: 'World' };
  const complexData = {
    title: 'Test Page',
    header: 'Welcome',
    items: Array.from({ length: 100 }, (_, i) => ({
      name: `Item ${i}`,
      description: `This is a description for item ${i} with some text to make it longer`,
    })),
  };

  it('should compile simple template quickly', async () => {
    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await render(simpleTemplate, simpleData);
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    expect(avgTime).toBeLessThan(1); // Less than 1ms per render
  });

  it('should compile complex template quickly', async () => {
    const iterations = 100;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await render(complexTemplate, complexData);
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    expect(avgTime).toBeLessThan(10); // Less than 10ms per render
  });

  bench('simple template render', async () => {
    await render(simpleTemplate, simpleData);
  });

  bench('complex template render', async () => {
    await render(complexTemplate, complexData);
  });

  bench('template with filters', async () => {
    const template = '{{= text | upper | truncate(50) }}';

    await render(template, {
      text: 'This is a long text that should be truncated',
    });
  });

  bench('template with loops', async () => {
    const template = '{{ for item of items }}{{= item }},{{ endfor }}';

    await render(template, {
      items: Array.from({ length: 50 }, (_, i) => `Item ${i}`),
    });
  });

  bench('template with conditionals', async () => {
    const template = '{{ if show }}{{= message }}{{ else }}Hidden{{ endif }}';

    await render(template, { show: true, message: 'Hello' });
  });
});
