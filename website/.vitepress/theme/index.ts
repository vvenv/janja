import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import LiveExample from './components/LiveExample.vue';
import Playground from './components/Playground.vue';
import ReleaseNotice from './components/ReleaseNotice.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LiveExample', LiveExample);
    app.component('Playground', Playground);
    app.component('ReleaseNotice', ReleaseNotice);
    app.directive('focus', { mounted: (el: HTMLElement) => el.focus() });
  },
} satisfies Theme;
