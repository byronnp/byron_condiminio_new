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
        alias: '/login',
        name: 'login',
        component: () => import('@/pages/auth/LoginPage.vue'),
        meta: { public: true },
      },
    ],
  },
  {
    path: '/activar-acceso',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'activate-access',
        component: () => import('@/pages/auth/ActivateAccessPage.vue'),
        meta: { public: true },
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
          subtitle: 'GestiÃ³n general de condominios',
        },
      },
      {
        path: 'condominios/nuevo',
        name: 'condominios-nuevo',
        component: () => import('@/pages/condominios/NuevoCondominioPage.vue'),
        meta: {
          title: 'Nuevo condominio',
          subtitle: 'Registro y configuraciÃ³n inicial del condominio',
        },
      },
      {
        path: 'condominios/:id/editar',
        name: 'condominios-editar',
        component: () => import('@/pages/condominios/EditarCondominioPage.vue'),
        meta: {
          title: 'Editar condominio',
          subtitle: 'ActualizaciÃ³n de informaciÃ³n del condominio',
        },
      },
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('@/pages/usuarios/UsuariosPage.vue'),
        meta: {
          title: 'Usuarios',
          subtitle: 'Administración unificada de usuarios del sistema',
        },
      },
      {
        path: 'usuarios/nuevo',
        name: 'usuarios-nuevo',
        component: () => import('@/pages/usuarios/NuevoUsuarioPage.vue'),
        meta: {
          title: 'Nuevo usuario',
          subtitle: 'Registro, rol, permisos y alcance',
        },
      },
      {
        path: 'usuarios/:id/editar',
        name: 'usuarios-editar',
        component: () => import('@/pages/usuarios/EditarUsuarioPage.vue'),
        meta: {
          title: 'Editar usuario',
          subtitle: 'Actualización de información, rol y permisos',
        },
      },
      {
        path: 'administradores',
        name: 'administradores',
        component: () => import('@/pages/administradores/AdministradoresPage.vue'),
        meta: {
          title: 'Administradores',
          subtitle: 'Gestión de administradores senior y de condominios',
        },
      },
      {
        path: 'administradores/nuevo',
        name: 'administradores-nuevo',
        component: () => import('@/pages/administradores/NuevoAdministradorPage.vue'),
        meta: {
          title: 'Nuevo administrador',
          subtitle: 'Registro, alcance e invitación de acceso',
        },
      },
      {
        path: 'administradores/:id/editar',
        name: 'administradores-editar',
        component: () => import('@/pages/administradores/EditarAdministradorPage.vue'),
        meta: {
          title: 'Editar administrador',
          subtitle: 'Actualización de información y alcance',
        },
      },
      {
        path: 'unidades',
        name: 'unidades',
        component: () => import('@/pages/unidades/UnidadesPage.vue'),
        meta: {
          title: 'Unidades',
          subtitle: 'GestiÃ³n de unidades',
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
          subtitle: 'AdministraciÃ³n de propietarios',
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
          subtitle: 'Pagos, deudas y recaudaciÃ³n',
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
          subtitle: 'Ã“rdenes y seguimiento',
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
          subtitle: 'Indicadores y mÃ©tricas',
          requiresCondoContext: true,
        },
      },
      {
        path: 'configuracion',
        name: 'configuracion',
        component: () => import('@/pages/configuracion/ConfiguracionPage.vue'),
        meta: {
          title: 'ConfiguraciÃ³n',
          subtitle: 'ParÃ¡metros del sistema',
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

