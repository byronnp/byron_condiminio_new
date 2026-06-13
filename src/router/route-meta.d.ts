import 'vue-router';

import type { UserRole } from '@/stores/session.store';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    subtitle?: string;
    roles?: UserRole[];
    requiresCondoContext?: boolean;
  }
}
