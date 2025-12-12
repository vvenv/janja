import { expect, it } from 'vitest';
import { escape } from './escape';

it('escape', () => {
  expect(escape('&"\'<>')).toMatchInlineSnapshot(`"&amp;&#34;&#39;&lt;&gt;"`);
});
