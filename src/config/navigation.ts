import type { UserRole } from '@/stores/session.store';

export type NavigationItem = {
  label: string;
  icon: string;
  to?: string;
  trailingIcon?: string;
  roles?: UserRole[];
};

export const primaryNavigation: NavigationItem[] = [
  { label: 'Resumen general', icon: 'home', to: '/dashboard' },
  { label: 'Condominios', icon: 'apartment', to: '/condominios', roles: ['senior'] },
  { label: 'Administradores', icon: 'manage_accounts', to: '/administradores', roles: ['senior'] },
  { label: 'Unidades', icon: 'domain', to: '/unidades' },
  { label: 'Propietarios', icon: 'groups', to: '/propietarios' },
  { label: 'Residentes', icon: 'badge', to: '/residentes' },
  { label: 'Pagos y cobros', icon: 'paid', to: '/pagos' },
  { label: 'Reservas', icon: 'event_available', to: '/reservas' },
  { label: 'Mantenimientos', icon: 'handyman', to: '/mantenimiento' },
  { label: 'Comunicados', icon: 'campaign', to: '/comunicados' },
  { label: 'Visitantes', icon: 'badge', to: '/visitantes' },
];

export const toolNavigation: NavigationItem[] = [
  { label: 'Reportes', icon: 'summarize', to: '/reportes' },
  { label: 'Configuración', icon: 'settings', to: '/configuracion', trailingIcon: 'chevron_right' },
];

export function filterNavigationByRole(items: NavigationItem[], role: UserRole | null) {
  return items.filter((item) => !item.roles || (role !== null && item.roles.includes(role)));
}
