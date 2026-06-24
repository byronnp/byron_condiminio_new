import { useSessionStore } from '@/stores/session.store';

function buildLoginUrl() {
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const redirect = encodeURIComponent(currentUrl);
  const routerMode = import.meta.env.QUASAR_VUE_ROUTER_MODE ?? 'hash';

  if (routerMode === 'history') {
    return `/auth/login?redirect=${redirect}`;
  }

  return `/#/auth/login?redirect=${redirect}`;
}

export function handleUnauthorizedResponse(response: Response, accessToken: string | null) {
  if (response.status !== 401 || !accessToken) {
    return false;
  }

  const session = useSessionStore();
  session.signOut();

  if (typeof window !== 'undefined') {
    window.location.replace(buildLoginUrl());
  }

  return true;
}
