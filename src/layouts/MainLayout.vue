<template>
  <div class="h-screen flex">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <Header />
      
      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>

