import { describe, expect, it } from 'vitest';
import { render } from '../../index';

describe('with directive', () => {
  it('should create a context scope with the with directive', async () => {
    const template = `
      {{ with user }}
        {{= name }}
      {{ endwith }}
    `;
    const result = await render(template, {
      user: { name: 'John' },
    });

    expect(result).toContain('John');
  });

  it('should not leak context outside with block', async () => {
    const template = `
      {{ with user }}
        {{= name }}
      {{ endwith }}
      {{= name }}
    `;
    const result = await render(template, {
      user: { name: 'John' },
      name: 'External',
    });

    expect(result).toContain('John');
    expect(result).toContain('External');
  });

  it('should handle nested with blocks', async () => {
    const template = `
      {{ with user }}
        {{ with profile }}
          {{= bio }}
        {{ endwith }}
      {{ endwith }}
    `;
    const result = await render(template, {
      user: {
        profile: {
          bio: 'Developer',
        },
      },
    });

    expect(result).toContain('Developer');
  });

  it('should work with multiple properties', async () => {
    const template = `
      {{ with user }}
        {{= name }}
        {{= email }}
      {{ endwith }}
    `;
    const result = await render(template, {
      user: {
        name: 'John',
        email: 'john@example.com',
      },
    });

    expect(result).toContain('John');
    expect(result).toContain('john@example.com');
  });

  it('should handle empty object', async () => {
    const template = `
      {{ with empty }}
        {{= name }}
      {{ endwith }}
    `;
    const result = await render(template, {
      empty: {},
      name: 'External',
    });

    expect(result).not.toContain('External');
  });
});
