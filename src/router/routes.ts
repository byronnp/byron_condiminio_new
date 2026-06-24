import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/auth/login',
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/auth/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/DashboardPage.vue'),
        meta: { title: 'Resumen general', subtitle: 'Vista consolidada del sistema' },
      },
      {
        path: 'condominios',
        name: 'condominios',
        component: () => import('@/pages/condominios/CondominiosPage.vue'),
        meta: {
          title: 'Condominios',
          subtitle: 'Gestión general de condominios',
        },
      },
      {
        path: 'condominios/nuevo',
        name: 'condominios-nuevo',
        component: () => import('@/pages/condominios/NuevoCondominioPage.vue'),
        meta: {
          title: 'Nuevo condominio',
          subtitle: 'Registro y configuración inicial del condominio',
        },
      },
      {
        path: 'condominios/:id/editar',
        name: 'condominios-editar',
        component: () => import('@/pages/condominios/EditarCondominioPage.vue'),
        meta: {
          title: 'Editar condominio',
          subtitle: 'Actualización de información del condominio',
        },
      },
      {
        path: 'administradores',
        name: 'administradores',
        component: () => import('@/pages/administradores/AdministradoresPage.vue'),
        meta: {
          title: 'Administradores',
          subtitle: 'Administración de usuarios senior',
        },
      },
      {
        path: 'administradores/nuevo',
        name: 'administradores-nuevo',
        component: () => import('@/pages/administradores/NuevoAdministradorPage.vue'),
        meta: {
          title: 'Nuevo administrador',
          subtitle: 'Registro y permisos de acceso',
        },
      },
      {
        path: 'unidades',
        name: 'unidades',
        component: () => import('@/pages/unidades/UnidadesPage.vue'),
        meta: {
          title: 'Unidades',
          subtitle: 'Gestión de unidades',
          requiresCondoContext: true,
        },
      },
      {
        path: 'unidades/nueva',
        name: 'unidades-nueva',
        component: () => import('@/pages/unidades/NuevaUnidadPage.vue'),
        meta: {
          title: 'Nueva unidad',
          subtitle: 'Registro de una nueva unidad',
          requiresCondoContext: true,
        },
      },
      {
        path: 'propietarios',
        name: 'propietarios',
        component: () => import('@/pages/propietarios/PropietariosPage.vue'),
        meta: {
          title: 'Propietarios',
          subtitle: 'Administración de propietarios',
          requiresCondoContext: true,
        },
      },
      {
        path: 'residentes',
        name: 'residentes',
        component: () => import('@/pages/residentes/ResidentesPage.vue'),
        meta: {
          title: 'Residentes',
          subtitle: 'Control de residentes',
          requiresCondoContext: true,
        },
      },
      {
        path: 'pagos',
        name: 'pagos',
        component: () => import('@/pages/pagos/PagosPage.vue'),
        meta: {
          title: 'Pagos y cobros',
          subtitle: 'Pagos, deudas y recaudación',
          requiresCondoContext: true,
        },
      },
      {
        path: 'reservas',
        name: 'reservas',
        component: () => import('@/pages/reservas/ReservasPage.vue'),
        meta: {
          title: 'Reservas',
          subtitle: 'Agenda y disponibilidad',
          requiresCondoContext: true,
        },
      },
      {
        path: 'mantenimiento',
        name: 'mantenimiento',
        component: () => import('@/pages/mantenimiento/MantenimientoPage.vue'),
        meta: {
          title: 'Mantenimientos',
          subtitle: 'Órdenes y seguimiento',
          requiresCondoContext: true,
        },
      },
      {
        path: 'comunicados',
        name: 'comunicados',
        component: () => import('@/pages/comunicados/ComunicadosPage.vue'),
        meta: {
          title: 'Comunicados',
          subtitle: 'Avisos y notificaciones',
          requiresCondoContext: true,
        },
      },
      {
        path: 'visitantes',
        name: 'visitantes',
        component: () => import('@/pages/visitantes/VisitantesPage.vue'),
        meta: {
          title: 'Visitantes',
          subtitle: 'Control de accesos',
          requiresCondoContext: true,
        },
      },
      {
        path: 'reportes',
        name: 'reportes',
        component: () => import('@/pages/reportes/ReportesPage.vue'),
        meta: {
          title: 'Reportes',
          subtitle: 'Indicadores y métricas',
          requiresCondoContext: true,
        },
      },
      {
        path: 'configuracion',
        name: 'configuracion',
        component: () => import('@/pages/configuracion/ConfiguracionPage.vue'),
        meta: {
          title: 'Configuración',
          subtitle: 'Parámetros del sistema',
          requiresCondoContext: true,
        },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
