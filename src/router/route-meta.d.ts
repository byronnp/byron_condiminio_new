import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    subtitle?: string;
    requiresCondoContext?: boolean;
  }
}
