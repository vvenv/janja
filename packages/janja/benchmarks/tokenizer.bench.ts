import { bench, describe } from 'vitest';
import { parserOptions } from '../src/options';
import { Tokenizer } from '../src/tokenizer';

describe('Tokenizer benchmarks', () => {
  const tokenizer = new Tokenizer(parserOptions);

  bench('tokenize simple text', () => {
    tokenizer.tokenize('Hello World');
  });

  bench('tokenize with output directive', () => {
    tokenizer.tokenize('{{= name }}');
  });

  bench('tokenize with directive', () => {
    tokenizer.tokenize('{{ if user }}');
  });

  bench('tokenize with comment', () => {
    tokenizer.tokenize('{{# This is a comment #}}');
  });

  bench('tokenize mixed template', () => {
    tokenizer.tokenize('<div>{{= title }}</div><p>{{= content }}</p>');
  });

  bench('tokenize complex template', () => {
    tokenizer.tokenize(`
      <html>
        <head>
          <title>{{= title }}</title>
        </head>
        <body>
          {{# Header #}}
          <header>
            <h1>{{= heading }}</h1>
          </header>
          {{# End Header #}}
          <main>
            {{ if user }}
              <p>Welcome, {{= user.name }}</p>
            {{ endif }}
          </main>
        </body>
      </html>
    `);
  });

  bench('tokenize long text', () => {
    tokenizer.tokenize('A'.repeat(10000));
  });

  bench('tokenize with many directives', () => {
    const template = Array(100)
      .fill(0)
      .map((_, i) => `{{= var${i} }}`)
      .join(' ');

    tokenizer.tokenize(template);
  });

  bench('tokenize nested directives', () => {
    tokenizer.tokenize(
      '{{ if outer }}{{ if inner }}{{= value }}{{ endif }}{{ endif }}',
    );
  });

  bench('tokenize with special characters', () => {
    tokenizer.tokenize('{{= "<>&\'" }}');
  });

  bench('tokenize empty string', () => {
    tokenizer.tokenize('');
  });

  bench('tokenize only whitespace', () => {
    tokenizer.tokenize('   \n\t   ');
  });
});
