declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<object, object, unknown>;

  export default component;
}

declare const __JANJA_VERSION__: string;

declare const __JANJA_PUBLISHED__: string;
