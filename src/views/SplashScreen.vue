<template>
  <div class="fixed inset-0 bg-primary-900 flex items-center justify-center z-50">
    <div class="text-center">
      <!-- Logo -->
      <div class="mb-8 animate-pulse-slow">
        <img 
          src="/icon.png" 
          alt="ANDB Logo" 
          class="w-32 h-32 mx-auto"
        />
      </div>

      <!-- App Name -->
      <h1 class="text-5xl font-bold text-white mb-2 tracking-tight">
        Andb
      </h1>
      <p class="text-xl text-primary-100 mb-8 font-light">
        The Simplest Database Migration Tool
      </p>

      <!-- Loading Bar -->
      <div class="w-64 h-1.5 bg-primary-800 rounded-full mx-auto mb-8 overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-primary-400 to-white rounded-full transition-all duration-300 animate-loading"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <!-- Status Text -->
      <p class="text-sm text-primary-200 mb-12 animate-fade-in">
        {{ statusText }}
      </p>

      <!-- Version & Copyright -->
      <div class="absolute bottom-8 left-0 right-0 text-center space-y-2">
        <p class="text-xs text-primary-300">
          Version {{ version }}
        </p>
        <p class="text-xs text-primary-400">
          © 2024 {{ author }} | Licensed under {{ license }}
        </p>
        <p class="text-xs text-primary-400">
          Built with ❤️ for backend developers
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// App metadata from package.json
const version = '1.0.0'
const author = 'ph4n4n'
const license = 'MIT'

// Loading state
const progress = ref(0)
const statusText = ref('Initializing application...')

const statusMessages = [
  'Initializing application...',
  'Loading database drivers...',
  'Checking connections...',
  'Preparing workspace...',
  'Ready to migrate!'
]

onMounted(() => {
  // Simulate loading progress
  let currentStep = 0
  const interval = setInterval(() => {
    progress.value += 20
    
    if (currentStep < statusMessages.length) {
      statusText.value = statusMessages[currentStep]
      currentStep++
    }

    if (progress.value >= 100) {
      clearInterval(interval)
      // Navigate to main app after splash
      setTimeout(() => {
        router.push('/')
      }, 500)
    }
  }, 400)
})
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

.animate-loading {
  animation: loading 1.5s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.5s ease-in;
}
</style>

