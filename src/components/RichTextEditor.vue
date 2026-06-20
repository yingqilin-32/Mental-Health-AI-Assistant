<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 500px; overflow-y: hidden;"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
      @onDestroyed="handleDestroyed"
    />
    <div class="char-count" :class="{ 'over-limit': isOverLimit }">
      <span>{{ charCount }} / {{ maxLength }}</span>
      <span v-if="isOverLimit" class="over-limit-tip"> — Character limit exceeded</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, shallowRef, onBeforeUnmount, watch, nextTick } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { DomEditor } from '@wangeditor/editor'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Please enter content...'
  },
  maxLength: {
    type: Number,
    default: 500
  }
})

// 'change' carries { html, text } so the parent can react without re-parsing HTML
const emit = defineEmits(['update:modelValue', 'change', 'exceed', 'created'])

const editorRef = shallowRef()
const mode = 'default'
const charCount = ref(0)

const isOverLimit = computed(() => charCount.value > props.maxLength)

// Local ref drives v-model on <Editor>.
// Never mutate this directly from outside — use editor.setHtml() instead
// to avoid the TextLengthCalc / position manager error.
const valueHtml = ref(props.modelValue)

const toolbarConfig = {}
const editorConfig = { placeholder: props.placeholder }

const handleCreated = (editor) => {
  editorRef.value = editor

  // Grammarly injects into contenteditable and corrupts wangeditor's
  // text-length tracking → "TextLengthCalc check failed"
  const el = editor.getEditableContainer()
  el.setAttribute('data-gramm', 'false')
  el.setAttribute('data-gramm_editor', 'false')
  el.setAttribute('data-enable-grammarly', 'false')

  // Initialize count from any pre-filled content
  charCount.value = editor.getText().replace(/\n$/, '').length

  nextTick(() => {
    const toolbar = DomEditor.getToolbar(editor)
    if (toolbar) {
      console.log('toolbar keys:', toolbar.getConfig().toolbarKeys)
    } else {
      console.warn('[RichTextEditor] Toolbar not attached yet')
    }
  })

  emit('created', editor)
}

const handleChange = (editor) => {
  const text = editor.getText().replace(/\n$/, '')
  charCount.value = text.length

  if (isOverLimit.value) {
    ElMessage.warning(`Max ${props.maxLength} characters allowed`)
    emit('exceed', charCount.value)
  }

  const html = editor.getHtml()
  emit('update:modelValue', html)
  // Parent's @change handler receives { html, text }
  emit('change', { html, text })
}

const handleDestroyed = () => {
  editorRef.value = null
}

// Sync inward: when the parent pushes a new modelValue, set it safely
watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && newVal !== editorRef.value.getHtml()) {
    editorRef.value.setHtml(newVal)
  }
})

onBeforeUnmount(() => {
  editorRef.value?.destroy()
})
</script>

<style scoped>
.char-count {
  display: flex;
  justify-content: flex-end;
  padding: 4px 10px;
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  user-select: none;
}

.char-count.over-limit {
  color: #f56c6c;
}

.over-limit-tip {
  font-weight: 500;
}
</style>