import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/export',
    name: 'Export',
    component: () => import('@/views/Export.vue')
  },
  {
    path: '/compare',
    name: 'Compare',
    component: () => import('@/views/Compare.vue')
  },
  {
    path: '/migrate',
    name: 'Migrate',
    component: () => import('@/views/Migrate.vue')
  },
  {
    path: '/scripts',
    name: 'Scripts',
    component: () => import('@/views/Scripts.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
