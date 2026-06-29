const publicRoutes = new Set(['/activar-acceso', '/login', '/auth/login']);

function buildHashUrl(pathname: string, search: string) {
  const normalizedPath = pathname === '/login' ? '/auth/login' : pathname;
  return `/#${normalizedPath}${search}`;
}

if (typeof window !== 'undefined' && !window.location.hash && publicRoutes.has(window.location.pathname)) {
  const target = buildHashUrl(window.location.pathname, window.location.search);
  window.location.replace(target);
}
