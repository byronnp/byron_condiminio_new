<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      dark
      :width="292"
      :mini="isDrawerMini"
      :mini-width="82"
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

        <q-btn v-if="canSwitchCondominiumContext" flat no-caps class="toolbar-condo-switcher">
          <div class="toolbar-condo-switcher__content">
            <span class="toolbar-condo-switcher__eyebrow">Contexto</span>
            <span class="toolbar-condo-switcher__name">{{ activeCondominiumName }}</span>
            <span class="toolbar-condo-switcher__meta">
              {{ activeCondominiumMeta }}
            </span>
          </div>
          <q-icon name="expand_more" size="18px" class="toolbar-condo-switcher__chevron" />

          <q-menu anchor="bottom right" self="top right" class="toolbar-condo-menu">
            <q-card flat bordered class="toolbar-condo-menu__card">
              <q-card-section class="toolbar-condo-menu__header">
                <div class="toolbar-condo-menu__eyebrow">Contexto de trabajo</div>
                <div class="toolbar-condo-menu__title">Cambiar condominio</div>
                <div class="toolbar-condo-menu__subtitle">
                  Selecciona el condominio activo para esta sesión.
                </div>
              </q-card-section>

              <q-separator />

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
                      {{ condo.city }} · {{ condo.units }} unidades
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

        <q-btn
          flat
          round
          dense
          icon="more_vert"
          aria-label="Más opciones"
          class="toolbar-more"
        >
          <q-menu anchor="bottom right" self="top right" class="toolbar-more-menu">
            <q-list class="toolbar-more-menu__list">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ session.user?.name }}</q-item-label>
                  <q-item-label caption>
                    {{ session.isSenior ? 'Administrador senior' : 'Administrador de condominio' }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="notifications_none" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Notificaciones</q-item-label>
                  <q-item-label caption>3 pendientes</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="negative" rounded>3</q-badge>
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
      <router-view v-slot="{ Component, route }">
        <transition name="page-fade-slide" mode="out-in" appear>
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '@/stores/session.store';
import { useAuthMenu } from '@/composables/auth/useAuthMenu';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const { loadAuthMenu } = useAuthMenu();
const leftDrawerOpen = ref(true);
const drawerMini = ref(false);
const drawerContentStyle = {
  background: 'linear-gradient(180deg, #07162d 0%, #0b1e3b 42%, #071225 100%)',
  color: '#fff',
};

const visibleMenuSections = computed(() => session.menuSections);
const isDrawerMini = computed(() => drawerMini.value && !$q.screen.lt.md);
const canSwitchCondominiumContext = computed(
  () => session.isSenior || session.condoOptions.length > 1,
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

  return `${active.city ?? 'Sin ciudad'} · ${active.units ?? 0} unidades`;
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

onMounted(() => {
  void loadAuthMenu(session.accessToken);
});

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
  return typeof item.to === 'string' && route.path === item.to;
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
  padding: 12px 12px 16px;
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

.main-layout__drawer--mini .drawer-scroll {
  height: calc(100vh - 94px);
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

.main-layout__drawer--mini .drawer-nav {
  justify-items: center;
  padding: 0;
}

.drawer-nav__item {
  border-radius: 14px;
  color: rgba(226, 232, 240, 0.84);
  min-height: 46px;
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
  min-height: 72px;
  padding: 0 24px;
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

.toolbar-condo-switcher {
  align-items: center;
  background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.04);
  color: var(--app-text);
  display: inline-flex;
  gap: 12px;
  min-height: 48px;
  padding: 7px 11px 7px 13px;
  text-align: left;
  width: 268px;
}

.toolbar-condo-switcher :deep(.q-btn__content) {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  width: 100%;
}

.toolbar-condo-switcher__content {
  display: grid;
  min-width: 0;
}

.toolbar-condo-switcher__eyebrow {
  color: var(--app-text-muted);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.1;
  text-transform: uppercase;
}

.toolbar-condo-switcher__name {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.15;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-condo-switcher__meta {
  color: var(--app-text-muted);
  font-size: 10px;
  line-height: 1.2;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.toolbar-condo-menu__header {
  display: grid;
  gap: 3px;
  padding-bottom: 12px;
  padding-top: 12px;
}

.toolbar-condo-menu__eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.toolbar-condo-menu__title {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.toolbar-condo-menu__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.4;
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
  width: 38px;
}

.toolbar-more {
  color: var(--app-text);
  display: none;
  height: 38px;
  width: 38px;
}

.toolbar-more-menu__list {
  min-width: 250px;
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
    gap: 10px;
    padding: 0 14px;
  }

  .toolbar-title {
    flex: 1 1 160px;
  }

  .toolbar-condo-switcher {
    width: 230px;
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

  .toolbar-title__greeting {
    font-size: 15px;
    line-height: 1.15;
  }

  .toolbar-title__subtitle {
    display: none;
  }

  .toolbar-condo-switcher {
    border-color: rgba(37, 99, 235, 0.14);
    border-radius: 13px;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
    flex: 1 0 100%;
    min-height: 46px;
    order: 5;
    padding: 7px 10px 7px 12px;
    width: 100%;
  }

  .toolbar-condo-switcher :deep(.q-btn__content) {
    gap: 8px;
  }

  .toolbar-condo-switcher__eyebrow {
    font-size: 8px;
    letter-spacing: 0.06em;
  }

  .toolbar-condo-switcher__name {
    font-size: 12px;
    line-height: 1.2;
  }

  .toolbar-condo-switcher__meta {
    font-size: 9px;
    max-width: calc(100vw - 68px);
  }

  .toolbar-chip {
    border-radius: 13px;
    flex: 1 0 100%;
    justify-content: flex-start;
    min-height: 42px;
    order: 5;
  }

  .toolbar-action {
    display: none;
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
}

@media (max-width: 420px) {
  .main-toolbar {
    min-height: 102px;
  }

  .toolbar-title__greeting {
    font-size: 14px;
  }

  .toolbar-condo-switcher__meta {
    display: none;
  }
}
</style>
