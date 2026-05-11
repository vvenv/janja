import { describe, expect, it } from 'vitest';
import {
  composeLayout,
  composeTemplates,
  composeTemplatesWithData,
  composeWithSlots,
  TemplatePipeline,
} from './compose';

describe('Template Composition', () => {
  it('should compose multiple templates sequentially', async () => {
    const templates = [
      'Step 1',
      'Step 2: {{= _content }}',
      'Step 3: {{= _content }}',
    ];

    const result = await composeTemplates(templates);

    expect(result).toBe('Step 3: Step 2: Step 1');
  });

  it('should compose templates with data', async () => {
    const templates = [
      '{{= name }}',
      'Hello {{= _content }}',
      'Greeting: {{= _content }}',
    ];

    const result = await composeTemplates(templates, {
      data: { name: 'World' },
    });

    expect(result).toContain('Greeting: Hello World');
  });

  it('should compose templates with individual data', async () => {
    const templates = [
      { template: '{{= greeting }}', data: { greeting: 'Hello' } },
      { template: '{{= _content }} {{= name }}', data: { name: 'World' } },
    ];

    const result = await composeTemplatesWithData(templates);

    expect(result).toBe('Hello World');
  });

  it('should create and execute a template pipeline', async () => {
    const pipeline = new TemplatePipeline();

    const result = await pipeline
      .addTemplate('Base')
      .addTemplate('{{= _content }} Layer 1')
      .addTemplate('{{= _content }} Layer 2')
      .execute();

    expect(result).toBe('Base Layer 1 Layer 2');
  });

  it('should set data in pipeline', async () => {
    const pipeline = new TemplatePipeline();

    const result = await pipeline
      .addTemplate('{{= value }}')
      .setData({ value: 'Test' })
      .execute();

    expect(result).toBe('Test');
  });

  it('should compose layout with content', async () => {
    const layout = `
      <html>
        <head><title>{{= title }}</title></head>
        <body>{{= content }}</body>
      </html>
    `;
    const content = '<h1>{{= heading }}</h1>';

    const result = await composeLayout(layout, content, {
      data: { title: 'Test', heading: 'Hello' },
    });

    expect(result).toContain('<html>');
    expect(result).toContain('<h1>Hello</h1>');
    expect(result).toContain('Test');
  });

  it('should compose with slots', async () => {
    const template = `
      <div>
        <header>{{= slots.header }}</header>
        <main>{{= slots.main }}</main>
        <footer>{{= slots.footer }}</footer>
      </div>
    `;
    const slots = {
      header: '<h1>Header</h1>',
      main: '<p>Content</p>',
      footer: '<p>Footer</p>',
    };

    const result = await composeWithSlots(template, slots);

    expect(result).toContain('<h1>Header</h1>');
    expect(result).toContain('<p>Content</p>');
    expect(result).toContain('<p>Footer</p>');
  });

  it('should handle empty template list', async () => {
    const result = await composeTemplates([]);

    expect(result).toBe('');
  });

  it('should handle single template', async () => {
    const templates = ['Single'];
    const result = await composeTemplates(templates);

    expect(result).toBe('Single');
  });
});
