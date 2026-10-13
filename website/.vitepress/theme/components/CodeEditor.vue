<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type { EditorView } from '@codemirror/view';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    language?: 'janja' | 'json' | 'javascript' | 'text';
    readonly?: boolean;
    label?: string;
  }>(),
  { language: 'text', readonly: false, label: undefined },
);
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const host = ref<HTMLElement>();
const view = shallowRef<EditorView>();

onMounted(async () => {
  // CodeMirror needs the DOM; loading it here keeps it out of the server
  // build and out of pages that never show an editor
  const { createEditor } = await import('../lib/editor');

  if (!host.value) {
    return;
  }

  view.value = createEditor({
    parent: host.value,
    doc: props.modelValue,
    language: props.language,
    readonly: props.readonly,
    label: props.label,
    onChange: (value) => emit('update:modelValue', value),
  });
});

watch(
  () => props.modelValue,
  (value) => {
    const editor = view.value;

    if (editor && value !== editor.state.doc.toString()) {
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: value },
      });
    }
  },
);

onBeforeUnmount(() => view.value?.destroy());
</script>

<template>
  <div ref="host" class="code-editor">
    <!-- shown until the editor has loaded, and when it cannot -->
    <pre v-if="!view" class="code-editor-fallback">{{ modelValue }}</pre>
  </div>
</template>
