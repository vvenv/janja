<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useData } from 'vitepress';
import {
  defaultOptions,
  format,
  run,
  type RunInput,
  type RunResult,
} from '../lib/engine';
import { defaultExample, examples, type Example } from '../lib/examples';
import { messages } from '../lib/messages';
import { decodeState, encodeState } from '../lib/share';
import CodeEditor from './CodeEditor.vue';

const { lang } = useData();
const t = computed(() => messages(lang.value));
const locale = computed(() => (lang.value.startsWith('zh') ? 'zh' : 'en'));

const fromExample = ({ files, data }: Example): RunInput => ({
  files: files.map((file) => ({ ...file })),
  data: JSON.stringify(data, null, 2),
  options: { ...defaultOptions },
});

const state = reactive<RunInput>(fromExample(defaultExample));
const exampleId = ref(defaultExample.id);
const activeFile = ref(0);
const tabs = ['output', 'preview', 'compiled', 'analysis'] as const;
const activeTab = ref<(typeof tabs)[number]>('output');
const result = ref<RunResult>();
const copied = ref(false);
const newFileName = ref<string>();
const optionNames = Object.keys(defaultOptions) as (keyof typeof defaultOptions)[];

const load = (input: RunInput) => {
  Object.assign(state, input);
  activeFile.value = 0;
};

const selectExample = () => {
  const example = examples.find(({ id }) => id === exampleId.value);

  if (example) {
    load(fromExample(example));
  }
};

const addFile = () => {
  const name = newFileName.value?.trim();

  if (name && !state.files.some((file) => file.name === name)) {
    state.files.push({ name, content: '' });
    activeFile.value = state.files.length - 1;
  }

  newFileName.value = undefined;
};

const removeFile = (index: number) => {
  state.files.splice(index, 1);
  activeFile.value = Math.min(activeFile.value, state.files.length - 1);
};

const formatFile = () => {
  const file = state.files[activeFile.value];

  file.content = format(file.content);
};

const share = async () => {
  const url = new URL(location.href);

  url.hash = encodeState(state);
  history.replaceState(null, '', url);

  try {
    await navigator.clipboard.writeText(url.href);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // the link is in the address bar either way
  }
};

let timer: ReturnType<typeof setTimeout> | undefined;
let latest = 0;

const update = async () => {
  const id = ++latest;
  const next = await run(JSON.parse(JSON.stringify(state)));

  // a slower, older run must not replace a newer one
  if (id === latest) {
    result.value = next;
  }
};

const readHash = () => {
  const shared = location.hash.length > 1 && decodeState(location.hash);

  if (shared) {
    exampleId.value = '';
    load(shared);

    return;
  }

  // links from the documentation name an example instead
  const id = new URLSearchParams(location.search).get('example');

  if (id && examples.some((example) => example.id === id)) {
    exampleId.value = id;
    selectExample();
  }
};

onMounted(() => {
  readHash();
  window.addEventListener('hashchange', readHash);
  update();

  watch(state, () => {
    clearTimeout(timer);
    timer = setTimeout(update, 150);
  });
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  window.removeEventListener('hashchange', readHash);
});

const pane = computed(() => {
  const value = result.value;

  if (!value) {
    return '';
  }

  return activeTab.value === 'compiled'
    ? value.compiled
    : activeTab.value === 'analysis'
      ? value.analysis
      : value.output;
});
const hasErrors = computed(() =>
  result.value?.problems.some(({ severity }) => severity === 'error'),
);
</script>

<template>
  <div class="playground">
    <div class="playground-toolbar">
      <label class="playground-field">
        <span>{{ t.examples }}</span>
        <select v-model="exampleId" @change="selectExample">
          <option v-if="!exampleId" value="" disabled>—</option>
          <option v-for="example of examples" :key="example.id" :value="example.id">
            {{ example.title[locale] }}
          </option>
        </select>
      </label>
      <fieldset class="playground-options">
        <legend class="visually-hidden">{{ t.options }}</legend>
        <label v-for="name of optionNames" :key="name">
          <input v-model="state.options[name]" type="checkbox" />
          {{ t[name] }}
        </label>
      </fieldset>
      <div class="playground-actions">
        <button type="button" @click="formatFile">{{ t.format }}</button>
        <button type="button" @click="share">
          {{ copied ? t.copied : t.share }}
        </button>
      </div>
    </div>

    <div class="playground-grid">
      <section class="playground-panel playground-template">
        <div class="playground-tabs" role="tablist" :aria-label="t.template">
          <span
            v-for="(file, index) of state.files"
            :key="file.name"
            class="playground-tab"
            :class="{ active: index === activeFile }"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="index === activeFile"
              @click="activeFile = index"
            >
              {{ file.name }}
            </button>
            <button
              v-if="index > 0"
              type="button"
              class="playground-tab-remove"
              :title="`${t.removeFile} ${file.name}`"
              :aria-label="`${t.removeFile} ${file.name}`"
              @click="removeFile(index)"
            >
              ×
            </button>
          </span>
          <form
            v-if="newFileName !== undefined"
            class="playground-new-file"
            @submit.prevent="addFile"
          >
            <input
              v-model="newFileName"
              v-focus
              :placeholder="t.fileName"
              :aria-label="t.fileName"
              @blur="addFile"
              @keydown.esc="newFileName = undefined"
            />
          </form>
          <button
            v-else
            type="button"
            class="playground-tab-add"
            :title="t.addFile"
            :aria-label="t.addFile"
            @click="newFileName = ''"
          >
            +
          </button>
        </div>
        <CodeEditor
          :key="`${exampleId}:${activeFile}:${state.files[activeFile].name}`"
          v-model="state.files[activeFile].content"
          language="janja"
          :label="t.template"
        />
      </section>

      <section class="playground-panel playground-data">
        <h2 class="playground-heading">{{ t.data }}</h2>
        <CodeEditor
          :key="exampleId"
          v-model="state.data"
          language="json"
          :label="t.data"
        />
      </section>

      <section class="playground-panel playground-result">
        <div class="playground-tabs" role="tablist" :aria-label="t.output">
          <span
            v-for="tab of tabs"
            :key="tab"
            class="playground-tab"
            :class="{ active: tab === activeTab }"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="tab === activeTab"
              @click="activeTab = tab"
            >
              {{ t[tab] }}
            </button>
          </span>
          <span v-if="result && !hasErrors" class="playground-time">
            {{ t.rendered }} {{ result.time.toFixed(1) }} ms
          </span>
        </div>
        <!-- no scripts, no same-origin access: the output is only displayed -->
        <iframe
          v-if="activeTab === 'preview'"
          class="playground-preview"
          sandbox=""
          :title="t.preview"
          :srcdoc="result?.output"
        />
        <CodeEditor
          v-else-if="pane"
          :key="activeTab"
          :model-value="pane"
          :language="
            activeTab === 'compiled'
              ? 'javascript'
              : activeTab === 'analysis'
                ? 'json'
                : 'janja'
          "
          readonly
          :label="t[activeTab]"
        />
        <p v-else-if="result" class="playground-empty">
          {{ activeTab === 'output' ? t.empty : t.unavailable }}
        </p>
      </section>

      <section
        v-if="result?.problems.length"
        class="playground-panel playground-problems"
        aria-live="polite"
      >
        <h2 class="playground-heading">{{ t.problems }}</h2>
        <pre
          v-for="problem of result.problems"
          :key="problem.message"
          :class="`playground-problem ${problem.severity}`"
          >{{ problem.message }}</pre
        >
      </section>
    </div>
  </div>
</template>
