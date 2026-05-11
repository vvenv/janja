import { bench, describe } from 'vitest';
import { render } from '../src';

describe('Template Engine Comparison Benchmarks', () => {
  const template = `
    <div class="user">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      <ul>
        {{ for post of user.posts }}
          <li>{{= post.title }}</li>
        {{ endfor }}
      </ul>
    </div>
  `;

  const data = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      posts: Array.from({ length: 10 }, (_, i) => ({
        title: `Post Title ${i}`,
      })),
    },
  };

  bench('Janja - complex template', async () => {
    await render(template, data);
  });

  // Note: To add comparison with other engines, install them as dev dependencies:
  // pnpm add -D handlebars ejs nunjucks
  //
  // Then uncomment and add benchmarks like:
  //
  // bench('Handlebars - complex template', async () => {
  //   const Handlebars = require('handlebars');
  //   const compiled = Handlebars.compile(template.replace('{{=', '{{').replace('}}', '}}'));
  //   compiled(data);
  // });
  //
  // bench('EJS - complex template', async () => {
  //   const ejs = require('ejs');
  //   await ejs.render(template.replace('{{=', '<%=').replace('}}', '%>'), data);
  // });
});
