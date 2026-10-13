import ejs from 'ejs';
import { Eta } from 'eta';
import Handlebars from 'handlebars';
import nunjucks from 'nunjucks';
import { bench, describe } from 'vitest';
import { Renderer } from '../src';

// The same page in every engine's syntax: HTML-escaped output, a loop, a
// conditional and a filter. Every engine compiles the template once and is
// then measured on rendering only.
const data = {
  user: {
    name: 'John <Doe>',
    email: 'john@example.com',
    admin: true,
    posts: Array.from({ length: 50 }, (_, i) => ({
      title: `Post "Title" ${i}`,
      tags: ['a', 'b', 'c'],
    })),
  },
};

const templates = {
  janja:
    '<div class="user"><h2>{{= user.name | upper }}</h2><p>{{= user.email }}</p>{{ if user.admin }}<b>admin</b>{{ endif }}<ul>{{ for post of user.posts }}<li>{{= post.title }}{{ for tag of post.tags }}<i>{{= tag }}</i>{{ endfor }}</li>{{ endfor }}</ul></div>',
  handlebars:
    '<div class="user"><h2>{{upper user.name}}</h2><p>{{user.email}}</p>{{#if user.admin}}<b>admin</b>{{/if}}<ul>{{#each user.posts}}<li>{{title}}{{#each tags}}<i>{{this}}</i>{{/each}}</li>{{/each}}</ul></div>',
  ejs: '<div class="user"><h2><%= user.name.toUpperCase() %></h2><p><%= user.email %></p><% if (user.admin) { %><b>admin</b><% } %><ul><% for (const post of user.posts) { %><li><%= post.title %><% for (const tag of post.tags) { %><i><%= tag %></i><% } %></li><% } %></ul></div>',
  nunjucks:
    '<div class="user"><h2>{{ user.name | upper }}</h2><p>{{ user.email }}</p>{% if user.admin %}<b>admin</b>{% endif %}<ul>{% for post in user.posts %}<li>{{ post.title }}{% for tag in post.tags %}<i>{{ tag }}</i>{% endfor %}</li>{% endfor %}</ul></div>',
  eta: '<div class="user"><h2><%= it.user.name.toUpperCase() %></h2><p><%= it.user.email %></p><% if (it.user.admin) { %><b>admin</b><% } %><ul><% for (const post of it.user.posts) { %><li><%= post.title %><% for (const tag of post.tags) { %><i><%= tag %></i><% } %></li><% } %></ul></div>',
};

const janja = new Renderer();

const handlebars = Handlebars.create();

handlebars.registerHelper('upper', (value: string) => value.toUpperCase());

const handlebarsTemplate = handlebars.compile(templates.handlebars);

const ejsTemplate = ejs.compile(templates.ejs);

const nunjucksTemplate = nunjucks.compile(
  templates.nunjucks,
  new nunjucks.Environment(null, { autoescape: true }),
);

const eta = new Eta();
const etaTemplate = eta.compile(templates.eta);

const engines: Record<string, () => string | Promise<string>> = {
  janja: () => janja.render(templates.janja, data),
  handlebars: () => handlebarsTemplate(data),
  ejs: () => ejsTemplate(data),
  nunjucks: () => nunjucksTemplate.render(data),
  eta: () => eta.render(etaTemplate, data),
};

// Engines spell some escapes differently (&quot; vs &#34;); compare what a
// browser would see
const normalize = (html: string) =>
  html.replace(/&#34;|&#x22;|&quot;/g, '"').replace(/&#39;|&#x27;/g, "'");

const expected = normalize(await engines.janja());

for (const [name, run] of Object.entries(engines)) {
  if (normalize(await run()) !== expected) {
    throw new Error(`${name} renders different output than janja`);
  }
}

describe('render a page with a compiled template', () => {
  for (const [name, run] of Object.entries(engines)) {
    bench(name, async () => {
      await run();
    });
  }
});
