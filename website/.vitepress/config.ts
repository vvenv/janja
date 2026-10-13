import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { type DefaultTheme, defineConfig } from 'vitepress';
import {
  literalInlineCode,
  liveExamples,
  promoteHeadings,
  repositoryLinks,
} from './markdown';

const root = (path: string) =>
  fileURLToPath(new URL(`../../${path}`, import.meta.url));
const grammar = (name: string) =>
  JSON.parse(
    readFileSync(root(`packages/vscode-janja/syntaxes/${name}`), 'utf-8'),
  );
const { version } = JSON.parse(
  readFileSync(root('packages/janja/package.json'), 'utf-8'),
);

// The pages describe the repository, which may be ahead of the registry
const published: string | null = await fetch(
  'https://registry.npmjs.org/janja/latest',
  { signal: AbortSignal.timeout(10_000) },
)
  .then((response) => response.json())
  .then((manifest) => manifest.version ?? null)
  .catch(() => null);
const released = !published || published === version;

const hostname = 'https://janja.wenfu.dev';
const repository = 'https://github.com/vvenv/janja';

const en = {
  nav: [
    { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
    {
      text: 'Reference',
      link: '/reference/spec',
      activeMatch: '/reference/',
    },
    { text: 'Playground', link: '/playground' },
    {
      text: released ? `v${version}` : `v${version} (unreleased)`,
      items: [
        {
          text: 'Changelog',
          link: `${repository}/blob/main/packages/janja/CHANGELOG.md`,
        },
        { text: 'npm', link: 'https://www.npmjs.com/package/janja' },
      ],
    },
  ] satisfies DefaultTheme.NavItem[],
  sidebar: [
    {
      text: 'Guide',
      items: [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Template Tour', link: '/guide/templates' },
        { text: 'Error Handling', link: '/guide/errors' },
        { text: 'API', link: '/guide/api' },
        { text: 'Command Line', link: '/guide/cli' },
        { text: 'Customization', link: '/guide/customization' },
        { text: 'Best Practices', link: '/guide/best-practices' },
        { text: 'Troubleshooting', link: '/guide/troubleshooting' },
        { text: 'Ecosystem', link: '/guide/ecosystem' },
      ],
    },
    {
      text: 'Reference',
      items: [
        { text: 'Language Specification', link: '/reference/spec' },
        { text: 'Filters', link: '/reference/filters' },
        { text: 'Security', link: '/reference/security' },
        { text: 'Performance', link: '/reference/performance' },
      ],
    },
    { text: 'Playground', link: '/playground' },
  ] satisfies DefaultTheme.SidebarItem[],
};

const zh = {
  nav: [
    { text: '指南', link: '/zh/guide/getting-started', activeMatch: '/guide/' },
    {
      text: '参考',
      link: '/zh/reference/spec',
      activeMatch: '/reference/',
    },
    { text: '演练场', link: '/zh/playground' },
    {
      text: released ? `v${version}` : `v${version}（未发布）`,
      items: [
        {
          text: '更新日志',
          link: `${repository}/blob/main/packages/janja/CHANGELOG.md`,
        },
        { text: 'npm', link: 'https://www.npmjs.com/package/janja' },
      ],
    },
  ] satisfies DefaultTheme.NavItem[],
  sidebar: [
    {
      text: '指南',
      items: [
        { text: '快速开始', link: '/zh/guide/getting-started' },
        { text: '模板速览', link: '/zh/guide/templates' },
        { text: '错误处理', link: '/zh/guide/errors' },
        { text: 'API', link: '/zh/guide/api' },
        { text: '命令行', link: '/zh/guide/cli' },
        { text: '自定义', link: '/zh/guide/customization' },
        { text: '生态', link: '/zh/guide/ecosystem' },
      ],
    },
    {
      text: '参考',
      items: [
        { text: '语言规范', link: '/zh/reference/spec' },
        { text: '过滤器', link: '/zh/reference/filters' },
        { text: '安全', link: '/zh/reference/security' },
        { text: '性能', link: '/zh/reference/performance' },
      ],
    },
    { text: '演练场', link: '/zh/playground' },
  ] satisfies DefaultTheme.SidebarItem[],
};

export default defineConfig({
  title: 'Janja',
  description:
    'A simple, fast, lightweight, and extensible template engine for Node.js and browsers.',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Janja' }],
    ['meta', { property: 'og:url', content: hostname }],
  ],
  markdown: {
    // the grammars of the VS Code extension
    languages: [
      'html',
      {
        ...grammar('janja.tmLanguage.json'),
        name: 'janja',
        embeddedLangs: ['html'],
      },
      {
        ...grammar('janja.injection.tmLanguage.json'),
        name: 'janja-injection',
        injectTo: ['text.html.janja'],
      },
    ],
    config(md) {
      md.use(repositoryLinks, { repository });
      md.use(promoteHeadings);
      md.use(literalInlineCode);
      md.use(liveExamples);
    },
  },
  vite: {
    // the documentation in the repository root is pulled into the pages
    server: { fs: { allow: [root('')] } },
    define: {
      __JANJA_VERSION__: JSON.stringify(version),
      __JANJA_PUBLISHED__: JSON.stringify(released ? version : published),
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [{ icon: 'github', link: repository }],
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
              modal: {
                noResultsText: '没有找到结果',
                resetButtonTitle: '清除',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        ...en,
        editLink: {
          pattern: `${repository}/edit/main/website/:path`,
          text: 'Edit this page on GitHub',
        },
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © vvenv',
        },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      title: '蒹葭',
      description: '一个简单、快速、轻量且可扩展的 Node.js 和浏览器模板引擎。',
      themeConfig: {
        ...zh,
        editLink: {
          pattern: `${repository}/edit/main/website/:path`,
          text: '在 GitHub 上编辑此页',
        },
        footer: {
          message: '基于 MIT 许可发布。',
          copyright: 'Copyright © vvenv',
        },
        docFooter: { prev: '上一页', next: '下一页' },
        outline: { label: '本页目录' },
        lastUpdated: { text: '最后更新于' },
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        langMenuLabel: '语言',
      },
    },
  },
});
