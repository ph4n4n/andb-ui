<template>
  <MainLayout>
     <!-- Always use GlobalSchemaView for consistent exploration -->
     <GlobalSchemaView />
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import GlobalSchemaView from '@/views/GlobalSchemaView.vue'
</script>
