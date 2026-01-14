<template>
  <teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" 
          @click="close"
        ></div>

        <!-- Modal Content -->
        <Transition name="scale">
          <div 
            v-if="isOpen"
            class="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
            @click.stop
          >
            <!-- Background Gradient Decorations -->
            <div class="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-primary-600 to-indigo-700 opacity-10 dark:opacity-20"></div>
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div class="absolute -top-24 -left-24 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <!-- Content Container -->
            <div class="relative z-10 px-10 py-12 flex flex-col items-center">
              
              <!-- Logo Section -->
              <div class="relative mb-8 group">
                <div class="absolute inset-0 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div class="relative bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg ring-1 ring-gray-100 dark:ring-gray-700">
                  <img 
                    src="/icon.png" 
                    alt="Andb Logo" 
                    class="w-24 h-24 rounded-xl object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              <!-- Title & Tagline -->
              <h2 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Andb</h2>
              <p class="text-lg text-primary-600 dark:text-primary-400 font-medium mb-10 text-center px-4 leading-relaxed">
                {{ $t('about.subtitle') }}
              </p>

              <!-- Info Grid (Bento Style) -->
              <div class="w-full grid grid-cols-2 gap-6 mb-10">
                <!-- Version Card -->
                <div class="col-span-1 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                  <span class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">{{ $t('about.version') }}</span>
                  <div class="flex items-center space-x-2">
                    <Tag class="w-4 h-4 text-primary-500 group-hover:rotate-12 transition-transform" />
                    <span class="text-lg font-bold text-gray-800 dark:text-gray-100 font-mono">{{ version }}</span>
                  </div>
                </div>

                <!-- Author Card -->
                <div class="col-span-1 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                  <span class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">{{ $t('about.author') }}</span>
                  <div class="flex items-center space-x-2">
                    <User class="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                    <span class="text-lg font-bold text-gray-800 dark:text-gray-100">{{ author }}</span>
                  </div>
                </div>

                <!-- Links Card (Full Width) -->
                <div class="col-span-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-around group">
                  <a href="https://github.com/The-Andb/andb" target="_blank" class="flex flex-col items-center space-y-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Github class="w-5 h-5" />
                    <span class="text-xs font-semibold">{{ $t('about.github') }}</span>
                  </a>
                  <div class="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                  <a href="https://github.com/The-Andb/andb/issues" target="_blank" class="flex flex-col items-center space-y-1 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <Bug class="w-5 h-5" />
                    <span class="text-xs font-semibold">{{ $t('about.issue') }}</span>
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div class="text-center space-y-2 mb-8">
                <p class="text-xs text-gray-400 dark:text-gray-500">
                  {{ $t('about.builtWith') }}
                </p>
                <p class="text-[10px] text-gray-300 dark:text-gray-600">
                   {{ license }} License &copy; 2024 {{ author }}
                </p>
              </div>

               <!-- Close Button -->
               <button 
                @click="close"
                class="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transform active:scale-[0.98] transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {{ $t('about.close') }}
              </button>

            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </teleport>
</template>

<script setup lang="ts">
import { Github, Bug, Tag, User } from 'lucide-vue-next'

// App metadata (Could be imported from package.json in a real setup, hardcoded for safety here)
const version = __APP_VERSION__
const author = 'The Andb'
const license = 'GPL-3.0'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}
</style>

