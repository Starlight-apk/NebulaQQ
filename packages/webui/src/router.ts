import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('./components/Dashboard.vue')
  },
  {
    path: '/plugins',
    name: 'Plugins',
    component: () => import('./components/Plugins.vue')
  },
  {
    path: '/modules',
    name: 'Modules',
    component: () => import('./components/Modules.vue')
  },
  {
    path: '/themes',
    name: 'Themes',
    component: () => import('./components/Themes.vue')
  },
  {
    path: '/console',
    name: 'Console',
    component: () => import('./components/Console.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./components/Settings.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
