<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      dark
      :width="280"
      :mini="isDrawerMini"
      :mini-width="76"
      class="main-layout__drawer text-white"
      :class="{ 'main-layout__drawer--mini': isDrawerMini }"
      :content-style="drawerContentStyle"
    >
      <div class="drawer-brand">
        <div class="drawer-brand__logo">
          <q-icon name="apartment" size="26px" />
        </div>
        <div v-if="!isDrawerMini" class="drawer-brand__copy">
          <div class="drawer-brand__title">CondoAdmin</div>
          <div class="drawer-brand__subtitle">Plataforma Multi-Condominio</div>
        </div>
      </div>

      <q-scroll-area class="drawer-scroll">
        <div v-for="section in visibleMenuSections" :key="section.key" class="drawer-section">
          <div v-if="!isDrawerMini" class="drawer-section__label">{{ section.label }}</div>
          <q-list class="drawer-nav">
            <q-item
              v-for="item in section.items"
              :key="item.label"
              :clickable="Boolean(item.to)"
              :active="isMenuItemActive(item)"
              active-class="drawer-nav__item--active"
              class="drawer-nav__item"
              :class="{ 'drawer-nav__item--static': !item.to }"
              @click="handleMenuItemClick(item)"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon ?? 'chevron_right'" size="18px" />
              </q-item-section>
              <q-item-section v-if="!isDrawerMini">
                <q-item-label>{{ item.label }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="item.trailingIcon && !isDrawerMini">
                <q-icon :name="item.trailingIcon" size="16px" />
              </q-item-section>
              <q-tooltip v-if="isDrawerMini" anchor="center right" self="center left">
                {{ item.label }}
              </q-tooltip>
            </q-item>
          </q-list>
        </div>
      </q-scroll-area>

      <q-card v-if="!isDrawerMini" class="drawer-plan" flat>
        <q-card-section class="drawer-plan__header">
          <div class="drawer-plan__icon">
            <q-icon name="workspace_premium" size="18px" />
          </div>
          <div class="drawer-plan__copy">
            <div class="drawer-plan__title">{{ planTitle }}</div>
            <div class="drawer-plan__subtitle">{{ planSubtitle }}</div>
          </div>
        </q-card-section>

        <q-card-section class="drawer-plan__body">
          <div class="drawer-plan__metric">{{ planMetric }}</div>
          <q-linear-progress
            :value="planProgress"
            rounded
            color="primary"
            track-color="rgba(255,255,255,0.12)"
          />
          <div class="drawer-plan__footer">
            <span>{{ planProgressLabel }}</span>
            <q-btn flat no-caps dense label="Ver detalles del plan" class="drawer-plan__link" />
          </div>
        </q-card-section>
      </q-card>
    </q-drawer>

    <q-header class="main-layout__header">
      <q-toolbar class="main-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Abrir menú"
          class="main-toolbar__menu"
          @click="toggleLeftDrawer"
        />

        <div class="toolbar-title">
          <div class="toolbar-title__greeting">{{ pageTitle }}</div>
          <div class="toolbar-title__subtitle">
            {{ pageSubtitle }}
          </div>
        </div>

        <q-space />

        <div class="toolbar-actions">
          <q-btn
            v-if="canSwitchCondominiumContext"
            flat
            no-caps
            class="toolbar-condo-switcher"
          >
            <div class="toolbar-condo-switcher__content">
              <q-avatar size="28px" class="toolbar-condo-switcher__avatar">
                <q-icon name="pin_drop" size="15px" />
              </q-avatar>
              <span class="toolbar-condo-switcher__name">{{ activeCondominiumName }}</span>
            </div>
            <q-icon name="expand_more" size="18px" class="toolbar-condo-switcher__chevron" />
            <q-tooltip class="toolbar-condo-switcher__tooltip">
              {{ activeCondominiumMeta }}
            </q-tooltip>

            <q-menu anchor="bottom right" self="top right" class="toolbar-condo-menu">
              <q-card flat bordered class="toolbar-condo-menu__card">
                <q-list class="toolbar-condo-menu__list">
                  <q-item
                    clickable
                    v-close-popup
                    :active="session.activeCondoId === null"
                    active-class="toolbar-condo-menu__item--active"
                    class="toolbar-condo-menu__item"
                    @click="setActiveCondoContext('__global__')"
                  >
                    <q-item-section avatar>
                      <q-avatar size="32px" class="toolbar-condo-menu__avatar">
                        <q-icon name="public" size="16px" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="toolbar-condo-menu__name">Vista global</q-item-label>
                      <q-item-label caption>Todos los condominios</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon
                        v-if="session.activeCondoId === null"
                        name="check"
                        size="16px"
                        color="primary"
                      />
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-for="condo in session.condoOptions"
                    :key="condo.id"
                    clickable
                    v-close-popup
                    :active="session.activeCondoId === condo.id"
                    active-class="toolbar-condo-menu__item--active"
                    class="toolbar-condo-menu__item"
                    @click="setActiveCondoContext(condo.id)"
                  >
                    <q-item-section avatar>
                      <q-avatar
                        size="32px"
                        class="toolbar-condo-menu__avatar toolbar-condo-menu__avatar--condo"
                      >
                        <q-icon name="apartment" size="16px" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="toolbar-condo-menu__name">{{ condo.name }}</q-item-label>
                      <q-item-label caption>
                        {{ condominiumOptionMeta(condo) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon
                        v-if="session.activeCondoId === condo.id"
                        name="check"
                        size="16px"
                        color="primary"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </q-menu>
          </q-btn>

          <q-chip v-else square class="toolbar-chip toolbar-chip--solid">
            <q-icon name="pin_drop" size="16px" class="q-mr-xs" />
            {{ activeCondominiumName }}
          </q-chip>

          <q-btn flat round dense class="toolbar-user" aria-label="Abrir menú de usuario">
            <q-avatar size="34px" class="toolbar-user__avatar">
              <span>{{ userInitials }}</span>
            </q-avatar>

            <q-menu
              anchor="bottom right"
              self="top right"
              class="toolbar-user-menu"
              content-class="toolbar-user-menu__popup"
            >
              <q-card flat bordered class="toolbar-user-menu__card">
                <q-card-section class="toolbar-user-menu__header">
                  <q-avatar size="44px" class="toolbar-user-menu__avatar">
                    <span>{{ userInitials }}</span>
                  </q-avatar>
                  <div class="toolbar-user-menu__copy">
                    <div class="toolbar-user-menu__name">{{ userDisplayName }}</div>
                    <div class="toolbar-user-menu__role">{{ userRoleLabel }}</div>
                    <div class="toolbar-user-menu__email">{{ session.user?.email }}</div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-list class="toolbar-user-menu__list">
                  <q-item
                    clickable
                    v-close-popup
                    @click="handleSignOut"
                    class="toolbar-user-menu__item"
                  >
                    <q-item-section avatar>
                      <q-icon name="logout" color="negative" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="toolbar-user-menu__logout">Cerrar sesión</q-item-label>
                      <q-item-label caption>Cerrar la sesión activa</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </q-menu>
          </q-btn>

          <q-btn
            flat
            round
            dense
            icon="notifications_none"
            aria-label="Notificaciones"
            class="toolbar-action toolbar-action--notifications"
          >
            <q-badge color="negative" floating rounded>3</q-badge>
          </q-btn>

          <q-btn flat round dense icon="more_vert" aria-label="Más opciones" class="toolbar-more">
            <q-menu
              anchor="bottom right"
              self="top right"
              class="toolbar-more-menu"
              content-class="toolbar-more-menu__popup"
            >
              <q-list class="toolbar-more-menu__list">
                <q-item clickable v-close-popup>
                  <q-item-section avatar>
                    <q-icon name="help_outline" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Ayuda</q-item-label>
                    <q-item-label caption>Documentación y soporte</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container class="main-layout__container">
      <router-view v-slot="{ Component, route }">
        <transition name="page-fade-slide" mode="out-in" appear>
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '@/stores/session.store';
import { useAuthMenu } from '@/composables/auth/useAuthMenu';
import {
  fetchCondominiumOptions,
  type CondominiumOptionItem,
} from '@/services/condominiums.service';
const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const { loadAuthMenu } = useAuthMenu();
const leftDrawerOpen = ref(true);
const drawerMini = ref(false);
const isLoadingCondominiums = ref(false);
const condominiumsLoadError = ref('');
const drawerContentStyle = {
  background: 'linear-gradient(180deg, #07162d 0%, #0b1e3b 42%, #071225 100%)',
  color: '#fff',
};

const visibleMenuSections = computed(() => session.menuSections);
const isDrawerMini = computed(() => drawerMini.value && !$q.screen.lt.md);
const canSwitchCondominiumContext = computed(
  () => session.isSenior && session.condoOptions.length > 0,
);

const pageTitle = computed(() => {
  const title = route.meta.title;
  return typeof title === 'string' ? title : 'Resumen general';
});

const pageSubtitle = computed(() => {
  const subtitle = route.meta.subtitle;
  return typeof subtitle === 'string' ? subtitle : 'Vista consolidada del sistema';
});

const activeCondominiumName = computed(() => {
  if (canSwitchCondominiumContext.value) {
    return session.activeCondoId === null
      ? 'Vista global'
      : (session.activeCondominium?.name ?? 'Vista global');
  }

  return session.activeCondominium?.name ?? 'Sin condominio';
});

const activeCondominiumMeta = computed(() => {
  if (
    canSwitchCondominiumContext.value &&
    (session.activeCondoId === null || !session.activeCondominium)
  ) {
    return `${session.condoOptions.length} condominios disponibles`;
  }

  const active = session.activeCondominium;
  if (!active) {
    return 'Sin detalle disponible';
  }

  return condominiumOptionMeta(active);
});

const planTitle = computed(() => (session.isSenior ? 'Plan Enterprise' : 'Plan Condominio'));
const planSubtitle = computed(() =>
  session.isSenior
    ? 'Condominios activos'
    : (session.activeCondominium?.name ?? 'Condominio asignado'),
);
const planMetric = computed(() =>
  session.isSenior
    ? `${session.allowedCondominiums.length} / ${session.condoOptions.length}`
    : '1 / 1',
);
const planProgress = computed(() =>
  session.isSenior
    ? Math.min(1, session.allowedCondominiums.length / Math.max(session.condoOptions.length, 1))
    : 1,
);
const planProgressLabel = computed(() =>
  session.isSenior ? 'Acceso global' : 'Acceso restringido al condominio asignado',
);
const userDisplayName = computed(() => session.user?.name ?? 'Usuario');
const userRoleLabel = computed(() =>
  session.isSenior ? 'Administrador senior' : 'Administrador de condominio',
);
const userInitials = computed(() => {
  const name = userDisplayName.value.trim();
  if (!name) {
    return 'U';
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
});

function mapCondominiumOption(condominium: CondominiumOptionItem) {
  return {
    id: String(condominium.id),
    name: condominium.name,
    city: '',
    units: 0,
    active: true,
  };
}

function condominiumOptionMeta(condominium: { city: string; units: number }) {
  if (condominium.city && condominium.units > 0) {
    return `${condominium.city} · ${condominium.units} unidades`;
  }

  if (condominium.city) {
    return condominium.city;
  }

  if (condominium.units > 0) {
    return `${condominium.units} unidades`;
  }

  return 'Condominio disponible';
}

onMounted(() => {
  void loadAuthMenu(session.accessToken);
  window.addEventListener('condominiums:changed', handleCondominiumsChanged);
});

onBeforeUnmount(() => {
  window.removeEventListener('condominiums:changed', handleCondominiumsChanged);
});

watch(
  () => session.accessToken,
  (token) => {
    if (token) {
      void loadCondominiumOptions();
    }
  },
  { immediate: true },
);

async function loadCondominiumOptions() {
  if (!session.accessToken) {
    return;
  }

  isLoadingCondominiums.value = true;
  condominiumsLoadError.value = '';

  try {
    const condominiums = await fetchCondominiumOptions(session.accessToken);
    session.setAvailableCondominiums(condominiums.map(mapCondominiumOption));
  } catch (error) {
    condominiumsLoadError.value = error instanceof Error ? error.message : 'Intenta nuevamente.';
  } finally {
    isLoadingCondominiums.value = false;
  }
}

function handleCondominiumsChanged() {
  void loadCondominiumOptions();
}

function toggleLeftDrawer() {
  if ($q.screen.lt.md) {
    leftDrawerOpen.value = !leftDrawerOpen.value;
    return;
  }

  drawerMini.value = !drawerMini.value;
}

function handleMenuItemClick(item: { to?: string }) {
  if (!item.to) {
    return;
  }
  const target = item.to.trim();
  if (target.startsWith('http://') || target.startsWith('https://')) {
    window.location.href = target;
  } else if (target.startsWith('#/')) {
    void router.push(target.slice(1));
  } else if (target.startsWith('/')) {
    void router.push(target);
  } else if (router.hasRoute(target)) {
    void router.push({ name: target });
  } else {
    void router.push(`/${target}`);
  }

  if ($q.screen.lt.md) {
    leftDrawerOpen.value = false;
  }
}

function isMenuItemActive(item: { to?: string }) {
  if (typeof item.to !== 'string') {
    return false;
  }

  const targetPath = normalizeRoutePath(item.to);
  const currentPath = normalizeRoutePath(route.path);

  if (!targetPath || !currentPath) {
    return false;
  }

  if (currentPath === targetPath) {
    return true;
  }

  return currentPath.startsWith(`${targetPath}/`);
}

function normalizeRoutePath(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (!trimmed.startsWith('/')) {
    return `/${trimmed.replace(/^\/+/, '')}`;
  }

  return trimmed.replace(/\/+$/, '') || '/';
}

function setActiveCondoContext(value: string) {
  if (value === '__global__') {
    session.activeCondoId = null;
    return;
  }

  session.setActiveCondo(value);
}

function handleSignOut() {
  session.signOut();
  void router.push('/auth/login');
}
</script>

<style scoped>
.main-layout {
  background: transparent;
}

.main-layout__drawer {
  background: linear-gradient(180deg, #07162d 0%, #0b1e3b 42%, #071225 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  color: #fff;
  padding: 18px 14px 14px;
}

.main-layout__drawer--mini {
  padding-inline: 10px;
}

.drawer-brand {
  align-items: center;
  display: flex;
  gap: 12px;
  padding: 8px 10px 12px;
}

.main-layout__drawer--mini .drawer-brand {
  justify-content: center;
  padding-inline: 0;
}

.drawer-brand__logo {
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #fff;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.drawer-brand__copy {
  min-width: 0;
}

.drawer-brand__title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.drawer-brand__subtitle {
  color: rgba(226, 232, 240, 0.72);
  font-size: 11px;
  margin-top: 2px;
}

.drawer-scroll {
  height: calc(100vh - 268px);
}

.main-layout__drawer--mini .drawer-scroll {
  height: calc(100vh - 94px);
}

.drawer-section {
  margin-top: 6px;
}

.drawer-section__label {
  color: rgba(148, 163, 184, 0.9);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 12px 10px 6px;
}

.drawer-nav {
  display: grid;
  gap: 3px;
  padding: 0 4px;
}

.main-layout__drawer--mini .drawer-nav {
  justify-items: center;
  padding: 0;
}

.drawer-nav__item {
  border-radius: 14px;
  color: rgba(226, 232, 240, 0.84);
  min-height: 40px;
  padding: 0 12px;
}

.main-layout__drawer--mini .drawer-nav__item {
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0;
  width: 44px;
}

.drawer-nav__item :deep(.q-item__section--avatar) {
  min-width: 32px;
}

.main-layout__drawer--mini .drawer-nav__item :deep(.q-item__section--avatar) {
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding-right: 0;
}

.drawer-nav__item :deep(.q-item__section) {
  font-weight: 600;
}

.drawer-nav__item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.drawer-nav__item--active {
  background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.24);
}

.drawer-nav__item--static {
  cursor: default;
}

.drawer-plan {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  color: #fff;
  margin-top: 10px;
  overflow: hidden;
}

.drawer-plan__header {
  align-items: center;
  display: flex;
  gap: 12px;
  padding-bottom: 8px;
}

.drawer-plan__icon {
  align-items: center;
  background: rgba(168, 85, 247, 0.22);
  border-radius: 14px;
  color: #d8b4fe;
  display: inline-flex;
  flex: 0 0 38px;
  height: 38px;
  justify-content: center;
}

.drawer-plan__copy {
  min-width: 0;
}

.drawer-plan__title {
  font-size: 13px;
  font-weight: 800;
}

.drawer-plan__subtitle {
  color: rgba(226, 232, 240, 0.7);
  font-size: 11px;
  margin-top: 2px;
}

.drawer-plan__body {
  display: grid;
  gap: 12px;
  padding-top: 4px;
}

.drawer-plan__metric {
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.drawer-plan__footer {
  align-items: center;
  color: rgba(226, 232, 240, 0.75);
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
}

.drawer-plan__link {
  color: #93c5fd;
  padding: 0;
}

.main-layout__header {
  background: rgba(246, 248, 251, 0.88);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(14px);
  color: var(--app-text);
}

.main-toolbar {
  gap: 12px;
  min-height: 68px;
  padding: 0 18px;
}

.toolbar-actions {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  min-width: 0;
}

.main-toolbar__menu {
  color: var(--app-text);
  height: 38px;
  width: 38px;
}

.toolbar-title {
  min-width: 0;
}

.toolbar-title__greeting {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-title__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.3;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-chip {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  color: var(--app-text);
  font-weight: 600;
}

.toolbar-chip--solid {
  background: var(--app-primary-soft);
  border-color: transparent;
}

.toolbar-user {
  align-items: center;
  background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);
  color: var(--app-text);
  display: inline-flex;
  height: 38px;
  order: 10;
  justify-content: center;
  min-height: 38px;
  overflow: hidden;
  padding: 2px;
  text-align: left;
  width: 38px;
}

.toolbar-user :deep(.q-btn__content) {
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
}

.toolbar-user__avatar {
  background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.toolbar-user-menu__card {
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  border: 0;
  min-width: 270px;
  overflow: hidden;
}

.toolbar-user-menu__popup {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
}

.toolbar-user-menu__header {
  align-items: center;
  display: flex;
  gap: 12px;
  padding: 16px 18px;
}

.toolbar-user-menu__avatar {
  background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 800;
}

.toolbar-user-menu__copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.toolbar-user-menu__name {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

.toolbar-user-menu__role {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.toolbar-user-menu__email {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-user-menu__list {
  padding: 8px;
}

.toolbar-user-menu__item {
  border-radius: 12px;
  min-height: 50px;
}

.toolbar-user-menu__logout {
  color: var(--app-text);
  font-weight: 800;
}

.toolbar-condo-switcher {
  align-items: center;
  background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.04);
  color: var(--app-text);
  display: inline-flex;
  gap: 8px;
  min-height: 40px;
  padding: 6px 10px;
  text-align: left;
  width: 184px;
}

.toolbar-condo-switcher :deep(.q-btn__content) {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  width: 100%;
}

.toolbar-condo-switcher__content {
  align-items: center;
  display: flex;
  gap: 8px;
  min-width: 0;
}

.toolbar-condo-switcher__eyebrow {
  display: none;
}

.toolbar-condo-switcher__avatar {
  background: rgba(37, 99, 235, 0.08);
  color: var(--app-primary);
  flex-shrink: 0;
}

.toolbar-condo-switcher__name {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-condo-switcher__meta {
  display: none;
}

.toolbar-condo-switcher__chevron {
  color: var(--app-text-muted);
  flex-shrink: 0;
}

.toolbar-condo-menu__card {
  border-radius: 16px;
  min-width: 320px;
  overflow: hidden;
}

.toolbar-condo-menu__list {
  display: grid;
  gap: 4px;
  padding: 8px;
}

.toolbar-condo-menu__item {
  border-radius: 12px;
  min-height: 54px;
}

.toolbar-condo-menu__item--active {
  background: rgba(37, 99, 235, 0.08);
}

.toolbar-condo-menu__state {
  border-radius: 12px;
  min-height: 62px;
}

.toolbar-condo-menu__state--error {
  background: rgba(239, 68, 68, 0.05);
}

.toolbar-condo-menu__avatar {
  background: rgba(37, 99, 235, 0.08);
  color: var(--app-primary);
}

.toolbar-condo-menu__avatar--condo {
  background: rgba(15, 23, 42, 0.06);
}

.toolbar-action {
  color: var(--app-text);
  height: 38px;
  order: 8;
  width: 38px;
}

.toolbar-action--notifications {
  position: relative;
  order: 7;
}

.toolbar-more {
  color: var(--app-text);
  display: none;
  height: 38px;
  order: 9;
  width: 38px;
}

.toolbar-more-menu__list {
  min-width: 250px;
}

.toolbar-more-menu__popup {
  border-radius: 22px;
  overflow: hidden;
}

.page-fade-slide-enter-active,
.page-fade-slide-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.page-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1023px) {
  .main-toolbar {
    gap: 8px;
    padding: 0 14px;
  }

  .toolbar-title {
    flex: 1 1 160px;
  }

  .toolbar-user {
    width: 38px;
    order: 10;
  }

  .toolbar-condo-switcher {
    width: 176px;
  }
}

@media (max-width: 767px) {
  .main-layout__header {
    background: rgba(248, 250, 252, 0.96);
  }

  .main-toolbar {
    align-content: center;
    flex-wrap: wrap;
    gap: 7px;
    min-height: 106px;
    padding: 8px 10px 10px;
  }

  .main-toolbar :deep(.q-space) {
    display: none;
  }

  .main-toolbar__menu {
    background: #fff;
    border: 1px solid rgba(15, 23, 42, 0.07);
    order: 1;
    flex: 0 0 36px;
    height: 36px;
    width: 36px;
  }

  .toolbar-title {
    flex: 1 1 calc(100% - 122px);
    min-width: 0;
    order: 2;
  }

  .toolbar-actions {
    flex: 1 0 100%;
    justify-content: flex-end;
    order: 4;
    width: 100%;
  }

  .toolbar-title__greeting {
    font-size: 15px;
    line-height: 1.15;
  }

  .toolbar-user {
    min-height: 38px;
    order: 10;
    padding: 2px;
    width: 38px;
  }

  .toolbar-title__subtitle {
    display: none;
  }

  .toolbar-condo-switcher {
    border-color: rgba(37, 99, 235, 0.14);
    border-radius: 13px;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
    flex: 0 1 auto;
    min-height: 44px;
    order: 5;
    padding: 7px 10px;
    width: min(100%, 220px);
  }

  .toolbar-condo-switcher :deep(.q-btn__content) {
    gap: 8px;
  }

  .toolbar-condo-switcher__name {
    font-size: 12px;
    line-height: 1.2;
  }

  .toolbar-chip {
    border-radius: 13px;
    flex: 1 0 100%;
    justify-content: flex-start;
    min-height: 42px;
    order: 5;
  }

  .toolbar-action {
    background: #fff;
    border: 1px solid rgba(15, 23, 42, 0.07);
    display: inline-flex;
    flex: 0 0 36px;
    height: 36px;
    order: 3;
    width: 36px;
  }

  .toolbar-action--notifications {
    order: 3;
  }

  .toolbar-more {
    background: #fff;
    border: 1px solid rgba(15, 23, 42, 0.07);
    display: inline-flex;
    flex: 0 0 36px;
    height: 36px;
    order: 3;
    width: 36px;
  }

  .toolbar-condo-menu__card {
    min-width: min(320px, calc(100vw - 24px));
  }

  .toolbar-more-menu__list {
    min-width: min(270px, calc(100vw - 24px));
  }

  .toolbar-more-menu__popup {
    border-radius: 22px;
  }
}

@media (max-width: 420px) {
  .main-toolbar {
    min-height: 102px;
  }

  .toolbar-title__greeting {
    font-size: 14px;
  }
}
</style>
