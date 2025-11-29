import type { Plugin } from '../../types';
import { compilers } from './compilers';
import { parsers } from './parsers';

export const plugin: Plugin = {
  compilers,
  parsers,
};
