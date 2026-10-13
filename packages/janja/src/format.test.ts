import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatTemplate } from './format';
import { Renderer } from './renderer';

it('normalises spacing inside tags', () => {
  expect(formatTemplate('{{=name|upper}}')).toBe('{{= name | upper }}');
  expect(formatTemplate('{{=   a+b*2   }}')).toBe('{{= a + b * 2 }}');
  expect(formatTemplate('{{if a  eq 1 and not(b)}}x{{endif}}')).toBe(
    '{{ if a eq 1 and not (b) }}x{{ endif }}',
  );
  expect(formatTemplate('{{for (k,v="d")  of items|sort}}{{endfor}}')).toBe(
    '{{ for (k, v = "d") of items | sort }}{{ endfor }}',
  );
  expect(formatTemplate("{{ include   'part' }}{{set x=fn(1,'a')}}")).toBe(
    '{{ include "part" }}{{ set x = fn(1, "a") }}',
  );
  expect(formatTemplate('{{macro m(a,b=1)}}{{caller}}{{endmacro}}')).toBe(
    '{{ macro m(a, b = 1) }}{{ caller }}{{ endmacro }}',
  );
  expect(formatTemplate('{{= "y"   if t   else "n"}}')).toBe(
    '{{= "y" if t else "n" }}',
  );
  expect(formatTemplate('{{#note#}}{{#   spaced   #}}')).toBe(
    '{{# note #}}{{# spaced #}}',
  );
});

it('keeps text, whitespace control and grouping', () => {
  expect(formatTemplate('a \n\t {{=-x-}} \r\n b')).toBe(
    'a \n\t {{=- x -}} \r\n b',
  );
  expect(formatTemplate('{{-if x-}}y{{-  endif  -}}')).toBe(
    '{{- if x -}}y{{- endif -}}',
  );
  expect(formatTemplate('{{=(a+b)*2}}{{= a - -1 }}')).toBe(
    '{{= (a + b) * 2 }}{{= a - -1 }}',
  );
  expect(formatTemplate('{{#\n  several\n  lines\n#}}')).toBe(
    '{{#\n  several\n  lines\n#}}',
  );
});

it('keeps string contents, escaping what must stay escaped', () => {
  expect(formatTemplate(String.raw`{{= 'it\'s "x"' }}`)).toBe(
    String.raw`{{= "it's \"x\"" }}`,
  );
  expect(formatTemplate(String.raw`{{= "a\nb" | replace("\d+", "") }}`)).toBe(
    String.raw`{{= "a\nb" | replace("\\d+", "") }}`,
  );
  expect(formatTemplate(String.raw`{{= "\{\{ x \}\}" }}`)).toBe(
    String.raw`{{= "\{\{ x \}\}" }}`,
  );
  expect(formatTemplate(String.raw`\{\{= a \}\} {{=a}}`)).toBe(
    String.raw`\{\{= a \}\} {{= a }}`,
  );
});

it('leaves tags it cannot parse exactly as written', () => {
  expect(formatTemplate('{{=  (a }}{{=b}}{{ if | }}{{  }}')).toBe(
    '{{=  (a }}{{= b }}{{ if | }}{{  }}',
  );
  expect(() => formatTemplate('{{= a')).toThrow('Unclosed');
});

it('supports custom delimiters', () => {
  expect(
    formatTemplate('<%=a|upper%><%if a%>{{=b}}<%endif%>', {
      outputOpen: '<%=',
      outputClose: '%>',
      directiveOpen: '<%',
      directiveClose: '%>',
    }),
  ).toBe('<%= a | upper %><% if a %>{{=b}}<% endif %>');
});

// Every template of the language's conformance suite must mean the same
// after formatting, and formatting must be stable
describe('conformance suite', () => {
  const suite = JSON.parse(
    readFileSync(
      new URL('../../../spec/conformance.json', import.meta.url),
      'utf-8',
    ),
  );

  // eslint-disable-next-line no-new-func
  const evaluate = (source: string) => new Function(`return (${source})`)();
  const evaluateAll = (sources: Record<string, string> = {}) =>
    Object.fromEntries(
      Object.entries(sources).map(([name, source]) => [name, evaluate(source)]),
    );

  for (const { section, cases } of suite.sections) {
    for (const testCase of cases) {
      it(`${section}: ${JSON.stringify(testCase.template)}`, async () => {
        const format = (template: string) => {
          try {
            return formatTemplate(template, testCase.options);
          } catch {
            return template;
          }
        };

        const formatted = format(testCase.template);

        expect(format(formatted)).toBe(formatted);

        const render = async (template: string) => {
          const renderer = new Renderer({
            ...testCase.options,
            filters: evaluateAll(testCase.filters),
            loader: async (path) => {
              if (!testCase.files || !(path in testCase.files)) {
                throw new Error('not found');
              }

              return testCase.files[path];
            },
          });

          try {
            return await renderer.render(template, {
              ...structuredClone(testCase.data ?? suite.data),
              ...evaluateAll(testCase.functions),
            });
          } catch (error: any) {
            return `ERROR ${error.message}`;
          }
        };

        expect(await render(formatted)).toBe(await render(testCase.template));
      });
    }
  }
});
