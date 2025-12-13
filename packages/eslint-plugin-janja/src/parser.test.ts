import { describe, expect, it } from 'vitest';
import { Parser } from './parser';

describe('Parser', () => {
  describe('parse', () => {
    it('should parse simple template tokens', () => {
      const parser = new Parser();
      const source = '{{= x }}';
      const [token] = parser.parse(source);

      expect(token.val).toBe(' x ');
    });

    it('should parse tokens without spaces', () => {
      const parser = new Parser();
      const source = '{{=x}}';
      const [token] = parser.parse(source);

      expect(token.val).toBe('x');
    });

    it('should parse tokens with strip markers', () => {
      const parser = new Parser();
      const source = '{{- x -}}';
      const [token] = parser.parse(source);

      expect(token.val).toBe(' x ');
    });

    it('should parse multiple tokens', () => {
      const parser = new Parser();
      const source = '{{= a }} text {{= b }}';
      const [token, token2] = parser.parse(source);

      expect(token.val).toBe(' a ');
      expect(token2.val).toBe(' b ');
    });

    it('should parse tokens with strip markers', () => {
      const parser = new Parser();
      const source = '{{=-name-}}';
      const [token] = parser.parse(source);

      expect(token.val).toBe('name');
      expect(token.strip.before).toBe(true);
      expect(token.strip.after).toBe(true);
    });

    it('should parse tokens without strip markers', () => {
      const parser = new Parser();
      const source = '{{= -name- }}';
      const [token] = parser.parse(source);

      expect(token.val).toBe(' -name- ');
      expect(token.strip.before).toBe(false);
      expect(token.strip.after).toBe(false);
    });

    it('should support custom tags', () => {
      const parser = new Parser({
        outputOpen: '<%=',
        outputClose: '%>',
      } as any);
      const source = '<%= x %>';
      const [token] = parser.parse(source);

      expect(token.val).toBe(' x ');
    });
  });

  describe('format', () => {
    const parser = new Parser();

    it('should format expression without spaces', () => {
      const source = '{{=x}}';
      const [token] = parser.parse(source);

      expect(parser.format(token)).toBe('{{=x}}');
      expect(parser.format({ ...token, val: ' x ' })).toBe('{{= x }}');
    });

    it('should format strip markers correctly', () => {
      const source = '{{-x-}}';
      const [token] = parser.parse(source);

      expect(parser.format(token)).toBe('{{-x-}}');
      expect(parser.format({ ...token, val: ' x ' })).toBe('{{- x -}}');
    });
  });
});
