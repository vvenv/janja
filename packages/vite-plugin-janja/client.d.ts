// Add `/// <reference types="vite-plugin-janja/client" />` to a declaration
// file of your project to type imports of templates.
declare module '*.janja' {
  import type { RendererOptions, Script } from 'janja';

  export const script: Script;

  const render: (
    data?: Record<string, unknown>,
    options?: RendererOptions,
  ) => Promise<string>;

  export default render;
}
