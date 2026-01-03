<template>
  <div class="flex-1 flex flex-col overflow-hidden relative group">
    <div class="absolute inset-0 flex overflow-auto custom-scrollbar bg-gray-50 dark:bg-gray-900/50 text-sm font-mono">
      <!-- Line Numbers -->
      <div v-if="showLineNumbers" class="flex-none py-4 px-2 text-right text-gray-400 dark:text-gray-600 select-none bg-gray-100/50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 min-w-[3rem]">
        <div v-for="n in lineCount" :key="n" class="leading-6">{{ n }}</div>
      </div>
      
      <!-- Code -->
      <pre class="flex-1 py-4 px-4 syntax-highlighter bg-transparent text-gray-800 dark:text-gray-200 !mt-0 !bg-transparent" :style="{ fontSize: fontSize + 'px', fontFamily: fontFamily }"><code v-html="highlightedContent" class="block leading-6"></code></pre>
    </div>
    
    <!-- Copy Button (Overlay) -->
    <div class="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        @click="copyToClipboard"
        class="p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-all shadow-sm border border-white/5"
        title="Copy to Clipboard"
      >
        <Copy v-if="!copied" class="w-4 h-4" />
        <Check v-else class="w-4 h-4 text-green-400" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-sql'
import { Copy, Check } from 'lucide-vue-next'

const props = defineProps({
  content: {
    type: String,
    required: true,
    default: ''
  },
  fontSize: {
    type: Number,
    default: 12
  },
  fontFamily: {
    type: String,
    default: "'JetBrains Mono', monospace"
  },
  showLineNumbers: {
    type: Boolean,
    default: true
  }
})

const copied = ref(false)

const copyToClipboard = () => {
  if (!props.content) return
  navigator.clipboard.writeText(props.content)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const lineCount = computed(() => {
  if (!props.content) return 0
  return props.content.split('\n').length
})

const highlightedContent = computed(() => {
  if (!props.content) return ''
  
  // 1. Basic Highlight with Prism
  let html = Prism.highlight(props.content, Prism.languages.sql, 'sql')

  // 2. Custom Post-processing for "Rainbow" brackets and distinct punctuation
  // Handle Parentheses
  html = html.replace(
    /<span class="token punctuation">(\()<\/span>/g, 
    '<span class="token punctuation paren-open text-yellow-500 dark:text-yellow-400 font-bold">(</span>'
  )
  html = html.replace(
    /<span class="token punctuation">(\))<\/span>/g, 
    '<span class="token punctuation paren-close text-yellow-500 dark:text-yellow-400 font-bold">)</span>'
  )

  // Handle Commas
  html = html.replace(
    /<span class="token punctuation">(,)<\/span>/g, 
    '<span class="token punctuation comma text-gray-500 dark:text-gray-100 font-bold">,</span>'
  )

  // Handle Semicolons
  html = html.replace(
    /<span class="token punctuation">(;)<\/span>/g, 
    '<span class="token punctuation semicolon text-red-500 dark:text-pink-400 font-bold">;</span>'
  )
  
  return html
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>

<style>
/* Syntax Highlighting Styles (Scoped or Global if needed) */
/* Re-using the styles defined in Schema.vue but ensuring they apply here */
.syntax-highlighter .token.keyword { color: #0000FF; font-weight: bold; }
.syntax-highlighter .token.string { color: #A31515; }
.syntax-highlighter .token.comment { color: #008000; font-style: italic; }
.syntax-highlighter .token.function { color: #795E26; }
.syntax-highlighter .token.number { color: #098658; }
.syntax-highlighter .token.operator { color: #000000; }
.syntax-highlighter .token.punctuation { color: #000000; }

html.dark .syntax-highlighter .token.keyword { color: #569cd6 !important; }
html.dark .syntax-highlighter .token.string { color: #ce9178 !important; }
html.dark .syntax-highlighter .token.comment { color: #6a9955 !important; }
html.dark .syntax-highlighter .token.function { color: #dcdcaa !important; }
html.dark .syntax-highlighter .token.number { color: #b5cea8 !important; }
html.dark .syntax-highlighter .token.operator,
html.dark .syntax-highlighter .token.punctuation { color: #d4d4d4 !important; }
</style>
