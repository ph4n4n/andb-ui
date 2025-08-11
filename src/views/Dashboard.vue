<template>
  <div class="h-screen flex">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <Header />
      
      <!-- Dashboard Content -->
      <main class="flex-1 p-6">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Dashboard
          </h1>
          
          <!-- Connection Pairs Overview -->
          <div class="card p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Connection Pairs</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="text-left py-3 px-4 font-medium">Source</th>
                    <th class="text-left py-3 px-4 font-medium">Target</th>
                    <th class="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-100 dark:border-gray-800">
                    <td class="py-3 px-4">DEV1</td>
                    <td class="py-3 px-4">STAGE</td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Connected
                      </span>
                    </td>
                  </tr>
                  <tr class="border-b border-gray-100 dark:border-gray-800">
                    <td class="py-3 px-4">DEV2</td>
                    <td class="py-3 px-4">PROD</td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⚠️ Testing
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Recent Operations -->
          <div class="card p-6">
            <h2 class="text-xl font-semibold mb-4">Recent Operations</h2>
            <div class="space-y-3">
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-700 dark:text-gray-300">Export tables from DEV1</span>
                <span class="text-sm text-gray-500">2 min ago</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-700 dark:text-gray-300">Compare DEV1 ↔ STAGE</span>
                <span class="text-sm text-gray-500">5 min ago</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-700 dark:text-gray-300">Migration STAGE → PROD</span>
                <span class="text-sm text-gray-500">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
</script>
