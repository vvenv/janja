/**
 * Tokenizer Profiling Script
 *
 * This script profiles the tokenizer to identify hot paths and potential optimization opportunities.
 * Run with: node --prof --no-logfile-per-isolate dist/tokenizer.profile.js
 * Then analyze with: node --prof-process isolate-*.log > profile.txt
 */

import { parserOptions } from './options';
import { Tokenizer } from './tokenizer';

const tokenizer = new Tokenizer(parserOptions);

function profileTokenize(template: string, iterations: number) {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    tokenizer.tokenize(template);
  }

  const duration = performance.now() - start;
  const avgTime = duration / iterations;

  console.log(`Template length: ${template.length}`);
  console.log(`Iterations: ${iterations}`);
  console.log(`Total time: ${duration.toFixed(2)}ms`);
  console.log(`Average time: ${avgTime.toFixed(4)}ms`);
  console.log(`Tokens per second: ${(1000 / avgTime).toFixed(2)}`);

  return avgTime;
}

// Profile different template types
console.log('=== Profiling Simple Text ===');
profileTokenize('Hello World', 10000);

console.log('\n=== Profiling Output Directive ===');
profileTokenize('{{= name }}', 10000);

console.log('\n=== Profiling Directive ===');
profileTokenize('{{ if user }}', 10000);

console.log('\n=== Profiling Comment ===');
profileTokenize('{{# This is a comment #}}', 10000);

console.log('\n=== Profiling Mixed Template ===');
profileTokenize('<div>{{= title }}</div><p>{{= content }}</p>', 10000);

console.log('\n=== Profiling Complex Template ===');
profileTokenize(
  `
  <html>
    <head>
      <title>{{= title }}</title>
    </head>
    <body>
      {{ if user }}
        <p>Welcome, {{= user.name }}</p>
      {{ endif }}
    </body>
  </html>
`,
  1000,
);

console.log('\n=== Profiling Long Text ===');
profileTokenize('A'.repeat(10000), 1000);

console.log('\n=== Profiling Many Directives ===');

const manyDirectives = Array(100)
  .fill(0)
  .map((_, i) => `{{= var${i} }}`)
  .join(' ');

profileTokenize(manyDirectives, 1000);

console.log('\n=== Profiling Nested Directives ===');
profileTokenize(
  '{{ if outer }}{{ if inner }}{{= value }}{{ endif }}{{ endif }}',
  10000,
);

console.log('\n=== Profiling with Special Characters ===');
profileTokenize('{{= "<>&\'" }}', 10000);

console.log('\n=== Profiling Empty String ===');
profileTokenize('', 10000);

console.log('\n=== Profiling Only Whitespace ===');
profileTokenize('   \n\t   ', 10000);

console.log('\n=== Profiling Real-world Template ===');

const realWorldTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{= page.title }}</title>
  {{ if page.description }}
    <meta name="description" content="{{= page.description }}">
  {{ endif }}
</head>
<body>
  <header>
    <nav>
      {{ for item in navigation.items }}
        <a href="{{= item.url }}">{{= item.label }}</a>
      {{ endfor }}
    </nav>
  </header>
  
  <main>
    {{ if user }}
      <div class="user-info">
        <p>Welcome, {{= user.name }}!</p>
      </div>
    {{ endif }}
    
    {{ for article in articles }}
      <article>
        <h2>{{= article.title }}</h2>
        <p>{{= article.excerpt }}</p>
        <a href="{{= article.url }}">Read more</a>
      </article>
    {{ endfor }}
  </main>
  
  <footer>
    <p>&copy; {{= year }} {{= site.name }}</p>
  </footer>
</body>
</html>
`;

profileTokenize(realWorldTemplate, 100);

console.log('\n=== Profiling Complete ===');
console.log('\nTo analyze the profile:');
console.log('1. Run with: node --prof dist/tokenizer.profile.js');
console.log('2. Analyze with: node --prof-process isolate-*.log > profile.txt');
console.log('3. View profile.txt to identify hot paths');
