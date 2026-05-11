import { bench, describe } from 'vitest';
import { OutScript } from '../src/out-script';

describe('OutScript benchmarks', () => {
  bench('pushRaw single line', () => {
    const outScript = new OutScript();

    outScript.pushRaw(null, 's+="hello";');
  });

  bench('pushRaw multiple lines', () => {
    const outScript = new OutScript();

    outScript.pushRaw(null, 's+="hello";', 's+="world";', 's+="test";');
  });

  bench('pushStr simple string', () => {
    const outScript = new OutScript();

    outScript.pushStr(null, 'Hello World');
  });

  bench('pushStr with quotes', () => {
    const outScript = new OutScript();

    outScript.pushStr(null, 'He said "Hello"');
  });

  bench('pushStr with newlines', () => {
    const outScript = new OutScript();

    outScript.pushStr(null, 'Line 1\nLine 2\nLine 3');
  });

  bench('pushStr with backslashes', () => {
    const outScript = new OutScript();

    outScript.pushStr(null, 'Path\\to\\file');
  });

  bench('pushVar simple variable', () => {
    const outScript = new OutScript();

    outScript.pushVar(null, 'x');
  });

  bench('pushVar complex expression', () => {
    const outScript = new OutScript();

    outScript.pushVar(null, 'user.name');
  });

  bench('multiple pushStr operations', () => {
    const outScript = new OutScript();

    outScript.pushStr(null, 'Part 1');
    outScript.pushStr(null, 'Part 2');
    outScript.pushStr(null, 'Part 3');
    outScript.pushStr(null, 'Part 4');
    outScript.pushStr(null, 'Part 5');
  });

  bench('mixed pushRaw and pushStr', () => {
    const outScript = new OutScript();

    outScript.pushStr(null, '<div>');
    outScript.pushRaw(null, 's+=escape(x);');
    outScript.pushStr(null, '</div>');
  });

  bench('get code property', () => {
    const outScript = new OutScript();

    outScript.pushStr(null, 'Hello');
    outScript.pushRaw(null, 's+=x;');

    void outScript.code;
  });

  bench('full template compilation simulation', () => {
    const outScript = new OutScript();

    outScript.start();
    outScript.pushStr(null, '<div>');
    outScript.pushRaw(null, 's+=escape(title);');
    outScript.pushStr(null, '</div>');
    outScript.pushStr(null, '<p>');
    outScript.pushRaw(null, 's+=escape(content);');
    outScript.pushStr(null, '</p>');
    outScript.end();

    void outScript.code;
  });
});
