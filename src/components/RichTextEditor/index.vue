<template>
  <div class="rich-text-editor-wrap">
    <QuillEditor
      v-model:content="content"
      contentType="html"
      theme="snow"
      :placeholder="placeholder"
      class="quill-editor"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
  }>(),
  {
    modelValue: '',
    placeholder: '请输入内容...',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const content = ref(props.modelValue || '');

watch(
  () => props.modelValue,
  (val) => {
    const str = val || '';
    if (content.value !== str) {
      content.value = str;
    }
  },
  { immediate: true }
);

watch(
  content,
  (val) => {
    const str = typeof val === 'string' ? val : '';
    emit('update:modelValue', str);
  },
  { deep: true }
);
</script>

<style lang="less" scoped>
.rich-text-editor-wrap {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
  :deep(.quill-editor) {
    min-height: 200px;
    .ql-container {
      min-height: 200px;
    }
    .ql-editor {
      min-height: 200px;
      /* 抵消全局 reset 对 strong/em 的 font:inherit，保证加粗和倾斜在编辑区内生效 */
      strong,
      b {
        font-weight: bold;
      }
      em,
      i {
        font-style: italic;
      }
    }
  }
}
</style>
