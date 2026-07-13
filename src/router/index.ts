import { defineRouter } from '#q-app';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';
import { useSessionStore } from '@/stores/session.store';

export default defineRouter(() => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  Router.beforeEach((to) => {
    const session = useSessionStore();
    const isPublicRoute = Boolean(to.matched.some((record) => record.meta.public));
    const isLoginRoute = to.name === 'login';
    const isAuthenticated = session.isAuthenticated;

    if (isAuthenticated && isLoginRoute) {
      return { name: 'dashboard' };
    }

    if (!isAuthenticated && !isPublicRoute) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }

    if (to.meta.requiresSeniorAccess && !session.isSenior) {
      return { name: 'dashboard', query: { forbidden: 'condominios' } };
    }

    if (to.meta.requiresCondoContext && !session.activeCondominium) {
      const fallbackCondo = session.allowedCondominiums[0];

      if (fallbackCondo) {
        session.setActiveCondo(fallbackCondo.id);
      } else {
        return { name: 'dashboard' };
      }
    }

    return true;
  });

  return Router;
});
