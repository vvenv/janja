import type { MarkdownRenderer as MarkdownIt } from 'vitepress';

/**
 * Pages of the repository that have a counterpart on the site.
 */
const pages: Record<string, string> = {
  'SPEC.md': '/reference/spec',
  'FILTERS.md': '/reference/filters',
  'SECURITY.md': '/reference/security',
  'PERFORMANCE.md': '/reference/performance',
  'documentation.md': '/guide/api',
  'documentation-zh-CN.md': '/zh/guide/api',
  'README.md': '/',
  'README-zh-CN.md': '/zh/',
};

/**
 * The documentation in the repository root is written for GitHub, with links
 * relative to the root. Point them at the page of the site that shows the same
 * file, or at the repository for everything else.
 */
export function repositoryLinks(
  md: MarkdownIt,
  { repository }: { repository: string },
) {
  md.core.ruler.push('repository-links', (state) => {
    const locale = /^zh\//.test(state.env.relativePath ?? '') ? '/zh' : '';

    for (const token of state.tokens) {
      for (const child of token.children ?? []) {
        const href = child.type === 'link_open' && child.attrGet('href');

        if (!href || !/^\.\/(?!\.)/.test(href)) {
          continue;
        }

        const [path, hash = ''] = href.slice(2).split(/(?=#)/);

        if (!(path in pages) && !/^(spec|packages|examples)\//.test(path)) {
          continue;
        }

        const page = pages[path];

        child.attrSet(
          'href',
          page
            ? `${page.startsWith('/zh') || page === '/' ? '' : locale}${page}${hash}`
            : `${repository}/tree/main/${path}${hash}`,
        );
      }
    }
  });
}

/**
 * The sections pulled in from the repository's documentation sit one level
 * deeper there than they do on a page of their own.
 */
export function promoteHeadings(md: MarkdownIt) {
  md.core.ruler.after('block', 'promote-headings', (state) => {
    if (!state.env.frontmatter?.promoteHeadings) {
      return;
    }

    for (const token of state.tokens) {
      const level = /^h([3-6])$/.exec(token.tag)?.[1];

      if (level && token.type.startsWith('heading_')) {
        token.tag = `h${+level - 1}`;
        token.markup = token.markup.slice(1);
      }
    }
  });
}

/**
 * Inline code is full of `{{ tags }}`, which Vue would otherwise take for its
 * own interpolations.
 */
export function literalInlineCode(md: MarkdownIt) {
  const inline = md.renderer.rules.code_inline!;

  md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet('v-pre', '');

    return inline(tokens, idx, options, env, self);
  };
}

const encode = (value: string) => encodeURIComponent(value);

/**
 * A `janja` code block marked `live` becomes an editable example that renders
 * in the page. Data for the template follows a line with three dashes:
 *
 *     ```janja live
 *     Hello {{= name }}!
 *     ---
 *     { "name": "World" }
 *     ```
 */
export function liveExamples(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!;

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const [lang, ...flags] = token.info.trim().split(/\s+/);

    if (lang !== 'janja' || !flags.includes('live')) {
      return fence(tokens, idx, options, env, self);
    }

    const [template, data = '{}'] = token.content
      .replace(/\n$/, '')
      .split(/\n---\n/);

    // highlighted statically as well, for search engines and before hydration
    token.info = 'janja';
    token.content = `${template}\n`;

    return `<LiveExample template="${encode(template)}" data="${encode(data.trim())}">${fence(tokens, idx, options, env, self)}</LiveExample>`;
  };
}
