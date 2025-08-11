<template>
  <div class="h-screen flex">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <Header />
      
      <!-- Export Content -->
      <main class="flex-1 flex">
        <!-- Left Pane: Database Objects -->
        <div class="flex-1 p-6 border-r border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold">Database Objects</h2>
            <div class="flex space-x-2">
              <button class="btn btn-secondary">Select All</button>
              <button class="btn btn-primary">Export Selected</button>
            </div>
          </div>
          
          <!-- Tables -->
          <div class="card p-4 mb-4">
            <h3 class="font-medium mb-3">Tables</h3>
            <div class="space-y-2">
              <label v-for="table in tables" :key="table.name" class="flex items-center">
                <input type="checkbox" v-model="table.selected" class="mr-3" />
                <span class="flex-1">{{ table.name }}</span>
                <span class="text-sm text-gray-500">{{ table.size }}</span>
              </label>
            </div>
          </div>
          
          <!-- Procedures -->
          <div class="card p-4 mb-4">
            <h3 class="font-medium mb-3">Procedures</h3>
            <div class="space-y-2">
              <label v-for="proc in procedures" :key="proc.name" class="flex items-center">
                <input type="checkbox" v-model="proc.selected" class="mr-3" />
                <span class="flex-1">{{ proc.name }}</span>
              </label>
            </div>
          </div>
          
          <!-- Functions -->
          <div class="card p-4 mb-4">
            <h3 class="font-medium mb-3">Functions</h3>
            <div class="space-y-2">
              <label v-for="func in functions" :key="func.name" class="flex items-center">
                <input type="checkbox" v-model="func.selected" class="mr-3" />
                <span class="flex-1">{{ func.name }}</span>
              </label>
            </div>
          </div>
          
          <!-- Triggers -->
          <div class="card p-4">
            <h3 class="font-medium mb-3">Triggers</h3>
            <div class="space-y-2">
              <label v-for="trigger in triggers" :key="trigger.name" class="flex items-center">
                <input type="checkbox" v-model="trigger.selected" class="mr-3" />
                <span class="flex-1">{{ trigger.name }}</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Resize Handle -->
        <div class="w-1 bg-gray-200 dark:bg-gray-700 cursor-col-resize hover:bg-primary-500"></div>
        
        <!-- Right Pane: SQL Preview -->
        <div class="flex-1 p-6">
          <h2 class="text-xl font-semibold mb-6">SQL Preview</h2>
          <div class="card p-4 h-full">
            <pre class="text-sm text-gray-800 dark:text-gray-200 overflow-auto h-full"><code>{{ selectedSql }}</code></pre>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'

const tables = ref([
  { name: 'users', size: '1.2KB', selected: false },
  { name: 'products', size: '3.4KB', selected: false },
  { name: 'orders', size: '2.1KB', selected: false },
  { name: 'categories', size: '0.8KB', selected: false }
])

const procedures = ref([
  { name: 'get_user_by_id', selected: false },
  { name: 'create_order', selected: false },
  { name: 'update_product', selected: false }
])

const functions = ref([
  { name: 'calculate_total', selected: false },
  { name: 'format_date', selected: false }
])

const triggers = ref([
  { name: 'update_timestamp', selected: false },
  { name: 'audit_log', selected: false }
])

const selectedSql = computed(() => {
  const selected = [
    ...tables.value.filter(t => t.selected),
    ...procedures.value.filter(p => p.selected),
    ...functions.value.filter(f => f.selected),
    ...triggers.value.filter(tr => tr.selected)
  ]
  
  if (selected.length === 0) {
    return '-- Select objects to preview SQL'
  }
  
  return `-- Export SQL for selected objects
-- Generated at ${new Date().toLocaleString()}

${selected.map(item => `-- ${item.name}`).join('\n')}`
})
</script>
