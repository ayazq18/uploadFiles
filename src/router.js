import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/UserLogin.vue';
import Home from './components/HomeView.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Home,
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
