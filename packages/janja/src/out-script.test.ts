import { expect, it } from 'vitest';
import { OutScript } from './out-script';

function _out() {
  return new OutScript();
}

it('escape \\', () => {
  const out = _out();

  out.pushStr(null, '\\');
  expect(out.code).toMatchInlineSnapshot(`"s+="\\\\";"`);
});

it('escape \\n', () => {
  const out = _out();

  out.pushStr(null, '\n');
  expect(out.code).toMatchInlineSnapshot(`"s+="\\n";"`);
});

it('escape "', () => {
  const out = _out();

  out.pushStr(null, '"');
  expect(out.code).toMatchInlineSnapshot(`"s+="\\"";"`);
});

it('escape dynamic values with external function', () => {
  const out = _out();

  out.pushVar(null, 'x');
  expect(out.code).toMatchInlineSnapshot(`"s+=e(x);"`);
});
