import { JanjaLanguage } from './language';
import { spacing } from './rules/spacing';

const plugin = {
  meta: {
    name: 'eslint-plugin-janja',
    version: '0.0.1',
  },
  languages: {
    janja: new JanjaLanguage(),
  },
  rules: {
    spacing,
  },
  configs: {
    recommended: {
      name: 'janja/recommended',
      plugins: {} as Record<string, any>,
      rules: {
        'janja/spacing': 'error',
      },
    },
  },
};

plugin.configs.recommended.plugins.janja = plugin;

export const { configs, languages, rules } = plugin;

// eslint-disable-next-line import/no-default-export
export default plugin;
