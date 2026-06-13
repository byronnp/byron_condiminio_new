<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      dark
      :width="292"
      class="main-layout__drawer text-white"
      :content-style="drawerContentStyle"
    >
      <div class="drawer-brand">
        <div class="drawer-brand__logo">
          <q-icon name="apartment" size="26px" />
        </div>
        <div class="drawer-brand__copy">
          <div class="drawer-brand__title">CondoAdmin</div>
          <div class="drawer-brand__subtitle">Plataforma Multi-Condominio</div>
        </div>
      </div>

      <q-scroll-area class="drawer-scroll">
        <div class="drawer-section">
          <div class="drawer-section__label">PRINCIPAL</div>
          <q-list class="drawer-nav">
            <q-item
              v-for="item in visiblePrimaryNavigation"
              :key="item.label"
              :to="item.to"
              clickable
              exact
              active-class="drawer-nav__item--active"
              class="drawer-nav__item"
              @click="handleNavClick"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="18px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div class="drawer-section">
          <div class="drawer-section__label">HERRAMIENTAS</div>
          <q-list class="drawer-nav">
            <q-item
              v-for="item in visibleToolNavigation"
              :key="item.label"
              :to="item.to"
              :clickable="Boolean(item.to)"
              exact
              active-class="drawer-nav__item--active"
              class="drawer-nav__item"
              :class="{ 'drawer-nav__item--static': !item.to }"
              @click="handleToolClick(item)"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="18px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="item.trailingIcon">
                <q-icon :name="item.trailingIcon" size="16px" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-scroll-area>

      <q-card class="drawer-plan" flat>
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

        <q-chip square class="toolbar-chip">
          <q-icon name="apartment" size="16px" class="q-mr-xs" />
          {{ session.contextLabel }}
        </q-chip>

        <q-select
          v-if="session.isSenior"
          v-model="condoSelectValue"
          :options="condoOptions"
          option-label="name"
          option-value="id"
          emit-value
          map-options
          dense
          outlined
          bg-color="white"
          label="Condominio"
          class="toolbar-condo-select"
        >
          <template #selected>
            <div class="toolbar-condo-select__selected">
              <span class="toolbar-condo-select__label">Condominio</span>
              <span class="toolbar-condo-select__value">{{ activeCondominiumName }}</span>
            </div>
          </template>
        </q-select>

        <q-chip v-else square class="toolbar-chip toolbar-chip--solid">
          <q-icon name="pin_drop" size="16px" class="q-mr-xs" />
          {{ activeCondominiumName }}
        </q-chip>

        <q-btn flat round dense icon="notifications_none" class="toolbar-action">
          <q-badge color="negative" floating rounded>3</q-badge>
        </q-btn>

        <q-btn flat round dense icon="account_circle" class="toolbar-action">
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 240px">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ session.user?.name }}</q-item-label>
                  <q-item-label caption>
                    {{ session.isSenior ? 'Administrador senior' : 'Administrador de condominio' }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="handleSignOut">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container class="main-layout__container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { filterNavigationByRole, primaryNavigation, toolNavigation, type NavigationItem } from '@/config/navigation';
import { condoCatalogOptions, useSessionStore } from '@/stores/session.store';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const leftDrawerOpen = ref(false);
const drawerContentStyle = {
  background: 'linear-gradient(180deg, #07162d 0%, #0b1e3b 42%, #071225 100%)',
  color: '#fff',
};

const visiblePrimaryNavigation = computed(() =>
  filterNavigationByRole(primaryNavigation, session.role),
);

const visibleToolNavigation = computed(() => filterNavigationByRole(toolNavigation, session.role));

const pageTitle = computed(() => {
  const title = route.meta.title;
  return typeof title === 'string' ? title : 'Resumen general';
});

const pageSubtitle = computed(() => {
  const subtitle = route.meta.subtitle;
  return typeof subtitle === 'string' ? subtitle : 'Vista consolidada del sistema';
});

const condoOptions = computed(() =>
  session.isSenior
    ? [{ id: '__global__', name: 'Vista global', city: 'Todos', units: 0, active: true }, ...condoCatalogOptions]
    : condoCatalogOptions,
);

const condoSelectValue = computed<string>({
  get: () =>
    session.isSenior && session.activeCondoId === null ? '__global__' : session.activeCondoId ?? '__global__',
  set: (value) => {
    if (value === '__global__') {
      session.activeCondoId = null;
      return;
    }

    session.setActiveCondo(value);
  },
});

const activeCondominiumName = computed(() => {
  if (session.isSenior && session.activeCondoId === null) {
    return 'Vista global';
  }

  return session.activeCondominium?.name ?? 'Sin condominio';
});

const planTitle = computed(() => (session.isSenior ? 'Plan Enterprise' : 'Plan Condominio'));
const planSubtitle = computed(() =>
  session.isSenior ? 'Condominios activos' : session.activeCondominium?.name ?? 'Condominio asignado',
);
const planMetric = computed(() =>
  session.isSenior ? `${session.allowedCondominiums.length} / ${condoCatalogOptions.length}` : '1 / 1',
);
const planProgress = computed(() =>
  session.isSenior
    ? Math.min(1, session.allowedCondominiums.length / Math.max(condoCatalogOptions.length, 1))
    : 1,
);
const planProgressLabel = computed(() =>
  session.isSenior ? 'Acceso global' : 'Acceso restringido al condominio asignado',
);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function handleNavClick() {
  if ($q.screen.lt.md) {
    leftDrawerOpen.value = false;
  }
}

function handleToolClick(item: NavigationItem) {
  if (item.to && $q.screen.lt.md) {
    leftDrawerOpen.value = false;
  }
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

.drawer-brand {
  align-items: center;
  display: flex;
  gap: 12px;
  padding: 12px 12px 16px;
}

.drawer-brand__logo {
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #fff;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.drawer-brand__copy {
  min-width: 0;
}

.drawer-brand__title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.drawer-brand__subtitle {
  color: rgba(226, 232, 240, 0.72);
  font-size: 12px;
  margin-top: 2px;
}

.drawer-scroll {
  height: calc(100vh - 314px);
}

.drawer-section {
  margin-top: 6px;
}

.drawer-section__label {
  color: rgba(148, 163, 184, 0.9);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 18px 10px 10px;
}

.drawer-nav {
  display: grid;
  gap: 6px;
  padding: 0 4px;
}

.drawer-nav__item {
  border-radius: 14px;
  color: rgba(226, 232, 240, 0.84);
  min-height: 46px;
  padding: 0 12px;
}

.drawer-nav__item :deep(.q-item__section--avatar) {
  min-width: 32px;
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
  margin-top: 14px;
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
  font-size: 14px;
  font-weight: 800;
}

.drawer-plan__subtitle {
  color: rgba(226, 232, 240, 0.7);
  font-size: 12px;
  margin-top: 2px;
}

.drawer-plan__body {
  display: grid;
  gap: 12px;
  padding-top: 4px;
}

.drawer-plan__metric {
  color: #fff;
  font-size: 18px;
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
  min-height: 84px;
  padding: 0 24px;
}

.main-toolbar__menu {
  color: var(--app-text);
}

.toolbar-title__greeting {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.toolbar-title__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 2px;
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

.toolbar-condo-select {
  width: 260px;
}

.toolbar-condo-select :deep(.q-field__control) {
  border-radius: 999px;
}

.toolbar-condo-select__selected {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.toolbar-condo-select__label {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.toolbar-condo-select__value {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  margin-top: 2px;
}

.toolbar-action {
  color: var(--app-text);
}

@media (max-width: 1023px) {
  .main-toolbar {
    padding: 0 14px;
  }
}

@media (max-width: 767px) {
  .toolbar-condo-select {
    display: none;
  }
}
</style>
