import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyMixin,
  applyMixins,
  createMixin,
  extendTemplateWithMixin,
  globalMixinRegistry,
  MixinRegistry,
} from './mixins';

describe('Mixin System', () => {
  beforeEach(() => {
    globalMixinRegistry.clear();
  });

  it('should register a mixin', () => {
    const mixin = createMixin('header', '<header>{{= title }}</header>');

    globalMixinRegistry.register(mixin);

    expect(globalMixinRegistry.has('header')).toBe(true);
  });

  it('should retrieve a mixin', () => {
    const mixin = createMixin('header', '<header>{{= title }}</header>');

    globalMixinRegistry.register(mixin);

    const retrieved = globalMixinRegistry.get('header');

    expect(retrieved).toEqual(mixin);
  });

  it('should register multiple mixins', () => {
    const mixins = [
      createMixin('header', '<header>Header</header>'),
      createMixin('footer', '<footer>Footer</footer>'),
    ];

    globalMixinRegistry.registerMultiple(mixins);

    expect(globalMixinRegistry.has('header')).toBe(true);
    expect(globalMixinRegistry.has('footer')).toBe(true);
  });

  it('should delete a mixin', () => {
    const mixin = createMixin('header', '<header>Header</header>');

    globalMixinRegistry.register(mixin);

    expect(globalMixinRegistry.delete('header')).toBe(true);
    expect(globalMixinRegistry.has('header')).toBe(false);
  });

  it('should list all mixins', () => {
    const mixins = [
      createMixin('header', '<header>Header</header>'),
      createMixin('footer', '<footer>Footer</footer>'),
    ];

    globalMixinRegistry.registerMultiple(mixins);

    const names = globalMixinRegistry.list();

    expect(names).toEqual(expect.arrayContaining(['header', 'footer']));
  });

  it('should apply a mixin', async () => {
    const mixin = createMixin('header', '<header>{{= title }}</header>');

    globalMixinRegistry.register(mixin);

    const result = await applyMixin('header', { data: { title: 'Test' } });

    expect(result).toBe('<header>Test</header>');
  });

  it('should apply multiple mixins', async () => {
    const mixins = [
      createMixin('header', '<header>Header</header>'),
      createMixin('footer', '<footer>Footer</footer>'),
    ];

    globalMixinRegistry.registerMultiple(mixins);

    const results = await applyMixins(['header', 'footer']);

    expect(results).toEqual([
      '<header>Header</header>',
      '<footer>Footer</footer>',
    ]);
  });

  it('should extend template with mixin', async () => {
    const mixin = createMixin('header', '<header>{{= title }}</header>');

    globalMixinRegistry.register(mixin);

    const baseTemplate = '<div>{{= _mixin }}</div>';

    const result = await extendTemplateWithMixin(baseTemplate, 'header', {
      data: { title: 'Test' },
    });

    expect(result).toContain('<div>');
    expect(result).toContain('<header>Test</header>');
  });

  it('should throw error for non-existent mixin', async () => {
    await expect(applyMixin('nonexistent')).rejects.toThrow();
  });

  it('should merge mixin data with provided data', async () => {
    const mixin = createMixin('test', '{{= value }}', { value: 'default' });

    globalMixinRegistry.register(mixin);

    const result = await applyMixin('test', { data: { value: 'override' } });

    expect(result).toBe('override');
  });

  it('should use custom registry', async () => {
    const registry = new MixinRegistry();
    const mixin = createMixin('header', '<header>Header</header>');

    registry.register(mixin);

    const result = await applyMixin('header', {}, registry);

    expect(result).toBe('<header>Header</header>');
  });
});
