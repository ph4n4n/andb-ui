import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import SplashScreen from '@/views/SplashScreen.vue'

const routes = [
  {
    path: '/splash',
    name: 'Splash',
    component: SplashScreen
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/schema',
    name: 'Schema',
    component: () => import('@/views/Schema.vue')
  },
  {
    path: '/compare',
    name: 'Compare',
    component: () => import('@/views/Compare.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue')
  },
  {
    path: '/project-settings',
    name: 'ProjectSettings',
    component: () => import('@/views/ProjectSettings.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History.vue')
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/Projects.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
