<template>
  <div class="h-screen flex">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <Header />
      
      <!-- Compare Content -->
      <main class="flex-1 flex">
        <!-- Left Pane: Source -->
        <div class="flex-1 p-6 border-r border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold mb-6">Source (DEV1)</h2>
          
          <!-- Tables -->
          <div class="card p-4 mb-4">
            <h3 class="font-medium mb-3">Tables</h3>
            <div class="space-y-2">
              <div v-for="table in sourceTables" :key="table.name" class="flex items-center">
                <span class="flex-1">{{ table.name }}</span>
                <span :class="getStatusClass(table.status)">{{ getStatusIcon(table.status) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Procedures -->
          <div class="card p-4 mb-4">
            <h3 class="font-medium mb-3">Procedures</h3>
            <div class="space-y-2">
              <div v-for="proc in sourceProcedures" :key="proc.name" class="flex items-center">
                <span class="flex-1">{{ proc.name }}</span>
                <span :class="getStatusClass(proc.status)">{{ getStatusIcon(proc.status) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Functions -->
          <div class="card p-4">
            <h3 class="font-medium mb-3">Functions</h3>
            <div class="space-y-2">
              <div v-for="func in sourceFunctions" :key="func.name" class="flex items-center">
                <span class="flex-1">{{ func.name }}</span>
                <span :class="getStatusClass(func.status)">{{ getStatusIcon(func.status) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Resize Handle -->
        <div class="w-1 bg-gray-200 dark:bg-gray-700 cursor-col-resize hover:bg-primary-500"></div>
        
        <!-- Right Pane: Destination -->
        <div class="flex-1 p-6">
          <h2 class="text-xl font-semibold mb-6">Destination (STAGE)</h2>
          
          <!-- Tables -->
          <div class="card p-4 mb-4">
            <h3 class="font-medium mb-3">Tables</h3>
            <div class="space-y-2">
              <div v-for="table in destTables" :key="table.name" class="flex items-center">
                <span class="flex-1">{{ table.name }}</span>
                <span :class="getStatusClass(table.status)">{{ getStatusIcon(table.status) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Procedures -->
          <div class="card p-4 mb-4">
            <h3 class="font-medium mb-3">Procedures</h3>
            <div class="space-y-2">
              <div v-for="proc in destProcedures" :key="proc.name" class="flex items-center">
                <span class="flex-1">{{ proc.name }}</span>
                <span :class="getStatusClass(proc.status)">{{ getStatusIcon(proc.status) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Functions -->
          <div class="card p-4">
            <h3 class="font-medium mb-3">Functions</h3>
            <div class="space-y-2">
              <div v-for="func in destFunctions" :key="func.name" class="flex items-center">
                <span class="flex-1">{{ func.name }}</span>
                <span :class="getStatusClass(func.status)">{{ getStatusIcon(func.status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <!-- Legend -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div class="flex items-center space-x-4 text-sm">
          <span class="flex items-center">
            <span class="text-green-600 mr-1">✅</span> Same
          </span>
          <span class="flex items-center">
            <span class="text-yellow-600 mr-1">⚠️</span> Different
          </span>
          <span class="flex items-center">
            <span class="text-red-600 mr-1">❌</span> Missing
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'

const sourceTables = ref([
  { name: 'users', status: 'same' },
  { name: 'products', status: 'different' },
  { name: 'orders', status: 'same' },
  { name: 'categories', status: 'same' }
])

const sourceProcedures = ref([
  { name: 'get_user_by_id', status: 'same' },
  { name: 'create_order', status: 'same' },
  { name: 'update_product', status: 'missing' }
])

const sourceFunctions = ref([
  { name: 'calculate_total', status: 'same' },
  { name: 'format_date', status: 'same' }
])

const destTables = ref([
  { name: 'users', status: 'same' },
  { name: 'products', status: 'different' },
  { name: 'orders', status: 'missing' },
  { name: 'categories', status: 'same' }
])

const destProcedures = ref([
  { name: 'get_user_by_id', status: 'same' },
  { name: 'create_order', status: 'different' },
  { name: 'update_product', status: 'same' }
])

const destFunctions = ref([
  { name: 'calculate_total', status: 'same' },
  { name: 'format_date', status: 'missing' }
])

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'same': return '✅'
    case 'different': return '⚠️'
    case 'missing': return '❌'
    default: return '❓'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'same': return 'text-green-600'
    case 'different': return 'text-yellow-600'
    case 'missing': return 'text-red-600'
    default: return 'text-gray-400'
  }
}
</script>
