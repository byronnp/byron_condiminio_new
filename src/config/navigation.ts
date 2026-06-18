export type NavigationItem = {
  label: string;
  icon?: string;
  to?: string;
  trailingIcon?: string;
};

export interface NavigationSection {
  key: string;
  label: string;
  items: NavigationItem[];
}

function normalizeMenuKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const defaultNavigationSections: NavigationSection[] = [
  {
    key: 'principal',
    label: 'PRINCIPAL',
    items: [
      { label: 'Resumen general', icon: 'home', to: '/dashboard' },
      { label: 'Condominios', icon: 'apartment', to: '/condominios' },
      {
        label: 'Administradores',
        icon: 'manage_accounts',
        to: '/administradores',
      },
      { label: 'Unidades', icon: 'domain', to: '/unidades' },
      { label: 'Propietarios', icon: 'groups', to: '/propietarios' },
      { label: 'Residentes', icon: 'badge', to: '/residentes' },
      { label: 'Pagos y cobros', icon: 'paid', to: '/pagos' },
      { label: 'Reservas', icon: 'event_available', to: '/reservas' },
      { label: 'Mantenimientos', icon: 'handyman', to: '/mantenimiento' },
      { label: 'Comunicados', icon: 'campaign', to: '/comunicados' },
      { label: 'Visitantes', icon: 'badge', to: '/visitantes' },
    ],
  },
  {
    key: 'herramientas',
    label: 'HERRAMIENTAS',
    items: [
      { label: 'Reportes', icon: 'summarize', to: '/reportes' },
      {
        label: 'Configuración',
        icon: 'settings',
        to: '/configuracion',
        trailingIcon: 'chevron_right',
      },
    ],
  },
];

const navigationPathByKey: Record<string, string> = {
  'resumen-general': '/dashboard',
  condominios: '/condominios',
  administradores: '/administradores',
  unidades: '/unidades',
  propietarios: '/propietarios',
  residentes: '/residentes',
  'pagos-y-cobros': '/pagos',
  reservas: '/reservas',
  mantenimientos: '/mantenimiento',
  comunicados: '/comunicados',
  visitantes: '/visitantes',
  reportes: '/reportes',
  configuracion: '/configuracion',
};

export function resolveNavigationPath(item: { label: string; to?: string | null }) {
  if (typeof item.to === 'string' && item.to.trim()) {
    return item.to;
  }

  const normalizedLabel = normalizeMenuKey(item.label);
  return navigationPathByKey[normalizedLabel] ?? null;
}
