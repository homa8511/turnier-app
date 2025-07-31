<template>
  <div class="border border-gray-300 dark:border-gray-600 rounded-lg">
    <div class="toolbar flex items-center gap-2 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
      <button title="Fett" class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" @click="execCmd('bold')">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.933 3.534c-1.22.256-2.24.8-2.974 1.527-.734.727-1.101 1.688-1.101 2.82v.288h2.482v-.288c0-.6.144-1.074.432-1.422.288-.348.72-.522 1.296-.522.576 0 1.008.174 1.296.522.288.348.432.822.432 1.422 0 .576-.126 1.02-.378 1.332-.252.312-.678.468-1.278.468h-1.296v1.44h1.332c.96 0 1.722-.258 2.286-.774.564-.516.846-1.224.846-2.124 0-1.152-.432-2.112-1.296-2.88-.864-.768-2.04-1.152-3.528-1.152zM7.133 8.634H4.65v5.088h2.664c.744 0 1.32-.18 1.728-.54.408-.36.612-.87.612-1.53 0-.66-.204-1.17-.612-1.53-.408-.36-.984-.54-1.728-.54zm.18 1.44c.312 0 .54.078.684.234.144.156.216.39.216.696 0 .306-.072.54-.216.696-.144.156-.372.234-.684.234H5.85v-1.86h1.463z"></path></svg>
      </button>
      <button title="Kursiv" class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" @click="execCmd('italic')">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.25 4.063h-5.5L9.5 15.938h5.5L13.25 4.063zM8.125 4.063L6.375 10l-1.75-5.938h-2.5L4.5 15.938h2.5L8.125 4.063z"></path></svg>
      </button>
      <button title="Liste" class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" @click="execCmd('insertUnorderedList')">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7.5 4.375a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM7.5 10a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM7.5 15.625a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM10 3.125h8.125v1.25H10V3.125zM10 8.75h8.125v1.25H10V8.75zM10 14.375h8.125v1.25H10v-1.25z"></path></svg>
      </button>
      <button title="Link einfügen" class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" @click="addLink">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.25 10.625a.625.625 0 00-.625-.625H8.375a.625.625 0 000 1.25h3.25a.625.625 0 00.625-.625zM15.625 8.125a.625.625 0 100-1.25h-2.5a.625.625 0 100 1.25h2.5zM15 13.125H8.75a.625.625 0 100 1.25H15a.625.625 0 100-1.25zM16.25 3.75h-10a3.125 3.125 0 000 6.25H7.5v1.25H6.25a4.375 4.375 0 110-8.75h10a4.375 4.375 0 110 8.75H15v-1.25h1.25a3.125 3.125 0 100-6.25z"></path></svg>
      </button>
    </div>
    <div
      ref="editor"
      class="p-3 min-h-[100px] bg-white dark:bg-gray-800 rounded-b-lg focus:outline-none"
      contenteditable="true"
      @input="updateContent"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
  modelValue?: string,
}>();

const emit = defineEmits(['update:modelValue']);

const editor = ref<HTMLDivElement | null>(null);

function execCmd(command: string, value: string | null = null) {
  document.execCommand(command, false, value);
  editor.value?.focus();
  updateContent();
}

function addLink() {
  const url = prompt('Bitte geben Sie die URL ein:', 'https://');
  if (url) {
    execCmd('createLink', url);
  }
}

function updateContent() {
  if (editor.value) {
    emit('update:modelValue', editor.value.innerHTML);
  }
}

onMounted(() => {
  if (editor.value) {
    editor.value.innerHTML = props.modelValue || '';
  }
});

watch(() => props.modelValue, (newValue) => {
    if (editor.value && editor.value.innerHTML !== newValue) {
        editor.value.innerHTML = newValue || '';
    }
});
</script>