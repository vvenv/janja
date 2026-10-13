<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';

// set when the site is built: the version these pages describe, and the one
// the registry had at that moment
const version = __JANJA_VERSION__;
const published = __JANJA_PUBLISHED__;

const { lang } = useData();
const zh = computed(() => lang.value.startsWith('zh'));
</script>

<template>
  <div v-if="published !== version" class="warning custom-block">
    <template v-if="zh">
      <p class="custom-block-title">文档领先于 npm</p>
      <p>
        本站描述的是 {{ version }} 版，它尚未发布到 npm；目前
        <code>npm install janja</code> 安装的是 {{ published }}
        版，缺少这里介绍的部分功能。在新版发布之前，可以
        <a href="https://github.com/vvenv/janja/blob/main/CONTRIBUTING.md">从源码构建</a>。
      </p>
    </template>
    <template v-else>
      <p class="custom-block-title">These pages are ahead of npm</p>
      <p>
        This site describes version {{ version }}, which has not been
        published to npm yet. <code>npm install janja</code> currently installs
        {{ published }}, which lacks some of what is documented here. Until the
        release, you can
        <a href="https://github.com/vvenv/janja/blob/main/CONTRIBUTING.md">build it from source</a>.
      </p>
    </template>
  </div>
</template>
