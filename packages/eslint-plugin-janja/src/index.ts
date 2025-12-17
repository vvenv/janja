import type { Plugin } from '@eslint/core';
import { JanjaLanguage } from './language';
import { spaceAround } from './rules/space-around';
import { spaceBetween } from './rules/space-between';

const plugin: Plugin = {
  meta: {
    name: 'eslint-plugin-janja',
    version: '0.0.1',
  },
  languages: {
    janja: new JanjaLanguage(),
  },
  rules: {
    'space-around': spaceAround,
    'space-between': spaceBetween,
  },
  configs: {
    recommended: {
      name: 'janja/recommended',
      plugins: {},
      rules: {
        'janja/space-around': 'error',
        'janja/space-between': 'error',
      },
    },
  },
};

plugin.configs!.recommended = {
  name: 'janja/recommended',
  plugins: {
    janja: plugin,
  },
  rules: {
    'janja/space-around': 'error',
  },
};

export const { configs, languages, rules } = plugin;

// eslint-disable-next-line import/no-default-export
export default plugin;
