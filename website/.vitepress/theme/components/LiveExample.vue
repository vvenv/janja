<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData, withBase } from 'vitepress';
import { defaultOptions, run, type Problem } from '../lib/engine';
import { messages } from '../lib/messages';
import { encodeState } from '../lib/share';
import CodeEditor from './CodeEditor.vue';

const props = defineProps<{
  /** URI-encoded, so that it survives being an HTML attribute */
  template: string;
  data: string;
}>();

const { lang } = useData();
const t = computed(() => messages(lang.value));

const template = ref(decodeURIComponent(props.template));
const data = ref(decodeURIComponent(props.data));
const hasData = computed(() => data.value.trim() !== '{}');
const editing = ref(false);
const output = ref<string>();
const problems = ref<Problem[]>([]);

const input = computed(() => ({
  files: [{ name: 'main', content: template.value }],
  data: data.value,
  options: defaultOptions,
}));
const playground = computed(
  () =>
    `${withBase(lang.value.startsWith('zh') ? '/zh/playground' : '/playground')}#${encodeState(input.value)}`,
);

let timer: ReturnType<typeof setTimeout> | undefined;
let latest = 0;

const update = async () => {
  const id = ++latest;
  const result = await run(input.value);

  if (id === latest) {
    output.value = result.output;
    problems.value = result.problems;
  }
};

onMounted(() => {
  update();

  watch(input, () => {
    clearTimeout(timer);
    timer = setTimeout(update, 150);
  });
});

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div class="live-example">
    <div v-if="editing" class="live-example-editors">
      <CodeEditor v-model="template" language="janja" :label="t.template" />
      <CodeEditor v-model="data" language="json" :label="t.data" />
    </div>
    <template v-else>
      <slot />
      <div v-if="hasData" class="live-example-data">
        <span class="live-example-label">{{ t.data }}</span>
        <code>{{ data }}</code>
      </div>
    </template>
    <div class="live-example-output" aria-live="polite">
      <div class="live-example-bar">
        <span class="live-example-label">{{ t.output }}</span>
        <span class="live-example-actions">
          <button type="button" @click="editing = !editing">
            {{ editing ? t.done : t.edit }}
          </button>
          <a :href="playground">{{ t.open }}</a>
        </span>
      </div>
      <pre v-if="output">{{ output }}</pre>
      <pre
        v-for="problem of problems"
        :key="problem.message"
        :class="`playground-problem ${problem.severity}`"
        >{{ problem.message }}</pre
      >
    </div>
  </div>
</template>
