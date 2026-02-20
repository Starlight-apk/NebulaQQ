import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/plugins',
    name: 'Plugins',
    component: () => import('./views/Plugins.vue')
  },
  {
    path: '/modules',
    name: 'Modules',
    component: () => import('./views/Modules.vue')
  },
  {
    path: '/themes',
    name: 'Themes',
    component: () => import('./views/Themes.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./views/Settings.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
