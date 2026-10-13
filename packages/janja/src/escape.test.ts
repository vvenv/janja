import { expect, it } from 'vitest';
import { escape } from './escape';

it('escape', () => {
  expect(escape('&"\'<>')).toMatchInlineSnapshot(`"&amp;&#34;&#39;&lt;&gt;"`);
});

it('escapes every occurrence and leaves the rest alone', () => {
  expect(escape('a < b && c > "d"')).toBe(
    'a &lt; b &amp;&amp; c &gt; &#34;d&#34;',
  );
  expect(escape('nothing to do')).toBe('nothing to do');
  expect(escape('')).toBe('');
  expect(escape(1.5)).toBe('1.5');
  expect(escape(['<', '>'])).toBe('&lt;,&gt;');
});
